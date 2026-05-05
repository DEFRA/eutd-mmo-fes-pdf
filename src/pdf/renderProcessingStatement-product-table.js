const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const CommonUtils = require('../utils/common-utils');
const {
    getCatchTableHeaders,
    getCatchTableCells,
    createTableHeaderCell,
    createTableDataCell,
} = require('./renderProcessingStatement-table-utils');

const PAGE_HEIGHT = 780;
const NEW_PAGE_START_Y_OFFSET = 25;
const ROW_HEIGHT_MULTIPLIER_2 = 2;
const ROW_HEIGHT_MULTIPLIER_3 = 3;
const ROW_HEIGHT_ADJUSTMENT_4 = 4;
const ROW_HEIGHT_ADJUSTMENT_7 = 7;

const startNewPage = (doc, isSample, currentPage) => {
    if (isSample) {
        CommonUtils.addSampleWatermark(doc);
    }
    PdfUtils.endOfPage(doc, currentPage);
    doc.addPage();
    return currentPage + 1;
};

const getProductsArray = (data) => {
    const useProductsDescription = (Array.isArray(data.products) && data.products.length > 0);
    return useProductsDescription ? data.products : [{ commodityCode: '', description: data.consignmentDescription || '' }];
};

const renderProductTableHeader = (doc, startY, cellHeight, tableStruct) => {
    const tableHead = doc.struct('THead');
    tableStruct.add(tableHead);

    const tableHeadRow = doc.struct('TR');
    tableHead.add(tableHeadRow);

    const headers = getCatchTableHeaders();

    headers.forEach(header => {
        createTableHeaderCell(doc, tableHeadRow, header.x, startY, header.width, cellHeight, header.content);
    });

    tableHeadRow.end();
    tableHead.end();

    return { yPos: startY + cellHeight };
};

const renderProductTableRow = (doc, catchData, startY, cellHeight, tableBody) => {
    const tableBodyRow = doc.struct('TR');
    tableBody.add(tableBodyRow);

    const cells = getCatchTableCells(catchData);

    cells.forEach(cell => {
        createTableDataCell(doc, tableBodyRow, { x: cell.x, y: startY, width: cell.width, height: cellHeight }, cell.content, cell.isWrapped);
    });

    tableBodyRow.end();
    return startY + cellHeight;
};

const createProductTable = (doc, data, startY, productIndex, currentPage, isSample, usablePageHeight) => {
    let yPos = startY;
    let page = currentPage;
    const headerHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_3 - ROW_HEIGHT_ADJUSTMENT_7;
    const rowHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_2 + ROW_HEIGHT_ADJUSTMENT_4;

    const products = getProductsArray(data);
    let catches;

    if (products.length > 0 && products[productIndex]?.id) {
        catches = data.catches.filter((catchItem) => catchItem.productId === products[productIndex].id);
    } else if (data.catches.some(c => c.productIndex !== undefined)) {
        catches = data.catches.filter((catchItem) => catchItem.productIndex === productIndex);
    } else {
        catches = data.catches;
    }

    let myTable = doc.struct('Table');
    doc.addStructure(myTable);

    const tableHeaderResult = renderProductTableHeader(doc, yPos, headerHeight, myTable);
    yPos = tableHeaderResult.yPos;

    let tableBody = doc.struct('TBody');
    myTable.add(tableBody);

    for (const catchEntry of catches) {
        if (yPos + rowHeight > usablePageHeight) {
            doc.endMarkedContent();
            tableBody.end();
            myTable.end();

            page = startNewPage(doc, isSample, page);
            yPos = PdfStyle.MARGIN.TOP + NEW_PAGE_START_Y_OFFSET;

            myTable = doc.struct('Table');
            doc.addStructure(myTable);

            const newHeaderResult = renderProductTableHeader(doc, yPos, headerHeight, myTable);
            yPos = newHeaderResult.yPos;

            tableBody = doc.struct('TBody');
            myTable.add(tableBody);
        }

        yPos = renderProductTableRow(doc, catchEntry, yPos, rowHeight, tableBody);
    }

    doc.endMarkedContent();
    tableBody.end();
    myTable.end();

    return { yPos, page };
};

module.exports = {
    createProductTable,
    getProductsArray,
    startNewPage,
};
