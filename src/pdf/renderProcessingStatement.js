const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const CommonUtils = require('../utils/common-utils');

// Page layout constants
const PAGE_HEIGHT = 780;
const PAGINATION_RESERVED_SPACE = 50;
const NEW_PAGE_START_Y_OFFSET = 25;
const SECTION_SPACING = 20;

// Y offset constants
const SECTION_HEADER_Y_OFFSET = 12;
const STATEMENT_HEADER_Y_START = 55;
const SECTION1_Y_START = 95;

// Separator and spacing constants
const SEPARATOR_SPACING = 8;
const SEPARATOR_HEIGHT = 3;
const PRODUCT_SPACING = 13;
const PRODUCT_DESCRIPTION_SPACING_AFTER = 3;
const PRODUCT_TABLE_LABEL_SPACING = 2;
const PRODUCT_SPACING_BETWEEN = 8;

// Row height multipliers
const ROW_HEIGHT_MULTIPLIER_2 = 2;
const ROW_HEIGHT_MULTIPLIER_3 = 3;
const ROW_HEIGHT_MULTIPLIER_5 = 5;

// Row height adjustments
const ROW_HEIGHT_ADJUSTMENT_3 = 3;
const ROW_HEIGHT_ADJUSTMENT_4 = 4;
const ROW_HEIGHT_ADJUSTMENT_5 = 5;
const ROW_HEIGHT_ADJUSTMENT_7 = 7;
const ROW_HEIGHT_ADJUSTMENT_9 = 9;

// Table column offsets from MARGIN.LEFT
const TABLE_COL_OFFSET_15 = 15;
const FOOTNOTE_TEXT_X_OFFSET = 15;
const TABLE_COL_OFFSET_95 = 95;
const TABLE_COL_OFFSET_110 = 110;
const TABLE_COL_OFFSET_125 = 125;
const TABLE_COL_OFFSET_130 = 130;
const TABLE_COL_OFFSET_145 = 145;
const TABLE_COL_OFFSET_160 = 160;
const TABLE_COL_OFFSET_165 = 165;
const TABLE_COL_OFFSET_175 = 175;
const TABLE_COL_OFFSET_235 = 235;
const TABLE_COL_OFFSET_250 = 250;
const TABLE_COL_OFFSET_255 = 255;
const TABLE_COL_OFFSET_280 = 280;
const TABLE_COL_OFFSET_350 = 350;
const TABLE_COL_OFFSET_375 = 375;
const TABLE_COL_OFFSET_400 = 400;
const TABLE_COL_OFFSET_410 = 410;
const TABLE_COL_OFFSET_450 = 450;
const TABLE_COL_OFFSET_460 = 460;
const TABLE_COL_OFFSET_470 = 470;

// Table column widths
const TABLE_COL_WIDTH_50 = 50;
const TABLE_COL_WIDTH_60 = 60;
const TABLE_COL_WIDTH_70 = 70;
const TABLE_COL_WIDTH_80 = 80;
const TABLE_COL_WIDTH_85 = 85;
const TABLE_COL_WIDTH_95 = 95;
const TABLE_COL_WIDTH_100 = 100;
const TABLE_COL_WIDTH_110 = 110;
const TABLE_COL_WIDTH_130 = 130;
const TABLE_COL_WIDTH_150 = 150;
const TABLE_COL_WIDTH_155 = 155;
const TABLE_COL_WIDTH_160 = 160;
const TABLE_COL_WIDTH_200 = 200;
const TABLE_COL_WIDTH_235 = 235;
const TABLE_COL_WIDTH_255 = 255;
const TABLE_COL_WIDTH_355 = 355;
const TABLE_COL_WIDTH_515 = 515;

// Schedule and statement specific constants
const SCHEDULE_PAGE_HEADER_Y = 85;
const SCHEDULE_TABLE_HEADER_Y_OFFSET = 85;
const MAX_CATCHES_BEFORE_SCHEDULE = 5;
const STATEMENT_LINE_WIDTH = 2;
const STATEMENT_LINE_END_X = 560;
const STATEMENT_LINE_Y_OFFSET = 4;
const STATEMENT_LABEL_Y_OFFSET = 17;
const STATEMENT_FIELD_Y_OFFSET = 15;
const STATEMENT_SEPARATOR_Y_OFFSET = 40;

