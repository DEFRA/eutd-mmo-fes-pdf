const PDFDocument = require('pdfkit');
const path = require('path');
const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const moment = require('moment');

const renderExportCert = async (data, isSample, uri, stream) => {

    let buff = null;
    const sampleWatermarkImageFile = path.join(__dirname, '../resources/sample-watermark.png');

    if (!data.isBlankTemplate && !isSample) {
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

    PdfUtils.heading(doc, 'Catch and Re-Export Certificate');
    section1(doc, data, isSample, PdfStyle.MARGIN.TOP + 70);
    section2(doc, data, PdfStyle.MARGIN.TOP + 198);
    section3(doc, data, PdfStyle.MARGIN.TOP + 320);
    section4(doc, data, PdfStyle.MARGIN.TOP + 515);
    section5(doc, data, PdfStyle.MARGIN.TOP + 575);
    section6(doc, data, PdfStyle.MARGIN.TOP + 635);
    if (isSample) {
        doc.image(sampleWatermarkImageFile, PdfStyle.MARGIN.LEFT + 10, 120, {scale: 1});
    }
    PdfUtils.endOfPage(doc, 1);

    doc.addPage();
    section7(doc, data, PdfStyle.MARGIN.TOP);
    section8(doc, data, PdfStyle.MARGIN.TOP + 85);
    section9(doc, data, isSample, buff,PdfStyle.MARGIN.TOP + 175);
    section10(doc, data, PdfStyle.MARGIN.TOP + 260);
    section11(doc, data, PdfStyle.MARGIN.TOP + 285);
    section12(doc, data, PdfStyle.MARGIN.TOP + 415);
    if (isSample) {
        doc.image(sampleWatermarkImageFile, PdfStyle.MARGIN.LEFT + 10, 120, {scale: 1});
    }
    PdfUtils.endOfPage(doc, 2);

    doc.addPage();
    section13(doc, data, PdfStyle.MARGIN.TOP);
    section14(doc, data, PdfStyle.MARGIN.TOP + 50);
    section15(doc, data, PdfStyle.MARGIN.TOP + 255);
    section16(doc, data, PdfStyle.MARGIN.TOP + 375);
    section17(doc, data, PdfStyle.MARGIN.TOP + 510);
    if (isSample) {
        doc.image(sampleWatermarkImageFile, PdfStyle.MARGIN.LEFT + 10, 120, {scale: 1});
    }
    PdfUtils.endOfPage(doc, 3);

    doc.addPage();
    appendixHeading(doc, PdfStyle.MARGIN.TOP);
    appendixTransportDetails(doc, data, PdfStyle.MARGIN.TOP + 22);
    end(doc, PdfStyle.MARGIN.TOP + 310);
    if (!data.isBlankTemplate && !isSample) {
        PdfUtils.qrCode(doc, buff, PdfStyle.MARGIN.LEFT + 20, PdfStyle.MARGIN.TOP + 680);
    }
    if (isSample) {
        doc.image(sampleWatermarkImageFile, PdfStyle.MARGIN.LEFT + 10, 120, {scale: 1});
    }
    PdfUtils.endOfPage(doc, 4);

    if (data.isBlankTemplate) {
        // add three blank schedule pages
        let pageSize = 14;
        let numPages = 3;
        for(let page = 1; page <= numPages; page++) {
            // Add a schedule
            doc.addPage({
                size: 'A4',
                margins: {
                    top: PdfStyle.MARGIN.TOP,
                    bottom: PdfStyle.MARGIN.BOT,
                    left: PdfStyle.MARGIN.LEFT,
                    right: PdfStyle.MARGIN.RIGHT,
                },
                layout: 'landscape'
            });

            multiVesselScheduleHeading(doc, data, isSample, buff, page, pageSize, PdfStyle.MARGIN.TOP);

            if (!doc.page.dictionary.Tabs) {
              doc.page.dictionary.data.Tabs = 'S';
            }
        }

    } else {
        // How many fishing vessels?
        const { catchLength } = getVesselCount(data.exportPayload);
        if (isMultiVessel(data.exportPayload)) {
            let pageSize = 8;
            let page = 1;
            const maxPages = Math.ceil(catchLength / pageSize);
            for (let i = 0; i < maxPages; i++) {
                // Add a schedule
                doc.addPage({
                    size: 'A4',
                    margins: {
                        top: PdfStyle.MARGIN.TOP,
                        bottom: PdfStyle.MARGIN.BOT,
                        left: PdfStyle.MARGIN.LEFT,
                        right: PdfStyle.MARGIN.RIGHT,
                    },
                    layout: 'landscape'
                });
                multiVesselScheduleHeading(doc, data, isSample, buff, page, pageSize, PdfStyle.MARGIN.TOP);
                if (isSample) {
                    doc.image(sampleWatermarkImageFile, PdfStyle.MARGIN.LEFT + 70, 70, {scale: 1});
                }
                page += 1;

                if (!doc.page.dictionary.Tabs) {
                  doc.page.dictionary.data.Tabs = 'S';
                }
            }
        }
    }


    doc.end();
};

function getVesselCount(exportPayload){
    let items = [];

    if (exportPayload && exportPayload.items) {
        items =  exportPayload.items;
    }

    let vesselCounts = {};
    let catchLength = 0;    // calculate number of lines. so we can calculate number of maxPages

    items.forEach((item) => {
        item.landings.forEach((landing) => {
            vesselCounts[landing.model.vessel.vesselName + landing.model.vessel.pln + landing.model.vessel.licenceNumber] = (vesselCounts[landing.model.vessel.vesselName + landing.model.vessel.pln + landing.model.vessel.licenceNumber] || 0) + 1;
            catchLength += 1;
        })
    });

    return { vesselCounts, catchLength };
}

function isMultiVessel(exportPayload){
    const { vesselCounts, catchLength } = getVesselCount(exportPayload);
    return Object.keys(vesselCounts).length > 1 || catchLength > 6;
}

function getProductScheduleRows(exportPayload) {
    let items = [];
    if (exportPayload && exportPayload.items) {
        items =  exportPayload.items;
    }
    let rows = [];
    if (items.length > 0) {
        items.forEach((item) => {
            item.landings.forEach((landing) => {
                const dateLanded = moment(landing.model.dateLanded).format('DD/MM/YYYY');
                let faoArea = 'FAO27';
                if (landing.model.faoArea && landing.model.faoArea.length > 0) {
                    faoArea = landing.model.faoArea;
                }

                let landingDetail = '';
                if (landing.model.vessel.licenceNumber) {
                    landingDetail = landing.model.vessel.licenceNumber;
                    if (landing.model.vessel.licenceValidTo) {
                        let dte = moment(landing.model.vessel.licenceValidTo).format('DD/MM/YYYY');
                        landingDetail = landingDetail + ' - ' + dte;
                    }
                }

                let imo = '';
                if (landing.model.vessel.imoNumber) {
                    imo = landing.model.vessel.imoNumber;
                }

                rows.push({
                    species: item.product.species.admin ?? item.product.species.label,
                    presentation: item.product.presentation.admin ?? item.product.presentation.label,
                    commodityCode: item.product.commodityCodeAdmin ?? item.product.commodityCode,
                    catchAreas: faoArea,
                    dateLanded: dateLanded,
                    exportWeight: landing.model.exportWeight,
                    vessel: landing.model.vessel.vesselName,
                    pln: landing.model.vessel.pln,
                    licenceDetail: landingDetail,
                    faoArea: faoArea,
                    imo: imo,
                    licenceHolder: landing.model.vessel.licenceHolder
                });
            })
        });
    }
    return rows;
}

const multiVesselScheduleHeading = (doc, data, isSample, buff, page, pageSize, startY) => {
    let imageFile = path.join(__dirname, '../resources/hmgovlogo.png');
    doc.image(imageFile, /*PdfStyle.MARGIN.LEFT, PdfStyle.MARGIN.TOP,*/ {
        width: 220
    });
    let cellHeight = PdfStyle.ROW.HEIGHT * 2;
    mvsHeadingCell(doc, PdfStyle.MARGIN.LEFT + 430, startY, 350, cellHeight, 'UNITED KINGDOM', true, PdfStyle.FONT_SIZE.LARGEST, 'center', '#767676', '#353535', '#ffcc00');
    let yPos = startY + cellHeight;
    mvsHeadingCell(doc, PdfStyle.MARGIN.LEFT, yPos, 230, PdfStyle.ROW.HEIGHT, 'AUTHORITY USE ONLY', true, PdfStyle.FONT_SIZE.SMALL, 'left', '#767676', '#353535', '#ffcc00');
    mvsHeadingCell(doc, PdfStyle.MARGIN.LEFT + 230, yPos, 550, PdfStyle.ROW.HEIGHT,
        'Schedule for multiple vessel landings as permitted by Article 12 (3) of Council Regulation (EC) No 1005/2008',
        true, PdfStyle.FONT_SIZE.SMALL, 'center', '#767676', '#353535', '#ffffff');
    yPos = yPos + PdfStyle.ROW.HEIGHT;

    cellHeight = PdfStyle.ROW.HEIGHT * 2 + 20;
    mvsHeadingCell(doc, PdfStyle.MARGIN.LEFT, yPos, 90, cellHeight, ['Catch Certificate', 'Number'], true, PdfStyle.FONT_SIZE.SMALL, 'center', '#767676', '#353535', '#ffcc00');

    let documentNumber = '';
    if (!data.isBlankTemplate) {
        if (isSample) {
            documentNumber = '###-####-##-#########';
        } else {
            documentNumber = data.documentNumber;
        }
    }

    mvsHeadingCell(doc, PdfStyle.MARGIN.LEFT + 90, yPos, 140, cellHeight, documentNumber, true, PdfStyle.FONT_SIZE.SMALL, 'center', '#767676', '#353535', '#ffffff');
    mvsHeadingCell(doc, PdfStyle.MARGIN.LEFT + 230, yPos, 270, cellHeight, undefined, true, PdfStyle.FONT_SIZE.SMALL, 'center', '#767676', '#353535', '#ffffff');

    cellHeight = PdfStyle.ROW.HEIGHT * 4 + 25;

    mvsHeadingCell(doc, PdfStyle.MARGIN.LEFT + 500, yPos, 80, cellHeight, ['UK Authority', 'QR Code'], true, PdfStyle.FONT_SIZE.SMALL, 'center', '#767676', '#353535', '#ffcc00');
    mvsHeadingCell(doc, PdfStyle.MARGIN.LEFT + 580, yPos, 200, cellHeight, undefined, true, PdfStyle.FONT_SIZE.SMALL, 'center', '#767676', '#353535', '#ffffff');

    yPos = yPos + PdfStyle.ROW.HEIGHT * 2 + 20;
    cellHeight = PdfStyle.ROW.HEIGHT * 2 + 5;

    mvsHeadingCell(doc, PdfStyle.MARGIN.LEFT, yPos, 90, cellHeight, 'Date', true, PdfStyle.FONT_SIZE.SMALL, 'center', '#767676', '#353535', '#ffcc00');
    let todaysDate = '';
    if (!data.isBlankTemplate) {
        todaysDate = PdfUtils.todaysDate();
    }
    mvsHeadingCell(doc, PdfStyle.MARGIN.LEFT + 90, yPos, 140, cellHeight, todaysDate, true, PdfStyle.FONT_SIZE.SMALL, 'center', '#767676', '#353535', '#ffffff');
    //mvsHeadingCell(doc, PdfStyle.MARGIN.LEFT + 220, yPos, 70, cellHeight, 'Sign', true, PdfStyle.FONT_SIZE.SMALL, 'center', '#767676', '#353535', '#ffcc00');
    mvsHeadingCell(doc, PdfStyle.MARGIN.LEFT + 230, yPos, 270, cellHeight, undefined, true, PdfStyle.FONT_SIZE.SMALL, 'center', '#767676', '#353535', '#ffffff');

    if (!data.isBlankTemplate && !isSample) {
        PdfUtils.qrCode(doc, buff, PdfStyle.MARGIN.LEFT + 590, yPos - 45);
    }
    yPos = yPos + cellHeight + 10;
    cellHeight = PdfStyle.ROW.HEIGHT * 2 - 5;

    mvsTableCell(doc, PdfStyle.MARGIN.LEFT, yPos, 115, cellHeight, 'Species', true, PdfStyle.FONT_SIZE.SMALLER, 'center', '#767676', '#353535', '#ffff00');
    mvsTableCell(doc, PdfStyle.MARGIN.LEFT + 115, yPos, 80, cellHeight, ['Presentation'], true, PdfStyle.FONT_SIZE.SMALLER, 'center', '#767676', '#353535', '#ffff00');
    mvsTableCell(doc, PdfStyle.MARGIN.LEFT + 195, yPos, 50, cellHeight, ['Product', 'code'], true, PdfStyle.FONT_SIZE.SMALLER, 'center', '#767676', '#353535', '#ffff00');
    mvsTableCell(doc, PdfStyle.MARGIN.LEFT + 245, yPos, 50, cellHeight, ['Date', 'Landed'], true, PdfStyle.FONT_SIZE.SMALLER, 'center', '#767676', '#353535', '#ffff00');
    mvsTableCell(doc, PdfStyle.MARGIN.LEFT + 295, yPos, 55, cellHeight, ['Consigned', 'weight (kg)'], true, PdfStyle.FONT_SIZE.SMALLER, 'center', '#767676', '#353535', '#ffff00');
    mvsTableCell(doc, PdfStyle.MARGIN.LEFT + 350, yPos, 90, cellHeight, ['Vessel', 'name'], true, PdfStyle.FONT_SIZE.SMALLER, 'center', '#767676', '#353535', '#ffff00');
    mvsTableCell(doc, PdfStyle.MARGIN.LEFT + 440, yPos, 60, cellHeight, ['PLN /', 'Callsign'], true, PdfStyle.FONT_SIZE.SMALLER, 'center', '#767676', '#353535', '#ffff00');
    mvsTableCell(doc, PdfStyle.MARGIN.LEFT + 500, yPos, 70, cellHeight, ['IMO / Lloyd\'s', 'Number'], true, PdfStyle.FONT_SIZE.SMALLER, 'center', '#767676', '#353535', '#ffff00');
    mvsTableCell(doc, PdfStyle.MARGIN.LEFT + 570, yPos, 90, cellHeight, 'Master', true, PdfStyle.FONT_SIZE.SMALLER, 'center', '#767676', '#353535', '#ffff00');
    mvsTableCell(doc, PdfStyle.MARGIN.LEFT + 660, yPos, 80, cellHeight, ['Licence', 'Number'], true, PdfStyle.FONT_SIZE.SMALLER, 'center', '#767676', '#353535', '#ffff00');
    mvsTableCell(doc, PdfStyle.MARGIN.LEFT + 740, yPos, 40, cellHeight, ['FAO', 'AREA'], true, PdfStyle.FONT_SIZE.SMALLER, 'center', '#767676', '#353535', '#ffff00');
    yPos = yPos + cellHeight;

    let rows = getProductScheduleRows(data.exportPayload);
    let pageCount = Math.ceil(rows.length / pageSize);
    if (data.isBlankTemplate) {
        pageCount = 3;
    }

    let fromIdx = (page - 1) * pageSize;
    let numDataRows = pageSize;
    if (fromIdx + numDataRows > rows.length) {
        numDataRows = rows.length - fromIdx;
    }
    let rowDataLimit = fromIdx + numDataRows;

    cellHeight = (PdfStyle.ROW.HEIGHT * 3) - 3;

    for (let rowIdx = fromIdx; rowIdx < (fromIdx + pageSize); rowIdx++) {
        mvsTableCell(doc, PdfStyle.MARGIN.LEFT, yPos, 115, cellHeight, rowIdx < rowDataLimit ? `${rows[rowIdx].species}` : '', false, PdfStyle.FONT_SIZE.SMALLER, 'left', '#767676', '#353535', '#ffffff');
        mvsTableCell(doc, PdfStyle.MARGIN.LEFT + 115, yPos, 80, cellHeight, rowIdx < rowDataLimit ? `${rows[rowIdx].presentation}` : '', false, PdfStyle.FONT_SIZE.SMALLER, 'left', '#767676', '#353535', '#ffffff');
        mvsTableCell(doc, PdfStyle.MARGIN.LEFT + 195, yPos, 50, cellHeight, rowIdx < rowDataLimit ? `${rows[rowIdx].commodityCode}` : '', false, PdfStyle.FONT_SIZE.SMALLER, 'left', '#767676', '#353535', '#ffffff');
        mvsTableCell(doc, PdfStyle.MARGIN.LEFT + 245, yPos, 50, cellHeight, rowIdx < rowDataLimit ? `${rows[rowIdx].dateLanded}` : '', false, PdfStyle.FONT_SIZE.SMALLER, 'left', '#767676', '#353535', '#ffffff');
        mvsTableCell(doc, PdfStyle.MARGIN.LEFT + 295, yPos, 55, cellHeight, rowIdx < rowDataLimit ? `${rows[rowIdx].exportWeight}` : '', false, PdfStyle.FONT_SIZE.SMALLER, 'left', '#767676', '#353535', '#ffffff');
        mvsTableCell(doc, PdfStyle.MARGIN.LEFT + 350, yPos, 90, cellHeight, rowIdx < rowDataLimit ? `${rows[rowIdx].vessel}` : '', false, PdfStyle.FONT_SIZE.SMALLER, 'left', '#767676', '#353535', '#ffffff');
        mvsTableCell(doc, PdfStyle.MARGIN.LEFT + 440, yPos, 60, cellHeight, rowIdx < rowDataLimit ? `${rows[rowIdx].pln}` : '', false, PdfStyle.FONT_SIZE.SMALLER, 'left', '#767676', '#353535', '#ffffff');
        mvsTableCell(doc, PdfStyle.MARGIN.LEFT + 500, yPos, 70, cellHeight, rowIdx < rowDataLimit ? `${rows[rowIdx].imo}` : '', false, PdfStyle.FONT_SIZE.SMALLER, 'left', '#767676', '#353535', '#ffffff');
        mvsTableCell(doc, PdfStyle.MARGIN.LEFT + 570, yPos, 90, cellHeight, rowIdx < rowDataLimit ? `${rows[rowIdx].licenceHolder}` : '', false, PdfStyle.FONT_SIZE.SMALLER, 'left', '#767676', '#353535', '#ffffff');
        mvsTableCell(doc, PdfStyle.MARGIN.LEFT + 660, yPos, 80, cellHeight, rowIdx < rowDataLimit ? `${rows[rowIdx].licenceDetail}` : '', false, PdfStyle.FONT_SIZE.SMALLER, 'left', '#767676', '#353535', '#ffffff');
        mvsTableCell(doc, PdfStyle.MARGIN.LEFT + 740, yPos, 40, cellHeight, rowIdx < rowDataLimit ? `${rows[rowIdx].faoArea}` : '', false, PdfStyle.FONT_SIZE.SMALLER, 'left', '#767676', '#353535', '#ffffff');
        yPos = yPos + cellHeight;
    }

    mvsTableCell(doc, PdfStyle.MARGIN.LEFT, yPos, 780, PdfStyle.ROW.HEIGHT, 'Page ' + page + ' of ' + pageCount, true, PdfStyle.FONT_SIZE.SMALLER, 'left', '#767676', '#353535', '#ffffff');
};

const end = (doc, startY) => {
    let yPos = startY + 9 * PdfStyle.ROW.HEIGHT + 10;
    let cellHeight = PdfStyle.ROW.HEIGHT * 8;
    PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT, yPos, 270, cellHeight, 'FOR OFFICIAL USE ONLY');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 270, yPos, 260, cellHeight, 'Import Control Authority Stamp');

    yPos += cellHeight + 20;
    doc.font(PdfStyle.FONT.BOLD);
    doc.text('Validated by the appropriate competent authority (MMO, Scottish Ministers, Welsh Ministers, Department of Agriculture, Environment and Rural Affairs for Northern Ireland, Marine Resources, Growth and Housing and Environment for Jersey, Sea Fisheries, Committee for Economic Development for Guernsey and Department Environment, Food and Agriculture for the Isle of Man) in accordance with article 15 of Council Regulation (EU) 1005/2008 (as retained under s.3(1) European Union (Withdrawal) Act 2018)', PdfStyle.MARGIN.LEFT + 10, yPos);
};

