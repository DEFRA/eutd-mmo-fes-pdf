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

    statement(doc, data, isSample,PdfStyle.MARGIN.TOP + 55);
    section1(doc, data, PdfStyle.MARGIN.TOP + 158);
    section2(doc, data, PdfStyle.MARGIN.TOP + 390);
    section3(doc, data, PdfStyle.MARGIN.TOP + 491);
    section4(doc, data, PdfStyle.MARGIN.TOP + 535);
    section5(doc, data, isSample, buff, PdfStyle.MARGIN.TOP + 609);

    if (isSample) {
        CommonUtils.addSampleWatermark(doc);
    }
    PdfUtils.endOfPage(doc, 1);

    endSchedulePage(doc, data, isSample);

    doc.end();
};

const endSchedulePage = (doc, data, isSample) => {
    let schedY = PdfStyle.MARGIN.TOP;
    let pageHeight = 780;
    let page = 1;

    if (data.catches.length > 5) {
        schedY = PdfStyle.MARGIN.TOP;
        page += 1;
        const startOfPageData = startSpeciesSchedulePage(doc, schedY);
        schedY = startOfPageData.startY;
        let speciesScheduleTableStruct = startOfPageData.tableStruct;
        let cellHeight = PdfStyle.ROW.HEIGHT * 2 - 5;
        const catchesLength = data.catches.length;
        
        let tableBody = doc.struct('TBody');
        speciesScheduleTableStruct.add(tableBody);

        for (let catchesIdx = 0; catchesIdx < catchesLength; catchesIdx++) {
            const tableBodyRow = doc.struct('TR');
            tableBody.add(tableBodyRow);

            const TdOne = doc.markStructureContent('TD');
            tableBodyRow.add(TdOne);
            PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 15, schedY, 150, cellHeight, data.catches[catchesIdx].catchCertificateNumber);
            
            const TdTwo = doc.markStructureContent('TD');
            tableBodyRow.add(TdTwo);
            PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 165, schedY, 85, cellHeight, ['See catch', 'certificate']);
            
            const TdThree = doc.markStructureContent('TD');
            tableBodyRow.add(TdThree);
            PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 250, schedY, 100, cellHeight, data.catches[catchesIdx].species);

            const TdFour = doc.markStructureContent('TD');
            tableBodyRow.add(TdFour);
            PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 350, schedY, 60, cellHeight, data.catches[catchesIdx].totalWeightLanded);

            const TdFive = doc.markStructureContent('TD');
            tableBodyRow.add(TdFive);
            PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 410, schedY, 60, cellHeight, data.catches[catchesIdx].exportWeightBeforeProcessing);

            const TdSix = doc.markStructureContent('TD');
            tableBodyRow.add(TdSix);
            PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 470, schedY, 60, cellHeight, data.catches[catchesIdx].exportWeightAfterProcessing);
            
            schedY += cellHeight;
            tableBodyRow.end();
            if (schedY + cellHeight > pageHeight && (catchesIdx + 1 < catchesLength)) {
                doc.endMarkedContent();
                tableBody.end();
                speciesScheduleTableStruct.end();
                
                schedY = PdfStyle.MARGIN.TOP;
                if (isSample) {
                    CommonUtils.addSampleWatermark(doc);
                }
                PdfUtils.endOfPage(doc, page);
                page += 1;
                const startOfPage = startSpeciesSchedulePage(doc, schedY);
                speciesScheduleTableStruct = startOfPage.tableStruct;
                schedY = startOfPage.startY;
                tableBody = doc.struct('TBody');
                speciesScheduleTableStruct.add(tableBody);
            }
        }

        if (isSample) {
            CommonUtils.addSampleWatermark(doc);
        }
        PdfUtils.endOfPage(doc, page);
    }
}

const startSpeciesSchedulePage = (doc, startY) => {
    CommonUtils.startScheduledPage(doc, startY, 'PROCESSING STATEMENT - SCHEDULE');
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + 85, 'Catches in this consignment');
    const tableStruct = doc.struct('Table');
    doc.addStructure(tableStruct);

    const tableHead = doc.struct('THead');
    tableStruct.add(tableHead);

    const tableHeadRow = doc.struct('TR');
    tableHead.add(tableHeadRow);
    addSpeciesScheduleTableHeaders(doc, startY + 105, tableHeadRow);
    tableHeadRow.end();
    tableHead.end();

    return {startY: startY + 105 + (PdfStyle.ROW.HEIGHT * 3 - 7), tableStruct};
}

