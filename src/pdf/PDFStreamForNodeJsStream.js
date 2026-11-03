/*
    PDFStreamForNodeJsStream is an implementation of a write stream that writes directly to a NodeJs stream.
    Using this stream frees the user from having to create a PDF file on disk when generating on-demand PDFs
*/
class PDFStreamForNodeJsStream {
    constructor(stream) {
        this.stream = stream;
        this.position = 0;
    }

    write(bytes) {
        if (bytes.length > 0) {
            this.stream.write(Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes));
            this.position += bytes.length;
            return bytes.length;
        }

        return 0;
    }

    getCurrentPosition() {
        return this.position;
    }
}

module.exports = PDFStreamForNodeJsStream;