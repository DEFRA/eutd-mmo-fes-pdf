const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const CommonUtils = require('../utils/common-utils');

const renderProcessingStatement = async (data, isSample, uri, stream) => {
    let buff = null;
    if (!isSample) {
        buff = await PdfUtils.generateQRCode(uri);
    }
    const doc = CommonUtils.createBaseDocument(uri);
    doc.pipe(stream);

    PdfUtils.heading(doc, 'PROCESSING STATEMENT');

    let currentPage = 1;
    const pageHeight = 780; 
    const paginationReservedSpace = 50;
    const usablePageHeight = pageHeight - paginationReservedSpace;
    
    statement(doc, data, isSample, PdfStyle.MARGIN.TOP + 55);
    
    let currentY = PdfStyle.MARGIN.TOP + 95;
    const section1Result = section1(doc, data, currentY, isSample, currentPage);
    const section1EndY = section1Result.yPos;
    currentPage = section1Result.page;
    
    // Section 2
    currentY = section1EndY + 20;
    const section2Height = estimateSection2Height();
    
    let breakResult = checkPageBreak(currentY, section2Height, usablePageHeight, doc, isSample, currentPage);
    currentY = breakResult.y;
    currentPage = breakResult.page;
    
    const section2EndY = section2(doc, data, currentY);
    
    // Section 3
    currentY = section2EndY + 20;
    const section3Height = estimateSection3Height();
    
    breakResult = checkPageBreak(currentY, section3Height, usablePageHeight, doc, isSample, currentPage);
    currentY = breakResult.y;
    currentPage = breakResult.page;
    
    const section3EndY = section3(doc, data, currentY);
    
    // Section 4
    currentY = section3EndY + 20;
    const section4Height = estimateSection4Height();
    
    breakResult = checkPageBreak(currentY, section4Height, usablePageHeight, doc, isSample, currentPage);
    currentY = breakResult.y;
    currentPage = breakResult.page;
    
    const section4EndY = section4(doc, data, currentY);
    
    // Section 5 (Endorsement)
    currentY = section4EndY + 20;
    const section5Height = estimateSection5Height();
    
    breakResult = checkPageBreak(currentY, section5Height, usablePageHeight, doc, isSample, currentPage);
    currentY = breakResult.y;
    currentPage = breakResult.page;
    
    section5(doc, data, isSample, buff, currentY);

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
        return { needsBreak: true, page: newPage, y: PdfStyle.MARGIN.TOP + 25 };
    }
    return { needsBreak: false, page: currentPage, y: currentY };
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

const createTableHeaderCell = (doc, tableHeadRow, x, y, width, height, content) => {
    const tableHead = doc.struct('TH');
    tableHeadRow.add(tableHead);
    const tableHeadContent = doc.markStructureContent('TH');
    tableHead.add(tableHeadContent);
    PdfUtils.tableHeaderCell(doc, x, y, width, height, content);
    tableHead.end();
};

const getCatchTableHeaders = () => [
    { x: PdfStyle.MARGIN.LEFT + 15, width: 150, content: ['Catch certificate', '(CC) number'] },
    { x: PdfStyle.MARGIN.LEFT + 165, width: 85, content: ['Vessel name(s) and', 'flag(s) and', 'Validation date(s)'] },
    { x: PdfStyle.MARGIN.LEFT + 250, width: 100, content: ['Catch description'] },
    { x: PdfStyle.MARGIN.LEFT + 350, width: 60, content: ['Total landed', 'weight(kg)'] },
    { x: PdfStyle.MARGIN.LEFT + 410, width: 60, content: ['Catch', 'processed', '(kg)'] },
    { x: PdfStyle.MARGIN.LEFT + 470, width: 60, content: ['Processed', 'fishery', 'product(kg)'] }
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
    { x: PdfStyle.MARGIN.LEFT + 15, width: 150, content: catchData?.catchCertificateNumber || catchData.catchCertificateNumber, isWrapped: true },
    { x: PdfStyle.MARGIN.LEFT + 165, width: 85, content: ['See catch', 'certificate'], isWrapped: true },
    { x: PdfStyle.MARGIN.LEFT + 250, width: 100, content: catchData?.species || catchData.species, isWrapped: true },
    { x: PdfStyle.MARGIN.LEFT + 350, width: 60, content: catchData?.totalWeightLanded || catchData.totalWeightLanded, isWrapped: false },
    { x: PdfStyle.MARGIN.LEFT + 410, width: 60, content: catchData?.exportWeightBeforeProcessing || catchData.exportWeightBeforeProcessing, isWrapped: false },
    { x: PdfStyle.MARGIN.LEFT + 470, width: 60, content: catchData?.exportWeightAfterProcessing || catchData.exportWeightAfterProcessing, isWrapped: false }
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
    
    let page = startingPage + 1;
    let schedY = PdfStyle.MARGIN.TOP;
    
    const startOfPageData = startSpeciesSchedulePage(doc, schedY);
    schedY = startOfPageData.startY;
    let speciesScheduleTableStruct = startOfPageData.tableStruct;
    let cellHeight = PdfStyle.ROW.HEIGHT * 2 - 5;
    
    let tableBody = doc.struct('TBody');
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
    addSpeciesScheduleTableHeaders(doc, startY + 85, tableHeadRow);
    tableHeadRow.end();
    tableHead.end();

    return {startY: startY + 85 + (PdfStyle.ROW.HEIGHT * 3 - 7), tableStruct};
}

