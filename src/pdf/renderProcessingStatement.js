const PDFDocument = require('pdfkit');
const path = require('path');
const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');

const renderProcessingStatement = async (data, isSample, uri, stream) => {

    const sampleWatermarkImageFile = path.join(__dirname, '../resources/sample-watermark.png');
    let buff = null;
    if (!isSample) {
        buff = await PdfUtils.generateQRCode(uri);
    }
    const doc = new PDFDocument({
        layout: 'portrait',
        size: 'A4',
        lang: 'en_GB',
        margins: {
            top: PdfStyle.MARGIN.TOP,
            bottom: PdfStyle.MARGIN.BOT,
            left: PdfStyle.MARGIN.LEFT,
            right: PdfStyle.MARGIN.RIGHT,
        },
        pdfVersion: "1.5",
        tagged: true,
        displayTitle: true,
        info: {
            Title: path.basename(uri).split`.`[0]
        }
    });
    doc.pipe(stream);

    PdfUtils.heading(doc, 'PROCESSING STATEMENT');

    statement(doc, data, isSample,PdfStyle.MARGIN.TOP + 55);
    section1(doc, data, PdfStyle.MARGIN.TOP + 158);
    section2(doc, data, PdfStyle.MARGIN.TOP + 390);
    section3(doc, data, PdfStyle.MARGIN.TOP + 491);
    section4(doc, data, PdfStyle.MARGIN.TOP + 535);
    section5(doc, data, isSample, buff, PdfStyle.MARGIN.TOP + 609);

    if (isSample) {
        doc.image(sampleWatermarkImageFile, PdfStyle.MARGIN.LEFT + 10, 120, {scale: 1});
    }
    PdfUtils.endOfPage(doc, 1);

    endSchedulePage(doc, data, isSample, sampleWatermarkImageFile);

    doc.end();
};

const endSchedulePage = (doc, data, isSample, sampleWatermarkImageFile) => {
    let schedY = PdfStyle.MARGIN.TOP;
    let pageHeight = 780;
    let page = 1;

    if (data.catches.length > 5) {
        const catchesLength = data.catches.length;
        if (schedY === PdfStyle.MARGIN.TOP || schedY + 150 > pageHeight) {
            schedY = PdfStyle.MARGIN.TOP;
            if (page !== 1) {
                PdfUtils.endOfPage(doc, page);
            }
            page += 1;
            schedY = startSpeciesSchedulePage(doc, page, schedY);
        } else {
            schedY += 25;
            PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, schedY, 'Catches in this consignment');
            schedY += 20;
            addSpeciesScheduleTableHeaders(doc, schedY)
            schedY += (PdfStyle.ROW.HEIGHT * 3 - 7);
        }
        let cellHeight = PdfStyle.ROW.HEIGHT * 2 - 5;
        for (let catchesIdx = 0; catchesIdx < catchesLength; catchesIdx++) {
            PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 15, schedY, 150, cellHeight, data.catches[catchesIdx].catchCertificateNumber);
            PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 165, schedY, 85, cellHeight, ['See catch', 'certificate']);
            PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 250, schedY, 100, cellHeight, data.catches[catchesIdx].species);
            PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 350, schedY, 60, cellHeight, data.catches[catchesIdx].totalWeightLanded);
            PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 410, schedY, 60, cellHeight, data.catches[catchesIdx].exportWeightBeforeProcessing);
            PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 470, schedY, 60, cellHeight, data.catches[catchesIdx].exportWeightAfterProcessing);

            schedY += cellHeight;

            if (schedY + cellHeight > pageHeight && (catchesIdx + 1 < catchesLength)) {
                schedY = PdfStyle.MARGIN.TOP;
                if (isSample) {
                    doc.image(sampleWatermarkImageFile, PdfStyle.MARGIN.LEFT + 10, 120, {scale: 1});
                }
                PdfUtils.endOfPage(doc, page);
                page += 1;
                schedY = startSpeciesSchedulePage(doc, page, schedY);
            }
        }
    }

    if (data.catches.length > 5) {
        if (isSample) {
            doc.image(sampleWatermarkImageFile, PdfStyle.MARGIN.LEFT + 10, 120, {scale: 1});
        }
        PdfUtils.endOfPage(doc, page);
    }
}

