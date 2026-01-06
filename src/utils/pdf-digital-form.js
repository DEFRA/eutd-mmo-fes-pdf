/**
 * PDFDigitalForm represents an existing form in a PDF file.
 * Parses a form (if exists) and provides its values in a simple manner.
 */

const _ = require('lodash'),
muhammara = require('muhammara');

function toText(item) {
    if(item.getType() === muhammara.ePDFObjectLiteralString) {
        return item.toPDFLiteralString().toText();
    }
    else if(item.getType() === muhammara.ePDFObjectHexString) {
        return item.toPDFHexString().toText();
    } else {
        return item.value;
    }
}

function parseForAcroformObject(pdfParser) {
    let catalogDict = pdfParser.queryDictionaryObject(pdfParser.getTrailer(),'Root').toPDFDictionary();
    let acroformDict = catalogDict.exists('AcroForm') ? pdfParser.queryDictionaryObject(catalogDict,'AcroForm'):null;
    return acroformDict?.toPDFDictionary();
}

function parseKids(pdfParser,fieldDictionary,inheritedProperties,baseFieldName) {

    let localEnv = {}

    // prep some inherited values and push env
    if(fieldDictionary.exists('FT'))
        localEnv['FT'] = fieldDictionary.queryObject('FT').toString();
    if(fieldDictionary.exists('Ff'))
        localEnv['Ff'] = fieldDictionary.queryObject('Ff').toNumber();
    if(fieldDictionary.exists('DA'))
        localEnv['DA'] = toText(fieldDictionary.queryObject('DA'));
    if(fieldDictionary.exists('Opt'))
        localEnv['Opt'] = fieldDictionary.queryObject('Opt').toPDFArray();

    // parse kids
    const result = parseFieldsArray(pdfParser,
        pdfParser.queryDictionaryObject(fieldDictionary,'Kids').toPDFArray(),
        _.extend({},inheritedProperties,localEnv),
        baseFieldName);

    return result;
}

function parseOnOffValue(fieldDictionary) {
    if(fieldDictionary.exists('V')) {
        const value = fieldDictionary.queryObject('V').toString();
        return (value === 'Off' || value === '');
    }
    else
        return null;
}

function parseRadioButtonValue(pdfParser,fieldDictionary) {
    if(fieldDictionary.exists('V') && fieldDictionary?.queryObject('V')?.toString() !== 'Off' && fieldDictionary?.queryObject('V')?.toString() !== '') {
        let result = true; // using true cause sometimes these are actually checkboxes, and there's no underlying kids
        // for radio button this would be an appearance name of a radio button that's turned on. we wanna look for it
        if(fieldDictionary.exists('Kids')) {
            const kidsArray = pdfParser.queryDictionaryObject(fieldDictionary,'Kids').toPDFArray();
            for(let i=0;i<kidsArray.getLength();++i) {
                const widgetDictionary = pdfParser.queryArrayObject(kidsArray,i).toPDFDictionary();
                // use the dictionary Ap/N dictionary for looking up the appearance stream name
                const apDictionary = pdfParser.queryDictionaryObject(widgetDictionary,'AP').toPDFDictionary();
                const nAppearances = pdfParser.queryDictionaryObject(apDictionary,'N').toPDFDictionary();
                if(nAppearances.exists(fieldDictionary?.queryObject('V')?.toString())) {
                    // Found!
                    result = i; // save the selected index as value
                    break;
                }
            }
        }
        return result;
    }
    return null;
}

function parseTextFieldValue(pdfParser, fieldDictionary,fieldName) {
    // grab field value, may be either a text string or a text stream
    if(!fieldDictionary.exists(fieldName))
        return null;

    let valueField = pdfParser.queryDictionaryObject(fieldDictionary,fieldName);

    if(valueField.getType() == muhammara.ePDFObjectLiteralString) {
        // text string. read into value
        return toText(valueField);
    } else if(valueField.getType() == muhammara.ePDFObjectStream) {
        let bytes = [];
        // stream. read it into the value
        const pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(valueField.toPDFStream().getUnfilteredStreamBuffer()));
        const pdfWriter = muhammara.createWriterToModify(inStream, pdfStream);
        let readStream = pdfReader.startReadingFromStream(valueField.toPDFStream());
        while(readStream.notEnded())
        {
            let readData = readStream.read(1);
            // do something with the data
            bytes.push(readData[0]);
        }
        // now turn to text string
        return pdfWriter.createPDFTextString(bytes).toString();
    } else {
        return null;
    }
}

function parseChoiceValue(pdfParser, fieldDictionary) {
    if(fieldDictionary.exists('V')) {
        // might be either text or array of texts
        let valueField = pdfParser.queryDictionaryObject(fieldDictionary,"V");
        if(valueField.getType() == muhammara.ePDFObjectLiteralString || valueField.getType() == muhammara.ePDFObjectHexString) {
            // text string. read into value
            return toText(valueField);
        } else if(valueField.getType == muhammara.ePDFObjectArray) {
            let arrayOfStrings = valueField.toPDFArray().toJSArray();
            return _.map(arrayOfStrings,toText);
        } else {
            return undefined;
        }
    }
    else
        return undefined;
}

