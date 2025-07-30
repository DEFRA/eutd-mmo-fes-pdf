const config = require('../config');
const { BlobServiceClient } = require('@azure/storage-blob');

const getBlobServiceClient = () => {
    return BlobServiceClient.fromConnectionString(config.GET_CONNECTION_STR);
};

const createContainer = async (containerName) => {
    const blobServiceClient = getBlobServiceClient();
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const createContainerResponse = await containerClient.createIfNotExists();
    return { message: `Container '${containerName}' created`, details: createContainerResponse };
};

const deleteBlob = async (containerName, blobName) => {
    const blobServiceClient = getBlobServiceClient();
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
    return { message: `Blob '${blobName}' deleted` };
};

const writeStreamForBlob = async (containerName, blobName) => {
    const { PassThrough } = require('stream');
    const blobServiceClient = getBlobServiceClient();
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const stream = new PassThrough();

    // Start uploading as soon as data is piped in
    blockBlobClient.uploadStream(stream)
        .catch(err => stream.emit('error', err));

    return stream;
};

module.exports.createContainer = createContainer;
module.exports.deleteBlob = deleteBlob;
module.exports.writeStreamForBlob = writeStreamForBlob;