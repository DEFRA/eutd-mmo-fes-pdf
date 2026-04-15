/* eslint-disable no-magic-numbers */
const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const CommonUtils = require('../utils/common-utils');

const startNewPage = (doc, isSample, currentPage) => {
    if (isSample) {
        CommonUtils.addSampleWatermark(doc);
    }
    PdfUtils.endOfPage(doc, currentPage);
    
    doc.addPage();
    return currentPage + 1;
};

const estimateSection2Height = () => {
    // Processing plant details table
    const headerHeight = PdfStyle.ROW.HEIGHT * 2 - 5;
    const bodyHeight = PdfStyle.ROW.HEIGHT * 3 - 9;
    const footerTextHeight = PdfStyle.ROW.HEIGHT;
    const separatorHeight = 8;
    
    return 12 + headerHeight + bodyHeight + 5 + footerTextHeight + separatorHeight;
};

const estimateSection3Height = () => {
    // Health certificate table - single row
    const tableHeight = PdfStyle.ROW.HEIGHT;
    const separatorHeight = 8;
    
    return 12 + tableHeight + separatorHeight;
};

const estimateSection4Height = () => {
    // Exporter details table
    const headerHeight = PdfStyle.ROW.HEIGHT;
    const bodyHeight = PdfStyle.ROW.HEIGHT * 2;
    const separatorHeight = 8;
    
    return 12 + headerHeight + bodyHeight + separatorHeight;
};

const estimateSection5Height = () => {
    // Endorsement section
    const headerHeight = PdfStyle.ROW.HEIGHT;
    const bodyHeight = PdfStyle.ROW.HEIGHT * 5;
    const footerTextHeight = 60;
    
    return 12 + headerHeight + bodyHeight + 2 + footerTextHeight;
};

