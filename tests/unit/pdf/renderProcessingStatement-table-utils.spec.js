const {
    createTableDataCell,
    createTableBodyWithRow,
    createTableHeaderRow,
    getCatchTableHeaders,
    getCatchTableCells
} = require('../../../src/pdf/renderProcessingStatement-table-utils');

describe('renderProcessingStatement-table-utils', () => {
    let mockDoc;
    let mockTableStruct;
    let mockTableBody;
    let mockTableBodyRow;
    let mockTd;

    beforeEach(() => {
        // Mock PDFDocument structure methods
        mockTd = {
            add: jest.fn(),
            end: jest.fn()
        };

        mockTableBodyRow = {
            add: jest.fn(),
            end: jest.fn()
        };

        mockTableBody = {
            add: jest.fn(() => mockTableBodyRow),
            end: jest.fn()
        };

        mockTableStruct = {
            add: jest.fn(() => mockTableBody),
            end: jest.fn()
        };

        mockDoc = {
            struct: jest.fn((type) => {
                if (type === 'TBody') return mockTableBody;
                if (type === 'TR') return mockTableBodyRow;
                if (type === 'TD') return mockTd;
                return { add: jest.fn(), end: jest.fn() };
            }),
            markStructureContent: jest.fn(() => ({})),
            endMarkedContent: jest.fn(),
            rect: jest.fn().mockReturnThis(),
            fillAndStroke: jest.fn().mockReturnThis(),
            stroke: jest.fn().mockReturnThis(),
            fillColor: jest.fn().mockReturnThis(),
            font: jest.fn().mockReturnThis(),
            fontSize: jest.fn().mockReturnThis(),
            text: jest.fn().mockReturnThis(),
            widthOfString: jest.fn(() => 50),
            moveDown: jest.fn().mockReturnThis(),
            undash: jest.fn().mockReturnThis(),
            lineWidth: jest.fn().mockReturnThis()
        };
    });

    describe('getCatchTableHeaders', () => {
        test('returns correct header structure', () => {
            const headers = getCatchTableHeaders();
            
            expect(headers).toHaveLength(6);
            expect(headers[0].content).toEqual(['Catch certificate', '(CC) number']);
            expect(headers[1].content).toEqual(['Vessel name(s) and', 'flag(s) and', 'Validation date(s)']);
            expect(headers[2].content).toEqual(['Catch description']);
            expect(headers[3].content).toEqual(['Total landed', 'weight(kg)']);
            expect(headers[4].content).toEqual(['Catch', 'processed', '(kg)']);
            expect(headers[5].content).toEqual(['Processed', 'fishery', 'product(kg)']);
        });
    });

    describe('getCatchTableCells', () => {
        test('returns correct cell structure for catch data', () => {
            const catchData = {
                catchCertificateNumber: 'CC-001',
                species: 'Atlantic Cod',
                totalWeightLanded: 100,
                exportWeightBeforeProcessing: 90,
                exportWeightAfterProcessing: 80
            };

            const cells = getCatchTableCells(catchData);

            expect(cells).toHaveLength(6);
            expect(cells[0].content).toBe('CC-001');
            expect(cells[0].isWrapped).toBe(true);
            expect(cells[1].content).toEqual(['See catch', 'certificate']);
            expect(cells[2].content).toBe('Atlantic Cod');
            expect(cells[3].content).toBe('100.00');
            expect(cells[4].content).toBe('90.00');
            expect(cells[5].content).toBe('80.00');
        });
    });

    describe('createTableDataCell', () => {
        test('creates table data cell with wrapped field when isWrapped is true', () => {
            const position = { x: 10, y: 20, width: 100, height: 30 };
            const content = 'Test Content';

            createTableDataCell(mockDoc, mockTableBodyRow, position, content, true);

            expect(mockDoc.struct).toHaveBeenCalledWith('TD');
            expect(mockTd.add).toHaveBeenCalled();
            expect(mockDoc.markStructureContent).toHaveBeenCalledWith('TD');
            expect(mockTd.end).toHaveBeenCalled();
        });

        test('creates table data cell with regular field when isWrapped is false', () => {
            const position = { x: 10, y: 20, width: 100, height: 30 };
            const content = 'Test Content';

            createTableDataCell(mockDoc, mockTableBodyRow, position, content, false);

            expect(mockDoc.struct).toHaveBeenCalledWith('TD');
            expect(mockTd.add).toHaveBeenCalled();
            expect(mockDoc.markStructureContent).toHaveBeenCalledWith('TD');
            expect(mockTd.end).toHaveBeenCalled();
        });

        test('creates table data cell with noEllipsis wrapping for long addresses', () => {
            const position = { x: 10, y: 20, width: 155, height: 30 };
            const longAddress = 'Very Long Address Line That Should Wrap Without Ellipsis';

            // Test with noEllipsis = true
            createTableDataCell(mockDoc, mockTableBodyRow, position, longAddress, true, true);

            expect(mockDoc.struct).toHaveBeenCalledWith('TD');
            expect(mockTd.add).toHaveBeenCalled();
            expect(mockDoc.markStructureContent).toHaveBeenCalledWith('TD');
            expect(mockTd.end).toHaveBeenCalled();
        });
    });

    describe('createTableBodyWithRow', () => {
        test('creates table body with cells including noEllipsis parameter', () => {
            const cells = [
                { x: 10, y: 20, width: 100, height: 30, content: 'Cell 1', isWrapped: false, yOffset: 0 },
                { x: 120, y: 20, width: 150, height: 30, content: 'Long Address', isWrapped: true, noEllipsis: true, yOffset: 0 }
            ];

            createTableBodyWithRow(mockDoc, mockTableStruct, cells, 100);

            expect(mockDoc.struct).toHaveBeenCalledWith('TBody');
            expect(mockDoc.struct).toHaveBeenCalledWith('TR');
            expect(mockDoc.struct).toHaveBeenCalledWith('TD');
            expect(mockTableStruct.add).toHaveBeenCalledWith(mockTableBody);
            expect(mockTableBody.add).toHaveBeenCalledWith(mockTableBodyRow);
            expect(mockTableBodyRow.end).toHaveBeenCalled();
            expect(mockDoc.endMarkedContent).toHaveBeenCalled();
            expect(mockTableBody.end).toHaveBeenCalled();
            expect(mockTableStruct.end).toHaveBeenCalled();
        });

        test('handles cells with yOffset correctly', () => {
            const cells = [
                { x: 10, y: 20, width: 100, height: 30, content: 'Cell 1', isWrapped: false, yOffset: 15 }
            ];

            createTableBodyWithRow(mockDoc, mockTableStruct, cells, 100);

            expect(mockDoc.struct).toHaveBeenCalledWith('TD');
            // Verify the cell was created (yOffset is used internally in createTableDataCell)
            expect(mockTd.add).toHaveBeenCalled();
        });
    });

    describe('createTableHeaderRow', () => {
        test('creates table header row with multiple headers', () => {
            const mockTableHead = {
                add: jest.fn(),
                end: jest.fn()
            };

            const mockTableHeadRow = {
                add: jest.fn(),
                end: jest.fn()
            };

            const mockTh = {
                add: jest.fn(),
                end: jest.fn()
            };

            mockDoc.struct = jest.fn((type) => {
                if (type === 'THead') return mockTableHead;
                if (type === 'TR') return mockTableHeadRow;
                if (type === 'TH') return mockTh;
                return { add: jest.fn(), end: jest.fn() };
            });

            const headers = [
                { x: 10, width: 100, height: 20, content: 'Header 1' },
                { x: 120, width: 100, height: 20, content: 'Header 2' }
            ];

            createTableHeaderRow(mockDoc, mockTableStruct, headers, 50);

            expect(mockDoc.struct).toHaveBeenCalledWith('THead');
            expect(mockDoc.struct).toHaveBeenCalledWith('TR');
            expect(mockDoc.struct).toHaveBeenCalledWith('TH');
            expect(mockTableStruct.add).toHaveBeenCalledWith(mockTableHead);
            expect(mockTableHead.add).toHaveBeenCalledWith(mockTableHeadRow);
            expect(mockTableHeadRow.add).toHaveBeenCalledWith(mockTh);
        });
    });
});
