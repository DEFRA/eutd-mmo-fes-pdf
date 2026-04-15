/* eslint-disable no-magic-numbers */
const path = require('node:path');
const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const moment = require('moment');
const CommonUtils = require('../utils/common-utils');

const DATE_FORMAT = 'DD/MM/YYYY';
const MAIN_PAGE_ONE_SECTION_1_OFFSET = 70;
const MAIN_PAGE_ONE_SECTION_2_OFFSET = 203;
const MAIN_PAGE_ONE_SECTION_3_OFFSET = 350;
const MAIN_PAGE_TWO_SECTION_5_OFFSET = 62;
const MAIN_PAGE_TWO_SECTION_6_OFFSET = 117;
const MAIN_PAGE_TWO_SECTION_7_OFFSET = 257;
const MAIN_PAGE_TWO_SECTION_8_OFFSET = 476;
const MAIN_PAGE_TWO_SECTION_9_OFFSET = 625;
const MAIN_PAGE_TWO_SECTION_10_OFFSET = 691;
const MAIN_PAGE_THREE_SECTION_11_OFFSET = 12;
const MAIN_PAGE_FIVE_SECTION_14_OFFSET = 50;
const MAIN_PAGE_FIVE_SECTION_15_OFFSET = 260;
const MAIN_PAGE_FIVE_SECTION_16_OFFSET = 380;
const MAIN_PAGE_FIVE_SECTION_17_OFFSET = 510;
const APPENDIX_TRANSPORT_OFFSET = 22;
const APPENDIX_END_OFFSET = 310;
const APPENDIX_QR_X_OFFSET = 20;
const APPENDIX_QR_Y_OFFSET = 680;
const WATERMARK_X_OFFSET = 70;
const WATERMARK_Y_OFFSET = 70;
const MULTI_VESSEL_THRESHOLD = 6;
const PAGE_NUMBER_ONE = 1;
const PAGE_NUMBER_TWO = 2;
const IMO_IDENTIFIER_LABEL = 'IMO number or other unique vessel identifier (if applicable)';
const PAGE_NUMBER_THREE = 3;
const PAGE_NUMBER_FOUR = 4;
const PAGE_NUMBER_FIVE = 5;
const PAGE_NUMBER_SIX = 6;
const YES_NO_AS_APPROPRIATE = 'Yes/No (as appropriate)';


const { end, appendixHeading, appendixTransportDetails, generateSection11 } = require('./renderExportCert-sections-a');
const { section7, section8, section9, section10, section11, section12, section13, section14, section15, section16, section17 } = require('./renderExportCert-sections-b');
const { getCatchDates, getLandingDetail, getVesselCount, isMultiVessel, getProductScheduleRows, getImoOrCfrForMultiVesselSchedule, section1, section2, section3, section4, section5, section6 } = require('./renderExportCert-sections-c');