// Endorsement section constants
const ENDORSEMENT_QR_CODE_Y_OFFSET = 28;
const ENDORSEMENT_FOOTER_SPACING = 4;
const ENDORSEMENT_TEXT_X_OFFSET = 15;
const ENDORSEMENT_FOOTER_HEIGHT = 60;

const renderProcessingStatement = async (data, isSample, uri, stream) => {
    let buff = null;
    if (!isSample) {
        buff = await PdfUtils.generateQRCode(uri);
    }
    const doc = CommonUtils.createBaseDocument(uri);
    doc.pipe(stream);

    PdfUtils.heading(doc, 'PROCESSING STATEMENT');

    let currentPage = 1;
    const pageHeight = PAGE_HEIGHT; 
    const paginationReservedSpace = PAGINATION_RESERVED_SPACE;
    const usablePageHeight = pageHeight - paginationReservedSpace;
    
    statement(doc, data, isSample, PdfStyle.MARGIN.TOP + STATEMENT_HEADER_Y_START);
    
    let currentY = PdfStyle.MARGIN.TOP + SECTION1_Y_START;
    const section1Result = section1(doc, data, currentY, isSample, currentPage);
    const section1EndY = section1Result.yPos;
    currentPage = section1Result.page;
    
    // Section 2
    currentY = section1EndY + SECTION_SPACING;
    const section2Height = estimateSection2Height();
    
    let breakResult = checkPageBreak(currentY, section2Height, usablePageHeight, doc, isSample, currentPage);
    currentY = breakResult.y;
    currentPage = breakResult.page;
    
    const section2EndY = section2(doc, data, currentY);
    
    // Section 3
    currentY = section2EndY + SECTION_SPACING;
    const section3Height = estimateSection3Height();
    
    breakResult = checkPageBreak(currentY, section3Height, usablePageHeight, doc, isSample, currentPage);
    currentY = breakResult.y;
    currentPage = breakResult.page;
    
    const section3EndY = section3(doc, data, currentY);
    
    // Section 4
    currentY = section3EndY + SECTION_SPACING;
    const section4Height = estimateSection4Height();
    
    breakResult = checkPageBreak(currentY, section4Height, usablePageHeight, doc, isSample, currentPage);
    currentY = breakResult.y;
    currentPage = breakResult.page;
    
    const section4EndY = section4(doc, data, currentY);
    
    // Section 5 (Endorsement)
    currentY = section4EndY + SECTION_SPACING;
    const section5Height = estimateSection5Height();
    
    breakResult = checkPageBreak(currentY, section5Height, usablePageHeight, doc, isSample, currentPage);
    currentY = breakResult.y;
    currentPage = breakResult.page;
    
    section5(doc, isSample, buff, currentY);

    if (isSample) {
        CommonUtils.addSampleWatermark(doc);
    }
    PdfUtils.endOfPage(doc, currentPage);

    endSchedulePage(doc, data, isSample);

    doc.end();
};

const startNewPage = (doc, isSample, currentPage) => {
    if (isSample) {
        CommonUtils.addSampleWatermark(doc);
    }
    PdfUtils.endOfPage(doc, currentPage);
    
    doc.addPage();
    return currentPage + 1;
};

const checkPageBreak = (currentY, sectionHeight, usablePageHeight, doc, isSample, currentPage) => {
    if (currentY + sectionHeight > usablePageHeight) {
        const newPage = startNewPage(doc, isSample, currentPage);
        return { needsBreak: true, page: newPage, y: PdfStyle.MARGIN.TOP + NEW_PAGE_START_Y_OFFSET };
    }
    return { needsBreak: false, page: currentPage, y: currentY };
};

const estimateSection2Height = () => {
    // Processing plant details table
    const headerHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_2 - ROW_HEIGHT_ADJUSTMENT_5;
    const bodyHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_3 - ROW_HEIGHT_ADJUSTMENT_9;
    const footerTextHeight = PdfStyle.ROW.HEIGHT;
    const separatorHeight = SEPARATOR_SPACING;
    
    return SECTION_HEADER_Y_OFFSET + headerHeight + bodyHeight + ROW_HEIGHT_ADJUSTMENT_5 + footerTextHeight + separatorHeight;
};

const estimateSection3Height = () => {
    // Health certificate table - single row
    const tableHeight = PdfStyle.ROW.HEIGHT;
    const separatorHeight = SEPARATOR_SPACING;
    
    return SECTION_HEADER_Y_OFFSET + tableHeight + separatorHeight;
};

