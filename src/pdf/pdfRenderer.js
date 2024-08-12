const renderBlankExportCert = require('./renderBlankExportCert');
const renderBlankProcStmnt = require('./renderBlankProcStmnt');
const renderBlankStorageDoc = require('./renderBlankStorageDoc');
const renderExportCert = require('./renderExportCert');
const renderProcessingStatement = require('./renderProcessingStatement');
const renderStorageNote = require('./renderStorageNote');

const pdfType = {
    BLANK_STORAGE_DOC: 'Blank Storage Document',
    BLANK_PROC_STMNT: 'Blank Processing Statement',
    BLANK_EXPORT_CERT: 'Blank Export Certificate',
    EXPORT_CERT: 'Export Certificate',
    STORAGE_NOTE: 'Storage Note',
    PROCESSING_STATEMENT: 'Processing Statement'
}

const renderPdf = async (type, data, isSample, uri, stream, pathToTemplate) => {

    switch (type) {
        case pdfType.BLANK_EXPORT_CERT:
            await renderBlankExportCert(data, isSample, uri, stream, pathToTemplate);
            break;
        case pdfType.BLANK_PROC_STMNT:
            await renderBlankProcStmnt(data, isSample, uri, stream, pathToTemplate);
            break;
        case pdfType.BLANK_STORAGE_DOC:
            await renderBlankStorageDoc(data, isSample, uri, stream, pathToTemplate);
            break;
        case pdfType.EXPORT_CERT:
            await renderExportCert(data, isSample, uri, stream);
            break;
        case pdfType.PROCESSING_STATEMENT:
            await renderProcessingStatement(data, isSample, uri, stream);
            break;
        case pdfType.STORAGE_NOTE:
            await renderStorageNote(data, isSample, uri, stream);
            break;
        default:
        // No default action
    }
};

module.exports = {renderPdf, pdfType};