const addSpeciesScheduleTableHeaders = (doc, startY, tableHeadRow) => {
    let cellHeight = PdfStyle.ROW.HEIGHT * 3 - 7;

    const headers = getCatchTableHeaders();
    
    // Update the second header for schedule page (has slightly different text)
    headers[1] = { x: PdfStyle.MARGIN.LEFT + 165, width: 85, content: ['Vessel name(s)', 'and flag(s)', 'Validation date(s)'] };
    
    headers.forEach(header => {
        createTableHeaderCell(doc, tableHeadRow, header.x, startY, header.width, cellHeight, header.content);
    });
}

const section5 = (doc, data, isSample, buff, startY) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, 'Endorsement by the competent authority');
    }));
    let yPos = startY + 12;
    let cellHeight = PdfStyle.ROW.HEIGHT * 5;

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
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 235, PdfStyle.ROW.HEIGHT, 'Name and Address');
    tableHeadOne.end();

    const tableHeadTwo = doc.struct('TH');
    tableHeadRow.add(tableHeadTwo);
    const tableHeadTwoContent = doc.markStructureContent('TH');
    tableHeadTwo.add(tableHeadTwoContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 250, yPos, 200, PdfStyle.ROW.HEIGHT, 'Validation');
    tableHeadTwo.end();

    const tableHeadThree = doc.struct('TH');
    tableHeadRow.add(tableHeadThree);
    const tableHeadThreeContent = doc.markStructureContent('TH');
    tableHeadThree.add(tableHeadThreeContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 450, yPos, 80, PdfStyle.ROW.HEIGHT, 'Date Issued');
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
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 235, cellHeight,
        ['Illegal Unreported and Unregulated (IUU) Fishing Team,',
        'Marine Management Organisation,', 'Tyneside House, Skinnerburn Rd,', 'Newcastle upon Tyne. NE4 7AR', 'United Kingdom',
        'Tel: 0300 123 1032',
        'Email: ukiuuslo@marinemanagement.org.uk']);
    TdOne.end();
    
    const TdTwo = doc.struct('TD');
    tableBodyRow.add(TdTwo);
    const TdTwoContent = doc.markStructureContent('TD');
    TdTwo.add(TdTwoContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 250, yPos, 200, cellHeight);
    if (!isSample) {
        PdfUtils.qrCode(doc, buff, PdfStyle.MARGIN.LEFT + 255, startY + 28);
    }
    TdTwo.end();

    const TdThree = doc.struct('TD');
    tableBodyRow.add(TdThree);
    const TdThreeContent = doc.markStructureContent('TD');
    TdThree.add(TdThreeContent);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 450, yPos, 80, cellHeight, PdfUtils.todaysDate());
    TdThree.end();
    tableBodyRow.end();

    doc.endMarkedContent();
    tableBody.end();
    tableStruct.end();
    yPos += cellHeight + 2;
    doc.addStructure(doc.struct('P', () => {
        doc.font(PdfStyle.FONT.REGULAR);
        doc.fontSize(PdfStyle.FONT_SIZE.SMALL);
        doc.text('Validated by the appropriate competent authority (MMO, Scottish Ministers, Welsh Ministers, Department of Agriculture, Environment and Rural Affairs for Northern Ireland, Marine Resources, Growth and Housing and Environment for Jersey, Sea Fisheries, Committee for Economic Development for Guernsey and Department Environment, Food and Agriculture for the Isle of Man) in accordance with article 15 of Council Regulation (EU) 1005/2008 (as retained under s.3(1) European Union (Withdrawal) Act 2018)', PdfStyle.MARGIN.LEFT + 10, yPos);
    }));
}