function addMainCertificatePages(doc, data, isSample, buff) {
    // Page 1: Sections 1-3
    section1(doc, data, isSample, PdfStyle.MARGIN.TOP + MAIN_PAGE_ONE_SECTION_1_OFFSET);
    section2(doc, data, PdfStyle.MARGIN.TOP + MAIN_PAGE_ONE_SECTION_2_OFFSET);
    section3(doc, data, PdfStyle.MARGIN.TOP + MAIN_PAGE_ONE_SECTION_3_OFFSET);
    PdfUtils.endOfPage(doc, PAGE_NUMBER_ONE);

    // Page 2: Sections 4-10
    doc.addPage();
    section4(doc, data, PdfStyle.MARGIN.TOP);
    section5(doc, data, PdfStyle.MARGIN.TOP + MAIN_PAGE_TWO_SECTION_5_OFFSET);
    section6(doc, data, PdfStyle.MARGIN.TOP + MAIN_PAGE_TWO_SECTION_6_OFFSET);
    isSample ?? CommonUtils.addSampleWatermark(doc);

    section7(doc, data, PdfStyle.MARGIN.TOP + MAIN_PAGE_TWO_SECTION_7_OFFSET);
    section8(doc, data, isSample, buff, PdfStyle.MARGIN.TOP + MAIN_PAGE_TWO_SECTION_8_OFFSET);
    section9(doc, data, isSample, buff, PdfStyle.MARGIN.TOP + MAIN_PAGE_TWO_SECTION_9_OFFSET);
    section10(doc, data, PdfStyle.MARGIN.TOP + MAIN_PAGE_TWO_SECTION_10_OFFSET);
    isSample ?? CommonUtils.addSampleWatermark(doc);
    PdfUtils.endOfPage(doc, PAGE_NUMBER_TWO);

    doc.addPage();
    section11(doc, data, PdfStyle.MARGIN.TOP - MAIN_PAGE_THREE_SECTION_11_OFFSET);
    isSample ?? CommonUtils.addSampleWatermark(doc);
    PdfUtils.endOfPage(doc, PAGE_NUMBER_THREE);

    doc.addPage();
    section12(doc, data, PdfStyle.MARGIN.TOP);
    isSample ?? CommonUtils.addSampleWatermark(doc);
    PdfUtils.endOfPage(doc, PAGE_NUMBER_FOUR);
    doc.addPage();
    section13(doc, data, PdfStyle.MARGIN.TOP);
    section14(doc, data, PdfStyle.MARGIN.TOP + MAIN_PAGE_FIVE_SECTION_14_OFFSET);
    section15(doc, data, PdfStyle.MARGIN.TOP + MAIN_PAGE_FIVE_SECTION_15_OFFSET);
    section16(doc, data, PdfStyle.MARGIN.TOP + MAIN_PAGE_FIVE_SECTION_16_OFFSET);
    section17(doc, data, PdfStyle.MARGIN.TOP + MAIN_PAGE_FIVE_SECTION_17_OFFSET);
    isSample ?? CommonUtils.addSampleWatermark(doc);
    PdfUtils.endOfPage(doc, PAGE_NUMBER_FIVE);

    doc.addPage();
    appendixHeading(doc, PdfStyle.MARGIN.TOP);
    appendixTransportDetails(doc, data, PdfStyle.MARGIN.TOP + APPENDIX_TRANSPORT_OFFSET);
    end(doc, PdfStyle.MARGIN.TOP + APPENDIX_END_OFFSET);
    const shouldGenerateQRCode = !data.isBlankTemplate && !isSample;
    if (shouldGenerateQRCode) {
        PdfUtils.qrCode(doc, buff, PdfStyle.MARGIN.LEFT + APPENDIX_QR_X_OFFSET, PdfStyle.MARGIN.TOP + APPENDIX_QR_Y_OFFSET);
    }
    isSample ?? CommonUtils.addSampleWatermark(doc);
    PdfUtils.endOfPage(doc, PAGE_NUMBER_SIX);
}
function processBlankTemplate(data, doc, isDictionaryTabs, isSample, buff) {
    const pageSize = 14;
    const numPages = 3;
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
            const pageSize = 8;
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
            isSample ?? CommonUtils.addSampleWatermark(doc, WATERMARK_X_OFFSET, WATERMARK_Y_OFFSET);
                page += 1;

            if (isDictionaryTabs) {
                  doc.page.dictionary.data.Tabs = 'S';
                }
            }
        }
    }


function getMultiVesselDocumentNumber(data, isSample) {
    if (data.isBlankTemplate) {
        return '';
    }

    if (isSample) {
        return '###-####-##-#########';
    }

    return data.documentNumber;
}

function getMultiVesselTodayDate(data) {
    if (data.isBlankTemplate) {
        return '';
    }

    return PdfUtils.todaysDate();
}

