const muhammara = require('muhammara');
const fs = require('fs');
const PDFDigitalForm = require('../../../src/utils/pdf-digital-form');

describe('PDFParser', function() {

    jest.setTimeout(60000);

    test('should complete without error', function() {

        const data = fs.readFileSync('./tests/unit/parse-export-cert/fixtures/parse-export-cert.pdf');
        let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));

        let form = new PDFDigitalForm(pdfReader);
        console.log(form.hasForm());
        let result = form.createSimpleKeyValue();

        console.log(result);

    });
});