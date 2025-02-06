const muhammara = require('muhammara');
const fs = require('fs');

describe('PDFParser', function() {

    jest.setTimeout(60000);

    test('should complete without error', function() {
        let mTabLevel = 0;
        let mIteratedObjectIDs = {};
        let outputFile = fs.openSync(__dirname + '/output/parseLog.txt','w');
        function logToFile(inString) {
            fs.writeSync(outputFile,addTabs() + inString + '\r\n');
        }

        function addTabs() {
            let output='';
            for (let i=0;i<mTabLevel;++i) {
                output+=' ';
            }
            return output;
        }

        function iterateObjectTypes(inObject,inReader) {
            let output = '';

            if (inObject.getType() == muhammara.ePDFObjectIndirectObjectReference) {
                output+= 'Indirect object reference:';
                logToFile(output);
                let objectID = inObject.toPDFIndirectObjectReference().getObjectID();
                if (!mIteratedObjectIDs.hasOwnProperty(objectID)) {
                    mIteratedObjectIDs[objectID] = true;
                    iterateObjectTypes(inReader.parseNewObject(objectID),inReader);
                }
                for (let i=0;i<mTabLevel;++i) {
                    output+=' ';
                }
                output+='was parsed already';
                logToFile(output);
            } else if (inObject.getType() == muhammara.ePDFObjectArray) {
                output+= muhammara.getTypeLabel(inObject.getType());
                logToFile(output);
                ++mTabLevel;
                inObject.toPDFArray().toJSArray().forEach(function(element, index, array){iterateObjectTypes(element,inReader);});
                --mTabLevel;
            } else if (inObject.getType() == muhammara.ePDFObjectDictionary) {
                output+= muhammara.getTypeLabel(inObject.getType());
                logToFile(output);
                ++mTabLevel;
                let aDictionary = inObject.toPDFDictionary().toJSObject();

                Object.getOwnPropertyNames(aDictionary).forEach(function(element,index,array)
                {
                    logToFile(element);
                    iterateObjectTypes(aDictionary[element],inReader);
                });
                --mTabLevel;
            } else if (inObject.getType() == muhammara.ePDFObjectStream) {
                output+= 'Stream . iterating stream dictionary:';
                logToFile(output);
                iterateObjectTypes(inObject.toPDFStream().getDictionary(),inReader);
            } else {
                output+= muhammara.getTypeLabel(inObject.getType());
                logToFile(output);
            }
        }


        const data = fs.readFileSync('./tests/unit/parse-export-cert/fixtures/parse-export-cert.pdf');

        let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));

        const catalog = pdfReader.queryDictionaryObject(pdfReader.getTrailer(),'Root');
        iterateObjectTypes(catalog,pdfReader);
        fs.closeSync(outputFile);
    });
});
