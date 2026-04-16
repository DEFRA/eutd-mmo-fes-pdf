/*
    PDFStreamForNodeJsStream is an implementation of a write stream that writes directly to a NodeJs stream.
    Using this stream frees the user from having to create a PDF file on disk when generating on-demand PDFs
*/
class PDFStreamForNodeJsStream {
    constructor(stream) {
        this.stream = stream;
        this.position = 0;
    }

    write(inBytesArray) {
        if (inBytesArray.length > 0) {
            this.stream.write(Buffer.from(inBytesArray));
            this.position += inBytesArray.length;
            return inBytesArray.length;
        }

        return 0;
    }

    getCurrentPosition() {
        return this.position;
        // return this.bytesWritten;
        // or pos ?
    }
}

module.exports = PDFStreamForNodeJsStream;