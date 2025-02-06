const muhammara = require('muhammara');
const _ = require('lodash');
const PDFInterpreter = require('./pdf-interpreter');
const WinAnsiEncoding = require('./encoding/win-ansi-encoding');
const MacExpertEncoding = require('./encoding/mac-expert-encoding');
const MacRomanEncoding = require('./encoding/mac-roman-encoding');
const StandardEncoding = require('./encoding/standard-encoding');
const SymbolEncoding = require('./encoding/symbol-encoding');
const AdobeGlyphList = require('./encoding/adobe-glyph-list');
const StandardFontsDimensions = require('./standard-fonts-dimensions');

function besToUnicodes(inArray) {
    let i=0;
    let unicodes = [];

    while(i<inArray.length) {
        let newOne = beToNum(inArray,i,i+2);
        if(0xD800 <= newOne && newOne <= 0xDBFF) {
            // pfff. high surrogate. need to read another one
            i+=2;
            let lowSurrogate =  beToNum(inArray,i,i+2);
            unicodes.push(0x10000 + ((newOne - 0xD800) << 10) + (lowSurrogate - 0xDC00));
        }
        else {
            unicodes.push(newOne);
        }
        i+=2;
    }
    
    return unicodes;
}

function beToNum(inArray,start,end) {
    let result = 0;
    start = start || 0;
    if(end === undefined) {
        end = inArray.length;
    }

    for(let i=start;i<end;++i) {
        result = result*256 + inArray[i];
    }
    return result;
}

const getEndBFRange = (startCode, endCode, map, unicode, isPDFObjectArray) => {
    const mapUpdated = map;
    let unicodesUp = unicode;
    for(let j = startCode;j<=endCode;++j) {
        if (isPDFObjectArray) {
            mapUpdated[j] = besToUnicodes(unicodeArray.queryObject(j).toBytesArray());
        } else {
            mapUpdated[j] = unicodesUp.slice();
            // increment last unicode value
            ++unicodesUp[unicodesUp.length-1];
        }
    }
    return isPDFObjectArray ? mapUpdated : { mapUpdated, unicodesUp};
}

function parseToUnicode(pdfReader,toUnicodeObjectId) {
    let map = {};
    // yessss! to unicode map. we can read it rather nicely
    // with the interpreter class looking only for endbfrange and endbfchar as "operands"
    const interpreter = new PDFInterpreter();
    const stream = pdfReader.parseNewObject(toUnicodeObjectId).toPDFStream();
    if(!stream)
        return null;

    interpreter.interpretStream(pdfReader,stream, (operatorName,operands)=> {
        if(operatorName === 'endbfchar') {

            // Operators are pairs. always of the form <codeByte> <unicodes>
            for(let i=0;i<operands.length;i+=2) {
                const byteCode = operands[i].toBytesArray();
                const unicodes = operands[i+1].toBytesArray();
                map[beToNum(byteCode)] = besToUnicodes(unicodes);
            }
        }
        else if(operatorName === 'endbfrange') {
            
            // Operators are 3. two codesBytes and then either a unicode start range or array of unicodes
            for(let i=0;i<operands.length;i+=3) {
                const startCode = beToNum(operands[i].toBytesArray());
                const endCode = beToNum(operands[i+1].toBytesArray());
                
                if(operands[i+2].getType() === muhammara.ePDFObjectArray) {
                    const unicodeArray = operands[i+2].toPDFArray();
                    // specific codes
                    map = getEndBFRange(startCode, endCode, map, unicodeArray, true);
                }
                else {
                    let unicodesNew =  besToUnicodes(operands[i+2].toBytesArray());
                    const {mapUpdated, unicodesUp} = getEndBFRange(startCode, endCode, map, unicodesNew, false);
                    map = mapUpdated;
                    unicodesNew = unicodesUp;
                }
            }            
        }
    });

    return map;
}



function getStandardEncodingMap(encodingName) {
    // MacRomanEncoding, MacExpertEncoding, or WinAnsiEncoding
    if(encodingName === 'WinAnsiEncoding') {
        return WinAnsiEncoding;
    }

    if(encodingName === 'MacExpertEncoding')
        return MacExpertEncoding;

    if(encodingName === 'MacRomanEncoding')
        return MacRomanEncoding;

    return null; 
}

function getFontDescriptorForDifferencesEncodingMap(font, pdfReader) {
    return font.exists('FontDescriptor') ? pdfReader.queryDictionaryObject(font,'FontDescriptor').toPDFDictionary():null
}