function renderMultiVesselTopSection(doc, data, isSample, buff, startY) {
    const imageFile = path.join(__dirname, '../resources/hmgovlogo.png');
    doc.addStructure(doc.struct('Figure', {
        alt: 'HM Government logo'
    }, () => {
        doc.image(imageFile, /*PdfStyle.MARGIN.LEFT, PdfStyle.MARGIN.TOP,*/ {
            width: 220
        });
    }));

    const documentNumber = getMultiVesselDocumentNumber(data, isSample);
    const todaysDate = getMultiVesselTodayDate(data);

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

    mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT + 90, y: yPos, width: 140, height: cellHeight, text: documentNumber}, true, PdfStyle.FONT_SIZE.SMALL, 'center', '#767676', '#353535', '#ffffff');
    mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT + 230, y: yPos, width: 270, height: cellHeight, text: null}, true, PdfStyle.FONT_SIZE.SMALL, 'center', '#767676', '#353535', '#ffffff');

    cellHeight = PdfStyle.ROW.HEIGHT * 4 + 25;

    mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT + 500, y: yPos, width: 80, height: cellHeight, text: ['UK Authority', 'QR Code']}, true, PdfStyle.FONT_SIZE.SMALL, 'center', '#767676', '#353535', '#ffcc00');
    mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT + 580, y: yPos, width: 200, height: cellHeight, text: null}, true, PdfStyle.FONT_SIZE.SMALL, 'center', '#767676', '#353535', '#ffffff');

    yPos = yPos + PdfStyle.ROW.HEIGHT * 2 + 20;
    cellHeight = PdfStyle.ROW.HEIGHT * 2 + 5;

    mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT, y: yPos, width: 90, height: cellHeight, text: 'Date'}, true, PdfStyle.FONT_SIZE.SMALL, 'center', '#767676', '#353535', '#ffcc00');
    mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT + 90, y: yPos, width: 140, height: cellHeight, text: todaysDate}, true, PdfStyle.FONT_SIZE.SMALL, 'center', '#767676', '#353535', '#ffffff');
    mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT + 230, y: yPos, width: 270, height: cellHeight, text: null}, true, PdfStyle.FONT_SIZE.SMALL, 'center', '#767676', '#353535', '#ffffff');

    if (!data.isBlankTemplate && !isSample) {
        PdfUtils.qrCode(doc, buff, PdfStyle.MARGIN.LEFT + 590, yPos - 45);
    }

    return yPos + cellHeight + 10;
}

function renderMultiVesselTableHead(doc, myTable, yPos, cellHeight) {
    const headerSpecs = [
        { left: 0, width: 85, text: 'Species' },
        { left: 85, width: 60, text: ['Presentation'] },
        { left: 145, width: 50, text: ['Product', 'code'] },
        { left: 195, width: 60, text: ['Catch Date(s)', '(from-to)'] },
        { left: 255, width: 50, text: ['Estimated weight to be landed in kg'] },
        { left: 305, width: 50, text: ['Net catch', 'weight in kg'] },
        { left: 355, width: 65, text: ['Verified weight landed(net catch weight in kg)'] },
        { left: 420, width: 60, text: ['Vessel name and PLN / Callsign'] },
        { left: 480, width: 70, text: [IMO_IDENTIFIER_LABEL] },
        { left: 550, width: 70, text: 'Master / Licence Holder' },
        { left: 620, width: 80, text: ['Licence Number /', 'Flag-Homeport'] },
        { left: 700, width: 40, text: ['FAO', 'AREA'] },
        { left: 740, width: 40, text: ['Fishing', 'Gear'] },
    ];

    const tableHead = doc.struct('THead');
    myTable.add(tableHead);
    const tableHeadRow = doc.struct('TR');
    tableHead.add(tableHeadRow);

    headerSpecs.forEach((spec) => {
        const headerCell = doc.struct('TH');
        tableHeadRow.add(headerCell);
        const headerCellContent = doc.markStructureContent('TH');
        headerCell.add(headerCellContent);
        mvsTableCell({doc, x: PdfStyle.MARGIN.LEFT + spec.left, y: yPos, width: spec.width, height: cellHeight, text: spec.text}, true, PdfStyle.FONT_SIZE.SMALLER, 'center', '#767676', '#353535', '#ffff00');
        headerCell.end();
    });

    tableHeadRow.end();
    tableHead.end();
}

function getMultiVesselPageMetrics(rows, data, page, pageSize) {
    let pageCount = Math.ceil(rows.length / pageSize);
    if (data.isBlankTemplate) {
        pageCount = 3;
    }

    const fromIdx = (page - 1) * pageSize;
    let numDataRows = pageSize;
    if (fromIdx + numDataRows > rows.length) {
        numDataRows = rows.length - fromIdx;
    }

    return {
        pageCount,
        fromIdx,
        rowDataLimit: fromIdx + numDataRows,
    };
}

