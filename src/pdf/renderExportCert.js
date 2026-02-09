const path = require('path');
// Date format constant to avoid duplication (SonarQube S1192)
const DATE_FORMAT_DDMMYYYY = 'DD/MM/YYYY';
const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const moment = require('moment');
const CommonUtils = require('../utils/common-utils');

// Constants for multi-vessel schedule calculations
const MIN_ROW_HEIGHT_MULTIPLIER = 3;
const MIN_HEIGHT_ADJUSTMENT = 5;
const LICENCE_HOLDER_COLUMN_WIDTH = 45;
const HEIGHT_BUFFER_MULTIPLIER = 1.15;
const LICENCE_DETAIL_COLUMN_WIDTH = 75;
const UK_HEADER_X_OFFSET = 430;
const LICENCE_HOLDER_X_OFFSET = 540;
const LICENCE_DETAIL_X_OFFSET = 585;
const CHAR_WIDTH_MULTIPLIER = 0.55;
const DOCUMENT_NUMBER_SECTION_HEIGHT_OFFSET = 20;
const QR_CODE_SECTION_HEIGHT_OFFSET = 25;
const DATE_SECTION_HEIGHT_OFFSET = 5;
const TABLE_HEADER_ROW_HEIGHT_MULTIPLIER = 3;
const TABLE_HEADER_HEIGHT_OFFSET = 14;

// Constant for document number section width to avoid magic numbers
const DOCUMENT_NUMBER_SECTION_WIDTH = 90;

// Constant for multi-vessel schedule header column offset
const MVS_HEADER_SECOND_COL_X = 230;

// Page section offset constants
const SECTION14_Y_OFFSET = 70;
const SECTION15_Y_OFFSET = 280;
const SECTION16_Y_OFFSET = 400;
const SECTION17_Y_OFFSET = 530;
const APPENDIX_TRANSPORT_Y_OFFSET = 40;

// Text constants
const IMO_VESSEL_IDENTIFIER_TEXT = 'IMO number or other unique vessel identifier (if applicable)';

// Multi-vessel schedule table column positions (x-offset from MARGIN.LEFT)
const MVS_COL_SPECIES_X = 0;
const MVS_COL_PRESENTATION_X = 75;
const MVS_COL_PRODUCT_CODE_X = 135;
const MVS_COL_CATCH_DATE_X = 185;
const MVS_COL_EST_WEIGHT_X = 245;
const MVS_COL_NET_WEIGHT_X = 300;
const MVS_COL_VERIFIED_WEIGHT_X = 350;
const MVS_COL_VESSEL_NAME_X = 405;
const MVS_COL_IMO_X = 470;
const MVS_COL_CATCH_AREA_X = 660;
const MVS_COL_FISHING_GEAR_X = 735;

// Multi-vessel schedule table column widths
const MVS_COL_SPECIES_WIDTH = 75;
const MVS_COL_PRESENTATION_WIDTH = 60;
const MVS_COL_PRODUCT_CODE_WIDTH = 50;
const MVS_COL_CATCH_DATE_WIDTH = 60;
const MVS_COL_EST_WEIGHT_WIDTH = 55;
const MVS_COL_NET_WEIGHT_WIDTH = 50;
const MVS_COL_VERIFIED_WEIGHT_WIDTH = 55;
const MVS_COL_VESSEL_NAME_WIDTH = 65;
const MVS_COL_IMO_WIDTH = 70;
const MVS_COL_CATCH_AREA_WIDTH = 75;
const MVS_COL_FISHING_GEAR_WIDTH = 45;

// Constant for maximum number of lines before multi-vessel schedule is triggered
const MAX_SINGLE_VESSEL_LINES = 6;

const renderPage1 = (doc, data, isSample) => {
    const SECTION1_Y_OFFSET = 70;
    const SECTION2_Y_OFFSET = 203;
    const SECTION3_Y_OFFSET = 350;
    const PAGE_1 = 1;

    PdfUtils.heading(doc, 'Catch and Re-Export Certificate');
    section1(doc, data, isSample, PdfStyle.MARGIN.TOP + SECTION1_Y_OFFSET);
    section2(doc, data, PdfStyle.MARGIN.TOP + SECTION2_Y_OFFSET);
    section3(doc, data, PdfStyle.MARGIN.TOP + SECTION3_Y_OFFSET);
    PdfUtils.endOfPage(doc, PAGE_1);
};

const renderPage2 = (doc, data, isSample, buff) => {
    const SECTION5_Y_OFFSET = 62;
    const SECTION6_Y_OFFSET = 117;
    const SECTION7_Y_OFFSET = 257;
    const SECTION8_Y_OFFSET = 476;
    const SECTION9_Y_OFFSET = 625;
    const SECTION10_Y_OFFSET = 691;
    const PAGE_2 = 2;

    doc.addPage();
    section4(doc, data, PdfStyle.MARGIN.TOP);
    section5(doc, data, PdfStyle.MARGIN.TOP + SECTION5_Y_OFFSET);
    section6(doc, PdfStyle.MARGIN.TOP + SECTION6_Y_OFFSET);
    isSample ?? CommonUtils.addSampleWatermark(doc);

    section7(doc, PdfStyle.MARGIN.TOP + SECTION7_Y_OFFSET);
    section8(doc, data, PdfStyle.MARGIN.TOP + SECTION8_Y_OFFSET);
    section9(doc, data, isSample, buff, PdfStyle.MARGIN.TOP + SECTION9_Y_OFFSET);
    section10(doc, PdfStyle.MARGIN.TOP + SECTION10_Y_OFFSET);
    isSample ?? CommonUtils.addSampleWatermark(doc);
    PdfUtils.endOfPage(doc, PAGE_2);
};

const renderPage3 = (doc, isSample) => {
    const SECTION11_Y_OFFSET = 12;
    const PAGE_3 = 3;

    doc.addPage();
    section11(doc, PdfStyle.MARGIN.TOP - SECTION11_Y_OFFSET);
    isSample ?? CommonUtils.addSampleWatermark(doc);
    PdfUtils.endOfPage(doc, PAGE_3);
};

const renderPage4 = (doc, isSample) => {
    const SECTION13_Y_OFFSET = 100;
    const PAGE_4 = 4;

    doc.addPage();
    section12(doc, PdfStyle.MARGIN.TOP);
    isSample ?? CommonUtils.addSampleWatermark(doc);
    section13(doc, PdfStyle.MARGIN.TOP + SECTION13_Y_OFFSET);
    PdfUtils.endOfPage(doc, PAGE_4);
};

const renderPage5 = (doc, isSample) => {
    const PAGE_5 = 5;

    doc.addPage();
    reExportCertificateHeader(doc,PdfStyle.MARGIN.TOP);
    section14(doc, PdfStyle.MARGIN.TOP + SECTION14_Y_OFFSET);
    section15(doc, PdfStyle.MARGIN.TOP + SECTION15_Y_OFFSET);
    section16(doc, PdfStyle.MARGIN.TOP + SECTION16_Y_OFFSET);
    section17(doc, PdfStyle.MARGIN.TOP + SECTION17_Y_OFFSET);
    isSample ?? CommonUtils.addSampleWatermark(doc);
    PdfUtils.endOfPage(doc, PAGE_5);
};

const renderPage6 = (doc, data, isSample) => {
    const PAGE_6 = 6;

    doc.addPage();
    appendixHeading(doc, PdfStyle.MARGIN.TOP);
    appendixTransportDetails(doc, data, PdfStyle.MARGIN.TOP + APPENDIX_TRANSPORT_Y_OFFSET);
    isSample ?? CommonUtils.addSampleWatermark(doc);
    PdfUtils.endOfPage(doc, PAGE_6);
};

const renderPage7 = (doc, data, isSample, buff) => {
    const PAGE_7 = 7;

    doc.addPage();
    appendixExporterAndImportDetails(doc, data, isSample, buff, PdfStyle.MARGIN.TOP);
    isSample ?? CommonUtils.addSampleWatermark(doc);
    PdfUtils.endOfPage(doc, PAGE_7);
};

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

    renderPage1(doc, data, isSample);
    renderPage2(doc, data, isSample, buff);
    renderPage3(doc, isSample);
    renderPage4(doc, isSample);
    renderPage5(doc, isSample);
    renderPage6(doc, data, isSample);
    renderPage7(doc, data, isSample, buff);

    const isDictionaryTabs = !doc.page.dictionary.Tabs;

    if (data.isBlankTemplate) {
        processBlankTemplate(data, doc, isDictionaryTabs, isSample, buff);
    } else {
        processMultiData(data, doc, isDictionaryTabs, isSample, buff);
    }

    doc.end();
};

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

const calculateRowHeight = (row) => {
    const licenceHolderText = row.licenceHolder || '';
    const licenceDetailText = `${row.licenceDetail || ''} ${row.homePort || ''}`;
    
    const minHeight = (PdfStyle.ROW.HEIGHT * MIN_ROW_HEIGHT_MULTIPLIER) - MIN_HEIGHT_ADJUSTMENT;
    const licenceHolderHeight = calculateRequiredCellHeightStatic(licenceHolderText, LICENCE_HOLDER_COLUMN_WIDTH, PdfStyle.FONT_SIZE.SMALLER);
    const licenceDetailHeight = calculateRequiredCellHeightStatic(licenceDetailText, LICENCE_DETAIL_COLUMN_WIDTH, PdfStyle.FONT_SIZE.SMALLER);
    
    return Math.max(minHeight, licenceHolderHeight, licenceDetailHeight);
};

const calculateMaxRowHeightForLicenceHolder = (rows) => {
    const minHeight = (PdfStyle.ROW.HEIGHT * MIN_ROW_HEIGHT_MULTIPLIER) - MIN_HEIGHT_ADJUSTMENT;
    let maxHeight = minHeight;
    
    for (const row of rows) {
        const licenceHolderText = row.licenceHolder || '';
        const licenceHolderHeight = calculateRequiredCellHeightStatic(licenceHolderText, LICENCE_HOLDER_COLUMN_WIDTH, PdfStyle.FONT_SIZE.SMALLER);
        maxHeight = Math.max(maxHeight, licenceHolderHeight);
    }
    return maxHeight * HEIGHT_BUFFER_MULTIPLIER;
};

const calculatePageDimensions = () => {
    const pageHeight = 595;
    const bottomMargin = 30;
    const rowsStartY = 229;
    const pageCountHeight = 20;
    const safetyMargin = 15;
    
    return pageHeight - rowsStartY - bottomMargin - pageCountHeight - safetyMargin;
};

const paginateRows = (rows, availableHeight) => {
    const pages = [];
    let currentPageRows = [];
    let currentPageHeight = 0;
    
    // Calculate the maximum height required for the Master/Licence Holder column across all rows
    const maxLicenceHolderHeight = calculateMaxRowHeightForLicenceHolder(rows);
    
    for (let i = 0; i < rows.length; i++) {
        // Use the maximum height for all rows to ensure uniform row height
        const tempHeight = maxLicenceHolderHeight;
        
        if (currentPageHeight + tempHeight > availableHeight && currentPageRows.length > 0) {
            pages.push({ 
                rows: currentPageRows, 
                startIdx: pages.length === 0 ? 0 : pages.at(-1).startIdx + pages.at(-1).rows.length 
            });
            currentPageRows = [];
            currentPageHeight = 0;
        }
        
        currentPageRows.push({ index: i, height: tempHeight });
        currentPageHeight += tempHeight;
    }
    
    if (currentPageRows.length > 0) {
        pages.push({ 
            rows: currentPageRows, 
            startIdx: pages.length === 0 ? 0 : pages.at(-1).startIdx + pages.at(-1).rows.length 
        });
    }
    
    return pages;
};

// Define a constant for the watermark offset to avoid magic numbers
const WATERMARK_OFFSET_X = 70;
const WATERMARK_OFFSET_Y = 70;

const renderMultiVesselPages = (doc, data, pages, rows, isDictionaryTabs, isSample, buff) => {
    const maxPages = pages.length;
    
    for (let pageNum = 0; pageNum < maxPages; pageNum++) {
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
        
        const currentPage = pages[pageNum];
        multiVesselScheduleHeadingDynamic(doc, data, isSample, buff, {
            pageNum: pageNum + 1,
            currentPage,
            allRows: rows,
            totalPages: maxPages,
            startY: PdfStyle.MARGIN.TOP
        });
        isSample ?? CommonUtils.addSampleWatermark(doc, WATERMARK_OFFSET_X, WATERMARK_OFFSET_Y);

        if (isDictionaryTabs) {
            doc.page.dictionary.data.Tabs = 'S';
        }
    }
};

function processMultiData(data, doc, isDictionaryTabs, isSample, buff) {
    if (isMultiVessel(data.exportPayload)) {
        const rows = getProductScheduleRows(data.exportPayload);
        const availableHeight = calculatePageDimensions();
        const pages = paginateRows(rows, availableHeight);
        
        renderMultiVesselPages(doc, data, pages, rows, isDictionaryTabs, isSample, buff);
    }
}

function getVesselCount(exportPayload){
    let items = [];

    if (exportPayload?.items) {
        items =  exportPayload.items;
    }

    const vesselCounts = {};
    let catchLength = 0;    // calculate number of lines. so we can calculate number of maxPages

    items.forEach((item) => {
        item.landings.forEach((landing) => {
            vesselCounts[landing.model.vessel.vesselName + landing.model.vessel.pln + landing.model.vessel.licenceNumber] = (vesselCounts[landing.model.vessel.vesselName + landing.model.vessel.pln + landing.model.vessel.licenceNumber]?? 0) + 1;
            catchLength += 1;
        })
    });

    return { vesselCounts, catchLength };
}

function isMultiVessel(exportPayload){
    const { vesselCounts, catchLength } = getVesselCount(exportPayload);
    return Object.keys(vesselCounts).length > 1 || catchLength > MAX_SINGLE_VESSEL_LINES;
}

function getCatchDates(startDate, dateLanded){
    const formattedStartDate = startDate ? moment(startDate).format(DATE_FORMAT_DDMMYYYY) : null;
    const formattedDateLanded = moment(dateLanded).format(DATE_FORMAT_DDMMYYYY);
    return formattedStartDate ? `${formattedStartDate} - ${formattedDateLanded}` : formattedDateLanded;
}

function getLandingDetail(vessel) {
    let landingDetail = vessel.licenceNumber ?? '';
    if (landingDetail && vessel.licenceValidTo) {
        const dte = moment(vessel.licenceValidTo).format(DATE_FORMAT_DDMMYYYY);
        landingDetail = `${landingDetail} - ${dte}`;
    }
    return landingDetail;
}

function buildProductRow(item, landing, faoArea, landingDetail) {
    return {
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
        exclusiveEconomicZones: landing.model.exclusiveEconomicZones,
        rfmo: landing.model.rfmo,
        highSeasArea: landing.model.highSeasArea,
        homePort: landing.model.vessel.homePort ?? '',
        imo: landing.model.vessel.imoNumber ?? '',
        cfr: landing.model.vessel.cfr ?? '',
        licenceHolder: landing.model.vessel.licenceHolder ?? '',
        gearCode: landing.model.gearCode,
    };
}

function getProductScheduleRows(exportPayload) {
    const items = exportPayload?.items ?? [];
    const rows = [];
    items.forEach((item) => {
        item.landings.forEach((landing) => {
            const faoArea = landing.model?.faoArea?.length > 0 ? landing.model.faoArea : 'FAO27';
            const landingDetail = getLandingDetail(landing.model.vessel);
            rows.push(buildProductRow(item, landing, faoArea, landingDetail));
        });
    });
    return rows;
}

const renderHeaderLogo = (doc, startY) => {
    const LOGO_HEIGHT = 60;
    const UK_BOX_HEIGHT_MULTIPLIER = 2;
    const UK_BOX_WIDTH = 350;
    const imageFile = path.join(__dirname, '../resources/hmgovlogo.png');
    doc.addStructure(doc.struct('Figure', {
        alt: 'HM Government logo'
    }, () => {
        doc.image(imageFile, PdfStyle.MARGIN.LEFT, startY, {
            height: LOGO_HEIGHT
        });
    }));
    
    const cellHeight = PdfStyle.ROW.HEIGHT * UK_BOX_HEIGHT_MULTIPLIER;
    const ukBoxYPos = startY + LOGO_HEIGHT - cellHeight;
    doc.addStructure(doc.struct('P', () => {
        mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT + UK_HEADER_X_OFFSET, y: ukBoxYPos, width: UK_BOX_WIDTH, height: cellHeight, text: 'UNITED KINGDOM'}, true, PdfStyle.FONT_SIZE.LARGEST, 'center', MVS_STYLES.YELLOW_HEADER);
    }));
    return startY + LOGO_HEIGHT;
};


