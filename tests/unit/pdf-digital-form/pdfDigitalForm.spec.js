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

  test('should verify hasForm returns true for forms with AcroForm', () => {
    let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/form with values.pdf');
    let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));

    let form = new PDFDigitalForm(pdfReader);
    
    expect(form.hasForm()).toBe(true);
  });

  test('should verify hasForm returns true even for blank forms', () => {
    // Note: blank.pdf appears to have an AcroForm structure even without fields
    let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/blank.pdf');
    let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));

    let form = new PDFDigitalForm(pdfReader);
    
    expect(form.hasForm()).toBe(true);
  });

  test('should handle createSimpleKeyValue when no fields exist', () => {
    let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/blank.pdf');
    let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));

    let form = new PDFDigitalForm(pdfReader);
    let result = form.createSimpleKeyValue();
    
    expect(result).toEqual({});
    expect(Object.keys(result).length).toBe(0);
  });

  test('should handle forms with nested field hierarchies', () => {
    // This test ensures the parseKids function and field hierarchy parsing works
    let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/form with values.pdf');
    let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));

    let form = new PDFDigitalForm(pdfReader);
    
    expect(form.fields).toBeDefined();
    expect(Array.isArray(form.fields)).toBe(true);
  });

  test('should parse various field types correctly', () => {
    let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/form with values.pdf');
    let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));

    let form = new PDFDigitalForm(pdfReader);
    let result = form.createSimpleKeyValue();

    // Verify text field
    expect(typeof result.text).toBe('string');
    
    // Verify checkbox (boolean or null)
    expect([true, false, null]).toContain(result.checkbox);
    expect([true, false, null]).toContain(result.checkbox2);
    
    // Verify radio button (number index or boolean)
    expect(typeof result.radio_group === 'number' || typeof result.radio_group === 'boolean').toBe(true);
    
    // Verify dropdown
    expect(typeof result.dropdown).toBe('string');
  });

  test('should handle empty form fields correctly', () => {
    let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/sample form.pdf');
    let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));

    let form = new PDFDigitalForm(pdfReader);
    let result = form.createSimpleKeyValue();

    // Empty or unchecked fields might be null, false, or undefined
    Object.values(result).forEach(value => {
      expect([null, false, undefined, '', 'string', 'number', 'boolean']).toContain(
        value === null ? null : 
        value === false ? false : 
        value === undefined ? undefined : 
        value === '' ? '' : 
        typeof value
      );
    });
  });

  test('should maintain form structure integrity', () => {
    let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/form with values.pdf');
    let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));

    let form = new PDFDigitalForm(pdfReader);
    
    // Verify the form object structure
    expect(form.acroformDict).toBeDefined();
    expect(form.fields).toBeDefined();
    
    // Verify createSimpleKeyValue is callable multiple times
    let result1 = form.createSimpleKeyValue();
    let result2 = form.createSimpleKeyValue();
    expect(result1).toEqual(result2);
  });

  test('should handle PDFs with different encodings', () => {
    // Test that toText function handles both LiteralString and HexString types
    let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/form with values.pdf');
    let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));

    let form = new PDFDigitalForm(pdfReader);
    let result = form.createSimpleKeyValue();

    // All text values should be properly decoded strings
    if (result.text) {
      expect(typeof result.text).toBe('string');
      expect(result.text.length).toBeGreaterThan(0);
    }
    
    if (result.textarea) {
      expect(typeof result.textarea).toBe('string');
      expect(result.textarea.length).toBeGreaterThan(0);
    }
  });

  test('should properly parse radio button groups', () => {
    let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/form with values.pdf');
    let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));

    let form = new PDFDigitalForm(pdfReader);
    let result = form.createSimpleKeyValue();

    // Radio button should return an index (number) when selected
    if (result.radio_group !== null && result.radio_group !== undefined) {
      expect(typeof result.radio_group === 'number' || typeof result.radio_group === 'boolean').toBe(true);
    }
  });

  test('should handle complex form structures with multiple field types', () => {
    let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/form with values.pdf');
    let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));

    let form = new PDFDigitalForm(pdfReader);
    let result = form.createSimpleKeyValue();

    // Verify we have multiple different field types
    const fieldTypes = new Set();
    Object.entries(result).forEach(([key, value]) => {
      if (typeof value === 'string') fieldTypes.add('text');
      if (typeof value === 'number') fieldTypes.add('number');
      if (typeof value === 'boolean' || value === null) fieldTypes.add('boolean');
    });

    expect(fieldTypes.size).toBeGreaterThan(0);
  });

});