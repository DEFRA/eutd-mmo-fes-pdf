const path = require('path');
const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const moment = require('moment');
const CommonUtils = require('../utils/common-utils');

const renderExportCert = async (data, isSample, uri, stream) => {
    let buff = null;
    if (!data.isBlankTemplate && !isSample) {
        buff = await PdfUtils.generateQRCode(uri);
    }

    const doc = CommonUtils.createBaseDocument(uri);  
    doc.pipe(stream);
    doc.addStructure(doc.struct('Document', {
        lang: 'en-GB'
    }));

    PdfUtils.heading(doc, 'Catch and Re-Export Certificate');
    // Page 1: Sections 1-3
    section1(doc, data, isSample, PdfStyle.MARGIN.TOP + 70);
    section2(doc, data, PdfStyle.MARGIN.TOP + 203);
    section3(doc, data, PdfStyle.MARGIN.TOP + 350);
    PdfUtils.endOfPage(doc, 1);
    
    // Page 2: Sections 4-10
    doc.addPage();
    section4(doc, data, PdfStyle.MARGIN.TOP);
    section5(doc, data, PdfStyle.MARGIN.TOP + 62);
    section6(doc, data, PdfStyle.MARGIN.TOP + 117);
    isSample ?? CommonUtils.addSampleWatermark(doc);

    section7(doc, data, PdfStyle.MARGIN.TOP + 257);
    section8(doc, data, isSample, buff, PdfStyle.MARGIN.TOP + 476);
    section9(doc, data, isSample, buff, PdfStyle.MARGIN.TOP + 625);
    section10(doc, data, PdfStyle.MARGIN.TOP + 691);
    isSample ?? CommonUtils.addSampleWatermark(doc);
    PdfUtils.endOfPage(doc, 2);

    doc.addPage();
    section11(doc, data, PdfStyle.MARGIN.TOP - 12);
    isSample ?? CommonUtils.addSampleWatermark(doc);
    PdfUtils.endOfPage(doc, 3);

    doc.addPage();
    section12(doc, data, PdfStyle.MARGIN.TOP);
    isSample ?? CommonUtils.addSampleWatermark(doc);
    PdfUtils.endOfPage(doc, 4);

    doc.addPage();
    section13(doc, data, PdfStyle.MARGIN.TOP);
    section14(doc, data, PdfStyle.MARGIN.TOP + 50);
    section15(doc, data, PdfStyle.MARGIN.TOP + 260);
    section16(doc, data, PdfStyle.MARGIN.TOP + 380);
    section17(doc, data, PdfStyle.MARGIN.TOP + 510);
    isSample ?? CommonUtils.addSampleWatermark(doc);
    PdfUtils.endOfPage(doc, 5);

    doc.addPage();
    appendixHeading(doc, PdfStyle.MARGIN.TOP);
    appendixTransportDetails(doc, data, PdfStyle.MARGIN.TOP + 22);
    end(doc, PdfStyle.MARGIN.TOP + 310);
    const shouldGenerateQRCode =!data.isBlankTemplate && !isSample;
    if (shouldGenerateQRCode) {
        PdfUtils.qrCode(doc, buff, PdfStyle.MARGIN.LEFT + 20, PdfStyle.MARGIN.TOP + 680);
    }
    isSample ?? CommonUtils.addSampleWatermark(doc);
    PdfUtils.endOfPage(doc, 6);

    const isDictionaryTabs = !doc.page.dictionary.Tabs;

    if (data.isBlankTemplate) {
        // add three blank schedule pages
        processBlankTemplate(data, doc, isDictionaryTabs, isSample, buff);
    } else {
        // How many fishing vessels?
        processMultiData(data, doc, isDictionaryTabs, isSample, buff);
    }

    doc.end();
};

function processBlankTemplate(data, doc, isDictionaryTabs, isSample, buff) {
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

        if (isDictionaryTabs) {
              doc.page.dictionary.data.Tabs = 'S';
            }
        }
}

function processMultiData(data, doc, isDictionaryTabs, isSample, buff) {
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
            isSample ?? CommonUtils.addSampleWatermark(doc, 70, 70);
                page += 1;

            if (isDictionaryTabs) {
                  doc.page.dictionary.data.Tabs = 'S';
                }
            }
        }
    }