const appendixTransportDetails = (doc, data, startY) => {
    doc.font(PdfStyle.FONT.BOLD);
    doc.fontSize(PdfStyle.FONT_SIZE.LARGE);
    doc.text('Transport Details', 0, startY, {
        align: 'center'
    });
    doc.font(PdfStyle.FONT.REGULAR);
    let yPos = startY + 20;
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos, 265, PdfStyle.ROW.HEIGHT, 'Country of exportation');
    const countryOfExport = data.transport ? data.transport.exportedFrom ? data.transport.exportedFrom : 'United Kingdom' : 'United Kingdom'
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 265, yPos, 265, PdfStyle.ROW.HEIGHT, countryOfExport);
    yPos = yPos + PdfStyle.ROW.HEIGHT;
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos, 265, PdfStyle.ROW.HEIGHT, 'Port/airport/other place of departure');

    let departurePlace = '';
    if (data.transport) {
        if (data.transport.cmr === 'true') {
            departurePlace = 'See attached transport documents';
        } else {
            departurePlace = data.transport.departurePlace;
        }
    }
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 265, yPos, 265, PdfStyle.ROW.HEIGHT, departurePlace);
    yPos = yPos + PdfStyle.ROW.HEIGHT;

    let vcDetails = '';
    if (data.transport && data.transport.vehicle) {
        if (data.transport.vehicle.toUpperCase() === 'CONTAINERVESSEL') {
            if (data.transport.vesselName) {
                vcDetails = vcDetails + data.transport.vesselName + ' ';
            }
            if (data.transport.flagState) {
                vcDetails = vcDetails + data.transport.flagState;
            }
        } else if (data.transport.vehicle.toUpperCase() === 'DIRECTLANDING') {
            if (data.exportPayload?.items[0].landings[0].model.vessel.vesselName) {
                vcDetails = vcDetails + data.exportPayload.items[0].landings[0].model.vessel.vesselName + ' ';
            }
            if (data.exportPayload?.items[0].landings[0].model.vessel.pln) {
                vcDetails = vcDetails + '(' + data.exportPayload.items[0].landings[0].model.vessel.pln + ')';
            }
        }
    }
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos, 265, PdfStyle.ROW.HEIGHT, 'Vessel name and flag');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 265, yPos, 265, PdfStyle.ROW.HEIGHT, vcDetails);

    yPos = yPos + PdfStyle.ROW.HEIGHT;
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos, 265, PdfStyle.ROW.HEIGHT, 'Flight number/airway bill number');
    let flightNumber = '';
    if (data.transport) {
        flightNumber = data.transport.flightNumber;
    }
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 265, yPos, 265, PdfStyle.ROW.HEIGHT, flightNumber);
    yPos = yPos + PdfStyle.ROW.HEIGHT;
    let truckDetails = '';
    if (data.transport && data.transport.vehicle && data.transport.vehicle.toUpperCase() === 'TRUCK') {
        if (data.transport.nationalityOfVehicle) {
            truckDetails = truckDetails + data.transport.nationalityOfVehicle + ' ';
        }
        if (data.transport.registrationNumber) {
            truckDetails = truckDetails + data.transport.registrationNumber;
        }
    }
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos, 265, PdfStyle.ROW.HEIGHT, 'Truck nationality and registration number');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 265, yPos, 265, PdfStyle.ROW.HEIGHT, truckDetails);
    yPos = yPos + PdfStyle.ROW.HEIGHT;
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos, 265, PdfStyle.ROW.HEIGHT, 'Railway bill number');
    let railwayBillNumber = '';
    if (data.transport) {
        railwayBillNumber = data.transport.railwayBillNumber;
    }
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 265, yPos, 265, PdfStyle.ROW.HEIGHT, railwayBillNumber);
    yPos = yPos + PdfStyle.ROW.HEIGHT;
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos, 265, PdfStyle.ROW.HEIGHT, 'Other transport document');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 265, yPos, 265, PdfStyle.ROW.HEIGHT);
    yPos = yPos + PdfStyle.ROW.HEIGHT + 7;

    doc.fontSize(PdfStyle.FONT_SIZE.LARGE);
    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT, yPos, 'Container number(s) list attached');
    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 270, yPos, 'Exporter details');
    yPos = yPos + PdfStyle.ROW.HEIGHT - 2;
    let cellHeight = PdfStyle.ROW.HEIGHT * 8;

    let containerNumber = '';
    if (data.transport) {
        containerNumber = data.transport.containerNumber;
    }
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT, yPos, 250, cellHeight, containerNumber);

    let exporterAddress = '';
    let exporterFullName = '';
    let exporterCompanyName = '';
    if (data.exporter) {
        exporterAddress = PdfUtils.constructAddress([data.exporter.addressOne, data.exporter.addressTwo,
            data.exporter.townCity, data.exporter.postcode]);
        exporterFullName = data.exporter.exporterFullName;
        exporterCompanyName = data.exporter.exporterCompanyName;
    }

    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 270, yPos, 100, PdfStyle.ROW.HEIGHT + 5, 'Name');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 370, yPos, 160, PdfStyle.ROW.HEIGHT + 5, exporterFullName);
    yPos = yPos + PdfStyle.ROW.HEIGHT + 5;
    cellHeight = PdfStyle.ROW.HEIGHT * 8 + 5;
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 270, yPos, 100, cellHeight, 'Address');
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 370, yPos, 160, cellHeight, [exporterCompanyName, exporterAddress]);
    yPos = yPos + cellHeight;
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 270, yPos, 100, cellHeight, 'Signature');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 370, yPos, 160, cellHeight);

    PdfUtils.separator(doc, yPos + cellHeight + 10);
};

