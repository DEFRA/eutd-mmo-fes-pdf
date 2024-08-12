const {parsePdfBuffer} = require('../../../src/pdf/pdfParser');
const fs = require('fs');
const muhammara = require('muhammara');

describe('parseStorageDoc', () => {

    jest.setTimeout(60000);

    test('should parse pdf', async () => {
        let data = fs.readFileSync('./tests/unit/parse-storage-doc/fixtures/parse-storage-document-schedule.pdf');
        let pdfData = await parsePdfBuffer(data);
        expect(pdfData.documentNumber).toBe('GBR-2019-SM-586452E14');
        expect(pdfData.errors.length).toBe(0);

        expect(pdfData.catches.length).toBe(53);
        expect(pdfData.catches[0]).toEqual(catch1);
        expect(pdfData.catches[3]).toEqual(catch4);
        expect(pdfData.catches[6]).toEqual(catch7);
        expect(pdfData.catches[16]).toEqual(catch17);
        expect(pdfData.catches[17]).toEqual(catch18);
        expect(pdfData.catches[34]).toEqual(catch35);
        expect(pdfData.catches[35]).toEqual(catch36);
        expect(pdfData.catches[52]).toEqual(catch53);

        expect(pdfData.storageFacilities.length).toBe(21);
        expect(pdfData.storageFacilities[0]).toEqual(facility1);
        expect(pdfData.storageFacilities[20]).toEqual(facility21);

    });

    test('invalid catch details', async () => {
        let data = fs.readFileSync('./tests/unit/parse-storage-doc/fixtures/storage-document-schedule-invalid.pdf');
        let pdfData = await parsePdfBuffer(data);
        expect(pdfData.errors.length).toBe(23);

        expect(pdfData.errors[0]).toBe('Commodity code required on schedule page 2 row 1');
        expect(pdfData.errors[1]).toBe('Weight (kg) required on schedule page 2 row 1');
        expect(pdfData.errors[2]).toBe('Place of unloading required on schedule page 2 row 1');
        expect(pdfData.errors[3]).toBe('Description of fishery products required on schedule page 2 row 2');
        expect(pdfData.errors[4]).toBe('Catch certificate or processing statement number required on schedule page 2 row 2');
        expect(pdfData.errors[5]).toBe('Date of unloading required on schedule page 2 row 2');
        expect(pdfData.errors[6]).toBe('Details of transport unloaded from required on schedule page 2 row 2');
        expect(pdfData.errors[7]).toBe('Description of fishery products required on schedule page 3 row 1');
        expect(pdfData.errors[8]).toBe('Catch certificate or processing statement number required on schedule page 3 row 1');
        expect(pdfData.errors[9]).toBe('Date of unloading required on schedule page 3 row 1');
        expect(pdfData.errors[10]).toBe('Details of transport unloaded from required on schedule page 3 row 1');
        expect(pdfData.errors[11]).toBe('Commodity code required on schedule page 3 row 2');
        expect(pdfData.errors[12]).toBe('Weight (kg) required on schedule page 3 row 2');
        expect(pdfData.errors[13]).toBe('Place of unloading required on schedule page 3 row 2');
        expect(pdfData.errors[14]).toBe('Description of fishery products required on schedule page 4 row 17');
        expect(pdfData.errors[15]).toBe('Catch certificate or processing statement number required on schedule page 4 row 17');
        expect(pdfData.errors[16]).toBe('Date of unloading required on schedule page 4 row 17');
        expect(pdfData.errors[17]).toBe('Details of transport unloaded from required on schedule page 4 row 17');
        expect(pdfData.errors[18]).toBe('Commodity code required on schedule page 4 row 18');
        expect(pdfData.errors[19]).toBe('Weight (kg) required on schedule page 4 row 18');
        expect(pdfData.errors[20]).toBe('Place of unloading required on schedule page 4 row 18');

        expect(pdfData.errors[21]).toBe('Storage facility name is required on schedule page 5 row 2');
        expect(pdfData.errors[22]).toBe('Storage facility address is required on schedule page 5 row 3');
    });
});

const facility1 = {
    "facilityName": "fac1",
    "facilityAddress": "address1"
};

const facility20 = {
    "facilityName": "fac20",
    "facilityAddress": "address20"
};

const facility21 = {
    "facilityName": "fac21",
    "facilityAddress": "address21"
};

const catch1 = {
    "product": "fish1",
    "commodityCode": "prod1",
    "certificateNumber": "cc1",
    "productWeight": "1",
    "dateOfUnloading": "1/8/2019",
    "placeOfUnloading": "Jarrow1",
    "transportUnloadedFrom": "Car1"
};

const catch4 = {
    "product": "fish4",
    "commodityCode": "prod4",
    "certificateNumber": "cc4",
    "productWeight": "4",
    "dateOfUnloading": "1/8/2019",
    "placeOfUnloading": "Jarrow4",
    "transportUnloadedFrom": "Car4"
};

const catch7 = {
    "product": "fish7",
    "commodityCode": "prod7",
    "certificateNumber": "cc7",
    "productWeight": "7",
    "dateOfUnloading": "1/8/2019",
    "placeOfUnloading": "Jarrow7",
    "transportUnloadedFrom": "Car7"
};

const catch17 = {
    "product": "fish17",
    "commodityCode": "prod17",
    "certificateNumber": "cc17",
    "productWeight": "17",
    "dateOfUnloading": "2/8/2019",
    "placeOfUnloading": "Jarrow17",
    "transportUnloadedFrom": "Car17"
};

const catch18 = {
    "product": "fish18",
    "commodityCode": "prod18",
    "certificateNumber": "cc18",
    "productWeight": "18",
    "dateOfUnloading": "2/8/2019",
    "placeOfUnloading": "Jarrow18",
    "transportUnloadedFrom": "Car18"
};

const catch35 = {
    "product": "fish35",
    "commodityCode": "prod35",
    "certificateNumber": "cc35",
    "productWeight": "35",
    "dateOfUnloading": "4/8/2019",
    "placeOfUnloading": "Jarrow35",
    "transportUnloadedFrom": "Car35"
};

const catch36 = {
    "product": "fish36",
    "commodityCode": "prod36",
    "certificateNumber": "cc36",
    "productWeight": "36",
    "dateOfUnloading": "4/8/2019",
    "placeOfUnloading": "Jarrow36",
    "transportUnloadedFrom": "Car36"
};

const catch53 = {
    "product": "fish53",
    "commodityCode": "prod53",
    "certificateNumber": "cc53",
    "productWeight": "53",
    "dateOfUnloading": "6/8/2019",
    "placeOfUnloading": "Jarrow53",
    "transportUnloadedFrom": "Car53"
};