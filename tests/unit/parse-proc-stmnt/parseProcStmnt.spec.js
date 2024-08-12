const {parsePdfBuffer} = require('../../../src/pdf/pdfParser');
const fs = require('fs');
const muhammara = require('muhammara');

describe('parseProcStatement', () => {

    jest.setTimeout(60000);

    test('should parse pdf', async () => {
        let data = fs.readFileSync('./tests/unit/parse-proc-stmnt/fixtures/parse-proc-statement.pdf');
        let pdfData = await parsePdfBuffer(data);
        expect(pdfData.documentNumber).toBe('GBR-2019-PM-5116302FA');
        expect(pdfData.errors.length).toBe(0);

        expect(pdfData.consignmentDescription).toBe('fish fingers with commodity code pr123432');
        expect(pdfData.healthCertificateNumber).toBe('HC0000001');
        expect(pdfData.healthCertificateDate).toBe('12/2/2019');
        expect(pdfData.personResponsibleForConsignment).toBe('Mark Ford');
        expect(pdfData.plantApprovalNumber).toBe('PA000001');
        expect(pdfData.plantName).toBe('Fish Processor');
        expect(pdfData.plantAddress).toBe('99 Lukes Lane Estate, Hennurn');
        expect(pdfData.dateOfAcceptance).toBe('12/3/2019');
        expect(pdfData.exporter.exporterCompanyName).toBe('Fish Exporter');
        expect(pdfData.exporter.exporterAddress).toBe('99 Jarra Road, Gateshead');

        expect(pdfData.catches[0].species).toBe('Cod');
        expect(pdfData.catches[0].catchCertificateNumber).toBe('GBR-2019-CC-000001');
        expect(pdfData.catches[0].totalWeightLanded).toBe('12');
        expect(pdfData.catches[0].exportWeightBeforeProcessing).toBe('10');
        expect(pdfData.catches[0].exportWeightAfterProcessing).toBe('9');

        expect(pdfData.catches[1].species).toBe('Haddock');
        expect(pdfData.catches[1].catchCertificateNumber).toBe('GBR-2019-CC-000002');
        expect(pdfData.catches[1].totalWeightLanded).toBe('22');
        expect(pdfData.catches[1].exportWeightBeforeProcessing).toBe('20');
        expect(pdfData.catches[1].exportWeightAfterProcessing).toBe('19');

        expect(pdfData.catches[2].species).toBe('Tuna');
        expect(pdfData.catches[2].catchCertificateNumber).toBe('GBR-2019-CC-000003');
        expect(pdfData.catches[2].totalWeightLanded).toBe('100');
        expect(pdfData.catches[2].exportWeightBeforeProcessing).toBe('30');
        expect(pdfData.catches[2].exportWeightAfterProcessing).toBe('20');

        expect(pdfData.catches[3].species).toBe('Shark');
        expect(pdfData.catches[3].catchCertificateNumber).toBe('GBR-2019-CC-000004');
        expect(pdfData.catches[3].totalWeightLanded).toBe('120');
        expect(pdfData.catches[3].exportWeightBeforeProcessing).toBe('110');
        expect(pdfData.catches[3].exportWeightAfterProcessing).toBe('100');

        expect(pdfData.catches[4].species).toBe('Guppies');
        expect(pdfData.catches[4].catchCertificateNumber).toBe('GBR-2019-CC-000005');
        expect(pdfData.catches[4].totalWeightLanded).toBe('200');
        expect(pdfData.catches[4].exportWeightBeforeProcessing).toBe('190');
        expect(pdfData.catches[4].exportWeightAfterProcessing).toBe('180');
    });

    test('invalid exporter', async () => {
        let data = fs.readFileSync('./tests/unit/parse-proc-stmnt/fixtures/proc-statement-invalid-exporter.pdf');
        let pdfData = await parsePdfBuffer(data);
        expect(pdfData.errors.length).toBe(2);
        expect(pdfData.errors[0]).toBe('Name of exporter company required');
        expect(pdfData.errors[1]).toBe('Address of exporter company required');
    });

    test('no catch details', async () => {
        let data = fs.readFileSync('./tests/unit/parse-proc-stmnt/fixtures/proc-statement-empty-catch.pdf');
        let pdfData = await parsePdfBuffer(data);
        expect(pdfData.errors.length).toBe(1);
        expect(pdfData.errors[0]).toBe('No catch details listed');
    });

    test('invalid catch details', async () => {
        let data = fs.readFileSync('./tests/unit/parse-proc-stmnt/fixtures/proc-statement-invalid-catch.pdf');
        let pdfData = await parsePdfBuffer(data);
        expect(pdfData.errors.length).toBe(5);
        expect(pdfData.errors[0]).toBe('Catch certificate number required on row 1');
        expect(pdfData.errors[1]).toBe('Catch processed (kg) required on row 1');
        expect(pdfData.errors[2]).toBe('Catch description required on row 2');
        expect(pdfData.errors[3]).toBe('Total landed weight (kg) required on row 2');
        expect(pdfData.errors[4]).toBe('Processed fishery product (kg) required on row 2');
    });

    test('double entry', async () => {
        let data = fs.readFileSync('./tests/unit/parse-proc-stmnt/fixtures/proc-statement-double-entry.pdf');
        let pdfData = await parsePdfBuffer(data);
        expect(pdfData.errors.length).toBe(1);
        expect(pdfData.errors[0]).toBe('Catch details have been added to both the front page and the schedule');
    });

});
