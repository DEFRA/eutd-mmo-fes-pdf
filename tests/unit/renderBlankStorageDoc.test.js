const renderBlankStorageDoc = require('../../src/pdf/renderBlankStorageDoc');
const PdfUtils = require('../../src/pdf/mmoPdfUtils');
const muhammara = require('muhammara');
const PDFStreamForNodeJsStream = require('../../src/pdf/PDFStreamForNodeJsStream');

jest.mock('muhammara');
jest.mock('../../src/pdf/mmoPdfUtils');
jest.mock('../../src/pdf/PDFStreamForNodeJsStream');

describe('renderBlankStorageDoc', () => {
    let mockPdfWriter;
    let mockContext;
    let mockPageModifier;
    let mockStream;
    let mockInStream;

    beforeEach(() => {
        jest.clearAllMocks();

        mockContext = {
            q: jest.fn().mockReturnThis(),
            cm: jest.fn().mockReturnThis(),
            doXObject: jest.fn().mockReturnThis(),
            Q: jest.fn().mockReturnThis(),
            writeText: jest.fn().mockReturnThis()
        };

        mockPageModifier = {
            startContext: jest.fn().mockReturnValue({
                getContext: jest.fn().mockReturnValue(mockContext)
            }),
            endContext: jest.fn().mockReturnThis(),
            writePage: jest.fn().mockReturnThis()
        };

        mockPdfWriter = {
            createFormXObjectFromPNG: jest.fn().mockReturnValue({}),
            getFontForFile: jest.fn().mockReturnValue('font'),
            end: jest.fn()
        };

        mockStream = {
            end: jest.fn()
        };

        mockInStream = {};

        muhammara.PDFRStreamForFile.mockReturnValue(mockInStream);
        muhammara.PDFRStreamForBuffer.mockReturnValue(mockInStream);
        muhammara.PDFPageModifier.mockReturnValue(mockPageModifier);
        muhammara.createWriterToModify.mockReturnValue(mockPdfWriter);
        PDFStreamForNodeJsStream.mockReturnValue(mockStream);

        PdfUtils.generateQRCode.mockResolvedValue(Buffer.from('qrcode'));
    });

    describe('Sample PDF Generation', () => {
        it('should render blank storage document with sample watermark', async () => {
            const data = { documentNumber: 'GBR-2026-SM-E446C45D1' };
            const pathToTemplate = './templates/';

            await renderBlankStorageDoc(data, true, '', mockStream, pathToTemplate);

            expect(muhammara.createWriterToModify).toHaveBeenCalled();
            expect(mockPdfWriter.end).toHaveBeenCalled();
            expect(mockStream.end).toHaveBeenCalled();
            expect(mockContext.writeText).toHaveBeenCalled();
        });

        it('should generate placeholder document number for sample', async () => {
            const data = { documentNumber: 'GBR-2026-SM-E446C45D1' };
            const pathToTemplate = './templates/';

            await renderBlankStorageDoc(data, true, '', mockStream, pathToTemplate);

            // Check that document number was written to first page
            const writeTextCalls = mockContext.writeText.mock.calls;
            expect(writeTextCalls.some(call => call[0] === '###-####-##-#########')).toBe(true);
        });

        it('should render multiple pages with watermarks for sample', async () => {
            const data = { documentNumber: 'GBR-2026-SM-E446C45D1' };
            const pathToTemplate = './templates/';

            await renderBlankStorageDoc(data, true, '', mockStream, pathToTemplate);

            // Should create page modifier for pages 0, 1, 2, 3, 4
            expect(muhammara.PDFPageModifier).toHaveBeenCalledWith(mockPdfWriter, 0);
            expect(muhammara.PDFPageModifier).toHaveBeenCalledWith(mockPdfWriter, 1);
            expect(muhammara.PDFPageModifier).toHaveBeenCalledWith(mockPdfWriter, 2);
            expect(muhammara.PDFPageModifier).toHaveBeenCalledWith(mockPdfWriter, 3);
            expect(muhammara.PDFPageModifier).toHaveBeenCalledWith(mockPdfWriter, 4);
        });
    });

    describe('QR Code PDF Generation', () => {
        it('should render blank storage document with QR code', async () => {
            const data = { documentNumber: 'GBR-2026-SM-E446C45D1' };
            const uri = 'https://example.com/verify/doc123';
            const pathToTemplate = './templates/';

            await renderBlankStorageDoc(data, false, uri, mockStream, pathToTemplate);

            expect(PdfUtils.generateQRCode).toHaveBeenCalledWith(uri);
            expect(muhammara.createWriterToModify).toHaveBeenCalled();
            expect(mockPdfWriter.end).toHaveBeenCalled();
            expect(mockStream.end).toHaveBeenCalled();
        });

        it('should use actual document number for non-sample', async () => {
            const data = { documentNumber: 'GBR-2026-SM-ABC123DEF' };
            const pathToTemplate = './templates/';

            await renderBlankStorageDoc(data, false, 'https://example.com', mockStream, pathToTemplate);

            const writeTextCalls = mockContext.writeText.mock.calls;
            expect(writeTextCalls.some(call => call[0] === 'GBR-2026-SM-ABC123DEF')).toBe(true);
        });

        it('should only render pages 0 and 1 for QR code version', async () => {
            const data = { documentNumber: 'GBR-2026-SM-E446C45D1' };
            const pathToTemplate = './templates/';

            await renderBlankStorageDoc(data, false, 'https://example.com', mockStream, pathToTemplate);

            // Should only create page modifiers for pages 0 and 1 (not 2, 3, 4)
            const pageModifierCalls = muhammara.PDFPageModifier.mock.calls;
            const pageNumbers = pageModifierCalls.map(call => call[1]);
            
            expect(pageNumbers).toContain(0);
            expect(pageNumbers).toContain(1);
            expect(pageNumbers).not.toContain(2);
            expect(pageNumbers).not.toContain(3);
            expect(pageNumbers).not.toContain(4);
        });
    });

    describe('Stream and Writer Management', () => {
        it('should properly initialize PDF writer and stream', async () => {
            const data = { documentNumber: 'GBR-2026-SM-E446C45D1' };
            const pathToTemplate = './templates/';

            await renderBlankStorageDoc(data, true, '', mockStream, pathToTemplate);

            expect(muhammara.PDFRStreamForFile).toHaveBeenCalledWith(pathToTemplate + 'storage-doc-blank.pdf');
            expect(PDFStreamForNodeJsStream).toHaveBeenCalledWith(mockStream);
            expect(muhammara.createWriterToModify).toHaveBeenCalledWith(mockInStream, mockStream);
        });

        it('should end writer and stream after rendering', async () => {
            const data = { documentNumber: 'GBR-2026-SM-E446C45D1' };
            const pathToTemplate = './templates/';

            await renderBlankStorageDoc(data, true, '', mockStream, pathToTemplate);

            expect(mockPdfWriter.end).toHaveBeenCalled();
            expect(mockStream.end).toHaveBeenCalled();
        });
    });

    describe('Image Loading', () => {
        it('should load watermark image for sample PDF', async () => {
            const data = { documentNumber: 'GBR-2026-SM-E446C45D1' };
            const pathToTemplate = './templates/';

            await renderBlankStorageDoc(data, true, '', mockStream, pathToTemplate);

            expect(muhammara.PDFRStreamForFile).toHaveBeenCalledWith(pathToTemplate + 'sample-watermark.png');
            expect(mockPdfWriter.createFormXObjectFromPNG).toHaveBeenCalled();
        });

        it('should generate and load QR code for non-sample PDF', async () => {
            const data = { documentNumber: 'GBR-2026-SM-E446C45D1' };
            const uri = 'https://example.com/verify/doc123';
            const pathToTemplate = './templates/';

            await renderBlankStorageDoc(data, false, uri, mockStream, pathToTemplate);

            expect(PdfUtils.generateQRCode).toHaveBeenCalledWith(uri);
            expect(muhammara.PDFRStreamForBuffer).toHaveBeenCalled();
            expect(mockPdfWriter.createFormXObjectFromPNG).toHaveBeenCalled();
        });
    });

    describe('Page Rendering', () => {
        it('should call startContext and getContext on page modifier', async () => {
            const data = { documentNumber: 'GBR-2026-SM-E446C45D1' };
            const pathToTemplate = './templates/';

            await renderBlankStorageDoc(data, true, '', mockStream, pathToTemplate);

            expect(mockPageModifier.startContext).toHaveBeenCalled();
            expect(mockPageModifier.endContext).toHaveBeenCalled();
            expect(mockPageModifier.writePage).toHaveBeenCalled();
        });

        it('should write document number to all pages', async () => {
            const data = { documentNumber: 'GBR-2026-SM-E446C45D1' };
            const pathToTemplate = './templates/';

            await renderBlankStorageDoc(data, true, '', mockStream, pathToTemplate);

            expect(mockContext.writeText).toHaveBeenCalled();
            // Verify writeText was called with document number
            const calls = mockContext.writeText.mock.calls;
            expect(calls.length).toBeGreaterThan(0);
        });
    });

    describe('Error Handling', () => {
        it('should handle QR code generation errors', async () => {
            const data = { documentNumber: 'GBR-2026-SM-E446C45D1' };
            const pathToTemplate = './templates/';
            
            PdfUtils.generateQRCode.mockRejectedValue(new Error('QR code generation failed'));

            await expect(
                renderBlankStorageDoc(data, false, 'https://example.com', mockStream, pathToTemplate)
            ).rejects.toThrow('QR code generation failed');
        });
    });
});
