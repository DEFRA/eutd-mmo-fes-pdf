const { PassThrough } = require('stream');

jest.mock('@azure/storage-blob', () => {
  const mBlockBlobClient = {
    uploadStream: jest.fn().mockResolvedValue({}),
    deleteIfExists: jest.fn().mockResolvedValue({}),
  };
  const mContainerClient = {
    createIfNotExists: jest.fn().mockResolvedValue({}),
    getBlockBlobClient: jest.fn(() => mBlockBlobClient),
  };
  const mBlobServiceClient = {
    getContainerClient: jest.fn(() => mContainerClient),
  };
  return {
    BlobServiceClient: {
      fromConnectionString: jest.fn(() => mBlobServiceClient),
    },
  };
});

const blobManager = require('../../../src/storage/blobManager');

describe('blobManager', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('will create a container', async () => {
    const message = await blobManager.createContainer('create-container');
    expect(message.message).toBe("Container 'create-container' created");
  });

  test('will fail to create a container', async () => {
    const { BlobServiceClient } = require('@azure/storage-blob');
    const mBlobServiceClient = BlobServiceClient.fromConnectionString();
    const mContainerClient = mBlobServiceClient.getContainerClient();
    mContainerClient.createIfNotExists.mockRejectedValueOnce(new Error('CreateContainerIfNotExistsError'));

    await expect(blobManager.createContainer('create-container')).rejects.toThrow('CreateContainerIfNotExistsError');
  });

  test('will delete blob within a container', async () => {
    const message = await blobManager.deleteBlob('container-name', 'blob-name');
    expect(message.message).toBe("Blob 'blob-name' deleted");
  });

  test('will fail to delete a blob', async () => {
    const { BlobServiceClient } = require('@azure/storage-blob');
    const mBlobServiceClient = BlobServiceClient.fromConnectionString();
    const mContainerClient = mBlobServiceClient.getContainerClient();
    const mBlockBlobClient = mContainerClient.getBlockBlobClient();
    mBlockBlobClient.deleteIfExists.mockRejectedValueOnce(new Error('DeleteBlobError'));

    await expect(blobManager.deleteBlob('container-name', 'blob-name')).rejects.toThrow('DeleteBlobError');
  });

  test('will return a stream for blob', async () => {
    const stream = await blobManager.writeStreamForBlob('container-name', 'blob-name');
    expect(stream).toBeInstanceOf(PassThrough);
  });
});