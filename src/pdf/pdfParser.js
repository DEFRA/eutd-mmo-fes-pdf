const parseExportCert = require('./parseExportCert');
const parseProcessingStatement = require('./parseProcessingStatement');
const parseStorageDocument = require('./parseStorageDocument');
const extractText = require('../utils/pdf-text-extraction/text-extraction');
const muhammara = require('muhammara');

const EXPORT_CERT_PAGE_COUNT = 9;
const EXPORT_CERT_TEXT_COUNT = 79;
const EXPORT_CERT_DOC_NUM_IDX = 78;
const PROC_STMT_PAGE_COUNT = 4;
const PROC_STMT_TEXT_COUNT = 58;
const PROC_STMT_DOC_NUM_IDX = 54;
const STORAGE_NOTE_PAGE_COUNT = 5;
const STORAGE_NOTE_TEXT_COUNT = 64;
const STORAGE_NOTE_DOC_NUM_IDX = 60;
const DOCUMENT_NUMBER_LENGTH = 21;
const DOCUMENT_PARTS_COUNT = 4;
const DOCUMENT_COUNTRY_IDX = 0;
const DOCUMENT_TYPE_IDX = 2;
const DOCUMENT_COUNTRY = 'GBR';

const pdfType = {
    EXPORT_CERT: 'Export Certificate',
    STORAGE_NOTE: 'Storage Note',
    PROCESSING_STATEMENT: 'Processing Statement'
};

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
    if (pdfText.length === EXPORT_CERT_PAGE_COUNT && pdfText[0].length === EXPORT_CERT_TEXT_COUNT) {
        documentNumber = pdfText[0][EXPORT_CERT_DOC_NUM_IDX].text;
        type = getType(documentNumber);
        if (pdfType.EXPORT_CERT === type) {
            pdfJson.documentNumber = documentNumber;
            pdfJson.type = type;
        }
    } else if (pdfText.length === PROC_STMT_PAGE_COUNT && pdfText[0].length === PROC_STMT_TEXT_COUNT) {
        documentNumber = pdfText[0][PROC_STMT_DOC_NUM_IDX].text;
        type = getType(documentNumber);
        if (pdfType.PROCESSING_STATEMENT === type) {
            pdfJson.documentNumber = documentNumber;
            pdfJson.type = type;
        }
    } else if (pdfText.length === STORAGE_NOTE_PAGE_COUNT && pdfText[0].length === STORAGE_NOTE_TEXT_COUNT) {
        documentNumber = pdfText[0][STORAGE_NOTE_DOC_NUM_IDX].text;
        type = getType(documentNumber);
        if (pdfType.STORAGE_NOTE === type) {
            pdfJson.documentNumber = documentNumber;
            pdfJson.type = type;
        }
    } else {
        // Unrecognised PDF layout
    }
    return pdfJson;
};

const getType = (documentNumber) => {
    let type;
    if (documentNumber?.length === DOCUMENT_NUMBER_LENGTH) {
        const parts = documentNumber.split('-');
        if (parts?.length === DOCUMENT_PARTS_COUNT && parts[DOCUMENT_COUNTRY_IDX] === DOCUMENT_COUNTRY) {
            if ('CM' === parts[DOCUMENT_TYPE_IDX]) {
                type = pdfType.EXPORT_CERT;
            } else if ('PM' === parts[DOCUMENT_TYPE_IDX]) {
                type = pdfType.PROCESSING_STATEMENT;
            } else if ('SM' === parts[DOCUMENT_TYPE_IDX]) {
                type = pdfType.STORAGE_NOTE;
            } else {
                // Unknown document type code
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