const estimateSection4Height = () => {
    // Exporter details table
    const headerHeight = PdfStyle.ROW.HEIGHT;
    const bodyHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_2;
    const separatorHeight = SEPARATOR_SPACING;
    
    return SECTION_HEADER_Y_OFFSET + headerHeight + bodyHeight + separatorHeight;
};

const estimateSection5Height = () => {
    // Endorsement section
    const headerHeight = PdfStyle.ROW.HEIGHT;
    const bodyHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_5;
    const footerTextHeight = ENDORSEMENT_FOOTER_HEIGHT;
    
    return SECTION_HEADER_Y_OFFSET + headerHeight + bodyHeight + ENDORSEMENT_FOOTER_SPACING + footerTextHeight;
};

const createProductTable = (doc, data, startY, productIndex, currentPage, isSample, usablePageHeight) => {
    let yPos = startY;
    let page = currentPage;
    const headerHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_3 - ROW_HEIGHT_ADJUSTMENT_7;
    const rowHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_2 + ROW_HEIGHT_ADJUSTMENT_4;
    
    // Get catches for this product
    const products = getProductsArray(data);
    let catches;
    
    if (products.length > 0 && products[productIndex]?.id) {
        catches = data.catches.filter((catchItem) => catchItem.productId === products[productIndex].id);
    } else if (data.catches.some(c => c.productIndex !== undefined)) {
        catches = data.catches.filter((catchItem) => catchItem.productIndex === productIndex);
    } else {
        catches = data.catches;
    }
    
    // Start table structure
    let myTable = doc.struct('Table');
    doc.addStructure(myTable);
    
    // Render table header
    const tableHeaderResult = renderProductTableHeader(doc, yPos, headerHeight, myTable);
    yPos = tableHeaderResult.yPos;
    
    // Start table body
    let tableBody = doc.struct('TBody');
    myTable.add(tableBody);
    
    // Render rows with pagination
    for (const catchEntry of catches) {
        // Check if we need a new page before adding this row
        // Only break if the row truly won't fit (no artificial buffer)
        if (yPos + rowHeight > usablePageHeight) {
            // Close current table
            doc.endMarkedContent();
            tableBody.end();
            myTable.end();
            
            // Start new page
            page = startNewPage(doc, isSample, page);
            yPos = PdfStyle.MARGIN.TOP + NEW_PAGE_START_Y_OFFSET;
            
            // Start new table on new page
            myTable = doc.struct('Table');
            doc.addStructure(myTable);
            
            // Render header again
            const newHeaderResult = renderProductTableHeader(doc, yPos, headerHeight, myTable);
            yPos = newHeaderResult.yPos;
            
            // Start new table body
            tableBody = doc.struct('TBody');
            myTable.add(tableBody);
        }
        
        // Render the row
        yPos = renderProductTableRow(doc, catchEntry, yPos, rowHeight, tableBody);
    }
    
    // Close final table
    doc.endMarkedContent();
    tableBody.end();
    myTable.end();
    
    return { yPos, page };
}

const createTableHeaderCell = (doc, tableHeadRow, x, y, width, height, content) => {
    const tableHead = doc.struct('TH');
    tableHeadRow.add(tableHead);
    const tableHeadContent = doc.markStructureContent('TH');
    tableHead.add(tableHeadContent);
    PdfUtils.tableHeaderCell(doc, x, y, width, height, content);
    tableHead.end();
};

const getCatchTableHeaders = () => [
    { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_15, width: TABLE_COL_WIDTH_150, content: ['Catch certificate', '(CC) number'] },
    { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_165, width: TABLE_COL_WIDTH_85, content: ['Vessel name(s) and', 'flag(s) and', 'Validation date(s)'] },
    { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_250, width: TABLE_COL_WIDTH_100, content: ['Catch description'] },
    { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_350, width: TABLE_COL_WIDTH_60, content: ['Total landed', 'weight(kg)'] },
    { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_410, width: TABLE_COL_WIDTH_60, content: ['Catch', 'processed', '(kg)'] },
    { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_470, width: TABLE_COL_WIDTH_60, content: ['Processed', 'fishery', 'product(kg)'] }
];

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
}

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