function getVesselCount(exportPayload){
    let items = [];

    if (exportPayload?.items) {
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

function getCatchDates(startDate, dateLanded){
    const formattedStartDate = startDate ? moment(startDate).format('DD/MM/YYYY') : null;
    const formattedDateLanded = moment(dateLanded).format('DD/MM/YYYY');
    return formattedStartDate ? `${formattedStartDate} - ${formattedDateLanded}` : formattedDateLanded;
}

function getProductScheduleRows(exportPayload) {

    let items = exportPayload?.items ?? [];
    let rows = [];
        items.forEach((item) => {
            item.landings.forEach((landing) => {
                const faoArea = landing.model?.faoArea?.length > 0 ? landing.model.faoArea : 'FAO27';

                let landingDetail = landing.model.vessel.licenceNumber ?? '';

                if (landingDetail && landing.model.vessel.licenceValidTo) {
                    const dte = moment(landing.model.vessel.licenceValidTo).format('DD/MM/YYYY');
                    landingDetail = `${landingDetail} - ${dte}`;
                }

                let imo = '';
                if (landing.model.vessel.imoNumber) {
                    imo = landing.model.vessel.imoNumber;
                }

                let cfr = '';
                if (landing.model.vessel.cfr) {
                    cfr = landing.model.vessel.cfr
                }

                let homePort = '';
                if (landing.model.vessel.homePort) {
                    homePort = landing.model.vessel.homePort;
                }

                rows.push({
                    species: item.product.species.admin ?? item.product.species.label,
                    presentation: item.product.presentation.admin ?? item.product.presentation.label,
                    commodityCode: item.product.commodityCodeAdmin ?? item.product.commodityCode,
                    catchAreas: faoArea,
                    dateLanded: getCatchDates(landing.model.startDate, landing.model.dateLanded),
                    estimatedWeight: "",
                    exportWeight: landing.model.exportWeight,
                    verifiedWeight: "",
                    vessel: landing.model.vessel.vesselName,
                    pln: landing.model.vessel.pln,
                    licenceDetail: landingDetail,
                    faoArea: faoArea,
                    homePort: homePort,
                    imo: imo,
                    cfr: cfr,
                    licenceHolder: landing.model.vessel.licenceHolder,
                    gearCode: landing.model.gearCode,
                });
            })
        });
    return rows;
}

const multiVesselScheduleHeading = (doc, data, isSample, buff, page, pageSize, startY) => {
    let imageFile = path.join(__dirname, '../resources/hmgovlogo.png');
    doc.addStructure(doc.struct('Figure', {
        alt: 'HM Government logo'
    }, () => {
        doc.image(imageFile, /*PdfStyle.MARGIN.LEFT, PdfStyle.MARGIN.TOP,*/ {
            width: 220
        });
    }));
    let cellHeight = PdfStyle.ROW.HEIGHT * 2;
    mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT + 430, y: startY, width: 350, height: cellHeight, text: 'UNITED KINGDOM'}, true, PdfStyle.FONT_SIZE.LARGEST, 'center', '#767676', '#353535', '#ffcc00');
    let yPos = startY + cellHeight;
    mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT, y: yPos, width: 230, height: PdfStyle.ROW.HEIGHT, text: 'AUTHORITY USE ONLY'}, true, PdfStyle.FONT_SIZE.SMALL, 'left', '#767676', '#353535', '#ffcc00');
    mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT + 230, y: yPos, width: 550, height: PdfStyle.ROW.HEIGHT,
        text: 'Schedule for multiple vessel landings as permitted by Article 12 (3) of Council Regulation (EC) No 1005/2008'},
        true, PdfStyle.FONT_SIZE.SMALL, 'center', '#767676', '#353535', '#ffffff');
    yPos = yPos + PdfStyle.ROW.HEIGHT;

    cellHeight = PdfStyle.ROW.HEIGHT * 2 + 20;
    mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT, y: yPos, width: 90, height: cellHeight, text: ['Catch Certificate', 'Number']}, true, PdfStyle.FONT_SIZE.SMALL, 'center', '#767676', '#353535', '#ffcc00');

    let documentNumber = '';
    if (!data.isBlankTemplate) {
        if (isSample) {
            documentNumber = '###-####-##-#########';
        } else {
            documentNumber = data.documentNumber;
        }
    }

    mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT + 90, y: yPos, width: 140, height: cellHeight, text: documentNumber}, true, PdfStyle.FONT_SIZE.SMALL, 'center', '#767676', '#353535', '#ffffff');
    mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT + 230, y: yPos, width: 270, height: cellHeight, text: undefined}, true, PdfStyle.FONT_SIZE.SMALL, 'center', '#767676', '#353535', '#ffffff');

    cellHeight = PdfStyle.ROW.HEIGHT * 4 + 25;

    mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT + 500, y: yPos, width: 80, height: cellHeight, text: ['UK Authority', 'QR Code']}, true, PdfStyle.FONT_SIZE.SMALL, 'center', '#767676', '#353535', '#ffcc00');
    mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT + 580, y: yPos, width: 200, height: cellHeight, text: undefined}, true, PdfStyle.FONT_SIZE.SMALL, 'center', '#767676', '#353535', '#ffffff');

    yPos = yPos + PdfStyle.ROW.HEIGHT * 2 + 20;
    cellHeight = PdfStyle.ROW.HEIGHT * 2 + 5;

    mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT, y: yPos, width: 90, height: cellHeight, text: 'Date'}, true, PdfStyle.FONT_SIZE.SMALL, 'center', '#767676', '#353535', '#ffcc00');
    let todaysDate = '';
    if (!data.isBlankTemplate) {
        todaysDate = PdfUtils.todaysDate();
    }
    mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT + 90, y: yPos, width: 140, height: cellHeight, text: todaysDate}, true, PdfStyle.FONT_SIZE.SMALL, 'center', '#767676', '#353535', '#ffffff');
    mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT + 230, y: yPos, width: 270, height: cellHeight, text: undefined}, true, PdfStyle.FONT_SIZE.SMALL, 'center', '#767676', '#353535', '#ffffff');

    if (!data.isBlankTemplate && !isSample) {
        PdfUtils.qrCode(doc, buff, PdfStyle.MARGIN.LEFT + 590, yPos - 45);
    }
    yPos = yPos + cellHeight + 10;
    cellHeight = PdfStyle.ROW.HEIGHT * 3 + 5;

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
    mvsTableCell({doc, x: PdfStyle.MARGIN.LEFT, y: yPos, width: 85, height: cellHeight, text: 'Species'}, true, PdfStyle.FONT_SIZE.SMALLER, 'center', '#767676', '#353535', '#ffff00');
    tableHeadOne.end();

    const tableHeadTwo = doc.struct('TH');
    tableHeadRow.add(tableHeadTwo);
    const tableHeadTwoContent = doc.markStructureContent('TH');
    tableHeadTwo.add(tableHeadTwoContent);
    mvsTableCell({doc, x: PdfStyle.MARGIN.LEFT + 85, y: yPos, width: 60, height: cellHeight, text: ['Presentation']}, true, PdfStyle.FONT_SIZE.SMALLER, 'center', '#767676', '#353535', '#ffff00');
    tableHeadTwo.end();

    const tableHeadThree = doc.struct('TH');
    tableHeadRow.add(tableHeadThree);
    const tableHeadThreeContent = doc.markStructureContent('TH');
    tableHeadThree.add(tableHeadThreeContent);
    mvsTableCell({doc, x: PdfStyle.MARGIN.LEFT + 145, y: yPos, width: 50, height: cellHeight, text: ['Product', 'code']}, true, PdfStyle.FONT_SIZE.SMALLER, 'center', '#767676', '#353535', '#ffff00');
    tableHeadThree.end();

    const tableHeadFour = doc.struct('TH');
    tableHeadRow.add(tableHeadFour);
    const tableHeadFourContent = doc.markStructureContent('TH');
    tableHeadFour.add(tableHeadFourContent);
    mvsTableCell({doc, x: PdfStyle.MARGIN.LEFT + 195, y: yPos, width: 60, height: cellHeight, text: ['Catch Date(s)', '(from-to)']}, true, PdfStyle.FONT_SIZE.SMALLER, 'center', '#767676', '#353535', '#ffff00');
    tableHeadFour.end();

    const tableHeadEstWeight = doc.struct('TH');
    tableHeadRow.add(tableHeadEstWeight);
    const tableHeadEstWeightContent = doc.markStructureContent('TH');
    tableHeadEstWeight.add(tableHeadEstWeightContent);
    mvsTableCell({doc, x: PdfStyle.MARGIN.LEFT + 255, y: yPos, width: 50, height: cellHeight, text: ['Estimated weight to be landed in kg']}, true, PdfStyle.FONT_SIZE.SMALLER, 'center', '#767676', '#353535', '#ffff00');
    tableHeadEstWeight.end();

    const tableHeadVerifiedWeight = doc.struct('TH');
    tableHeadRow.add(tableHeadVerifiedWeight);
    const tableHeadVerifiedWeightContent = doc.markStructureContent('TH');
    tableHeadVerifiedWeight.add(tableHeadVerifiedWeightContent);
    mvsTableCell({doc, x: PdfStyle.MARGIN.LEFT + 305, y: yPos, width: 50, height: cellHeight, text: ['Net catch', 'weight in kg']}, true, PdfStyle.FONT_SIZE.SMALLER, 'center', '#767676', '#353535', '#ffff00');
    tableHeadVerifiedWeight.end();

    const tableHeadFive = doc.struct('TH');
    tableHeadRow.add(tableHeadFive);
    const tableHeadFiveContent = doc.markStructureContent('TH');
    tableHeadFive.add(tableHeadFiveContent);
    mvsTableCell({doc, x: PdfStyle.MARGIN.LEFT + 355, y: yPos, width: 65, height: cellHeight, text: ['Verified weight landed(net catch weight in kg)']}, true, PdfStyle.FONT_SIZE.SMALLER, 'center', '#767676', '#353535', '#ffff00');
    tableHeadFive.end();

    const tableHeadSix = doc.struct('TH');
    tableHeadRow.add(tableHeadSix);
    const tableHeadSixContent = doc.markStructureContent('TH');
    tableHeadSix.add(tableHeadSixContent)
    mvsTableCell({doc, x: PdfStyle.MARGIN.LEFT + 420, y: yPos, width: 60, height: cellHeight, text: ['Vessel name and PLN / Callsign']}, true, PdfStyle.FONT_SIZE.SMALLER, 'center', '#767676', '#353535', '#ffff00');
    tableHeadSix.end();

    const tableHeadSeven = doc.struct('TH');
    tableHeadRow.add(tableHeadSeven);
    const tableHeadSevenContent = doc.markStructureContent('TH');
    tableHeadSeven.add(tableHeadSevenContent);
    mvsTableCell({doc, x: PdfStyle.MARGIN.LEFT + 480, y: yPos, width: 70, height: cellHeight, text: ['IMO number or other unique vessel identifier (if applicable)']}, true, PdfStyle.FONT_SIZE.SMALLER, 'center', '#767676', '#353535', '#ffff00');
    tableHeadSeven.end();

    const tableHeadEight = doc.struct('TH');
    tableHeadRow.add(tableHeadEight);
    const tableHeadEightContent = doc.markStructureContent('TH');
    tableHeadEight.add(tableHeadEightContent)
    mvsTableCell({doc, x: PdfStyle.MARGIN.LEFT + 550, y: yPos, width: 70, height: cellHeight, text: 'Master / Licence Holder'}, true, PdfStyle.FONT_SIZE.SMALLER, 'center', '#767676', '#353535', '#ffff00');
    tableHeadEight.end();

    const tableHeadNine = doc.struct('TH');
    tableHeadRow.add(tableHeadNine);
    const tableHeadNineContent = doc.markStructureContent('TH');
    tableHeadNine.add(tableHeadNineContent)
    mvsTableCell({doc, x: PdfStyle.MARGIN.LEFT + 620, y: yPos, width: 80, height: cellHeight, text: ['Licence Number /', 'Flag-Homeport']}, true, PdfStyle.FONT_SIZE.SMALLER, 'center', '#767676', '#353535', '#ffff00');
    tableHeadNine.end()

    const tableHeadTen = doc.struct('TH');
    tableHeadRow.add(tableHeadTen);
    const tableHeadTenContent = doc.markStructureContent('TH');
    tableHeadTen.add(tableHeadTenContent)
    mvsTableCell({doc, x: PdfStyle.MARGIN.LEFT + 700, y: yPos, width: 40, height: cellHeight, text: ['FAO', 'AREA']}, true, PdfStyle.FONT_SIZE.SMALLER, 'center', '#767676', '#353535', '#ffff00');
    tableHeadTen.end()

    const tableHeadEleven = doc.struct('TH');
    tableHeadRow.add(tableHeadEleven);
    const tableHeadElevenContent = doc.markStructureContent('TH');
    tableHeadEleven.add(tableHeadElevenContent);
    mvsTableCell({doc, x: PdfStyle.MARGIN.LEFT + 740, y: yPos, width: 40, height: cellHeight, text: ['Fishing', 'Gear']}, true, PdfStyle.FONT_SIZE.SMALLER, 'center', '#767676', '#353535', '#ffff00');
    tableHeadEleven.end();
    tableHeadRow.end();
    tableHead.end();

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

    cellHeight = (PdfStyle.ROW.HEIGHT * 3) - 5;

    const tableBody = doc.struct('TBody');
    myTable.add(tableBody);

    for (let rowIdx = fromIdx; rowIdx < (fromIdx + pageSize); rowIdx++) {
        const tableBodyRow = doc.struct('TR');
        tableBody.add(tableBodyRow);
        generateMultiVesselTableRows(tableBodyRow, doc, yPos, cellHeight, rowIdx, rowDataLimit, rows);
        tableBodyRow.end();
        yPos = yPos + cellHeight;
    }
    doc.endMarkedContent();

    const pageCountRow = doc.struct('TR', () => {
        mvsTableCell({doc, x: PdfStyle.MARGIN.LEFT, y: yPos, width: 780, height: PdfStyle.ROW.HEIGHT, text: 'Page ' + page + ' of ' + pageCount}, true, PdfStyle.FONT_SIZE.SMALLER, 'left', '#767676', '#353535', '#ffffff');
    });
    tableBody.add(pageCountRow);
    pageCountRow.end();

    tableBody.end();
    myTable.end();
};