const addSpeciesScheduleTableHeaders = (doc, startY, tableHeadRow) => {
    let cellHeight = PdfStyle.ROW.HEIGHT * 3 - 7;

    const tableHeadOne = doc.markStructureContent('TH');
    tableHeadRow.add(tableHeadOne);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, startY, 150, cellHeight, ['Catch certificate', '(CC) number']);

    const tableHeadTwo = doc.markStructureContent('TH');
    tableHeadRow.add(tableHeadTwo);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 165, startY, 85, cellHeight, ['Vessel name and', 'Validation date']);

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

const section5 = (doc, data, isSample, buff, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, 'Endorsement by the competent authority');
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
        'Marine Management Organisation,', 'Lancaster House, Hampshire Court,', 'Newcastle upon Tyne. NE4 7YJ', 'United Kingdom',
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
    let yPos = startY + 12;
    let cellHeight = PdfStyle.ROW.HEIGHT * 2;
    let exporterAddress = PdfUtils.constructAddress([data.exporter.addressOne, data.exporter.addressTwo, data.exporter.townCity, data.exporter.postcode]);

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
}

const section3 = (doc, data, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '3    Health certificate details');
    let yPos = startY + 12;

    doc.addStructure(doc.struct('Table', [
        doc.struct('TR', [
            doc.struct('TH', ()=>  PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 130, PdfStyle.ROW.HEIGHT, 'Health certificate number')),
            doc.struct('TD', ()=>  PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 145, yPos, 255, PdfStyle.ROW.HEIGHT, data.healthCertificateNumber)),
            doc.struct('TH', ()=>  PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 400, yPos, 50, PdfStyle.ROW.HEIGHT, 'Date')),
            doc.struct('TD', ()=>  PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 450, yPos, 80, PdfStyle.ROW.HEIGHT, data.healthCertificateDate)),
        ])
    ]));
   
    PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT + 8);
}

const section2 = (doc, data, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '2    Processing plant details');
    let yPos = startY + 12;
    let cellHeight = PdfStyle.ROW.HEIGHT * 2 - 5;
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
    doc.text('* Date of acceptance by the process plant’s responsible person of the veracity of the contents of this processing statement', PdfStyle.MARGIN.LEFT + 15, yPos);

    PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT);
}

