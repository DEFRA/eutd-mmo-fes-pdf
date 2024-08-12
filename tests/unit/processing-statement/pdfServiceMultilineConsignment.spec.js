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
				}
			],
			"consignmentDescription": "line one\nline two\nline three\nline four",
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
            data, false, { getStream: getTestStream });

        expect(responseJson).toBeTruthy();

    })
});