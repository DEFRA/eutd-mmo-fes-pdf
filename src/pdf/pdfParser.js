const parseExportCert = require('./parseExportCert');
const parseProcessingStatement = require('./parseProcessingStatement');
const parseStorageDocument = require('./parseStorageDocument');
const extractText = require('../utils/pdf-text-extraction/text-extraction');
const muhammara = require('muhammara');

const pdfType = {
    EXPORT_CERT: 'Export Certificate',
    STORAGE_NOTE: 'Storage Note',
    PROCESSING_STATEMENT: 'Processing Statement'
};

const parsePdfBuffer = async (buffer) => {
    let pdfText = await extractPdfText(buffer);
    let pdfJson = identifyPdf(pdfText);
    switch (pdfJson.type) {
        case pdfType.EXPORT_CERT:
            pdfJson = await parseExportCert(pdfJson, buffer);
            break;
        case pdfType.PROCESSING_STATEMENT:
            pdfJson = await parseProcessingStatement(pdfJson, buffer);
            break;
        case pdfType.STORAGE_NOTE:
            pdfJson = await parseStorageDocument(pdfJson, buffer);
            break;
        default:
        // No default action
    }
    return pdfJson;
};

const identifyPdf = (pdfText) => {
    let pdfJson = {};
    let type;
    let documentNumber;
    if (pdfText.length === 9 && pdfText[0].length === 79) {
        documentNumber = pdfText[0][78].text;
        type = getType(documentNumber);
        if (pdfType.EXPORT_CERT === type) {
            pdfJson.documentNumber = documentNumber;
            pdfJson.type = type;
        }
    } else if (pdfText.length === 4 && pdfText[0].length === 58) {
        documentNumber = pdfText[0][54].text;
        type = getType(documentNumber);
        if (pdfType.PROCESSING_STATEMENT === type) {
            pdfJson.documentNumber = documentNumber;
            pdfJson.type = type;
        }
    } else if (pdfText.length === 5 && pdfText[0].length === 64) {
        documentNumber = pdfText[0][60].text;
        type = getType(documentNumber);
        if (pdfType.STORAGE_NOTE === type) {
            pdfJson.documentNumber = documentNumber;
            pdfJson.type = type;
        }
    }
    return pdfJson;
};

const getType = (documentNumber) => {
    let type;
    if (documentNumber && documentNumber.length === 21) {
        let parts = documentNumber.split('-');
        if (parts && parts.length === 4 && parts[0] === 'GBR') {
            if ('CM' === parts[2]) {
                type = pdfType.EXPORT_CERT;
            } else if ('PM' === parts[2]) {
                type = pdfType.PROCESSING_STATEMENT;
            } else if ('SM' === parts[2]) {
                type = pdfType.STORAGE_NOTE;
            }
        }
    }
    return type;
};

const extractPdfText = async (data) => {
    const pdfStream = new muhammara.PDFRStreamForBuffer(data);
    let pdfReader = muhammara.createReader(pdfStream);
    return await extractText(pdfReader);
};

module.exports = {parsePdfBuffer, pdfType, extractPdfText, identifyPdf};
