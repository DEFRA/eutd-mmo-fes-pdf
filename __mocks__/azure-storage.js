var fs = require('fs');
var storage = jest.genMockFromModule('azure-storage');

function __setMockService() {
  mockService = {
    createContainerIfNotExists: function (containerName, options = {}, cb) {
      return cb(null, {
        containerName
      });
    },
    deleteBlobIfExists: function(containerName, blobName, cb) {
      return cb(null, {
        containerName
      })
    },
    createWriteStreamToBlockBlob: function (containerName, options = {}, cb) {
      return {
        stream: 'dummy-stream'
      }
    }
  };
}

function __setMockServiceWithError() {
  mockService = {
    createContainerIfNotExists: function(containerName, options = {}, cb) {
      return cb(new Error('CreateContainerIfNotExistsError'));
    },
    deleteBlobIfExists: function(containerName, blobName, cb) {
      return cb(new Error('DeleteBlobError'));
    }
  };
}

function createBlobService() { return mockService; }

storage.__setMockService = __setMockService;
storage.__setMockServiceWithError = __setMockServiceWithError;
storage.createBlobService = createBlobService;

module.exports = storage;
