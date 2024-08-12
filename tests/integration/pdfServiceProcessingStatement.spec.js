const pdfService = require('../../src/pdfService');
const blobManager = require('../../src/storage/blobManager');
const { pdfType } = require('../../src/pdf/pdfRenderer');

const { PassThrough } = require('stream');
const mockedStream = new PassThrough();

mockedStream.on('data', (d) => {
});

mockedStream.on('end', function() {
});

mockedStream.emit('data', 'hello world');
mockedStream.end();
mockedStream.destroy();

describe('pdfServiceExportCert', () => {
    test('should create the expected pdf', async () => {
        const mockCreateContainer = jest.spyOn(blobManager, 'createContainer');
        mockCreateContainer.mockResolvedValue(undefined);
        const mockWriteStreamForBlob = jest.spyOn(blobManager, 'writeStreamForBlob');
        mockWriteStreamForBlob.mockResolvedValue(mockedStream);
        const principalId = '527fb0dd-b1d7-46c8-bfed-e06b373d041c';

        const data = {
            exporter: {
                'exporterFullName': 'Jim Jessop',
                'exporterCompanyName': 'FishByMail Ltd',
                'addressOne': '77 Coast Road',
                'addressTwo': '',
                'townCity': 'Jarrow',
                'postcode': 'NE31 1YW'
            },
            catches: [
                {
                    "vessel": "GLAD TIDINGS VII",
                    "date": "14/09/2018",
                    "weight": 55,
                    "pln": "PLN001",
                    "species": "Atlantic cod",
                    "species_id": "234a38ac-f041-49b4-9245-0eae5462805e",
                    "commodity_code": "30363300",
                    "state": "ALI",
                    "presentation": "CLA",
                },
                {
                    "vessel": "GLAD TIDINGS III",
                    "date": "27/09/2018",
                    "weight": 950,
                    "pln": "PLN001",
                    "species": "Atlantic herring",
                    "species_id": "234a38ac-f041-49b4-9245-0eae5462805e",
                    "commodity_code": "30363359",
                    "state": "FRS",
                    "presentation": "CAT",
                },
                {
                    "vessel": "OCEAN BOUNTY",
                    "date": "04/10/2018",
                    "weight": 77,
                    "pln": "PLN001",
                    "species": "Ling",
                    "species_id": "234a38ac-f041-49b4-9245-0eae5462805e",
                    "commodity_code": "30363350",
                    "state": "DRI",
                    "presentation": "CLA",
                }
            ],
            transport: {
                "vehicle": "plane",
                "departurePlace": "hull",
                "user_id": "a9602f38-f220-475a-991f-a19626bc51ae",
                "flightNumber": "123",
                "containerNumber": "456"
            }
        };

        const blobName = `${(new Date()).getTime().toString()}.pdf`;
        const responseJson = await pdfService.generatePdfAndUpload(principalId, pdfType.PROCESSING_STATEMENT, data, false,{ getStream: pdfService.getAzureBlobStream });
        expect(responseJson).toBeTruthy();
    })
});