const getCatchTableCells = (catchData) => [
    { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_15, width: TABLE_COL_WIDTH_150, content: catchData?.catchCertificateNumber || catchData.catchCertificateNumber, isWrapped: true },
    { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_165, width: TABLE_COL_WIDTH_85, content: ['See catch', 'certificate'], isWrapped: true },
    { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_250, width: TABLE_COL_WIDTH_100, content: catchData?.species || catchData.species, isWrapped: true },
    { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_350, width: TABLE_COL_WIDTH_60, content: Number(catchData?.totalWeightLanded || catchData.totalWeightLanded).toFixed(2), isWrapped: false },
    { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_410, width: TABLE_COL_WIDTH_60, content: Number(catchData?.exportWeightBeforeProcessing || catchData.exportWeightBeforeProcessing).toFixed(2), isWrapped: false },
    { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_470, width: TABLE_COL_WIDTH_60, content: Number(catchData?.exportWeightAfterProcessing || catchData.exportWeightAfterProcessing).toFixed(2), isWrapped: false }
];

const renderProductTableRow = (doc, catchData, startY, cellHeight, tableBody) => {
    const tableBodyRow = doc.struct('TR');
    tableBody.add(tableBodyRow);
    
    const cells = getCatchTableCells(catchData);
    
    cells.forEach(cell => {
        createTableDataCell(doc, tableBodyRow, { x: cell.x, y: startY, width: cell.width, height: cellHeight }, cell.content, cell.isWrapped);
    });
    
    tableBodyRow.end();
    return startY + cellHeight;
}

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
}

const getProductsForSchedule = (data) => {
    const useProductsDescription = (Array.isArray(data.products) && data.products.length > 0);
    return useProductsDescription ? data.products : [{ commodityCode: '', description: data.consignmentDescription || '' }];
}

const findProductsNeedingSchedule = (data, products) => {
    const productsNeedingSchedule = [];
    
    for (let productIndex = 0; productIndex < products.length; productIndex++) {
        const productCatches = data.catches.filter(ctch => 
            ctch && ctch.productIndex === productIndex
        );
        
        if (productCatches.length > MAX_CATCHES_BEFORE_SCHEDULE) {
            productsNeedingSchedule.push(productIndex);
        }
    }
    
    return productsNeedingSchedule;
}

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

    const renderResult = renderAllCatchesForProduct(
        doc, 
        productCatches, 
        isSample, 
        renderConfig
    );
    
    finalizeProductSchedulePage(doc, renderResult.tableBody, renderResult.tableStruct, isSample, renderResult.page);
    
    return renderResult.page;
}

const renderAllCatchesForProduct = (doc, productCatches, isSample, renderConfig) => {
    const { startY, cellHeight, tableBody, tableStruct, startPage } = renderConfig;
    
    let schedY = startY;
    let page = startPage;
    let currentTableBody = tableBody;
    let currentTableStruct = tableStruct;
    const pageHeight = PAGE_HEIGHT;
    const catchesLength = productCatches.length;
    
    for (let catchesIdx = 0; catchesIdx < catchesLength; catchesIdx++) {
        renderSingleCatchRow(doc, productCatches[catchesIdx], schedY, cellHeight, currentTableBody);
        schedY += cellHeight;
        
        const needsPageBreak = schedY + cellHeight > pageHeight && (catchesIdx + 1 < catchesLength);
        
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
}

const renderSingleCatchRow = (doc, catchData, schedY, cellHeight, tableBody) => {
    const tableBodyRow = doc.struct('TR');
    tableBody.add(tableBodyRow);

    const cells = getCatchTableCells(catchData);
    
    cells.forEach(cell => {
        createTableDataCell(doc, tableBodyRow, { x: cell.x, y: schedY, width: cell.width, height: cellHeight }, cell.content, cell.isWrapped);
    });
    
    tableBodyRow.end();
}

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
}

const finalizeProductSchedulePage = (doc, tableBody, tableStruct, isSample, page) => {
    doc.endMarkedContent();
    tableBody.end();
    tableStruct.end();

    if (isSample) {
        CommonUtils.addSampleWatermark(doc);
    }
    PdfUtils.endOfPage(doc, page);
}

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

    return {startY: startY + SCHEDULE_PAGE_HEADER_Y + (PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_3 - ROW_HEIGHT_ADJUSTMENT_7), tableStruct};
}