const appendixHeading = (doc, startY) => {

    doc.fillColor('#353535');
    doc.fontSize(PdfStyle.FONT_SIZE.LARGEST);
    doc.font(PdfStyle.FONT.BOLD);
    doc.text('Appendix I', 0, startY, {
        align: 'center'
    });
};

const section17 = (doc, data, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '4    Re-export control');
    let yPos = startY + 12;
    let cellHeight = PdfStyle.ROW.HEIGHT * 2 - 3;

    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 155, cellHeight, 'Place');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 170, yPos, 110, cellHeight, 'Re-export authorised (*)');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 280, yPos, 110, cellHeight, 'Verification requested (*)');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 390, yPos, 140, cellHeight, ['Re-export declaration', 'number and date']);

    yPos += cellHeight;
    cellHeight = PdfStyle.ROW.HEIGHT * 6;

    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 155, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 170, yPos, 110, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 280, yPos, 110, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 390, yPos, 140, cellHeight);

    yPos += cellHeight + 5;
    doc.text('* Tick as appropriate', PdfStyle.MARGIN.LEFT + 15, yPos);

    PdfUtils.separator(doc, yPos + 15);
};

const section16 = (doc, data, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '3    Authority');
    let yPos = startY + 12;

    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 210, PdfStyle.ROW.HEIGHT, 'Name / title');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 225, yPos, 110, PdfStyle.ROW.HEIGHT, 'Signature');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 335, yPos, 95, PdfStyle.ROW.HEIGHT, 'Date');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 430, yPos, 100, PdfStyle.ROW.HEIGHT, 'Seal');

    yPos += PdfStyle.ROW.HEIGHT;
    let cellHeight = PdfStyle.ROW.HEIGHT * 6;

    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 210, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 225, yPos, 110, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 335, yPos, 95, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 430, yPos, 100, cellHeight);

    PdfUtils.separator(doc, yPos + cellHeight + 8);
};