const section4 = (doc, data, startY) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '4    Exporter details');
    }));
    let yPos = startY + 12;
    let cellHeight = PdfStyle.ROW.HEIGHT * 2;
    let exporterAddress = PdfUtils.constructAddress([data.exporter.addressOne, data.exporter.addressTwo, data.exporter.townCity, data.exporter.postcode]);

    const myTable = doc.struct('Table');
    doc.addStructure(myTable);

    const headers = [
        { x: PdfStyle.MARGIN.LEFT + 15, width: 160, height: PdfStyle.ROW.HEIGHT, content: 'Company' },
        { x: PdfStyle.MARGIN.LEFT + 175, width: 355, height: PdfStyle.ROW.HEIGHT, content: 'Address' }
    ];

    createTableHeaderRow(doc, myTable, headers, yPos);

    const cells = [
        { x: PdfStyle.MARGIN.LEFT + 15, width: 160, height: cellHeight, content: data.exporter.exporterCompanyName, isWrapped: false, yOffset: PdfStyle.ROW.HEIGHT },
        { x: PdfStyle.MARGIN.LEFT + 175, width: 355, height: cellHeight, content: exporterAddress, isWrapped: true, yOffset: PdfStyle.ROW.HEIGHT }
    ];

    createTableBodyWithRow(doc, myTable, cells, yPos);

    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT + cellHeight + 8);
    }));
    
    return yPos + PdfStyle.ROW.HEIGHT + cellHeight + 8;
}

const section3 = (doc, data, startY) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '3    Health certificate details');
    }));
    let yPos = startY + 12;

    const myTable = doc.struct('Table');
    doc.addStructure(myTable);

    const tableRow = doc.struct('TR');
    myTable.add(tableRow);

    const tableHeadOne = doc.struct('TH');
    tableRow.add(tableHeadOne);
    const tableHeadOneContent = doc.markStructureContent('TH');
    tableHeadOne.add(tableHeadOneContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 130, PdfStyle.ROW.HEIGHT, 'Health certificate number');
    tableHeadOne.end();

    const TdOne = doc.struct('TD');
    tableRow.add(TdOne);
    const TdOneContent = doc.markStructureContent('TD');
    TdOne.add(TdOneContent);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 145, yPos, 255, PdfStyle.ROW.HEIGHT, data.healthCertificateNumber);
    TdOne.end();

    const tableHeadTwo = doc.struct('TH');
    tableRow.add(tableHeadTwo);
    const tableHeadTwoContent = doc.markStructureContent('TH');
    tableHeadTwo.add(tableHeadTwoContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 400, yPos, 50, PdfStyle.ROW.HEIGHT, 'Date');
    tableHeadTwo.end();

    const TdTwo = doc.struct('TD');
    tableRow.add(TdTwo);
    const TdTwoContent = doc.markStructureContent('TD');
    TdTwo.add(TdTwoContent);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 450, yPos, 80, PdfStyle.ROW.HEIGHT, data.healthCertificateDate);
    TdTwo.end();

    tableRow.end();
    doc.endMarkedContent();
    myTable.end();
   
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT + 8);
    }));
    
    return yPos + PdfStyle.ROW.HEIGHT + 8;
}

const section2 = (doc, data, startY) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '2    Processing plant details');
    }));
    let yPos = startY + 12;
    let cellHeight = PdfStyle.ROW.HEIGHT * 2 - 5;
    const ppAddress = PdfUtils.constructAddress([data.plantAddressOne, data.plantAddressTwo, data.plantTownCity, data.plantPostcode]);

    const myTable = doc.struct('Table');
    doc.addStructure(myTable);

    const headers = [
        { x: PdfStyle.MARGIN.LEFT + 15, width: 110, height: cellHeight, content: ['Processing plant'] },
        { x: PdfStyle.MARGIN.LEFT + 125, width: 155, height: cellHeight, content: 'Address' },
        { x: PdfStyle.MARGIN.LEFT + 280, width: 95, height: cellHeight, content: ['Plant approval', 'number'] },
        { x: PdfStyle.MARGIN.LEFT + 375, width: 85, height: cellHeight, content: ['Responsible', 'person'] },
        { x: PdfStyle.MARGIN.LEFT + 460, width: 70, height: cellHeight, content: ['Date of', 'acceptance (*)'] }
    ];

    createTableHeaderRow(doc, myTable, headers, yPos);

    const cells = [
        { x: PdfStyle.MARGIN.LEFT + 15, width: 110, height: PdfStyle.ROW.HEIGHT * 3 - 9, content: data.plantName, isWrapped: true, yOffset: cellHeight },
        { x: PdfStyle.MARGIN.LEFT + 125, width: 155, height: PdfStyle.ROW.HEIGHT * 3 - 9, content: ppAddress, isWrapped: true, yOffset: cellHeight },
        { x: PdfStyle.MARGIN.LEFT + 280, width: 95, height: PdfStyle.ROW.HEIGHT * 3 - 9, content: data.plantApprovalNumber, isWrapped: false, yOffset: cellHeight },
        { x: PdfStyle.MARGIN.LEFT + 375, width: 85, height: PdfStyle.ROW.HEIGHT * 3 - 9, content: data.personResponsibleForConsignment, isWrapped: true, yOffset: cellHeight },
        { x: PdfStyle.MARGIN.LEFT + 460, width: 70, height: PdfStyle.ROW.HEIGHT * 3 - 9, content: data.dateOfAcceptance, isWrapped: false, yOffset: cellHeight }
    ];

    createTableBodyWithRow(doc, myTable, cells, yPos);

    yPos += cellHeight + PdfStyle.ROW.HEIGHT * 3 - 9 + 5;
    doc.addStructure(doc.struct('P', () => {
        doc.text('* Date of acceptance by the process plant\'s responsible person of the veracity of the contents of this processing statement', PdfStyle.MARGIN.LEFT + 15, yPos);
    }));

    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT);
    }));
    
    return yPos + PdfStyle.ROW.HEIGHT;
}

