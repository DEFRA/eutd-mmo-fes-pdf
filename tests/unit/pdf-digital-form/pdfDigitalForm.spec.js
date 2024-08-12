const fs = require('fs');
const muhammara = require('muhammara');
const PDFDigitalForm = require("../../../src/utils/pdf-digital-form")

describe('pdf digital form', () => {
  test('should parse pdf', async () => {
    let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/sample form.pdf');
    let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));

    let form = new PDFDigitalForm(pdfReader);
    let result = form.createSimpleKeyValue();
    const test = Object.keys(result);

    expect(test.length).toBeGreaterThan(0);
  });

  test('should parse pdf with no form fields', async () => {
    let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/blank.pdf');
    let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));

    let form = new PDFDigitalForm(pdfReader);
    let result = form.createSimpleKeyValue();
    
    expect(Object.keys(result)).toEqual([])
  });

  test('should parse pdf and retrieve values from form fields', async () => {
    let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/form with values.pdf');
    let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));

    let form = new PDFDigitalForm(pdfReader);
    let result = form.createSimpleKeyValue();

    expect(Object.keys(result)).toEqual([
      "text",
      "textarea",
      "radio_group",
      "checkbox",
      "checkbox2",
      "dropdown",
    ]);

    expect(Object.values(result)).toEqual([
      'Test Value',
      'Test value 2',
      0,
      false,
      null,
      'Option 1'
    ])
  });

});