const renderHeaderTitles = (doc, yPos) => {
    const SCHEDULE_HEADER_WIDTH = 550;
    doc.addStructure(doc.struct('P', () => {
        mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT, y: yPos, width: MVS_HEADER_SECOND_COL_X, height: PdfStyle.ROW.HEIGHT, text: 'AUTHORITY USE ONLY'}, true, PdfStyle.FONT_SIZE.SMALL, 'left', MVS_STYLES.YELLOW_HEADER);
    }));
    doc.addStructure(doc.struct('P', () => {
        mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT + MVS_HEADER_SECOND_COL_X, y: yPos, width: SCHEDULE_HEADER_WIDTH, height: PdfStyle.ROW.HEIGHT,
            text: 'Schedule for multiple vessel landings as permitted by Article 12 (3) of Council Regulation (EC) No 1005/2008'},
            true, PdfStyle.FONT_SIZE.SMALL, 'center', MVS_STYLES.DEFAULT);
    }));
    return yPos + PdfStyle.ROW.HEIGHT;
};

const renderDocumentNumberSection = (doc, data, isSample, yPos) => {
    const cellHeight = PdfStyle.ROW.HEIGHT * 2 + DOCUMENT_NUMBER_SECTION_HEIGHT_OFFSET;
    doc.addStructure(doc.struct('P', () => {
        mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT, y: yPos, width: DOCUMENT_NUMBER_SECTION_WIDTH, height: cellHeight, text: ['Catch Certificate', 'Number']}, true, PdfStyle.FONT_SIZE.SMALL, 'center', MVS_STYLES.YELLOW_HEADER);
    }));

    let documentNumber = '';
    if (!data.isBlankTemplate) {
        if (isSample) {
            documentNumber = '###-####-##-#########';
        } else {
            documentNumber = data.documentNumber;
        }
    }

    doc.addStructure(doc.struct('P', () => {
        mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT + DOCUMENT_NUMBER_SECTION_WIDTH, y: yPos, width: 140, height: cellHeight, text: documentNumber}, true, PdfStyle.FONT_SIZE.SMALL, 'center', MVS_STYLES.DEFAULT);
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT + MVS_HEADER_SECOND_COL_X, y: yPos, width: 270, height: cellHeight, text: null}, true, PdfStyle.FONT_SIZE.SMALL, 'center', MVS_STYLES.DEFAULT);
    }));
    
    return yPos;
};

// Constant for QR code section X offset to avoid magic numbers
const QR_CODE_SECTION_X_OFFSET = 500;

// Constant for document number section artifact X offset to avoid magic numbers
const DOCUMENT_NUMBER_SECTION_ARTIFACT_X_OFFSET = 580;

const renderQRCodeSection = (doc, yPos) => {
    const cellHeight = PdfStyle.ROW.HEIGHT * 4 + QR_CODE_SECTION_HEIGHT_OFFSET;
    doc.addStructure(doc.struct('P', () => {
        mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT + QR_CODE_SECTION_X_OFFSET, y: yPos, width: 80, height: cellHeight, text: ['UK Authority', 'QR Code']}, true, PdfStyle.FONT_SIZE.SMALL, 'center', MVS_STYLES.YELLOW_HEADER);
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT + DOCUMENT_NUMBER_SECTION_ARTIFACT_X_OFFSET, y: yPos, width: 200, height: cellHeight, text: null}, true, PdfStyle.FONT_SIZE.SMALL, 'center', MVS_STYLES.DEFAULT);
    }));
};

const renderDateSection = (doc, data, isSample, buff, yPos) => {
    const ROW_HEIGHT_MULTIPLIER_2 = 2;
    const DATE_LABEL_WIDTH = 90;
    const DATE_VALUE_WIDTH = 140;
    const DATE_ARTIFACT_WIDTH = 270;
    const DATE_QR_CODE_X_OFFSET = 590;
    const DATE_QR_CODE_Y_OFFSET = 45;
    const DATE_SECTION_RETURN_OFFSET = 10;

    yPos = yPos + PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_2 + DOCUMENT_NUMBER_SECTION_HEIGHT_OFFSET;
    const cellHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_2 + DATE_SECTION_HEIGHT_OFFSET;

    doc.addStructure(doc.struct('P', () => {
        mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT, y: yPos, width: DATE_LABEL_WIDTH, height: cellHeight, text: 'Date'}, true, PdfStyle.FONT_SIZE.SMALL, 'center', MVS_STYLES.YELLOW_HEADER);
    }));
    let todaysDate = '';
    if (!data.isBlankTemplate) {
        todaysDate = PdfUtils.todaysDate();
    }
    doc.addStructure(doc.struct('P', () => {
        mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT + DATE_LABEL_WIDTH, y: yPos, width: DATE_VALUE_WIDTH, height: cellHeight, text: todaysDate}, true, PdfStyle.FONT_SIZE.SMALL, 'center', MVS_STYLES.DEFAULT);
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT + MVS_HEADER_SECOND_COL_X, y: yPos, width: DATE_ARTIFACT_WIDTH, height: cellHeight, text: null}, true, PdfStyle.FONT_SIZE.SMALL, 'center', MVS_STYLES.DEFAULT);
    }));

    if (!data.isBlankTemplate && !isSample) {
        PdfUtils.qrCode(doc, buff, PdfStyle.MARGIN.LEFT + DATE_QR_CODE_X_OFFSET, yPos - DATE_QR_CODE_Y_OFFSET);
    }
    
    return yPos + cellHeight + DATE_SECTION_RETURN_OFFSET;
};

const createTableHeaderCells = (doc, tableHeadRow, yPos) => {
    const cellHeight = PdfStyle.ROW.HEIGHT * TABLE_HEADER_ROW_HEIGHT_MULTIPLIER + TABLE_HEADER_HEIGHT_OFFSET;
    createMVSTableHeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + MVS_COL_SPECIES_X, yPos, MVS_COL_SPECIES_WIDTH, cellHeight, 'Species');
    createMVSTableHeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + MVS_COL_PRESENTATION_X, yPos, MVS_COL_PRESENTATION_WIDTH, cellHeight, ['Presentation']);
    createMVSTableHeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + MVS_COL_PRODUCT_CODE_X, yPos, MVS_COL_PRODUCT_CODE_WIDTH, cellHeight, ['Product', 'code']);
    createMVSTableHeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + MVS_COL_CATCH_DATE_X, yPos, MVS_COL_CATCH_DATE_WIDTH, cellHeight, ['Catch Date(s)', '(from-to)']);
    createMVSTableHeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + MVS_COL_EST_WEIGHT_X, yPos, MVS_COL_EST_WEIGHT_WIDTH, cellHeight, ['Estimated weight to be landed in kg']);
    createMVSTableHeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + MVS_COL_NET_WEIGHT_X, yPos, MVS_COL_NET_WEIGHT_WIDTH, cellHeight, ['Net catch', 'weight in kg']);
    createMVSTableHeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + MVS_COL_VERIFIED_WEIGHT_X, yPos, MVS_COL_VERIFIED_WEIGHT_WIDTH, cellHeight, ['Verified weight landed(net catch weight in kg)']);
    createMVSTableHeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + MVS_COL_VESSEL_NAME_X, yPos, MVS_COL_VESSEL_NAME_WIDTH, cellHeight, ['Vessel name and PLN / Callsign']);
    createMVSTableHeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + MVS_COL_IMO_X, yPos, MVS_COL_IMO_WIDTH, cellHeight, [IMO_VESSEL_IDENTIFIER_TEXT]);
    createMVSTableHeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + LICENCE_HOLDER_X_OFFSET, yPos, LICENCE_HOLDER_COLUMN_WIDTH, cellHeight, 'Master / Licence Holder');
    createMVSTableHeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + LICENCE_DETAIL_X_OFFSET, yPos, LICENCE_DETAIL_COLUMN_WIDTH, cellHeight, ['Licence Number /', 'Flag-Homeport']);
    createMVSTableHeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + MVS_COL_CATCH_AREA_X, yPos, MVS_COL_CATCH_AREA_WIDTH, cellHeight, ['Catch Area(s) (Catch Area, EEZ, RFMO, High Seas)']);
    createMVSTableHeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + MVS_COL_FISHING_GEAR_X, yPos, MVS_COL_FISHING_GEAR_WIDTH, cellHeight, ['Fishing', 'Gear']);
    return yPos + cellHeight;
};

const renderMultiVesselScheduleHeader = (doc, data, isSample, buff, startY) => {
    let yPos = renderHeaderLogo(doc, startY);
    yPos = renderHeaderTitles(doc, yPos);
    yPos = renderDocumentNumberSection(doc, data, isSample, yPos);
    renderQRCodeSection(doc, yPos);
    yPos = renderDateSection(doc, data, isSample, buff, yPos);

    const myTable = doc.struct('Table');
    doc.addStructure(myTable);

    const tableHead = doc.struct('THead');
    myTable.add(tableHead);

    const tableHeadRow = doc.struct('TR');
    tableHead.add(tableHeadRow);

    yPos = createTableHeaderCells(doc, tableHeadRow, yPos);
    
    tableHeadRow.end();
    tableHead.end();

    return { myTable, yPos };
};

const calculateDynamicCellHeight = (doc, row) => {
    const licenceHolderText = row.licenceHolder || '';
    const licenceDetailText = `${row.licenceDetail || ''} ${row.homePort || ''}`;
    
    const minHeight = (PdfStyle.ROW.HEIGHT * MIN_ROW_HEIGHT_MULTIPLIER) - MIN_HEIGHT_ADJUSTMENT;
    const licenceHolderHeight = calculateRequiredCellHeight(doc, licenceHolderText, LICENCE_HOLDER_COLUMN_WIDTH, PdfStyle.FONT_SIZE.SMALLER);
    const licenceDetailHeight = calculateRequiredCellHeight(doc, licenceDetailText, LICENCE_DETAIL_COLUMN_WIDTH, PdfStyle.FONT_SIZE.SMALLER);
    
    return Math.max(minHeight, licenceHolderHeight, licenceDetailHeight);
};

const renderTableRow = (tableBody, doc, yPos, dynamicCellHeight, rowIdx, rowDataLimit, rows) => {
    const tableBodyRow = doc.struct('TR');
    tableBody.add(tableBodyRow);
    generateMultiVesselTableRows(tableBodyRow, doc, yPos, dynamicCellHeight, rowIdx, rowDataLimit, rows);
    tableBodyRow.end();
    return yPos + dynamicCellHeight;
};

const MULTI_VESSEL_BLANK_TEMPLATE_PAGE_COUNT = 3;

const multiVesselScheduleHeading = (doc, data, isSample, buff, page, pageSize, startY) => {
    const { myTable, yPos: initialYPos } = renderMultiVesselScheduleHeader(doc, data, isSample, buff, startY);
    let yPos = initialYPos;

    const rows = getProductScheduleRows(data.exportPayload);
    let pageCount = Math.ceil(rows.length / pageSize);
    if (data.isBlankTemplate) {
        pageCount = MULTI_VESSEL_BLANK_TEMPLATE_PAGE_COUNT;
    }

    const fromIdx = (page - 1) * pageSize;
    let numDataRows = pageSize;
    if (fromIdx + numDataRows > rows.length) {
        numDataRows = rows.length - fromIdx;
    }
    const rowDataLimit = fromIdx + numDataRows;

    const tableBody = doc.struct('TBody');
    myTable.add(tableBody);

    const maxPageHeight = 565;
    const defaultHeight = (PdfStyle.ROW.HEIGHT * MIN_ROW_HEIGHT_MULTIPLIER) - MIN_HEIGHT_ADJUSTMENT;

    for (let rowIdx = fromIdx; rowIdx < (fromIdx + pageSize); rowIdx++) {
        let dynamicCellHeight = defaultHeight;
        if (rowIdx < rowDataLimit && rows[rowIdx]) {
            dynamicCellHeight = calculateDynamicCellHeight(doc, rows[rowIdx]);
        }
        
        if (yPos + dynamicCellHeight > maxPageHeight && rowIdx < rowDataLimit) {
            const remainingRows = (fromIdx + pageSize) - rowIdx;
            for (let emptyIdx = 0; emptyIdx < remainingRows; emptyIdx++) {
                const emptyRow = doc.struct('TR');
                tableBody.add(emptyRow);
                generateMultiVesselTableRows(emptyRow, doc, yPos, defaultHeight, fromIdx + pageSize + emptyIdx, rowDataLimit, rows);
                emptyRow.end();
                yPos = yPos + defaultHeight;
            }
            break;
        }
        
        yPos = renderTableRow(tableBody, doc, yPos, dynamicCellHeight, rowIdx, rowDataLimit, rows);
    }

    const pageCountRow = doc.struct('TR', () => {
        mvsTableCell({doc, x: PdfStyle.MARGIN.LEFT, y: yPos, width: 780, height: PdfStyle.ROW.HEIGHT, text: `Page ${page} of ${pageCount}`}, true, PdfStyle.FONT_SIZE.SMALLER, 'left', MVS_STYLES.DEFAULT);
    });
    tableBody.add(pageCountRow);
    pageCountRow.end();

    tableBody.end();
    myTable.end();
};

const multiVesselScheduleHeadingDynamic = (doc, data, isSample, buff, pageConfig) => {
    const { pageNum, currentPage, allRows, totalPages, startY } = pageConfig;
    const { myTable, yPos: initialYPos } = renderMultiVesselScheduleHeader(doc, data, isSample, buff, startY);
    let yPos = initialYPos;

    const tableBody = doc.struct('TBody');
    myTable.add(tableBody);

    currentPage.rows.forEach(rowInfo => {
        const rowIdx = rowInfo.index;
        const dynamicCellHeight = rowInfo.height;
        
        const tableBodyRow = doc.struct('TR');
        tableBody.add(tableBodyRow);
        generateMultiVesselTableRows(tableBodyRow, doc, yPos, dynamicCellHeight, rowIdx, allRows.length, allRows);
        tableBodyRow.end();
        yPos = yPos + dynamicCellHeight;
    });

    const pageCountRow = doc.struct('TR', () => {
        mvsTableCell({doc, x: PdfStyle.MARGIN.LEFT, y: yPos, width: 780, height: PdfStyle.ROW.HEIGHT, text: `Page ${pageNum} of ${totalPages}`}, true, PdfStyle.FONT_SIZE.SMALLER, 'left', MVS_STYLES.DEFAULT);
    });
    tableBody.add(pageCountRow);
    pageCountRow.end();

    tableBody.end();
    myTable.end();
};

const formatCatchAreaData = (row) => {
    if (!row) {
        return '';
    }
    
    let catchAreaText = row.faoArea || '';
    
    if (row.exclusiveEconomicZones && row.exclusiveEconomicZones.length > 0) {
        const eezText = row.exclusiveEconomicZones.map(eez => eez.isoCodeAlpha2 || eez).join(', ');
        catchAreaText += eezText ? '\n' + eezText : '';
    }
    
    if (row.rfmo) {
        const rfmoMatch = row.rfmo.match(/\(([^)]{1,10})\)/);
        const rfmoText = rfmoMatch ? rfmoMatch[1] : row.rfmo;
        catchAreaText += '\n' + rfmoText;
    }
    
    if (row.highSeasArea && row.highSeasArea === 'Yes') {
        catchAreaText += '\nHigh seas';
    }
    
    return catchAreaText;
};

const calculateRequiredCellHeight = (doc, text, width, fontSize) => {
    if (!text || text === '') {
        return (PdfStyle.ROW.HEIGHT * MIN_ROW_HEIGHT_MULTIPLIER) - MIN_HEIGHT_ADJUSTMENT;
    }
    
    doc.font(PdfStyle.FONT.REGULAR);
    doc.fontSize(fontSize);
    
    const textWidth = doc.widthOfString(text.toString());
    const availableWidth = width - 8;
    
    const linesNeeded = Math.ceil(textWidth / availableWidth);
    
    const lineHeight = 10; 
    const topPadding = 4;
    const bottomPadding = 4;
    const minHeight = (PdfStyle.ROW.HEIGHT * MIN_ROW_HEIGHT_MULTIPLIER) - MIN_HEIGHT_ADJUSTMENT;
    
    const calculatedHeight = topPadding + (linesNeeded * lineHeight) + bottomPadding;
    
    return Math.max(calculatedHeight, minHeight);
};

const calculateRequiredCellHeightStatic = (text, width, fontSize) => {
    if (!text || text === '') {
        return (PdfStyle.ROW.HEIGHT * MIN_ROW_HEIGHT_MULTIPLIER) - MIN_HEIGHT_ADJUSTMENT;
    }
    
    const avgCharWidth = fontSize * CHAR_WIDTH_MULTIPLIER; 
    const textLength = text.toString().length;
    const textWidth = textLength * avgCharWidth;
    const availableWidth = width - 8; 
    
    const linesNeeded = Math.ceil(textWidth / availableWidth);
    
    const lineHeight = 10;
    const topPadding = 4;
    const bottomPadding = 4;
    const extraMargin = MIN_HEIGHT_ADJUSTMENT; 
    const minHeight = (PdfStyle.ROW.HEIGHT * MIN_ROW_HEIGHT_MULTIPLIER) - MIN_HEIGHT_ADJUSTMENT; 
    
    const calculatedHeight = topPadding + (linesNeeded * lineHeight) + bottomPadding + extraMargin;
    
    return Math.max(calculatedHeight, minHeight);
};

