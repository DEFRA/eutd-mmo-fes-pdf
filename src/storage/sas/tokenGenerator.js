const config = require('../../config');

const generate = (container, blobName) => {
    const storageInfo = {
        container: container,
        blobName: blobName,
        uri: blobName,
    }
    if (blobName.endsWith('.pdf')) {
        storageInfo.qrUri = `${config.SERVICE_URL}/qr/export-certificates/${blobName}`;
    }
    return storageInfo;
};

module.exports.generate = generate;