const addSpeciesScheduleTableHeaders = (doc, startY, tableHeadRow) => {
    const cellHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_3 - ROW_HEIGHT_ADJUSTMENT_7;

    const headers = getCatchTableHeaders();
    
    // Update the second header for schedule page (has slightly different text)
    headers[1] = { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_165, width: TABLE_COL_WIDTH_85, content: ['Vessel name(s)', 'and flag(s)', 'Validation date(s)'] };
    
    headers.forEach(header => {
        createTableHeaderCell(doc, tableHeadRow, header.x, startY, header.width, cellHeight, header.content);
    });
}

const section5 = (doc, isSample, buff, startY) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, 'Endorsement by the competent authority');
    }));
    let yPos = startY + SECTION_HEADER_Y_OFFSET;
    const cellHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_5;

    const tableStruct = doc.struct('Table');
    doc.addStructure(tableStruct);

    const tableHead = doc.struct('THead');
    tableStruct.add(tableHead);

    const tableHeadRow = doc.struct('TR');
    tableHead.add(tableHeadRow);

    const tableHeadOne = doc.struct('TH');
    tableHeadRow.add(tableHeadOne);
    const tableHeadOneContent = doc.markStructureContent('TH');
    tableHeadOne.add(tableHeadOneContent); 
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_15, yPos, TABLE_COL_WIDTH_235, PdfStyle.ROW.HEIGHT, 'Name and Address');
    tableHeadOne.end();

    const tableHeadTwo = doc.struct('TH');
    tableHeadRow.add(tableHeadTwo);
    const tableHeadTwoContent = doc.markStructureContent('TH');
    tableHeadTwo.add(tableHeadTwoContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_250, yPos, TABLE_COL_WIDTH_200, PdfStyle.ROW.HEIGHT, 'Validation');
    tableHeadTwo.end();

    const tableHeadThree = doc.struct('TH');
    tableHeadRow.add(tableHeadThree);
    const tableHeadThreeContent = doc.markStructureContent('TH');
    tableHeadThree.add(tableHeadThreeContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_450, yPos, TABLE_COL_WIDTH_80, PdfStyle.ROW.HEIGHT, 'Date Issued');
    tableHeadThree.end();

    tableHeadRow.end();
    tableHead.end();

    yPos += PdfStyle.ROW.HEIGHT;

    const tableBody = doc.struct('TBody');
    tableStruct.add(tableBody);

    const tableBodyRow = doc.struct('TR');
    tableBody.add(tableBodyRow);

    const TdOne = doc.struct('TD');
    tableBodyRow.add(TdOne);
    const TdOneContent = doc.markStructureContent('TD');
    TdOne.add(TdOneContent);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_15, yPos, TABLE_COL_WIDTH_235, cellHeight,
        ['Illegal Unreported and Unregulated (IUU) Fishing Team,',
        'Marine Management Organisation,', 'Tyneside House, Skinnerburn Rd,', 'Newcastle upon Tyne. NE4 7AR', 'United Kingdom',
        'Tel: 0300 123 1032',
        'Email: ukiuuslo@marinemanagement.org.uk']);
    TdOne.end();
    
    const TdTwo = doc.struct('TD');
    tableBodyRow.add(TdTwo);
    const TdTwoContent = doc.markStructureContent('TD');
    TdTwo.add(TdTwoContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_250, yPos, TABLE_COL_WIDTH_200, cellHeight);
    if (!isSample) {
        PdfUtils.qrCode(doc, buff, PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_255, startY + ENDORSEMENT_QR_CODE_Y_OFFSET);
    }
    TdTwo.end();

    const TdThree = doc.struct('TD');
    tableBodyRow.add(TdThree);
    const TdThreeContent = doc.markStructureContent('TD');
    TdThree.add(TdThreeContent);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_450, yPos, TABLE_COL_WIDTH_80, cellHeight, PdfUtils.todaysDate());
    TdThree.end();
    tableBodyRow.end();

    doc.endMarkedContent();
    tableBody.end();
    tableStruct.end();
    yPos += cellHeight + ENDORSEMENT_FOOTER_SPACING;
    doc.addStructure(doc.struct('P', () => {
        doc.font(PdfStyle.FONT.REGULAR);
        doc.fontSize(PdfStyle.FONT_SIZE.SMALL);
        doc.text('Validated by the appropriate competent authority (MMO, Scottish Ministers, Welsh Ministers, Department of Agriculture, Environment and Rural Affairs for Northern Ireland, Marine Resources, Growth and Housing and Environment for Jersey, Sea Fisheries, Committee for Economic Development for Guernsey and Department Environment, Food and Agriculture for the Isle of Man) in accordance with article 15 of Council Regulation (EU) 1005/2008 (as retained under s.3(1) European Union (Withdrawal) Act 2018)', PdfStyle.MARGIN.LEFT + ENDORSEMENT_TEXT_X_OFFSET, yPos, {
            width: TABLE_COL_WIDTH_515,
            lineBreak: true
        });
    }));
}