const generateMultiVesselTableRows = (tableBodyRow, doc, yPos, cellHeight, rowIdx, rowDataLimit, rows) => {
    const TdOne = doc.struct('TD');
    tableBodyRow.add(TdOne);
    const TdOneContent = doc.markStructureContent('TD');
    TdOne.add(TdOneContent);
    mvsTableCell({doc, x: PdfStyle.MARGIN.LEFT, y: yPos, width: 85, height: cellHeight, text: rowIdx < rowDataLimit ? `${rows[rowIdx].species}` : ''}, false, PdfStyle.FONT_SIZE.SMALLER, 'left', '#767676', '#353535', '#ffffff');
    TdOne.end();

    const TdTwo = doc.struct('TD');
    tableBodyRow.add(TdTwo);
    const TdTwoContent = doc.markStructureContent('TD');
    TdTwo.add(TdTwoContent);
    mvsTableCell({doc, x: PdfStyle.MARGIN.LEFT + 85, y: yPos, width: 60, height: cellHeight, text: rowIdx < rowDataLimit ? `${rows[rowIdx].presentation}` : ''}, false, PdfStyle.FONT_SIZE.SMALLER, 'left', '#767676', '#353535', '#ffffff');
    TdTwo.end();

    const TdThree = doc.struct('TD');
    tableBodyRow.add(TdThree);
    const TdThreeContent = doc.markStructureContent('TD');
    TdThree.add(TdThreeContent);
    mvsTableCell({doc, x: PdfStyle.MARGIN.LEFT + 145, y: yPos, width: 50, height: cellHeight, text: rowIdx < rowDataLimit ? `${rows[rowIdx].commodityCode}` : ''}, false, PdfStyle.FONT_SIZE.SMALLER, 'left', '#767676', '#353535', '#ffffff');
    TdThree.end();

    const TdFour = doc.struct('TD');
    tableBodyRow.add(TdFour);
    const TdFourContent = doc.markStructureContent('TD');
    TdFour.add(TdFourContent);
    mvsTableCell({doc, x: PdfStyle.MARGIN.LEFT + 195, y: yPos, width: 60, height: cellHeight, text: rowIdx < rowDataLimit ? `${rows[rowIdx].dateLanded}` : ''}, false, PdfStyle.FONT_SIZE.SMALLER, 'left', '#767676', '#353535', '#ffffff');
    TdFour.end();

    const TdEstWeight = doc.struct('TD');
    tableBodyRow.add(TdEstWeight);
    const TdEstWeightContent = doc.markStructureContent('TD');
    TdEstWeight.add(TdEstWeightContent);
    mvsTableCell({doc, x: PdfStyle.MARGIN.LEFT + 255, y: yPos, width: 50, height: cellHeight, text: rowIdx < rowDataLimit ? `${rows[rowIdx].estimatedWeight}` : ''}, false, PdfStyle.FONT_SIZE.SMALLER, 'left', '#767676', '#353535', '#ffffff');
    TdEstWeight.end();

    const TdVerifiedWeight = doc.struct('TD');
    tableBodyRow.add(TdVerifiedWeight);
    const TdVerifiedWeightContent = doc.markStructureContent('TD');
    TdVerifiedWeight.add(TdVerifiedWeightContent);
    mvsTableCell({doc, x: PdfStyle.MARGIN.LEFT + 305, y: yPos, width: 50, height: cellHeight, text: rowIdx < rowDataLimit ? `${Number(rows[rowIdx].exportWeight).toFixed(2)}` : ''}, false, PdfStyle.FONT_SIZE.SMALLER, 'left', '#767676', '#353535', '#ffffff');
    TdVerifiedWeight.end();

    const TdFive = doc.struct('TD');
    tableBodyRow.add(TdFive);
    const TdFiveContent = doc.markStructureContent('TD');
    TdFive.add(TdFiveContent);
    mvsTableCell({doc, x: PdfStyle.MARGIN.LEFT + 355, y: yPos, width: 65, height: cellHeight, text: rowIdx < rowDataLimit ? `${rows[rowIdx].verifiedWeight}` : ''}, false, PdfStyle.FONT_SIZE.SMALLER, 'left', '#767676', '#353535', '#ffffff');
    TdFive.end();

    const TdSix = doc.struct('TD');
    tableBodyRow.add(TdSix);
    const TdSixContent = doc.markStructureContent('TD');
    TdSix.add(TdSixContent);
    mvsTableCell({doc, x: PdfStyle.MARGIN.LEFT + 420, y: yPos, width: 60, height: cellHeight, text: rowIdx < rowDataLimit ? `${rows[rowIdx].vessel} (${rows[rowIdx].pln})` : ''}, false, PdfStyle.FONT_SIZE.SMALLER, 'left', '#767676', '#353535', '#ffffff');
    TdSix.end();

    const TdSeven = doc.struct('TD');
    tableBodyRow.add(TdSeven);
    const TdSevenContent = doc.markStructureContent('TD');
    TdSeven.add(TdSevenContent);
    mvsTableCell({doc, x: PdfStyle.MARGIN.LEFT + 480, y: yPos, width: 70, height: cellHeight, text: rowIdx < rowDataLimit ? `${getImoOrCfrForMultiVesselSchedule(rows[rowIdx])}` : ''}, false, PdfStyle.FONT_SIZE.SMALLER, 'left', '#767676', '#353535', '#ffffff');
    TdSeven.end();

    const TdEight = doc.struct('TD');
    tableBodyRow.add(TdEight);
    const TdEightContent = doc.markStructureContent('TD');
    TdEight.add(TdEightContent);
    mvsTableCell({doc, x: PdfStyle.MARGIN.LEFT + 550, y: yPos, width: 70, height: cellHeight, text: rowIdx < rowDataLimit ? `${rows[rowIdx].licenceHolder}` : ''}, false, PdfStyle.FONT_SIZE.SMALLER, 'left', '#767676', '#353535', '#ffffff');
    TdEight.end();

    const TdNine = doc.struct('TD');
    tableBodyRow.add(TdNine);
    const TdNineContent = doc.markStructureContent('TD');
    TdNine.add(TdNineContent);
    mvsTableCell({doc, x: PdfStyle.MARGIN.LEFT + 620, y: yPos, width: 80, height: cellHeight, text: rowIdx < rowDataLimit ? `${rows[rowIdx].licenceDetail} ${rows[rowIdx].homePort}` : ''}, false, PdfStyle.FONT_SIZE.SMALLER, 'left', '#767676', '#353535', '#ffffff');
    TdNine.end();

    const TdTen = doc.struct('TD');
    tableBodyRow.add(TdTen);
    const TdTenContent = doc.markStructureContent('TD');
    TdTen.add(TdTenContent)
    mvsTableCell({doc, x: PdfStyle.MARGIN.LEFT + 700, y: yPos, width: 40, height: cellHeight, text: rowIdx < rowDataLimit ? `${rows[rowIdx].faoArea}` : ''}, false, PdfStyle.FONT_SIZE.SMALLER, 'left', '#767676', '#353535', '#ffffff');
    TdTen.end();

    const TdEleven = doc.struct('TD');
    tableBodyRow.add(TdEleven);
    const TdElevenContent = doc.markStructureContent('TD');
    TdEleven.add(TdElevenContent);
    mvsTableCell({doc, x: PdfStyle.MARGIN.LEFT + 740, y: yPos, width: 40, height: cellHeight, text: rowIdx < rowDataLimit && rows[rowIdx].gearCode ? `${rows[rowIdx].gearCode}` : ''}, false, PdfStyle.FONT_SIZE.SMALLER, 'left', '#767676', '#353535', '#ffffff');
    TdEleven.end();
};

