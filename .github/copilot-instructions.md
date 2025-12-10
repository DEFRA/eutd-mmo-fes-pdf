# MMO FES PDF Service - AI Coding Agent Instructions

## Project Overview
This is a Node.js service for the UK Marine Management Organisation (MMO) that generates, parses, and manages PDF documents for fisheries export certificates. It handles three document types: Catch/Export Certificates, Processing Statements, and Storage Documents.

## Architecture

### Core Components
- **`src/pdfService.js`**: Main service orchestrator that coordinates PDF generation, parsing, and Azure Blob Storage operations
- **`src/pdf/pdfRenderer.js`**: Routes document type to appropriate renderer (6 types: blank/filled versions of 3 document types)
- **`src/pdf/pdfParser.js`**: Extracts and identifies document data from PDF buffers using text extraction and digital form parsing
- **`src/storage/blobManager.js`**: Azure Blob Storage interface using `@azure/storage-blob` SDK
- **`src/index.js`**: Public API surface - only modify exports here when adding new public methods

### Document Type Patterns
Documents follow a strict naming convention: `GBR-YYYY-{CC|PS|SD|CM|PM|SM}-IDENTIFIER`
- `CC`/`CM` = Catch Certificate → `CatchCertificate` journey
- `PS`/`PM` = Processing Statement → `ProcessingStatement` journey  
- `SD`/`SM` = Storage Document → `StorageDocument` journey

The `getJourneyName()` function in `pdfService.js` maps these codes to journey names used in blob paths.

### PDF Generation Flow
1. `generatePdfAndUpload()` creates Azure container and blob
2. Calls `renderPdf()` which dispatches to type-specific renderer (e.g., `renderExportCert.js`)
3. Renderers use `mmoPdfUtils.js` (drawing utilities) and `mmoPdfStyles.js` (constants) with PDFKit
4. QR codes generated via `qr-image` library and embedded for validation
5. Stream-based uploads to Azure Blob Storage using Node.js PassThrough streams

### PDF Parsing Flow
1. `parsePdfBuffer()` extracts text using custom `pdf-text-extraction/` utilities built on `muhammara`
2. `identifyPdf()` detects document type by analyzing text placement arrays and document number
3. Type-specific parsers (e.g., `parseExportCert.js`) use `PDFDigitalForm` class to extract form field key-value pairs
4. Field keys are defined as constants (e.g., `EXPORTER_ADDRESS_KEY`, `VESSEL_REP_KEY`) for maintainability

## Development Workflows

### Testing
```bash
npm test                 # Unit tests with coverage (requires 81%+ branches, 97%+ functions)
npm run test:integration # Integration tests (requires Azure connection string)
npm run test-vstack      # Silent test run used in build.sh
```

**Test Structure**: 
- Unit tests in `tests/unit/` follow `.spec.js` convention
- Mock Azure storage in `__mocks__/azure-storage.js` and setup in `tests/mocks/setup.js`
- Use Jest spies extensively (see `pdfService.spec.js` for mocking `blobManager` methods)
- Output PDFs written to `tests/unit/{type}/output/` for visual verification

### Environment Variables
Required configuration (see `src/config.js`):
- `AZURE_STORAGE_CONNECTION_STRING` or `BLOB_STORAGE_CONNECTION` - Azure Blob Storage connection
- `SERVICE_URL` - Base URL for QR code generation (points to certificate validation endpoint)
- `AZURE_STORAGE_PROXY_URL`, `BASE_URL` - Proxy/base URLs for different environments

### GitFlow Branching Strategy
**CRITICAL**: Branch names must match patterns or Azure Pipeline fails:
- `main` (production)
- `develop` (integration)
- `feature/*`, `epic/*` (development)
- `release/*`, `hotfix/*` (deployment)

See `azure-pipelines.yml` trigger section and GitFlow diagram in README.

## Code Conventions

### Module Exports Pattern
Use explicit named exports at module bottom:
```javascript
module.exports.functionName = functionName;
module.exports.anotherFunction = anotherFunction;
```
Never export inline or use shorthand object syntax - maintain consistency with existing codebase.

### PDF Styling
- All dimensions/colors defined in `src/pdf/mmoPdfStyles.js` (margins, fonts, colors)
- Use `mmoPdfUtils.js` helper functions: `label()`, `labelBold()`, `tableHeaderCell()`, `qrCode()`, etc.
- Never hardcode positions - calculate from `PdfStyle.MARGIN` constants
- Accessibility: Use `doc.struct('Figure', {alt: '...'})` for images, set `Tabs: 'S'` for tab order

### Stream-Based Architecture
All Azure Blob uploads use Node.js streams (see `blobManager.writeStreamForBlob()`):
- PDFKit docs pipe directly to Azure upload streams (no disk I/O)
- `PassThrough` streams enable async upload while rendering continues
- Always call `stream.end()` after writing buffer data (zip uploads, overwrites)

### Resource Management
- Fonts loaded from `src/resources/fonts/`
- Template PDFs and images in `src/resources/`
- Use `path.join(__dirname, '../resources/...')` for cross-platform compatibility

## Common Tasks

### Adding a New PDF Document Type
1. Create renderer in `src/pdf/render{TypeName}.js` following existing patterns
2. Add `pdfType` constant to `pdfRenderer.js` and new case in `renderPdf()` switch
3. Create parser in `src/pdf/parse{TypeName}.js` if document needs parsing
4. Add case to `pdfParser.js` `parsePdfBuffer()` switch and update `identifyPdf()`
5. Write unit tests in `tests/unit/{type}/` with sample output directory
6. Update journey mapping in `getJourneyName()` if new document code introduced

### Modifying Table Structures
Multi-row data (fishing vessels, catch products) use dynamic table generation:
- Blank templates iterate with fixed `pageSize` (e.g., 14 rows in `processBlankTemplate()`)
- Data-driven templates iterate actual data arrays (see `processMultiData()` in renderers)
- Always maintain page structure with `endOfPage()` call and page numbering

### Debugging PDF Issues
1. Check `tests/unit/{type}/output/` for rendered PDF samples
2. Use `npm run test:integration` with real Azure storage to verify uploads
3. For parsing issues, examine `pdf-text-extraction/placements-extraction.js` text positioning
4. QR codes require valid `SERVICE_URL` - check mock setup in tests

## Key Files Reference
- **Public API**: `src/index.js`
- **Orchestration**: `src/pdfService.js`
- **Rendering**: `src/pdf/render*.js` (6 renderers)
- **Parsing**: `src/pdf/parse*.js` (3 parsers), `src/utils/pdf-digital-form.js`
- **Utilities**: `src/pdf/mmoPdfUtils.js`, `src/pdf/mmoPdfStyles.js`, `src/utils/common-utils.js`
- **Storage**: `src/storage/blobManager.js`, `src/storage/sas/tokenGenerator.js`
- **Config**: `src/config.js`, `tests/mocks/setup.js` (test env vars)

## Dependencies Notes
- **PDFKit 0.15.1**: PDF generation (locked version - do not upgrade without testing)
- **muhammara**: PDF reading/manipulation (successor to HummusJS)
- **@azure/storage-blob**: Azure SDK v12+ (uses connection strings, not account keys)
- **qr-image**: QR code generation (synchronous, returns streams)
- **Jest 29**: Testing framework with strict coverage thresholds (see `package.json`)