function parseFieldsValueData(result,pdfParser,fieldDictionary,flags, inheritedProperties) {
    let localFieldType = fieldDictionary.exists('FT') ? fieldDictionary.queryObject('FT').toString():undefined,
        fieldType = localFieldType || inheritedProperties['FT'];

    if(!fieldType)
        return null; // k. must be a widget

    switch(fieldType) {
        case 'Btn': {
            if((flags>>16) & 1)
            {
                // push button
                result['type'] = 'button';
                // no value
            }
            else if((flags>>15) & 1)
            {
                // radio button
                result['type'] = 'radio';
                result['value'] = parseRadioButtonValue(pdfParser,fieldDictionary);
            }
            else
            {
                // checkbox
                result['type'] = 'checkbox';
                result['value'] = parseOnOffValue(fieldDictionary);
            }
            break;
        }
        case 'Tx': {
            result['isFileSelect'] = !!(flags>>20 & 1);
            if((flags>>25) & 1) {
                result['type'] = 'richtext';
                // rich text, value in 'RV'
                result['value'] = parseTextFieldValue(pdfParser, fieldDictionary,'RV');
                result['plainValue'] = parseTextFieldValue(pdfParser, fieldDictionary,'V');
            } else {
                result['type'] = 'plaintext';
                result['value'] = parseTextFieldValue(pdfParser, fieldDictionary,'V');
            }

            break;
        }
        case 'Ch': {
            result['type'] = 'choice';
            result['value'] = parseChoiceValue(pdfParser, fieldDictionary);

            break;
        }
        case 'Sig': {
            result['type'] = 'signature';
            break;
        }
    }
}

function parseField(pdfParser,fieldDictionary,inheritedProperties,baseFieldName) {
    let localFieldNameT = fieldDictionary.exists('T') ? toText(fieldDictionary.queryObject('T')):undefined,
        localFieldNameTU = fieldDictionary.exists('TU') ? toText(fieldDictionary.queryObject('TU')):undefined,
        localFieldNameTM = fieldDictionary.exists('TM') ? toText(fieldDictionary.queryObject('TM')):undefined,
        localFlags = fieldDictionary.exists('Ff') ? fieldDictionary.queryObject('Ff').toNumber():undefined,
        flags = localFlags === undefined ? inheritedProperties['Ff'] : localFlags;

    // i'm gonna assume that if there's no T and no kids, this is a widget annotation WHICH IS NOT a field and i'm out of here
    if(localFieldNameT === undefined &&
        !fieldDictionary.exists('Kids') &&
        fieldDictionary.exists('Subtype') &&
        fieldDictionary.queryObject('Subtype').toString() == 'Widget')
        return null;

    if(flags === undefined || flags === null)
        flags = 0;

    let result = {
        name : localFieldNameT,
        fullName: localFieldNameT === undefined ? undefined : (baseFieldName + localFieldNameT),
        alternateName : localFieldNameTU,
        mappingName : localFieldNameTM,
        isNoExport : !!((flags>>2) & 1)
    };


    if(fieldDictionary.exists('Kids')) {
        const kids = parseKids(pdfParser,fieldDictionary,inheritedProperties,baseFieldName + localFieldNameT + '.');
        if(kids) {
            // that would be a non terminal node, otherwise all kids are annotations an null would be returned
            result['kids'] = kids;
        }
        else {
            // a terminal node, so kids array returned empty
            parseFieldsValueData(result,pdfParser,fieldDictionary,flags, inheritedProperties);
        }
    }
    else {
        // read fields value data
        parseFieldsValueData(result,pdfParser,fieldDictionary,flags, inheritedProperties);

    }
    return result;
}


function parseFieldsArray(pdfParser,fieldsArray,inheritedProperties,baseFieldName) {
    const result = [];
    for(let i=0;i<fieldsArray.getLength();++i) {
        const fieldResult = parseField(pdfParser,
            pdfParser.queryArrayObject(fieldsArray,i).toPDFDictionary(),
            inheritedProperties,baseFieldName);
        if(fieldResult)
            result.push(fieldResult);
    }

    if(result.length == 0)
        return null; // widgets parent
    else
        return result;
}


function accumulateFieldsValues(result,fieldsArray) {
    fieldsArray.forEach(function(field) {
        if(field.kids)
            accumulateFieldsValues(result,field.kids)
        else
            result[field.fullName] = field.value;
    });
}


/**
 *  PDFDigitalForm constructor.
 * @constructor
 * @param {PDFParser} pdfParser - A muhammara PDF Parser for the PDF to read form from.
 */
function PDFDigitalForm(pdfParser) {
    this.acroformDict = parseForAcroformObject(pdfParser);

    if(this.acroformDict) {
        const fieldsArray = this.acroformDict.exists('Fields') ?
            pdfParser.queryDictionaryObject(this.acroformDict,'Fields').toPDFArray() :
            null;
        if(fieldsArray)
            this.fields = parseFieldsArray(
                pdfParser,
                fieldsArray,
                {},
                '');
    }
}

/**
 * @method hasForm
 * @return {bool} whether document has a form
 */
PDFDigitalForm.prototype.hasForm = function() {
    return !!this.acroformDict;
}

/**
 * @method createSimpleKeyValue
 * @return {object} dictionary mapping form full names to their respective values
 */
PDFDigitalForm.prototype.createSimpleKeyValue = function() {
    // create flattened simple key value mapping by recursing.
    const result = {};

    if(this.fields) {
        accumulateFieldsValues(result,this.fields);
    }

    return result;
}

module.exports = PDFDigitalForm