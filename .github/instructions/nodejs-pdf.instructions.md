---
description: 'Node.js PDF generation and parsing best practices for MMO FES PDF Service'
applyTo: '**/*.{js,ts}'
---

# Node.js PDF Service Best Practices for MMO FES

This instructions file applies to the mmo-ecc-pdf-svc — a PDF generation, parsing, and Azure Blob Storage service for MMO Fish Export Service documents.

## Core Principles

### 1. Service Export Pattern
Expose a clean public API through the main entry point:
```javascript
module.exports.generatePdfAndUpload = pdfService.generatePdfAndUpload;
module.exports.getAzureBlobStream = pdfService.getAzureBlobStream;
module.exports.uploadZip = pdfService.uploadZip;
module.exports.parsePdf = pdfService.parsePdf;
module.exports.overwritePdf = pdfService.overwritePdf;
module.exports.deleteBlob = pdfService.deleteBlob;
```

### 2. PDF Type Constants
Use a constant object to identify document types:
```javascript
const pdfType = {
  BLANK_STORAGE_DOC: 'Blank Storage Document',
  BLANK_PROC_STMNT: 'Blank Processing Statement',
  BLANK_EXPORT_CERT: 'Blank Export Certificate',
  EXPORT_CERT: 'Export Certificate',
  STORAGE_NOTE: 'Storage Note',
  PROCESSING_STATEMENT: 'Processing Statement'
};
```

### 3. Document Number Convention
Parse document types from the GBR document number format:
```javascript
// Pattern: GBR-YYYY-XX-[ID] where XX indicates type
// CC/CM = Catch Certificate (Export Cert)
// PS/PM = Processing Statement
// SD/SM = Storage Note (Non-Manipulation Document)
const getJourneyName = (documentNumber) => {
  const journey = documentNumber?.split("-")[2];
  if (journey === 'CC' || journey === 'CM') return 'CatchCertificate';
  if (journey === 'PS' || journey === 'PM') return 'ProcessingStatement';
  if (journey === 'SD' || journey === 'SM') return 'NonManipulationDocument';
  return 'CatchCertificate';
};
```

## PDF Generation with PDFKit

### Base Document Creation
Always create tagged, accessible PDFs:
```javascript
const PDFDocument = require('pdfkit');

const doc = new PDFDocument({
  layout: 'portrait',
  size: 'A4',
  lang: 'en_GB',
  margins: {
    top: PdfStyle.MARGIN.TOP,
    bottom: PdfStyle.MARGIN.BOT,
    left: PdfStyle.MARGIN.LEFT,
    right: PdfStyle.MARGIN.RIGHT,
  },
  pdfVersion: "1.5",
  tagged: true,           // Accessibility: Tagged PDF
  displayTitle: true,
  info: {
    Title: path.basename(uri).split`.`[0]
  }
});
```

### Accessible Structure Tags
Use PDF structure tags for screen reader compatibility:
```javascript
// Images must have alt text
doc.addStructure(doc.struct('Figure', { alt: 'QR Code' }, () => {
  doc.image(buff, startX, startY, { fit: [55, 55] });
}));

// Decorative elements use Artifact
doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
  doc.lineWidth(0.75);
  doc.moveTo(0, startY).lineTo(600, startY).dash(2, { space: 2 }).stroke('#767676');
}));

// Pagination artifacts
doc.addStructure(doc.struct('Artifact', { type: 'Pagination' }, () => {
  doc.text(page, 0, 800, { align: 'center' });
}));
```

### Tab Order Setting
Ensure logical tab order for accessibility:
```javascript
if (!doc.page.dictionary.Tabs) {
  doc.page.dictionary.data.Tabs = 'S'; // Structure order
}
```

### Style Constants
Use centralised style constants:
```javascript
const PdfStyle = {
  FONT: { REGULAR: 'Helvetica', BOLD: 'Helvetica-Bold', BOLD_ITALIC: 'Helvetica-BoldOblique' },
  FONT_SIZE: { LARGEST: 16, LARGE: 12, MEDIUM: 10, SMALL: 9, SMALLER: 8 },
  MARGIN: { LEFT: 30, RIGHT: 20, TOP: 30, BOT: 30 },
  ROW: { HEIGHT: 15 }
};
```

