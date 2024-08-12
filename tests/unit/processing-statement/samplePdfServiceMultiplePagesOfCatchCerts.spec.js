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
            "catches": [
                {
                    "species": "Cod",
                    "catchCertificateNumber": "CC-0000001",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Tuna",
                    "catchCertificateNumber": "CC-0000002",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Haddock",
                    "catchCertificateNumber": "CC-0000003",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Pilchard",
                    "catchCertificateNumber": "CC-0000004",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Marlin",
                    "catchCertificateNumber": "CC-0000005",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Grouper",
                    "catchCertificateNumber": "CC-0000006",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Whiting",
                    "catchCertificateNumber": "CC-0000007",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },            {
                    "species": "Cod",
                    "catchCertificateNumber": "CC-0000008",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Tuna",
                    "catchCertificateNumber": "CC-0000009",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Haddock",
                    "catchCertificateNumber": "CC-0000010",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Pilchard",
                    "catchCertificateNumber": "CC-0000011",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Marlin",
                    "catchCertificateNumber": "CC-0000012",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Grouper",
                    "catchCertificateNumber": "CC-0000013",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Whiting",
                    "catchCertificateNumber": "CC-0000014",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },            {
                    "species": "Cod",
                    "catchCertificateNumber": "CC-0000015",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Tuna",
                    "catchCertificateNumber": "CC-0000016",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Haddock",
                    "catchCertificateNumber": "CC-0000017",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Pilchard",
                    "catchCertificateNumber": "CC-0000018",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Marlin",
                    "catchCertificateNumber": "CC-0000019",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Grouper",
                    "catchCertificateNumber": "CC-0000020",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Whiting",
                    "catchCertificateNumber": "CC-0000021",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },            {
                    "species": "Cod",
                    "catchCertificateNumber": "CC-0000022",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Tuna",
                    "catchCertificateNumber": "CC-0000023",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Haddock",
                    "catchCertificateNumber": "CC-0000024",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Pilchard",
                    "catchCertificateNumber": "CC-0000025",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Marlin",
                    "catchCertificateNumber": "CC-0000026",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Grouper",
                    "catchCertificateNumber": "CC-0000027",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Whiting",
                    "catchCertificateNumber": "CC-0000028",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },            {
                    "species": "Cod",
                    "catchCertificateNumber": "CC-0000029",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Tuna",
                    "catchCertificateNumber": "CC-0000030",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Haddock",
                    "catchCertificateNumber": "CC-0000031",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Pilchard",
                    "catchCertificateNumber": "CC-0000032",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Marlin",
                    "catchCertificateNumber": "CC-0000033",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Grouper",
                    "catchCertificateNumber": "CC-0000034",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Whiting",
                    "catchCertificateNumber": "CC-0000035",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },            {
                    "species": "Cod",
                    "catchCertificateNumber": "CC-0000036",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Tuna",
                    "catchCertificateNumber": "CC-0000037",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Haddock",
                    "catchCertificateNumber": "CC-0000038",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Pilchard",
                    "catchCertificateNumber": "CC-0000039",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Marlin",
                    "catchCertificateNumber": "CC-0000040",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Grouper",
                    "catchCertificateNumber": "CC-0000041",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Whiting",
                    "catchCertificateNumber": "CC-0000042",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },            {
                    "species": "Cod",
                    "catchCertificateNumber": "CC-0000043",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Tuna",
                    "catchCertificateNumber": "CC-0000044",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Haddock",
                    "catchCertificateNumber": "CC-0000045",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Pilchard",
                    "catchCertificateNumber": "CC-0000046",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Marlin",
                    "catchCertificateNumber": "CC-0000047",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Grouper",
                    "catchCertificateNumber": "CC-0000048",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                },
                {
                    "species": "Whiting",
                    "catchCertificateNumber": "CC-0000049",
                    "totalWeightLanded": "100",
                    "exportWeightBeforeProcessing": "100",
                    "exportWeightAfterProcessing": "100"
                }
            ],
            "consignmentDescription": "A variable range of different kinds of fish frozen just in time",
            "healthCertificateNumber": "HC1232323",
            "healthCertificateDate": "31/03/2018",
            "addAnotherCatch": "notset",
            "personResponsibleForConsignment": "Mark Ford",
            "plantApprovalNumber": "CQ 613",
            "plantAddressOne": "Trevol Business Park",
            "plantAddressTwo": "Trevol Road",
            "plantTownCity": "Torpoint",
            "plantPostcode": "PL11 2TB",
            "dateOfAcceptance": "30/01/2019",
            "plantName": "Iceberg Ltd",
            "exporter": {
                'exporterFullName': 'Jim Jessop',
                'exporterCompanyName': 'FishByMail Ltd',
                'addressOne': '77 Coast Road',
                'addressTwo': 'My address is extra specially particularly long',
                'townCity': 'Jarrow',
                'postcode': 'NE31 1YW'
            },
            "documentNumber": "GBR-2019-PS-3EF51C6D8"
        };

        const responseJson = await pdfService.generatePdfAndUpload(principalId, pdfType.PROCESSING_STATEMENT,
            data, true, { getStream: getTestStream });

        expect(responseJson).toBeTruthy();

    })
});