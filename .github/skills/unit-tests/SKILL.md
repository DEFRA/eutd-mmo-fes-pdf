---
name: unit-tests
description: 'Expert unit test engineer for MMO FES PDF Service. Use when: writing unit tests, updating tests for code changes, fixing failing tests, improving code coverage, fixing SonarQube issues.'
---

# PDF Service — Unit Tests Skill

Expert in writing and maintaining unit tests for the MMO FES PDF generation and parsing service.

## When to Use

- Writing unit tests for new or modified PDF renderers
- Testing PDF parsing with muhammara
- Fixing failing tests after code changes
- Improving code coverage to meet thresholds
- Fixing SonarQube issues or code smells

## Coverage Requirements

- **Branches**: 90%
- **Functions**: 90%
- **Lines**: 90%
- **Statements**: 90%
- Run tests: `npm test`
- Run CI tests: `npm run test:ci`
- Run integration tests: `npm run test:integration`

## Test Framework & Tools

- **Jest** as test runner with jest-junit reporter
- **PassThrough streams** for mocking blob upload/download
- Test files alongside source or in `__tests__/` directories

## Mocking Patterns

### Azure Blob Storage

```javascript
const { PassThrough } = require('stream');

jest.mock('@azure/storage-blob', () => ({
  BlobServiceClient: {
    fromConnectionString: jest.fn().mockReturnValue({
      getContainerClient: jest.fn().mockReturnValue({
        getBlockBlobClient: jest.fn().mockReturnValue({
          uploadStream: jest.fn().mockResolvedValue({}),
          download: jest.fn().mockResolvedValue({
            readableStreamBody: new PassThrough(),
          }),
          delete: jest.fn().mockResolvedValue({}),
        }),
        createIfNotExists: jest.fn().mockResolvedValue({}),
      }),
    }),
  },
}));
```

### PDFKit Document

```javascript
jest.mock('pdfkit', () => {
  const { PassThrough } = require('stream');
  return jest.fn().mockImplementation(() => {
    const stream = new PassThrough();
    return {
      pipe: jest.fn().mockReturnValue(stream),
      end: jest.fn(() => stream.end()),
      text: jest.fn().mockReturnThis(),
      image: jest.fn().mockReturnThis(),
      rect: jest.fn().mockReturnThis(),
      stroke: jest.fn().mockReturnThis(),
      struct: jest.fn((tag, opts, fn) => fn && fn()),
      page: { dictionary: { data: {} } },
    };
  });
});
```

### QR Code

```javascript
jest.mock('qr-image', () => ({
  imageSync: jest.fn().mockReturnValue(Buffer.from('mock-qr')),
}));
```

## What to Test

1. **PDF generation** — each document type produces a valid stream
2. **Accessibility tags** — Figure tags with alt text, Artifact for decorative elements
3. **QR codes** — URL encoding and image buffer generation
4. **Blob upload** — stream piped correctly, container created if missing
5. **Blob download** — stream returned from blob storage
6. **PDF parsing** — text extraction from buffer, page count verification
7. **Document type routing** — correct renderer selected by document type
8. **Error handling** — invalid buffers, missing containers, stream errors
9. **Style constants** — centralized `PdfStyle` values applied correctly

## SonarQube Issue Resolution

When fixing SonarQube issues, **NEVER modify functionality**. If existing tests fail after a fix, revert it.

## Workflow

1. Identify the renderer or parser that needs tests
2. Set up mock blob storage and PassThrough streams
3. Write tests covering generation, parsing, and error paths
4. Run `npm test` and check coverage output
5. If coverage below thresholds, add targeted tests
6. Check problems tab for SonarQube issues
