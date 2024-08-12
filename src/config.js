require('dotenv').config();

const config = {
    GET_CONNECTION_STR: process.env.AZURE_STORAGE_CONNECTION_STRING || process.env.BLOB_STORAGE_CONNECTION,
    azureStorageProxyUrl: process.env.AZURE_STORAGE_PROXY_URL,
    azureStorageProxyZipUrl: process.env.BASE_URL,
    SERVICE_URL: process.env.SERVICE_URL
};

module.exports = config;