const end = (doc, startY) => {
    let yPos = startY + 10 * PdfStyle.ROW.HEIGHT + 10;
    let cellHeight = PdfStyle.ROW.HEIGHT * 8;
    PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT, yPos, 270, cellHeight, 'FOR OFFICIAL USE ONLY');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 270, yPos, 260, cellHeight, 'Import Control Authority Stamp');

    yPos += cellHeight + 20;
    doc.font(PdfStyle.FONT.BOLD);
    doc.text('Validated by the appropriate competent authority (MMO, Scottish Ministers, Welsh Ministers, Department of Agriculture, Environment and Rural Affairs for Northern Ireland, Marine Resources, Growth and Housing and Environment for Jersey, Sea Fisheries, Committee for Economic Development for Guernsey and Department Environment, Food and Agriculture for the Isle of Man) in accordance with article 15 of Council Regulation (EU) 1005/2008 (as retained under s.3(1) European Union (Withdrawal) Act 2018)', PdfStyle.MARGIN.LEFT + 10, yPos);
};

const appendixTransportDetails = (doc, data, startY) => {
    doc.font(PdfStyle.FONT.BOLD);
    doc.fontSize(PdfStyle.FONT_SIZE.MEDIUM);
    doc.text('Transport Details', 0, startY, {
        align: 'center'
    });
    doc.font(PdfStyle.FONT.REGULAR);
    let yPos = startY + 20;
    const countryOfExport = data.transport?.exportedFrom ? data.transport.exportedFrom : 'United Kingdom';
    const pointOfDestination = data.transport?.pointOfDestination;
    const departurePlace = getDeparturePlace(data);
    const vcDetails = getVcDetails(data);
    const flightNumber = getFlightDetails(data);
    const truckDetails = getTruckDetails(data);
    const railwayBillNumber = getRailwayBillNumber(data);
    const freightBillNumber = getFreightBillNumber(data);
    const otherTransportDocuments = getOtherTransportDocuments(data);

    const containerIdentificationNumber = getContainerIdentificationNumber(data);

    doc.addStructure(doc.struct('Table', [
        doc.struct('TR', [
            doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos, 265, PdfStyle.ROW.HEIGHT, 'Country of exportation')),
            doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 265, yPos, 265, PdfStyle.ROW.HEIGHT, countryOfExport)),
        ]),
        doc.struct('TR', [
            doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos +  PdfStyle.ROW.HEIGHT, 265, PdfStyle.ROW.HEIGHT, 'Port/airport/other point of departure')),
            doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 265, yPos +  PdfStyle.ROW.HEIGHT, 265, PdfStyle.ROW.HEIGHT, departurePlace)),
        ]),
        doc.struct('TR', [
            doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + (PdfStyle.ROW.HEIGHT * 2), 265, PdfStyle.ROW.HEIGHT, 'Point of destination')),
            doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 265, yPos + (PdfStyle.ROW.HEIGHT * 2), 265, PdfStyle.ROW.HEIGHT, pointOfDestination)),
        ]),
        doc.struct('TR', [
            doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + (PdfStyle.ROW.HEIGHT * 3), 265, PdfStyle.ROW.HEIGHT, 'Vessel name and flag')),
            doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 265, yPos + (PdfStyle.ROW.HEIGHT * 3), 265, PdfStyle.ROW.HEIGHT, vcDetails)),
        ]),
        doc.struct('TR', [
            doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + (PdfStyle.ROW.HEIGHT * 4), 265, PdfStyle.ROW.HEIGHT, 'Flight number/airway bill number')),
            doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 265, yPos + (PdfStyle.ROW.HEIGHT * 4), 265, PdfStyle.ROW.HEIGHT, flightNumber)),
        ]),
        doc.struct('TR', [
            doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + (PdfStyle.ROW.HEIGHT * 5), 265, PdfStyle.ROW.HEIGHT, 'Truck nationality and registration number')),
            doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 265, yPos + (PdfStyle.ROW.HEIGHT * 5), 265, PdfStyle.ROW.HEIGHT, truckDetails)),
        ]),
        doc.struct('TR', [
            doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + (PdfStyle.ROW.HEIGHT * 6), 265, PdfStyle.ROW.HEIGHT, 'Railway bill number')),
            doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 265, yPos + (PdfStyle.ROW.HEIGHT * 6), 265, PdfStyle.ROW.HEIGHT, railwayBillNumber)),
        ]),
        doc.struct('TR', [
            doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + (PdfStyle.ROW.HEIGHT * 7), 265, PdfStyle.ROW.HEIGHT, 'Freight bill number')),
            doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 265, yPos + (PdfStyle.ROW.HEIGHT * 7), 265, PdfStyle.ROW.HEIGHT, freightBillNumber)),
        ]),
        doc.struct('TR', [
            doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + (PdfStyle.ROW.HEIGHT * 8), 265, PdfStyle.ROW.HEIGHT, 'Container identification number(s)')),
            doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 265, yPos + (PdfStyle.ROW.HEIGHT * 8), 265, PdfStyle.ROW.HEIGHT, containerIdentificationNumber)),
        ]),
        doc.struct('TR', [
            doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + (PdfStyle.ROW.HEIGHT * 9), 265, PdfStyle.ROW.HEIGHT * 5, 'Other transport documents (e.g. bill of landing, CMR, air waybill)')),
            doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 265, yPos + (PdfStyle.ROW.HEIGHT * 9), 265, PdfStyle.ROW.HEIGHT * 5, otherTransportDocuments)),
        ])
    ]));

    yPos = yPos + (PdfStyle.ROW.HEIGHT * 13) + PdfStyle.ROW.HEIGHT + 7;

    doc.fontSize(PdfStyle.FONT_SIZE.LARGE);
    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT, yPos, 'Container number(s) list attached');
    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 270, yPos, 'Exporter details');
    yPos = yPos + PdfStyle.ROW.HEIGHT - 2;
    let cellHeight = PdfStyle.ROW.HEIGHT * 8;

    const containerNumber = data?.transport?.containerNumber ?? '';
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT, yPos, 250, cellHeight, containerNumber.toString());

    const exporterAddress = PdfUtils.constructAddress([
        data.exporter?.addressOne, 
        data.exporter?.addressTwo,
        data.exporter?.townCity, 
        data.exporter?.postcode
    ]) ?? '';
    const exporterFullName = data.exporter?.exporterFullName ?? '';
    const exporterCompanyName = data.exporter?.exporterCompanyName ?? '';

    cellHeight = PdfStyle.ROW.HEIGHT * 5 + 5;

    doc.addStructure(doc.struct('Table', [
        doc.struct('TR', [
            doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 270, yPos, 100, PdfStyle.ROW.HEIGHT + 5, 'Name')),
            doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 370, yPos, 160, PdfStyle.ROW.HEIGHT + 5, exporterFullName)),
        ]),
        doc.struct('TR', [
            doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 270, yPos + PdfStyle.ROW.HEIGHT + 5, 100, cellHeight, 'Address')),
            doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 370, yPos + PdfStyle.ROW.HEIGHT + 5, 160, cellHeight, [exporterCompanyName, exporterAddress])),
        ]),
        doc.struct('TR', [
            doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 270, yPos + PdfStyle.ROW.HEIGHT + 5 + cellHeight, 100, cellHeight, 'Signature')),
            doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 370, yPos + PdfStyle.ROW.HEIGHT + 5 + cellHeight, 160, cellHeight)),
        ])
    ]));

    PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT + 5 + (cellHeight * 2) + 10);
};

const getVehicleType = (data) => {
    return data?.transport?.vehicle?.toUpperCase() ?? '';
};

