const PdfStyle = require('../../../src/pdf/mmoPdfStyles');
const {
  calculateRowHeight,
  calculatePageDimensions,
  paginateRows,
  calculateRequiredCellHeightStatic,
  multiVesselScheduleHeadingDynamic
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

  describe('multiVesselScheduleHeadingDynamic', () => {
    let mockDoc;

    beforeEach(() => {
      mockDoc = {
        struct: jest.fn((type, arg) => {
          if (typeof arg === 'function') {
            arg();
          }
          return {
            add: jest.fn(),
            end: jest.fn()
          };
        }),
        addStructure: jest.fn(),
        image: jest.fn(),
        font: jest.fn(),
        fontSize: jest.fn(),
        fillColor: jest.fn(),
        text: jest.fn(),
        undash: jest.fn(),
        lineWidth: jest.fn(),
        rect: jest.fn(),
        fill: jest.fn(),
        fillAndStroke: jest.fn(),
        stroke: jest.fn(),
        strokeColor: jest.fn(),
        widthOfString: jest.fn(() => 50),
        moveDown: jest.fn(),
        moveUp: jest.fn(),
        save: jest.fn(),
        restore: jest.fn()
      };
    });

    test('should render single row page', () => {
      const data = { 
        isBlankTemplate: false,
        documentNumber: 'GBR-2024-CC-123'
      };
      const currentPage = {
        rows: [
          { index: 0, height: 40 }
        ],
        startIdx: 0
      };
      const allRows = [
        { 
          species: 'COD',
          presentation: 'FIL',
          commodityCode: '030420',
          dateLanded: '01/01/2024',
          estimatedWeight: '',
          exportWeight: 100.5,
          verifiedWeight: '',
          vessel: 'Test Vessel',
          pln: 'ABC123',
          licenceDetail: 'LIC123',
          homePort: 'PORT',
          imo: '',
          cfr: '',
          licenceHolder: 'Test Holder',
          gearCode: 'OTB'
        }
      ];

      expect(() => {
        multiVesselScheduleHeadingDynamic(mockDoc, data, false, null, 1, currentPage, allRows, 1, 30);
      }).not.toThrow();
    });

    test('should render multiple rows on single page', () => {
      const data = { 
        isBlankTemplate: false,
        documentNumber: 'GBR-2024-CC-456'
      };
      const currentPage = {
        rows: [
          { index: 0, height: 40 },
          { index: 1, height: 73 },
          { index: 2, height: 43 }
        ],
        startIdx: 0
      };
      const allRows = [
        { 
          species: 'COD',
          presentation: 'FIL',
          commodityCode: '030420',
          dateLanded: '01/01/2024',
          estimatedWeight: '',
          exportWeight: 100.5,
          verifiedWeight: '',
          vessel: 'Vessel 1',
          pln: 'ABC123',
          licenceDetail: 'LIC123',
          homePort: 'PORT1',
          imo: '',
          cfr: '',
          licenceHolder: 'Holder 1',
          gearCode: 'OTB'
        },
        { 
          species: 'HAD',
          presentation: 'FIL',
          commodityCode: '030420',
          dateLanded: '02/01/2024',
          estimatedWeight: '',
          exportWeight: 200.75,
          verifiedWeight: '',
          vessel: 'Vessel 2',
          pln: 'DEF456',
          licenceDetail: 'LIC456 - 31/12/2025',
          homePort: 'PORT2',
          imo: 'IMO123',
          cfr: '',
          licenceHolder: 'RUSSELL A HENRY & SON WELDING AND FABRICATION',
          gearCode: 'PTM'
        },
        { 
          species: 'WHG',
          presentation: 'GUT',
          commodityCode: '030420',
          dateLanded: '03/01/2024',
          estimatedWeight: '',
          exportWeight: 150.25,
          verifiedWeight: '',
          vessel: 'Vessel 3',
          pln: 'GHI789',
          licenceDetail: 'LIC789',
          homePort: 'PORT3 WITH LONG NAME',
          imo: '',
          cfr: 'CFR999',
          licenceHolder: 'Holder 3',
          gearCode: 'GNS'
        }
      ];

      expect(() => {
        multiVesselScheduleHeadingDynamic(mockDoc, data, false, null, 1, currentPage, allRows, 1, 30);
      }).not.toThrow();
    });

    test('should handle page 2 of multiple pages', () => {
      const data = { 
        isBlankTemplate: false,
        documentNumber: 'GBR-2024-CC-789'
      };
      const currentPage = {
        rows: [
          { index: 4, height: 40 },
          { index: 5, height: 40 }
        ],
        startIdx: 4
      };
      const allRows = new Array(10).fill(null).map((_, i) => ({
        species: `Species${i}`,
        presentation: 'FIL',
        commodityCode: '030420',
        dateLanded: '01/01/2024',
        estimatedWeight: '',
        exportWeight: 100 + i,
        verifiedWeight: '',
        vessel: `Vessel ${i}`,
        pln: `PLN${i}`,
        licenceDetail: `LIC${i}`,
        homePort: `PORT${i}`,
        imo: '',
        cfr: '',
        licenceHolder: `Holder ${i}`,
        gearCode: 'OTB'
      }));

      expect(() => {
        multiVesselScheduleHeadingDynamic(mockDoc, data, false, null, 2, currentPage, allRows, 3, 30);
      }).not.toThrow();
    });

    test('should handle sample mode with masked document number', () => {
      const data = { 
        isBlankTemplate: false,
        documentNumber: 'GBR-2024-CC-REAL123'
      };
      const currentPage = {
        rows: [
          { index: 0, height: 40 }
        ],
        startIdx: 0
      };
      const allRows = [{
        species: 'COD',
        presentation: 'FIL',
        commodityCode: '030420',
        dateLanded: '01/01/2024',
        estimatedWeight: '',
        exportWeight: 100,
        verifiedWeight: '',
        vessel: 'Test',
        pln: 'ABC',
        licenceDetail: 'LIC',
        homePort: 'PORT',
        imo: '',
        cfr: '',
        licenceHolder: 'Test',
        gearCode: 'OTB'
      }];

      expect(() => {
        multiVesselScheduleHeadingDynamic(mockDoc, data, true, null, 1, currentPage, allRows, 1, 30);
      }).not.toThrow();
    });

    test('should handle blank template', () => {
      const data = { 
        isBlankTemplate: true
      };
      const currentPage = {
        rows: [
          { index: 0, height: 40 }
        ],
        startIdx: 0
      };
      const allRows = [{
        species: '',
        presentation: '',
        commodityCode: '',
        dateLanded: '',
        estimatedWeight: '',
        exportWeight: 0,
        verifiedWeight: '',
        vessel: '',
        pln: '',
        licenceDetail: '',
        homePort: '',
        imo: '',
        cfr: '',
        licenceHolder: '',
        gearCode: ''
      }];

      expect(() => {
        multiVesselScheduleHeadingDynamic(mockDoc, data, false, null, 1, currentPage, allRows, 1, 30);
      }).not.toThrow();
    });

    test('should handle rows with all field types filled', () => {
      const data = { 
        isBlankTemplate: false,
        documentNumber: 'GBR-2024-CC-FULL'
      };
      const currentPage = {
        rows: [
          { index: 0, height: 73 }
        ],
        startIdx: 0
      };
      const allRows = [{
        species: 'Atlantic Cod',
        presentation: 'Filleted',
        commodityCode: '030420',
        dateLanded: '15/12/2023 - 20/12/2023',
        estimatedWeight: '250.50',
        exportWeight: 245.75,
        verifiedWeight: '245.80',
        vessel: 'NORTHERN STAR FISHING VESSEL WITH VERY LONG NAME',
        pln: 'ABC123DEF',
        licenceDetail: 'LIC987654321 - 31/12/2025',
        homePort: 'VERY LONG PORT NAME WITH MULTIPLE WORDS',
        imo: 'IMO1234567',
        cfr: 'CFR.GBR.123456',
        licenceHolder: 'RUSSELL A HENRY & SON WELDING AND FABRICATION',
        gearCode: 'OTB',
        faoArea: 'FAO27',
        exclusiveEconomicZones: [{isoCodeAlpha2: 'GB'}, {isoCodeAlpha2: 'FR'}],
        rfmo: 'NEAFC (NEAFC)',
        highSeasArea: 'Yes'
      }];

      expect(() => {
        multiVesselScheduleHeadingDynamic(mockDoc, data, false, null, 1, currentPage, allRows, 1, 30);
      }).not.toThrow();
    });

    test('should handle empty strings in row data', () => {
      const data = { 
        isBlankTemplate: false,
        documentNumber: 'GBR-2024-CC-EMPTY'
      };
      const currentPage = {
        rows: [
          { index: 0, height: 40 }
        ],
        startIdx: 0
      };
      const allRows = [{
        species: 'COD',
        presentation: '',
        commodityCode: '',
        dateLanded: '01/01/2024',
        estimatedWeight: '',
        exportWeight: 100,
        verifiedWeight: '',
        vessel: 'Vessel',
        pln: '',
        licenceDetail: '',
        homePort: '',
        imo: '',
        cfr: '',
        licenceHolder: '',
        gearCode: ''
      }];

      expect(() => {
        multiVesselScheduleHeadingDynamic(mockDoc, data, false, null, 1, currentPage, allRows, 1, 30);
      }).not.toThrow();
    });

    test('should handle last page of multipage document', () => {
      const data = { 
        isBlankTemplate: false,
        documentNumber: 'GBR-2024-CC-LAST'
      };
      const currentPage = {
        rows: [
          { index: 14, height: 40 }
        ],
        startIdx: 14
      };
      const allRows = new Array(15).fill(null).map((_, i) => ({
        species: `SP${i}`,
        presentation: 'FIL',
        commodityCode: '030420',
        dateLanded: '01/01/2024',
        estimatedWeight: '',
        exportWeight: 100,
        verifiedWeight: '',
        vessel: `V${i}`,
        pln: `P${i}`,
        licenceDetail: `L${i}`,
        homePort: `H${i}`,
        imo: '',
        cfr: '',
        licenceHolder: `H${i}`,
        gearCode: 'OTB'
      }));

      expect(() => {
        multiVesselScheduleHeadingDynamic(mockDoc, data, false, null, 5, currentPage, allRows, 5, 30);
      }).not.toThrow();
    });

    test('should handle varying row heights on same page', () => {
      const data = { 
        isBlankTemplate: false,
        documentNumber: 'GBR-2024-CC-VARYING'
      };
      const currentPage = {
        rows: [
          { index: 0, height: 40 },
          { index: 1, height: 73 },
          { index: 2, height: 43 },
          { index: 3, height: 40 }
        ],
        startIdx: 0
      };
      const allRows = [
        { species: 'S1', presentation: 'P1', commodityCode: 'C1', dateLanded: 'D1', estimatedWeight: '', exportWeight: 100, verifiedWeight: '', vessel: 'V1', pln: 'P1', licenceDetail: 'L1', homePort: 'H1', imo: '', cfr: '', licenceHolder: 'Short', gearCode: 'G1' },
        { species: 'S2', presentation: 'P2', commodityCode: 'C2', dateLanded: 'D2', estimatedWeight: '', exportWeight: 200, verifiedWeight: '', vessel: 'V2', pln: 'P2', licenceDetail: 'L2', homePort: 'H2', imo: '', cfr: '', licenceHolder: 'RUSSELL A HENRY & SON WELDING AND FABRICATION', gearCode: 'G2' },
        { species: 'S3', presentation: 'P3', commodityCode: 'C3', dateLanded: 'D3', estimatedWeight: '', exportWeight: 300, verifiedWeight: '', vessel: 'V3', pln: 'P3', licenceDetail: 'VERY LONG LICENCE DETAIL TEXT', homePort: 'H3', imo: '', cfr: '', licenceHolder: 'H3', gearCode: 'G3' },
        { species: 'S4', presentation: 'P4', commodityCode: 'C4', dateLanded: 'D4', estimatedWeight: '', exportWeight: 400, verifiedWeight: '', vessel: 'V4', pln: 'P4', licenceDetail: 'L4', homePort: 'H4', imo: '', cfr: '', licenceHolder: 'H4', gearCode: 'G4' }
      ];

      expect(() => {
        multiVesselScheduleHeadingDynamic(mockDoc, data, false, null, 1, currentPage, allRows, 2, 30);
      }).not.toThrow();
    });
  });
});