## PDF Parsing with Muhammara

### Buffer-Based Parsing
```javascript
const muhammara = require('muhammara');

const extractPdfText = async (data) => {
  const pdfStream = new muhammara.PDFRStreamForBuffer(data);
  const pdfReader = muhammara.createReader(pdfStream);
  // Extract pages and parse text
};
```

### Document Identification by Text Pattern
```javascript
const identifyPdf = (pdfText) => {
  // Match text structure patterns to identify document type
  if (pdfText.length === 9 && pdfText[0].length === 79) {
    const documentNumber = pdfText[0][78].text;
    const type = getType(documentNumber);
    return { documentNumber, type };
  }
};
```

## QR Code Generation

```javascript
const qr = require('qr-image');

const generateQRCode = (uri) => {
  return new Promise((resolve, reject) => {
    const stream = qr.image(uri, { type: 'PNG' });
    const data = [];

    stream.on('data', (chunk) => data.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(data)));
    stream.on('error', (e) => reject(e));
  });
};
```

## Azure Blob Storage Patterns

### Stream-Based Upload
```javascript
const { BlobServiceClient } = require('@azure/storage-blob');
const { PassThrough } = require('stream');

const writeStreamForBlob = async (containerName, blobName) => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(config.GET_CONNECTION_STR);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const stream = new PassThrough();

  blockBlobClient.uploadStream(stream)
    .catch(err => stream.emit('error', err));

  return stream;
};
```

### Container Management
```javascript
const createContainer = async (containerName) => {
  const blobServiceClient = getBlobServiceClient();
  const containerClient = blobServiceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists();
};
```

### Blob Deletion
```javascript
const deleteBlob = async (containerName, blobName) => {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.deleteIfExists();
};
```

## Service Orchestration Pattern

### Generate, Render, and Upload Pipeline
```javascript
const generatePdfAndUpload = async (containerName, type, data, isSample,
                                     { getStream }, documentNumber, pathToTemplate) => {
  try {
    await blobManager.createContainer(containerName);
    const journey = getJourneyName(documentNumber);
    const blobName = `${journey}-${documentNumber}.pdf`;
    const sasJson = generate(containerName, blobName);

    const stream = await getStream(containerName, blobName);
    renderPdf(type, data, isSample, sasJson.qrUri, stream, pathToTemplate);

    return sasJson;
  } catch (e) {
    throw new Error(e);
  }
};
```

## Environment Configuration

```javascript
require('dotenv').config();

const config = {
  GET_CONNECTION_STR: process.env.AZURE_STORAGE_CONNECTION_STRING ||
                      process.env.BLOB_STORAGE_CONNECTION,
  azureStorageProxyUrl: process.env.AZURE_STORAGE_PROXY_URL,
  SERVICE_URL: process.env.SERVICE_URL
};
```

## Testing Best Practices

### Mock Blob Storage with PassThrough Streams
```javascript
const { PassThrough } = require('stream');

beforeEach(() => {
  mockCreateContainer = jest.spyOn(blobManager, 'createContainer');
  mockWriteStreamForBlob = jest.spyOn(blobManager, 'writeStreamForBlob');
  mockDeleteBlob = jest.spyOn(blobManager, 'deleteBlob');

  mockCreateContainer.mockResolvedValue(undefined);
  mockWriteStreamForBlob.mockResolvedValue(new PassThrough());
  mockDeleteBlob.mockResolvedValue({ message: "Blob deleted" });
});
```

### Coverage Thresholds
- Branches: 90%
- Functions: 90%
- Lines: 90%
- Statements: 90%

## Security Considerations

- Store blob storage connection strings in environment variables
- Use SAS tokens for time-limited blob access
- Never embed credentials in generated PDFs
- Sanitize all text content before rendering into PDFs to prevent injection
