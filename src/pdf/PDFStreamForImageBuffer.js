/*
    PDFStreamForImageBuffer is an implementation of a write stream that writes directly to a NodeJs stream.
    Using this stream frees the user from having to create a PDF file on disk when generating on-demand PDFs
*/
// eslint-disable-next-line no-use-before-define
class PDFStreamForImageBuffer {
    constructor(buffer) {
        this.arr = Object.values(buffer);
        this.position = 0;
    }

    read(inAmount) {
        let endPos = this.position + inAmount;
        if (endPos > this.arr.length - 1) {
            endPos = this.arr.length - 1;
        }
        const result = this.arr.slice(this.position, endPos);
        this.position = endPos + 1;
        return result;
    }

    notEnded() {
        return this.position < this.arr.length;
    }

    setPosition(pos) {
        this.position = pos;
    }

    setPositionFromEnd(pos) {
        this.position = this.arr.length - 1 - pos;
    }

    skip(inAmount) {
        this.position += inAmount;
    }

    getCurrentPosition() {
        return this.position;
    }
}

module.exports = PDFStreamForImageBuffer;