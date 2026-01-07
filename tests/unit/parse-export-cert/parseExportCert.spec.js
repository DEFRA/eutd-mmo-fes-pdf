const {parsePdfBuffer} = require('../../../src/pdf/pdfParser');
const { parseTransport } = require('../../../src/pdf/parseExportCert');
const fs = require('fs');

describe('parseTransport', () => {
    it('should map Point of destination to transport.exportedTo.pointOfDestination', () => {
        const pointOfDestination = 'Rotterdam';
        const raw = {
            'Point of destination': pointOfDestination
        };
        const transport = parseTransport(raw);
        expect(transport.exportedTo.pointOfDestination).toBe(pointOfDestination);
    });
});

describe('parseExportCert', () => {

    jest.setTimeout(60000);

    test('should parse pdf', async () => {
        let data = fs.readFileSync('./tests/unit/parse-export-cert/fixtures/parse-export-certs.pdf');
        let pdfData = await parsePdfBuffer(data);
        expect(pdfData.documentNumber).toBe('GBR-2019-CM-EA35698BF');
        expect(pdfData.errors.length).toBe(0);

        expect(pdfData.transport.vehicle).toBe('containerVessel');
        expect(pdfData.transport.flightNumber).toBe('FlightNumber');
        expect(pdfData.transport.registrationNumber).toBe('RegNumber');
        expect(pdfData.transport.railwayBillNumber).toBe('RailwayBillNumber');
        expect(pdfData.transport.freightBillNumber).toBe('FreightBillNumber');
        expect(pdfData.transport.vesselName).toBe('VesselNameAndFlag');
        expect(pdfData.transport.departurePlace).toBe('PointOfDeparture');
        expect(pdfData.transport.containerNumber).toBe('container 1, container 2');
        expect(pdfData.transport.otherDocuments).toBe('OtherTransportDocs');
        expect(pdfData.transport.exporterName).toBe('Mark');

        expect(pdfData.exportPayload.items.length).toBe(2);
        expect(pdfData.exportPayload.items[0].product).toEqual(product1);
        expect(pdfData.exportPayload.items[0].landings[0].model).toEqual(landing1);
        expect(pdfData.exportPayload.items[1].product).toEqual(product2);
        expect(pdfData.exportPayload.items[1].landings[0].model).toEqual(landing2);
    });

    test('invalid exporter', async () => {
        let data = fs.readFileSync('./tests/unit/parse-export-cert/fixtures/export-certs-invalid-exporter.pdf');
        let pdfData = await parsePdfBuffer(data);
        expect(pdfData.errors.length).toBe(2);
        expect(pdfData.errors[0]).toBe('Name of master or representative (exporter) required');
        expect(pdfData.errors[1]).toBe('Exporter name and address required');
    });

    test('invalid vessel', async () => {
        let data = fs.readFileSync('./tests/unit/parse-export-cert/fixtures/export-certs-invalid-single-vessel.pdf');
        let pdfData = await parsePdfBuffer(data);
        expect(pdfData.errors.length).toBe(3);
        expect(pdfData.errors[0]).toBe('Vessel name is required');
        expect(pdfData.errors[1]).toBe('Vessel Call Sign / PLN is required');
        expect(pdfData.errors[2]).toBe('Fishing licence number is required');
    });

    test('no catch details', async () => {
        let data = fs.readFileSync('./tests/unit/parse-export-cert/fixtures/export-certs-empty-catch.pdf');
        let pdfData = await parsePdfBuffer(data);
        expect(pdfData.errors.length).toBe(1);
        expect(pdfData.errors[0]).toBe('No export items listed');
    });

    test('invalid catch details', async () => {
        let data = fs.readFileSync('./tests/unit/parse-export-cert/fixtures/export-certs-invalid-catch.pdf');
        let pdfData = await parsePdfBuffer(data);
        expect(pdfData.errors.length).toBe(4);
        expect(pdfData.errors[0]).toBe('Species required on row 1');
        expect(pdfData.errors[1]).toBe('Estimated weight to be landed (kg) required on row 1');
        expect(pdfData.errors[2]).toBe('Product code required on row 2');
        expect(pdfData.errors[3]).toBe('Dates landed required on row 2');
    });

    test('invalid transport', async () => {
        let data = fs.readFileSync('./tests/unit/parse-export-cert/fixtures/export-certs-invalid-transport.pdf');
        let pdfData = await parsePdfBuffer(data);
        expect(pdfData.errors.length).toBe(1);
        expect(pdfData.errors[0]).toBe('Place of departure is required');
    });

    test('invalid dates', async () => {
        let data = fs.readFileSync('./tests/unit/parse-export-cert/fixtures/export-certs-invalid-dates.pdf');
        let pdfData = await parsePdfBuffer(data);
        expect(pdfData.errors.length).toBe(2);
        expect(pdfData.errors[0]).toBe('Date of acceptance is required');
        expect(pdfData.errors[1]).toBe('Date issued is required');
    });

    test('double entry', async () => {
        let data = fs.readFileSync('./tests/unit/parse-export-cert/fixtures/export-certs-double-entry.pdf');
        let pdfData = await parsePdfBuffer(data);
        expect(pdfData.errors.length).toBe(1);
        expect(pdfData.errors[0]).toBe('Export payload details have been added to both the front page and the schedule');
    });

});

const product1 = {
    "commodityCode": "PC111111",
        "species": {
        "label": "Cod"
    }
}

const product2 = {
    "commodityCode": "PC222222",
    "species": {
        "label": "Haddock"
    }
}

const landing1 = {
    "faoArea": "FAO27",
    "dateLanded": "12/3/2019",
    "exportWeight": "23",
    "vessel": {
        "pln": "My Callsign",
        "vesselName": "My Fishing Vessel",
        "flag": "My Home Port",
        "licenceNumber": "MYFLNO",
        "imoNumber": "MY IMO",
        "licenceValidTo": "12/2/2209",
        "label": "My Fishing Vessel",
        "contact": "MyEmailAddress",
        "gearCode": "My Fishing Gear"
    }
}

const landing2 = {
    "faoArea": "FAO27",
    "dateLanded": "12/3/2019",
    "exportWeight": "22",
    "vessel": {
        "pln": "My Callsign",
        "vesselName": "My Fishing Vessel",
        "flag": "My Home Port",
        "licenceNumber": "MYFLNO",
        "imoNumber": "MY IMO",
        "licenceValidTo": "12/2/2209",
        "label": "My Fishing Vessel",
        "contact": "MyEmailAddress",
        "gearCode": "My Fishing Gear",
    }
}
