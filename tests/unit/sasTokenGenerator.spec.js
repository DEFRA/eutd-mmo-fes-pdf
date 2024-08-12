const config = require('../../src/config');
const { generate } = require('../../src/storage/sas/tokenGenerator');

describe('sas token generator', () => {

    test('should generate a standard token', async () => {

      const container = 'test';
      const blobName = 'test.jpg';

      const token = generate(container, blobName);

      expect(token).toEqual({
        container,
        blobName,
        uri: blobName,
      })

    })

    test('should contain a qrUri', async () => {

        const container = 'test';
        const blobName = 'test.pdf';

        const token = generate(container, blobName);

        expect(token).toEqual({
          container,
          blobName,
          uri: blobName,
          qrUri: `${config.SERVICE_URL}/qr/export-certificates/${blobName}`
        })

    })

});