const section15 = (doc, data, startY) => {

    let yPos = startY;
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '2');

    let cellHeight = PdfStyle.ROW.HEIGHT * 6;

    PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 140, PdfStyle.ROW.HEIGHT, 'Name of re-exporter');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 155, yPos, 215, PdfStyle.ROW.HEIGHT, 'Address');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 370, yPos, 90, PdfStyle.ROW.HEIGHT, 'Signature');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 460, yPos, 70, PdfStyle.ROW.HEIGHT, 'Date');

    yPos += PdfStyle.ROW.HEIGHT;

    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 140, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 155, yPos, 215, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 370, yPos, 90, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 460, yPos, 70, cellHeight);

    PdfUtils.separator(doc, yPos + cellHeight + 8);
};

const section14 = (doc, data, startY) => {

    let yPos = startY;
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '1    Description of re-exported product');
    yPos += 12;
    let cellHeight = PdfStyle.ROW.HEIGHT * 2 - 3;

    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 205, cellHeight, 'Species');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 220, yPos, 150, cellHeight, 'Product code');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 370, yPos, 160, cellHeight, ['Balance from total quantity declared', 'in the catch certificate']);

    yPos += cellHeight;
    cellHeight = PdfStyle.ROW.HEIGHT * 10;

    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 205, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 220, yPos, 150, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 370, yPos, 160, cellHeight);

    PdfUtils.separator(doc, yPos + cellHeight + 8);
};

