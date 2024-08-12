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
    return fs.createWriteStream('./tests/unit/blank-processing-statements/output/pdfService.pdf');
};

describe('pdfService', () => {

    jest.setTimeout(60000);

    test('should create the expected pdf', async () => {
        const mockCreateContainer = jest.spyOn(blobManager, 'createContainer');
        mockCreateContainer.mockResolvedValue(undefined);

        const mockWriteStreamForBlob = jest.spyOn(blobManager, 'writeStreamForBlob');
        mockWriteStreamForBlob.mockResolvedValue(mockedStream);

        const container = 'export-certificates';

        const data = {
            documentNumber: "GBR-2018-PM-1C89DE54F"
        };

        const responseJson = await pdfService.generatePdfAndUpload(container, pdfType.BLANK_PROC_STMNT,
            data, true, { getStream: getTestStream },data.documentNumber ,'./src/resources/');

        expect(responseJson).toBeTruthy();
    })
});