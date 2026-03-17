---
name: develop
description: 'Expert Node.js PDF generation/parsing developer for MMO FES PDF Service. Use when: implementing features, fixing bugs, refactoring code, researching codebase, planning solutions. Covers PDFKit rendering, muhammara parsing, Azure Blob streams, QR codes.'
---

# PDF Service — Developer Skill

Expert software engineer for the MMO FES PDF Service. Reads the codebase, researches, plans, reasons, writes production-ready code for PDF generation, parsing, and Azure Blob integration.

## When to Use

- Adding new PDF document types or renderers
- Modifying PDF layout, styling, or content
- Working with PDF parsing (muhammara)
- Integrating with Azure Blob Storage
- Working with QR code generation
- Any production code writing task

## Workflow

### Before Making Changes

1. Search codebase for similar renderer patterns
2. Check `pdfService.js` for orchestration flow
3. Review PDF type constants and journey mappings
4. Understand the stream architecture (PassThrough → Blob)

### During Implementation

1. Follow all mandatory rules from the auto-loaded instruction files (`nodejs-pdf.instructions.md`, `typescript.instructions.md`)
2. Use tagged/accessible PDFs with structure tags (`Figure`, `Artifact`)
3. Never write to disk — use PassThrough streams for all I/O

### After Implementation

1. Run tests: `npm test`
2. Verify coverage thresholds
3. Check problems panel for any issues
4. Invoke the `/unit-tests` skill to write or update tests

## Project Conventions

### Document Number Convention

```
GBR-YYYY-{Type}-{ID}
  CC → Catch Certificate
  PS → Processing Statement
  SD → Storage Document
  CM → Catch Certificate (case management)
  PM → Processing Statement (case management)
  SM → Storage Document (case management)
```

### PDF Generation Pipeline

```javascript
// generatePdfAndUpload() → renderPdf() → type-specific renderer → Azure Blob
const passthrough = new PassThrough();
const doc = new PDFDocument({ tagged: true, displayTitle: true });

doc.pipe(passthrough);
// Render content...
doc.end();

await uploadStreamToBlob(passthrough, containerName, blobName);
```

### Tagged/Accessible PDF Structure

```javascript
// Structure tags for accessibility
doc.struct('Figure', { alt: 'Certificate QR code' }, () => {
  doc.image(qrBuffer, x, y, { width: size });
});

doc.struct('Artifact', () => {
  // Decorative elements (borders, lines)
  doc.rect(x, y, w, h).stroke();
});

// Set tab order
doc.markStructureContent('Document');
doc.page.dictionary.data.Tabs = 'S'; // Structure order
```

### PDF Parsing with Muhammara

```javascript
const pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(buffer));
const pageCount = pdfReader.getPagesCount();
const textExtractor = new TextExtraction(pdfReader);
const pageText = textExtractor.extractText(pageIndex);
```

### QR Code Generation

```javascript
const qr = require('qr-image');
const qrBuffer = qr.imageSync(url, { type: 'png', size: 5 });
```

### Azure Blob Storage (Stream-Based)

```javascript
// Upload via PassThrough stream — never disk I/O
const passthrough = new PassThrough();
const blockBlobClient = containerClient.getBlockBlobClient(blobName);
await blockBlobClient.uploadStream(passthrough);

// Download as stream
const downloadResponse = await blockBlobClient.download();
return downloadResponse.readableStreamBody;
```

### Centralized Style Constants

```javascript
const PdfStyle = {
  FONT_FAMILY: 'Helvetica',
  FONT_SIZE_HEADING: 16,
  FONT_SIZE_BODY: 10,
  MARGIN_LEFT: 50,
  MARGIN_TOP: 50,
  LINE_SPACING: 1.2,
};
```

## Anti-Patterns

> Mandatory rules in the instruction files also apply. The items below are additional anti-patterns specific to this skill:

- Writing PDF data to disk instead of using PassThrough streams
- Creating PDFs without accessibility tags (Figure, Artifact, tab order)
- Hardcoding style values instead of using `PdfStyle` constants
- Missing document number format validation before rendering