const startSpeciesSchedulePage = (doc, page, startY) => {
    startSchedulePage(doc, page, startY);
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + 85, 'Catches in this consignment');
    addSpeciesScheduleTableHeaders(doc, startY + 105);
    return startY + 105 + (PdfStyle.ROW.HEIGHT * 3 - 7);
}

const addSpeciesScheduleTableHeaders = (doc, startY) => {
    let cellHeight = PdfStyle.ROW.HEIGHT * 3 - 7;
    //PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, startY, 80, cellHeight, ['Catch certificate', '(CC) number']);
    //PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 95, startY, 95, cellHeight, ['Vessel name', 'and flag']);
    //PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 190, startY, 60, cellHeight, ['Validation', 'date']);

    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, startY, 150, cellHeight, ['Catch certificate', '(CC) number']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 165, startY, 85, cellHeight, ['Vessel name and', 'Validation date']);

    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 250, startY, 100, cellHeight, ['Catch description']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 350, startY, 60, cellHeight, ['Total landed', 'weight(kg)']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 410, startY, 60, cellHeight, ['Catch', 'processed', '(kg)']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 470, startY, 60, cellHeight, ['Processed', 'fishery', 'product(kg)']);
}

const startSchedulePage = (doc, page, startY) => {
    doc.addPage({
        size: 'A4',
        margins: {
            top: PdfStyle.MARGIN.TOP,
            bottom: PdfStyle.MARGIN.BOT,
            left: PdfStyle.MARGIN.LEFT,
            right: PdfStyle.MARGIN.RIGHT,
        },
        layout: 'portrait'
    });
    PdfUtils.heading(doc, 'PROCESSING STATEMENT - SCHEDULE');

    doc.lineWidth(2);
    doc.moveTo(PdfStyle.MARGIN.LEFT, startY + 70).lineTo(560, startY + 70).stroke();
}

const section5 = (doc, data, isSample, buff, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, 'Endorsement by the competent authority');
    let yPos = startY + 12;
    let cellHeight = PdfStyle.ROW.HEIGHT * 5;

    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 235, PdfStyle.ROW.HEIGHT, 'Name and Address');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 250, yPos, 200, PdfStyle.ROW.HEIGHT, 'Validation');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 450, yPos, 80, PdfStyle.ROW.HEIGHT, 'Date Issued');

    yPos += PdfStyle.ROW.HEIGHT;

    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 235, cellHeight,
        ['Illegal Unreported and Unregulated (IUU) Fishing Team,',
        'Marine Management Organisation,', 'Lancaster House, Hampshire Court,', 'Newcastle upon Tyne. NE4 7YJ', 'United Kingdom',
        'Tel: 0300 123 1032',
        'Email: ukiuuslo@marinemanagement.org.uk']);

    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 250, yPos, 200, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 450, yPos, 80, cellHeight, PdfUtils.todaysDate());

    if (!isSample) {
        PdfUtils.qrCode(doc, buff, PdfStyle.MARGIN.LEFT + 255, startY + 28);
    }

    yPos += cellHeight + 2;
    doc.font(PdfStyle.FONT.REGULAR);
    doc.fontSize(PdfStyle.FONT_SIZE.SMALL);
    doc.text('Validated by the appropriate competent authority (MMO, Scottish Ministers, Welsh Ministers, Department of Agriculture, Environment and Rural Affairs for Northern Ireland, Marine Resources, Growth and Housing and Environment for Jersey, Sea Fisheries, Committee for Economic Development for Guernsey and Department Environment, Food and Agriculture for the Isle of Man) in accordance with article 15 of Council Regulation (EU) 1005/2008 (as retained under s.3(1) European Union (Withdrawal) Act 2018)', PdfStyle.MARGIN.LEFT + 10, yPos);

}

const section4 = (doc, data, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '4    Exporter details');
    let yPos = startY + 12;
    let cellHeight = PdfStyle.ROW.HEIGHT * 2;

    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 160, PdfStyle.ROW.HEIGHT, 'Company');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 175, yPos, 355, PdfStyle.ROW.HEIGHT, 'Address');

    yPos += PdfStyle.ROW.HEIGHT;

    let exporterAddress = PdfUtils.constructAddress([data.exporter.addressOne, data.exporter.addressTwo, data.exporter.townCity, data.exporter.postcode]);

    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 160, cellHeight, data.exporter.exporterCompanyName);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 175, yPos, 355, cellHeight, exporterAddress);

    PdfUtils.separator(doc, yPos + cellHeight + 8);
}