const createProductTable = (doc, data, startY, productIndex, currentPage, isSample, usablePageHeight) => {
    let yPos = startY;
    let page = currentPage;
    const headerHeight = PdfStyle.ROW.HEIGHT * 3 - 7;
    const rowHeight = PdfStyle.ROW.HEIGHT * 2 + 4;
    
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
            yPos = PdfStyle.MARGIN.TOP + 25;
            
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

const renderProductTableHeader = (doc, startY, cellHeight, tableStruct) => {
    const tableHead = doc.struct('THead');
    tableStruct.add(tableHead);
    
    const tableHeadRow = doc.struct('TR');
    tableHead.add(tableHeadRow);
    
    const tableHeadOne = doc.struct('TH');
    tableHeadRow.add(tableHeadOne);
    const tableHeadOneContent = doc.markStructureContent('TH');
    tableHeadOne.add(tableHeadOneContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, startY, 150, cellHeight, ['Catch certificate', '(CC) number']);
    tableHeadOne.end();
    
    const tableHeadTwo = doc.struct('TH');
    tableHeadRow.add(tableHeadTwo);
    const tableHeadTwoContent = doc.markStructureContent('TH');
    tableHeadTwo.add(tableHeadTwoContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 165, startY, 85, cellHeight, ['Vessel name(s) and', 'flag(s) and', 'Validation date(s)']);
    tableHeadTwo.end();
    
    const tableHeadThree = doc.struct('TH');
    tableHeadRow.add(tableHeadThree);
    const tableHeadThreeContent = doc.markStructureContent('TH');
    tableHeadThree.add(tableHeadThreeContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 250, startY, 100, cellHeight, ['Catch description']);
    tableHeadThree.end();
    
    const tableHeadFour = doc.struct('TH');
    tableHeadRow.add(tableHeadFour);
    const tableHeadFourContent = doc.markStructureContent('TH');
    tableHeadFour.add(tableHeadFourContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 350, startY, 60, cellHeight, ['Total landed', 'weight(kg)']);
    tableHeadFour.end();
    
    const tableHeadFive = doc.struct('TH');
    tableHeadRow.add(tableHeadFive);
    const tableHeadFiveContent = doc.markStructureContent('TH');
    tableHeadFive.add(tableHeadFiveContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 410, startY, 60, cellHeight, ['Catch', 'processed', '(kg)']);
    tableHeadFive.end();
    
    const tableHeadSix = doc.struct('TH');
    tableHeadRow.add(tableHeadSix);
    const tableHeadSixContent = doc.markStructureContent('TH');
    tableHeadSix.add(tableHeadSixContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 470, startY, 60, cellHeight, ['Processed', 'fishery', 'product(kg)']);
    tableHeadSix.end();
    
    tableHeadRow.end();
    tableHead.end();
    
    return { yPos: startY + cellHeight };
}

const renderProductTableRow = (doc, catchData, startY, cellHeight, tableBody) => {
    const tableBodyRow = doc.struct('TR');
    tableBody.add(tableBodyRow);
    
    const TdOne = doc.struct('TD');
    tableBodyRow.add(TdOne);
    const TdOneContent = doc.markStructureContent('TD');
    TdOne.add(TdOneContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 15, startY, 150, cellHeight, `${catchData?.catchCertificateNumber}`);
    TdOne.end();
    
    const TdTwo = doc.struct('TD');
    tableBodyRow.add(TdTwo);
    const TdTwoContent = doc.markStructureContent('TD');
    TdTwo.add(TdTwoContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 165, startY, 85, cellHeight, ['See catch', 'certificate']);
    TdTwo.end();
    
    const TdThree = doc.struct('TD');
    tableBodyRow.add(TdThree);
    const TdThreeContent = doc.markStructureContent('TD');
    TdThree.add(TdThreeContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 250, startY, 100, cellHeight, `${catchData?.species}`);
    TdThree.end();
    
    const TdFour = doc.struct('TD');
    tableBodyRow.add(TdFour);
    const TdFourContent = doc.markStructureContent('TD');
    TdFour.add(TdFourContent);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 350, startY, 60, cellHeight, `${catchData?.totalWeightLanded}`);
    TdFour.end();
    
    const TdFive = doc.struct('TD');
    tableBodyRow.add(TdFive);
    const TdFiveContent = doc.markStructureContent('TD');
    TdFive.add(TdFiveContent);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 410, startY, 60, cellHeight, `${catchData?.exportWeightBeforeProcessing}`);
    TdFive.end();
    
    const TdSix = doc.struct('TD');
    tableBodyRow.add(TdSix);
    const TdSixContent = doc.markStructureContent('TD');
    TdSix.add(TdSixContent);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 470, startY, 60, cellHeight, `${catchData?.exportWeightAfterProcessing}`);
    TdSix.end();
    
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
            ctch?.productIndex === productIndex
        );
        
        if (productCatches.length > 5) {
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
    const cellHeight = PdfStyle.ROW.HEIGHT * 2 - 5;
    
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
    const pageHeight = 780;
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

    const TdOne = doc.markStructureContent('TD');
    tableBodyRow.add(TdOne);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 15, schedY, 150, cellHeight, catchData.catchCertificateNumber);
    
    const TdTwo = doc.markStructureContent('TD');
    tableBodyRow.add(TdTwo);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 165, schedY, 85, cellHeight, ['See catch', 'certificate']);
    
    const TdThree = doc.markStructureContent('TD');
    tableBodyRow.add(TdThree);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 250, schedY, 100, cellHeight, catchData.species);

    const TdFour = doc.markStructureContent('TD');
    tableBodyRow.add(TdFour);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 350, schedY, 60, cellHeight, catchData.totalWeightLanded);

    const TdFive = doc.markStructureContent('TD');
    tableBodyRow.add(TdFive);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 410, schedY, 60, cellHeight, catchData.exportWeightBeforeProcessing);

    const TdSix = doc.markStructureContent('TD');
    tableBodyRow.add(TdSix);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 470, schedY, 60, cellHeight, catchData.exportWeightAfterProcessing);
    
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
    addSpeciesScheduleTableHeaders(doc, startY + 85, tableHeadRow);
    tableHeadRow.end();
    tableHead.end();

    return {startY: startY + 85 + (PdfStyle.ROW.HEIGHT * 3 - 7), tableStruct};
}

const addSpeciesScheduleTableHeaders = (doc, startY, tableHeadRow) => {
    const cellHeight = PdfStyle.ROW.HEIGHT * 3 - 7;

    const tableHeadOne = doc.markStructureContent('TH');
    tableHeadRow.add(tableHeadOne);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, startY, 150, cellHeight, ['Catch certificate', '(CC) number']);

    const tableHeadTwo = doc.markStructureContent('TH');
    tableHeadRow.add(tableHeadTwo);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 165, startY, 85, cellHeight, ['Vessel name(s)', 'and flag(s)', 'Validation date(s)']);

    const tableHeadThree = doc.markStructureContent('TH');
    tableHeadRow.add(tableHeadThree);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 250, startY, 100, cellHeight, ['Catch description']);

    const tableHeadFour = doc.markStructureContent('TH');
    tableHeadRow.add(tableHeadFour);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 350, startY, 60, cellHeight, ['Total landed', 'weight(kg)']);

    const tableHeadFive = doc.markStructureContent('TH');
    tableHeadRow.add(tableHeadFive);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 410, startY, 60, cellHeight, ['Catch', 'processed', '(kg)']);

    const tableHeadSix = doc.markStructureContent('TH');
    tableHeadRow.add(tableHeadSix);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 470, startY, 60, cellHeight, ['Processed', 'fishery', 'product(kg)']);
}


module.exports = {
    startNewPage,
    estimateSection2Height,
    estimateSection3Height,
    estimateSection4Height,
    estimateSection5Height,
    endSchedulePage,
    createProductTable,
};
