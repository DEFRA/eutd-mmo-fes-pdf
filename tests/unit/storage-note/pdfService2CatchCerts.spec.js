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

describe('pdfService', () => {

    jest.setTimeout(60000);

    test('should create the expected pdf', async () => {
        const mockCreateContainer = jest.spyOn(blobManager, 'createContainer');
        mockCreateContainer.mockResolvedValue(undefined);

        const mockWriteStreamForBlob = jest.spyOn(blobManager, 'writeStreamForBlob');
        mockWriteStreamForBlob.mockResolvedValue(mockedStream);

        const principalId = '527fb0dd-b1d7-46c8-bfed-e06b373d041c';

        const data = {
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
                },
                {
                    product: 'White fish tails',
                    commodityCode: '012126',
                    certificateNumber: 'GBR-2018-SD-3456789012345678901234567890123456789002',
                    productWeight: 40,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                }
            ],
            transport: {
                "vehicle": "plane",
                "departurePlace": "hull",
                "flightNumber": "123",
                "containerNumber": "456",
                "exportDate": "31/01/2018"
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
            exportDate: "31/01/2018",
            exportedTo: {
                officialCountryName: 'France',
            }
        };

        const responseJson = await pdfService.generatePdfAndUpload(principalId, pdfType.STORAGE_NOTE,
            data, false, { getStream: getTestStream });

        expect(responseJson).toBeTruthy();

    })
});