const section13 = (doc, data, startY) => {

    doc.fontSize(PdfStyle.FONT_SIZE.MEDIUM);
    doc.text('(ii) RE-EXPORT CERTIFICATE', PdfStyle.MARGIN.LEFT, startY);
    doc.lineWidth(2);
    doc.moveTo(180, startY + 4).lineTo(560, startY + 4).stroke();

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT, startY + 20, 'Certificate Number');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 95, startY + 18, 125, PdfStyle.ROW.HEIGHT);

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 235, startY + 20, 'Date');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 265, startY + 18, 70, PdfStyle.ROW.HEIGHT);

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 350, startY + 20, 'Member State');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 420, startY + 18, 110, PdfStyle.ROW.HEIGHT);

    PdfUtils.separator(doc, startY + 40);
};

const section12 = (doc, data, startY) => {
    let yPos = startY + PdfStyle.ROW.HEIGHT * 3;
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '12');

    let cellHeight = PdfStyle.ROW.HEIGHT * 2 - 3;

    PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 150, cellHeight, 'Import Control Authority');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 165, yPos, 105, cellHeight, 'Place');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 270, yPos, 80, cellHeight, ['Importation', 'authorised*']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 350, yPos, 80, cellHeight, ['Importation', 'suspended*']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 430, yPos, 100, cellHeight, ['Verification requested', '– date']);

    yPos += cellHeight;
    cellHeight = PdfStyle.ROW.HEIGHT * 7;

    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 150, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 165, yPos, 105, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 270, yPos, 80, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 350, yPos, 80, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 430, yPos, 100, cellHeight);

    yPos += cellHeight;
    cellHeight = PdfStyle.ROW.HEIGHT * 2 - 3;

    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 150, cellHeight, 'Customs declaration (if issued)');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 165, yPos, 185, cellHeight, 'Number');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 350, yPos, 80, cellHeight, 'Date');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 430, yPos, 100, cellHeight, 'Place');

    yPos += cellHeight;
    cellHeight = PdfStyle.ROW.HEIGHT * 7;

    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 150, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 165, yPos, 185, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 350, yPos, 80, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 430, yPos, 100, cellHeight);

    yPos += cellHeight + 5;

    doc.text('* Tick as appropriate', PdfStyle.MARGIN.LEFT + 15, yPos);
};