const getVcDetails = (data) => {
    const vehicleType = getVehicleType(data);

    if (vehicleType === 'CONTAINERVESSEL') {
        const vesselName = data.transport.vesselName ? `${data.transport.vesselName} ` : '';
        const flagState = data.transport.flagState ?? '';
        return (vesselName + flagState).toString();
    }
    
    if (vehicleType === 'DIRECTLANDING') {
        const vessel = data.exportPayload?.items?.[0]?.landings?.[0]?.model?.vessel;
        const vesselName = vessel?.vesselName ? `${vessel.vesselName} ` : '';
        const pln = vessel?.pln ? `(${vessel.pln})` : '';
        return (vesselName + pln).toString();
    }
    
    return '';
};

const getDeparturePlace = (data) => {
    const departurePlace = data?.transport?.cmr === 'true' 
        ? 'See attached transport documents' 
        : (data?.transport?.departurePlace ?? '');
    return departurePlace.toString();
};

const getFlightDetails = (data) => {
    return (data?.transport?.flightNumber ?? '').toString();
};

const getTruckDetails = (data) => {
    if (data?.transport?.vehicle?.toUpperCase() !== 'TRUCK') {
        return '';
    }
    
    const nationality = data.transport.nationalityOfVehicle 
        ? `${data.transport.nationalityOfVehicle} ` 
        : '';
    const registration = data.transport.registrationNumber ?? '';
    
    return (nationality + registration).toString();
};

const getRailwayBillNumber = (data) => {
    return (data?.transport?.railwayBillNumber ?? '').toString();
};

const getContainerIdentificationNumber = (data) => {
    const vehicleType = getVehicleType(data);
    
    // Only show container identification number for truck and train transport
    if (vehicleType === 'TRUCK' || vehicleType === 'TRAIN') {
        return (data.transport.containerIdentificationNumber ?? '').toString();
    }
    
    return '';
};

const getFreightBillNumber = (data) => {
    let freightBillNumber = '';
    if (data.transport) {
        freightBillNumber = data.transport.freightBillNumber;
    }

    return freightBillNumber;
}

const getOtherTransportDocuments = (data) => {
    let documentLines = [];
    
    if (data.transport?.documents && Array.isArray(data.transport.documents)) {
        documentLines = data.transport.documents
        .sort((a, b) => {
            const aKey = a.name || a.reference || '';
            const bKey = b.name || b.reference || '';
            return aKey.localeCompare(bKey, undefined, { numeric: true });
        })
        .map(doc => {
            if (doc.name && doc.reference) {
                return `${doc.name} - ${doc.reference}`;
            }
            return '';
        })
        .filter(line => line.length > 0);
    }
    
    return documentLines;
};

const appendixHeading = (doc, startY) => {

    doc.fillColor('#353535');
    doc.fontSize(PdfStyle.FONT_SIZE.LARGE);
    doc.font(PdfStyle.FONT.BOLD);
    doc.addStructure(doc.struct('H2', {}, () => {
        doc.text('Appendix I', 0, startY, {
            align: 'center'
        });
    }));
};
const generateTable = (doc, yPos, headerHeight, rowHeight, headers, rows) => {
    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', {}, () => {
                headers.forEach((header, index) => {
                    doc.addStructure(
                        doc.struct('TH', () => 
                            PdfUtils.tableHeaderCell(
                                doc,
                                PdfStyle.MARGIN.LEFT + header.leftMargin,
                                yPos,
                                header.width,
                                headerHeight,
                                header.text
                            )
                        )
                    );
                });
            })
        ]),
        doc.struct('TBody', [
            doc.struct('TR', {}, () => {
                rows.forEach((row, index) => {
                    doc.addStructure(
                        doc.struct('TD', () => 
                            PdfUtils.field(
                                doc,
                                PdfStyle.MARGIN.LEFT + row.leftMargin,
                                yPos + headerHeight,
                                row.width,
                                rowHeight
                            )
                        )
                    );
                });
            })
        ])
    ]));
};

const generateSection11 = (doc, data, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + PdfStyle.ROW.HEIGHT * 2, '11    Importer Declaration:');
    let yPos = startY + PdfStyle.ROW.HEIGHT * 3;
    const headerHeight = PdfStyle.ROW.HEIGHT * 3 - 4;
    const rowHeight = PdfStyle.ROW.HEIGHT * 3;

    const importerHeaders = [
        { leftMargin: 15, width: 250, text: ['Company, name, address, EORI number and contact details of representative of the importer (specify details)'] },
        { leftMargin: 265, width: 95, text: 'Signature' },
        { leftMargin: 360, width: 95, text: 'Date' },
        { leftMargin: 455, width: 80, text: 'Seal' }
    ];
    const importerRows = [
        { leftMargin: 15, width: 250 },
        { leftMargin: 265, width: 95 },
        { leftMargin: 360, width: 95 },
        { leftMargin: 455, width: 80 }
    ];
    generateTable(doc, yPos, headerHeight, rowHeight, importerHeaders, importerRows);

    yPos += headerHeight + rowHeight;

    // Table 2: Product Details
    const productHeaders = [
        { leftMargin: 15, width: 250, text: 'Product Description' },
        { leftMargin: 265, width: 95, text: 'CN code' },
        { leftMargin: 360, width: 95, text: 'Net weight in kg' },
        { leftMargin: 455, width: 80, text: 'Net fishery product weight in kg' }
    ];
    const productRows = [
        { leftMargin: 15, width: 250 },
        { leftMargin: 265, width: 95 },
        { leftMargin: 360, width: 95 },
        { leftMargin: 455, width: 80 }
    ];
    generateTable(doc, yPos, headerHeight, rowHeight, productHeaders, productRows);

    yPos += headerHeight + rowHeight;
    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', () => PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 250, headerHeight,
                    ['Document under Article 14(1) of Regulation (EC) No 1005/2008'])),
                doc.struct('TH', () => PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 265, yPos, 270, headerHeight, 'Yes/No (as appropriate)')),
            ])
        ]),

        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', () => PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos + headerHeight, 250, rowHeight)),
                doc.struct('TD', () => PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 265, yPos + headerHeight, 270, rowHeight)),
            ])
        ])
    ]));

    yPos += headerHeight + rowHeight;
    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', () => PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 250, headerHeight,
                    ['Document under Article 14(2) of Regulation (EC) No 1005/2008'])),
                doc.struct('TH', () => PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 265, yPos, 95, headerHeight, 'Yes/No (as appropriate)')),
                doc.struct('TH', () => PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 360, yPos, 175, headerHeight, 'References (processing statement document number(s))')),
            ])
        ]),

        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', () => PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos + headerHeight, 250, rowHeight)),
                doc.struct('TD', () => PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 265, yPos + headerHeight, 95, rowHeight)),
                doc.struct('TD', () => PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 360, yPos + headerHeight, 175, rowHeight)),
            ])
        ])
    ]));

    yPos += headerHeight + rowHeight;
    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', () => PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 520, headerHeight,
                    'Member State and office of import')),
            ])
        ]),

        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', () => PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos + headerHeight, 520, rowHeight)),
            ])
        ])
    ]));

    yPos += headerHeight + rowHeight;
    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', () => PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 250, headerHeight,
                    'Means of transport upon arrival (airplane,vehicle, ship, train)')),
                doc.struct('TH', () => PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 265, yPos, 95, headerHeight, 'Transport document reference')),
                doc.struct('TH', () => PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 360, yPos, 175, headerHeight, 'Estimated time of arrival (if submission under Article 12(1) of Regulation (EC) No 1005/2008')),
            ])
        ]),

        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', () => PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos + headerHeight, 250, rowHeight)),
                doc.struct('TD', () => PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 265, yPos + headerHeight, 95, rowHeight)),
                doc.struct('TD', () => PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 360, yPos + headerHeight, 175, rowHeight)),
            ])
        ])
    ]));

    yPos += headerHeight + rowHeight;
    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', () => PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 300, headerHeight,
                    'Customs declaration number (if issued)')),
                doc.struct('TH', () => PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 315, yPos, 220, headerHeight, 'CHED number (if available)')),
            ])
        ]),

        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', () => PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos + headerHeight, 300, rowHeight)),
                doc.struct('TD', () => PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 315, yPos + headerHeight, 220, rowHeight)),
            ])
        ])
    ]));

    yPos += headerHeight + rowHeight;
    doc.lineWidth(1.5);
    doc.undash();
    doc.moveTo(PdfStyle.MARGIN.LEFT + 225, yPos + 0.5).lineTo(PdfStyle.MARGIN.LEFT + 225, yPos + headerHeight - 0.5).stroke('#ffffff');
}