// Helper function to safely get row data or return empty string
const getRowValue = (rowIdx, rowDataLimit, rows, valueAccessor) => {
    if (rowIdx >= rowDataLimit) {
        return '';
    }
    return valueAccessor(rows[rowIdx]);
};

// Helper function to build cell data array for multi-vessel table rows
const buildMultiVesselCellData = (rowIdx, rowDataLimit, rows) => {
    return [
        { x: PdfStyle.MARGIN.LEFT + MVS_COL_SPECIES_X, width: MVS_COL_SPECIES_WIDTH, text: getRowValue(rowIdx, rowDataLimit, rows, row => `${row.species}`) },
        { x: PdfStyle.MARGIN.LEFT + MVS_COL_PRESENTATION_X, width: MVS_COL_PRESENTATION_WIDTH, text: getRowValue(rowIdx, rowDataLimit, rows, row => `${row.presentation}`) },
        { x: PdfStyle.MARGIN.LEFT + MVS_COL_PRODUCT_CODE_X, width: MVS_COL_PRODUCT_CODE_WIDTH, text: getRowValue(rowIdx, rowDataLimit, rows, row => `${row.commodityCode}`) },
        { x: PdfStyle.MARGIN.LEFT + MVS_COL_CATCH_DATE_X, width: MVS_COL_CATCH_DATE_WIDTH, text: getRowValue(rowIdx, rowDataLimit, rows, row => `${row.dateLanded}`) },
        { x: PdfStyle.MARGIN.LEFT + MVS_COL_EST_WEIGHT_X, width: MVS_COL_EST_WEIGHT_WIDTH, text: getRowValue(rowIdx, rowDataLimit, rows, row => `${row.estimatedWeight}`) },
        { x: PdfStyle.MARGIN.LEFT + MVS_COL_NET_WEIGHT_X, width: MVS_COL_NET_WEIGHT_WIDTH, text: getRowValue(rowIdx, rowDataLimit, rows, row => `${Number(row.exportWeight).toFixed(2)}`) },
        { x: PdfStyle.MARGIN.LEFT + MVS_COL_VERIFIED_WEIGHT_X, width: MVS_COL_VERIFIED_WEIGHT_WIDTH, text: getRowValue(rowIdx, rowDataLimit, rows, row => `${row.verifiedWeight}`) },
        { x: PdfStyle.MARGIN.LEFT + MVS_COL_VESSEL_NAME_X, width: MVS_COL_VESSEL_NAME_WIDTH, text: getRowValue(rowIdx, rowDataLimit, rows, row => `${row.vessel} (${row.pln})`) },
        { x: PdfStyle.MARGIN.LEFT + MVS_COL_IMO_X, width: MVS_COL_IMO_WIDTH, text: getRowValue(rowIdx, rowDataLimit, rows, row => `${getImoOrCfrForMultiVesselSchedule(row)}`) },
        { x: PdfStyle.MARGIN.LEFT + LICENCE_HOLDER_X_OFFSET, width: LICENCE_HOLDER_COLUMN_WIDTH, text: getRowValue(rowIdx, rowDataLimit, rows, row => `${row.licenceHolder}`) },
        { x: PdfStyle.MARGIN.LEFT + LICENCE_DETAIL_X_OFFSET, width: LICENCE_DETAIL_COLUMN_WIDTH, text: getRowValue(rowIdx, rowDataLimit, rows, row => `${row.licenceDetail} ${row.homePort}`) },
        { x: PdfStyle.MARGIN.LEFT + MVS_COL_CATCH_AREA_X, width: MVS_COL_CATCH_AREA_WIDTH, text: getRowValue(rowIdx, rowDataLimit, rows, row => formatCatchAreaData(row)) },
        { x: PdfStyle.MARGIN.LEFT + MVS_COL_FISHING_GEAR_X, width: MVS_COL_FISHING_GEAR_WIDTH, text: getRowValue(rowIdx, rowDataLimit, rows, row => row.gearCode ? `${row.gearCode}` : '') }
    ];
};

const generateMultiVesselTableRows = (tableBodyRow, doc, yPos, cellHeight, rowIdx, rowDataLimit, rows) => {
    const cellData = buildMultiVesselCellData(rowIdx, rowDataLimit, rows);
    
    cellData.forEach(cell => {
        createMVSTableDataCell(doc, tableBodyRow, cell.x, yPos, cell.width, cellHeight, cell.text);
    });
};

const renderTransportDetailsTable = (doc, yPos, transportData, fieldHeights, widths) => {
    const { 
        countryOfExport, departurePlace, pointOfDestination, vcDetails, 
        flightNumber, truckDetails, railwayBillNumber, freightBillNumber, 
        containerIdentificationNumber, otherTransportDocuments 
    } = transportData;
    
    const { 
        singleLineHeight, destinationFieldHeight, vesselFieldHeight, flightFieldHeight, truckFieldHeight, 
        railwayFieldHeight, freightFieldHeight, containerFieldHeight, otherDocsFieldHeight 
    } = fieldHeights;
    
    const { labelWidth, valueWidth, multiplier2, multiplier3 } = widths;

    doc.addStructure(doc.struct('Table', [
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos, labelWidth, singleLineHeight, 'Country of exportation')),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + labelWidth, yPos, valueWidth, singleLineHeight, countryOfExport)),
            ]),
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + singleLineHeight, labelWidth, singleLineHeight, 'Port/airport/other point of departure')),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + labelWidth, yPos + singleLineHeight, valueWidth, singleLineHeight, departurePlace)),
            ]),
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + (singleLineHeight * multiplier2), labelWidth, destinationFieldHeight, 'Point of destination')),
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + labelWidth, yPos + (singleLineHeight * multiplier2), valueWidth, destinationFieldHeight, pointOfDestination)),
            ]),
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + (singleLineHeight * multiplier3), labelWidth, vesselFieldHeight, 'Vessel name and flag')),
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + labelWidth, yPos + (singleLineHeight * multiplier3), valueWidth, vesselFieldHeight, vcDetails)),
            ]),
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + (singleLineHeight * multiplier3) + vesselFieldHeight, labelWidth, flightFieldHeight, 'Flight number/airway bill number')),
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + labelWidth, yPos + (singleLineHeight * multiplier3) + vesselFieldHeight, valueWidth, flightFieldHeight, flightNumber)),
            ]),
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + (singleLineHeight * multiplier3) + vesselFieldHeight + flightFieldHeight, labelWidth, truckFieldHeight, 'Truck nationality and registration number')),
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + labelWidth, yPos + (singleLineHeight * multiplier3) + vesselFieldHeight + flightFieldHeight, valueWidth, truckFieldHeight, truckDetails)),
            ]),
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + (singleLineHeight * multiplier3) + vesselFieldHeight + flightFieldHeight + truckFieldHeight, labelWidth, railwayFieldHeight, 'Railway bill number')),
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + labelWidth, yPos + (singleLineHeight * multiplier3) + vesselFieldHeight + flightFieldHeight + truckFieldHeight, valueWidth, railwayFieldHeight, railwayBillNumber)),
            ]),
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + (singleLineHeight * multiplier3) + vesselFieldHeight + flightFieldHeight + truckFieldHeight + railwayFieldHeight, labelWidth, freightFieldHeight, 'Freight bill number')),
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + labelWidth, yPos + (singleLineHeight * multiplier3) + vesselFieldHeight + flightFieldHeight + truckFieldHeight + railwayFieldHeight, valueWidth, freightFieldHeight, freightBillNumber)),
            ]),
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + (singleLineHeight * multiplier3) + vesselFieldHeight + flightFieldHeight + truckFieldHeight + railwayFieldHeight + freightFieldHeight, labelWidth, containerFieldHeight, 'Container identification number(s)')),
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + labelWidth, yPos + (singleLineHeight * multiplier3) + vesselFieldHeight + flightFieldHeight + truckFieldHeight + railwayFieldHeight + freightFieldHeight, valueWidth, containerFieldHeight, containerIdentificationNumber)),
            ]),
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + (singleLineHeight * multiplier3) + vesselFieldHeight + flightFieldHeight + truckFieldHeight + railwayFieldHeight + freightFieldHeight + containerFieldHeight, labelWidth, otherDocsFieldHeight, 'Other transport documents (e.g. bill of landing, CMR, air waybill)')),
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + labelWidth, yPos + (singleLineHeight * multiplier3) + vesselFieldHeight + flightFieldHeight + truckFieldHeight + railwayFieldHeight + freightFieldHeight + containerFieldHeight, valueWidth, otherDocsFieldHeight, otherTransportDocuments)),
            ])
        ])
    ]));
};

const appendixTransportDetails = (doc, data, startY) => {
    const DESTINATION_FIELD_HEIGHT_MULTIPLIER = 3;
    const VESSEL_FIELD_HEIGHT_MULTIPLIER = 5;
    const FLIGHT_FIELD_HEIGHT_MULTIPLIER = 4;
    const TRUCK_FIELD_HEIGHT_MULTIPLIER = 4;
    const RAILWAY_FIELD_HEIGHT_MULTIPLIER = 3;
    const FREIGHT_FIELD_HEIGHT_MULTIPLIER = 3;
    const CONTAINER_FIELD_HEIGHT_MULTIPLIER = 6;
    const OTHER_DOCS_FIELD_HEIGHT_MULTIPLIER = 20;
    const TRANSPORT_LABEL_WIDTH = 156;
    const TRANSPORT_VALUE_WIDTH = 383;
    const SINGLE_LINE_YPOS_MULTIPLIER_2 = 2;
    const SINGLE_LINE_YPOS_MULTIPLIER_3 = 5;

    doc.font(PdfStyle.FONT.REGULAR);
    const yPos = startY;
    
    // Get first transport mode for country/departure/destination (backward compatible)
    const transportModes = getTransportModes(data);
    
    const firstTransport = transportModes[0] || {};
    const countryOfExport = firstTransport.exportedFrom || data.transport?.exportedFrom || 'United Kingdom';
    const pointOfDestination = firstTransport.pointOfDestination || data.transport?.pointOfDestination || '';
    const departurePlace = getDeparturePlace(data);
    
    const vcDetails = getVcDetails(data);
    const flightNumber = getFlightDetails(data);
    const truckDetails = getTruckDetails(data);
    const railwayBillNumber = getRailwayBillNumber(data);
    const freightBillNumber = getFreightBillNumber(data);
    const otherTransportDocuments = getOtherTransportDocuments(data);
    const containerIdentificationNumber = getContainerIdentificationNumber(data);

    const transportData = {
        countryOfExport, departurePlace, pointOfDestination, vcDetails,
        flightNumber, truckDetails, railwayBillNumber, freightBillNumber,
        containerIdentificationNumber, otherTransportDocuments
    };

    const fieldHeights = {
        singleLineHeight: PdfStyle.ROW.HEIGHT,
        destinationFieldHeight: PdfStyle.ROW.HEIGHT * DESTINATION_FIELD_HEIGHT_MULTIPLIER,
        vesselFieldHeight: PdfStyle.ROW.HEIGHT * VESSEL_FIELD_HEIGHT_MULTIPLIER,
        flightFieldHeight: PdfStyle.ROW.HEIGHT * FLIGHT_FIELD_HEIGHT_MULTIPLIER,
        truckFieldHeight: PdfStyle.ROW.HEIGHT * TRUCK_FIELD_HEIGHT_MULTIPLIER,
        railwayFieldHeight: PdfStyle.ROW.HEIGHT * RAILWAY_FIELD_HEIGHT_MULTIPLIER,
        freightFieldHeight: PdfStyle.ROW.HEIGHT * FREIGHT_FIELD_HEIGHT_MULTIPLIER,
        containerFieldHeight: PdfStyle.ROW.HEIGHT * CONTAINER_FIELD_HEIGHT_MULTIPLIER,
        otherDocsFieldHeight: PdfStyle.ROW.HEIGHT * OTHER_DOCS_FIELD_HEIGHT_MULTIPLIER
    };

    const widths = {
        labelWidth: TRANSPORT_LABEL_WIDTH,
        valueWidth: TRANSPORT_VALUE_WIDTH,
        multiplier2: SINGLE_LINE_YPOS_MULTIPLIER_2,
        multiplier3: SINGLE_LINE_YPOS_MULTIPLIER_3
    };

    renderTransportDetailsTable(doc, yPos, transportData, fieldHeights, widths);
};

const appendixExporterAndImportDetails = (doc, data, isSample, buff, startY) => {
    const EXPORTER_SECTION_HEADER_Y_OFFSET = 20;
    const NAME_ROW_HEIGHT_MULTIPLIER = 5;
    const ROW_HEIGHT_ADJUSTMENT = 5;
    const EXPORTER_LABEL_COL_WIDTH = 100;
    const EXPORTER_VALUE_COL_WIDTH = 430;
    const OFFICIAL_USE_HEIGHT_MULTIPLIER = 8;
    const OFFICIAL_USE_COL1_WIDTH = 270;
    const OFFICIAL_USE_COL2_WIDTH = 260;
    const OFFICIAL_USE_Y_OFFSET = 20;
    const VALIDATION_TEXT_X_OFFSET = 10;
    const VALIDATION_Y_OFFSET = 80;
    const QR_CODE_X_OFFSET = 20;
    const TABLE_SPACING = 30;
    const CELL_HEIGHT_MULTIPLIER_2 = 2;

    // This function now renders exporter details and Official use only section on page 7
    let yPos = startY;
    
    // Exporter Details section
    doc.font(PdfStyle.FONT.BOLD);
    doc.fontSize(PdfStyle.FONT_SIZE.MEDIUM);
    doc.addStructure(doc.struct('H3', () => {
        doc.text('Exporter Details', PdfStyle.MARGIN.LEFT, yPos);
    }));
    doc.font(PdfStyle.FONT.REGULAR);
    yPos += EXPORTER_SECTION_HEADER_Y_OFFSET;

    const exporterAddress = PdfUtils.constructAddress([
        data.exporter?.addressOne, 
        data.exporter?.addressTwo,
        data.exporter?.townCity, 
        data.exporter?.postcode
    ]) ?? '';
    const exporterFullName = data.exporter?.exporterFullName ?? '';
    const exporterCompanyName = data.exporter?.exporterCompanyName ?? '';

    let cellHeight = PdfStyle.ROW.HEIGHT * NAME_ROW_HEIGHT_MULTIPLIER + ROW_HEIGHT_ADJUSTMENT;

    doc.addStructure(doc.struct('Table', [
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos, EXPORTER_LABEL_COL_WIDTH, PdfStyle.ROW.HEIGHT + ROW_HEIGHT_ADJUSTMENT, 'Name')),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + EXPORTER_LABEL_COL_WIDTH, yPos, EXPORTER_VALUE_COL_WIDTH, PdfStyle.ROW.HEIGHT + ROW_HEIGHT_ADJUSTMENT, exporterFullName)),
            ]),
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + PdfStyle.ROW.HEIGHT + ROW_HEIGHT_ADJUSTMENT, EXPORTER_LABEL_COL_WIDTH, cellHeight, 'Address')),
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + EXPORTER_LABEL_COL_WIDTH, yPos + PdfStyle.ROW.HEIGHT + ROW_HEIGHT_ADJUSTMENT, EXPORTER_VALUE_COL_WIDTH, cellHeight, [exporterCompanyName, exporterAddress])),
            ]),
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + PdfStyle.ROW.HEIGHT + ROW_HEIGHT_ADJUSTMENT + cellHeight, EXPORTER_LABEL_COL_WIDTH, cellHeight, 'Signature')),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + EXPORTER_LABEL_COL_WIDTH, yPos + PdfStyle.ROW.HEIGHT + ROW_HEIGHT_ADJUSTMENT + cellHeight, EXPORTER_VALUE_COL_WIDTH, cellHeight)),
            ])
        ])
    ]));

    yPos = yPos + PdfStyle.ROW.HEIGHT + ROW_HEIGHT_ADJUSTMENT + (cellHeight * CELL_HEIGHT_MULTIPLIER_2) + TABLE_SPACING;
    
    // Official use only section - original format
    cellHeight = PdfStyle.ROW.HEIGHT * OFFICIAL_USE_HEIGHT_MULTIPLIER;
    
    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', () => {
                    PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT, yPos, OFFICIAL_USE_COL1_WIDTH, cellHeight, 'FOR OFFICIAL USE ONLY');
                }),
                doc.struct('TH', () => {
                    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + OFFICIAL_USE_COL1_WIDTH, yPos, OFFICIAL_USE_COL2_WIDTH, cellHeight, 'Import Control Authority Stamp');
                })
            ])
        ])
    ]));

    yPos += cellHeight + OFFICIAL_USE_Y_OFFSET;
    
    // Validation paragraph
    doc.font(PdfStyle.FONT.BOLD);
    doc.addStructure(doc.struct('P', () => {
        doc.text('Validated by the appropriate competent authority (MMO, Scottish Ministers, Welsh Ministers, Department of Agriculture, Environment and Rural Affairs for Northern Ireland, Marine Resources, Growth and Housing and Environment for Jersey, Sea Fisheries, Committee for Economic Development for Guernsey and Department Environment, Food and Agriculture for the Isle of Man) in accordance with article 15 of Council Regulation (EU) 1005/2008 (as retained under s.3(1) European Union (Withdrawal) Act 2018)', PdfStyle.MARGIN.LEFT + VALIDATION_TEXT_X_OFFSET, yPos);
    }));
    
    yPos += VALIDATION_Y_OFFSET;
    
    // QR Code
    const shouldGenerateQRCode = !data.isBlankTemplate && !isSample;
    if (shouldGenerateQRCode && buff) {
        PdfUtils.qrCode(doc, buff, PdfStyle.MARGIN.LEFT + QR_CODE_X_OFFSET, yPos);
    }
};

