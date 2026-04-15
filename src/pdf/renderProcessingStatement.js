/* eslint-disable no-magic-numbers */
const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const CommonUtils = require('../utils/common-utils');
const {
    startNewPage,
    estimateSection2Height,
    estimateSection3Height,
    estimateSection4Height,
    estimateSection5Height,
    endSchedulePage,
    createProductTable,
} = require('./renderProcessingStatement-schedule');

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
    
    if (currentY + section2Height > usablePageHeight) {
        currentPage = startNewPage(doc, isSample, currentPage);
        currentY = PdfStyle.MARGIN.TOP + 25;
    }
    const section2EndY = section2(doc, data, currentY);
    
    // Section 3
    currentY = section2EndY + 20;
    const section3Height = estimateSection3Height();
    
    if (currentY + section3Height > usablePageHeight) {
        currentPage = startNewPage(doc, isSample, currentPage);
        currentY = PdfStyle.MARGIN.TOP + 25;
    }
    const section3EndY = section3(doc, data, currentY);
    
    // Section 4
    currentY = section3EndY + 20;
    const section4Height = estimateSection4Height();
    
    if (currentY + section4Height > usablePageHeight) {
        currentPage = startNewPage(doc, isSample, currentPage);
        currentY = PdfStyle.MARGIN.TOP + 25;
    }
    const section4EndY = section4(doc, data, currentY);
    
    // Section 5 (Endorsement)
    currentY = section4EndY + 20;
    const section5Height = estimateSection5Height();
    
    if (currentY + section5Height > usablePageHeight) {
        currentPage = startNewPage(doc, isSample, currentPage);
        currentY = PdfStyle.MARGIN.TOP + 25;
    }
    section5(doc, data, isSample, buff, currentY);

    if (isSample) {
        CommonUtils.addSampleWatermark(doc);
    }
    PdfUtils.endOfPage(doc, currentPage);

    endSchedulePage(doc, data, isSample);

    doc.end();
};

const section5 = (doc, _data, isSample, buff, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, 'Endorsement by the competent authority');
    let yPos = startY + 12;
    const cellHeight = PdfStyle.ROW.HEIGHT * 5;

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
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 250, yPos, 200, cellHeight)
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
    doc.font(PdfStyle.FONT.REGULAR);
    doc.fontSize(PdfStyle.FONT_SIZE.SMALL);
    doc.text('Validated by the appropriate competent authority (MMO, Scottish Ministers, Welsh Ministers, Department of Agriculture, Environment and Rural Affairs for Northern Ireland, Marine Resources, Growth and Housing and Environment for Jersey, Sea Fisheries, Committee for Economic Development for Guernsey and Department Environment, Food and Agriculture for the Isle of Man) in accordance with article 15 of Council Regulation (EU) 1005/2008 (as retained under s.3(1) European Union (Withdrawal) Act 2018)', PdfStyle.MARGIN.LEFT + 10, yPos);

}

const section4 = (doc, data, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '4    Exporter details');
    const yPos = startY + 12;
    const cellHeight = PdfStyle.ROW.HEIGHT * 2;
    const exporterAddress = PdfUtils.constructAddress([data.exporter.addressOne, data.exporter.addressTwo, data.exporter.townCity, data.exporter.postcode]);

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 160, PdfStyle.ROW.HEIGHT, 'Company')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 175, yPos, 355, PdfStyle.ROW.HEIGHT, 'Address')),
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos + PdfStyle.ROW.HEIGHT, 160, cellHeight, data.exporter.exporterCompanyName)),
                doc.struct('TD', ()=>  PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 175, yPos + PdfStyle.ROW.HEIGHT, 355, cellHeight, exporterAddress)),
            ])
        ])
    ]));
    PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT + cellHeight + 8);
    
    return yPos + PdfStyle.ROW.HEIGHT + cellHeight + 8;
}

const section3 = (doc, data, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '3    Health certificate details');
    const yPos = startY + 12;

    doc.addStructure(doc.struct('Table', [
        doc.struct('TR', [
            doc.struct('TH', ()=>  PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 130, PdfStyle.ROW.HEIGHT, 'Health certificate number')),
            doc.struct('TD', ()=>  PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 145, yPos, 255, PdfStyle.ROW.HEIGHT, data.healthCertificateNumber)),
            doc.struct('TH', ()=>  PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 400, yPos, 50, PdfStyle.ROW.HEIGHT, 'Date')),
            doc.struct('TD', ()=>  PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 450, yPos, 80, PdfStyle.ROW.HEIGHT, data.healthCertificateDate)),
        ])
    ]));
   
    PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT + 8);
    
    return yPos + PdfStyle.ROW.HEIGHT + 8;
}

const section2 = (doc, data, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '2    Processing plant details');
    let yPos = startY + 12;
    const cellHeight = PdfStyle.ROW.HEIGHT * 2 - 5;
    const ppAddress = PdfUtils.constructAddress([data.plantAddressOne, data.plantAddressTwo, data.plantTownCity, data.plantPostcode]);

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 110, cellHeight, ['Processing plant'])),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 125, yPos, 155, cellHeight, 'Address')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 280, yPos, 95, cellHeight, ['Plant approval', 'number'])),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 375, yPos, 85, cellHeight, ['Responsible', 'person'])),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 460, yPos, 70, cellHeight, ['Date of', 'acceptance (*)']))
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 15, yPos + cellHeight, 110, PdfStyle.ROW.HEIGHT * 3 - 9, data.plantName)),
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 125, yPos + cellHeight, 155, PdfStyle.ROW.HEIGHT * 3 - 9, ppAddress)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 280, yPos + cellHeight, 95, PdfStyle.ROW.HEIGHT * 3 - 9, data.plantApprovalNumber)),
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 375, yPos + cellHeight, 85, PdfStyle.ROW.HEIGHT * 3 - 9, data.personResponsibleForConsignment)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 460, yPos + cellHeight, 70, PdfStyle.ROW.HEIGHT * 3 - 9, data.dateOfAcceptance))
            ])
        ])
    ]));

    yPos += cellHeight + PdfStyle.ROW.HEIGHT * 3 - 9 + 5;
    doc.text('* Date of acceptance by the process plant\'s responsible person of the veracity of the contents of this processing statement', PdfStyle.MARGIN.LEFT + 15, yPos);

    PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT);
    
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
                PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '1');
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
        PdfUtils.separator(doc, yPos);
        return { yPos: yPos, page };
    }
    
    PdfUtils.separator(doc, separatorY);
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
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '1');
    }

    // Ensure this label uses the standard content left offset and a slightly
    // reduced vertical increment so it visually aligns with the surrounding
    // tables (reduces the gap observed between the two tables).
    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 'I confirm that the processed fishery product:');
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
    
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, startY, 515, cellHeight, productDescription, 2);
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
    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 'has been obtained from catches under the following catch certificate(s):');
    yPos += PdfStyle.ROW.HEIGHT + 2; // Reduced from +3 to +2
    
    return createProductTable(doc, data, yPos, productIndex, currentPage, isSample, usablePageHeight);
}

const statement = (doc, data, isSample, startY) => {
    doc.lineWidth(2);
    doc.moveTo(PdfStyle.MARGIN.LEFT, startY + 4).lineTo(560, startY + 4).stroke();

    let documentNumber = '';
    if (isSample) {
        documentNumber = '###-####-##-#########';
    } else {
        documentNumber = data.documentNumber;
    }

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT, startY + 17, 'Document Number');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 95, startY + 15, 160, PdfStyle.ROW.HEIGHT, documentNumber);
    PdfUtils.separator(doc, startY + 40);
};


module.exports = renderProcessingStatement;
