const PDFStreamForNodeJsStream = require('../../../src/pdf/PDFStreamForNodeJsStream');

describe('PDFStreamForNodeJsStream', () => {
    test('passes Buffer chunks through without copying and reports all accepted bytes', () => {
        const stream = { write: jest.fn().mockReturnValue(false), end: jest.fn() };
        const output = new PDFStreamForNodeJsStream(stream);
        const bytes = Buffer.from([0, 128, 255]);

        expect(output.getCurrentPosition()).toBe(0);
        expect(output.write(bytes)).toBe(bytes.length);
        expect(stream.write).toHaveBeenCalledWith(bytes);
        expect(stream.write.mock.calls[0][0]).toBe(bytes);
        expect(output.getCurrentPosition()).toBe(bytes.length);
        expect(stream.end).not.toHaveBeenCalled();
    });

    test('converts legacy number arrays and accumulates the byte position', () => {
        const stream = { write: jest.fn() };
        const output = new PDFStreamForNodeJsStream(stream);

        expect(output.write([0, 128, 255])).toBe(3);
        expect(stream.write).toHaveBeenLastCalledWith(Buffer.from([0, 128, 255]));
        expect(output.write(Buffer.from('PDF'))).toBe(3);
        expect(output.getCurrentPosition()).toBe(6);
    });

    test.each([Buffer.alloc(0), []])('does not forward an empty chunk (%p)', bytes => {
        const stream = { write: jest.fn() };
        const output = new PDFStreamForNodeJsStream(stream);

        expect(output.write(bytes)).toBe(0);
        expect(stream.write).not.toHaveBeenCalled();
        expect(output.getCurrentPosition()).toBe(0);
    });

    test('propagates write failures without advancing the position', () => {
        const error = new Error('Write failed');
        const stream = { write: jest.fn(() => { throw error; }) };
        const output = new PDFStreamForNodeJsStream(stream);

        expect(() => output.write(Buffer.from('PDF'))).toThrow(error);
        expect(output.getCurrentPosition()).toBe(0);
    });
});