const section3 = (doc, data, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '3    Health certificate details');
    let yPos = startY + 12;
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 130, PdfStyle.ROW.HEIGHT, 'Health certificate number');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 145, yPos, 255, PdfStyle.ROW.HEIGHT, data.healthCertificateNumber);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 400, yPos, 50, PdfStyle.ROW.HEIGHT, 'Date');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 450, yPos, 80, PdfStyle.ROW.HEIGHT, data.healthCertificateDate);

    PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT + 8);
}

const section2 = (doc, data, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '2    Processing plant details');
    let yPos = startY + 12;
    let cellHeight = PdfStyle.ROW.HEIGHT * 2 - 5;
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 110, cellHeight, ['Processing plant']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 125, yPos, 155, cellHeight, 'Address');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 280, yPos, 95, cellHeight, ['Plant approval', 'number']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 375, yPos, 85, cellHeight, ['Responsible', 'person']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 460, yPos, 70, cellHeight, ['Date of', 'acceptance (*)']);

    yPos += cellHeight;
    cellHeight = PdfStyle.ROW.HEIGHT * 3 - 9;

    const ppAddress = PdfUtils.constructAddress([data.plantAddressOne, data.plantAddressTwo, data.plantTownCity, data.plantPostcode]);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 110, cellHeight, data.plantName);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 125, yPos, 155, cellHeight, ppAddress);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 280, yPos, 95, cellHeight, data.plantApprovalNumber);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 375, yPos, 85, cellHeight, data.personResponsibleForConsignment);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 460, yPos, 70, cellHeight, data.dateOfAcceptance);

    yPos += cellHeight + 5;
    doc.text('* Date of acceptance by the process plant’s responsible person of the veracity of the contents of this processing statement', PdfStyle.MARGIN.LEFT + 15, yPos);

    PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT);
}

const section1 = (doc, data, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '1    Catches in this consignment');
    let yPos = startY + 12;

    let cellHeight = PdfStyle.ROW.HEIGHT * 3 - 7;

   /* PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 80, cellHeight, ['Catch certificate', '(CC) number']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 95, yPos, 95, cellHeight, ['Vessel name', 'and flag']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 190, yPos, 60, cellHeight, ['Validation', 'date']);*/
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 150, cellHeight, ['Catch certificate', '(CC) number']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 165, yPos, 85, cellHeight, ['Vessel name and', 'Validation date']);

    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 250, yPos, 100, cellHeight, ['Catch description']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 350, yPos, 60, cellHeight, ['Total landed', 'weight(kg)']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 410, yPos, 60, cellHeight, ['Catch', 'processed', '(kg)']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 470, yPos, 60, cellHeight, ['Processed', 'fishery', 'product(kg)']);

    yPos += cellHeight;
    cellHeight = PdfStyle.ROW.HEIGHT * 2 + 4;

    const arrLength = data.catches.length;
    let listLimit = 5;
    if (arrLength > 5) {
        listLimit = 0;
    }

    for (let rowIdx = 0; rowIdx < listLimit; rowIdx++) {
        PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 150, cellHeight, rowIdx < arrLength ? `${data.catches[rowIdx].catchCertificateNumber}` : '');
        PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 165, yPos, 85, cellHeight, rowIdx < arrLength ? ['See catch', 'certificate'] : '');

        PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 250, yPos, 100, cellHeight, rowIdx < arrLength ? `${data.catches[rowIdx].species}` : '');
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 350, yPos, 60, cellHeight, rowIdx < arrLength ? `${data.catches[rowIdx].totalWeightLanded}` : '');
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 410, yPos, 60, cellHeight, rowIdx < arrLength ? `${data.catches[rowIdx].exportWeightBeforeProcessing}` : '');
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 470, yPos, 60, cellHeight, rowIdx < arrLength ? `${data.catches[rowIdx].exportWeightAfterProcessing}` : '');
        yPos += cellHeight;
    }

    if (arrLength > 5) {
        cellHeight = PdfStyle.ROW.HEIGHT * 8 + 4;
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 515, cellHeight, 'SEE SCHEDULE (' + data.catches.length + ' rows)');
        yPos += cellHeight;
    }

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