const section17 = (doc, data, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '4    Re-export control');
    let yPos = startY + 12;
    let cellHeight = PdfStyle.ROW.HEIGHT * 2 - 3;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 155, cellHeight, 'Place')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 170, yPos, 110, cellHeight, 'Re-export authorised (*)')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 280, yPos, 110, cellHeight, 'Verification requested (*)')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 390, yPos, 140, cellHeight, ['Re-export declaration', 'number and date']))
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos + cellHeight, 155, PdfStyle.ROW.HEIGHT * 6)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 170, yPos + cellHeight, 110, PdfStyle.ROW.HEIGHT * 6)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 280, yPos + cellHeight, 110, PdfStyle.ROW.HEIGHT * 6)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 390, yPos + cellHeight, 140, PdfStyle.ROW.HEIGHT * 6))
            ])
        ])
    ]));

    yPos += cellHeight + PdfStyle.ROW.HEIGHT * 6 + 5;
    doc.text('* Tick as appropriate', PdfStyle.MARGIN.LEFT + 15, yPos);

    PdfUtils.separator(doc, yPos + 15);
};

const section16 = (doc, data, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '3    Authority');
    let yPos = startY + 12;
    let cellHeight = PdfStyle.ROW.HEIGHT * 6;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 210, PdfStyle.ROW.HEIGHT, 'Name / title')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 225, yPos, 110, PdfStyle.ROW.HEIGHT, 'Signature')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 335, yPos, 95, PdfStyle.ROW.HEIGHT, 'Date')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 430, yPos, 100, PdfStyle.ROW.HEIGHT, 'Seal'))
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos + PdfStyle.ROW.HEIGHT, 210, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 225, yPos + PdfStyle.ROW.HEIGHT, 110, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 335, yPos + PdfStyle.ROW.HEIGHT, 95, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 430, yPos + PdfStyle.ROW.HEIGHT, 100, cellHeight))
            ])
        ])
    ]));

    PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT + cellHeight + 8);
};

const section15 = (doc, data, startY) => {

    let yPos = startY;
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '2');

    let cellHeight = PdfStyle.ROW.HEIGHT * 6;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 140, PdfStyle.ROW.HEIGHT, 'Name of re-exporter')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 155, yPos, 215, PdfStyle.ROW.HEIGHT, 'Address')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 370, yPos, 90, PdfStyle.ROW.HEIGHT, 'Signature')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 460, yPos, 70, PdfStyle.ROW.HEIGHT, 'Date'))
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos + PdfStyle.ROW.HEIGHT, 140, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 155, yPos + PdfStyle.ROW.HEIGHT, 215, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 370, yPos + PdfStyle.ROW.HEIGHT, 90, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 460, yPos + PdfStyle.ROW.HEIGHT, 70, cellHeight))
            ])
        ])
    ]));

    PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT + cellHeight + 8);
};

const section14 = (doc, data, startY) => {

    let yPos = startY;
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '1    Description of re-exported product');
    yPos += 12;
    let cellHeight = PdfStyle.ROW.HEIGHT * 2 - 3;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 205, cellHeight, 'Species')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 220, yPos, 150, cellHeight, 'Product code')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 370, yPos, 160, cellHeight, ['Balance from total quantity declared', 'in the catch certificate'])),
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos + cellHeight, 205, PdfStyle.ROW.HEIGHT * 10)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 220, yPos + cellHeight, 150, PdfStyle.ROW.HEIGHT * 10)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 370, yPos + cellHeight, 160, PdfStyle.ROW.HEIGHT * 10)),
            ])
        ])
    ]));

    PdfUtils.separator(doc, (yPos + cellHeight) + (PdfStyle.ROW.HEIGHT * 10) + 8);
};

const section13 = (doc, data, startY) => {

    doc.fontSize(PdfStyle.FONT_SIZE.MEDIUM);
    doc.addStructure(doc.struct('H3', {}, () => {
        doc.text('(ii) RE-EXPORT CERTIFICATE', PdfStyle.MARGIN.LEFT, startY);
    }));
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

    const headerHeight =  PdfStyle.ROW.HEIGHT * 2 - 3;
    const rowHeight = PdfStyle.ROW.HEIGHT * 7;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 150, headerHeight, 'Import Control Authority')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 165, yPos, 105, headerHeight, 'Place')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 270, yPos, 80, headerHeight, ['Importation', 'authorised*'])),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 350, yPos, 80, headerHeight, ['Importation', 'suspended*'])),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 430, yPos, 100, headerHeight, ['Verification requested', '– date']))
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos + headerHeight, 150, rowHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 165, yPos + headerHeight, 105, rowHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 270, yPos + headerHeight, 80, rowHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 350, yPos + headerHeight, 80, rowHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 430, yPos + headerHeight, 100, rowHeight))
            ])
        ])
    ]));

    yPos += headerHeight + rowHeight;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 150, headerHeight, 'Customs declaration (if issued)')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 165, yPos, 185, headerHeight, 'Number')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 350, yPos, 80, headerHeight, 'Date')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 430, yPos, 100, headerHeight, 'Place')),
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos + headerHeight, 150,  rowHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 165, yPos + headerHeight, 185,  rowHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 350, yPos + headerHeight, 80,  rowHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 430, yPos + headerHeight, 100,  rowHeight)),
            ])
        ])
    ]));

    yPos += headerHeight + rowHeight + 5;

    doc.text('* Tick as appropriate', PdfStyle.MARGIN.LEFT + 15, yPos);
};

const section11 = (doc, data, startY) => {
    generateSection11(doc, data, startY);
};

const section10 = (doc, data, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + 12, '10    Transport details: See Appendix I');
    PdfUtils.separator(doc, startY + 36);
};

const section9 = (doc, data, isSample, buff, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '9    Flag State Authority Validation:');
    let yPos = startY + 12;
    let cellHeight = PdfStyle.ROW.HEIGHT * 2 - 3;

    let dateIssued = PdfUtils.todaysDate();
    if (data.isBlankTemplate) {
        dateIssued = '';
    }

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 250, PdfStyle.ROW.HEIGHT, 'Date Issued')),
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=>  PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos + PdfStyle.ROW.HEIGHT, 250, cellHeight, dateIssued)),
            ])
        ])
    ]));

    // QR code positioned to the right of Date Issued field (80px right of field end)
    const qrXPosition = PdfStyle.MARGIN.LEFT + 15 + 250 + 80; // Date Issued field left + width + 80px
    
    if (!data.isBlankTemplate && !isSample) {
        PdfUtils.qrCode(doc, buff, qrXPosition, startY);
    }

    PdfUtils.separator(doc, startY + 66);
};

const section8 = (doc, data, isSample, buff, startY) => {

    let yPos = startY;
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '8');

    let cellHeight = PdfStyle.ROW.HEIGHT * 7 + 2;

    const exporterAddress = PdfUtils.constructAddress([
        data.exporter?.addressOne, 
        data.exporter?.addressTwo,
        data.exporter?.townCity, 
        data.exporter?.postcode
    ]) ?? '';
    const exporterFullName = data.exporter?.exporterFullName ?? '';
    const exporterCompanyName = data.exporter?.exporterCompanyName ?? '';

    let dateOfAcceptance = PdfUtils.todaysDate();
    if (data.isBlankTemplate) {
        dateOfAcceptance = '';
    }

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 230, PdfStyle.ROW.HEIGHT, 'Name and address of Exporter')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 245, yPos, 115, PdfStyle.ROW.HEIGHT, 'Signature')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 360, yPos, 95, PdfStyle.ROW.HEIGHT, 'Date of acceptance(*)')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 455, yPos, 75, PdfStyle.ROW.HEIGHT, 'Seal'))
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 15, yPos + PdfStyle.ROW.HEIGHT, 230, cellHeight,
                    [exporterFullName, exporterCompanyName, exporterAddress])),
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 245, yPos + PdfStyle.ROW.HEIGHT, 115, cellHeight, exporterFullName)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 360, yPos + PdfStyle.ROW.HEIGHT, 95, cellHeight, dateOfAcceptance)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 455, yPos + PdfStyle.ROW.HEIGHT, 75, cellHeight))
            ])
        ])
    ]));

    yPos += cellHeight + 5 + PdfStyle.ROW.HEIGHT;
    doc.text('* Date of acceptance by exporter of the veracity of the contents of this document', PdfStyle.MARGIN.LEFT + 15, yPos);

    PdfUtils.separator(doc, startY + 137);
};