const section11 = (doc, data, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + PdfStyle.ROW.HEIGHT * 3, '11    Importer Declaration:');
    let yPos = startY + PdfStyle.ROW.HEIGHT * 3 + 12;
    let cellHeight = PdfStyle.ROW.HEIGHT * 3;

    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 150, PdfStyle.ROW.HEIGHT, 'Name and address of Importer');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 165, yPos, 95, PdfStyle.ROW.HEIGHT, 'Signature');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 260, yPos, 95, PdfStyle.ROW.HEIGHT, 'Date');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 355, yPos, 80, PdfStyle.ROW.HEIGHT, 'Seal');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 435, yPos, 95, PdfStyle.ROW.HEIGHT, 'Product CN code');

    yPos += PdfStyle.ROW.HEIGHT;

    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 150, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 165, yPos, 95, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 260, yPos, 95, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 355, yPos, 80, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 435, yPos, 95, cellHeight);

    yPos += cellHeight;

    cellHeight = PdfStyle.ROW.HEIGHT * 3 - 8;

    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 150, cellHeight,
        ['Documents under Articles', '14(1), (2) of Regulation (EC)', 'No. 1005/2008']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 165, yPos, 70, cellHeight, 'References');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 225, yPos, 305, cellHeight);

    doc.lineWidth(1.5);
    doc.undash();
    doc.moveTo(PdfStyle.MARGIN.LEFT + 225, yPos + 0.5).lineTo(PdfStyle.MARGIN.LEFT + 225, yPos + cellHeight - 0.5).stroke('#ffffff');
    PdfUtils.separator(doc, yPos + 45);
};

const section10 = (doc, data, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + PdfStyle.ROW.HEIGHT * 2 + 22 , '10    Transport details:');
    PdfUtils.labelBoldItalic(doc, PdfStyle.MARGIN.LEFT + 120, startY + 2 * PdfStyle.ROW.HEIGHT + 22, 'See Appendix I');
    PdfUtils.separator(doc, startY + PdfStyle.ROW.HEIGHT * 2 + 33);
};

const section9 = (doc, data, isSample, buff, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + 4 * PdfStyle.ROW.HEIGHT, '9    Flag State Authority Validation:');
    let yPos = startY+ 4 * PdfStyle.ROW.HEIGHT + 12;
    let cellHeight = PdfStyle.ROW.HEIGHT * 2 - 3;
    if (!data.isBlankTemplate && !isSample) {
        PdfUtils.qrCode(doc, buff, PdfStyle.MARGIN.LEFT + 330, yPos - PdfStyle.ROW.HEIGHT);
    }
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 250, PdfStyle.ROW.HEIGHT, 'Date Issued');
    yPos += PdfStyle.ROW.HEIGHT;
    let dateIssued = PdfUtils.todaysDate();
    if (data.isBlankTemplate) {
        dateIssued = '';
    }
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 250, cellHeight, dateIssued);
    PdfUtils.separator(doc, yPos  + 2 * PdfStyle.ROW.HEIGHT + 12);
};

const section8 = (doc, data, startY) => {

    let yPos = startY;
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '8');

    let cellHeight = PdfStyle.ROW.HEIGHT * 7 + 2;

    PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 230, PdfStyle.ROW.HEIGHT, 'Name and address of Exporter');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 245, yPos, 115, PdfStyle.ROW.HEIGHT, 'Signature');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 360, yPos, 95, PdfStyle.ROW.HEIGHT, 'Date of acceptance(*)');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 455, yPos, 75, PdfStyle.ROW.HEIGHT, 'Seal');

    yPos += PdfStyle.ROW.HEIGHT;

    let exporterAddress = '';
    let exporterFullName = '';
    let exporterCompanyName = '';
    if (data.exporter) {
        exporterAddress = PdfUtils.constructAddress([data.exporter.addressOne, data.exporter.addressTwo,
            data.exporter.townCity, data.exporter.postcode]);
        exporterFullName = data.exporter.exporterFullName;
        exporterCompanyName = data.exporter.exporterCompanyName;
    }

    let dateOfAcceptance = PdfUtils.todaysDate();
    if (data.isBlankTemplate) {
        dateOfAcceptance = '';
    }

    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 230, cellHeight,
        [exporterFullName, exporterCompanyName, exporterAddress]);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 245, yPos, 115, cellHeight, exporterFullName);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 360, yPos, 95, cellHeight, dateOfAcceptance);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 455, yPos, 75, cellHeight);

    yPos += cellHeight + 5;
    doc.text('* Date of acceptance by exporter of the veracity of the contents of this document', PdfStyle.MARGIN.LEFT + 15, yPos);

    PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT );
};

const section7 = (doc, data, startY) => {

    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '7    Transhipment authorisation within a Port Area:');
    let yPos = startY + 12;
    let cellHeight = PdfStyle.ROW.HEIGHT * 2 - 3;

    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 65, cellHeight, 'Name');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 80, yPos, 60, cellHeight, 'Authority');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 140, yPos, 60, cellHeight, 'Signature');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 200, yPos, 65, cellHeight, 'Address');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 265, yPos, 60, cellHeight, 'Tel.');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 325, yPos, 75, cellHeight, 'Port of Landing');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 400, yPos, 60, cellHeight, 'Date of Landing');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 460, yPos, 70, cellHeight, 'Seal (Stamp)');

    yPos += cellHeight;

    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 65, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 80, yPos, 60, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 140, yPos, 60, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 200, yPos, 65, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 265, yPos, 60, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 325, yPos, 75, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 400, yPos, 60, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 460, yPos, 70, cellHeight);

    PdfUtils.separator(doc, yPos + 35);
};