const section4 = (doc, data, startY) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '4.  Exporter details');
    }));
    const yPos = startY + SECTION_HEADER_Y_OFFSET;
    const cellHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_2;
    const exporterAddress = PdfUtils.constructAddress([data.exporter.addressOne, data.exporter.addressTwo, data.exporter.townCity, data.exporter.postcode]);

    const myTable = doc.struct('Table');
    doc.addStructure(myTable);

    const headers = [
        { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_15, width: TABLE_COL_WIDTH_160, height: PdfStyle.ROW.HEIGHT, content: 'Company' },
        { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_175, width: TABLE_COL_WIDTH_355, height: PdfStyle.ROW.HEIGHT, content: 'Address' }
    ];

    createTableHeaderRow(doc, myTable, headers, yPos);

    const cells = [
        { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_15, width: TABLE_COL_WIDTH_160, height: cellHeight, content: data.exporter.exporterCompanyName, isWrapped: false, yOffset: PdfStyle.ROW.HEIGHT },
        { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_175, width: TABLE_COL_WIDTH_355, height: cellHeight, content: exporterAddress, isWrapped: true, yOffset: PdfStyle.ROW.HEIGHT }
    ];

    createTableBodyWithRow(doc, myTable, cells, yPos);

    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT + cellHeight + SEPARATOR_SPACING);
    }));
    
    return yPos + PdfStyle.ROW.HEIGHT + cellHeight + SEPARATOR_SPACING;
}

const section3 = (doc, data, startY) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '3.  Health certificate details');
    }));
    const yPos = startY + SECTION_HEADER_Y_OFFSET;

    const myTable = doc.struct('Table');
    doc.addStructure(myTable);

    const tableRow = doc.struct('TR');
    myTable.add(tableRow);

    const tableHeadOne = doc.struct('TH');
    tableRow.add(tableHeadOne);
    const tableHeadOneContent = doc.markStructureContent('TH');
    tableHeadOne.add(tableHeadOneContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_15, yPos, TABLE_COL_WIDTH_130, PdfStyle.ROW.HEIGHT, 'Health certificate number');
    tableHeadOne.end();

    const TdOne = doc.struct('TD');
    tableRow.add(TdOne);
    const TdOneContent = doc.markStructureContent('TD');
    TdOne.add(TdOneContent);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_145, yPos, TABLE_COL_WIDTH_255, PdfStyle.ROW.HEIGHT, data.healthCertificateNumber);
    TdOne.end();

    const tableHeadTwo = doc.struct('TH');
    tableRow.add(tableHeadTwo);
    const tableHeadTwoContent = doc.markStructureContent('TH');
    tableHeadTwo.add(tableHeadTwoContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_400, yPos, TABLE_COL_WIDTH_50, PdfStyle.ROW.HEIGHT, 'Date');
    tableHeadTwo.end();

    const TdTwo = doc.struct('TD');
    tableRow.add(TdTwo);
    const TdTwoContent = doc.markStructureContent('TD');
    TdTwo.add(TdTwoContent);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_450, yPos, TABLE_COL_WIDTH_80, PdfStyle.ROW.HEIGHT, data.healthCertificateDate);
    TdTwo.end();

    tableRow.end();
    doc.endMarkedContent();
    myTable.end();
   
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT + SEPARATOR_SPACING);
    }));
    
    return yPos + PdfStyle.ROW.HEIGHT + SEPARATOR_SPACING;
}

