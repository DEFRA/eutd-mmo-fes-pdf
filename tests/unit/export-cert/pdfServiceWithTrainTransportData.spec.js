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
                    "vessel": "GOLDEN BELLS 11",
                    "date": "09/10/2018",
                    "weight": 25,
                    "pln": "PLN001",
                    "species": "Atlantic cod (COD)",
                    "species_id": "4a5a5b9a-a505-4101-afa1-6603fe057a80",
                    "commodity_code": "03036330",
                    "state": "FRO",
                    "presentation": "BMS",
                    "id": "ffbad53d-4d36-4bb6-8d11-e706a3927ba8",
                    "user_id": "a9602f38-f220-475a-991f-a19626bc51ae",
                    "homePort": "Fraserburgh",
                    "registrationNumber": "1234567890",
                    "licenceNumber": "0987654321",
                    "catchArea": "FAO27"
                },
                {
                    "vessel": "ZARA ANNABEL",
                    "date": "29/10/2018",
                    "weight": 30,
                    "pln": "PLN001",
                    "species": "Atlantic cod (COD)",
                    "species_id": "4a5a5b9a-a505-4101-afa1-6603fe057a80",
                    "commodity_code": "03036330",
                    "state": "FRO",
                    "presentation": "BMS",
                    "id": "364c66b8-1405-4cd7-9d7c-da60d3e5d9e2",
                    "user_id": "a9602f38-f220-475a-991f-a19626bc51ae",
                    "homePort": "Berwick",
                    "registrationNumber": "2345678901",
                    "licenceNumber": "9876543210",
                    "catchArea": "FAO27"
                },
                {
                    "vessel": "GOLDEN BELLS 11",
                    "date": "30/10/2018",
                    "weight": 34,
                    "pln": "PLN001",
                    "species": "Dwarf codling (AIM)",
                    "species_id": "69b4f9c2-2744-429f-8a68-7f337d2cef2c",
                    "commodity_code": "03036330",
                    "state": "BOI",
                    "presentation": "DWT",
                    "id": "ffbad53d-4d36-4bb6-8d11-e706a3927ba8",
                    "user_id": "a9602f38-f220-475a-991f-a19626bc51ae",
                    "homePort": "Fraserburgh",
                    "registrationNumber": "1234567890",
                    "licenceNumber": "0987654321",
                    "catchArea": "FAO27"
                },
                {
                    "vessel": "ZARA ANNABEL",
                    "date": "04/11/2018",
                    "weight": 10,
                    "pln": "PLN001",
                    "species": "Golden damselfish (ADH)",
                    "species_id": "11c39dd9-9814-42a5-931e-4e6108cdc03b",
                    "commodity_code": "03036330",
                    "state": "ALI",
                    "presentation": "WHL",
                    "id": "364c66b8-1405-4cd7-9d7c-da60d3e5d9e2",
                    "user_id": "a9602f38-f220-475a-991f-a19626bc51ae",
                    "homePort": "Berwick",
                    "registrationNumber": "2345678901",
                    "licenceNumber": "9876543210",
                    "catchArea": "FAO27"
                }
            ],
            transport: {
                "vehicle": "train",
                "departurePlace": "Grimsby",
                "user_id": "a9602f38-f220-475a-991f-a19626bc51ae",
                "railwayBillNumber": "123123123123",
                "containerIdentificationNumber": "TRAIN-001, TRAIN-002",
                "exportedTo": {
                    "officialCountryName": 'France',
                }
            },
            conservation: {
                "conservationReference": "Other",
                "anotherConservation": "Aussie conservation policy"
            }
        };

        const responseJson = await pdfService.generatePdfAndUpload(principalId, pdfType.EXPORT_CERT,
            data, false, { getStream: getTestStream });

        expect(responseJson).toBeTruthy();

    })
});