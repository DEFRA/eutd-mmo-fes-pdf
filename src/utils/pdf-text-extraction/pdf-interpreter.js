const muhammara = require('muhammara');

function interpretContentStream(objectParser,onOperatorHandler) {
        
    let operandsStack = [];
    let anObject = objectParser.parseNewObject();
    
    while(anObject) {
        if(anObject.getType() === muhammara.ePDFObjectSymbol) {
            // operator!
            onOperatorHandler(anObject.value,operandsStack.concat());
            operandsStack = [];
        }
        else {
            // operand!
            operandsStack.push(anObject);
        }
        anObject = objectParser.parseNewObject();
    }   
}

class PDFInterpreter {
    // used as an export

    interpretPageContents(pdfReader,pageObject,onOperatorHandler) {
        pageObject = pageObject.toPDFDictionary();
        const contents = pageObject.exists('Contents') ? pdfReader.queryDictionaryObject(pageObject,('Contents')):null;
        if(!contents) {
            return;
        }

        if(contents.getType() === muhammara.ePDFObjectArray) {
            interpretContentStream(pdfReader.startReadingObjectsFromStreams(contents.toPDFArray()),onOperatorHandler);
        }
        else {
            interpretContentStream(pdfReader.startReadingObjectsFromStream(contents.toPDFStream()),onOperatorHandler);
        }    
    }

    interpretXObjectContents(pdfReader,xobjectObject,onOperatorHandler) {
        interpretContentStream(pdfReader.startReadingObjectsFromStream(xobjectObject.toPDFStream()),onOperatorHandler);
    }

    interpretStream(pdfReader,stream,onOperatorHandler) {
        interpretContentStream(pdfReader.startReadingObjectsFromStream(stream),onOperatorHandler);
    }
}

module.exports = PDFInterpreter;