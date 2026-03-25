const fs = require('fs');
const muhammara = require('muhammara');
const PDFDigitalForm = require("../../../src/utils/pdf-digital-form")

describe('pdf digital form', () => {
  test('should parse a stream-type text field value', () => {
    // Build a minimal mock pdfParser that presents a single Tx field
    // whose 'V' value has type ePDFObjectStream (rich text / large value).
    // This exercises the pdfParser.startReadingFromStream branch in parseTextFieldValue.
    const textBytes = Array.from(Buffer.from('hello'));

    const mockReadStream = {
      notEnded: jest.fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValue(false),
      read: jest.fn((n) => [textBytes.shift()])
    };

    const mockValueField = {
      getType: jest.fn().mockReturnValue(muhammara.ePDFObjectStream),
      toPDFStream: jest.fn().mockReturnValue('stream-obj')
    };

    const mockFieldDict = {
      exists: jest.fn((key) => ['T', 'Ff', 'FT', 'V'].includes(key)),
      queryObject: jest.fn((key) => {
        if (key === 'T') return { getType: () => muhammara.ePDFObjectLiteralString, toPDFLiteralString: () => ({ toText: () => 'myField' }) };
        if (key === 'Ff') return { toNumber: () => 0 };
        if (key === 'FT') return { toString: () => 'Tx' };
        return null;
      })
    };

    const mockFieldsArray = {
      getLength: jest.fn().mockReturnValue(1)
    };

    const mockAcroformDict = {
      exists: jest.fn((key) => key === 'Fields'),
    };

    const mockTrailer = {
      toPDFDictionary: jest.fn().mockReturnThis(),
    };

    const mockCatalogDict = {
      exists: jest.fn((key) => key === 'AcroForm'),
    };

    const mockPdfParser = {
      getTrailer: jest.fn().mockReturnValue(mockTrailer),
      queryDictionaryObject: jest.fn((dict, key) => {
        if (dict === mockTrailer && key === 'Root') return { toPDFDictionary: () => mockCatalogDict };
        if (dict === mockCatalogDict && key === 'AcroForm') return { toPDFDictionary: () => mockAcroformDict };
        if (dict === mockAcroformDict && key === 'Fields') return { toPDFArray: () => mockFieldsArray };
        if (dict === mockFieldDict && key === 'V') return mockValueField;
        return null;
      }),
      queryArrayObject: jest.fn().mockReturnValue({ toPDFDictionary: () => mockFieldDict }),
      startReadingFromStream: jest.fn().mockReturnValue(mockReadStream),
    };

    const form = new PDFDigitalForm(mockPdfParser);
    const result = form.createSimpleKeyValue();

    expect(mockPdfParser.startReadingFromStream).toHaveBeenCalledWith('stream-obj');
    expect(result['myField']).toBeDefined();
  });

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