const section2 = (doc, data, startY) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '2.  Processing plant details');
    }));
    let yPos = startY + SECTION_HEADER_Y_OFFSET;
    const cellHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_2 - ROW_HEIGHT_ADJUSTMENT_5;
    const ppAddress = PdfUtils.constructAddress([data.plantAddressOne, data.plantAddressTwo, data.plantTownCity, data.plantPostcode]);

    const myTable = doc.struct('Table');
    doc.addStructure(myTable);

    const headers = [
        { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_15, width: TABLE_COL_WIDTH_110, height: cellHeight, content: ['Processing plant'] },
        { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_125, width: TABLE_COL_WIDTH_155, height: cellHeight, content: 'Address' },
        { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_280, width: TABLE_COL_WIDTH_95, height: cellHeight, content: ['Plant approval', 'number'] },
        { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_375, width: TABLE_COL_WIDTH_85, height: cellHeight, content: ['Responsible', 'person'] },
        { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_460, width: TABLE_COL_WIDTH_70, height: cellHeight, content: ['Date of', 'acceptance (*)'] }
    ];

    createTableHeaderRow(doc, myTable, headers, yPos);

    const cells = [
        { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_15, width: TABLE_COL_WIDTH_110, height: PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_3 - ROW_HEIGHT_ADJUSTMENT_9, content: data.plantName, isWrapped: true, yOffset: cellHeight },
        { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_125, width: TABLE_COL_WIDTH_155, height: PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_3 - ROW_HEIGHT_ADJUSTMENT_9, content: ppAddress, isWrapped: true, yOffset: cellHeight },
        { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_280, width: TABLE_COL_WIDTH_95, height: PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_3 - ROW_HEIGHT_ADJUSTMENT_9, content: data.plantApprovalNumber, isWrapped: false, yOffset: cellHeight },
        { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_375, width: TABLE_COL_WIDTH_85, height: PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_3 - ROW_HEIGHT_ADJUSTMENT_9, content: data.personResponsibleForConsignment, isWrapped: true, yOffset: cellHeight },
        { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_460, width: TABLE_COL_WIDTH_70, height: PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_3 - ROW_HEIGHT_ADJUSTMENT_9, content: data.dateOfAcceptance, isWrapped: false, yOffset: cellHeight }
    ];

    createTableBodyWithRow(doc, myTable, cells, yPos);

    yPos += cellHeight + PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_3 - ROW_HEIGHT_ADJUSTMENT_9 + ROW_HEIGHT_ADJUSTMENT_5;
    doc.addStructure(doc.struct('P', () => {
        doc.text('* Date of acceptance by the process plant\'s responsible person of the veracity of the contents of this processing statement', PdfStyle.MARGIN.LEFT + FOOTNOTE_TEXT_X_OFFSET, yPos);
    }));

    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT);
    }));
    
    return yPos + PdfStyle.ROW.HEIGHT;
}

const section1 = (doc, data, startY, isSample, currentPage) => {
    let yPos = startY + SECTION_HEADER_Y_OFFSET;
    const products = getProductsArray(data);
    let page = currentPage;
    const pageHeight = PAGE_HEIGHT;
    const paginationReservedSpace = PAGINATION_RESERVED_SPACE;
    const usablePageHeight = pageHeight - paginationReservedSpace;
    
    for (let productIndex = 0; productIndex < products.length; productIndex++) {
        // Check minimum space needed to start a product (header + description + table header)
        const minProductStartHeight = SECTION_HEADER_Y_OFFSET + PdfStyle.ROW.HEIGHT + (PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_2 - ROW_HEIGHT_ADJUSTMENT_5) + ROW_HEIGHT_ADJUSTMENT_5 + PdfStyle.ROW.HEIGHT + ROW_HEIGHT_ADJUSTMENT_5 + (PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_3 - ROW_HEIGHT_ADJUSTMENT_7);
        
        // Only move to new page if we don't have enough space to even start rendering
        if (yPos + minProductStartHeight > usablePageHeight) {
            page = startNewPage(doc, isSample, page);
            yPos = PdfStyle.MARGIN.TOP + NEW_PAGE_START_Y_OFFSET;
            
            // Re-render section label on new page
            if (productIndex === 0) {
                doc.addStructure(doc.struct('H3', () => {
                    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '1');
                }));
            }
        }
        
        const result = renderSingleProduct({
            doc,
            data,
            product: products[productIndex],
            productIndex,
            startY: yPos,
            currentPage: page,
            isSample,
            usablePageHeight
        });
        yPos = result.yPos;
        page = result.page;
    }
    
    // Check if separator will infringe on pagination area
    // Need to ensure separator (at yPos + SEPARATOR_SPACING) doesn't go beyond usablePageHeight
    const separatorY = yPos + SEPARATOR_SPACING;
    const separatorEndY = separatorY + SEPARATOR_HEIGHT; // Separator itself has some height
    
    if (separatorEndY > usablePageHeight) {
        page = startNewPage(doc, isSample, page);
        yPos = PdfStyle.MARGIN.TOP + NEW_PAGE_START_Y_OFFSET;
        doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
            PdfUtils.separator(doc, yPos);
        }));
        return { yPos: yPos, page };
    }
    
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.separator(doc, separatorY);
    }));
    return { yPos: separatorY, page };
}