const section1 = (doc, data, startY, isSample, currentPage) => {
    let yPos = startY + 12;
    const products = getProductsArray(data);
    let page = currentPage;
    const pageHeight = 780;
    const paginationReservedSpace = 50;
    const usablePageHeight = pageHeight - paginationReservedSpace;
    
    for (let productIndex = 0; productIndex < products.length; productIndex++) {
        // Check minimum space needed to start a product (header + description + table header)
        const minProductStartHeight = 12 + PdfStyle.ROW.HEIGHT + (PdfStyle.ROW.HEIGHT * 2 - 5) + 5 + PdfStyle.ROW.HEIGHT + 5 + (PdfStyle.ROW.HEIGHT * 3 - 7);
        
        // Only move to new page if we don't have enough space to even start rendering
        if (yPos + minProductStartHeight > usablePageHeight) {
            page = startNewPage(doc, isSample, page);
            yPos = PdfStyle.MARGIN.TOP + 25;
            
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
    // Need to ensure separator (at yPos + 8) doesn't go beyond usablePageHeight
    const separatorY = yPos + 8;
    const separatorEndY = separatorY + 3; // Separator itself has some height
    
    if (separatorEndY > usablePageHeight) {
        page = startNewPage(doc, isSample, page);
        yPos = PdfStyle.MARGIN.TOP + 25;
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
        yPos += 13;
    }

    if (productIndex === 0) {
        doc.addStructure(doc.struct('H3', () => {
            PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '1');
        }));
    }

    // Ensure this label uses the standard content left offset and a slightly
    // reduced vertical increment so it visually aligns with the surrounding
    // tables (reduces the gap observed between the two tables).
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 'I confirm that the processed fishery product:');
    }));
    yPos += PdfStyle.ROW.HEIGHT - 3; // Reduced from -2 to -3 for tighter spacing

    yPos = renderProductDescription(doc, product, yPos);

    const tableResult = renderProductTable(doc, data, productIndex, yPos, page, isSample, usablePageHeight);
    yPos = tableResult.yPos;
    page = tableResult.page;

    // Add minimal spacing after product (only between multiple products)
    if (productIndex > 0) {
        yPos += 8; // Reduced from PdfStyle.ROW.HEIGHT
    }

    return { yPos, page };
}

const renderProductDescription = (doc, product, startY) => {
    const cellHeight = PdfStyle.ROW.HEIGHT * 2 - 5;
    const productDescription = formatProductDescription(product);
    
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, startY, 515, cellHeight, productDescription, 2);
    }));
    return startY + cellHeight + 3; // Reduced from +5 to +3
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
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 'has been obtained from catches under the following catch certificate(s):');
    }));
    yPos += PdfStyle.ROW.HEIGHT + 2; // Reduced from +3 to +2
    
    return createProductTable(doc, data, yPos, productIndex, currentPage, isSample, usablePageHeight);
}

const statement = (doc, data, isSample, startY) => {
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        doc.lineWidth(2);
        doc.moveTo(PdfStyle.MARGIN.LEFT, startY + 4).lineTo(560, startY + 4).stroke();
    }));

    let documentNumber = '';
    if (isSample) {
        documentNumber = '###-####-##-#########';
    } else {
        documentNumber = data.documentNumber;
    }

    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT, startY + 17, 'Document Number');
    }));
    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 95, startY + 15, 160, PdfStyle.ROW.HEIGHT, documentNumber);
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.separator(doc, startY + 40);
    }));
};

module.exports = renderProcessingStatement;