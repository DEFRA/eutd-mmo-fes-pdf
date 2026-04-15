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

const EXPORT_PAGE_COUNT = 9;
const EXPORT_FIRST_ROW_LENGTH = 79;
const EXPORT_DOC_INDEX = 78;
const PROCESSING_PAGE_COUNT = 4;
const PROCESSING_FIRST_ROW_LENGTH = 58;
const PROCESSING_DOC_INDEX = 54;
const STORAGE_PAGE_COUNT = 5;
const STORAGE_FIRST_ROW_LENGTH = 64;
const STORAGE_DOC_INDEX = 60;
const DOCUMENT_NUMBER_LENGTH = 21;
const DOCUMENT_PARTS_LENGTH = 4;

const parsePdfBuffer = async (buffer) => {
    const pdfText = await extractPdfText(buffer);
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
    const pdfJson = {};
    let type;
    let documentNumber;
    if (pdfText.length === EXPORT_PAGE_COUNT && pdfText[0].length === EXPORT_FIRST_ROW_LENGTH) {
        documentNumber = pdfText[0][EXPORT_DOC_INDEX].text;
        type = getType(documentNumber);
        if (pdfType.EXPORT_CERT === type) {
            pdfJson.documentNumber = documentNumber;
            pdfJson.type = type;
        }
    } else if (pdfText.length === PROCESSING_PAGE_COUNT && pdfText[0].length === PROCESSING_FIRST_ROW_LENGTH) {
        documentNumber = pdfText[0][PROCESSING_DOC_INDEX].text;
        type = getType(documentNumber);
        if (pdfType.PROCESSING_STATEMENT === type) {
            pdfJson.documentNumber = documentNumber;
            pdfJson.type = type;
        }
    } else if (pdfText.length === STORAGE_PAGE_COUNT && pdfText[0].length === STORAGE_FIRST_ROW_LENGTH) {
        documentNumber = pdfText[0][STORAGE_DOC_INDEX].text;
        type = getType(documentNumber);
        if (pdfType.STORAGE_NOTE === type) {
            pdfJson.documentNumber = documentNumber;
            pdfJson.type = type;
        }
    } else {
        // Unknown layout.
    }
    return pdfJson;
};

const getType = (documentNumber) => {
    let type;
    if (documentNumber?.length === DOCUMENT_NUMBER_LENGTH) {
        const parts = documentNumber.split('-');
        if (parts?.length === DOCUMENT_PARTS_LENGTH && parts[0] === 'GBR') {
            if ('CM' === parts[2]) {
                type = pdfType.EXPORT_CERT;
            } else if ('PM' === parts[2]) {
                type = pdfType.PROCESSING_STATEMENT;
            } else if ('SM' === parts[2]) {
                type = pdfType.STORAGE_NOTE;
            } else {
                // Unknown document subtype.
            }
        }
    }
    return type;
};

const extractPdfText = async (data) => {
    const pdfStream = new muhammara.PDFRStreamForBuffer(data);
    const pdfReader = muhammara.createReader(pdfStream);
    return extractText(pdfReader);
};

module.exports = {parsePdfBuffer, pdfType, extractPdfText, identifyPdf};
