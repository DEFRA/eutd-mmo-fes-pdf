const {extractPdfText, identifyPdf} = require('../../../src/pdf/pdfParser');
const fs = require('fs');

describe('identifyExportCert', () => {

    jest.setTimeout(60000);

    test.each([
        [9, 79, 78, 'GBR-2019-CM-EA35698BF', 'Export Certificate'],
        [4, 58, 54, 'GBR-2019-PM-EA35698BF', 'Processing Statement'],
        [5, 64, 60, 'GBR-2019-SM-EA35698BF', 'Storage Note']
    ])('identifies a matching layout with %i pages', (pages, entries, index, documentNumber, type) => {
        const pdfText = Array.from({ length: pages }, () => []);
        pdfText[0] = Array.from({ length: entries }, () => ({ text: '' }));
        pdfText[0][index] = { text: documentNumber };

        expect(identifyPdf(pdfText)).toEqual({ documentNumber, type });
    });

    test.each([
        [9, 79, 78, 'GBR-2019-PM-EA35698BF'],
        [4, 58, 54, 'GBR-2019-SM-EA35698BF'],
        [5, 64, 60, 'GBR-2019-CM-EA35698BF'],
        [9, 79, 78, undefined],
        [9, 79, 78, null],
        [9, 79, 78, ''],
        [9, 79, 78, 'GBR_2019_CM_EA35698BF'],
        [9, 79, 78, 'USA-2019-CM-EA35698BF'],
        [9, 79, 78, 'GBR-2019-XX-EA35698BF'],
        [9, 78, 77, 'GBR-2019-CM-EA35698BF'],
        [4, 57, 54, 'GBR-2019-PM-EA35698BF'],
        [5, 63, 60, 'GBR-2019-SM-EA35698BF']
    ])('rejects unsupported layout or document number: %i/%i/%i/%s', (pages, entries, index, documentNumber) => {
        const pdfText = Array.from({ length: pages }, () => []);
        pdfText[0] = Array.from({ length: entries }, () => ({ text: '' }));
        pdfText[0][index] = { text: documentNumber };

        expect(identifyPdf(pdfText)).toEqual({});
    });

    test('does not identify an empty PDF', () => {
        expect(identifyPdf([])).toEqual({});
    });

    test('should extract the document number from the pdf', async () => {
        let data = fs.readFileSync('./tests/unit/parse-export-cert/fixtures/parse-export-certs.pdf');
        let pdfText = await extractPdfText(data);

        let pdfData = identifyPdf(pdfText);
        expect(pdfData.documentNumber).toBe('GBR-2019-CM-EA35698BF');
    });

});