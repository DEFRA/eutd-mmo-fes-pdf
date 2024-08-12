const {parsePdfBuffer} = require('../../../src/pdf/pdfParser');
const fs = require('fs');

describe('parseProcStmnt', () => {

    jest.setTimeout(60000);

    /*test('should parse pdf', async () => {
        let data = fs.readFileSync('./tests/unit/parse-proc-stmnt/fixtures/parse-proc-stmnt.pdf');
        let pdfData = await parsePdfBuffer(data);*/

    test('should parse pdf', async () => {
        let data = fs.readFileSync('./tests/unit/parse-proc-stmnt/fixtures/parse-proc-stament-schedule.pdf');
        let pdfData = await parsePdfBuffer(data);
        expect(pdfData.documentNumber).toBe('GBR-2019-PM-9AA3BCE07');
        expect(pdfData.errors.length).toBe(0);

        expect(pdfData.catches.length).toBe(72);
        expect(pdfData.catches[0]).toEqual(catch1);
        expect(pdfData.catches[71]).toEqual(catch72);
    });

    test('invalid catch details', async () => {
        let data = fs.readFileSync('./tests/unit/parse-proc-stmnt/fixtures/proc-stament-schedule-invalid.pdf');
        let pdfData = await parsePdfBuffer(data);
        expect(pdfData.errors.length).toBe(10);
        expect(pdfData.errors[0]).toBe('Total landed weight (kg) required on schedule page 2 row 1');
        expect(pdfData.errors[1]).toBe('Processed fishery product (kg) required on schedule page 2 row 1');
        expect(pdfData.errors[2]).toBe('Catch description required on schedule page 2 row 2');
        expect(pdfData.errors[3]).toBe('Catch certificate number required on schedule page 2 row 2');
        expect(pdfData.errors[4]).toBe('Catch processed (kg) required on schedule page 2 row 2');
        expect(pdfData.errors[5]).toBe('Catch description required on schedule page 4 row 1');
        expect(pdfData.errors[6]).toBe('Catch processed (kg) required on schedule page 4 row 1');
        expect(pdfData.errors[7]).toBe('Catch certificate number required on schedule page 4 row 2');
        expect(pdfData.errors[8]).toBe('Total landed weight (kg) required on schedule page 4 row 2');
        expect(pdfData.errors[9]).toBe('Processed fishery product (kg) required on schedule page 4 row 2');

    });
});

const catch1 = {
    "species": "Cod",
    "catchCertificateNumber": "GBR-2019-CC-000001",
    "totalWeightLanded": "1001",
    "exportWeightBeforeProcessing": "101",
    "exportWeightAfterProcessing": "1"
};

const catch72 = {
    "species": "Fish72",
    "catchCertificateNumber": "GBR-2019-CC-000072",
    "totalWeightLanded": "1072",
    "exportWeightBeforeProcessing": "172",
    "exportWeightAfterProcessing": "72"
};