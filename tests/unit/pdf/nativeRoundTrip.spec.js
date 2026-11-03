const path = require('node:path');
const fs = require('node:fs');
const { PassThrough } = require('node:stream');
const { finished } = require('node:stream/promises');
const muhammara = require('@muhammara/native');
const { renderPdf, pdfType } = require('../../../src/pdf/pdfRenderer');
const { parsePdfBuffer } = require('../../../src/pdf/pdfParser');

describe('native PDF render/parse compatibility', () => {
    jest.setTimeout(60000);

    test.each([
        [pdfType.BLANK_EXPORT_CERT, 'GBR-2026-CM-123456789', 10],
        [pdfType.BLANK_PROC_STMNT, 'GBR-2026-PM-123456789', 2],
        [pdfType.BLANK_STORAGE_DOC, 'GBR-2026-SM-123456789', 6]
    ])('finalizes and reads %s with Buffer chunks', async (type, documentNumber, pages) => {
        const stream = new PassThrough();
        const chunks = [];
        stream.on('data', chunk => chunks.push(chunk));
        const completed = finished(stream);
        const end = jest.spyOn(stream, 'end');

        await renderPdf(type, { documentNumber }, false, 'https://example.test/validate',
            stream, path.join(__dirname, '../../../src/resources/'));
        await completed;

        expect(end).toHaveBeenCalledTimes(1);
        expect(chunks.length).toBeGreaterThan(0);
        expect(chunks.every(Buffer.isBuffer)).toBe(true);
        const buffer = Buffer.concat(chunks);
        expect(buffer.subarray(0, 5).toString()).toBe('%PDF-');
        expect(buffer.subarray(-32).toString()).toContain('%%EOF');
        const reader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(buffer));
        expect(reader.getPagesCount()).toBe(pages);
        for (let index = 0; index < pages; index++) {
            const box = reader.parsePage(index).getMediaBox();
            expect(box[2]).toBeGreaterThan(box[0]);
            expect(box[3]).toBeGreaterThan(box[1]);
        }
    });

    test.each([
        ['parse-export-cert/fixtures/parse-export-certs.pdf', 'GBR-2019-CM-EA35698BF', 'Export Certificate'],
        ['parse-proc-stmnt/fixtures/parse-proc-statement.pdf', 'GBR-2019-PM-5116302FA', 'Processing Statement'],
        ['parse-storage-doc/fixtures/parse-storage-document.pdf', 'GBR-2019-SM-586452E14', 'Storage Note']
    ])('parses supported form fixture %s', async (fixture, documentNumber, type) => {
        // Inbound forms have historical layouts, distinct from current blank templates.
        const buffer = fs.readFileSync(path.join(__dirname, '..', fixture));
        const result = await parsePdfBuffer(buffer);

        expect(result).toMatchObject({ documentNumber, type, errors: [] });
    });
});
