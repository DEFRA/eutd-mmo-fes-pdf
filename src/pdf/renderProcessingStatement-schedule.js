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
const MAX_CATCHES_BEFORE_SCHEDULE = 5;
const SCHEDULE_PAGE_HEADER_Y = 85;
const SCHEDULE_TABLE_HEADER_Y_OFFSET = 85;
const ROW_HEIGHT_MULTIPLIER_2 = 2;
const ROW_HEIGHT_MULTIPLIER_3 = 3;
const ROW_HEIGHT_ADJUSTMENT_5 = 5;
const ROW_HEIGHT_ADJUSTMENT_7 = 7;
const TABLE_COL_OFFSET_165 = 165;
const TABLE_COL_WIDTH_85 = 85;

const getProductsForSchedule = (data) => {
    const useProductsDescription = (Array.isArray(data.products) && data.products.length > 0);
    return useProductsDescription ? data.products : [{ commodityCode: '', description: data.consignmentDescription || '' }];
};

const findProductsNeedingSchedule = (data, products) => {
    const productsNeedingSchedule = [];

    for (let productIndex = 0; productIndex < products.length; productIndex++) {
        const productCatches = data.catches.filter(ctch =>
            ctch?.productIndex === productIndex
        );

        if (productCatches.length > MAX_CATCHES_BEFORE_SCHEDULE) {
            productsNeedingSchedule.push(productIndex);
        }
    }

    return productsNeedingSchedule;
};

const addSpeciesScheduleTableHeaders = (doc, startY, tableHeadRow) => {
    const cellHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_3 - ROW_HEIGHT_ADJUSTMENT_7;
    const headers = getCatchTableHeaders();

    // Update the second header for schedule page (has slightly different text)
    headers[1] = { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_165, width: TABLE_COL_WIDTH_85, content: ['Vessel name(s)', 'and flag(s)', 'Validation date(s)'] };

    headers.forEach(header => {
        createTableHeaderCell(doc, tableHeadRow, header.x, startY, header.width, cellHeight, header.content);
    });
};

const startSpeciesSchedulePage = (doc, startY) => {
    CommonUtils.startScheduledPage(doc, startY, 'PROCESSING STATEMENT - SCHEDULE');
    const tableStruct = doc.struct('Table');
    doc.addStructure(tableStruct);

    const tableHead = doc.struct('THead');
    tableStruct.add(tableHead);

    const tableHeadRow = doc.struct('TR');
    tableHead.add(tableHeadRow);
    addSpeciesScheduleTableHeaders(doc, startY + SCHEDULE_TABLE_HEADER_Y_OFFSET, tableHeadRow);
    tableHeadRow.end();
    tableHead.end();

    return { startY: startY + SCHEDULE_PAGE_HEADER_Y + (PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_3 - ROW_HEIGHT_ADJUSTMENT_7), tableStruct };
};

const renderSingleCatchRow = (doc, catchData, schedY, cellHeight, tableBody) => {
    const tableBodyRow = doc.struct('TR');
    tableBody.add(tableBodyRow);

    const cells = getCatchTableCells(catchData);

    cells.forEach(cell => {
        createTableDataCell(doc, tableBodyRow, { x: cell.x, y: schedY, width: cell.width, height: cellHeight }, cell.content, cell.isWrapped);
    });

    tableBodyRow.end();
};

const finalizeProductSchedulePage = (doc, tableBody, tableStruct, isSample, page) => {
    doc.endMarkedContent();
    tableBody.end();
    tableStruct.end();

    if (isSample) {
        CommonUtils.addSampleWatermark(doc);
    }
    PdfUtils.endOfPage(doc, page);
};

const handleSchedulePageBreak = (doc, isSample, tableBody, tableStruct, currentPage) => {
    doc.endMarkedContent();
    tableBody.end();
    tableStruct.end();

    if (isSample) {
        CommonUtils.addSampleWatermark(doc);
    }
    PdfUtils.endOfPage(doc, currentPage);

    const newPage = currentPage + 1;
    const startOfPage = startSpeciesSchedulePage(doc, PdfStyle.MARGIN.TOP);
    const newTableBody = doc.struct('TBody');
    startOfPage.tableStruct.add(newTableBody);

    return {
        schedY: startOfPage.startY,
        page: newPage,
        tableStruct: startOfPage.tableStruct,
        tableBody: newTableBody
    };
};

const renderAllCatchesForProduct = (doc, productCatches, isSample, renderConfig) => {
    const { startY, cellHeight, tableBody, tableStruct, startPage } = renderConfig;

    let schedY = startY;
    let page = startPage;
    let currentTableBody = tableBody;
    let currentTableStruct = tableStruct;
    const catchesLength = productCatches.length;

    for (let catchesIdx = 0; catchesIdx < catchesLength; catchesIdx++) {
        renderSingleCatchRow(doc, productCatches[catchesIdx], schedY, cellHeight, currentTableBody);
        schedY += cellHeight;

        const needsPageBreak = schedY + cellHeight > PAGE_HEIGHT && (catchesIdx + 1 < catchesLength);

        if (needsPageBreak) {
            const pageBreakResult = handleSchedulePageBreak(doc, isSample, currentTableBody, currentTableStruct, page);
            schedY = pageBreakResult.schedY;
            page = pageBreakResult.page;
            currentTableStruct = pageBreakResult.tableStruct;
            currentTableBody = pageBreakResult.tableBody;
        }
    }

    return {
        tableBody: currentTableBody,
        tableStruct: currentTableStruct,
        page: page
    };
};

const renderProductSchedulePage = (doc, data, isSample, productIndex, startingPage) => {
    const productCatches = data.catches.filter(ctch =>
        ctch && ctch.productIndex === productIndex
    );

    const page = startingPage + 1;
    let schedY = PdfStyle.MARGIN.TOP;

    const startOfPageData = startSpeciesSchedulePage(doc, schedY);
    schedY = startOfPageData.startY;
    const speciesScheduleTableStruct = startOfPageData.tableStruct;
    const cellHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_2 - ROW_HEIGHT_ADJUSTMENT_5;

    const tableBody = doc.struct('TBody');
    speciesScheduleTableStruct.add(tableBody);

    const renderConfig = {
        startY: schedY,
        cellHeight: cellHeight,
        tableBody: tableBody,
        tableStruct: speciesScheduleTableStruct,
        startPage: page
    };

    const renderResult = renderAllCatchesForProduct(doc, productCatches, isSample, renderConfig);

    finalizeProductSchedulePage(doc, renderResult.tableBody, renderResult.tableStruct, isSample, renderResult.page);

    return renderResult.page;
};

const endSchedulePage = (doc, data, isSample) => {
    const products = getProductsForSchedule(data);
    const productsNeedingSchedule = findProductsNeedingSchedule(data, products);

    if (productsNeedingSchedule.length === 0) {
        return;
    }

    let page = 1;
    productsNeedingSchedule.forEach(productIndex => {
        page = renderProductSchedulePage(doc, data, isSample, productIndex, page);
    });
};

module.exports = {
    endSchedulePage,
};