function setupDifferencesEncodingMap(pdfReader,font, encodingDict) {
    // k. got ourselves differences array. let's see.
    let newEncoding = null;
    if(encodingDict.exists('BaseEncoding')) {
        let baseEncoding = getStandardEncodingMap(pdfReader.queryDictionaryObject(encodingDict,'BaseEncoding').value);
        if(baseEncoding) {
            newEncoding = _.extend({},baseEncoding);
        }
    }

    if(!newEncoding) {
        // no base encoding. use standard or symbol. i'm gonna use either standard encoding or symbol encoding.
        // i know the right thing is to check first the font native encoding...but that's too much of a hassle
        // so i'll take the shortcut and if it is ever a problem - improve
        let fontDescriptor = getFontDescriptorForDifferencesEncodingMap(font, pdfReader);
        if(fontDescriptor) {
            // check font descriptor to determine whether this is a symbolic font. if so, use symbol encoding. otherwise - standard
            let flags = pdfReader.queryDictionaryObject(fontDescriptor,'Flags').value;
            if(flags & (1<<2)) {
                newEncoding = _.extend({},SymbolEncoding);
            }
            else {
                newEncoding = _.extend({},StandardEncoding);
            }
        }
        else {
            // assume standard
            newEncoding = _.extend({},StandardEncoding);
        }
    }

    // now apply differences
    if(encodingDict.exists('Differences')) {
        let differences = pdfReader.queryDictionaryObject(encodingDict,('Differences')).toPDFArray().toJSArray();
        let i=0;
        while(i<differences.length) {
            // first item is always a number
            let firstIndex = differences[i].value;            
            ++i;
            // now come names, one for each index
            while(i<differences.length && differences[i].getType() === muhammara.ePDFObjectName) {
                newEncoding[firstIndex] = differences[i].value;
                ++i;
                ++firstIndex;
            }
        }
    }

    return newEncoding;
}

function parseSimpleFontEncoding(self,pdfReader,font, encoding) {
    if(encoding.getType() === muhammara.ePDFObjectName) {
        self.fromSimpleEncodingMap = getStandardEncodingMap(encoding.value);
        self.hasSimpleEncoding = true;
    }
    else if(encoding.getType() === muhammara.ePDFObjectIndirectObjectReference || encoding.getType() === muhammara.ePDFObjectDictionary) {
        // make sure we have a dict here
        encoding = (encoding.getType() === muhammara.ePDFObjectIndirectObjectReference) ? pdfReader.parseNewObject(encoding.toPDFIndirectObjectReference().getObjectID()):encoding;
        // now figure it out
        self.fromSimpleEncodingMap = setupDifferencesEncodingMap(pdfReader,font, encoding);
        self.hasSimpleEncoding = true;
    }
}

function parseSimpleFontDimensions(self,pdfReader,font) {
    // read specified widths
    if(font.exists('FirstChar') && font.exists('LastChar') && font.exists('Widths')) {
        let firstChar = pdfReader.queryDictionaryObject(font,'FirstChar').value;
        let lastChar = pdfReader.queryDictionaryObject(font,'LastChar').value;
        let widths = pdfReader.queryDictionaryObject(font,'Widths').toPDFArray();

        // store widths for specified glyphs
        self.widths = {};
        for(let i = firstChar; i<=lastChar && (i-firstChar) < widths.getLength();++i) {
            self.widths[i] = pdfReader.queryArrayObject(widths,i-firstChar).value;
        }
    }
    else {
        // wtf. probably one of the standard fonts. aha! [will also take care of ascent descent]
        if(font.exists('BaseFont')) {
            let name = pdfReader.queryDictionaryObject(font,'BaseFont').value;
            let standardDimensions = StandardFontsDimensions[name] || StandardFontsDimensions[name.replace(/-/g,'−')]; // seriously...WTF
            if(standardDimensions) {
                self.descent = standardDimensions.descent;
                self.ascent = standardDimensions.ascent;
                self.widths = _.extend({},standardDimensions.widths);
            }
        }
    }
    

    if(!font.exists('FontDescriptor'))
        return;

    // complete info with font descriptor
    let fontDescriptor = pdfReader.queryDictionaryObject(font,'FontDescriptor');
    self.descent = pdfReader.queryDictionaryObject(fontDescriptor,'Descent').value;
    self.ascent = pdfReader.queryDictionaryObject(fontDescriptor,'Ascent').value;
    self.defaultWidth = fontDescriptor.exists('MissingWidth') ? pdfReader.queryDictionaryObject(fontDescriptor,'MissingWidth').value:0;
}

function getDefaultWidthForParseCIDFontDimensions(descendentFont, pdfReader) {
    return descendentFont.exists('DW') ? pdfReader.queryDictionaryObject(descendentFont,'DW').value : 1000;
}

