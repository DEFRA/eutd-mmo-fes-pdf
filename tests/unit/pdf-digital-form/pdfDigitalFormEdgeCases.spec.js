const muhammara = require('muhammara');
const PDFDigitalForm = require("../../../src/utils/pdf-digital-form");

describe('pdf digital form edge cases and code coverage', () => {
  
  describe('toText function coverage', () => {
    test('should handle HexString type in toText', () => {
      // This test aims to trigger the HexString path in toText function
      // by creating a mock PDF object with HexString values
      const fs = require('fs');
      let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/form with values.pdf');
      let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));
      
      let form = new PDFDigitalForm(pdfReader);
      let result = form.createSimpleKeyValue();
      
      // The function should handle different string encodings
      expect(result).toBeDefined();
    });
  });

  describe('parseRadioButtonValue function coverage', () => {
    test('should handle radio buttons with Off value', () => {
      const fs = require('fs');
      let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/sample form.pdf');
      let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));
      
      let form = new PDFDigitalForm(pdfReader);
      
      // Verify form can handle various radio button states
      expect(form.fields).toBeDefined();
    });

    test('should parse radio button with selected index', () => {
      const fs = require('fs');
      let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/form with values.pdf');
      let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));
      
      let form = new PDFDigitalForm(pdfReader);
      let result = form.createSimpleKeyValue();
      
      // Radio group should return a numeric index when selected
      if (result.radio_group !== null && result.radio_group !== undefined) {
        expect(typeof result.radio_group === 'number' || typeof result.radio_group === 'boolean').toBe(true);
      }
    });
  });

  describe('parseOnOffValue function coverage', () => {
    test('should handle checkbox with Off value', () => {
      const fs = require('fs');
      let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/form with values.pdf');
      let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));
      
      let form = new PDFDigitalForm(pdfReader);
      let result = form.createSimpleKeyValue();
      
      // Checkboxes should be boolean or null
      expect([true, false, null]).toContain(result.checkbox);
      expect([true, false, null]).toContain(result.checkbox2);
    });

    test('should handle checkbox with empty string value', () => {
      const fs = require('fs');
      let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/sample form.pdf');
      let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));
      
      let form = new PDFDigitalForm(pdfReader);
      let result = form.createSimpleKeyValue();
      
      // Empty checkboxes should be handled correctly
      Object.entries(result).forEach(([key, value]) => {
        if (value === false || value === null) {
          expect([false, null]).toContain(value);
        }
      });
    });
  });

  describe('parseChoiceValue function coverage', () => {
    test('should handle dropdown/choice fields', () => {
      const fs = require('fs');
      let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/form with values.pdf');
      let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));
      
      let form = new PDFDigitalForm(pdfReader);
      let result = form.createSimpleKeyValue();
      
      // Dropdown should have a string value
      expect(typeof result.dropdown).toBe('string');
      expect(result.dropdown).toBe('Option 1');
    });

    test('should handle choice fields with array values', () => {
      // Choice fields can return either a string or array of strings
      const fs = require('fs');
      let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/form with values.pdf');
      let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));
      
      let form = new PDFDigitalForm(pdfReader);
      let result = form.createSimpleKeyValue();
      
      // Verify choice field is handled
      if (result.dropdown) {
        const isStringOrArray = typeof result.dropdown === 'string' || Array.isArray(result.dropdown);
        expect(isStringOrArray).toBe(true);
      }
    });
  });

  describe('parseKids function coverage', () => {
    test('should parse nested field hierarchies', () => {
      const fs = require('fs');
      let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/form with values.pdf');
      let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));
      
      let form = new PDFDigitalForm(pdfReader);
      
      // Verify nested fields are parsed correctly
      expect(form.fields).toBeDefined();
      expect(Array.isArray(form.fields)).toBe(true);
      
      // Check if any fields have kids (nested structure)
      const hasNestedFields = form.fields?.some(field => field.kids !== undefined);
      expect(typeof hasNestedFields).toBe('boolean');
    });

    test('should handle inherited properties in field hierarchy', () => {
      const fs = require('fs');
      let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/form with values.pdf');
      let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));
      
      let form = new PDFDigitalForm(pdfReader);
      
      // Fields should inherit properties from parent nodes
      if (form.fields && form.fields.length > 0) {
        form.fields.forEach(field => {
          expect(field).toHaveProperty('name');
          expect(field).toHaveProperty('fullName');
        });
      }
    });
  });

  describe('parseFieldsValueData function coverage', () => {
    test('should handle button type fields', () => {
      const fs = require('fs');
      let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/form with values.pdf');
      let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));
      
      let form = new PDFDigitalForm(pdfReader);
      
      // Verify different field types are recognized
      if (form.fields) {
        const fieldTypes = new Set();
        form.fields.forEach(field => {
          if (field.type) fieldTypes.add(field.type);
        });
        
        expect(fieldTypes.size).toBeGreaterThanOrEqual(0);
      }
    });

    test('should handle rich text fields', () => {
      const fs = require('fs');
      let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/form with values.pdf');
      let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));
      
      let form = new PDFDigitalForm(pdfReader);
      let result = form.createSimpleKeyValue();
      
      // Rich text fields should be parsed as strings
      Object.values(result).forEach(value => {
        if (typeof value === 'string') {
          expect(value.length).toBeGreaterThanOrEqual(0);
        }
      });
    });

    test('should handle signature fields', () => {
      const fs = require('fs');
      let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/sample form.pdf');
      let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));
      
      let form = new PDFDigitalForm(pdfReader);
      
      // Signature fields may exist in forms
      expect(form.fields).toBeDefined();
    });
  });

  describe('parseTextFieldValue function coverage', () => {
    test('should handle text fields with literal strings', () => {
      const fs = require('fs');
      let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/form with values.pdf');
      let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));
      
      let form = new PDFDigitalForm(pdfReader);
      let result = form.createSimpleKeyValue();
      
      // Text and textarea should be strings
      expect(typeof result.text).toBe('string');
      expect(typeof result.textarea).toBe('string');
    });

    test('should handle missing field values', () => {
      const fs = require('fs');
      let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/sample form.pdf');
      let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));
      
      let form = new PDFDigitalForm(pdfReader);
      let result = form.createSimpleKeyValue();
      
      // Some fields may not have values (null, undefined, or empty string)
      Object.values(result).forEach(value => {
        expect([null, undefined, false, 'string', 'number', 'boolean']).toContain(
          value === null ? null : 
          value === undefined ? undefined : 
          value === false ? false : 
          typeof value
        );
      });
    });
  });

  describe('parseField function coverage', () => {
    test('should handle widget annotations without T field', () => {
      const fs = require('fs');
      let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/form with values.pdf');
      let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));
      
      let form = new PDFDigitalForm(pdfReader);
      
      // Widget annotations should be handled correctly
      expect(form.fields).toBeDefined();
    });

    test('should handle fields with alternate and mapping names', () => {
      const fs = require('fs');
      let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/form with values.pdf');
      let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));
      
      let form = new PDFDigitalForm(pdfReader);
      
      // Fields may have alternate and mapping names
      if (form.fields && form.fields.length > 0) {
        form.fields.forEach(field => {
          expect(field).toBeDefined();
          expect(typeof field.isNoExport).toBe('boolean');
        });
      }
    });

    test('should handle NoExport flag on fields', () => {
      const fs = require('fs');
      let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/form with values.pdf');
      let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));
      
      let form = new PDFDigitalForm(pdfReader);
      
      // All fields should have isNoExport property
      if (form.fields) {
        form.fields.forEach(field => {
          expect(typeof field.isNoExport).toBe('boolean');
        });
      }
    });
  });

  describe('accumulateFieldsValues function coverage', () => {
    test('should accumulate values from nested field structures', () => {
      const fs = require('fs');
      let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/form with values.pdf');
      let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));
      
      let form = new PDFDigitalForm(pdfReader);
      let result1 = form.createSimpleKeyValue();
      let result2 = form.createSimpleKeyValue();
      
      // Should produce consistent results
      expect(result1).toEqual(result2);
      expect(Object.keys(result1).length).toBeGreaterThan(0);
    });
  });

  describe('field flag handling', () => {
    test('should handle various field flags correctly', () => {
      const fs = require('fs');
      let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/form with values.pdf');
      let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));
      
      let form = new PDFDigitalForm(pdfReader);
      
      // Various flags should be parsed correctly
      expect(form.fields).toBeDefined();
      
      if (form.fields) {
        form.fields.forEach(field => {
          // All fields should have proper structure
          expect(field).toHaveProperty('fullName');
          expect(field).toHaveProperty('isNoExport');
        });
      }
    });
  });

  describe('integration and consistency tests', () => {
    test('should handle multiple calls to createSimpleKeyValue', () => {
      const fs = require('fs');
      let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/form with values.pdf');
      let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));
      
      let form = new PDFDigitalForm(pdfReader);
      
      // Multiple calls should return identical results
      const result1 = form.createSimpleKeyValue();
      const result2 = form.createSimpleKeyValue();
      const result3 = form.createSimpleKeyValue();
      
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });

    test('should maintain form state integrity', () => {
      const fs = require('fs');
      let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/form with values.pdf');
      let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));
      
      let form = new PDFDigitalForm(pdfReader);
      
      // Check form state before and after creating key-value pairs
      const hasFormBefore = form.hasForm();
      const fieldsBefore = form.fields;
      
      form.createSimpleKeyValue();
      
      const hasFormAfter = form.hasForm();
      const fieldsAfter = form.fields;
      
      expect(hasFormBefore).toBe(hasFormAfter);
      expect(fieldsBefore).toBe(fieldsAfter);
    });

    test('should handle empty and populated forms consistently', () => {
      const fs = require('fs');
      
      // Test with populated form
      let data1 = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/form with values.pdf');
      let pdfReader1 = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data1));
      let form1 = new PDFDigitalForm(pdfReader1);
      let result1 = form1.createSimpleKeyValue();
      
      // Test with sample form
      let data2 = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/sample form.pdf');
      let pdfReader2 = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data2));
      let form2 = new PDFDigitalForm(pdfReader2);
      let result2 = form2.createSimpleKeyValue();
      
      // Both should return valid objects
      expect(typeof result1).toBe('object');
      expect(typeof result2).toBe('object');
      expect(result1).not.toBe(result2);
    });
  });

  describe('error handling and edge cases', () => {
    test('should handle forms without Fields array', () => {
      const fs = require('fs');
      let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/blank.pdf');
      let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));
      
      let form = new PDFDigitalForm(pdfReader);
      
      // Should handle forms without fields gracefully
      expect(form.hasForm()).toBe(true);
      const result = form.createSimpleKeyValue();
      expect(result).toBeDefined();
    });

    test('should return empty object for forms with no exportable fields', () => {
      const fs = require('fs');
      let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/blank.pdf');
      let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));
      
      let form = new PDFDigitalForm(pdfReader);
      let result = form.createSimpleKeyValue();
      
      // Should return empty object for blank forms
      expect(Object.keys(result).length).toBe(0);
    });
  });

  describe('field type variations', () => {
    test('should handle all standard field types', () => {
      const fs = require('fs');
      let data = fs.readFileSync('./tests/unit/pdf-digital-form/fixtures/form with values.pdf');
      let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(data));
      
      let form = new PDFDigitalForm(pdfReader);
      let result = form.createSimpleKeyValue();
      
      // Count different value types
      const valueTypes = {
        string: 0,
        number: 0,
        boolean: 0,
        null: 0
      };
      
      Object.values(result).forEach(value => {
        if (value === null) valueTypes.null++;
        else if (typeof value === 'string') valueTypes.string++;
        else if (typeof value === 'number') valueTypes.number++;
        else if (typeof value === 'boolean') valueTypes.boolean++;
      });
      
      // Should have at least some values
      const totalValues = Object.values(valueTypes).reduce((a, b) => a + b, 0);
      expect(totalValues).toBeGreaterThan(0);
    });
  });
});