const getVehicleType = (data) => {
    return data?.transport?.vehicle?.toUpperCase() ?? '';
};

const getTransportModes = (data) => {
    // Support both single transport object and array of transport modes
    if (Array.isArray(data.transportations)) {
        return data.transportations;
    }
    
    if (data.transport) {
        return [data.transport];
    }
    
    return [];
};

const formatVesselDetail = (vesselName, flagStateOrPln) => {
    const name = vesselName ? `${vesselName} ` : '';
    const detail = (name + (flagStateOrPln ?? '')).toString().trim();
    return detail;
};

const extractVesselFromTransport = (transport) => {
    const transportVehicleType = (transport.vehicle || '').toUpperCase();
    
    if (transportVehicleType === 'CONTAINERVESSEL' || transportVehicleType === 'DIRECTLANDING') {
        return formatVesselDetail(transport.vesselName, transport.flagState);
    }
    
    return null;
};

const extractVesselFromExportPayload = (data) => {
    const vessel = data.exportPayload?.items?.[0]?.landings?.[0]?.model?.vessel;
    if (!vessel) {
        return null;
    }
    
    const pln = vessel.pln ? `(${vessel.pln})` : '';
    return formatVesselDetail(vessel.vesselName, pln);
};

const getVcDetails = (data) => {
    const transportModes = getTransportModes(data);
    const vesselDetails = [];
    
    transportModes.forEach(transport => {
        const detail = extractVesselFromTransport(transport);
        if (detail) {
            vesselDetails.push(detail);
        }
    });
    
    // Fallback: Handle direct landing from exportPayload if not in transportations
    if (vesselDetails.length === 0 && getVehicleType(data) === 'DIRECTLANDING') {
        const detail = extractVesselFromExportPayload(data);
        if (detail) {
            vesselDetails.push(detail);
        }
    }
    
    return vesselDetails.join(', ');
};

const extractDeparturePlaceFromTransport = (transport) => {
    if (transport.cmr === 'true') {
        return 'See attached transport documents';
    }
    
    if (transport.departurePlace) {
        const place = transport.departurePlace.toString().trim();
        return place || null;
    }
    
    return null;
};

const addUniqueDeparturePlace = (departurePlaces, place) => {
    if (place && !departurePlaces.includes(place)) {
        departurePlaces.push(place);
    }
};

const getDeparturePlace = (data) => {
    const transportModes = getTransportModes(data);
    const departurePlaces = [];
    
    transportModes.forEach(transport => {
        const place = extractDeparturePlaceFromTransport(transport);
        addUniqueDeparturePlace(departurePlaces, place);
    });
    
    // Fallback to old single transport object
    if (departurePlaces.length === 0 && data.transport) {
        const place = extractDeparturePlaceFromTransport(data.transport);
        if (place) {
            departurePlaces.push(place);
        }
    }
    
    return departurePlaces.join(', ');
};

const getFlightDetails = (data) => {
    const transportModes = getTransportModes(data);
    const flightNumbers = [];
    
    transportModes.forEach(transport => {
        const transportVehicleType = (transport.vehicle || '').toUpperCase();
        if (transportVehicleType === 'PLANE' && transport.flightNumber) {
            flightNumbers.push(transport.flightNumber.toString());
        }
    });
    
    return flightNumbers.join(', ');
};

const getTruckDetails = (data) => {
    const transportModes = getTransportModes(data);
    const truckDetails = [];
    
    transportModes.forEach(transport => {
        const transportVehicleType = (transport.vehicle || '').toUpperCase();
        if (transportVehicleType === 'TRUCK') {
            const nationality = transport.nationalityOfVehicle 
                ? `${transport.nationalityOfVehicle} ` 
                : '';
            const registration = transport.registrationNumber ?? '';
            const detail = (nationality + registration).toString().trim();
            if (detail) {
                truckDetails.push(detail);
            }
        }
    });
    
    return truckDetails.join(', ');
};

const getRailwayBillNumber = (data) => {
    const transportModes = getTransportModes(data);
    const railwayBillNumbers = [];
    
    transportModes.forEach(transport => {
        const transportVehicleType = (transport.vehicle || '').toUpperCase();
        if (transportVehicleType === 'TRAIN' && transport.railwayBillNumber) {
            railwayBillNumbers.push(transport.railwayBillNumber.toString());
        }
    });
    
    return railwayBillNumbers.join(', ');
};

const getContainerIdentificationNumber = (data) => {
    const transportModes = getTransportModes(data);
    const containerNumbers = [];
    
    transportModes.forEach(transport => {
        // Support both 'containerIdentificationNumber' and 'containerNumber'
        const containerNum = transport.containerIdentificationNumber || transport.containerNumber;
        if (containerNum) {
            containerNumbers.push(containerNum.toString());
        }
    });
    
    return containerNumbers.join(', ');
};

const getFreightBillNumber = (data) => {
    const transportModes = getTransportModes(data);
    const freightBillNumbers = [];
    
    transportModes.forEach(transport => {
        if (transport.freightBillNumber) {
            freightBillNumbers.push(transport.freightBillNumber.toString());
        }
    });
    
    return freightBillNumbers.join(', ');
}

// Constant for maximum number of transport documents to avoid magic numbers
const MAX_TRANSPORT_DOCUMENTS = 25;

const getOtherTransportDocuments = (data) => {
    const transportModes = getTransportModes(data);
    let documentLines = [];
    
    transportModes.forEach(transport => {
        // Support both 'transportDocuments' (from UI) and 'documents' (alternative naming)
        const docs = transport.transportDocuments || transport.documents;
        
        if (docs) {
            if (Array.isArray(docs)) {
                // Handle array format
                const formattedDocs = docs
                    .map(doc => {
                        if (doc.name && doc.reference) {
                            return `${doc.name} - ${doc.reference}`;
                        }
                        return '';
                    })
                    .filter(line => line.length > 0);
                
                documentLines = documentLines.concat(formattedDocs);
            } else {
                // Handle string format (newline-separated)
                const lines = docs.split('\n').map(line => line.trim()).filter(line => line.length > 0);
                documentLines = documentLines.concat(lines);
            }
        }
    });
    
    // Limit to MAX_TRANSPORT_DOCUMENTS documents (maintains insertion order)
    documentLines = documentLines.slice(0, MAX_TRANSPORT_DOCUMENTS);
    
    return documentLines.join('\n');
};

// Constant for appendix heading vertical offset to avoid magic numbers
const APPENDIX_HEADING_VERTICAL_OFFSET = 18;

const appendixHeading = (doc, startY) => {

    doc.fillColor('#353535');
    doc.fontSize(PdfStyle.FONT_SIZE.LARGE);
    doc.font(PdfStyle.FONT.BOLD);
    doc.addStructure(doc.struct('H2', {}, () => {
        doc.text('Appendix I', 0, startY, {
            align: 'center'
        });
    }));
    doc.addStructure(doc.struct('H3', {}, () => {
        doc.text('Transport Details', 0, startY + APPENDIX_HEADING_VERTICAL_OFFSET, {
            align: 'center'
        });
    }));
};

const renderSection11ImporterTables = (doc, yPos, headerHeight, rowHeight) => {
    const COL1_OFFSET = 15;
    const COL1_WIDTH = 250;
    const COL2_OFFSET = 265;
    const COL2_WIDTH = 95;
    const COL3_OFFSET = 360;
    const COL3_WIDTH = 95;
    const COL4_OFFSET = 455;
    const COL4_WIDTH = 80;

    const importerRowsStructure = [
        { leftMargin: COL1_OFFSET, width: COL1_WIDTH },
        { leftMargin: COL2_OFFSET, width: COL2_WIDTH },
        { leftMargin: COL3_OFFSET, width: COL3_WIDTH },
        { leftMargin: COL4_OFFSET, width: COL4_WIDTH }
    ];

    const importerHeadersfirst = [
        { leftMargin: COL1_OFFSET, width: COL1_WIDTH, text: ['Company, name, address, EORI number and contact details of importer (specify details)'] },
        { leftMargin: COL2_OFFSET, width: COL2_WIDTH, text: 'Signature' },
        { leftMargin: COL3_OFFSET, width: COL3_WIDTH, text: 'Date' },
        { leftMargin: COL4_OFFSET, width: COL4_WIDTH, text: 'Seal' }
    ];
    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', importerHeadersfirst.map(h =>
                doc.struct('TH', () => PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + h.leftMargin, yPos, h.width, headerHeight, h.text))
            ))
        ]),
        doc.struct('TBody', [
            doc.struct('TR', importerRowsStructure.map(r =>
                doc.struct('TD', () => PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + r.leftMargin, yPos + headerHeight, r.width, rowHeight))
            ))
        ])
    ]));

    yPos += headerHeight + rowHeight;

    const importerHeaders = [
        { leftMargin: COL1_OFFSET, width: COL1_WIDTH, text: ['Company, name, address, EORI number and contact details of representative of the importer (specify details)'] },
        { leftMargin: COL2_OFFSET, width: COL2_WIDTH, text: 'Signature' },
        { leftMargin: COL3_OFFSET, width: COL3_WIDTH, text: 'Date' },
        { leftMargin: COL4_OFFSET, width: COL4_WIDTH, text: 'Seal' }
    ];
    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', importerHeaders.map(h =>
                doc.struct('TH', () => PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + h.leftMargin, yPos, h.width, headerHeight, h.text))
            ))
        ]),
        doc.struct('TBody', [
            doc.struct('TR', importerRowsStructure.map(r =>
                doc.struct('TD', () => PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + r.leftMargin, yPos + headerHeight, r.width, rowHeight))
            ))
        ])
    ]));

    return yPos + headerHeight + rowHeight;
};

const renderSection11ProductTable = (doc, yPos, headerHeight, rowHeight) => {
    const COL1_OFFSET = 15;
    const COL1_WIDTH = 250;
    const COL2_OFFSET = 265;
    const COL2_WIDTH = 95;
    const COL3_OFFSET = 360;
    const COL3_WIDTH = 95;
    const COL4_OFFSET = 455;
    const COL4_WIDTH = 80;

    const productHeaders = [
        { leftMargin: COL1_OFFSET, width: COL1_WIDTH, text: 'Product Description' },
        { leftMargin: COL2_OFFSET, width: COL2_WIDTH, text: 'CN code' },
        { leftMargin: COL3_OFFSET, width: COL3_WIDTH, text: 'Net weight in kg' },
        { leftMargin: COL4_OFFSET, width: COL4_WIDTH, text: 'Net fishery product weight in kg' }
    ];
    const productRows = [
        { leftMargin: COL1_OFFSET, width: COL1_WIDTH },
        { leftMargin: COL2_OFFSET, width: COL2_WIDTH },
        { leftMargin: COL3_OFFSET, width: COL3_WIDTH },
        { leftMargin: COL4_OFFSET, width: COL4_WIDTH }
    ];
    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', productHeaders.map(h =>
                doc.struct('TH', () => PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + h.leftMargin, yPos, h.width, headerHeight, h.text))
            ))
        ]),
        doc.struct('TBody', [
            doc.struct('TR', productRows.map(r =>
                doc.struct('TD', () => PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + r.leftMargin, yPos + headerHeight, r.width, rowHeight))
            ))
        ])
    ]));

    return yPos + headerHeight + rowHeight;
};

const createSection11Table = (doc, headerDefs, columnDefs, tableYPos, headerHeight, rowHeight) => {
    const headerCells = headerDefs.map(h =>
        doc.struct('TH', () => PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + h.leftMargin, tableYPos, h.width, headerHeight, h.text))
    );
    const bodyCells = columnDefs.map(c =>
        doc.struct('TD', () => PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + c.leftMargin, tableYPos + headerHeight, c.width, rowHeight))
    );
    return doc.struct('Table', [
        doc.struct('THead', [doc.struct('TR', headerCells)]),
        doc.struct('TBody', [doc.struct('TR', bodyCells)])
    ]);
};

const addSection11Table = (doc, headers, cols, yPos, headerHeight, rowHeight) => {
    doc.addStructure(createSection11Table(doc, headers, cols, yPos, headerHeight, rowHeight));
    return yPos + headerHeight + rowHeight;
};

const getSection11TableDefinitions = () => {
    const COL1_OFFSET = 15, COL1_WIDTH = 250;
    const COL2_OFFSET = 265, COL2_WIDTH = 95;
    const COL3_OFFSET = 360, COL_REFERENCES_WIDTH = 175;
    const MEMBER_STATE_WIDTH = 520, CUSTOMS_COL1_WIDTH = 300;
    const CUSTOMS_COL2_OFFSET = 315, CUSTOMS_COL2_WIDTH = 220;

    return {
        article14_1: {
            headers: [
                { leftMargin: COL1_OFFSET, width: COL1_WIDTH, text: ['Document under Article 14(1) of Regulation (EC) No 1005/2008'] },
                { leftMargin: COL2_OFFSET, width: COL2_WIDTH, text: 'Yes/No (as appropriate)' },
                { leftMargin: COL3_OFFSET, width: COL_REFERENCES_WIDTH, text: 'References' }
            ],
            cols: [
                { leftMargin: COL1_OFFSET, width: COL1_WIDTH },
                { leftMargin: COL2_OFFSET, width: COL2_WIDTH },
                { leftMargin: COL3_OFFSET, width: COL_REFERENCES_WIDTH }
            ]
        },
        article14_2: {
            headers: [
                { leftMargin: COL1_OFFSET, width: COL1_WIDTH, text: ['Document under Article 14(2) of Regulation (EC) No 1005/2008'] },
                { leftMargin: COL2_OFFSET, width: COL2_WIDTH, text: 'Yes/No (as appropriate)' },
                { leftMargin: COL3_OFFSET, width: COL_REFERENCES_WIDTH, text: 'References (processing statement document number(s))' }
            ],
            cols: [
                { leftMargin: COL1_OFFSET, width: COL1_WIDTH },
                { leftMargin: COL2_OFFSET, width: COL2_WIDTH },
                { leftMargin: COL3_OFFSET, width: COL_REFERENCES_WIDTH }
            ]
        },
        memberState: {
            headers: [{ leftMargin: COL1_OFFSET, width: MEMBER_STATE_WIDTH, text: 'Member State and office of import' }],
            cols: [{ leftMargin: COL1_OFFSET, width: MEMBER_STATE_WIDTH }]
        },
        transport: {
            headers: [
                { leftMargin: COL1_OFFSET, width: COL1_WIDTH, text: 'Means of transport upon arrival (airplane,vehicle, ship, train)' },
                { leftMargin: COL2_OFFSET, width: COL2_WIDTH, text: 'Transport document reference' },
                { leftMargin: COL3_OFFSET, width: COL_REFERENCES_WIDTH, text: 'Estimated time of arrival (if submission under Article 12(1) of Regulation (EC) No 1005/2008' }
            ],
            cols: [
                { leftMargin: COL1_OFFSET, width: COL1_WIDTH },
                { leftMargin: COL2_OFFSET, width: COL2_WIDTH },
                { leftMargin: COL3_OFFSET, width: COL_REFERENCES_WIDTH }
            ]
        },
        customs: {
            headers: [
                { leftMargin: COL1_OFFSET, width: CUSTOMS_COL1_WIDTH, text: 'Customs declaration number (if issued)' },
                { leftMargin: CUSTOMS_COL2_OFFSET, width: CUSTOMS_COL2_WIDTH, text: 'CHED number (if available)' }
            ],
            cols: [
                { leftMargin: COL1_OFFSET, width: CUSTOMS_COL1_WIDTH },
                { leftMargin: CUSTOMS_COL2_OFFSET, width: CUSTOMS_COL2_WIDTH }
            ]
        }
    };
};

