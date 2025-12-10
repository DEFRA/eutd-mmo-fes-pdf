const pdfService = require('../../../src/pdfService');
const blobManager = require('../../../src/storage/blobManager');
const { pdfType } = require('../../../src/pdf/pdfRenderer');
const fs = require('fs');

const { PassThrough } = require('stream');
const mockedStream = new PassThrough();

mockedStream.on('data', (d) => {
});

mockedStream.on('end', function() {
});

mockedStream.emit('data', 'hello world');
mockedStream.end();
mockedStream.destroy();

const getTestStream = function(principalId, blobName) {
    return fs.createWriteStream('./tests/test.pdf');
}

const createBaseData = (transportOverrides = {}) => ({
    documentNumber: "GBR-2018-SD-1C89DE54F",
    exporter: {
        'exporterFullName': 'Jim Jessop',
        'exporterCompanyName': 'FishByMail Ltd',
        'addressOne': '77 Coast Road',
        'addressTwo': 'My address is particularly long',
        'townCity': 'Jarrow',
        'postcode': 'NE31 1YW'
    },
    catches: [
        {
            product: 'cod',
            commodityCode: '0123456',
            certificateNumber: 'GBR-2018-SD-3456789012345678901234567890123456789001',
            productWeight: 30,
            dateOfUnloading: '01/02/2018',
            placeOfUnloading: 'Jarrow',
            transportUnloadedFrom: 'MK-0547, Saami'
        }
    ],
    transport: {
        "exportDate": "31/01/2018",
        "departurePlace": "Hull",
        ...transportOverrides
    },
    arrivalTransport: {
        "vehicle": "plane",
        "departurePlace": "hull",
        "flightNumber": "123",
        "containerNumber": "456",
        "exportDate": "31/01/2018"
    },
    facilityName: 'Test Processor 1',
    facilityAddressOne: '20',
    facilityAddressTwo: '',
    facilityTownCity: 'Town',
    facilityPostcode: 'test',
    storedAs: "chilled",
    facilityArrivalDate: '20/10/2025',
    exportDate: "31/01/2018"
});

describe('pdfService - Point of Destination (FI0-10314)', () => {

    jest.setTimeout(60000);

    beforeEach(() => {
        jest.spyOn(blobManager, 'createContainer').mockResolvedValue(undefined);
        jest.spyOn(blobManager, 'writeStreamForBlob').mockResolvedValue(mockedStream);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const principalId = '527fb0dd-b1d7-46c8-bfed-e06b373d041c';

    test('should use transport.pointOfDestination for truck transport', async () => {
        const data = createBaseData({
            vehicle: 'truck',
            registrationNumber: 'ABC123',
            freightBillNumber: 'FB456',
            pointOfDestination: 'Rotterdam Port'
        });

        const responseJson = await pdfService.generatePdfAndUpload(principalId, pdfType.STORAGE_NOTE,
            data, false, { getStream: getTestStream });

        expect(responseJson).toBeTruthy();
    });

    test('should use transport.pointOfDestination for plane transport', async () => {
        const data = createBaseData({
            vehicle: 'plane',
            flightNumber: 'BA123',
            airwayBillNumber: 'AWB789',
            freightBillNumber: 'FB456',
            pointOfDestination: 'Charles de Gaulle Airport'
        });

        const responseJson = await pdfService.generatePdfAndUpload(principalId, pdfType.STORAGE_NOTE,
            data, false, { getStream: getTestStream });

        expect(responseJson).toBeTruthy();
    });

    test('should use transport.pointOfDestination for train transport', async () => {
        const data = createBaseData({
            vehicle: 'train',
            railwayBillNumber: 'RB123',
            freightBillNumber: 'FB456',
            pointOfDestination: 'Paris Gare du Nord'
        });

        const responseJson = await pdfService.generatePdfAndUpload(principalId, pdfType.STORAGE_NOTE,
            data, false, { getStream: getTestStream });

        expect(responseJson).toBeTruthy();
    });

    test('should use transport.pointOfDestination for container vessel transport', async () => {
        const data = createBaseData({
            vehicle: 'containervessel',
            vesselName: 'MV Atlantic',
            flagState: 'UK',
            containerNumbers: 'CONT123, CONT456',
            pointOfDestination: 'Port of Rotterdam'
        });

        const responseJson = await pdfService.generatePdfAndUpload(principalId, pdfType.STORAGE_NOTE,
            data, false, { getStream: getTestStream });

        expect(responseJson).toBeTruthy();
    });
});
