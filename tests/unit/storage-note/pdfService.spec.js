const pdfService = require('../../../src/pdfService');
const { pdfType } = require('../../../src/pdf/pdfRenderer');
const blobManager = require('../../../src/storage/blobManager');
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

    let mockCreateContainer;
    let mockWriteStreamForBlob;
    let mockDeleteBlob;
  
    beforeEach(() => {
      mockCreateContainer = jest.spyOn(blobManager, 'createContainer');
      mockWriteStreamForBlob = jest.spyOn(blobManager, 'writeStreamForBlob');
      mockDeleteBlob = jest.spyOn(blobManager, 'deleteBlob');
  
      mockCreateContainer.mockResolvedValue(undefined);
      mockWriteStreamForBlob.mockResolvedValue(mockedStream);
      mockDeleteBlob.mockResolvedValue({"message": "Blob 'asdf' deleted"});
    })
  
    afterEach(() => {
      mockCreateContainer.mockRestore();
      mockWriteStreamForBlob.mockRestore();
      mockDeleteBlob.mockRestore();
    })
  

    test('should create the expected pdf', async () => {

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
                    productWeight: 200,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                }
            ],
            storageFacilities: [
                {
                    facilityName: 'Test Processor 1',
                    facilityAddressOne: '20',
                    facilityAddressTwo: '',
                    facilityTownCity: 'Town',
                    facilityPostcode: 'test',
                    storedAs: "chilled"
                }
            ],
            transport: {
                "vehicle": "train",
                "departurePlace": "HULL",
                "stationName": "LONDON",
                "railwayBillNumber": "E11111E",
                "exportDate": "31/01/2018"
            }
        };

        const responseJson = await pdfService.generatePdfAndUpload(principalId, pdfType.STORAGE_NOTE,
            data, false, { getStream: getTestStream });

        expect(responseJson).toBeTruthy();

        const responseJson2 = await pdfService.generatePdfAndUpload(principalId, pdfType.STORAGE_NOTE,
            data, true, { getStream: getTestStream });

        expect(responseJson2).toBeTruthy();

    });

    test('Should create the expected PDF with container vessel transport types', async () => {

        const principalId = '527fb0dd-b1d7-46c8-bfed-e06b373d041c';

        let data = {
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
                    productWeight: 200,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                }
            ],
            storageFacilities: [
                {
                    facilityName: 'Test Processor 1',
                    facilityAddressOne: '20',
                    facilityAddressTwo: '',
                    facilityTownCity: 'Town',
                    facilityPostcode: 'test',
                    storedAs: "chilled"
                }
            ],
            transport: {
                vehicle: 'CONTAINERVESSEL',
                vesselName: 'test',
                flagState: 'test',    
            }
        };

        const responseJson = await pdfService.generatePdfAndUpload(principalId, pdfType.STORAGE_NOTE,
            data, false, { getStream: getTestStream });

        expect(responseJson).toBeTruthy();
    
    });

    test('Should create the expected PDF with direct landing transport type', async () => {

        const principalId = '527fb0dd-b1d7-46c8-bfed-e06b373d041c';

        let data = {
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
                    productWeight: 200,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami',
                    vessel: 'test',
                    pln: 'test',
                }
            ],
            storageFacilities: [
                {
                    facilityName: 'Test Processor 1',
                    facilityAddressOne: '20',
                    facilityAddressTwo: '',
                    facilityTownCity: 'Town',
                    facilityPostcode: 'test',
                    storedAs: "chilled"
                }
            ],
            transport: {
                vehicle: 'DIRECTLANDING',
                vesselName: 'test',
                flagState: 'test',
            }
        };

        const responseJson = await pdfService.generatePdfAndUpload(principalId, pdfType.STORAGE_NOTE,
            data, false, { getStream: getTestStream });

        expect(responseJson).toBeTruthy();
    
    });

    test('Should create the expected PDF with truck transport type', async () => {

        const principalId = '527fb0dd-b1d7-46c8-bfed-e06b373d041c';

        let data = {
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
                    productWeight: 200,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                }
            ],
            storageFacilities: [
                {
                    facilityName: 'Test Processor 1',
                    facilityAddressOne: '20',
                    facilityAddressTwo: '',
                    facilityTownCity: 'Town',
                    facilityPostcode: 'test',
                    storedAs: "chilled"
                }
            ],
            transport: {
                vehicle: 'TRUCK',
                nationalityOfVehicle: 'test',
                registrationNumber: 'test',
            }
        };

        const responseJson = await pdfService.generatePdfAndUpload(principalId, pdfType.STORAGE_NOTE,
            data, false, { getStream: getTestStream });

        expect(responseJson).toBeTruthy();

    });

});