const renderSection11RegulatoryTables = (doc, yPos, headerHeight, rowHeight) => {
    const ARTIFACT_LINE_WIDTH = 1.5;
    const ARTIFACT_LINE_X_OFFSET = 225;
    const ARTIFACT_LINE_Y_ADJUSTMENT = 0.5;
    const SEPARATOR_Y_OFFSET = 5;

    const tables = getSection11TableDefinitions();
    
    yPos = addSection11Table(doc, tables.article14_1.headers, tables.article14_1.cols, yPos, headerHeight, rowHeight);
    yPos = addSection11Table(doc, tables.article14_2.headers, tables.article14_2.cols, yPos, headerHeight, rowHeight);
    yPos = addSection11Table(doc, tables.memberState.headers, tables.memberState.cols, yPos, headerHeight, rowHeight);
    yPos = addSection11Table(doc, tables.transport.headers, tables.transport.cols, yPos, headerHeight, rowHeight);
    yPos = addSection11Table(doc, tables.customs.headers, tables.customs.cols, yPos, headerHeight, rowHeight);

    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        doc.lineWidth(ARTIFACT_LINE_WIDTH);
        doc.undash();
        doc.moveTo(PdfStyle.MARGIN.LEFT + ARTIFACT_LINE_X_OFFSET, yPos + ARTIFACT_LINE_Y_ADJUSTMENT).lineTo(PdfStyle.MARGIN.LEFT + ARTIFACT_LINE_X_OFFSET, yPos + headerHeight - ARTIFACT_LINE_Y_ADJUSTMENT).stroke('#ffffff');
    }));
    PdfUtils.separator(doc, yPos + SEPARATOR_Y_OFFSET);
};

const generateSection11 = (doc, startY) => {
    const LABEL_YPOS_MULTIPLIER = 2;
    const INITIAL_YPOS_MULTIPLIER = 3;
    const HEADER_HEIGHT_MULTIPLIER = 3;
    const HEADER_HEIGHT_ADJUSTMENT = 4;
    const ROW_HEIGHT_MULTIPLIER = 3;

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + PdfStyle.ROW.HEIGHT * LABEL_YPOS_MULTIPLIER, '11    Importer Declaration:');
    }));
    
    let yPos = startY + PdfStyle.ROW.HEIGHT * INITIAL_YPOS_MULTIPLIER;
    const headerHeight = PdfStyle.ROW.HEIGHT * HEADER_HEIGHT_MULTIPLIER - HEADER_HEIGHT_ADJUSTMENT;
    const rowHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER;

    yPos = renderSection11ImporterTables(doc, yPos, headerHeight, rowHeight);
    yPos = renderSection11ProductTable(doc, yPos, headerHeight, rowHeight);
    renderSection11RegulatoryTables(doc, yPos, headerHeight, rowHeight);
}

const section17 = (doc, startY) => {
    const YPOS_OFFSET = 12;
    const CELL_HEIGHT_MULTIPLIER = 2;
    const CELL_HEIGHT_ADJUSTMENT = 3;
    const PLACE_COL_OFFSET = 15;
    const PLACE_COL_WIDTH = 155;
    const AUTHORISED_COL_OFFSET = 170;
    const AUTHORISED_COL_WIDTH = 110;
    const VERIFICATION_COL_OFFSET = 280;
    const VERIFICATION_COL_WIDTH = 110;
    const DECLARATION_COL_OFFSET = 390;
    const DECLARATION_COL_WIDTH = 140;
    const ROW_HEIGHT_MULTIPLIER = 6;
    const YPOS_INCREMENT = 5;
    const TEXT_OFFSET_X = 15;
    const SEPARATOR_OFFSET = 15;

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '4    Re-export control');
    }));
    let yPos = startY + YPOS_OFFSET;
    const cellHeight = PdfStyle.ROW.HEIGHT * CELL_HEIGHT_MULTIPLIER - CELL_HEIGHT_ADJUSTMENT;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + PLACE_COL_OFFSET, yPos, PLACE_COL_WIDTH, cellHeight, 'Place')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + AUTHORISED_COL_OFFSET, yPos, AUTHORISED_COL_WIDTH, cellHeight, 'Re-export authorised (*)')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + VERIFICATION_COL_OFFSET, yPos, VERIFICATION_COL_WIDTH, cellHeight, 'Verification requested (*)')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + DECLARATION_COL_OFFSET, yPos, DECLARATION_COL_WIDTH, cellHeight, ['Re-export declaration', 'number and date']))
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + PLACE_COL_OFFSET, yPos + cellHeight, PLACE_COL_WIDTH, PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + AUTHORISED_COL_OFFSET, yPos + cellHeight, AUTHORISED_COL_WIDTH, PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + VERIFICATION_COL_OFFSET, yPos + cellHeight, VERIFICATION_COL_WIDTH, PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + DECLARATION_COL_OFFSET, yPos + cellHeight, DECLARATION_COL_WIDTH, PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER))
            ])
        ])
    ]));

    yPos += cellHeight + PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER + YPOS_INCREMENT;
    doc.addStructure(doc.struct('P', () => {
        doc.text('* Tick as appropriate', PdfStyle.MARGIN.LEFT + TEXT_OFFSET_X, yPos);
    }));

    PdfUtils.separator(doc, yPos + SEPARATOR_OFFSET);
};

const section16 = (doc, startY) => {
    const YPOS_OFFSET = 12;
    const CELL_HEIGHT_MULTIPLIER = 6;
    const NAME_COL_OFFSET = 15;
    const NAME_COL_WIDTH = 210;
    const SIGNATURE_COL_OFFSET = 225;
    const SIGNATURE_COL_WIDTH = 110;
    const DATE_COL_OFFSET = 335;
    const DATE_COL_WIDTH = 95;
    const SEAL_COL_OFFSET = 430;
    const SEAL_COL_WIDTH = 100;
    const SEPARATOR_OFFSET = 8;

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '3    Authority');
    }));
    const yPos = startY + YPOS_OFFSET;
    const cellHeight = PdfStyle.ROW.HEIGHT * CELL_HEIGHT_MULTIPLIER;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + NAME_COL_OFFSET, yPos, NAME_COL_WIDTH, PdfStyle.ROW.HEIGHT, 'Name / title')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SIGNATURE_COL_OFFSET, yPos, SIGNATURE_COL_WIDTH, PdfStyle.ROW.HEIGHT, 'Signature')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + DATE_COL_OFFSET, yPos, DATE_COL_WIDTH, PdfStyle.ROW.HEIGHT, 'Date')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SEAL_COL_OFFSET, yPos, SEAL_COL_WIDTH, PdfStyle.ROW.HEIGHT, 'Seal'))
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + NAME_COL_OFFSET, yPos + PdfStyle.ROW.HEIGHT, NAME_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SIGNATURE_COL_OFFSET, yPos + PdfStyle.ROW.HEIGHT, SIGNATURE_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + DATE_COL_OFFSET, yPos + PdfStyle.ROW.HEIGHT, DATE_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SEAL_COL_OFFSET, yPos + PdfStyle.ROW.HEIGHT, SEAL_COL_WIDTH, cellHeight))
            ])
        ])
    ]));

    PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT + cellHeight + SEPARATOR_OFFSET);
};

const section15 = (doc, startY) => {
    const CELL_HEIGHT_MULTIPLIER = 6;
    const NAME_COL_OFFSET = 15;
    const NAME_COL_WIDTH = 140;
    const ADDRESS_COL_OFFSET = 155;
    const ADDRESS_COL_WIDTH = 215;
    const SIGNATURE_COL_OFFSET = 370;
    const SIGNATURE_COL_WIDTH = 90;
    const DATE_COL_OFFSET = 460;
    const DATE_COL_WIDTH = 70;
    const SEPARATOR_OFFSET = 8;

    const yPos = startY;
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '2');
    }));

    const cellHeight = PdfStyle.ROW.HEIGHT * CELL_HEIGHT_MULTIPLIER;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT + NAME_COL_OFFSET, yPos, NAME_COL_WIDTH, PdfStyle.ROW.HEIGHT, 'Name of re-exporter')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + ADDRESS_COL_OFFSET, yPos, ADDRESS_COL_WIDTH, PdfStyle.ROW.HEIGHT, 'Address')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SIGNATURE_COL_OFFSET, yPos, SIGNATURE_COL_WIDTH, PdfStyle.ROW.HEIGHT, 'Signature')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + DATE_COL_OFFSET, yPos, DATE_COL_WIDTH, PdfStyle.ROW.HEIGHT, 'Date'))
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + NAME_COL_OFFSET, yPos + PdfStyle.ROW.HEIGHT, NAME_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + ADDRESS_COL_OFFSET, yPos + PdfStyle.ROW.HEIGHT, ADDRESS_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SIGNATURE_COL_OFFSET, yPos + PdfStyle.ROW.HEIGHT, SIGNATURE_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + DATE_COL_OFFSET, yPos + PdfStyle.ROW.HEIGHT, DATE_COL_WIDTH, cellHeight))
            ])
        ])
    ]));

    PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT + cellHeight + SEPARATOR_OFFSET);
};

const section14 = (doc, startY) => {
    const YPOS_INCREMENT = 12;
    const CELL_HEIGHT_MULTIPLIER = 2;
    const CELL_HEIGHT_ADJUSTMENT = 3;
    const SPECIES_COL_OFFSET = 15;
    const SPECIES_COL_WIDTH = 205;
    const PRODUCT_CODE_COL_OFFSET = 220;
    const PRODUCT_CODE_COL_WIDTH = 150;
    const BALANCE_COL_OFFSET = 370;
    const BALANCE_COL_WIDTH = 160;
    const ROW_HEIGHT_MULTIPLIER = 10;
    const SEPARATOR_OFFSET = 8;

    let yPos = startY;
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '1    Description of re-exported product');
    }));
    yPos += YPOS_INCREMENT;
    const cellHeight = PdfStyle.ROW.HEIGHT * CELL_HEIGHT_MULTIPLIER - CELL_HEIGHT_ADJUSTMENT;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SPECIES_COL_OFFSET, yPos, SPECIES_COL_WIDTH, cellHeight, 'Species')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + PRODUCT_CODE_COL_OFFSET, yPos, PRODUCT_CODE_COL_WIDTH, cellHeight, 'Product code')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + BALANCE_COL_OFFSET, yPos, BALANCE_COL_WIDTH, cellHeight, ['Balance from total quantity declared', 'in the catch certificate'])),
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SPECIES_COL_OFFSET, yPos + cellHeight, SPECIES_COL_WIDTH, PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + PRODUCT_CODE_COL_OFFSET, yPos + cellHeight, PRODUCT_CODE_COL_WIDTH, PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + BALANCE_COL_OFFSET, yPos + cellHeight, BALANCE_COL_WIDTH, PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER)),
            ])
        ])
    ]));

    PdfUtils.separator(doc, (yPos + cellHeight) + (PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER) + SEPARATOR_OFFSET);
};

const section13 = (doc, startY) => {

    // Section 13 - Refusal of catch certificate (EU2026 changes)
    const ROW_MULTIPLIER_FOR_YPOS = 3;
    const HEADER_HEIGHT_MULTIPLIER = 2;
    const ROW_HEIGHT_ADDITION = 20;
    const CELL_HEIGHT_MULTIPLIER = 2;
    const REFUSAL_COL_OFFSET = 15;
    const REFUSAL_COL_WIDTH = 85;
    const PROVISION_COL_OFFSET = 100;
    const PROVISION_COL_WIDTH = 350;
    const TICK_COL_OFFSET = 450;
    const TICK_COL_WIDTH = 80;

    const yPos = startY + PdfStyle.ROW.HEIGHT * ROW_MULTIPLIER_FOR_YPOS;
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '13');
    }));
    const headerHeight = PdfStyle.ROW.HEIGHT * HEADER_HEIGHT_MULTIPLIER - ROW_MULTIPLIER_FOR_YPOS;
    const rowHeight = PdfStyle.ROW.HEIGHT + ROW_HEIGHT_ADDITION;
    const cellHeight = PdfStyle.ROW.HEIGHT * CELL_HEIGHT_MULTIPLIER - ROW_MULTIPLIER_FOR_YPOS;

    // Build table head and body with three columns: blank left column, provision text, tick column
    const provisionTexts = [
        'Article 18(1), point (a)',
        'Article 18(1), point (b)',
        'Article 18(1), point (c)',
        'Article 18(1), point (d)',
        'Article 18(1), point (e)',
        'Article 18(1), point (f)',
        'Article 18(1), point (g)',
        'Article 18(2), point (a)',
        'Article 18(2), point (b)',
        'Article 18(2), point (c)',
        'Article 18(2), point (d)'
    ];
    
    const myTable = doc.struct('Table');
    doc.addStructure(myTable);

    const tableHead = doc.struct('THead');
    myTable.add(tableHead);

    const tableHeadRow = doc.struct('TR');
    tableHead.add(tableHeadRow);

    const th1 = doc.struct('TH', () => PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + REFUSAL_COL_OFFSET, yPos, REFUSAL_COL_WIDTH, headerHeight, 'Refusal of catch certificate'));
    const th2 = doc.struct('TH', () => PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + PROVISION_COL_OFFSET, yPos, PROVISION_COL_WIDTH, headerHeight, 'Catch certificate refused on the basis of the following provision of Regulation (EC) No 1005/2008:'));
    const th3 = doc.struct('TH', () => PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + TICK_COL_OFFSET, yPos, TICK_COL_WIDTH, headerHeight, 'Tick as appropriate'));
    
    tableHeadRow.add(th1);
    tableHeadRow.add(th2);
    tableHeadRow.add(th3);
    tableHeadRow.end();
    tableHead.end();

    const tableBody = doc.struct('TBody');
    myTable.add(tableBody);

    provisionTexts.forEach((text, idx) => {
        const rowY = yPos + headerHeight + (rowHeight * idx);
        const tableBodyRow = doc.struct('TR');
        tableBody.add(tableBodyRow);

        if (idx === 0) {
            const totalRowsHeight = rowHeight * provisionTexts.length;
            const td1 = doc.struct('TD', () => PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + REFUSAL_COL_OFFSET, yPos + cellHeight, REFUSAL_COL_WIDTH, totalRowsHeight));
            tableBodyRow.add(td1);
        }
        
        const td2 = doc.struct('TD', () => PdfUtils.fieldBgWhite(doc, PdfStyle.MARGIN.LEFT + PROVISION_COL_OFFSET, rowY, PROVISION_COL_WIDTH, rowHeight, text));
        const td3 = doc.struct('TD', () => PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + TICK_COL_OFFSET, rowY, TICK_COL_WIDTH, rowHeight));
        
        tableBodyRow.add(td2);
        tableBodyRow.add(td3);
        tableBodyRow.end();
    });

    tableBody.end();
    myTable.end();
};

const section12 = (doc, startY) => {
    const YPOS_MULTIPLIER = 3;
    const HEADER_HEIGHT_MULTIPLIER = 2;
    const HEADER_HEIGHT_ADJUSTMENT = 3;
    const ROW_HEIGHT_MULTIPLIER = 3;
    const AUTHORITY_COL_OFFSET = 15;
    const AUTHORITY_COL_WIDTH = 150;
    const PLACE_COL_OFFSET = 165;
    const PLACE_COL_WIDTH = 105;
    const AUTHORISED_COL_OFFSET = 270;
    const AUTHORISED_COL_WIDTH = 80;
    const SUSPENDED_COL_OFFSET = 350;
    const SUSPENDED_COL_WIDTH = 80;
    const VERIFICATION_COL_OFFSET = 430;
    const VERIFICATION_COL_WIDTH = 100;
    const YPOS_INCREMENT = 5;
    const TEXT_OFFSET_X = 15;

    let yPos = startY + PdfStyle.ROW.HEIGHT * YPOS_MULTIPLIER;
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '12');
    }));

    const headerHeight =  PdfStyle.ROW.HEIGHT * HEADER_HEIGHT_MULTIPLIER - HEADER_HEIGHT_ADJUSTMENT;
    const rowHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT + AUTHORITY_COL_OFFSET, yPos, AUTHORITY_COL_WIDTH, headerHeight, 'Import Control Authority')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + PLACE_COL_OFFSET, yPos, PLACE_COL_WIDTH, headerHeight, 'Place')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + AUTHORISED_COL_OFFSET, yPos, AUTHORISED_COL_WIDTH, headerHeight, ['Importation', 'authorised*'])),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SUSPENDED_COL_OFFSET, yPos, SUSPENDED_COL_WIDTH, headerHeight, ['Importation', 'suspended*'])),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + VERIFICATION_COL_OFFSET, yPos, VERIFICATION_COL_WIDTH, headerHeight, ['Verification requested', '– date']))
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + AUTHORITY_COL_OFFSET, yPos + headerHeight, AUTHORITY_COL_WIDTH, rowHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + PLACE_COL_OFFSET, yPos + headerHeight, PLACE_COL_WIDTH, rowHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + AUTHORISED_COL_OFFSET, yPos + headerHeight, AUTHORISED_COL_WIDTH, rowHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SUSPENDED_COL_OFFSET, yPos + headerHeight, SUSPENDED_COL_WIDTH, rowHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + VERIFICATION_COL_OFFSET, yPos + headerHeight, VERIFICATION_COL_WIDTH, rowHeight))
            ])
        ])
    ]));
    yPos += headerHeight + rowHeight + YPOS_INCREMENT;
    doc.addStructure(doc.struct('P', () => {
        doc.text('* Tick as appropriate', PdfStyle.MARGIN.LEFT + TEXT_OFFSET_X, yPos);
    }));
};

