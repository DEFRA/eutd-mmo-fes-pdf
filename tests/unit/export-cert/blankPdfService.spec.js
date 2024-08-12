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
};

describe('pdfService', () => {
    const mockCreateContainer = jest.spyOn(blobManager, 'createContainer');
    mockCreateContainer.mockResolvedValue(undefined);

    const mockWriteStreamForBlob = jest.spyOn(blobManager, 'writeStreamForBlob');
    mockWriteStreamForBlob.mockResolvedValue(mockedStream);


    jest.setTimeout(60000);

    test('should create a blank pdf', async () => {

        const containerName = 'export-certificates';
        const data = {
            isBlankTemplate: true,
            documentNumber: "GBR-2018-SD-1C89DE54F"
        };
        const responseJson = await pdfService.generatePdfAndUpload(containerName, pdfType.EXPORT_CERT,
            data, false, { getStream: getTestStream });

        expect(responseJson).toBeTruthy();

    })
});