const section6 = (doc, data, startY) => {

    let yPos = startY;
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '6');

    let cellHeight = PdfStyle.ROW.HEIGHT * 2 - 3;

    PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 220, cellHeight, ['Declaration of Transhipment at Sea', 'Name of Master of Fishing Vessel']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 235, yPos, 100, cellHeight, ['Signature', 'and Date']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 335, yPos, 115, cellHeight, ['Transhipment', 'Date/Area/Position']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 450, yPos, 80, cellHeight, 'Estimated weight (kg)');

    yPos += cellHeight;

    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 220, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 235, yPos, 100, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 335, yPos, 115, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 450, yPos, 80, cellHeight);

    yPos += 33;

    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 120, cellHeight, ['Master of Receiving', 'Vessel']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 135, yPos, 110, cellHeight, 'Signature');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 245, yPos, 90, cellHeight, 'Vessel Name');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 335, yPos, 100, cellHeight, 'Call Sign');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 435, yPos, 95, cellHeight, ['IMO/Lloyds Number', '(if issued)']);

    yPos += cellHeight;

    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 120, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 135, yPos, 110, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 245, yPos, 90, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 335, yPos, 100, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 435, yPos, 95, cellHeight);

};

const section5 = (doc, data, startY) => {
    let yPos = startY;
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '5    Name of master of fishing vessel – Signature – Seal:');

    yPos += PdfStyle.ROW.HEIGHT;

    const licenceHolder = isMultiVessel(data.exportPayload) ? "Multiple vessels - See schedule" : getLicenceHolder(data.exportPayload);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 515, PdfStyle.ROW.HEIGHT, licenceHolder);

    yPos += PdfStyle.ROW.HEIGHT + 5;

    doc.text('* I am a representative of the vessel (s) shown on this document', PdfStyle.MARGIN.LEFT + 15, yPos);
    PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT);
};

const section4 = (doc, data, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '4    References of applicable conservation and management measures');
    let policy = '';
    if (data.conservation) {
        policy = data.conservation.conservationReference === 'Other' ? data.conservation.anotherConservation : data.conservation.conservationReference;
    }
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, startY + 12, 515, PdfStyle.ROW.HEIGHT * 2, policy);
    PdfUtils.separator(doc, startY + 50);
};

function getLicenceHolder(exportPayload) {
    if (exportPayload && exportPayload.items && exportPayload.items.length > 0) {
        const landings = exportPayload.items[0].landings;
        return landings && landings.length > 0 && landings[0].model && landings[0].model.vessel ? landings[0].model.vessel.licenceHolder : ''
    }

    return '';
}

function getDescOfProductRows(exportPayload) {

    let items = [];
    if (exportPayload && exportPayload.items) {
        items =  exportPayload.items;
    }
    let accum = {};
    if (items.length > 0) {
        items.forEach((item) => {
            item.landings.forEach((landing) => {
                let dte = moment(landing.model.dateLanded).format('DD/MM/YYYY');
                let faoArea = 'FAO27';
                if (landing.model.faoArea && landing.model.faoArea.length > 0) {
                    faoArea = landing.model.faoArea;
                }
                let accumItem = accum[item.product.species.code + item.product.commodityCode + faoArea +landing.model.vessel.vesselName + landing.model.vessel.pln + dte];
                if (accumItem) {
                    let accumTotal = parseFloat(accumItem.exportWeight) + parseFloat(landing.model.exportWeight)
                    accumItem.exportWeight = accumTotal.toFixed(2);
                } else {
                    accum[item.product.species.code + item.product.commodityCode + faoArea + landing.model.vessel.vesselName + landing.model.vessel.pln + dte] = {
                        species: item.product.species.admin ?? item.product.species.label,
                        commodityCode: item.product.commodityCodeAdmin ?? item.product.commodityCode,
                        catchAreas: faoArea,
                        dates: dte,
                        exportWeight: Number(landing.model.exportWeight)
                    }
                }
            })
        });
    }
    return Object.values(accum);
}

const section3 = (doc, data, startY) => {

    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '3    Description of Product');
    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 15, startY + 14, 'Type of processing authorised on board:');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, startY + 26, 515, PdfStyle.ROW.HEIGHT);

    let cellHeight = PdfStyle.ROW.HEIGHT * 3 - 7;

    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, startY + 48, 145, cellHeight, 'Species');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 160, startY + 48, 55, cellHeight, 'Product Code');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 215, startY + 48, 60, cellHeight, ['Catch', 'Area(s)']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 275, startY + 48, 70, cellHeight, ['Dates', 'Landed']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 345, startY + 48, 50, cellHeight, 'Estimated live weight(kg)');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 395, startY + 48, 55, cellHeight, 'Estimated weight to be landed(kg)');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 450, startY + 48, 80, cellHeight, 'Verified weight landed(kg) where appropriate');

    let rowData = getDescOfProductRows(data.exportPayload);

    let y = startY + 86;
    let arrLength = rowData.length;
    let listLimit = 6;
    if (arrLength > 6) {
        listLimit = 0;
    }

    for (let rowIdx = 0; rowIdx < listLimit; rowIdx++) {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, y, 145, PdfStyle.ROW.HEIGHT, rowIdx < arrLength ? `${rowData[rowIdx].species}` : '');
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 160, y, 55, PdfStyle.ROW.HEIGHT, rowIdx < arrLength ? `${rowData[rowIdx].commodityCode}` : '');
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 215, y, 60, PdfStyle.ROW.HEIGHT, rowIdx < arrLength ? `${rowData[rowIdx].catchAreas}` : '');
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 275, y, 70, PdfStyle.ROW.HEIGHT, rowIdx < arrLength ? `${rowData[rowIdx].dates}` : '');
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 345, y, 50, PdfStyle.ROW.HEIGHT);
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 395, y, 55, PdfStyle.ROW.HEIGHT, rowIdx < arrLength ? `${Number(rowData[rowIdx].exportWeight).toFixed(2)}` : '');
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 450, y, 80, PdfStyle.ROW.HEIGHT);
        y += PdfStyle.ROW.HEIGHT;
    }
    if (arrLength > 6) {
        cellHeight = PdfStyle.ROW.HEIGHT * 6;
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, y, 515, cellHeight, 'SEE SCHEDULE (' + arrLength + ' rows)');
    }

    PdfUtils.separator(doc, startY + 185);
};

