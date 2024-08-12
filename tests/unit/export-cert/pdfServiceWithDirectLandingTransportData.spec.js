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

const getTestStream = function (principalId, blobName) {
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
                "exporterFullName": "Hank Marvin",
                "exporterCompanyName": "Marvin Molluscs",
                "addressOne": "Fish Quay",
                "addressTwo": "Next Line",
                "townCity": "Seaham",
                "postcode": "SE1 1EA"
            },
            species:
                [{
                    "user_id": "219d28a3-cb1d-46cc-b96a-b2d53fc791c6",
                    "id": "805728ba-fd0f-4733-ad7d-419bf047559c",
                    "species": "Atlantic cod (COD)",
                    "speciesCode": "COD",
                    "state": "FRO",
                    "presentation": "FIL",
                    "commodity_code": "03036310"
                }],
            catches:
                [{
                    "id": "3f2984d8-a6bd-4dee-b782-19edffc843ba",
                    "user_id": "219d28a3-cb1d-46cc-b96a-b2d53fc791c6",
                    "species": "Atlantic cod (COD)",
                    "species_id": "805728ba-fd0f-4733-ad7d-419bf047559c",
                    "weight": 202,
                    "state": "FRO",
                    "presentation": "FIL",
                    "commodity_code": "03036310",
                    "pln": "PLN001",
                    "vessel": "VERTROUWEN (DS11)",
                    "date": "02/10/2018",
                    "homePort": "KIRKCUDBRIGHT",
                    "registrationNumber": "B10005",
                    "licenceNumber": "44242",
                    "catchArea": "FAO27"
                }],
            transport: {
                "departurePlace": "Calais",
                "vehicle": "directLanding",
                "user_id": "219d28a3-cb1d-46cc-b96a-b2d53fc791c6"
            },
            conservation: {
                "conservationReference": "Common fisheries policy",
                "user_id": "219d28a3-cb1d-46cc-b96a-b2d53fc791c6"
            },
            processingStatement: {
                "landings": [{}],
                "processingPlants": [{}]
            }
        };

        const responseJson = await pdfService.generatePdfAndUpload(principalId, pdfType.EXPORT_CERT,
                data, false, { getStream: getTestStream });

        expect(responseJson).toBeTruthy();

    })
});