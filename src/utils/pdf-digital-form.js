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
    const catalogDict = pdfParser.queryDictionaryObject(pdfParser.getTrailer(),'Root').toPDFDictionary();
    const acroformDict = catalogDict.exists('AcroForm') ? pdfParser.queryDictionaryObject(catalogDict,'AcroForm'):null;
    return acroformDict?.toPDFDictionary();
}

function parseKids(pdfParser,fieldDictionary,inheritedProperties,baseFieldName) {

    const localEnv = {}

    // prep some inherited values and push env
    if(fieldDictionary.exists('FT')) {
        localEnv['FT'] = fieldDictionary.queryObject('FT').toString();
    }
    if(fieldDictionary.exists('Ff')) {
        localEnv['Ff'] = fieldDictionary.queryObject('Ff').toNumber();
    }
    if(fieldDictionary.exists('DA')) {
        localEnv['DA'] = toText(fieldDictionary.queryObject('DA'));
    }
    if(fieldDictionary.exists('Opt')) {
        localEnv['Opt'] = fieldDictionary.queryObject('Opt').toPDFArray();
    }

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
    } else {
        return null;
    }
}

function parseRadioButtonValue(pdfParser,fieldDictionary) {
    if(!fieldDictionary.exists('V')) {
        return null;
    }

    const selectedValue = fieldDictionary.queryObject('V').toString();
    if(selectedValue === 'Off' || selectedValue === '') {
        return null;
    }

    if(!fieldDictionary.exists('Kids')) {
        return -1;
    }

    const kidsArray = pdfParser.queryDictionaryObject(fieldDictionary,'Kids').toPDFArray();
    for(let i=0;i<kidsArray.getLength();++i) {
        const widgetDictionary = pdfParser.queryArrayObject(kidsArray,i).toPDFDictionary();
        // use the dictionary Ap/N dictionary for looking up the appearance stream name
        const apDictionary = pdfParser.queryDictionaryObject(widgetDictionary,'AP').toPDFDictionary();
        const nAppearances = pdfParser.queryDictionaryObject(apDictionary,'N').toPDFDictionary();
        if(nAppearances.exists(selectedValue)) {
            // save the selected index as value
            return i;
        }
    }

    return -1;
}

function parseTextFieldValue(pdfParser, fieldDictionary,fieldName) {
    // grab field value, may be either a text string or a text stream
    if(!fieldDictionary.exists(fieldName)) {
        return null;
    }

    const valueField = pdfParser.queryDictionaryObject(fieldDictionary,fieldName);

    if(valueField.getType() === muhammara.ePDFObjectLiteralString) {
        // text string. read into value
        return toText(valueField);
    } else if(valueField.getType() === muhammara.ePDFObjectStream) {
        const bytes = [];
        // stream. read it into the value
        const readStream = pdfParser.startReadingFromStream(valueField.toPDFStream());
        while(readStream.notEnded())
        {
            const readData = readStream.read(1);
            // do something with the data
            bytes.push(readData[0]);
        }
        // now turn to text string
        return Buffer.from(bytes).toString('utf8');
    } else {
        return null;
    }
}

function parseChoiceValue(pdfParser, fieldDictionary) {
    if(fieldDictionary.exists('V')) {
        // might be either text or array of texts
        const valueField = pdfParser.queryDictionaryObject(fieldDictionary,'V');
        if(valueField.getType() === muhammara.ePDFObjectLiteralString || valueField.getType() === muhammara.ePDFObjectHexString) {
            // text string. read into value
            return toText(valueField);
        } else if(valueField.getType() === muhammara.ePDFObjectArray) {
            const arrayOfStrings = valueField.toPDFArray().toJSArray();
            return _.map(arrayOfStrings,toText);
        } else {
            return undefined;
        }
    } else {
        return undefined;
    }
}

function parseButtonValue(result, pdfParser, fieldDictionary, flags) {
    if((flags>>16) & 1) {
        result.type = 'button';
        return result;
    }

    if((flags>>15) & 1) {
        result.type = 'radio';
        result.value = parseRadioButtonValue(pdfParser,fieldDictionary);
        return result;
    }

    result.type = 'checkbox';
    result.value = parseOnOffValue(fieldDictionary);
    return result;
}

function parseTextValue(result, pdfParser, fieldDictionary, flags) {
    result.isFileSelect = !!(flags>>20 & 1);
    if((flags>>25) & 1) {
        result.type = 'richtext';
        result.value = parseTextFieldValue(pdfParser, fieldDictionary,'RV');
        result.plainValue = parseTextFieldValue(pdfParser, fieldDictionary,'V');
    } else {
        result.type = 'plaintext';
        result.value = parseTextFieldValue(pdfParser, fieldDictionary,'V');
    }

    return result;
}

