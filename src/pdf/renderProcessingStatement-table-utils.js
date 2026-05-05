const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');

const TABLE_COL_OFFSET_15 = 15;
const TABLE_COL_OFFSET_165 = 165;
const TABLE_COL_OFFSET_250 = 250;
const TABLE_COL_OFFSET_350 = 350;
const TABLE_COL_OFFSET_410 = 410;
const TABLE_COL_OFFSET_470 = 470;

const TABLE_COL_WIDTH_60 = 60;
const TABLE_COL_WIDTH_85 = 85;
const TABLE_COL_WIDTH_100 = 100;
const TABLE_COL_WIDTH_150 = 150;

const getCatchTableHeaders = () => [
    { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_15, width: TABLE_COL_WIDTH_150, content: ['Catch certificate', '(CC) number'] },
    { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_165, width: TABLE_COL_WIDTH_85, content: ['Vessel name(s) and', 'flag(s) and', 'Validation date(s)'] },
    { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_250, width: TABLE_COL_WIDTH_100, content: ['Catch description'] },
    { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_350, width: TABLE_COL_WIDTH_60, content: ['Total landed', 'weight(kg)'] },
    { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_410, width: TABLE_COL_WIDTH_60, content: ['Catch', 'processed', '(kg)'] },
    { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_470, width: TABLE_COL_WIDTH_60, content: ['Processed', 'fishery', 'product(kg)'] }
];

const getCatchTableCells = (catchData) => [
    { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_15, width: TABLE_COL_WIDTH_150, content: catchData?.catchCertificateNumber || catchData.catchCertificateNumber, isWrapped: true },
    { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_165, width: TABLE_COL_WIDTH_85, content: ['See catch', 'certificate'], isWrapped: true },
    { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_250, width: TABLE_COL_WIDTH_100, content: catchData?.species || catchData.species, isWrapped: true },
    { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_350, width: TABLE_COL_WIDTH_60, content: Number(catchData?.totalWeightLanded || catchData.totalWeightLanded).toFixed(2), isWrapped: false },
    { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_410, width: TABLE_COL_WIDTH_60, content: Number(catchData?.exportWeightBeforeProcessing || catchData.exportWeightBeforeProcessing).toFixed(2), isWrapped: false },
    { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_470, width: TABLE_COL_WIDTH_60, content: Number(catchData?.exportWeightAfterProcessing || catchData.exportWeightAfterProcessing).toFixed(2), isWrapped: false }
];

const createTableHeaderCell = (doc, tableHeadRow, x, y, width, height, content) => {
    const tableHead = doc.struct('TH');
    tableHeadRow.add(tableHead);
    const tableHeadContent = doc.markStructureContent('TH');
    tableHead.add(tableHeadContent);
    PdfUtils.tableHeaderCell(doc, x, y, width, height, content);
    tableHead.end();
};

const createTableDataCell = (doc, tableBodyRow, { x, y, width, height }, content, isWrapped = false) => {
    const td = doc.struct('TD');
    tableBodyRow.add(td);
    const tdContent = doc.markStructureContent('TD');
    td.add(tdContent);
    if (isWrapped) {
        PdfUtils.wrappedField(doc, x, y, width, height, content);
    } else {
        PdfUtils.field(doc, x, y, width, height, content);
    }
    td.end();
};

const createTableBodyWithRow = (doc, myTable, cells, startY) => {
    const tableBody = doc.struct('TBody');
    myTable.add(tableBody);

    const tableBodyRow = doc.struct('TR');
    tableBody.add(tableBodyRow);

    cells.forEach(cell => {
        createTableDataCell(doc, tableBodyRow, {
            x: cell.x,
            y: startY + (cell.yOffset || 0),
            width: cell.width,
            height: cell.height
        }, cell.content, cell.isWrapped);
    });

    tableBodyRow.end();
    doc.endMarkedContent();
    tableBody.end();
    myTable.end();
};

const createTableHeaderRow = (doc, tableStruct, headers, startY) => {
    const tableHead = doc.struct('THead');
    tableStruct.add(tableHead);

    const tableHeadRow = doc.struct('TR');
    tableHead.add(tableHeadRow);

    headers.forEach(header => {
        const th = doc.struct('TH');
        tableHeadRow.add(th);
        const thContent = doc.markStructureContent('TH');
        th.add(thContent);
        PdfUtils.tableHeaderCell(doc, header.x, startY, header.width, header.height, header.content);
        th.end();
    });

    tableHeadRow.end();
    tableHead.end();
};

module.exports = {
    getCatchTableHeaders,
    getCatchTableCells,
    createTableHeaderCell,
    createTableDataCell,
    createTableBodyWithRow,
    createTableHeaderRow,
};