const section2 = (doc, data, startY) => {
    // How many fishing vessels?
    let vesselCounts = {};
    let items = [];
    if (data.exportPayload && data.exportPayload.items) {
        items =  data.exportPayload.items;
    }

    if (items.length > 0) {
        items.forEach((item) => {
            item.landings.forEach((landing) => {
                vesselCounts[landing.model.vessel.vesselName + landing.model.vessel.pln + landing.model.vessel.licenceNumber] = (vesselCounts[landing.model.vessel.vesselName + landing.model.vessel.pln + landing.model.vessel.licenceNumber] || 0) + 1;
            })
        });
    }

    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + 4, '2    Fishing Vessel Name');
    if (Object.keys(vesselCounts).length === 1) {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 120, startY + 2, 155, PdfStyle.ROW.HEIGHT, items[0].landings[0].model.vessel.vesselName);
    } else if (Object.keys(vesselCounts).length > 1) {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 120, startY + 2, 155, PdfStyle.ROW.HEIGHT, 'Multiple vessels - SEE SCHEDULE');
    } else {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 120, startY + 2, 155, PdfStyle.ROW.HEIGHT);
    }

    let pln = '';
    let homePortAndFlag = '';
    if (Object.keys(vesselCounts).length === 1) {
        pln = items[0].landings[0].model.vessel.pln;
        homePortAndFlag = items[0].landings[0].model.vessel.flag + ' - ' + items[0].landings[0].model.vessel.homePort;
    }

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 285, startY + 4, 'Flag - Home Port');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 400, startY + 2, 130, PdfStyle.ROW.HEIGHT, homePortAndFlag);

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 15, startY + 29, 'Call Sign / PLN');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 120, startY + 27, 155, PdfStyle.ROW.HEIGHT, pln);

    let imoNumber = '';
    if (Object.keys(vesselCounts).length === 1 && data.exportPayload.items[0].landings[0].model.vessel.imoNumber) {
        imoNumber = data.exportPayload.items[0].landings[0].model.vessel.imoNumber;
    }
    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 285, startY + 25, 'IMO/Lloyd\'s');
    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 285, startY + 37, 'Number (if issued)');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 400, startY + 27, 130, PdfStyle.ROW.HEIGHT, imoNumber);

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 15, startY + 54, 'Fishing Licence No.');

    let ln = '';
    let lvt = '';
    if (Object.keys(vesselCounts).length === 1) {
        ln = items[0].landings[0].model.vessel.licenceNumber;
        if (items[0].landings[0].model.vessel.licenceValidTo) {
            lvt = moment(items[0].landings[0].model.vessel.licenceValidTo, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY');
        }
    }
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 120, startY + 52, 220, PdfStyle.ROW.HEIGHT, (ln)?ln:'');

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 355, startY + 54, 'Valid to');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 400, startY + 52, 130, PdfStyle.ROW.HEIGHT, (lvt)?lvt:'');

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 15, startY + 77, 'Inmarsat No. Telefax No. Telephone No. E-mail address (if issued)');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, startY + 89, 515, PdfStyle.ROW.HEIGHT);

    PdfUtils.separator(doc, startY + 112);
};

const section1 = (doc, data, isSample, startY) => {

    doc.fontSize(PdfStyle.FONT_SIZE.MEDIUM);
    doc.text('(i) CATCH CERTIFICATE', PdfStyle.MARGIN.LEFT, startY);
    doc.lineWidth(2);
    doc.moveTo(153, startY + 4).lineTo(560, startY + 4).stroke();

    let documentNumber = '';
    if (!data.isBlankTemplate) {
        if (isSample) {
            documentNumber = '###-####-##-#########';
        } else {
            documentNumber = data.documentNumber;
        }
    }
    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT, startY + 20, 'Document Number');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 95, startY + 18, 160, PdfStyle.ROW.HEIGHT, documentNumber);

    PdfUtils.label(doc, 300, startY + 20, 'Validating Authority');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 380, startY + 18, 150, PdfStyle.ROW.HEIGHT, 'Marine Management Organisation');

    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + 40, '1    Name');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 65, startY + 38, 465, PdfStyle.ROW.HEIGHT, 'Illegal Unreported and Unregulated (IUU) Fishing Team');

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 15, startY + 60, 'Address');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 65, startY + 58, 465, PdfStyle.ROW.HEIGHT * 2 + 5, 'Lancaster House, Hampshire Court, Newcastle upon Tyne, United Kingdom. NE4 7YJ');

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 65, startY + 100, 'Tel.');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 90, startY + 98, 200, PdfStyle.ROW.HEIGHT, '0300 123 1032');

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 300, startY + 100, 'Email');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 330, startY + 98, 200, PdfStyle.ROW.HEIGHT, 'ukiuuslo@marinemanagement.org.uk');

    PdfUtils.separator(doc, startY + 120);

};

const mvsHeadingCell = (doc, x, y, width, height, text, isBold, fontSize, align, lineColor, textColor, bgColour) => {
    if (!text || Array.isArray(text)) {
        mvsCell(doc, x, y, width, height, height / 3, text, isBold, fontSize, align, lineColor, textColor, bgColour);
    } else {
        let textArr = [text];
        mvsCell(doc, x, y, width, height, height / 3, textArr, isBold, fontSize, align, lineColor, textColor, bgColour);
    }
};

const mvsTableCell = (doc, x, y, width, height, text, isBold, fontSize, align, lineColor, textColor, bgColour) => {
    if (!text || Array.isArray(text)) {
        mvsCell(doc, x, y, width, height, 4, text, isBold, fontSize, align, lineColor, textColor, bgColour);
    } else {
        let textArr = [text];
        mvsCell(doc, x, y, width, height, 4, textArr, isBold, fontSize, align, lineColor, textColor, bgColour);
    }
};

const mvsCell = (doc, x, y, width, height, topPad, textArr, isBold, fontSize, align, lineColor, textColor, bgColour) => {
    let yPos = y;
    doc.undash();
    doc.lineWidth(0.75);
    doc.rect(x, y, width, height);
    if (bgColour) {
        doc.fillAndStroke(bgColour, lineColor);
    } else {
        doc.stroke(lineColor);
    }
    doc.fillColor(textColor);
    if (textArr && textArr.length > 0) {
        if (isBold) {
            doc.font(PdfStyle.FONT.BOLD);
        } else {
            doc.font(PdfStyle.FONT.REGULAR);
        }
        doc.fontSize(fontSize);
        doc.text(textArr[0], x + 4, yPos + topPad, {
            width: width - 8,
            align: align
        });
        let arrlength = textArr.length;
        for (let idx = 1; idx < arrlength; idx++) {
            yPos += 10;
            doc.moveDown(1);
            doc.text(textArr[idx], x + 4, yPos + topPad, {
                width: width - 8,
                align: align
            });
        }
    }
};

module.exports = renderExportCert;