const section7 = (doc, data, startY) => {

    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '7    Transhipment and/or landing authorisation within a port area:');
    let yPos = startY + 12;
    let cellHeight = PdfStyle.ROW.HEIGHT  * 2.5 - 6;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 65, cellHeight, 'Name')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 80, yPos, 60, cellHeight, 'Authority')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 140, yPos, 60, cellHeight, 'Signature')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 200, yPos, 65, cellHeight, 'Address')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 265, yPos, 60, cellHeight, 'Tel.')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 325, yPos, 75, cellHeight, 'Port of landing (as appropriate)')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 400, yPos, 130, cellHeight, 'Date of landing (as appropriate)')),
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos + cellHeight, 65, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 80, yPos + cellHeight, 60, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 140, yPos + cellHeight, 60, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 200, yPos + cellHeight, 65, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 265, yPos + cellHeight, 60, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 325, yPos + cellHeight, 75, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 400, yPos + cellHeight, 130, cellHeight)),
            ])
        ])
    ]));
    yPos += cellHeight + 32;
    cellHeight = PdfStyle.ROW.HEIGHT  * 4.5 - 6;
    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 185, cellHeight, 'IMO number or other unique vessel identifier (if applicable)')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 200, yPos, 125, cellHeight, 'Port of transhipment (as appropriate)')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 325, yPos, 75, cellHeight, 'Date of transhipment (as appropriate)')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 400, yPos, 50, cellHeight, 'Name and registration number of receiving vessel')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 450, yPos, 40, cellHeight, 'Seal (Stamp)')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 490, yPos, 40, cellHeight, 'Seal (Stamp)'))
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos + cellHeight, 185, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 200, yPos + cellHeight, 125, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 325, yPos + cellHeight, 75, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 400, yPos + cellHeight, 50, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 450, yPos + cellHeight, 40, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 490, yPos + cellHeight, 40, cellHeight))
            ])
        ])
    ]));
     PdfUtils.separator(doc, startY + 209);
};

const section6 = (doc, data, startY) => {

    let yPos = startY;
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '6');

    let cellHeight = PdfStyle.ROW.HEIGHT * 2;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 220, cellHeight, ['Declaration of Transhipment at Sea', 'Name of Master of Fishing Vessel'])),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 235, yPos, 100, cellHeight, ['Signature', 'and Date'])),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 335, yPos, 115, cellHeight, ['Transhipment', 'Date/Area/Position'])),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 450, yPos, 80, cellHeight, 'Estimated weight (kg)'))
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos + cellHeight, 220, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 235, yPos + cellHeight, 100, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 335, yPos + cellHeight, 115, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 450, yPos + cellHeight, 80, cellHeight))
            ])
        ])
    ]));

    yPos += cellHeight + 30;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 100, cellHeight, ['Master of Receiving', 'Vessel'])),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 115, yPos, 100, cellHeight, 'Signature')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 215, yPos, 90, cellHeight, 'Vessel Name')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 305, yPos, 90, cellHeight, 'Call Sign')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 395, yPos, 135, cellHeight, ['IMO number or other unique vessel identifier (if applicable)']))
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos + cellHeight, 100, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 115, yPos + cellHeight, 100, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 215, yPos + cellHeight, 90, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 305, yPos + cellHeight, 90, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 395, yPos + cellHeight, 135, cellHeight))
            ])
        ])
    ]));
    PdfUtils.separator(doc, startY + 130);
};

const section5 = (doc, data, startY) => {
    let yPos = startY;
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '5    Name of master of fishing vessel or of fishing licence holder – Signature:');

    yPos += PdfStyle.ROW.HEIGHT;

    const licenceHolder = isMultiVessel(data.exportPayload) ? "Multiple vessels - See schedule" : getLicenceHolder(data.exportPayload);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 515, PdfStyle.ROW.HEIGHT, licenceHolder);

    yPos += PdfStyle.ROW.HEIGHT + 5;

    doc.text('* I am a representative of the vessel (s) shown on this document', PdfStyle.MARGIN.LEFT + 15, yPos);
    PdfUtils.separator(doc, startY + 45);
};

const section4 = (doc, data, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '4    References of applicable conservation and management measures');
    let policy = '';
    if (data.conservation) {
        policy = data.conservation.conservationReference === 'Other' ? data.conservation.anotherConservation : data.conservation.conservationReference;
    }
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, startY + 12, 515, PdfStyle.ROW.HEIGHT * 2, policy);
    PdfUtils.separator(doc, startY + 52);
};

function getLicenceHolder(exportPayload) {
    if (exportPayload?.items && exportPayload.items.length > 0) {
        const landings = exportPayload.items[0].landings;
        return landings && landings.length > 0 && landings[0].model?.vessel ? landings[0].model.vessel.licenceHolder : ''
    }

    return '';
}

function getDescOfProductRows(exportPayload) {

    let items = [];
    if (exportPayload?.items) {
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
                        exclusiveEconomicZones: landing.model.exclusiveEconomicZones,
                        rfmo: landing.model.rfmo,
                        highSeasArea: landing.model.highSeasArea,
                        dates: getCatchDates(landing.model.startDate, landing.model.dateLanded),
                        exportWeight: Number(landing.model.exportWeight)
                    }
                }
            })
        });
    }
    return Object.values(accum);
}


function getExportWeight(weight) {
    return `${Number(weight).toFixed(2) > 9999999.99 ? parseInt(weight) : Number(weight).toFixed(2)}`;
}

function getExportWeightText(rowIdx, arrLength, rowData) {
    if (rowIdx < arrLength) {
        return getExportWeight(rowData[rowIdx].exportWeight);
    }
    return '';
}

function getImoOrCfrForMultiVesselSchedule(row) {
    if (row.imo) {
        return row.imo;
    } else if (row.cfr) {
        return row.cfr;
    }
    return '';
}

function getImoOrCfr(vesselCounts, data) {
    if (Object.keys(vesselCounts).length === 1) {
        if (data.exportPayload.items[0].landings[0].model.vessel.imoNumber) {
            return data.exportPayload.items[0].landings[0].model.vessel.imoNumber;
        } else if (data.exportPayload.items[0].landings[0].model.vessel.cfr) {
            return data.exportPayload.items[0].landings[0].model.vessel.cfr;
        }
    }
    return '';
}

