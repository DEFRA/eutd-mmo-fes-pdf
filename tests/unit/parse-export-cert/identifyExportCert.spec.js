const {extractPdfText, identifyPdf} = require('../../../src/pdf/pdfParser');
const fs = require('fs');
const muhammara = require('muhammara');

describe('identifyExportCert', () => {

    jest.setTimeout(60000);

    test('should extract the document number from the pdf', async () => {
        let data = fs.readFileSync('./tests/unit/parse-export-cert/fixtures/parse-export-certs.pdf');
        let pdfText = await extractPdfText(data);

        let pdfData = identifyPdf(pdfText);
        expect(pdfData.documentNumber).toBe('GBR-2019-CM-EA35698BF');
    });

});