require('dotenv').config();
const pdfService = require('./pdfService');
const pdfRenderer = require('./pdf/pdfRenderer');

module.exports.pdfType = pdfRenderer.pdfType;
module.exports.generatePdfAndUpload = pdfService.generatePdfAndUpload;
module.exports.getAzureBlobStream = pdfService.getAzureBlobStream;
module.exports.uploadZip = pdfService.uploadZip;
module.exports.parsePdf = pdfService.parsePdf;
module.exports.overwritePdf = pdfService.overwritePdf;
module.exports.deleteBlob = pdfService.deleteBlob;