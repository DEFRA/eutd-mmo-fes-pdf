const storage = require('../../../__mocks__/azure-storage');
const blobManager = require('../../../src/storage/blobManager');

describe('pdfService', () => {

  test('will create a container', async () => {
    storage.__setMockService();

    const message = await blobManager.createContainer('create-container');
    expect(message).toEqual({ "message": 'Container \'create-container\' created' });
  })

  test('will fail to create a container', async () => {
    storage.__setMockServiceWithError();

    await expect(blobManager.createContainer('create-container')).rejects.toEqual(new Error('CreateContainerIfNotExistsError'));
  })

  test('will delete blob within a container', async () => {
    storage.__setMockService();

    const message = await blobManager.deleteBlob('container-name', 'blob-name');
    expect(message).toEqual({ "message": 'Blob \'blob-name\' deleted' });
  })

  test('will fail to delete a blob', async () => {
    storage.__setMockServiceWithError();

    await expect(blobManager.deleteBlob('container-name', 'blob-name')).rejects.toEqual(new Error('DeleteBlobError'));
  })

  test('will return a stream for blob', async () => {
    storage.__setMockService();

    const stream = await blobManager.writeStreamForBlob('container-name', 'blob-name');
    expect(stream).toEqual({
      stream: 'dummy-stream'
    });
  })
})