const section11 = (doc, startY) => {
    generateSection11(doc, startY);
};

const section10 = (doc, startY) => {
    const YPOS_OFFSET = 12;
    const SEPARATOR_OFFSET_Y = 36;

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + YPOS_OFFSET, '10    Transport details: See Appendix I');
    }));
    PdfUtils.separator(doc, startY + SEPARATOR_OFFSET_Y);
};

const section9 = (doc, data, isSample, buff, startY) => {
    const YPOS_OFFSET = 12;
    const CELL_HEIGHT_MULTIPLIER = 2;
    const CELL_HEIGHT_ADJUSTMENT = 3;
    const FIELD_OFFSET_X = 15;
    const FIELD_WIDTH = 250;
    const QR_CODE_OFFSET_X = 80;
    const SEPARATOR_OFFSET_Y = 66;

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '9    Flag State Authority Validation:');
    }));
    const yPos = startY + YPOS_OFFSET;
    const cellHeight = PdfStyle.ROW.HEIGHT * CELL_HEIGHT_MULTIPLIER - CELL_HEIGHT_ADJUSTMENT;

    let dateIssued = PdfUtils.todaysDate();
    if (data.isBlankTemplate) {
        dateIssued = '';
    }

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + FIELD_OFFSET_X, yPos, FIELD_WIDTH, PdfStyle.ROW.HEIGHT, 'Date Issued')),
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=>  PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + FIELD_OFFSET_X, yPos + PdfStyle.ROW.HEIGHT, FIELD_WIDTH, cellHeight, dateIssued)),
            ])
        ])
    ]));

    // QR code positioned to the right of Date Issued field
    const qrXPosition = PdfStyle.MARGIN.LEFT + FIELD_OFFSET_X + FIELD_WIDTH + QR_CODE_OFFSET_X;
    
    if (!data.isBlankTemplate && !isSample) {
        PdfUtils.qrCode(doc, buff, qrXPosition, startY);
    }

    PdfUtils.separator(doc, startY + SEPARATOR_OFFSET_Y);
};

const SECTION8_CELL_HEIGHT_MULTIPLIER = 7; // Avoid magic number

const SECTION8_PARAGRAPH_OFFSET = 5; // Avoid magic number

const section8 = (doc, data, startY) => {

    let yPos = startY;
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '8');
    }));

    const cellHeight = PdfStyle.ROW.HEIGHT * SECTION8_CELL_HEIGHT_MULTIPLIER + 2;

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

    const EXPORTER_NAME_COL_OFFSET = 15;
    const EXPORTER_NAME_COL_WIDTH = 230;
    const SIGNATURE_COL_OFFSET = 245;
    const SIGNATURE_COL_WIDTH = 115;
    const DATE_ACCEPTANCE_COL_OFFSET = 360;
    const DATE_ACCEPTANCE_COL_WIDTH = 95;
    const SEAL_COL_OFFSET = 455;
    const SEAL_COL_WIDTH = 75;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT + EXPORTER_NAME_COL_OFFSET, yPos, EXPORTER_NAME_COL_WIDTH, PdfStyle.ROW.HEIGHT, 'Name and address of Exporter')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SIGNATURE_COL_OFFSET, yPos, SIGNATURE_COL_WIDTH, PdfStyle.ROW.HEIGHT, 'Signature')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + DATE_ACCEPTANCE_COL_OFFSET, yPos, DATE_ACCEPTANCE_COL_WIDTH, PdfStyle.ROW.HEIGHT, 'Date of acceptance(*)')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SEAL_COL_OFFSET, yPos, SEAL_COL_WIDTH, PdfStyle.ROW.HEIGHT, 'Seal'))
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + EXPORTER_NAME_COL_OFFSET, yPos + PdfStyle.ROW.HEIGHT, EXPORTER_NAME_COL_WIDTH, cellHeight,
                    [exporterFullName, exporterCompanyName, exporterAddress])),
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + SIGNATURE_COL_OFFSET, yPos + PdfStyle.ROW.HEIGHT, SIGNATURE_COL_WIDTH, cellHeight, exporterFullName)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + DATE_ACCEPTANCE_COL_OFFSET, yPos + PdfStyle.ROW.HEIGHT, DATE_ACCEPTANCE_COL_WIDTH, cellHeight, dateOfAcceptance)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SEAL_COL_OFFSET, yPos + PdfStyle.ROW.HEIGHT, SEAL_COL_WIDTH, cellHeight))
            ])
        ])
    ]));

    yPos += cellHeight + SECTION8_PARAGRAPH_OFFSET + PdfStyle.ROW.HEIGHT;
    // Constant for exporter acceptance label X offset to avoid magic number
    const EXPORTER_ACCEPTANCE_LABEL_X_OFFSET = 15;
    
        doc.addStructure(doc.struct('P', () => {
            doc.text('* Date of acceptance by exporter of the veracity of the contents of this document', PdfStyle.MARGIN.LEFT + EXPORTER_ACCEPTANCE_LABEL_X_OFFSET, yPos);
        }));

    PdfUtils.separator(doc, startY + SECTION2_SEPARATOR_OFFSET_Y);
};

const renderSection7LandingAuthTable = (doc, yPos, cellHeight) => {
    const NAME_COL_OFFSET = 15;
    const NAME_COL_WIDTH = 65;
    const AUTHORITY_COL_OFFSET = 80;
    const AUTHORITY_COL_WIDTH = 60;
    const SIGNATURE_COL_OFFSET = 140;
    const SIGNATURE_COL_WIDTH = 60;
    const ADDRESS_COL_OFFSET = 200;
    const ADDRESS_COL_WIDTH = 65;
    const TEL_COL_OFFSET = 265;
    const TEL_COL_WIDTH = 60;
    const PORT_LANDING_COL_OFFSET = 325;
    const PORT_LANDING_COL_WIDTH = 75;
    const DATE_LANDING_COL_OFFSET = 400;
    const DATE_LANDING_COL_WIDTH = 130;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + NAME_COL_OFFSET, yPos, NAME_COL_WIDTH, cellHeight, 'Name')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + AUTHORITY_COL_OFFSET, yPos, AUTHORITY_COL_WIDTH, cellHeight, 'Authority')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SIGNATURE_COL_OFFSET, yPos, SIGNATURE_COL_WIDTH, cellHeight, 'Signature')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + ADDRESS_COL_OFFSET, yPos, ADDRESS_COL_WIDTH, cellHeight, 'Address')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + TEL_COL_OFFSET, yPos, TEL_COL_WIDTH, cellHeight, 'Tel.')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + PORT_LANDING_COL_OFFSET, yPos, PORT_LANDING_COL_WIDTH, cellHeight, 'Port of landing (as appropriate)')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + DATE_LANDING_COL_OFFSET, yPos, DATE_LANDING_COL_WIDTH, cellHeight, 'Date of landing (as appropriate)')),
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + NAME_COL_OFFSET, yPos + cellHeight, NAME_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + AUTHORITY_COL_OFFSET, yPos + cellHeight, AUTHORITY_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SIGNATURE_COL_OFFSET, yPos + cellHeight, SIGNATURE_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + ADDRESS_COL_OFFSET, yPos + cellHeight, ADDRESS_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + TEL_COL_OFFSET, yPos + cellHeight, TEL_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + PORT_LANDING_COL_OFFSET, yPos + cellHeight, PORT_LANDING_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + DATE_LANDING_COL_OFFSET, yPos + cellHeight, DATE_LANDING_COL_WIDTH, cellHeight)),
            ])
        ])
    ]));
};

const renderSection7TranshipmentTable = (doc, yPos, cellHeight) => {
    const IMO_VESSEL_COL_OFFSET = 15;
    const IMO_VESSEL_COL_WIDTH = 185;
    const PORT_TRANSHIP_COL_OFFSET = 200;
    const PORT_TRANSHIP_COL_WIDTH = 125;
    const DATE_TRANSHIP_COL_OFFSET = 325;
    const DATE_TRANSHIP_COL_WIDTH = 75;
    const RECEIVING_VESSEL_COL_OFFSET = 400;
    const RECEIVING_VESSEL_COL_WIDTH = 50;
    const SEAL1_COL_OFFSET = 450;
    const SEAL1_COL_WIDTH = 40;
    const SEAL2_COL_OFFSET = 490;
    const SEAL2_COL_WIDTH = 40;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + IMO_VESSEL_COL_OFFSET, yPos, IMO_VESSEL_COL_WIDTH, cellHeight, IMO_VESSEL_IDENTIFIER_TEXT)),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + PORT_TRANSHIP_COL_OFFSET, yPos, PORT_TRANSHIP_COL_WIDTH, cellHeight, 'Port of transhipment (as appropriate)')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + DATE_TRANSHIP_COL_OFFSET, yPos, DATE_TRANSHIP_COL_WIDTH, cellHeight, 'Date of transhipment (as appropriate)')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + RECEIVING_VESSEL_COL_OFFSET, yPos, RECEIVING_VESSEL_COL_WIDTH, cellHeight, 'Name and registration number of receiving vessel')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SEAL1_COL_OFFSET, yPos, SEAL1_COL_WIDTH, cellHeight, 'Seal (Stamp)')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SEAL2_COL_OFFSET, yPos, SEAL2_COL_WIDTH, cellHeight, 'Seal (Stamp)'))
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + IMO_VESSEL_COL_OFFSET, yPos + cellHeight, IMO_VESSEL_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + PORT_TRANSHIP_COL_OFFSET, yPos + cellHeight, PORT_TRANSHIP_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + DATE_TRANSHIP_COL_OFFSET, yPos + cellHeight, DATE_TRANSHIP_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + RECEIVING_VESSEL_COL_OFFSET, yPos + cellHeight, RECEIVING_VESSEL_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SEAL1_COL_OFFSET, yPos + cellHeight, SEAL1_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SEAL2_COL_OFFSET, yPos + cellHeight, SEAL2_COL_WIDTH, cellHeight))
            ])
        ])
    ]));
};

const section7 = (doc, startY) => {
    const YPOS_OFFSET = 12;
    const CELL_HEIGHT_MULTIPLIER = 2.5;
    const CELL_HEIGHT_ADJUSTMENT = 6;
    const YPOS_INCREMENT_BETWEEN_TABLES = 32;
    const SECOND_TABLE_HEIGHT_MULTIPLIER = 4.5;
    const SEPARATOR_OFFSET = 209;

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '7    Transhipment and/or landing authorisation within a port area:');
    }));
    
    let yPos = startY + YPOS_OFFSET;
    let cellHeight = PdfStyle.ROW.HEIGHT * CELL_HEIGHT_MULTIPLIER - CELL_HEIGHT_ADJUSTMENT;

    renderSection7LandingAuthTable(doc, yPos, cellHeight);
    
    yPos += cellHeight + YPOS_INCREMENT_BETWEEN_TABLES;
    cellHeight = PdfStyle.ROW.HEIGHT * SECOND_TABLE_HEIGHT_MULTIPLIER - CELL_HEIGHT_ADJUSTMENT;
    
    renderSection7TranshipmentTable(doc, yPos, cellHeight);
    
    PdfUtils.separator(doc, startY + SEPARATOR_OFFSET);
};

const section6 = (doc, startY) => {
    const CELL_HEIGHT_MULTIPLIER = 2;
    const DECLARATION_COL_OFFSET = 15;
    const DECLARATION_COL_WIDTH = 220;
    const SIGNATURE_DATE_COL_OFFSET = 235;
    const SIGNATURE_DATE_COL_WIDTH = 100;
    const TRANSHIPMENT_COL_OFFSET = 335;
    const TRANSHIPMENT_COL_WIDTH = 115;
    const ESTIMATED_WEIGHT_COL_OFFSET = 450;
    const ESTIMATED_WEIGHT_COL_WIDTH = 80;
    const YPOS_INCREMENT = 30;

    let yPos = startY;
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '6');
    }));

    const cellHeight = PdfStyle.ROW.HEIGHT * CELL_HEIGHT_MULTIPLIER;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT + DECLARATION_COL_OFFSET, yPos, DECLARATION_COL_WIDTH, cellHeight, ['Declaration of Transhipment at Sea', 'Name of Master of Fishing Vessel'])),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SIGNATURE_DATE_COL_OFFSET, yPos, SIGNATURE_DATE_COL_WIDTH, cellHeight, ['Signature', 'and Date'])),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + TRANSHIPMENT_COL_OFFSET, yPos, TRANSHIPMENT_COL_WIDTH, cellHeight, ['Transhipment', 'Date/Area/Position'])),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + ESTIMATED_WEIGHT_COL_OFFSET, yPos, ESTIMATED_WEIGHT_COL_WIDTH, cellHeight, 'Estimated weight (kg)'))
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + DECLARATION_COL_OFFSET, yPos + cellHeight, DECLARATION_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SIGNATURE_DATE_COL_OFFSET, yPos + cellHeight, SIGNATURE_DATE_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + TRANSHIPMENT_COL_OFFSET, yPos + cellHeight, TRANSHIPMENT_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + ESTIMATED_WEIGHT_COL_OFFSET, yPos + cellHeight, ESTIMATED_WEIGHT_COL_WIDTH, cellHeight))
            ])
        ])
    ]));
    yPos += cellHeight + YPOS_INCREMENT;

    const MASTER_COL_OFFSET = 15;
    const MASTER_COL_WIDTH = 100;
    const SIGNATURE_COL_OFFSET = 115;
    const SIGNATURE_COL_WIDTH = 100;
    const VESSEL_NAME_COL_OFFSET = 215;
    const VESSEL_NAME_COL_WIDTH = 90;
    const CALL_SIGN_COL_OFFSET = 305;
    const CALL_SIGN_COL_WIDTH = 90;
    const IMO_IDENTIFIER_COL_OFFSET = 395;
    const IMO_IDENTIFIER_COL_WIDTH = 135;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + MASTER_COL_OFFSET, yPos, MASTER_COL_WIDTH, cellHeight, ['Master of Receiving', 'Vessel'])),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SIGNATURE_COL_OFFSET, yPos, SIGNATURE_COL_WIDTH, cellHeight, 'Signature')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + VESSEL_NAME_COL_OFFSET, yPos, VESSEL_NAME_COL_WIDTH, cellHeight, 'Vessel Name')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + CALL_SIGN_COL_OFFSET, yPos, CALL_SIGN_COL_WIDTH, cellHeight, 'Call Sign')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + IMO_IDENTIFIER_COL_OFFSET, yPos, IMO_IDENTIFIER_COL_WIDTH, cellHeight, [IMO_VESSEL_IDENTIFIER_TEXT]))
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + MASTER_COL_OFFSET, yPos + cellHeight, MASTER_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SIGNATURE_COL_OFFSET, yPos + cellHeight, SIGNATURE_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + VESSEL_NAME_COL_OFFSET, yPos + cellHeight, VESSEL_NAME_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + CALL_SIGN_COL_OFFSET, yPos + cellHeight, CALL_SIGN_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + IMO_IDENTIFIER_COL_OFFSET, yPos + cellHeight, IMO_IDENTIFIER_COL_WIDTH, cellHeight))
            ])
        ])
    ]));
    
    const SEPARATOR_OFFSET = 130;
    PdfUtils.separator(doc, startY + SEPARATOR_OFFSET);
};

const section5 = (doc, data, startY) => {
    const FIELD_OFFSET_X = 15;
    const FIELD_WIDTH = 515;
    const YPOS_INCREMENT = 5;
    const TEXT_OFFSET_X = 15;
    const SEPARATOR_OFFSET_Y = 45;

    let yPos = startY;
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '5    Name of master of fishing vessel or of fishing licence holder – Signature:');
    }));

    yPos += PdfStyle.ROW.HEIGHT;

    const licenceHolder = isMultiVessel(data.exportPayload) ? "Multiple vessels - See schedule" : getLicenceHolder(data.exportPayload);
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + FIELD_OFFSET_X, yPos, FIELD_WIDTH, PdfStyle.ROW.HEIGHT, licenceHolder);
    }));

    yPos += PdfStyle.ROW.HEIGHT + YPOS_INCREMENT;

    doc.addStructure(doc.struct('P', () => {
        doc.text('* I am a representative of the vessel (s) shown on this document', PdfStyle.MARGIN.LEFT + TEXT_OFFSET_X, yPos);
    }));
    PdfUtils.separator(doc, startY + SEPARATOR_OFFSET_Y);
};

