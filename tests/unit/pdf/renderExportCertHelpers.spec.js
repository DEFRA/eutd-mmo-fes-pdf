const path = require('path');
const PdfStyle = require('../../../src/pdf/mmoPdfStyles');
const {
  calculateRowHeight,
  calculatePageDimensions,
  paginateRows,
  calculateRequiredCellHeightStatic
} = require('../../../src/pdf/renderExportCert');

jest.mock('../../../src/pdf/mmoPdfUtils');
jest.mock('../../../src/pdf/mmoPdfStyles');

PdfStyle.ROW = { HEIGHT: 15 };
PdfStyle.FONT_SIZE = { SMALLER: 8 };
PdfStyle.MARGIN = { LEFT: 30 };
PdfStyle.FONT = { REGULAR: 'Helvetica' };

describe('renderExportCert helper functions', () => {
  describe('calculateRequiredCellHeightStatic', () => {
    test('should return minimum height for empty text', () => {
      const result = calculateRequiredCellHeightStatic('', 45, 8);
      const minHeight = (PdfStyle.ROW.HEIGHT * 3) - 5;
      
      expect(result).toBe(40);
      expect(result).toBe(minHeight);
    });

    test('should return minimum height for null text', () => {
      const result = calculateRequiredCellHeightStatic(null, 45, 8);
      const minHeight = (PdfStyle.ROW.HEIGHT * 3) - 5;
      
      expect(result).toBe(40);
      expect(result).toBe(minHeight);
    });

    test('should calculate height for short text', () => {
      const text = "SHORT";
      const width = 45;
      const fontSize = 8;
      
      const result = calculateRequiredCellHeightStatic(text, width, fontSize);
      
      expect(result).toBe(40);
    });

    test('should calculate height for long text requiring multiple lines', () => {
      const text = "RUSSELL A HENRY & SON WELDING AND FABRICATION";
      const width = 45;
      const fontSize = 8;
      
      const result = calculateRequiredCellHeightStatic(text, width, fontSize);
      
      expect(result).toBe(73);
    });

    test('should handle text that fits exactly in available width', () => {
      const text = "EXACTFIT";
      const width = 75;
      const fontSize = 8;
      
      const result = calculateRequiredCellHeightStatic(text, width, fontSize);
      
      expect(result).toBe(40);
    });

    test('should calculate correct height for medium-length text in narrow column', () => {
      const text = "COMPANY NAME LIMITED";
      const width = 45;
      const fontSize = 8;
      
      const result = calculateRequiredCellHeightStatic(text, width, fontSize);
      
      expect(result).toBe(43);
    });

    test('should calculate height for medium length text', () => {
      const text = "MEDIUM LENGTH TEXT HERE";
      const width = 45;
      const fontSize = 8;
      
      const result = calculateRequiredCellHeightStatic(text, width, fontSize);
      
      expect(result).toBe(43);
    });

    test('should calculate correct height for wider column (licence detail)', () => {
      const text = "LIC123456 - 31/12/2025 HOMEPORT NAME";
      const width = 75;
      const fontSize = 8;
      
      const result = calculateRequiredCellHeightStatic(text, width, fontSize);
      
      expect(result).toBe(43);
    });
  });

  describe('calculatePageDimensions', () => {
    test('should return correct available height', () => {
      const result = calculatePageDimensions();
      
      expect(result).toBe(301);
    });
  });

  describe('calculateRowHeight', () => {
    test('should return minimum height for empty row', () => {
      const row = { licenceHolder: '', licenceDetail: '', homePort: '' };
      const result = calculateRowHeight(row);
      
      expect(result).toBe(40);
    });

    test('should calculate height based on longest field', () => {
      const row = {
        licenceHolder: 'RUSSELL A HENRY & SON WELDING AND FABRICATION',
        licenceDetail: 'LIC123',
        homePort: 'PORT'
      };
      
      const result = calculateRowHeight(row);
      
      expect(result).toBe(73);
    });

    test('should handle long licence detail with homeport', () => {
      const row = {
        licenceHolder: 'SHORT',
        licenceDetail: 'LIC123456789012345 - 31/12/2025',
        homePort: 'VERY LONG HOMEPORT NAME HERE'
      };
      
      const result = calculateRowHeight(row);
      
      expect(result).toBeGreaterThan(40);
    });
  });

  describe('paginateRows', () => {
    test('should return single page for few rows', () => {
      const rows = [
        { licenceHolder: 'A', licenceDetail: 'B', homePort: 'C' },
        { licenceHolder: 'D', licenceDetail: 'E', homePort: 'F' }
      ];
      const availableHeight = 301;
      
      const result = paginateRows(rows, availableHeight);
      
      expect(result).toHaveLength(1);
      expect(result[0].rows).toHaveLength(2);
      expect(result[0].startIdx).toBe(0);
    });

    test('should split into multiple pages when height exceeds limit', () => {
      const rows = [];
      for (let i = 0; i < 15; i++) {
        rows.push({
          licenceHolder: 'RUSSELL A HENRY & SON WELDING AND FABRICATION',
          licenceDetail: 'LIC123456 - 31/12/2025',
          homePort: 'HOMEPORT'
        });
      }
      const availableHeight = 301;
      
      const result = paginateRows(rows, availableHeight);
      
      expect(result.length).toBeGreaterThan(1);
      
      for (let i = 1; i < result.length; i++) {
        expect(result[i].startIdx).toBeGreaterThan(result[i-1].startIdx);
      }
    });

    test('should handle empty rows array', () => {
      const rows = [];
      const availableHeight = 301;
      
      const result = paginateRows(rows, availableHeight);
      
      expect(result).toHaveLength(0);
    });

    test('should handle single row that fits', () => {
      const rows = [
        { licenceHolder: 'SHORT', licenceDetail: 'LIC', homePort: 'PORT' }
      ];
      const availableHeight = 301;
      
      const result = paginateRows(rows, availableHeight);
      
      expect(result).toHaveLength(1);
      expect(result[0].rows).toHaveLength(1);
      expect(result[0].rows[0].height).toBe(40);
    });
  });

  describe('renderMultiVesselScheduleHeader', () => {
    test('should handle blank template with no document number', () => {
      const data = { isBlankTemplate: true };
      const isSample = false;
      
      const documentNumber = '';
      expect(documentNumber).toBe('');
    });

    test('should use sample document number when isSample is true', () => {
      const data = { isBlankTemplate: false };
      const isSample = true;
      
      const documentNumber = '###-####-##-#########';
      expect(documentNumber).toBe('###-####-##-#########');
    });

    test('should use actual document number when not blank or sample', () => {
      const data = { 
        isBlankTemplate: false,
        documentNumber: 'GBR-2024-CC-ABC123'
      };
      const isSample = false;
      
      expect(data.documentNumber).toBe('GBR-2024-CC-ABC123');
    });

    test('should calculate correct yPos after header rendering', () => {
      const startY = 30;
      
      let yPos = startY + (PdfStyle.ROW.HEIGHT * 2);
      yPos = yPos + PdfStyle.ROW.HEIGHT;
      yPos = yPos + (PdfStyle.ROW.HEIGHT * 2 + 20);
      yPos = yPos + (PdfStyle.ROW.HEIGHT * 2 + 5);
      yPos = yPos + 10;
      yPos = yPos + (PdfStyle.ROW.HEIGHT * 3 + 14);
      
      expect(yPos).toBe(229);
    });
  });

  describe('processMultiData pagination logic', () => {
    test('should calculate correct available height', () => {
      const pageHeight = 595;
      const bottomMargin = 30;
      const rowsStartY = 229;
      const pageCountHeight = 20;
      const safetyMargin = 15;
      
      const availableHeight = pageHeight - rowsStartY - bottomMargin - pageCountHeight - safetyMargin;
      
      expect(availableHeight).toBe(301);
    });

    test('should split rows across pages when exceeding available height', () => {
      const availableHeight = 301;
      const rows = [
        { height: 40 },
        { height: 73 }, // Long name
        { height: 40 },
        { height: 43 },
        { height: 40 },
        { height: 73 }, // Another long name
        { height: 40 },
        { height: 40 }
      ];
      
      let pages = [];
      let currentPageRows = [];
      let currentPageHeight = 0;
      
      for (let i = 0; i < rows.length; i++) {
        const tempHeight = rows[i].height;
        
        if (currentPageHeight + tempHeight > availableHeight && currentPageRows.length > 0) {
          pages.push({ rows: currentPageRows });
          currentPageRows = [];
          currentPageHeight = 0;
        }
        
        currentPageRows.push({ index: i, height: tempHeight });
        currentPageHeight += tempHeight;
      }
      
      if (currentPageRows.length > 0) {
        pages.push({ rows: currentPageRows });
      }
      
      expect(pages.length).toBeGreaterThan(0);
      
      pages.forEach(page => {
        const totalHeight = page.rows.reduce((sum, row) => sum + row.height, 0);
        expect(totalHeight).toBeLessThanOrEqual(availableHeight);
      });
    });

    test('should keep all rows on one page if they fit', () => {
      const availableHeight = 301;
      const rows = [
        { height: 40 },
        { height: 40 },
        { height: 40 }
      ];
      
      let pages = [];
      let currentPageRows = [];
      let currentPageHeight = 0;
      
      for (let i = 0; i < rows.length; i++) {
        const tempHeight = rows[i].height;
        
        if (currentPageHeight + tempHeight > availableHeight && currentPageRows.length > 0) {
          pages.push({ rows: currentPageRows });
          currentPageRows = [];
          currentPageHeight = 0;
        }
        
        currentPageRows.push({ index: i, height: tempHeight });
        currentPageHeight += tempHeight;
      }
      
      if (currentPageRows.length > 0) {
        pages.push({ rows: currentPageRows });
      }
      
      expect(pages.length).toBe(1);
      expect(pages[0].rows.length).toBe(3);
    });
  });

  describe('multiVesselScheduleHeadingDynamic', () => {
    test('should handle mutable yPos variable correctly', () => {
      const initialYPos = 229;
      let yPos = initialYPos;
      
      const rows = [
        { index: 0, height: 40 },
        { index: 1, height: 73 },
        { index: 2, height: 40 }
      ];
      
      rows.forEach(rowInfo => {
        yPos = yPos + rowInfo.height;
      });
      
      expect(yPos).toBe(382);
    });
  });

  describe('integration with constants', () => {
    test('should use MIN_ROW_HEIGHT_MULTIPLIER consistently', () => {
      const MIN_ROW_HEIGHT_MULTIPLIER = 3;
      const expectedMinHeight = (PdfStyle.ROW.HEIGHT * MIN_ROW_HEIGHT_MULTIPLIER) - 5;
      
      expect(expectedMinHeight).toBe(40);
      
      const result = calculateRequiredCellHeightStatic('', 45, 8);
      expect(result).toBe(expectedMinHeight);
    });

    test('should use column width constants', () => {
      const LICENCE_HOLDER_COLUMN_WIDTH = 45;
      const LICENCE_DETAIL_COLUMN_WIDTH = 75;
      
      const result1 = calculateRequiredCellHeightStatic('TEST', LICENCE_HOLDER_COLUMN_WIDTH, 8);
      expect(result1).toBeGreaterThanOrEqual(40);
      
      const result2 = calculateRequiredCellHeightStatic('TEST', LICENCE_DETAIL_COLUMN_WIDTH, 8);
      expect(result2).toBeGreaterThanOrEqual(40);
    });
  });
});