function parseCIDFontDimensions(self, pdfReader,font) {
    // get the descendents font
    let descendentFonts = pdfReader.queryDictionaryObject(font,'DescendantFonts').toPDFArray();
    let descendentFont = pdfReader.queryArrayObject(descendentFonts,0).toPDFDictionary();
    // default width is easily accessible directly via DW
    self.defaultWidth = getDefaultWidthForParseCIDFontDimensions(descendentFont, pdfReader);
    self.widths = {};
    if(descendentFont.exists('W')) {
        let widths = pdfReader.queryDictionaryObject(descendentFont,'W').toPDFArray().toJSArray();

        let i=0;
        while(i<widths.length) {
            let cFirst = widths[i].value;
            ++i;
            if(widths[i].getType() === muhammara.ePDFObjectArray) {
                let anArray = widths[i].toPDFArray().toJSArray();
                ++i;
                // specified widths
                for(let j=0;j<anArray.length;++j)
                    self.widths[cFirst+j] = anArray[j];
            }
            else {
                // same width for range
                let cLast = widths[i].value;
                ++i;
                let width = widths[i].value;
                ++i;
                for(let w=cFirst;w<=cLast;++w)
                    self.widths[w] = width;
            }
        }
    }

    // complete info with font descriptor
    let fontDescriptor = pdfReader.queryDictionaryObject(descendentFont,'FontDescriptor');
    self.descent = pdfReader.queryDictionaryObject(fontDescriptor,'Descent').value;
    self.ascent = pdfReader.queryDictionaryObject(fontDescriptor,'Ascent').value;
}



function parseFontData(self,pdfReader,fontObject) {
    let font = fontObject;
    if(!font)
        return;

    self.isSimpleFont = font.queryObject('Subtype').value !== 'Type0';

    // parse translating information
    if(font.exists('ToUnicode')) {
        // to unicode map
        self.hasToUnicode = true;
        self.toUnicodeMap = parseToUnicode(pdfReader,font.queryObject('ToUnicode').toPDFIndirectObjectReference().getObjectID());
    } else if(self.isSimpleFont) {
        // simple font encoding
        if(font.exists('Encoding'))
            parseSimpleFontEncoding(self,pdfReader,font, font.queryObject('Encoding'));
    }

    // parse dimensions information
    if(self.isSimpleFont) {
        parseSimpleFontDimensions(self,pdfReader,font);
    }
    else {
        parseCIDFontDimensions(self, pdfReader, font);
    }

}


function toUnicodeEncoding(toUnicodeMap,bytes) {
    let result = '';

        let i=0;
        while(i<bytes.length) {
            let value = bytes[i];
            i+=1;
            while(i<bytes.length && (toUnicodeMap[value] === undefined)) {
                value = value*256 + bytes[i];
                i+=1;
            }
            result+= String.fromCharCode.apply(String,toUnicodeMap[value]);
        }
    return result;
}

function toSimpleEncoding(encodingMap,encodedBytes) {
    let result = '';

    encodedBytes.forEach((encodedByte)=> {
        let glyphName = encodingMap[encodedByte];
        if(!!glyphName) {
            let mapping = AdobeGlyphList[glyphName];
            if(!_.isArray(mapping)) {
                mapping = [mapping];
            }
            result+= String.fromCharCode.apply(String,mapping);
        }
    });

    return result;
}

function defaultEncoding(bytes) {
    return String.fromCharCode.apply(String,bytes);
}


function FontDecoding(pdfReader,fontObject) {
    parseFontData(this,pdfReader,fontObject);
}

FontDecoding.prototype.translate = function(encodedBytes) {
    if(this.hasToUnicode) {
        return {result:toUnicodeEncoding(this.toUnicodeMap,encodedBytes),method:'toUnicode'};
    }
    else if(this.hasSimpleEncoding) {
        return {result:toSimpleEncoding(this.fromSimpleEncodingMap,encodedBytes),method:'simpleEncoding'};
    }
    else {
        return {result:defaultEncoding(encodedBytes),method:'default'};
    }
}

FontDecoding.prototype.iterateTextDisplacements = function(encodedBytes,iterator) {
    if(this.isSimpleFont) {
        // one code per call
        encodedBytes.forEach((c)=>{
            iterator(((this.widths && this.widths[c]) || this.defaultWidth || 0) / 1000,c);
        });
    }
    else if(this.hasToUnicode){
        // determine code per toUnicode (should be cmap, but i aint parsing it now, so toUnicode will do).
        // assuming horizontal writing mode
        let i=0;
        while(i<encodedBytes.length) {
            let code = encodedBytes[i];
            i+=1;
            while(i<encodedBytes.length && (this.toUnicodeMap[code] === undefined)) {
                code = code*256 + encodedBytes[i];
                i+=1;
            }
            iterator(((this.widths && this.widths[code]) || this.defaultWidth || 0) / 1000,code);
        }        
    }
    else {
        // default to 2 bytes. though i shuld be reading the cmap. and so also get the writing mode
        for(let j=0;j<encodedBytes.length;j+=2) {
            const codeNew = encodedBytes[0]*256 + encodedBytes[1];
            iterator(((this.widths && this.widths[codeNew]) || this.defaultWidth || 0) / 1000,codeNew);
        }
    }
}

module.exports = FontDecoding;

module.exports.beToNum = beToNum;
module.exports.besToUnicodes = besToUnicodes;
module.exports.getStandardEncodingMap = getStandardEncodingMap;
module.exports.parseToUnicode = parseToUnicode;
module.exports.parseSimpleFontEncoding = parseSimpleFontEncoding;
module.exports.setupDifferencesEncodingMap = setupDifferencesEncodingMap;