const section1 = (doc, data, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '1    Catches in this consignment');
    let yPos = startY + 12;
    let cellHeight = PdfStyle.ROW.HEIGHT * 3 - 7;

    const myTable = doc.struct('Table');
    doc.addStructure(myTable);

    const tableHead = doc.struct('THead');
    myTable.add(tableHead);

    const tableHeadRow = doc.struct('TR');
    tableHead.add(tableHeadRow);

    const tableHeadOne = doc.struct('TH');
    tableHeadRow.add(tableHeadOne);
    const tableHeadOneContent = doc.markStructureContent('TH');
    tableHeadOne.add(tableHeadOneContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 150, cellHeight, ['Catch certificate', '(CC) number']);
    tableHeadOne.end();

    const tableHeadTwo = doc.struct('TH');
    tableHeadRow.add(tableHeadTwo);
    const tableHeadTwoContent = doc.markStructureContent('TH');
    tableHeadTwo.add(tableHeadTwoContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 165, yPos, 85, cellHeight, ['Vessel name and', 'Validation date']);
    tableHeadTwo.end();

    const tableHeadThree = doc.struct('TH');
    tableHeadRow.add(tableHeadThree);
    const tableHeadThreeContent = doc.markStructureContent('TH');
    tableHeadThree.add(tableHeadThreeContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 250, yPos, 100, cellHeight, ['Catch description']);
    tableHeadThree.end();

    const tableHeadFour = doc.struct('TH');
    tableHeadRow.add(tableHeadFour);
    const tableHeadFourContent = doc.markStructureContent('TH');
    tableHeadFour.add(tableHeadFourContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 350, yPos, 60, cellHeight, ['Total landed', 'weight(kg)']);
    tableHeadFour.end();

    const tableHeadFive = doc.struct('TH');
    tableHeadRow.add(tableHeadFive);
    const tableHeadFiveContent = doc.markStructureContent('TH');
    tableHeadFive.add(tableHeadFiveContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 410, yPos, 60, cellHeight, ['Catch', 'processed', '(kg)']);
    tableHeadFive.end();

    const tableHeadSix = doc.struct('TH');
    tableHeadRow.add(tableHeadSix);
    const tableHeadSixContent = doc.markStructureContent('TH');
    tableHeadSix.add(tableHeadSixContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 470, yPos, 60, cellHeight, ['Processed', 'fishery', 'product(kg)']);
    tableHeadSix.end();

    tableHeadRow.end();
    tableHead.end();

    const tableBody = doc.struct('TBody');
    myTable.add(tableBody);

    yPos += cellHeight;
    cellHeight = PdfStyle.ROW.HEIGHT * 2 + 4;

    const arrLength = data.catches.length;
    let listLimit = 5;
    if (arrLength > 5) {
        listLimit = 0;
    }

    for (let rowIdx = 0; rowIdx < listLimit; rowIdx++) {
        const tableBodyRow = doc.struct('TR');
        tableBody.add(tableBodyRow);

        const TdOne = doc.struct('TD');
        tableBodyRow.add(TdOne);
        const TdOneContent = doc.markStructureContent('TD');
        TdOne.add(TdOneContent);
        PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 150, cellHeight, rowIdx < arrLength ? `${data.catches[rowIdx].catchCertificateNumber}` : '');
        TdOne.end();

        const TdTwo = doc.struct('TD');
        tableBodyRow.add(TdTwo);
        const TdTwoContent = doc.markStructureContent('TD');
        TdTwo.add(TdTwoContent);
        PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 165, yPos, 85, cellHeight, rowIdx < arrLength ? ['See catch', 'certificate'] : '');
        TdTwo.end();

        const TdThree = doc.struct('TD');
        tableBodyRow.add(TdThree);
        const TdThreeContent = doc.markStructureContent('TD');
        TdThree.add(TdThreeContent);
        PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 250, yPos, 100, cellHeight, rowIdx < arrLength ? `${data.catches[rowIdx].species}` : '');
        TdThree.end();

        const TdFour = doc.struct('TD');
        tableBodyRow.add(TdFour);
        const TdFourContent = doc.markStructureContent('TD');
        TdFour.add(TdFourContent);
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 350, yPos, 60, cellHeight, rowIdx < arrLength ? `${data.catches[rowIdx].totalWeightLanded}` : '');
        TdFour.end();

        const TdFive = doc.struct('TD');
        tableBodyRow.add(TdFive);
        const TdFiveContent = doc.markStructureContent('TD');
        TdFive.add(TdFiveContent);   
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 410, yPos, 60, cellHeight, rowIdx < arrLength ? `${data.catches[rowIdx].exportWeightBeforeProcessing}` : '');
        TdFive.end();

        const TdSix = doc.struct('TD');
        tableBodyRow.add(TdSix);
        const TdSixContent = doc.markStructureContent('TD');
        TdSix.add(TdSixContent);
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 470, yPos, 60, cellHeight, rowIdx < arrLength ? `${data.catches[rowIdx].exportWeightAfterProcessing}` : '');
        TdSix.end();

        tableBodyRow.end();
        yPos += cellHeight;
    }

    if (arrLength > 5) {
        cellHeight = PdfStyle.ROW.HEIGHT * 8 + 4;
        
        const tableBodyRow = doc.struct('TR');
        tableBody.add(tableBodyRow);

        const TdOne = doc.struct('TD');
        tableBodyRow.add(TdOne);
        const TdOneContent = doc.markStructureContent('TD');
        TdOne.add(TdOneContent);
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 515, cellHeight, 'SEE SCHEDULE (' + data.catches.length + ' rows)');
        TdOne.end();

        tableBodyRow.end();
        yPos += cellHeight;
    }
    
    doc.endMarkedContent();
    tableBody.end();
    myTable.end();
    PdfUtils.separator(doc, yPos + 8);
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

    let yPos = startY + 40;

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 'I confirm that the processed fishery products:');
    yPos += PdfStyle.ROW.HEIGHT;
    let cellHeight = PdfStyle.ROW.HEIGHT * 2 - 5;
    const useProductsDescritpion = (Array.isArray(data.products) &&  data.products.length > 0) 
    const productDescription = useProductsDescritpion
      ? data.products.reduce((accumulator, currentValue, currentIndex) => {
          if (currentIndex === data.products.length - 1) {
            return (
              accumulator +
              `${currentValue.commodityCode} ${currentValue.description}`
            );
          }
          return (
            accumulator +
            `${currentValue.commodityCode} ${currentValue.description}, `
          );
        }, "")
      : null;
    
    const consignmentDescription = data.consignmentDescription ? data.consignmentDescription : '';
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 515, cellHeight, useProductsDescritpion ? productDescription : consignmentDescription, 2);

    yPos += cellHeight + 5;

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 'have been obtained from catches imported under the following catch certificate(s):');
    PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT);
};

module.exports = renderProcessingStatement;