const {extractPdfText, identifyPdf} = require('../../../src/pdf/pdfParser');
const fs = require('fs');
const muhammara = require('muhammara');

describe('identifyProcStatement', () => {

    jest.setTimeout(60000);

    test('should extract the document number from the pdf', async () => {
        var data = fs.readFileSync('./tests/unit/parse-proc-stmnt/fixtures/parse-proc-statement.pdf');
        let pdfText = await extractPdfText(data);

        let pdfData = identifyPdf(pdfText);
        expect(pdfData.documentNumber).toBe('GBR-2019-PM-5116302FA');
    });

});