function parseFieldsValueData(result,pdfParser,fieldDictionary,flags, inheritedProperties) {
    const localFieldType = fieldDictionary.exists('FT') ? fieldDictionary.queryObject('FT').toString():undefined;
    const fieldType = localFieldType || inheritedProperties['FT'];

    if(!fieldType) {
        return null; // k. must be a widget
    }

    if(fieldType === 'Btn') {
        return parseButtonValue(result, pdfParser, fieldDictionary, flags);
    }

    if(fieldType === 'Tx') {
        return parseTextValue(result, pdfParser, fieldDictionary, flags);
    }

    if(fieldType === 'Ch') {
        result.type = 'choice';
        result.value = parseChoiceValue(pdfParser, fieldDictionary);
        return result;
    }

    if(fieldType === 'Sig') {
        result.type = 'signature';
        return result;
    }

    return result;
}

function isWidgetAnnotationWithoutFieldName(fieldDictionary, localFieldNameT) {
    return localFieldNameT === undefined &&
        !fieldDictionary.exists('Kids') &&
        fieldDictionary.exists('Subtype') &&
        fieldDictionary.queryObject('Subtype').toString() === 'Widget';
}

function createFieldResult(localFieldNameT, localFieldNameTU, localFieldNameTM, flags, baseFieldName) {
    return {
        name : localFieldNameT,
        fullName: localFieldNameT === undefined ? undefined : `${baseFieldName}${localFieldNameT}`,
        alternateName : localFieldNameTU,
        mappingName : localFieldNameTM,
        isNoExport : !!((flags>>2) & 1)
    };
}

function parseFieldKidsOrValue(result, pdfParser, fieldDictionary, inheritedProperties, baseFieldName, localFieldNameT, flags) {
    if(!fieldDictionary.exists('Kids')) {
        parseFieldsValueData(result,pdfParser,fieldDictionary,flags, inheritedProperties);
        return;
    }

    const kids = parseKids(pdfParser,fieldDictionary,inheritedProperties,`${baseFieldName}${localFieldNameT}.`);
    if(kids) {
        // that would be a non terminal node, otherwise all kids are annotations an null would be returned
        result.kids = kids;
        return;
    }

    // a terminal node, so kids array returned empty
    parseFieldsValueData(result,pdfParser,fieldDictionary,flags, inheritedProperties);
}

function parseField(pdfParser,fieldDictionary,inheritedProperties,baseFieldName) {
    const localFieldNameT = fieldDictionary.exists('T') ? toText(fieldDictionary.queryObject('T')):undefined;
    const localFieldNameTU = fieldDictionary.exists('TU') ? toText(fieldDictionary.queryObject('TU')):undefined;
    const localFieldNameTM = fieldDictionary.exists('TM') ? toText(fieldDictionary.queryObject('TM')):undefined;
    const localFlags = fieldDictionary.exists('Ff') ? fieldDictionary.queryObject('Ff').toNumber():undefined;
    const inheritedFlags = inheritedProperties['Ff'];
    const flags = localFlags === undefined || localFlags === null ? (inheritedFlags ?? 0) : localFlags;

    // if there's no T and no kids this is a widget annotation, not a field
    if(isWidgetAnnotationWithoutFieldName(fieldDictionary, localFieldNameT)) {
        return null;
    }

    const result = createFieldResult(localFieldNameT, localFieldNameTU, localFieldNameTM, flags, baseFieldName);
    parseFieldKidsOrValue(result, pdfParser, fieldDictionary, inheritedProperties, baseFieldName, localFieldNameT, flags);

    return result;
}


function parseFieldsArray(pdfParser,fieldsArray,inheritedProperties,baseFieldName) {
    const result = [];
    for(let i=0;i<fieldsArray.getLength();++i) {
        const fieldResult = parseField(pdfParser,
            pdfParser.queryArrayObject(fieldsArray,i).toPDFDictionary(),
            inheritedProperties,baseFieldName);
        if(fieldResult) {
            result.push(fieldResult);
        }
    }

    if(result.length === 0) {
        return null; // widgets parent
    } else {
        return result;
    }
}


function accumulateFieldsValues(result,fieldsArray) {
    fieldsArray.forEach(function(field) {
        if(field.kids) {
            accumulateFieldsValues(result,field.kids)
        }
        else {
            result[field.fullName] = field.value;
        }
    });
}


/**
 *  PDFDigitalForm constructor.
 * @constructor
 * @param {PDFParser} pdfParser - A muhammara PDF Parser for the PDF to read form from.
 */
class PDFDigitalForm {
    constructor(pdfParser) {
        this.acroformDict = parseForAcroformObject(pdfParser);

        if(this.acroformDict) {
            const fieldsArray = this.acroformDict.exists('Fields') ?
                pdfParser.queryDictionaryObject(this.acroformDict,'Fields').toPDFArray() :
                null;
            if(fieldsArray) {
                this.fields = parseFieldsArray(
                    pdfParser,
                    fieldsArray,
                    {},
                    '');
            }
        }
    }

    /**
     * @method hasForm
     * @return {bool} whether document has a form
     */
    hasForm() {
        return !!this.acroformDict;
    }

    /**
     * @method createSimpleKeyValue
     * @return {object} dictionary mapping form full names to their respective values
     */
    createSimpleKeyValue() {
        // create flattened simple key value mapping by recursing.
        const result = {};

        if(this.fields) {
            accumulateFieldsValues(result,this.fields);
        }

        return result;
    }
}

module.exports = PDFDigitalForm