const getProductsArray = (data) => {
    const useProductsDescription = (Array.isArray(data.products) && data.products.length > 0);
    return useProductsDescription ? data.products : [{ commodityCode: '', description: data.consignmentDescription || '' }];
}

// Refactored: Accept a single options object to reduce parameter count
const renderSingleProduct = ({
    doc,
    data,
    product,
    productIndex,
    startY,
    currentPage,
    isSample,
    usablePageHeight
}) => {
    let yPos = startY;
    let page = currentPage;

    if (productIndex > 0) {
        yPos += PRODUCT_SPACING;
    }

    if (productIndex === 0) {
        doc.addStructure(doc.struct('H3', () => {
            PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '1.');
        }));
    }

    // Ensure this label uses the standard content left offset and a slightly
    // reduced vertical increment so it visually aligns with the surrounding
    // tables (reduces the gap observed between the two tables).
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_15, yPos, 'I confirm that the processed fishery product:');
    }));
    yPos += PdfStyle.ROW.HEIGHT - PRODUCT_DESCRIPTION_SPACING_AFTER;

    yPos = renderProductDescription(doc, product, yPos);

    const tableResult = renderProductTable(doc, data, productIndex, yPos, page, isSample, usablePageHeight);
    yPos = tableResult.yPos;
    page = tableResult.page;

    // Add minimal spacing after product (only between multiple products)
    if (productIndex > 0) {
        yPos += PRODUCT_SPACING_BETWEEN;
    }

    return { yPos, page };
}

const renderProductDescription = (doc, product, startY) => {
    const cellHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_2 - ROW_HEIGHT_ADJUSTMENT_5;
    const productDescription = formatProductDescription(product);
    
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_15, startY, TABLE_COL_WIDTH_515, cellHeight, productDescription, ROW_HEIGHT_MULTIPLIER_2);
    }));
    return startY + cellHeight + PRODUCT_DESCRIPTION_SPACING_AFTER;
}

const formatProductDescription = (product) => {
    return product.commodityCode 
        ? `${product.commodityCode} - ${product.description || ''}` 
        : (product.description || '');
}

const renderProductTable = (doc, data, productIndex, startY, currentPage, isSample, usablePageHeight) => {
    let yPos = startY;
    
    // Use the same left offset for this descriptive label and reduce the
    // extra spacing slightly so the following table sits closer and maintains
    // consistent visual flow.
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_15, yPos, 'has been obtained from catches under the following catch certificate(s):');
    }));
    yPos += PdfStyle.ROW.HEIGHT + PRODUCT_TABLE_LABEL_SPACING;
    
    return createProductTable(doc, data, yPos, productIndex, currentPage, isSample, usablePageHeight);
}

const statement = (doc, data, isSample, startY) => {
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        doc.lineWidth(STATEMENT_LINE_WIDTH);
        doc.moveTo(PdfStyle.MARGIN.LEFT, startY + STATEMENT_LINE_Y_OFFSET).lineTo(STATEMENT_LINE_END_X, startY + STATEMENT_LINE_Y_OFFSET).stroke();
    }));

    let documentNumber = '';
    if (isSample) {
        documentNumber = '###-####-##-#########';
    } else {
        documentNumber = data.documentNumber;
    }

    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT, startY + STATEMENT_LABEL_Y_OFFSET, 'Document Number');
    }));
    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_95, startY + STATEMENT_FIELD_Y_OFFSET, TABLE_COL_WIDTH_160, PdfStyle.ROW.HEIGHT, documentNumber);
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.separator(doc, startY + STATEMENT_SEPARATOR_Y_OFFSET);
    }));
};

module.exports = renderProcessingStatement;