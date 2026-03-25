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

  test('should parse a richtext Tx field with RV and V', () => {
    const mockRVField = {
      getType: jest.fn().mockReturnValue(muhammara.ePDFObjectLiteralString),
      toPDFLiteralString: jest.fn().mockReturnValue({ toText: () => '<p>rich</p>' })
    };
    const mockVField = {
      getType: jest.fn().mockReturnValue(muhammara.ePDFObjectLiteralString),
      toPDFLiteralString: jest.fn().mockReturnValue({ toText: () => 'plain' })
    };
    // Ff bit 26 (flags>>25 & 1) = richtext: flags = 1 << 25 = 33554432
    const mockFieldDict = {
      exists: jest.fn((key) => ['T', 'Ff', 'FT', 'V', 'RV'].includes(key)),
      queryObject: jest.fn((key) => {
        if (key === 'T') return { getType: () => muhammara.ePDFObjectLiteralString, toPDFLiteralString: () => ({ toText: () => 'rtField' }) };
        if (key === 'Ff') return { toNumber: () => 33554432 };
        if (key === 'FT') return { toString: () => 'Tx' };
        return null;
      })
    };
    const mockFieldsArray = { getLength: jest.fn().mockReturnValue(1) };
    const mockAcroformDict = { exists: jest.fn((key) => key === 'Fields') };
    const mockTrailer = { toPDFDictionary: jest.fn().mockReturnThis() };
    const mockCatalogDict = { exists: jest.fn((key) => key === 'AcroForm') };
    const mockPdfParser = {
      getTrailer: jest.fn().mockReturnValue(mockTrailer),
      queryDictionaryObject: jest.fn((dict, key) => {
        if (dict === mockTrailer && key === 'Root') return { toPDFDictionary: () => mockCatalogDict };
        if (dict === mockCatalogDict && key === 'AcroForm') return { toPDFDictionary: () => mockAcroformDict };
        if (dict === mockAcroformDict && key === 'Fields') return { toPDFArray: () => mockFieldsArray };
        if (dict === mockFieldDict && key === 'RV') return mockRVField;
        if (dict === mockFieldDict && key === 'V') return mockVField;
        return null;
      }),
      queryArrayObject: jest.fn().mockReturnValue({ toPDFDictionary: () => mockFieldDict }),
    };
    const form = new PDFDigitalForm(mockPdfParser);
    const result = form.createSimpleKeyValue();
    expect(result['rtField']).toBe('<p>rich</p>');
  });

  test('should parse a Ch choice field', () => {
    const mockVField = {
      getType: jest.fn().mockReturnValue(muhammara.ePDFObjectLiteralString),
      toPDFLiteralString: jest.fn().mockReturnValue({ toText: () => 'Option A' })
    };
    const mockFieldDict = {
      exists: jest.fn((key) => ['T', 'Ff', 'FT', 'V'].includes(key)),
      queryObject: jest.fn((key) => {
        if (key === 'T') return { getType: () => muhammara.ePDFObjectLiteralString, toPDFLiteralString: () => ({ toText: () => 'choiceField' }) };
        if (key === 'Ff') return { toNumber: () => 0 };
        if (key === 'FT') return { toString: () => 'Ch' };
        return null;
      })
    };
    const mockFieldsArray = { getLength: jest.fn().mockReturnValue(1) };
    const mockAcroformDict = { exists: jest.fn((key) => key === 'Fields') };
    const mockTrailer = { toPDFDictionary: jest.fn().mockReturnThis() };
    const mockCatalogDict = { exists: jest.fn((key) => key === 'AcroForm') };
    const mockPdfParser = {
      getTrailer: jest.fn().mockReturnValue(mockTrailer),
      queryDictionaryObject: jest.fn((dict, key) => {
        if (dict === mockTrailer && key === 'Root') return { toPDFDictionary: () => mockCatalogDict };
        if (dict === mockCatalogDict && key === 'AcroForm') return { toPDFDictionary: () => mockAcroformDict };
        if (dict === mockAcroformDict && key === 'Fields') return { toPDFArray: () => mockFieldsArray };
        if (dict === mockFieldDict && key === 'V') return mockVField;
        return null;
      }),
      queryArrayObject: jest.fn().mockReturnValue({ toPDFDictionary: () => mockFieldDict }),
    };
    const form = new PDFDigitalForm(mockPdfParser);
    const result = form.createSimpleKeyValue();
    expect(result['choiceField']).toBe('Option A');
  });

  test('should parse a Btn push button field', () => {
    // flags bit 17 (flags>>16 & 1) = push button: flags = 1 << 16 = 65536
    const mockFieldDict = {
      exists: jest.fn((key) => ['T', 'Ff', 'FT'].includes(key)),
      queryObject: jest.fn((key) => {
        if (key === 'T') return { getType: () => muhammara.ePDFObjectLiteralString, toPDFLiteralString: () => ({ toText: () => 'btnField' }) };
        if (key === 'Ff') return { toNumber: () => 65536 };
        if (key === 'FT') return { toString: () => 'Btn' };
        return null;
      })
    };
    const mockFieldsArray = { getLength: jest.fn().mockReturnValue(1) };
    const mockAcroformDict = { exists: jest.fn((key) => key === 'Fields') };
    const mockTrailer = { toPDFDictionary: jest.fn().mockReturnThis() };
    const mockCatalogDict = { exists: jest.fn((key) => key === 'AcroForm') };
    const mockPdfParser = {
      getTrailer: jest.fn().mockReturnValue(mockTrailer),
      queryDictionaryObject: jest.fn((dict, key) => {
        if (dict === mockTrailer && key === 'Root') return { toPDFDictionary: () => mockCatalogDict };
        if (dict === mockCatalogDict && key === 'AcroForm') return { toPDFDictionary: () => mockAcroformDict };
        if (dict === mockAcroformDict && key === 'Fields') return { toPDFArray: () => mockFieldsArray };
        return null;
      }),
      queryArrayObject: jest.fn().mockReturnValue({ toPDFDictionary: () => mockFieldDict }),
    };
    const form = new PDFDigitalForm(mockPdfParser);
    const result = form.createSimpleKeyValue();
    expect(result['btnField']).toBeUndefined();
  });

  test('should handle a HexString field value in toText via a Ch field', () => {
    const mockVField = {
      getType: jest.fn().mockReturnValue(muhammara.ePDFObjectHexString),
      toPDFHexString: jest.fn().mockReturnValue({ toText: () => 'hex value' })
    };
    const mockFieldDict = {
      exists: jest.fn((key) => ['T', 'Ff', 'FT', 'V'].includes(key)),
      queryObject: jest.fn((key) => {
        if (key === 'T') return { getType: () => muhammara.ePDFObjectLiteralString, toPDFLiteralString: () => ({ toText: () => 'hexField' }) };
        if (key === 'Ff') return { toNumber: () => 0 };
        if (key === 'FT') return { toString: () => 'Ch' };
        return null;
      })
    };
    const mockFieldsArray = { getLength: jest.fn().mockReturnValue(1) };
    const mockAcroformDict = { exists: jest.fn((key) => key === 'Fields') };
    const mockTrailer = { toPDFDictionary: jest.fn().mockReturnThis() };
    const mockCatalogDict = { exists: jest.fn((key) => key === 'AcroForm') };
    const mockPdfParser = {
      getTrailer: jest.fn().mockReturnValue(mockTrailer),
      queryDictionaryObject: jest.fn((dict, key) => {
        if (dict === mockTrailer && key === 'Root') return { toPDFDictionary: () => mockCatalogDict };
        if (dict === mockCatalogDict && key === 'AcroForm') return { toPDFDictionary: () => mockAcroformDict };
        if (dict === mockAcroformDict && key === 'Fields') return { toPDFArray: () => mockFieldsArray };
        if (dict === mockFieldDict && key === 'V') return mockVField;
        return null;
      }),
      queryArrayObject: jest.fn().mockReturnValue({ toPDFDictionary: () => mockFieldDict }),
    };
    const form = new PDFDigitalForm(mockPdfParser);
    const result = form.createSimpleKeyValue();
    expect(result['hexField']).toBe('hex value');
  });

  test('should use item.value fallback in toText when type is not LiteralString or HexString', () => {
    // Line 16: toText() else branch - item has neither LiteralString nor HexString type
    const mockFieldDict = {
      exists: jest.fn((key) => ['T', 'Ff', 'FT'].includes(key)),
      queryObject: jest.fn((key) => {
        if (key === 'T') return { getType: () => muhammara.ePDFObjectNull, value: 'fallbackField' };
        if (key === 'Ff') return { toNumber: () => 0 };
        if (key === 'FT') return { toString: () => 'Tx' };
        return null;
      })
    };
    const mockFieldsArray = { getLength: jest.fn().mockReturnValue(1) };
    const mockAcroformDict = { exists: jest.fn((key) => key === 'Fields') };
    const mockTrailer = { toPDFDictionary: jest.fn().mockReturnThis() };
    const mockCatalogDict = { exists: jest.fn((key) => key === 'AcroForm') };
    const mockPdfParser = {
      getTrailer: jest.fn().mockReturnValue(mockTrailer),
      queryDictionaryObject: jest.fn((dict, key) => {
        if (dict === mockTrailer && key === 'Root') return { toPDFDictionary: () => mockCatalogDict };
        if (dict === mockCatalogDict && key === 'AcroForm') return { toPDFDictionary: () => mockAcroformDict };
        if (dict === mockAcroformDict && key === 'Fields') return { toPDFArray: () => mockFieldsArray };
        return null;
      }),
      queryArrayObject: jest.fn().mockReturnValue({ toPDFDictionary: () => mockFieldDict }),
    };
    const form = new PDFDigitalForm(mockPdfParser);
    const result = form.createSimpleKeyValue();
    expect(result).toHaveProperty('fallbackField');
  });

  test('should return null from parseTextFieldValue when V is neither LiteralString nor Stream', () => {
    // Line 104: parseTextFieldValue else branch - V exists but wrong type
    const mockVField = { getType: jest.fn().mockReturnValue(muhammara.ePDFObjectNull) };
    const mockFieldDict = {
      exists: jest.fn((key) => ['T', 'Ff', 'FT', 'V'].includes(key)),
      queryObject: jest.fn((key) => {
        if (key === 'T') return { getType: () => muhammara.ePDFObjectLiteralString, toPDFLiteralString: () => ({ toText: () => 'txField' }) };
        if (key === 'Ff') return { toNumber: () => 0 };
        if (key === 'FT') return { toString: () => 'Tx' };
        return null;
      })
    };
    const mockFieldsArray = { getLength: jest.fn().mockReturnValue(1) };
    const mockAcroformDict = { exists: jest.fn((key) => key === 'Fields') };
    const mockTrailer = { toPDFDictionary: jest.fn().mockReturnThis() };
    const mockCatalogDict = { exists: jest.fn((key) => key === 'AcroForm') };
    const mockPdfParser = {
      getTrailer: jest.fn().mockReturnValue(mockTrailer),
      queryDictionaryObject: jest.fn((dict, key) => {
        if (dict === mockTrailer && key === 'Root') return { toPDFDictionary: () => mockCatalogDict };
        if (dict === mockCatalogDict && key === 'AcroForm') return { toPDFDictionary: () => mockAcroformDict };
        if (dict === mockAcroformDict && key === 'Fields') return { toPDFArray: () => mockFieldsArray };
        if (dict === mockFieldDict && key === 'V') return mockVField;
        return null;
      }),
      queryArrayObject: jest.fn().mockReturnValue({ toPDFDictionary: () => mockFieldDict }),
    };
    const form = new PDFDigitalForm(mockPdfParser);
    const result = form.createSimpleKeyValue();
    expect(result['txField']).toBeNull();
  });

  test('should return undefined from parseChoiceValue when V type is not LiteralString or HexString', () => {
    // Lines 117, 119: parseChoiceValue inner else - V exists but type is unrecognised
    const mockVField = { getType: jest.fn().mockReturnValue(muhammara.ePDFObjectNull) };
    const mockFieldDict = {
      exists: jest.fn((key) => ['T', 'Ff', 'FT', 'V'].includes(key)),
      queryObject: jest.fn((key) => {
        if (key === 'T') return { getType: () => muhammara.ePDFObjectLiteralString, toPDFLiteralString: () => ({ toText: () => 'chField' }) };
        if (key === 'Ff') return { toNumber: () => 0 };
        if (key === 'FT') return { toString: () => 'Ch' };
        return null;
      })
    };
    const mockFieldsArray = { getLength: jest.fn().mockReturnValue(1) };
    const mockAcroformDict = { exists: jest.fn((key) => key === 'Fields') };
    const mockTrailer = { toPDFDictionary: jest.fn().mockReturnThis() };
    const mockCatalogDict = { exists: jest.fn((key) => key === 'AcroForm') };
    const mockPdfParser = {
      getTrailer: jest.fn().mockReturnValue(mockTrailer),
      queryDictionaryObject: jest.fn((dict, key) => {
        if (dict === mockTrailer && key === 'Root') return { toPDFDictionary: () => mockCatalogDict };
        if (dict === mockCatalogDict && key === 'AcroForm') return { toPDFDictionary: () => mockAcroformDict };
        if (dict === mockAcroformDict && key === 'Fields') return { toPDFArray: () => mockFieldsArray };
        if (dict === mockFieldDict && key === 'V') return mockVField;
        return null;
      }),
      queryArrayObject: jest.fn().mockReturnValue({ toPDFDictionary: () => mockFieldDict }),
    };
    const form = new PDFDigitalForm(mockPdfParser);
    const result = form.createSimpleKeyValue();
    expect(result['chField']).toBeUndefined();
  });

  test('should return undefined from parseChoiceValue when V does not exist', () => {
    // Line 123: parseChoiceValue outer else - no V entry in dictionary
    const mockFieldDict = {
      exists: jest.fn((key) => ['T', 'Ff', 'FT'].includes(key)),
      queryObject: jest.fn((key) => {
        if (key === 'T') return { getType: () => muhammara.ePDFObjectLiteralString, toPDFLiteralString: () => ({ toText: () => 'noVField' }) };
        if (key === 'Ff') return { toNumber: () => 0 };
        if (key === 'FT') return { toString: () => 'Ch' };
        return null;
      })
    };
    const mockFieldsArray = { getLength: jest.fn().mockReturnValue(1) };
    const mockAcroformDict = { exists: jest.fn((key) => key === 'Fields') };
    const mockTrailer = { toPDFDictionary: jest.fn().mockReturnThis() };
    const mockCatalogDict = { exists: jest.fn((key) => key === 'AcroForm') };
    const mockPdfParser = {
      getTrailer: jest.fn().mockReturnValue(mockTrailer),
      queryDictionaryObject: jest.fn((dict, key) => {
        if (dict === mockTrailer && key === 'Root') return { toPDFDictionary: () => mockCatalogDict };
        if (dict === mockCatalogDict && key === 'AcroForm') return { toPDFDictionary: () => mockAcroformDict };
        if (dict === mockAcroformDict && key === 'Fields') return { toPDFArray: () => mockFieldsArray };
        return null;
      }),
      queryArrayObject: jest.fn().mockReturnValue({ toPDFDictionary: () => mockFieldDict }),
    };
    const form = new PDFDigitalForm(mockPdfParser);
    const result = form.createSimpleKeyValue();
    expect(result['noVField']).toBeUndefined();
  });

  test('should parse a Sig signature field', () => {
    // Lines 176-177: Sig case in parseFieldsValueData
    const mockFieldDict = {
      exists: jest.fn((key) => ['T', 'Ff', 'FT'].includes(key)),
      queryObject: jest.fn((key) => {
        if (key === 'T') return { getType: () => muhammara.ePDFObjectLiteralString, toPDFLiteralString: () => ({ toText: () => 'sigField' }) };
        if (key === 'Ff') return { toNumber: () => 0 };
        if (key === 'FT') return { toString: () => 'Sig' };
        return null;
      })
    };
    const mockFieldsArray = { getLength: jest.fn().mockReturnValue(1) };
    const mockAcroformDict = { exists: jest.fn((key) => key === 'Fields') };
    const mockTrailer = { toPDFDictionary: jest.fn().mockReturnThis() };
    const mockCatalogDict = { exists: jest.fn((key) => key === 'AcroForm') };
    const mockPdfParser = {
      getTrailer: jest.fn().mockReturnValue(mockTrailer),
      queryDictionaryObject: jest.fn((dict, key) => {
        if (dict === mockTrailer && key === 'Root') return { toPDFDictionary: () => mockCatalogDict };
        if (dict === mockCatalogDict && key === 'AcroForm') return { toPDFDictionary: () => mockAcroformDict };
        if (dict === mockAcroformDict && key === 'Fields') return { toPDFArray: () => mockFieldsArray };
        return null;
      }),
      queryArrayObject: jest.fn().mockReturnValue({ toPDFDictionary: () => mockFieldDict }),
    };
    const form = new PDFDigitalForm(mockPdfParser);
    const result = form.createSimpleKeyValue();
    expect(result['sigField']).toBeUndefined();
  });

  test('should return null when all top-level fields are widget annotations', () => {
    // Line 212: parseField returns null for widget annotation (no T, no Kids, Subtype=Widget)
    // Line 248: parseFieldsArray returns null when result is empty
    const mockWidgetFieldDict = {
      exists: jest.fn((key) => key === 'Subtype'),
      queryObject: jest.fn((key) => {
        if (key === 'Subtype') return { toString: () => 'Widget' };
        return null;
      })
    };
    const mockFieldsArray = { getLength: jest.fn().mockReturnValue(1) };
    const mockAcroformDict = { exists: jest.fn((key) => key === 'Fields') };
    const mockTrailer = { toPDFDictionary: jest.fn().mockReturnThis() };
    const mockCatalogDict = { exists: jest.fn((key) => key === 'AcroForm') };
    const mockPdfParser = {
      getTrailer: jest.fn().mockReturnValue(mockTrailer),
      queryDictionaryObject: jest.fn((dict, key) => {
        if (dict === mockTrailer && key === 'Root') return { toPDFDictionary: () => mockCatalogDict };
        if (dict === mockCatalogDict && key === 'AcroForm') return { toPDFDictionary: () => mockAcroformDict };
        if (dict === mockAcroformDict && key === 'Fields') return { toPDFArray: () => mockFieldsArray };
        return null;
      }),
      queryArrayObject: jest.fn().mockReturnValue({ toPDFDictionary: () => mockWidgetFieldDict }),
    };
    const form = new PDFDigitalForm(mockPdfParser);
    expect(form.fields).toBeNull();
    expect(form.createSimpleKeyValue()).toEqual({});
  });

  test('should return null from parseFieldsValueData when no fieldType is present', () => {
    // Line 131: parseFieldsValueData returns null early when FT is absent from both field and inherited props
    const mockFieldDict = {
      exists: jest.fn((key) => ['T', 'Ff'].includes(key)),
      queryObject: jest.fn((key) => {
        if (key === 'T') return { getType: () => muhammara.ePDFObjectLiteralString, toPDFLiteralString: () => ({ toText: () => 'noFTField' }) };
        if (key === 'Ff') return { toNumber: () => 0 };
        return null;
      })
    };
    const mockFieldsArray = { getLength: jest.fn().mockReturnValue(1) };
    const mockAcroformDict = { exists: jest.fn((key) => key === 'Fields') };
    const mockTrailer = { toPDFDictionary: jest.fn().mockReturnThis() };
    const mockCatalogDict = { exists: jest.fn((key) => key === 'AcroForm') };
    const mockPdfParser = {
      getTrailer: jest.fn().mockReturnValue(mockTrailer),
      queryDictionaryObject: jest.fn((dict, key) => {
        if (dict === mockTrailer && key === 'Root') return { toPDFDictionary: () => mockCatalogDict };
        if (dict === mockCatalogDict && key === 'AcroForm') return { toPDFDictionary: () => mockAcroformDict };
        if (dict === mockAcroformDict && key === 'Fields') return { toPDFArray: () => mockFieldsArray };
        return null;
      }),
      queryArrayObject: jest.fn().mockReturnValue({ toPDFDictionary: () => mockFieldDict }),
    };
    const form = new PDFDigitalForm(mockPdfParser);
    const result = form.createSimpleKeyValue();
    expect(Object.keys(result)).toContain('noFTField');
  });

  test('should return true from hasForm when PDF has an AcroForm', () => {
    // Line 281: hasForm() method
    const mockFieldDict = {
      exists: jest.fn((key) => ['T', 'Ff', 'FT'].includes(key)),
      queryObject: jest.fn((key) => {
        if (key === 'T') return { getType: () => muhammara.ePDFObjectLiteralString, toPDFLiteralString: () => ({ toText: () => 'f' }) };
        if (key === 'Ff') return { toNumber: () => 0 };
        if (key === 'FT') return { toString: () => 'Sig' };
        return null;
      })
    };
    const mockFieldsArray = { getLength: jest.fn().mockReturnValue(1) };
    const mockAcroformDict = { exists: jest.fn((key) => key === 'Fields') };
    const mockTrailer = { toPDFDictionary: jest.fn().mockReturnThis() };
    const mockCatalogDict = { exists: jest.fn((key) => key === 'AcroForm') };
    const mockPdfParser = {
      getTrailer: jest.fn().mockReturnValue(mockTrailer),
      queryDictionaryObject: jest.fn((dict, key) => {
        if (dict === mockTrailer && key === 'Root') return { toPDFDictionary: () => mockCatalogDict };
        if (dict === mockCatalogDict && key === 'AcroForm') return { toPDFDictionary: () => mockAcroformDict };
        if (dict === mockAcroformDict && key === 'Fields') return { toPDFArray: () => mockFieldsArray };
        return null;
      }),
      queryArrayObject: jest.fn().mockReturnValue({ toPDFDictionary: () => mockFieldDict }),
    };
    const form = new PDFDigitalForm(mockPdfParser);
    expect(form.hasForm()).toBe(true);
  });

  test('should recurse into field kids in accumulateFieldsValues', () => {
    // Line 281: accumulateFieldsValues recursion - parent field has kids (non-terminal node)
    const mockChildFieldDict = {
      exists: jest.fn((key) => ['T', 'Ff', 'FT', 'V'].includes(key)),
      queryObject: jest.fn((key) => {
        if (key === 'T') return { getType: () => muhammara.ePDFObjectLiteralString, toPDFLiteralString: () => ({ toText: () => 'child' }) };
        if (key === 'Ff') return { toNumber: () => 0 };
        if (key === 'FT') return { toString: () => 'Tx' };
        return null;
      })
    };
    const mockChildV = {
      getType: jest.fn().mockReturnValue(muhammara.ePDFObjectLiteralString),
      toPDFLiteralString: jest.fn().mockReturnValue({ toText: () => 'child value' })
    };
    const mockParentFieldDict = {
      exists: jest.fn((key) => ['T', 'Ff', 'Kids'].includes(key)),
      queryObject: jest.fn((key) => {
        if (key === 'T') return { getType: () => muhammara.ePDFObjectLiteralString, toPDFLiteralString: () => ({ toText: () => 'parent' }) };
        if (key === 'Ff') return { toNumber: () => 0 };
        return null;
      })
    };
    const mockKidsArray = { getLength: jest.fn().mockReturnValue(1) };
    const mockFieldsArray = { getLength: jest.fn().mockReturnValue(1) };
    const mockAcroformDict = { exists: jest.fn((key) => key === 'Fields') };
    const mockTrailer = { toPDFDictionary: jest.fn().mockReturnThis() };
    const mockCatalogDict = { exists: jest.fn((key) => key === 'AcroForm') };
    const mockPdfParser = {
      getTrailer: jest.fn().mockReturnValue(mockTrailer),
      queryDictionaryObject: jest.fn((dict, key) => {
        if (dict === mockTrailer && key === 'Root') return { toPDFDictionary: () => mockCatalogDict };
        if (dict === mockCatalogDict && key === 'AcroForm') return { toPDFDictionary: () => mockAcroformDict };
        if (dict === mockAcroformDict && key === 'Fields') return { toPDFArray: () => mockFieldsArray };
        if (dict === mockParentFieldDict && key === 'Kids') return { toPDFArray: () => mockKidsArray };
        if (dict === mockChildFieldDict && key === 'V') return mockChildV;
        return null;
      }),
      queryArrayObject: jest.fn((arr) => {
        if (arr === mockFieldsArray) return { toPDFDictionary: () => mockParentFieldDict };
        if (arr === mockKidsArray) return { toPDFDictionary: () => mockChildFieldDict };
        return null;
      }),
    };
    const form = new PDFDigitalForm(mockPdfParser);
    const result = form.createSimpleKeyValue();
    expect(result['parent.child']).toBe('child value');
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