const section4 = (doc, data, startY) => {
    const FIELD_OFFSET_X = 15;
    const FIELD_OFFSET_Y = 12;
    const FIELD_WIDTH = 515;
    const FIELD_HEIGHT_MULTIPLIER = 2;
    const SEPARATOR_OFFSET_Y = 52;

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '4    References to applicable conservation and management measures');
    }));
    let policy = '';
    if (data.conservation) {
        policy = data.conservation.conservationReference === 'Other' ? data.conservation.anotherConservation : data.conservation.conservationReference;
    }
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + FIELD_OFFSET_X, startY + FIELD_OFFSET_Y, FIELD_WIDTH, PdfStyle.ROW.HEIGHT * FIELD_HEIGHT_MULTIPLIER, policy);
    }));
    PdfUtils.separator(doc, startY + SEPARATOR_OFFSET_Y);
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
    const accum = {};
    if (items.length > 0) {
        items.forEach((item) => {
            item.landings.forEach((landing) => {
                const dte = moment(landing.model.dateLanded).format(DATE_FORMAT_DDMMYYYY);
                let faoArea = 'FAO27';
                if (landing.model.faoArea && landing.model.faoArea.length > 0) {
                    faoArea = landing.model.faoArea;
                }
                const accumItem = accum[item.product.species.code + item.product.commodityCode + faoArea +landing.model.vessel.vesselName + landing.model.vessel.pln + dte];
                if (accumItem) {
                    const accumTotal = Number.parseFloat(accumItem.exportWeight) + Number.parseFloat(landing.model.exportWeight)
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


const MAX_EXPORT_WEIGHT = 9999999.99;

function getExportWeight(weight) {
    const numericWeight = Number(weight);
    return `${numericWeight > MAX_EXPORT_WEIGHT ? Number.parseInt(numericWeight) : numericWeight.toFixed(2)}`;
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
    } else {
        return '';
    }
}

function getImoOrCfr(vesselCounts, data) {
    if (Object.keys(vesselCounts).length === 1) {
        if (data.exportPayload.items[0].landings[0].model.vessel.imoNumber) {
            return data.exportPayload.items[0].landings[0].model.vessel.imoNumber;
        } else if (data.exportPayload.items[0].landings[0].model.vessel.cfr) {
            return data.exportPayload.items[0].landings[0].model.vessel.cfr;
        } else {
            return '';
        }
    }
    return '';
}

const renderSection3HeaderAndField = (doc, startY) => {
    const LABEL_OFFSET_X = 15;
    const LABEL_OFFSET_Y = 14;
    const FIELD_OFFSET_Y = 26;
    const FIELD_WIDTH = 515;

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '3    Description of Product');
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + LABEL_OFFSET_X, startY + LABEL_OFFSET_Y, 'Type of processing authorised on board:');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + LABEL_OFFSET_X, startY + FIELD_OFFSET_Y, FIELD_WIDTH, PdfStyle.ROW.HEIGHT);
    }));
};

const renderSection3TableHeader = (doc, tableHeadRow, startY, cellHeight) => {
    const TABLE_OFFSET_Y = 48;
    const SPECIES_COL_OFFSET = 15;
    const SPECIES_COL_WIDTH = 110;
    const PRODUCT_CODE_COL_OFFSET = 125;
    const PRODUCT_CODE_COL_WIDTH = 55;
    const CATCH_AREA_COL_OFFSET = 180;
    const CATCH_AREA_COL_WIDTH = 80;
    const CATCH_DATE_COL_OFFSET = 260;
    const CATCH_DATE_COL_WIDTH = 80;
    const ESTIMATED_WEIGHT_COL_OFFSET = 340;
    const ESTIMATED_WEIGHT_COL_WIDTH = 55;
    const NET_CATCH_WEIGHT_COL_OFFSET = 395;
    const NET_CATCH_WEIGHT_COL_WIDTH = 55;
    const VERIFIED_WEIGHT_COL_OFFSET = 450;
    const VERIFIED_WEIGHT_COL_WIDTH = 80;

    createSection3HeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + SPECIES_COL_OFFSET, startY + TABLE_OFFSET_Y, SPECIES_COL_WIDTH, cellHeight, 'Species');
    createSection3HeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + PRODUCT_CODE_COL_OFFSET, startY + TABLE_OFFSET_Y, PRODUCT_CODE_COL_WIDTH, cellHeight, 'Product Code');
    createSection3HeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + CATCH_AREA_COL_OFFSET, startY + TABLE_OFFSET_Y, CATCH_AREA_COL_WIDTH, cellHeight, ['Catch Area(s)', '(Catch Area,', 'EEZ, RFMO,', 'High Seas)']);
    createSection3HeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + CATCH_DATE_COL_OFFSET, startY + TABLE_OFFSET_Y, CATCH_DATE_COL_WIDTH, cellHeight, ['Catch Date(s)', '(from - to)']);
    createSection3HeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + ESTIMATED_WEIGHT_COL_OFFSET, startY + TABLE_OFFSET_Y, ESTIMATED_WEIGHT_COL_WIDTH, cellHeight, 'Estimated weight to be landed in kg');
    createSection3HeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + NET_CATCH_WEIGHT_COL_OFFSET, startY + TABLE_OFFSET_Y, NET_CATCH_WEIGHT_COL_WIDTH, cellHeight, 'Net catch weight in kg');
    createSection3HeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + VERIFIED_WEIGHT_COL_OFFSET, startY + TABLE_OFFSET_Y, VERIFIED_WEIGHT_COL_WIDTH, cellHeight, 'Verified weight landed (net catch weight in kg)');
};

const renderSection3TableBody = (doc, tableBody, startY, cellHeight, rowData, arrLength, allRowsLength) => {
    const TABLE_OFFSET_Y = 48;
    const SPECIES_COL_OFFSET = 15;
    const SPECIES_COL_WIDTH = 110;
    const PRODUCT_CODE_COL_OFFSET = 125;
    const PRODUCT_CODE_COL_WIDTH = 55;
    const CATCH_AREA_COL_OFFSET = 180;
    const CATCH_AREA_COL_WIDTH = 80;
    const CATCH_DATE_COL_OFFSET = 260;
    const CATCH_DATE_COL_WIDTH = 80;
    const ESTIMATED_WEIGHT_COL_OFFSET = 340;
    const ESTIMATED_WEIGHT_COL_WIDTH = 55;
    const NET_CATCH_WEIGHT_COL_OFFSET = 395;
    const NET_CATCH_WEIGHT_COL_WIDTH = 55;
    const VERIFIED_WEIGHT_COL_OFFSET = 450;
    const VERIFIED_WEIGHT_COL_WIDTH = 80;
    const ROW_HEIGHT_ADDITION = 30;
    const ROW_INCREMENT = 30;
    const LIST_LIMIT = 6;
    const CATCH_AREA_LINE_SPACING = 4;
    const CATCH_DATE_LINE_SPACING = 2;
    const SEE_SCHEDULE_CELL_HEIGHT_MULTIPLIER = 6;
    const FIELD_WIDTH = 515;

    let y = startY + TABLE_OFFSET_Y + cellHeight;
    let listLimit = LIST_LIMIT;
    if (arrLength > LIST_LIMIT) {
        listLimit = 0;
    }

    for (let rowIdx = 0; rowIdx < listLimit; rowIdx++) {
        const tableBodyRow = doc.struct('TR');
        tableBody.add(tableBodyRow);

        const hasData = rowIdx < arrLength;
        const rowCellData = getSection3RowData(rowIdx, arrLength, rowData, hasData);

        createSection3DataCell(doc, tableBodyRow, { x: PdfStyle.MARGIN.LEFT + SPECIES_COL_OFFSET, y, width: SPECIES_COL_WIDTH, height: PdfStyle.ROW.HEIGHT + ROW_HEIGHT_ADDITION, content: rowCellData.speciesText });
        createSection3DataCell(doc, tableBodyRow, { x: PdfStyle.MARGIN.LEFT + PRODUCT_CODE_COL_OFFSET, y, width: PRODUCT_CODE_COL_WIDTH, height: PdfStyle.ROW.HEIGHT + ROW_HEIGHT_ADDITION, content: rowCellData.commodityCodeText });
        createSection3DataCell(doc, tableBodyRow, { x: PdfStyle.MARGIN.LEFT + CATCH_AREA_COL_OFFSET, y, width: CATCH_AREA_COL_WIDTH, height: PdfStyle.ROW.HEIGHT + ROW_HEIGHT_ADDITION, content: rowCellData.catchAreasText, lineSpacing: CATCH_AREA_LINE_SPACING });
        createSection3DataCell(doc, tableBodyRow, { x: PdfStyle.MARGIN.LEFT + CATCH_DATE_COL_OFFSET, y, width: CATCH_DATE_COL_WIDTH, height: PdfStyle.ROW.HEIGHT + ROW_HEIGHT_ADDITION, content: rowCellData.datesText, lineSpacing: CATCH_DATE_LINE_SPACING });
        createSection3DataCell(doc, tableBodyRow, { x: PdfStyle.MARGIN.LEFT + ESTIMATED_WEIGHT_COL_OFFSET, y, width: ESTIMATED_WEIGHT_COL_WIDTH, height: PdfStyle.ROW.HEIGHT + ROW_HEIGHT_ADDITION, content: '' });
        createSection3DataCell(doc, tableBodyRow, { x: PdfStyle.MARGIN.LEFT + NET_CATCH_WEIGHT_COL_OFFSET, y, width: NET_CATCH_WEIGHT_COL_WIDTH, height: PdfStyle.ROW.HEIGHT + ROW_HEIGHT_ADDITION, content: rowCellData.exportWeightText });
        createSection3DataCell(doc, tableBodyRow, { x: PdfStyle.MARGIN.LEFT + VERIFIED_WEIGHT_COL_OFFSET, y, width: VERIFIED_WEIGHT_COL_WIDTH, height: PdfStyle.ROW.HEIGHT + ROW_HEIGHT_ADDITION, content: '' });

        tableBodyRow.end();
        y += PdfStyle.ROW.HEIGHT + ROW_INCREMENT;
    }

    if (arrLength > LIST_LIMIT) {
        const seeScheduleCellHeight = PdfStyle.ROW.HEIGHT * SEE_SCHEDULE_CELL_HEIGHT_MULTIPLIER;
        const seeScheduleRow = doc.struct('TR', () => {
            PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SPECIES_COL_OFFSET, y, FIELD_WIDTH, seeScheduleCellHeight, `SEE SCHEDULE (${allRowsLength} rows)`);
        });
        tableBody.add(seeScheduleRow);
        seeScheduleRow.end();
    }
};

const section3 = (doc, data, startY) => {
    const CELL_HEIGHT_MULTIPLIER = 3;
    const SEPARATOR_OFFSET_Y = 388;

    renderSection3HeaderAndField(doc, startY);

    const cellHeight = PdfStyle.ROW.HEIGHT * CELL_HEIGHT_MULTIPLIER;
    const rowData = getDescOfProductRows(data.exportPayload);
    const arrLength = rowData.length;
    const allRowsLength = getProductScheduleRows(data.exportPayload).length;

    const myTable = doc.struct('Table');
    doc.addStructure(myTable);

    const tableHead = doc.struct('THead');
    myTable.add(tableHead);

    const tableHeadRow = doc.struct('TR');
    tableHead.add(tableHeadRow);

    renderSection3TableHeader(doc, tableHeadRow, startY, cellHeight);

    tableHeadRow.end();
    tableHead.end();

    const tableBody = doc.struct('TBody');
    myTable.add(tableBody);

    renderSection3TableBody(doc, tableBody, startY, cellHeight, rowData, arrLength, allRowsLength);

    tableBody.end();
    myTable.end();
    PdfUtils.separator(doc, startY + SEPARATOR_OFFSET_Y);
};

const getVesselNameField = (vesselCounts, items) => {
    const vesselCount = Object.keys(vesselCounts).length;
    if (vesselCount === 1) {
        return items[0].landings[0].model.vessel.vesselName;
    } else if (vesselCount > 1) {
        return 'Multiple vessels - SEE SCHEDULE';
    } else {
        return '';
    }
};

const getSingleVesselDetails = (vesselCounts, items) => {
    if (Object.keys(vesselCounts).length !== 1) {
        return { pln: '', homePortAndFlag: '', licenceNumber: '', licenceValidTo: '' };
    }
    
    const vessel = items[0].landings[0].model.vessel;
    let licenceValidTo = '';
    if (vessel.licenceValidTo) {
        licenceValidTo = moment(vessel.licenceValidTo, 'YYYY-MM-DD[T]HH:mm:ss').format(DATE_FORMAT_DDMMYYYY);
    }
    
    return {
        pln: vessel.pln,
        homePortAndFlag: `${vessel.flag} - ${vessel.homePort}`,
        licenceNumber: vessel.licenceNumber,
        licenceValidTo: licenceValidTo
    };
};

const renderSection2VesselNameAndPort = (doc, vesselCounts, items, vesselDetails, startY) => {
    const VESSEL_NAME_LABEL_OFFSET_Y = 4;
    const VESSEL_NAME_FIELD_OFFSET_X = 120;
    const VESSEL_NAME_FIELD_OFFSET_Y = 2;
    const VESSEL_NAME_FIELD_WIDTH = 155;
    
    const FLAG_PORT_LABEL_OFFSET_X = 285;
    const FLAG_PORT_LABEL_OFFSET_Y = 4;
    const FLAG_PORT_FIELD_OFFSET_X = 400;
    const FLAG_PORT_FIELD_OFFSET_Y = 2;
    const FLAG_PORT_FIELD_WIDTH = 130;

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + VESSEL_NAME_LABEL_OFFSET_Y, '2    Fishing Vessel Name');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + VESSEL_NAME_FIELD_OFFSET_X, startY + VESSEL_NAME_FIELD_OFFSET_Y, VESSEL_NAME_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, getVesselNameField(vesselCounts, items));
    }));

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + FLAG_PORT_LABEL_OFFSET_X, startY + FLAG_PORT_LABEL_OFFSET_Y, 'Flag - Home Port');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + FLAG_PORT_FIELD_OFFSET_X, startY + FLAG_PORT_FIELD_OFFSET_Y, FLAG_PORT_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, vesselDetails.homePortAndFlag);
    }));
};

const renderSection2CallSignAndImo = (doc, vesselCounts, data, vesselDetails, startY) => {
    const CALL_SIGN_LABEL_OFFSET_X = 15;
    const CALL_SIGN_LABEL_OFFSET_Y = 29;
    const CALL_SIGN_FIELD_OFFSET_X = 120;
    const CALL_SIGN_FIELD_OFFSET_Y = 27;
    const CALL_SIGN_FIELD_WIDTH = 155;
    
    const IMO_LABEL_OFFSET_X = 285;
    const IMO_LABEL_LINE1_OFFSET_Y = 18;
    const IMO_LABEL_LINE2_OFFSET_Y = 30;
    const IMO_LABEL_LINE3_OFFSET_Y = 42;
    const IMO_FIELD_OFFSET_X = 400;
    const IMO_FIELD_OFFSET_Y = 26;
    const IMO_FIELD_WIDTH = 130;

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + CALL_SIGN_LABEL_OFFSET_X, startY + CALL_SIGN_LABEL_OFFSET_Y, 'Call Sign / PLN');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + CALL_SIGN_FIELD_OFFSET_X, startY + CALL_SIGN_FIELD_OFFSET_Y, CALL_SIGN_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, vesselDetails.pln);
    }));

    const imoNumberOrCfr = getImoOrCfr(vesselCounts, data);
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + IMO_LABEL_OFFSET_X, startY + IMO_LABEL_LINE1_OFFSET_Y, 'IMO number or other');
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + IMO_LABEL_OFFSET_X, startY + IMO_LABEL_LINE2_OFFSET_Y, 'unique vessel identifier');
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + IMO_LABEL_OFFSET_X, startY + IMO_LABEL_LINE3_OFFSET_Y, '(if applicable)');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + IMO_FIELD_OFFSET_X, startY + IMO_FIELD_OFFSET_Y, IMO_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, imoNumberOrCfr);
    }));
};

function getFishingGear(exportPayload) {
    const firstLanding = exportPayload?.items?.[0]?.landings?.[0];
    return firstLanding?.model?.gearType ?? '';
}