const section3 = (doc, data, startY) => {

    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '3    Description of Product');
    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 15, startY + 14, 'Type of processing authorised on board:');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, startY + 26, 515, PdfStyle.ROW.HEIGHT);

    let cellHeight = PdfStyle.ROW.HEIGHT * 3;
    let rowData = getDescOfProductRows(data.exportPayload);
    let arrLength = rowData.length;
    const allRowsLength = getProductScheduleRows(data.exportPayload).length;

    const myTable = doc.struct('Table');
    doc.addStructure(myTable);

    const tableHead = doc.struct('THead');
    myTable.add(tableHead);

    const tableHeadRow = doc.struct('TR');
    tableHead.add(tableHeadRow);

    const tableHeadOne = doc.struct('TH');
    tableHeadRow.add(tableHeadOne);
    const headOneContent = doc.markStructureContent('TH');
    tableHeadOne.add(headOneContent)
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, startY + 48, 110, cellHeight, 'Species');
    tableHeadOne.end();

    const tableHeadTwo = doc.struct('TH');
    tableHeadRow.add(tableHeadTwo);
    const headTwoContent = doc.markStructureContent('TH');
    tableHeadTwo.add(headTwoContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 125, startY + 48, 55, cellHeight, 'Product Code');
    tableHeadTwo.end();

    const tableHeadThree = doc.struct('TH');
    tableHeadRow.add(tableHeadThree);
    const headThreeContent = doc.markStructureContent('TH');
    tableHeadThree.add(headThreeContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 180, startY + 48, 80, cellHeight, ['Catch Area(s)', '(Catch Area,', 'EEZ, RFMO,', 'High Seas)']);
    tableHeadThree.end();

    const tableHeadFour = doc.struct('TH');
    tableHeadRow.add(tableHeadFour);
    const headFourContent = doc.markStructureContent('TH');
    tableHeadFour.add(headFourContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 260, startY + 48, 80, cellHeight, ['Catch Date(s)', '(from - to)']);
    tableHeadFour.end();

    const tableHeadFive = doc.struct('TH');
    tableHeadRow.add(tableHeadFive);
    const headFiveContent =  doc.markStructureContent('TH');
    tableHeadFive.add(headFiveContent)
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 340, startY + 48, 55, cellHeight, 'Estimated weight to be landed in kg');
    tableHeadFive.end();

    const tableHeadSix = doc.struct('TH');
    tableHeadRow.add(tableHeadSix);
    const headSixContent =  doc.markStructureContent('TH');
    tableHeadSix.add(headSixContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 395, startY + 48, 55, cellHeight, 'Net catch weight in kg');
    tableHeadSix.end();

    const tableHeadSeven = doc.struct('TH');
    tableHeadRow.add(tableHeadSeven);
    const headSevenContent = doc.markStructureContent('TH');
    tableHeadSeven.add(headSevenContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 450, startY + 48, 80, cellHeight, 'Verified weight landed (net catch weight in kg)');
    tableHeadSeven.end();

    tableHeadRow.end();
    tableHead.end();

    const tableBody = doc.struct('TBody');
    myTable.add(tableBody);

    let y = startY + 48 + cellHeight;
    let listLimit = 6;
    if (arrLength > 6) {
        listLimit = 0;
    }

    for (let rowIdx = 0; rowIdx < listLimit; rowIdx++) {
        const tableBodyRow = doc.struct('TR');
        tableBody.add(tableBodyRow);

        const hasData = rowIdx < arrLength;
        let speciesText = '';
        let commodityCodeText = '';
        let datesText = '';
        let catchAreasText = '';
        
        if (hasData) {
            const row = rowData[rowIdx];
            speciesText = `${row.species}`;
            commodityCodeText = `${row.commodityCode}`;
            datesText = `${row.dates}`;
            const rfmoAcronym = row.rfmo?.match(/\(([^)]{1,10})\)/) ? row.rfmo.match(/\(([^)]{1,10})\)/)[1] : '';
            const eezText = row.exclusiveEconomicZones?.map(eez => eez.isoCodeAlpha2).join(', ') || '';
            const highSeasText = row.highSeasArea === 'Yes' ? 'High Seas' : '';
            catchAreasText = [row.catchAreas, eezText, rfmoAcronym, highSeasText].filter(Boolean).join('\n');
        }

        const TdOne = doc.struct('TD');
        tableBodyRow.add(TdOne);
        const TdOneContent = doc.markStructureContent('TD');
        TdOne.add(TdOneContent);
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, y, 110, PdfStyle.ROW.HEIGHT + 30, speciesText);
        TdOne.end();

        const TdTwo = doc.struct('TD');
        tableBodyRow.add(TdTwo);
        const TdTwoContent = doc.markStructureContent('TD');
        TdTwo.add(TdTwoContent);
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 125, y, 55, PdfStyle.ROW.HEIGHT + 30, commodityCodeText);
        TdTwo.end();

        const TdThree = doc.struct('TD');
        tableBodyRow.add(TdThree);
        const TdThreeContent = doc.markStructureContent('TD');
        TdThree.add(TdThreeContent);
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 180, y, 80, PdfStyle.ROW.HEIGHT + 30, catchAreasText, 4);
        TdThree.end();

        const TdFour = doc.struct('TD');
        tableBodyRow.add(TdFour);
        const TdFourContent = doc.markStructureContent('TD');
        TdFour.add(TdFourContent);
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 260, y, 80, PdfStyle.ROW.HEIGHT + 30, datesText, 2);
        TdFour.end();

        const TdFive = doc.struct('TD');
        tableBodyRow.add(TdFive);
        const TdFiveContent = doc.markStructureContent('TD');
        TdFive.add(TdFiveContent);
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 340, y, 55, PdfStyle.ROW.HEIGHT + 30);
        TdFive.end();

        const TdSix = doc.struct('TD');
        tableBodyRow.add(TdSix);
        const TdSixContent = doc.markStructureContent('TD');
        TdSix.add(TdSixContent);
        const exportWeightText = getExportWeightText(rowIdx, arrLength, rowData);
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 395, y, 55, PdfStyle.ROW.HEIGHT + 30, exportWeightText);
        TdSix.end();

        const TdSeven = doc.struct('TD');
        tableBodyRow.add(TdSeven);
        const TdSevenContent = doc.markStructureContent('TD');
        TdSeven.add(TdSevenContent);
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 450, y, 80, PdfStyle.ROW.HEIGHT + 30);
        TdSeven.end();

        tableBodyRow.end();
        y += PdfStyle.ROW.HEIGHT + 30;
    }
    doc.endMarkedContent();


    if (arrLength > 6) {
        cellHeight = PdfStyle.ROW.HEIGHT * 6;
        const seeScheduleRow = doc.struct('TR', () => {
            PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, y, 515, cellHeight, 'SEE SCHEDULE (' + allRowsLength + ' rows)');
        });
        tableBody.add(seeScheduleRow);
        seeScheduleRow.end();
    }

    tableBody.end();
    myTable.end();
    PdfUtils.separator(doc, startY + 388);
};

const section2 = (doc, data, startY) => {
    // How many fishing vessels?
    let vesselCounts = {};
    let items = [];
    if (data.exportPayload?.items) {
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

    let imoNumberOrCfr = getImoOrCfr(vesselCounts, data);
    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 285, startY + 18, 'IMO number or other');
    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 285, startY + 30, 'unique vessel identifier');
    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 285, startY + 42, '(if applicable)');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 400, startY + 26, 130, PdfStyle.ROW.HEIGHT, imoNumberOrCfr);

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 15, startY + 54, 'Fishing Licence No.');

    let ln = '';
    let lvt = '';
    if (Object.keys(vesselCounts).length === 1) {
        ln = items[0].landings[0].model.vessel.licenceNumber;
        if (items[0].landings[0].model.vessel.licenceValidTo) {
            lvt = moment(items[0].landings[0].model.vessel.licenceValidTo, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY');
        }
    }
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 120, startY + 52, 220, PdfStyle.ROW.HEIGHT, ln ?? '');

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 350, startY + 54, 'Valid to');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 400, startY + 52, 130, PdfStyle.ROW.HEIGHT, lvt ?? '');


    function getFishingGear(exportPayload) {
        const firstLanding = exportPayload?.items?.[0]?.landings?.[0];
        return firstLanding?.model?.gearType ?? '';
    }
    let fishingGearText = isMultiVessel(data.exportPayload) ? 'Multiple vessels - SEE SCHEDULE' : getFishingGear(data.exportPayload);

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 15, startY + 77, 'Fishing Gear');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 120, startY + 77, 410, PdfStyle.ROW.HEIGHT, fishingGearText ?? '');

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 15, startY + 100, 'Inmarsat No. Telefax No. Telephone No. E-mail address (if issued)');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, startY + 112, 515, PdfStyle.ROW.HEIGHT);

    PdfUtils.separator(doc, startY + 137);
};

const section1 = (doc, data, isSample, startY) => {
    doc.fontSize(PdfStyle.FONT_SIZE.MEDIUM);
    doc.addStructure(doc.struct('H3', {}, () => {
        doc.text('(i) CATCH CERTIFICATE', PdfStyle.MARGIN.LEFT, startY);
    }));
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
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 65, startY + 58, 465, PdfStyle.ROW.HEIGHT * 2 + 5, 'Tyneside House, Skinnerburn Rd, Newcastle upon Tyne, United Kingdom. NE4 7AR');

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 65, startY + 100, 'Tel.');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 90, startY + 98, 200, PdfStyle.ROW.HEIGHT, '0300 123 1032');

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 300, startY + 100, 'Email');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 330, startY + 98, 200, PdfStyle.ROW.HEIGHT, 'ukiuuslo@marinemanagement.org.uk');

    PdfUtils.separator(doc, startY + 123);

};

const mvsHeadingCell = ({doc, x, y, width, height, text}, isBold, fontSize, align, lineColor, textColor, bgColour) => {
    if (!text || Array.isArray(text)) {
        mvsCell({doc, x, y, width, height, topPad: height / 3, textArr: text}, isBold, fontSize, align, lineColor, textColor, bgColour);
    } else {
        let textArr = [text];
        mvsCell({doc, x, y, width, height, topPad: height / 3, textArr}, isBold, fontSize, align, lineColor, textColor, bgColour);
    }
};

const mvsTableCell = ({doc, x, y, width, height, text}, isBold, fontSize, align, lineColor, textColor, bgColour) => {
    if (!text || Array.isArray(text)) {
        return mvsCell({doc, x, y, width, height, topPad: 4, textArr: text}, isBold, fontSize, align, lineColor, textColor, bgColour);
    } else {
        let textArr = [text];
       return mvsCell({doc, x, y, width, height, topPad: 4, textArr}, isBold, fontSize, align, lineColor, textColor, bgColour);
    }
};

const mvsCell = ({doc, x, y, width, height, topPad, textArr}, isBold, fontSize, align, lineColor, textColor, bgColour) => {
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