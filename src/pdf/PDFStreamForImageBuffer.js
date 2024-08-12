/*
    PDFStreamForImageBuffer is an implementation of a write stream that writes directly to a NodeJs stream.
    Using this stream frees the user from having to create a PDF file on disk when generating on-demand PDFs
*/
function PDFStreamForImageBuffer(buffer) {
    this.arr = Object.values(buffer);
    this.position = 0;
}

PDFStreamForImageBuffer.prototype.read = function(inAmount) {
    let endPos = this.position + inAmount;
    if (endPos > this.arr.length - 1) {
        endPos = this.arr.length - 1;
    }
    let result = this.arr.slice(this.position, endPos);
    this.position = endPos + 1;
    return result;
};

PDFStreamForImageBuffer.prototype.notEnded = function() {
    return this.position < this.arr.length;
};

PDFStreamForImageBuffer.prototype.setPosition = function(pos) {
    this.position = pos;
};

PDFStreamForImageBuffer.prototype.setPositionFromEnd = function(pos) {
    this.position = this.arr.length - 1 - pos;
};

PDFStreamForImageBuffer.prototype.skip = function(inAmount) {
    this.position += inAmount;
};

PDFStreamForImageBuffer.prototype.getCurrentPosition = function() {
    return this.position;
};

module.exports = PDFStreamForImageBuffer;