const multiVesselScheduleHeading = (doc, data, isSample, buff, page, pageSize, startY) => {
    let yPos = renderMultiVesselTopSection(doc, data, isSample, buff, startY);
    let cellHeight = PdfStyle.ROW.HEIGHT * 3 + 5;

    const myTable = doc.struct('Table');
    doc.addStructure(myTable);
    renderMultiVesselTableHead(doc, myTable, yPos, cellHeight);

    yPos = yPos + cellHeight;

    const rows = getProductScheduleRows(data.exportPayload);
    const { pageCount, fromIdx, rowDataLimit } = getMultiVesselPageMetrics(rows, data, page, pageSize);

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
        mvsTableCell({doc, x: PdfStyle.MARGIN.LEFT, y: yPos, width: 780, height: PdfStyle.ROW.HEIGHT, text: `Page ${page} of ${pageCount}`}, true, PdfStyle.FONT_SIZE.SMALLER, 'left', '#767676', '#353535', '#ffffff');
    });
    tableBody.add(pageCountRow);
    pageCountRow.end();

    tableBody.end();
    myTable.end();
};

const renderMvsTableCell = (tableBodyRow, doc, leftOffset, width, yPos, cellHeight, text) => {
    const td = doc.struct('TD');
    tableBodyRow.add(td);
    const tdContent = doc.markStructureContent('TD');
    td.add(tdContent);
    mvsTableCell(
        { doc, x: PdfStyle.MARGIN.LEFT + leftOffset, y: yPos, width, height: cellHeight, text },
        false,
        PdfStyle.FONT_SIZE.SMALLER,
        'left',
        '#767676',
        '#353535',
        '#ffffff'
    );
    td.end();
};

const getMvsRowFieldValue = (row, field, hasData) => {
    if (!hasData) {
        return '';
    }

    switch (field) {
        case 'exportWeight':
            return `${Number(row.exportWeight).toFixed(2)}`;
        case 'vessel':
            return `${row.vessel} (${row.pln})`;
        case 'imoOrCfr':
            return `${getImoOrCfrForMultiVesselSchedule(row)}`;
        case 'licenceDetail':
            return `${row.licenceDetail} ${row.homePort}`;
        case 'gearCode':
            return row.gearCode ? `${row.gearCode}` : '';
        default:
            return row[field] ? `${row[field]}` : '';
    }
};

const generateMultiVesselTableRows = (tableBodyRow, doc, yPos, cellHeight, rowIdx, rowDataLimit, rows) => {
    const hasData = rowIdx < rowDataLimit;
    const row = hasData ? rows[rowIdx] : null;
    const columnSpecs = [
        { leftOffset: 0, width: 85, field: 'species' },
        { leftOffset: 85, width: 60, field: 'presentation' },
        { leftOffset: 145, width: 50, field: 'commodityCode' },
        { leftOffset: 195, width: 60, field: 'dateLanded' },
        { leftOffset: 255, width: 50, field: 'estimatedWeight' },
        { leftOffset: 305, width: 50, field: 'exportWeight' },
        { leftOffset: 355, width: 65, field: 'verifiedWeight' },
        { leftOffset: 420, width: 60, field: 'vessel' },
        { leftOffset: 480, width: 70, field: 'imoOrCfr' },
        { leftOffset: 550, width: 70, field: 'licenceHolder' },
        { leftOffset: 620, width: 80, field: 'licenceDetail' },
        { leftOffset: 700, width: 40, field: 'faoArea' },
        { leftOffset: 740, width: 40, field: 'gearCode' },
    ];

    columnSpecs.forEach(({ leftOffset, width, field }) => {
        const fieldValue = getMvsRowFieldValue(row, field, hasData);
        renderMvsTableCell(tableBodyRow, doc, leftOffset, width, yPos, cellHeight, fieldValue);
    });
};


const mvsHeadingCell = ({doc, x, y, width, height, text}, isBold, fontSize, align, lineColor, textColor, bgColour) => {
    if (!text || Array.isArray(text)) {
        mvsCell({doc, x, y, width, height, topPad: height / 3, textArr: text}, isBold, fontSize, align, lineColor, textColor, bgColour);
    } else {
        const textArr = [text];
        mvsCell({doc, x, y, width, height, topPad: height / 3, textArr}, isBold, fontSize, align, lineColor, textColor, bgColour);
    }
};

const mvsTableCell = ({doc, x, y, width, height, text}, isBold, fontSize, align, lineColor, textColor, bgColour) => {
    if (!text || Array.isArray(text)) {
        return mvsCell({doc, x, y, width, height, topPad: 4, textArr: text}, isBold, fontSize, align, lineColor, textColor, bgColour);
    } else {
        const textArr = [text];
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
        const arrlength = textArr.length;
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


module.exports = {
    addMainCertificatePages,
    processBlankTemplate,
    processMultiData,
};
