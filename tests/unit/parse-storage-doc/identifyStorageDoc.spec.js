const {extractPdfText, identifyPdf} = require('../../../src/pdf/pdfParser');
const fs = require('fs');

describe('identifyStorageDoc', () => {

    jest.setTimeout(60000);

    test('should extract the document number from the pdf', async () => {
        const data = fs.readFileSync('./tests/unit/parse-storage-doc/fixtures/parse-storage-document.pdf');
        let pdfText = await extractPdfText(data);

        let pdfData = identifyPdf(pdfText);
        expect(pdfData.documentNumber).toBe('GBR-2019-SM-586452E14');
    });

});