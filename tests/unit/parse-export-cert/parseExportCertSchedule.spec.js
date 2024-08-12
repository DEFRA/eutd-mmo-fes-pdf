const {parsePdfBuffer} = require('../../../src/pdf/pdfParser');
const fs = require('fs');
const muhammara = require('muhammara');

describe('parseExportCert', () => {

    jest.setTimeout(60000);

    test('should parse pdf', async () => {
        let data = fs.readFileSync('./tests/unit/parse-export-cert/fixtures/parse-export-certs-schedule.pdf');
        let pdfData = await parsePdfBuffer(data);
        expect(pdfData.documentNumber).toBe('GBR-2019-CM-E3A3A25DA');
        expect(pdfData.errors.length).toBe(0);

        expect(pdfData.exportPayload.items.length).toBe(42);
        expect(pdfData.exportPayload.items[0].product).toEqual(product1);
        expect(pdfData.exportPayload.items[0].landings[0].model).toEqual(landing1);
        expect(pdfData.exportPayload.items[1].product).toEqual(product2);
        expect(pdfData.exportPayload.items[1].landings[0].model).toEqual(landing2);
        expect(pdfData.exportPayload.items[14].product).toEqual(product15);
        expect(pdfData.exportPayload.items[14].landings[0].model).toEqual(landing15);
        expect(pdfData.exportPayload.items[26].product).toEqual(product27);
        expect(pdfData.exportPayload.items[26].landings[0].model).toEqual(landing27);
        expect(pdfData.exportPayload.items[41].product).toEqual(product42);
        expect(pdfData.exportPayload.items[41].landings[0].model).toEqual(landing42);
    });

    test('invalid catch details', async () => {
        let data = fs.readFileSync('./tests/unit/parse-export-cert/fixtures/export-certs-schedule-invalid.pdf');
        let pdfData = await parsePdfBuffer(data);
        expect(pdfData.errors.length).toBe(18);
        expect(pdfData.errors[0]).toBe('Presentation required on schedule page 1 row 1');
        expect(pdfData.errors[1]).toBe('Dates landed required on schedule page 1 row 1');
        expect(pdfData.errors[2]).toBe('Vessel name is required on schedule page 1 row 1');
        expect(pdfData.errors[3]).toBe('IMO / Lloyd’s number is required on schedule page 1 row 1');
        expect(pdfData.errors[4]).toBe('Species required on schedule page 1 row 2');
        expect(pdfData.errors[5]).toBe('Product code required on schedule page 1 row 2');
        expect(pdfData.errors[6]).toBe('Consigned weight (kg) required on schedule page 1 row 2');
        expect(pdfData.errors[7]).toBe('PLN / Call Sign is required on schedule page 1 row 2');
        expect(pdfData.errors[8]).toBe('Fishing licence number is required on schedule page 1 row 2');
        expect(pdfData.errors[9]).toBe('Species required on schedule page 2 row 1');
        expect(pdfData.errors[10]).toBe('Product code required on schedule page 2 row 1');
        expect(pdfData.errors[11]).toBe('Consigned weight (kg) required on schedule page 2 row 1');
        expect(pdfData.errors[12]).toBe('PLN / Call Sign is required on schedule page 2 row 1');
        expect(pdfData.errors[13]).toBe('Fishing licence number is required on schedule page 2 row 1');
        expect(pdfData.errors[14]).toBe('Presentation required on schedule page 2 row 2');
        expect(pdfData.errors[15]).toBe('Dates landed required on schedule page 2 row 2');
        expect(pdfData.errors[16]).toBe('Vessel name is required on schedule page 2 row 2');
        expect(pdfData.errors[17]).toBe('IMO / Lloyd’s number is required on schedule page 2 row 2');
    });

});

const product1 = {
    "commodityCode": "pc1",
    "species": {
        "label": "cod"
    },
    "presentation": {
        "label": "frozen"
    }
};

const landing1 = {
    "faoArea": "FAO1",
    "dateLanded": "1/8/1971",
    "exportWeight": "100",
    "vessel": {
        "pln": "M1",
        "vesselName": "Grace1",
        "licenceNumber": "L001",
        "imoNumber": "IMO1",
        "label": "Grace1"
    }
};

const product2 = {
    "commodityCode": "pc2",
    "species": {
        "label": "haddock"
    },
    "presentation": {
        "label": "chilled"
    }
};

const landing2 = {
    "faoArea": "FAO2",
    "dateLanded": "2/8/1971",
    "exportWeight": "101",
    "vessel": {
        "pln": "M2",
        "vesselName": "Grace2",
        "licenceNumber": "L002",
        "imoNumber": "IMO2",
        "label": "Grace2"
    }
};

const product15 = {
    "commodityCode": "pc15",
    "species": {
        "label": "brillfish"
    },
    "presentation": {
    "label": "bleached"
    }
}

const landing15 = {
    "faoArea": "FAO15",
    "dateLanded": "15/8/1971",
    "exportWeight": "14",
    "vessel": {
        "pln": "M15",
        "vesselName": "Matthew1",
        "licenceNumber": "L015",
        "imoNumber": "IMO15",
        "label": "Matthew1"
    }
};

const product27 = {
    "commodityCode": "pc27",
    "species": {
        "label": "blanketfish"
    },
    "presentation": {
        "label": "filleted"
    }
};

const landing27 = {
    "faoArea": "FAO27",
    "dateLanded": "27/8/1971",
    "exportWeight": "26",
    "vessel": {
        "pln": "M27",
        "vesselName": "Matthew13",
        "licenceNumber": "L027",
        "imoNumber": "IMO27",
        "label": "Matthew13"
    }
};

const product42 = {
    "commodityCode": "pc42",
    "species": {
        "label": "shark"
    },
    "presentation": {
        "label": "finned"
    }
};

const landing42 = {
    "faoArea": "FAO42",
    "dateLanded": "11/9/1971",
    "exportWeight": "41",
    "vessel": {
        "pln": "M42",
        "vesselName": "Grace",
        "licenceNumber": "L042",
        "imoNumber": "IMO42",
        "label": "Grace"
    }
}
