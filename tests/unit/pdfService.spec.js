const fs = require('fs');
const { pdfType } = require('../../src/pdf/pdfRenderer');
const pdfService = require('../../src/pdfService');
const blobManager = require('../../src/storage/blobManager');
const { parsePdfBuffer } = require('../../src/pdf/pdfParser');

const { PassThrough } = require('stream');
const mockedStream = new PassThrough();

mockedStream.on('data', (d) => {
});

mockedStream.on('end', function() {
});

mockedStream.emit('data', 'hello world');
mockedStream.end();
mockedStream.destroy();

const testGetStream = function(principalId, blobName) {
  return fs.createWriteStream('./tests/unit/blank-export-cert/output/pdfService.pdf');
};

const testGetStreamThrowsError = function() {
  throw new Error('Generic fake error');
}

const fakeStream = {
  write: jest.fn(() => {}),
  end: jest.fn(() => {})
}

const spyGetTestStream = jest.fn(() => {
  return fakeStream;
});

describe('test the pdfService itself', () => {

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

  test('should delete an item from blob storage', async () => {
    const result = await pdfService.deleteBlob('asdf','asdf');
    expect(result).toEqual({"message": "Blob 'asdf' deleted"});
  });

  test('should get an azure blob stream', async () => {
    const result = await pdfService.getAzureBlobStream('asdf', 'asdf');
    expect(Object.keys(result)).toEqual(["_events", "_readableState", "_writableState", "allowHalfOpen", "_maxListeners", "_eventsCount"]);
  });
  test('should check the journey from document', async () => {
    
    const  documentNumber = "GBR-2024-CC-68B4B18A8";
    
    const result = await pdfService.getJourneyName(documentNumber);
    expect(result).toEqual('CatchCertificate');
  });
  test('should check the journey from document', async () => {
    
    const  documentNumber = "GBR-2024-SD-8E7FECD6A";
    
    const result = await pdfService.getJourneyName(documentNumber);
    expect(result).toEqual('StorageDocument');
  });
  test('should check the journey from document', async () => {
    
    const  documentNumber = "GBR-2024-PS-5B203C349";
    
    const result = await pdfService.getJourneyName(documentNumber);
    expect(result).toEqual('ProcessingStatement');
  });

  test('should generate and upload a pdf', async () => {

    const container = 'export-certificates';

    const data = {
        documentNumber: "GBR-2024-CC-68B4B18A8"
    };

    const result = await pdfService.generatePdfAndUpload(container, pdfType.BLANK_EXPORT_CERT,
        data, false, { getStream: testGetStream },data.documentNumber ,'./src/resources/');

    expect(Object.keys(result)).toEqual([
      "container", "blobName", "uri", "qrUri",
    ]);
    expect(result.blobName).toEqual('CatchCertificate-GBR-2024-CC-68B4B18A8.pdf');
    expect(result.qrUri).toEqual(`${process.env.SERVICE_URL}/qr/export-certificates/${result.blobName}`);
  });

  test('should fail to generate and upload a pdf', async () => {
    mockCreateContainer.mockRejectedValue(new Error('CreateContainerIfNotExistsError'));

    const container = 'export-certificates';

    const data = {
        documentNumber: "GBR-2018-CM-1C89DE54F"
    };

    await expect(() => pdfService.generatePdfAndUpload(container, pdfType.BLANK_EXPORT_CERT,
        data, false, { getStream: testGetStream }, './src/resources/')).rejects.toThrowError('Error: CreateContainerIfNotExistsError');
  });

  test('should upload a zip', async () => {

    const result = await pdfService.uploadZip('asdf', 'asdf', {getStream: testGetStream});
    expect(Object.keys(result)).toEqual(["container", "blobName", "uri"]);
  });

  test('should fail to upload a zip', async () => {
    mockCreateContainer.mockRejectedValue(new Error('CreateContainerIfNotExistsError'));
    await expect(pdfService.uploadZip('asdf', 'asdf', {getStream: testGetStream})).rejects.toThrowError('Error: CreateContainerIfNotExistsError');
  });

  test('should parse pdf buffer', async () => {

    const data = fs.readFileSync('./tests/unit/parse-proc-stmnt/fixtures/parse-proc-statement.pdf');
    const result = await parsePdfBuffer(data);
        
    expect(result).toEqual({
      "catches": [
        {
          "catchCertificateNumber": "GBR-2019-CC-000001",
          "exportWeightAfterProcessing": "9",
          "exportWeightBeforeProcessing": "10",
          "species": "Cod",
          "totalWeightLanded": "12",
        },
        {
          "catchCertificateNumber": "GBR-2019-CC-000002",
          "exportWeightAfterProcessing": "19",
          "exportWeightBeforeProcessing": "20",
          "species": "Haddock",
          "totalWeightLanded": "22",
        },
        {
          "catchCertificateNumber": "GBR-2019-CC-000003",
          "exportWeightAfterProcessing": "20",
          "exportWeightBeforeProcessing": "30",
          "species": "Tuna",
          "totalWeightLanded": "100",
        },
        {
          "catchCertificateNumber": "GBR-2019-CC-000004",
          "exportWeightAfterProcessing": "100",
          "exportWeightBeforeProcessing": "110",
          "species": "Shark",
          "totalWeightLanded": "120",
        },
        {
          "catchCertificateNumber": "GBR-2019-CC-000005",
          "exportWeightAfterProcessing": "180",
          "exportWeightBeforeProcessing": "190",
          "species": "Guppies",
          "totalWeightLanded": "200",
        },
      ],
      "consignmentDescription": "fish fingers with commodity code pr123432",
      "dateIssued": "12/4/2019",
      "dateOfAcceptance": "12/3/2019",
      "documentNumber": "GBR-2019-PM-5116302FA",
      "errors": [],
      "exporter": {
        "exporterAddress": "99 Jarra Road, Gateshead",
        "exporterCompanyName": "Fish Exporter",
      },
      "healthCertificateDate": "12/2/2019",
      "healthCertificateNumber": "HC0000001",
      "personResponsibleForConsignment": "Mark Ford",
      "plantAddress": "99 Lukes Lane Estate, Hennurn",
      "plantApprovalNumber": "PA000001",
      "plantName": "Fish Processor",
      "type": "Processing Statement",
    });
  });

  test('should parse pdf', async () => {

    const data = fs.readFileSync('./tests/unit/parse-proc-stmnt/fixtures/parse-proc-statement.pdf');
    const result = await pdfService.parsePdf(data);
        
    expect(result).toEqual({
      "catches": [
        {
          "catchCertificateNumber": "GBR-2019-CC-000001",
          "exportWeightAfterProcessing": "9",
          "exportWeightBeforeProcessing": "10",
          "species": "Cod",
          "totalWeightLanded": "12",
        },
        {
          "catchCertificateNumber": "GBR-2019-CC-000002",
          "exportWeightAfterProcessing": "19",
          "exportWeightBeforeProcessing": "20",
          "species": "Haddock",
          "totalWeightLanded": "22",
        },
        {
          "catchCertificateNumber": "GBR-2019-CC-000003",
          "exportWeightAfterProcessing": "20",
          "exportWeightBeforeProcessing": "30",
          "species": "Tuna",
          "totalWeightLanded": "100",
        },
        {
          "catchCertificateNumber": "GBR-2019-CC-000004",
          "exportWeightAfterProcessing": "100",
          "exportWeightBeforeProcessing": "110",
          "species": "Shark",
          "totalWeightLanded": "120",
        },
        {
          "catchCertificateNumber": "GBR-2019-CC-000005",
          "exportWeightAfterProcessing": "180",
          "exportWeightBeforeProcessing": "190",
          "species": "Guppies",
          "totalWeightLanded": "200",
        },
      ],
      "consignmentDescription": "fish fingers with commodity code pr123432",
      "dateIssued": "12/4/2019",
      "dateOfAcceptance": "12/3/2019",
      "documentNumber": "GBR-2019-PM-5116302FA",
      "errors": [],
      "exporter": {
        "exporterAddress": "99 Jarra Road, Gateshead",
        "exporterCompanyName": "Fish Exporter",
      },
      "healthCertificateDate": "12/2/2019",
      "healthCertificateNumber": "HC0000001",
      "personResponsibleForConsignment": "Mark Ford",
      "plantAddress": "99 Lukes Lane Estate, Hennurn",
      "plantApprovalNumber": "PA000001",
      "plantName": "Fish Processor",
      "type": "Processing Statement",
    });
  });

  test('should overwrite a PDF', async () => {

    await pdfService.overwritePdf('test', 'test', 'buffer', {getStream: spyGetTestStream});
    
    expect(spyGetTestStream).toHaveBeenCalled();
    expect(fakeStream.write).toHaveBeenCalled();
    expect(fakeStream.end).toHaveBeenCalled();
  });

  test('should fail to overwrite a PDF', async () => {
    mockCreateContainer.mockRejectedValue(new Error('CreateContainerIfNotExistsError'));
    await expect(pdfService.overwritePdf('test', 'test', 'buffer', {getStream: spyGetTestStream})).rejects.toThrowError('Error: CreateContainerIfNotExistsError');
  });

});