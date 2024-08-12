const uuid = require('uuid');

const { renderPdf } = require('./pdf/pdfRenderer');
const { parsePdfBuffer } = require('./pdf/pdfParser');
const { generate } = require('./storage/sas/tokenGenerator');
const blobManager = require('./storage/blobManager');


const deleteBlob = async (containerName, blobName) => {
    return await blobManager.deleteBlob(containerName, blobName);
};

const getAzureBlobStream = async (principalId, blobName) => {
    return await blobManager.writeStreamForBlob(principalId, blobName);
};
const getJourneyName = (documentNumber) => {
   
        const journey =  documentNumber?.split("-")[2];
        if (journey === 'CC' || journey === 'CM') {
          return 'CatchCertificate';
        } else if (journey === 'PS' || journey === 'PM') {
          return 'ProcessingStatement';
        } else if (journey === 'SD' || journey === 'SM') {
          return 'StorageDocument';
        }

        return 'CatchCertificate';
} 

const generatePdfAndUpload = async (containerName, type, data, isSample, { getStream }, documentNumber, pathToTemplate) => {
    try {
        await blobManager.createContainer(containerName);
        const journey = getJourneyName(documentNumber);
        const blobName = `${journey}-${documentNumber}.pdf`;
        const sasJson = generate(containerName, blobName);
        const stream = await getStream(containerName, blobName);
        renderPdf(type, data, isSample, sasJson.qrUri, stream, pathToTemplate);
        return sasJson;
    } catch (e) {
        throw new Error(e);
    }
};

const uploadZip = async (containerName, data, { getStream }) => {
    try {
        await blobManager.createContainer(containerName);
        const blobName = `_${uuid()}.zip`;
        const sasJson = generate(containerName, blobName);
        const stream = await getStream(containerName, blobName);
        stream.write(data);
        stream.end();
        return sasJson;
    } catch (e) {
        throw new Error(e);
    }
};

const parsePdf = async (buffer) => {
    return await parsePdfBuffer(buffer);
};

const overwritePdf = async (containerName, blobName, buffer, { getStream }) => {
    try {
        await blobManager.createContainer(containerName);
        const stream = await getStream(containerName, blobName);
        stream.write(buffer);
        stream.end();
    } catch (e) {
        throw new Error(e);
    }
};

module.exports.getAzureBlobStream = getAzureBlobStream;
module.exports.generatePdfAndUpload = generatePdfAndUpload;
module.exports.uploadZip = uploadZip;
module.exports.parsePdf = parsePdf;
module.exports.overwritePdf = overwritePdf;
module.exports.deleteBlob = deleteBlob;
module.exports.getJourneyName = getJourneyName;