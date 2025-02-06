const {parsePdfBuffer} = require('../../../src/pdf/pdfParser');
const fs = require('fs');

describe('parseStorageDoc', () => {

    jest.setTimeout(60000);

    test('should parse pdf', async () => {
        let data = fs.readFileSync('./tests/unit/parse-storage-doc/fixtures/parse-storage-document.pdf');
        let pdfData = await parsePdfBuffer(data);
        expect(pdfData.documentNumber).toBe('GBR-2019-SM-586452E14');
        expect(pdfData.errors.length).toBe(0);

        expect(pdfData.catches[0].product).toBe('Fish fingers');
        expect(pdfData.catches[0].commodityCode).toBe('C0001');
        expect(pdfData.catches[0].certificateNumber).toBe('GBR-2019-CC-000000001');
        expect(pdfData.catches[0].productWeight).toBe('10');
        expect(pdfData.catches[0].dateOfUnloading).toBe('1/8/2019');
        expect(pdfData.catches[0].placeOfUnloading).toBe('Jarrow');
        expect(pdfData.catches[0].transportUnloadedFrom).toBe('A Massive Car');

        expect(pdfData.departurePlace).toBe('South Shields');
        expect(pdfData.departureTransport).toBe('Dinghy');
        expect(pdfData.departureContainers).toBe('Container 1, 2, 3');

        expect(pdfData.storageFacilities[0].facilityName).toBe('Storage Mighty');
        expect(pdfData.storageFacilities[0].facilityAddress).toBe('99 Lukes Lane Estate, Hennurn');

        expect(pdfData.exporterDetails.exporterCompanyName).toBe('Exports Now');
        expect(pdfData.exporterDetails.exporterAddress).toBe('77 Sullivan Walk, Jarrow');
        expect(pdfData.exporterDetails.exporterDateAccepted).toBe('12/3/2019');

        expect(pdfData.dateIssued).toBe('20/4/2019');
    });

    test('no consignment details', async () => {
        let data = fs.readFileSync('./tests/unit/parse-storage-doc/fixtures/storage-document-no-consignment.pdf');
        let pdfData = await parsePdfBuffer(data);
        expect(pdfData.errors.length).toBe(1);
        expect(pdfData.errors[0]).toBe('No consignment details listed');
    });

    test('invalid consignment details1', async () => {
        let data = fs.readFileSync('./tests/unit/parse-storage-doc/fixtures/storage-document-invalid-consignment1.pdf');
        let pdfData = await parsePdfBuffer(data);
        expect(pdfData.errors.length).toBe(5);
        expect(pdfData.errors[0]).toBe('Description of fishery products required');
        expect(pdfData.errors[1]).toBe('Weight (kg) required');
        expect(pdfData.errors[2]).toBe('Date of unloading required');
        expect(pdfData.errors[3]).toBe('Place of unloading required');
        expect(pdfData.errors[4]).toBe('Details of transport unloaded from required');
    });

    test('invalid consignment details2', async () => {
        let data = fs.readFileSync('./tests/unit/parse-storage-doc/fixtures/storage-document-invalid-consignment2.pdf');
        let pdfData = await parsePdfBuffer(data);
        expect(pdfData.errors.length).toBe(2);
        expect(pdfData.errors[0]).toBe('Commodity code required');
        expect(pdfData.errors[1]).toBe('Catch certificate or processing statement number required');
    });

    test('invalid departure details', async () => {
        let data = fs.readFileSync('./tests/unit/parse-storage-doc/fixtures/storage-document-invalid-departure-details.pdf');
        let pdfData = await parsePdfBuffer(data);
        expect(pdfData.errors.length).toBe(2);
        expect(pdfData.errors[0]).toBe('Date / port or place of departure is required');
        expect(pdfData.errors[1]).toBe('Details of transport required');
    });

    test('no storage facility details', async () => {
        let data = fs.readFileSync('./tests/unit/parse-storage-doc/fixtures/storage-document-no-facilities.pdf');
        let pdfData = await parsePdfBuffer(data);
        expect(pdfData.errors.length).toBe(1);
        expect(pdfData.errors[0]).toBe('No storage facilities listed');
    });

    test('invalid storage facility details1', async () => {
        let data = fs.readFileSync('./tests/unit/parse-storage-doc/fixtures/storage-document-invalid-facility1.pdf');
        let pdfData = await parsePdfBuffer(data);
        expect(pdfData.errors.length).toBe(1);
        expect(pdfData.errors[0]).toBe('Storage facility name is required');
    });

    test('invalid storage facility details2', async () => {
        let data = fs.readFileSync('./tests/unit/parse-storage-doc/fixtures/storage-document-invalid-facility2.pdf');
        let pdfData = await parsePdfBuffer(data);
        expect(pdfData.errors.length).toBe(1);
        expect(pdfData.errors[0]).toBe('Storage facility address is required');
    });1

    test('invalid exporter', async () => {
        let data = fs.readFileSync('./tests/unit/parse-storage-doc/fixtures/storage-document-invalid-exporter.pdf');
        let pdfData = await parsePdfBuffer(data);
        expect(pdfData.errors.length).toBe(3);
        expect(pdfData.errors[0]).toBe('Exporter company name is required');
        expect(pdfData.errors[1]).toBe('Exporter address is required');
        expect(pdfData.errors[2]).toBe('Exporter date of acceptance is required');
    });

    test('double entry', async () => {
        let data = fs.readFileSync('./tests/unit/parse-storage-doc/fixtures/storage-document-double-entry.pdf');
        let pdfData = await parsePdfBuffer(data);
        expect(pdfData.errors.length).toBe(1);
        expect(pdfData.errors[0]).toBe('Consignment details have been added to both the front page and the schedule');
    });

    test('double entry facility', async () => {
        let data = fs.readFileSync('./tests/unit/parse-storage-doc/fixtures/storage-document-double-entry-facilities.pdf');
        let pdfData = await parsePdfBuffer(data);
        expect(pdfData.errors.length).toBe(1);
        expect(pdfData.errors[0]).toBe('Storage facility details have been added to both the front page and the schedule');
    });

});