const renderSection2LicenceAndGear = (doc, data, vesselDetails, startY) => {
    const LICENCE_LABEL_OFFSET_X = 15;
    const LICENCE_LABEL_OFFSET_Y = 54;
    const LICENCE_FIELD_OFFSET_X = 120;
    const LICENCE_FIELD_OFFSET_Y = 52;
    const LICENCE_FIELD_WIDTH = 220;
    
    const VALID_UNTIL_LABEL_OFFSET_X = 350;
    const VALID_UNTIL_LABEL_OFFSET_Y = 54;
    const VALID_UNTIL_FIELD_OFFSET_X = 400;
    const VALID_UNTIL_FIELD_OFFSET_Y = 52;
    const VALID_UNTIL_FIELD_WIDTH = 130;
    
    const GEAR_LABEL_OFFSET_X = 15;
    const GEAR_LABEL_OFFSET_Y = 77;
    const GEAR_FIELD_OFFSET_X = 120;
    const GEAR_FIELD_OFFSET_Y = 77;
    const GEAR_FIELD_WIDTH = 410;
    
    const MOBILE_LABEL_OFFSET_X = 15;
    const MOBILE_LABEL_OFFSET_Y = 100;
    const MOBILE_FIELD_OFFSET_X = 15;
    const MOBILE_FIELD_OFFSET_Y = 112;
    const MOBILE_FIELD_WIDTH = 515;

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + LICENCE_LABEL_OFFSET_X, startY + LICENCE_LABEL_OFFSET_Y, 'Fishing Licence No.');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + LICENCE_FIELD_OFFSET_X, startY + LICENCE_FIELD_OFFSET_Y, LICENCE_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, vesselDetails.licenceNumber || '');
    }));

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + VALID_UNTIL_LABEL_OFFSET_X, startY + VALID_UNTIL_LABEL_OFFSET_Y, 'Valid until');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + VALID_UNTIL_FIELD_OFFSET_X, startY + VALID_UNTIL_FIELD_OFFSET_Y, VALID_UNTIL_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, vesselDetails.licenceValidTo || '');
    }));

    const fishingGearText = isMultiVessel(data.exportPayload) ? 'Multiple vessels - SEE SCHEDULE' : getFishingGear(data.exportPayload);

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + GEAR_LABEL_OFFSET_X, startY + GEAR_LABEL_OFFSET_Y, 'Fishing Gear');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + GEAR_FIELD_OFFSET_X, startY + GEAR_FIELD_OFFSET_Y, GEAR_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, fishingGearText ?? '');
    }));

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + MOBILE_LABEL_OFFSET_X, startY + MOBILE_LABEL_OFFSET_Y, 'Mobile satellite service no Telefax no Telephone no E-mail address (if issued)');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + MOBILE_FIELD_OFFSET_X, startY + MOBILE_FIELD_OFFSET_Y, MOBILE_FIELD_WIDTH, PdfStyle.ROW.HEIGHT);
    }));
};

const SECTION2_SEPARATOR_OFFSET_Y = 137;

const section2 = (doc, data, startY) => {
    const SEPARATOR_OFFSET_Y = SECTION2_SEPARATOR_OFFSET_Y;

    // How many fishing vessels?
    const vesselCounts = {};
    let items = [];
    if (data.exportPayload?.items) {
        items = data.exportPayload.items;
    }

    if (items.length > 0) {
        items.forEach((item) => {
            item.landings.forEach((landing) => {
                vesselCounts[landing.model.vessel.vesselName + landing.model.vessel.pln + landing.model.vessel.licenceNumber] = (vesselCounts[landing.model.vessel.vesselName + landing.model.vessel.pln + landing.model.vessel.licenceNumber] || 0) + 1;
            })
        });
    }

    const vesselDetails = getSingleVesselDetails(vesselCounts, items);

    renderSection2VesselNameAndPort(doc, vesselCounts, items, vesselDetails, startY);
    renderSection2CallSignAndImo(doc, vesselCounts, data, vesselDetails, startY);
    renderSection2LicenceAndGear(doc, data, vesselDetails, startY);

    PdfUtils.separator(doc, startY + SEPARATOR_OFFSET_Y);
};

const REEXPORT_HEADER_LINE_START_X = 185; // Avoid magic number

// Constant for re-export header line end X position to avoid magic number
const REEXPORT_HEADER_LINE_END_X = 560;

const REEXPORT_HEADER_VERTICAL_OFFSET = 20; // Avoid magic number

const reExportCertificateHeader = (doc, startY) => {
    const HEADER_LINE_WIDTH = 2;
    const HEADER_LINE_OFFSET_Y = 4;
    const CERTIFICATE_NUMBER_FIELD_OFFSET_X = 105;
    const CERTIFICATE_NUMBER_FIELD_WIDTH = 130;
    const DATE_LABEL_OFFSET_X = 245;
    const DATE_FIELD_OFFSET_X = 275;
    const DATE_FIELD_WIDTH = 110;
    const MEMBER_STATE_LABEL_OFFSET_X = 395;
    const MEMBER_STATE_FIELD_OFFSET_X = 475;
    const MEMBER_STATE_FIELD_WIDTH = 55;
    const FIELD_OFFSET_Y = -2;
    const SEPARATOR_OFFSET_Y = 25;

    doc.fontSize(PdfStyle.FONT_SIZE.MEDIUM);
    doc.addStructure(doc.struct('H3', {}, () => {
        doc.text('(ii) RE-EXPORT CERTIFICATE', PdfStyle.MARGIN.LEFT, startY);
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        doc.lineWidth(HEADER_LINE_WIDTH);
        doc.moveTo(REEXPORT_HEADER_LINE_START_X, startY + HEADER_LINE_OFFSET_Y).lineTo(REEXPORT_HEADER_LINE_END_X, startY + HEADER_LINE_OFFSET_Y).stroke();
    }));

    const yPos = startY + REEXPORT_HEADER_VERTICAL_OFFSET;
    
    // Certificate Number
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT, yPos, 'Certificate Number');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + CERTIFICATE_NUMBER_FIELD_OFFSET_X, yPos + FIELD_OFFSET_Y, CERTIFICATE_NUMBER_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, '');
    }));

    // Date
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + DATE_LABEL_OFFSET_X, yPos, 'Date');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + DATE_FIELD_OFFSET_X, yPos + FIELD_OFFSET_Y, DATE_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, '');
    }));

    // Member State
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + MEMBER_STATE_LABEL_OFFSET_X, yPos, 'Member State');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + MEMBER_STATE_FIELD_OFFSET_X, yPos + FIELD_OFFSET_Y, MEMBER_STATE_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, '');
    }));

    PdfUtils.separator(doc, yPos + SEPARATOR_OFFSET_Y);
};

const renderSection1Header = (doc, startY) => {
    const HEADER_LINE_WIDTH = 2;
    const HEADER_LINE_START_X = 153;
    const HEADER_LINE_END_X = 560;
    const HEADER_LINE_OFFSET_Y = 4;

    doc.fontSize(PdfStyle.FONT_SIZE.MEDIUM);
    doc.addStructure(doc.struct('H3', {}, () => {
        doc.text('(i) CATCH CERTIFICATE', PdfStyle.MARGIN.LEFT, startY);
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        doc.lineWidth(HEADER_LINE_WIDTH);
        doc.moveTo(HEADER_LINE_START_X, startY + HEADER_LINE_OFFSET_Y).lineTo(HEADER_LINE_END_X, startY + HEADER_LINE_OFFSET_Y).stroke();
    }));
};

const renderSection1DocumentAndAuthority = (doc, data, isSample, startY) => {
    const DOC_NUMBER_LABEL_OFFSET_Y = 20;
    const DOC_NUMBER_FIELD_OFFSET_X = 95;
    const DOC_NUMBER_FIELD_OFFSET_Y = 18;
    const DOC_NUMBER_FIELD_WIDTH = 160;
    
    const VALIDATING_AUTH_LABEL_X = 300;
    const VALIDATING_AUTH_LABEL_OFFSET_Y = 20;
    const VALIDATING_AUTH_FIELD_OFFSET_X = 380;
    const VALIDATING_AUTH_FIELD_OFFSET_Y = 18;
    const VALIDATING_AUTH_FIELD_WIDTH = 150;

    let documentNumber = '';
    if (!data.isBlankTemplate) {
        if (isSample) {
            documentNumber = '###-####-##-#########';
        } else {
            documentNumber = data.documentNumber;
        }
    }
    
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT, startY + DOC_NUMBER_LABEL_OFFSET_Y, 'Document Number');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + DOC_NUMBER_FIELD_OFFSET_X, startY + DOC_NUMBER_FIELD_OFFSET_Y, DOC_NUMBER_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, documentNumber);
    }));

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, VALIDATING_AUTH_LABEL_X, startY + VALIDATING_AUTH_LABEL_OFFSET_Y, 'Validating Authority');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + VALIDATING_AUTH_FIELD_OFFSET_X, startY + VALIDATING_AUTH_FIELD_OFFSET_Y, VALIDATING_AUTH_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, 'Marine Management Organisation');
    }));
};

const renderSection1ContactDetails = (doc, startY) => {
    const NAME_LABEL_OFFSET_Y = 40;
    const NAME_FIELD_OFFSET_X = 65;
    const NAME_FIELD_OFFSET_Y = 38;
    const NAME_FIELD_WIDTH = 465;
    
    const ADDRESS_LABEL_OFFSET_X = 15;
    const ADDRESS_LABEL_OFFSET_Y = 60;
    const ADDRESS_FIELD_OFFSET_X = 65;
    const ADDRESS_FIELD_OFFSET_Y = 58;
    const ADDRESS_FIELD_WIDTH = 465;
    const ADDRESS_FIELD_HEIGHT_MULTIPLIER = 2;
    const ADDRESS_FIELD_HEIGHT_ADJUSTMENT = 5;
    
    const TEL_LABEL_OFFSET_X = 65;
    const TEL_LABEL_OFFSET_Y = 100;
    const TEL_FIELD_OFFSET_X = 90;
    const TEL_FIELD_OFFSET_Y = 98;
    const TEL_FIELD_WIDTH = 200;
    
    const EMAIL_LABEL_OFFSET_X = 300;
    const EMAIL_LABEL_OFFSET_Y = 100;
    const EMAIL_FIELD_OFFSET_X = 330;
    const EMAIL_FIELD_OFFSET_Y = 98;
    const EMAIL_FIELD_WIDTH = 200;

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + NAME_LABEL_OFFSET_Y, '1    Name');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + NAME_FIELD_OFFSET_X, startY + NAME_FIELD_OFFSET_Y, NAME_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, 'Illegal Unreported and Unregulated (IUU) Fishing Team');
    }));

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + ADDRESS_LABEL_OFFSET_X, startY + ADDRESS_LABEL_OFFSET_Y, 'Address');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + ADDRESS_FIELD_OFFSET_X, startY + ADDRESS_FIELD_OFFSET_Y, ADDRESS_FIELD_WIDTH, PdfStyle.ROW.HEIGHT * ADDRESS_FIELD_HEIGHT_MULTIPLIER + ADDRESS_FIELD_HEIGHT_ADJUSTMENT, 'Tyneside House, Skinnerburn Rd, Newcastle upon Tyne, United Kingdom. NE4 7AR');
    }));

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + TEL_LABEL_OFFSET_X, startY + TEL_LABEL_OFFSET_Y, 'Tel.');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + TEL_FIELD_OFFSET_X, startY + TEL_FIELD_OFFSET_Y, TEL_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, '0300 123 1032');
    }));

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + EMAIL_LABEL_OFFSET_X, startY + EMAIL_LABEL_OFFSET_Y, 'Email');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + EMAIL_FIELD_OFFSET_X, startY + EMAIL_FIELD_OFFSET_Y, EMAIL_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, 'ukiuuslo@marinemanagement.org.uk');
    }));
};

const section1 = (doc, data, isSample, startY) => {
    const SEPARATOR_OFFSET_Y = 123;

    renderSection1Header(doc, startY);
    renderSection1DocumentAndAuthority(doc, data, isSample, startY);
    renderSection1ContactDetails(doc, startY);
    PdfUtils.separator(doc, startY + SEPARATOR_OFFSET_Y);
};

const MVS_STYLES = {
    DEFAULT: { lineColor: '#767676', textColor: '#353535', bgColour: '#ffffff' },
    YELLOW_HEADER: { lineColor: '#767676', textColor: '#353535', bgColour: '#ffcc00' },
    YELLOW_BRIGHT: { lineColor: '#767676', textColor: '#353535', bgColour: '#ffff00' }
};

const normalizeTextToArray = (text) => {
    if (Array.isArray(text)) {
        return text;
    }
    if (text) {
        return [text];
    }
    return null;
};

// Constant for heading cell top padding divisor to avoid magic number
const MVS_HEADING_CELL_TOP_PAD_DIVISOR = 3;

const mvsHeadingCell = ({doc, x, y, width, height, text}, isBold, fontSize, align, style = MVS_STYLES.DEFAULT) => {
    const textArr = normalizeTextToArray(text);
    mvsCell({doc, x, y, width, height, topPad: height / MVS_HEADING_CELL_TOP_PAD_DIVISOR, textArr}, isBold, fontSize, align, style);
};

const mvsTableCell = ({doc, x, y, width, height, text}, isBold, fontSize, align, style = MVS_STYLES.DEFAULT) => {
    const textArr = normalizeTextToArray(text);
    return mvsCell({doc, x, y, width, height, topPad: 4, textArr}, isBold, fontSize, align, style);
};

// Constant for MVS cell border line width to avoid magic number
const MVS_CELL_LINE_WIDTH = 0.75;

const mvsCell = ({doc, x, y, width, height, topPad, textArr}, isBold, fontSize, align, style) => {
    const { lineColor, textColor, bgColour } = style;
    let yPos = y;
    doc.undash();
    doc.lineWidth(MVS_CELL_LINE_WIDTH);
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

const createMVSTableHeaderCell = (doc, tableHeadRow, x, y, width, height, text) => {
    const tableHead = doc.struct('TH', () => {
        mvsTableCell({doc, x, y, width, height, text}, true, PdfStyle.FONT_SIZE.SMALLER, 'center', MVS_STYLES.YELLOW_BRIGHT);
    });
    tableHeadRow.add(tableHead);
};

const createMVSTableDataCell = (doc, tableBodyRow, x, y, width, height, text) => {
    const td = doc.struct('TD', () => {
        mvsTableCell({doc, x, y, width, height, text}, false, PdfStyle.FONT_SIZE.SMALLER, 'left', MVS_STYLES.DEFAULT);
    });
    tableBodyRow.add(td);
};

const createSection3HeaderCell = (doc, tableHeadRow, x, y, width, height, content) => {
    const tableHead = doc.struct('TH', () => {
        PdfUtils.tableHeaderCell(doc, x, y, width, height, content);
    });
    tableHeadRow.add(tableHead);
};

const createSection3DataCell = (doc, tableBodyRow, cellConfig) => {
    const { x, y, width, height, content, lineSpacing = 1 } = cellConfig;
    const td = doc.struct('TD', () => {
        PdfUtils.field(doc, x, y, width, height, content, lineSpacing);
    });
    tableBodyRow.add(td);
};

const getSection3RowData = (rowIdx, arrLength, rowData, hasData) => {
    let speciesText = '';
    let commodityCodeText = '';
    let datesText = '';
    let catchAreasText = '';
    let exportWeightText = '';
    
    if (hasData) {
        const row = rowData[rowIdx];
        speciesText = `${row.species}`;
        commodityCodeText = `${row.commodityCode}`;
        datesText = `${row.dates}`;
        const rfmoAcronym = row.rfmo?.match(/\(([^)]{1,10})\)/) ? row.rfmo.match(/\(([^)]{1,10})\)/)[1] : '';
        const eezText = row.exclusiveEconomicZones?.map(eez => eez.isoCodeAlpha2).join(', ') || '';
        const highSeasText = row.highSeasArea === 'Yes' ? 'High Seas' : '';
        catchAreasText = [row.catchAreas, eezText, rfmoAcronym, highSeasText].filter(Boolean).join('\n');
        exportWeightText = getExportWeightText(rowIdx, arrLength, rowData);
    }
    
    return { speciesText, commodityCodeText, datesText, catchAreasText, exportWeightText };
};

module.exports = renderExportCert;
module.exports.formatCatchAreaData = formatCatchAreaData;
// Export helper functions for testing (Transport Details Appendix)
module.exports.getTransportModes = getTransportModes;
module.exports.getVcDetails = getVcDetails;
module.exports.getFlightDetails = getFlightDetails;
module.exports.getTruckDetails = getTruckDetails;
module.exports.getRailwayBillNumber = getRailwayBillNumber;
module.exports.getFreightBillNumber = getFreightBillNumber;
module.exports.getContainerIdentificationNumber = getContainerIdentificationNumber;
module.exports.getDeparturePlace = getDeparturePlace;
module.exports.getOtherTransportDocuments = getOtherTransportDocuments;
module.exports.getVehicleType = getVehicleType;
// Export multi-vessel schedule helper functions for testing
module.exports.calculateRowHeight = calculateRowHeight;
module.exports.calculateMaxRowHeightForLicenceHolder = calculateMaxRowHeightForLicenceHolder;
module.exports.calculatePageDimensions = calculatePageDimensions;
module.exports.paginateRows = paginateRows;
module.exports.calculateRequiredCellHeightStatic = calculateRequiredCellHeightStatic;
module.exports.calculateRequiredCellHeight = calculateRequiredCellHeight;
module.exports.renderMultiVesselScheduleHeader = renderMultiVesselScheduleHeader;
module.exports.multiVesselScheduleHeading = multiVesselScheduleHeading;
module.exports.multiVesselScheduleHeadingDynamic = multiVesselScheduleHeadingDynamic;
module.exports.renderMultiVesselPages = renderMultiVesselPages;
