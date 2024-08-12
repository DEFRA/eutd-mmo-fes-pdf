const config = require('../config');
const storage = require('azure-storage');

const createContainer = async (containerName) => {
    const connectionStr = config.GET_CONNECTION_STR;
    const blobService = storage.createBlobService(connectionStr);

    return new Promise((resolve, reject) => {
        blobService.createContainerIfNotExists(containerName, { publicAccessLevel: 'blob' }, err => {
            if (err) {
                reject(err);
            } else {
                resolve({ message: `Container '${containerName}' created` });
            }
        });
    });
};

const deleteBlob = async(containerName, blobName) => {
    const connectionStr = config.GET_CONNECTION_STR;
    const blobService = storage.createBlobService(connectionStr);

    return new Promise((resolve, reject) => {
        blobService.deleteBlobIfExists(containerName, blobName, err => {
            if (err) {
                reject(err);
            } else {
                resolve({ message: `Blob '${blobName}' deleted` });
            }
        });
    });

};

const writeStreamForBlob = async (containerName, blobName) => {
    const connectionStr = config.GET_CONNECTION_STR;
    const blobService = storage.createBlobService(connectionStr);
    return blobService.createWriteStreamToBlockBlob(containerName, blobName);
};

module.exports.createContainer = createContainer;
module.exports.deleteBlob = deleteBlob;
module.exports.writeStreamForBlob = writeStreamForBlob;