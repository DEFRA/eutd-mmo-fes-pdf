
jest.mock('../../src/config', () => {
    const originalModule = jest.requireActual('../../src/config');
    return {
      ...originalModule,
      GET_CONNECTION_STR: process.env.AZURE_STORAGE_CONNECTION_STRING || process.env.BLOB_STORAGE_CONNECTION
    };
  });
  
  describe('Configuration Tests', () => {
    beforeEach(() => {
      process.env.AZURE_STORAGE_CONNECTION_STRING = 'mock-azure-storage-connection-string';
      process.env.BLOB_STORAGE_CONNECTION = 'mock-blob-storage-connection';
      process.env.AZURE_STORAGE_PROXY_URL = 'mock-azure-storage-proxy-url';
      process.env.BASE_URL = 'mock-base-url';
      process.env.SERVICE_URL = 'mock-service-url';
    });
  
    test('should return value from AZURE_STORAGE_CONNECTION_STRING or BLOB_STORAGE_CONNECTION', () => {
      const config = require('../../src/config');
      expect(config.GET_CONNECTION_STR).toBe('mock-azure-storage-connection-string');
    });
  
    test('should return value from AZURE_STORAGE_PROXY_URL', () => {
      const config = require('../../src/config');
      expect(config.azureStorageProxyUrl).toBe('mock-azure-storage-proxy-url');
    });
  
    test('should return value from BASE_URL', () => {
      const config = require('../../src/config');
      expect(config.azureStorageProxyZipUrl).toBe('mock-base-url');
    });
  
    test('should return value from SERVICE_URL', () => {
      const config = require('../../src/config');
      expect(config.SERVICE_URL).toBe('mock-service-url');
    });
  });