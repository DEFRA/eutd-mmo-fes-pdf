const CommonUtils = require('../../../src/utils/common-utils');

describe('common-utils', () => {
    describe('createBaseDocument', () => {
        test('returns a PDF document when documentTitle is provided', () => {
            const doc = CommonUtils.createBaseDocument('https://example.com/GBR-2024-SD-1234.pdf', 'Non-Manipulation Document - GBR-2024-SD-1234');
            expect(doc).toBeTruthy();
            doc.end();
        });

        test('returns a PDF document when documentTitle is not provided, falling back to uri basename', () => {
            const doc = CommonUtils.createBaseDocument('https://example.com/CatchCertificate-GBR-2024-CC-5678.pdf');
            expect(doc).toBeTruthy();
            doc.end();
        });
    });
});
