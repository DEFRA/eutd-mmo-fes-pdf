const path = require('path');
const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const moment = require('moment');
const CommonUtils = require('../utils/common-utils');

// Constants for multi-vessel schedule calculations
const MIN_ROW_HEIGHT_MULTIPLIER = 3;
const MIN_HEIGHT_ADJUSTMENT = 5;
const LICENCE_HOLDER_COLUMN_WIDTH = 45;
const LICENCE_DETAIL_COLUMN_WIDTH = 75;

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
    // Page 4: Section 12 and 13 (EU2026 requirement)
    section12(doc, data, PdfStyle.MARGIN.TOP);
    isSample ?? CommonUtils.addSampleWatermark(doc);
    section13(doc, data, PdfStyle.MARGIN.TOP + 100);
    PdfUtils.endOfPage(doc, 4);
   

    // Page 5: Re-Export Certificate - Sections 1-4
    doc.addPage();
    reExportCertificateHeader(doc, data, isSample, PdfStyle.MARGIN.TOP);
    section14(doc, data, PdfStyle.MARGIN.TOP + 70);
    section15(doc, data, PdfStyle.MARGIN.TOP + 280);
    section16(doc, data, PdfStyle.MARGIN.TOP + 400);
    section17(doc, data, PdfStyle.MARGIN.TOP + 530);
    isSample ?? CommonUtils.addSampleWatermark(doc);
    PdfUtils.endOfPage(doc, 5);

    // Page 6: Appendix - Transport Details
    doc.addPage();
    appendixHeading(doc, PdfStyle.MARGIN.TOP);
    appendixTransportDetails(doc, data, PdfStyle.MARGIN.TOP + 40);
    isSample ?? CommonUtils.addSampleWatermark(doc);
    PdfUtils.endOfPage(doc, 6);

    // Page 7: Appendix - Exporter Details and Official use only
    doc.addPage();
    appendixExporterAndImportDetails(doc, data, isSample, buff, PdfStyle.MARGIN.TOP);
    isSample ?? CommonUtils.addSampleWatermark(doc);
    PdfUtils.endOfPage(doc, 7);

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

const calculateRowHeight = (row) => {
    const licenceHolderText = row.licenceHolder || '';
    const licenceDetailText = `${row.licenceDetail || ''} ${row.homePort || ''}`;
    
    const minHeight = (PdfStyle.ROW.HEIGHT * MIN_ROW_HEIGHT_MULTIPLIER) - MIN_HEIGHT_ADJUSTMENT;
    const licenceHolderHeight = calculateRequiredCellHeightStatic(licenceHolderText, LICENCE_HOLDER_COLUMN_WIDTH, PdfStyle.FONT_SIZE.SMALLER);
    const licenceDetailHeight = calculateRequiredCellHeightStatic(licenceDetailText, LICENCE_DETAIL_COLUMN_WIDTH, PdfStyle.FONT_SIZE.SMALLER);
    
    return Math.max(minHeight, licenceHolderHeight, licenceDetailHeight);
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
    
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const tempHeight = calculateRowHeight(row);
        
        if (currentPageHeight + tempHeight > availableHeight && currentPageRows.length > 0) {
            pages.push({ 
                rows: currentPageRows, 
                startIdx: pages.length === 0 ? 0 : pages[pages.length - 1].startIdx + pages[pages.length - 1].rows.length 
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
            startIdx: pages.length === 0 ? 0 : pages[pages.length - 1].startIdx + pages[pages.length - 1].rows.length 
        });
    }
    
    return pages;
};

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
        multiVesselScheduleHeadingDynamic(doc, data, isSample, buff, pageNum + 1, currentPage, rows, maxPages, PdfStyle.MARGIN.TOP);
        isSample ?? CommonUtils.addSampleWatermark(doc, 70, 70);

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

    let vesselCounts = {};
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
    return Object.keys(vesselCounts).length > 1 || catchLength > 6;
}

function getCatchDates(startDate, dateLanded){
    const formattedStartDate = startDate ? moment(startDate).format('DD/MM/YYYY') : null;
    const formattedDateLanded = moment(dateLanded).format('DD/MM/YYYY');
    return formattedStartDate ? `${formattedStartDate} - ${formattedDateLanded}` : formattedDateLanded;
}

function getLandingDetail(vessel) {
    let landingDetail = vessel.licenceNumber ?? '';
    if (landingDetail && vessel.licenceValidTo) {
        const dte = moment(vessel.licenceValidTo).format('DD/MM/YYYY');
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
    let items = exportPayload?.items ?? [];
    let rows = [];
    items.forEach((item) => {
        item.landings.forEach((landing) => {
            const faoArea = landing.model?.faoArea?.length > 0 ? landing.model.faoArea : 'FAO27';
            const landingDetail = getLandingDetail(landing.model.vessel);
            rows.push(buildProductRow(item, landing, faoArea, landingDetail));
        });
    });
    return rows;
}

const renderMultiVesselScheduleHeader = (doc, data, isSample, buff, startY) => {
    let imageFile = path.join(__dirname, '../resources/hmgovlogo.png');
    doc.addStructure(doc.struct('Figure', {
        alt: 'HM Government logo'
    }, () => {
        doc.image(imageFile, {
            width: 220
        });
    }));
    let cellHeight = PdfStyle.ROW.HEIGHT * 2;
    doc.addStructure(doc.struct('P', () => {
        mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT + 430, y: startY, width: 350, height: cellHeight, text: 'UNITED KINGDOM'}, true, PdfStyle.FONT_SIZE.LARGEST, 'center', MVS_STYLES.YELLOW_HEADER);
    }));
    let yPos = startY + cellHeight;
    doc.addStructure(doc.struct('P', () => {
        mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT, y: yPos, width: 230, height: PdfStyle.ROW.HEIGHT, text: 'AUTHORITY USE ONLY'}, true, PdfStyle.FONT_SIZE.SMALL, 'left', MVS_STYLES.YELLOW_HEADER);
    }));
    doc.addStructure(doc.struct('P', () => {
        mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT + 230, y: yPos, width: 550, height: PdfStyle.ROW.HEIGHT,
            text: 'Schedule for multiple vessel landings as permitted by Article 12 (3) of Council Regulation (EC) No 1005/2008'},
            true, PdfStyle.FONT_SIZE.SMALL, 'center', MVS_STYLES.DEFAULT);
    }));
    yPos = yPos + PdfStyle.ROW.HEIGHT;

    cellHeight = PdfStyle.ROW.HEIGHT * 2 + 20;
    doc.addStructure(doc.struct('P', () => {
        mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT, y: yPos, width: 90, height: cellHeight, text: ['Catch Certificate', 'Number']}, true, PdfStyle.FONT_SIZE.SMALL, 'center', MVS_STYLES.YELLOW_HEADER);
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
        mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT + 90, y: yPos, width: 140, height: cellHeight, text: documentNumber}, true, PdfStyle.FONT_SIZE.SMALL, 'center', MVS_STYLES.DEFAULT);
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT + 230, y: yPos, width: 270, height: cellHeight, text: undefined}, true, PdfStyle.FONT_SIZE.SMALL, 'center', MVS_STYLES.DEFAULT);
    }));

    cellHeight = PdfStyle.ROW.HEIGHT * 4 + 25;

    doc.addStructure(doc.struct('P', () => {
        mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT + 500, y: yPos, width: 80, height: cellHeight, text: ['UK Authority', 'QR Code']}, true, PdfStyle.FONT_SIZE.SMALL, 'center', MVS_STYLES.YELLOW_HEADER);
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT + 580, y: yPos, width: 200, height: cellHeight, text: undefined}, true, PdfStyle.FONT_SIZE.SMALL, 'center', MVS_STYLES.DEFAULT);
    }));

    yPos = yPos + PdfStyle.ROW.HEIGHT * 2 + 20;
    cellHeight = PdfStyle.ROW.HEIGHT * 2 + 5;

    doc.addStructure(doc.struct('P', () => {
        mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT, y: yPos, width: 90, height: cellHeight, text: 'Date'}, true, PdfStyle.FONT_SIZE.SMALL, 'center', MVS_STYLES.YELLOW_HEADER);
    }));
    let todaysDate = '';
    if (!data.isBlankTemplate) {
        todaysDate = PdfUtils.todaysDate();
    }
    doc.addStructure(doc.struct('P', () => {
        mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT + 90, y: yPos, width: 140, height: cellHeight, text: todaysDate}, true, PdfStyle.FONT_SIZE.SMALL, 'center', MVS_STYLES.DEFAULT);
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        mvsHeadingCell({doc, x: PdfStyle.MARGIN.LEFT + 230, y: yPos, width: 270, height: cellHeight, text: undefined}, true, PdfStyle.FONT_SIZE.SMALL, 'center', MVS_STYLES.DEFAULT);
    }));

    if (!data.isBlankTemplate && !isSample) {
        PdfUtils.qrCode(doc, buff, PdfStyle.MARGIN.LEFT + 590, yPos - 45);
    }
    yPos = yPos + cellHeight + 10;
    cellHeight = PdfStyle.ROW.HEIGHT * 3 + 14;

    const myTable = doc.struct('Table');
    doc.addStructure(myTable);

    const tableHead = doc.struct('THead');
    myTable.add(tableHead);

    const tableHeadRow = doc.struct('TR');
    tableHead.add(tableHeadRow);

    createMVSTableHeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT, yPos, 75, cellHeight, 'Species');
    createMVSTableHeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + 75, yPos, 60, cellHeight, ['Presentation']);
    createMVSTableHeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + 135, yPos, 50, cellHeight, ['Product', 'code']);
    createMVSTableHeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + 185, yPos, 60, cellHeight, ['Catch Date(s)', '(from-to)']);
    createMVSTableHeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + 245, yPos, 55, cellHeight, ['Estimated weight to be landed in kg']);
    createMVSTableHeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + 300, yPos, 50, cellHeight, ['Net catch', 'weight in kg']);
    createMVSTableHeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + 350, yPos, 55, cellHeight, ['Verified weight landed(net catch weight in kg)']);
    createMVSTableHeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + 405, yPos, 65, cellHeight, ['Vessel name and PLN / Callsign']);
    createMVSTableHeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + 470, yPos, 70, cellHeight, ['IMO number or other unique vessel identifier (if applicable)']);
    createMVSTableHeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + 540, yPos, LICENCE_HOLDER_COLUMN_WIDTH, cellHeight, 'Master / Licence Holder');
    createMVSTableHeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + 585, yPos, LICENCE_DETAIL_COLUMN_WIDTH, cellHeight, ['Licence Number /', 'Flag-Homeport']);
    createMVSTableHeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + 660, yPos, 75, cellHeight, ['Catch Area(s) (Catch Area, EEZ, RFMO, High Seas)']);
    createMVSTableHeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + 735, yPos, 45, cellHeight, ['Fishing', 'Gear']);
    tableHeadRow.end();
    tableHead.end();

    yPos = yPos + cellHeight;

    return { myTable, yPos };
};

const multiVesselScheduleHeading = (doc, data, isSample, buff, page, pageSize, startY) => {
    const { myTable, yPos: initialYPos } = renderMultiVesselScheduleHeader(doc, data, isSample, buff, startY);
    let yPos = initialYPos;

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

    const tableBody = doc.struct('TBody');
    myTable.add(tableBody);

    const maxPageHeight = 565;

    for (let rowIdx = fromIdx; rowIdx < (fromIdx + pageSize); rowIdx++) {
        let dynamicCellHeight = (PdfStyle.ROW.HEIGHT * MIN_ROW_HEIGHT_MULTIPLIER) - MIN_HEIGHT_ADJUSTMENT;
        if (rowIdx < rowDataLimit && rows[rowIdx]) {
            const licenceHolderText = rows[rowIdx].licenceHolder || '';
            const licenceDetailText = `${rows[rowIdx].licenceDetail || ''} ${rows[rowIdx].homePort || ''}`;
            
            const licenceHolderHeight = calculateRequiredCellHeight(doc, licenceHolderText, LICENCE_HOLDER_COLUMN_WIDTH, PdfStyle.FONT_SIZE.SMALLER);
            const licenceDetailHeight = calculateRequiredCellHeight(doc, licenceDetailText, LICENCE_DETAIL_COLUMN_WIDTH, PdfStyle.FONT_SIZE.SMALLER);
            
            dynamicCellHeight = Math.max(dynamicCellHeight, licenceHolderHeight, licenceDetailHeight);
        }
        
        if (yPos + dynamicCellHeight > maxPageHeight && rowIdx < rowDataLimit) {
            const remainingRows = (fromIdx + pageSize) - rowIdx;
            for (let emptyIdx = 0; emptyIdx < remainingRows; emptyIdx++) {
                const emptyRow = doc.struct('TR');
                tableBody.add(emptyRow);
                generateMultiVesselTableRows(emptyRow, doc, yPos, (PdfStyle.ROW.HEIGHT*3)-5, fromIdx + pageSize + emptyIdx, rowDataLimit, rows);
                emptyRow.end();
                yPos = yPos + ((PdfStyle.ROW.HEIGHT*3)-5);
            }
            break;
        }
        
        const tableBodyRow = doc.struct('TR');
        tableBody.add(tableBodyRow);
        generateMultiVesselTableRows(tableBodyRow, doc, yPos, dynamicCellHeight, rowIdx, rowDataLimit, rows);
        tableBodyRow.end();
        yPos = yPos + dynamicCellHeight;
    }

    const pageCountRow = doc.struct('TR', () => {
        mvsTableCell({doc, x: PdfStyle.MARGIN.LEFT, y: yPos, width: 780, height: PdfStyle.ROW.HEIGHT, text: 'Page ' + page + ' of ' + pageCount}, true, PdfStyle.FONT_SIZE.SMALLER, 'left', MVS_STYLES.DEFAULT);
    });
    tableBody.add(pageCountRow);
    pageCountRow.end();

    tableBody.end();
    myTable.end();
};

const multiVesselScheduleHeadingDynamic = (doc, data, isSample, buff, pageNum, currentPage, allRows, totalPages, startY) => {
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
        mvsTableCell({doc, x: PdfStyle.MARGIN.LEFT, y: yPos, width: 780, height: PdfStyle.ROW.HEIGHT, text: 'Page ' + pageNum + ' of ' + totalPages}, true, PdfStyle.FONT_SIZE.SMALLER, 'left', MVS_STYLES.DEFAULT);
    });
    tableBody.add(pageCountRow);
    pageCountRow.end();

    tableBody.end();
    myTable.end();
};

const formatCatchAreaData = (row) => {
    if (!row) return '';
    
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
    if (!text || text === '') return (PdfStyle.ROW.HEIGHT * MIN_ROW_HEIGHT_MULTIPLIER) - MIN_HEIGHT_ADJUSTMENT;
    
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
    if (!text || text === '') return (PdfStyle.ROW.HEIGHT * MIN_ROW_HEIGHT_MULTIPLIER) - MIN_HEIGHT_ADJUSTMENT;
    
    const avgCharWidth = fontSize * 0.55; 
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

const generateMultiVesselTableRows = (tableBodyRow, doc, yPos, cellHeight, rowIdx, rowDataLimit, rows) => {
    const cellData = [
        { x: PdfStyle.MARGIN.LEFT, width: 75, text: rowIdx < rowDataLimit ? `${rows[rowIdx].species}` : '' },
        { x: PdfStyle.MARGIN.LEFT + 75, width: 60, text: rowIdx < rowDataLimit ? `${rows[rowIdx].presentation}` : '' },
        { x: PdfStyle.MARGIN.LEFT + 135, width: 50, text: rowIdx < rowDataLimit ? `${rows[rowIdx].commodityCode}` : '' },
        { x: PdfStyle.MARGIN.LEFT + 185, width: 60, text: rowIdx < rowDataLimit ? `${rows[rowIdx].dateLanded}` : '' },
        { x: PdfStyle.MARGIN.LEFT + 245, width: 55, text: rowIdx < rowDataLimit ? `${rows[rowIdx].estimatedWeight}` : '' },
        { x: PdfStyle.MARGIN.LEFT + 300, width: 50, text: rowIdx < rowDataLimit ? `${Number(rows[rowIdx].exportWeight).toFixed(2)}` : '' },
        { x: PdfStyle.MARGIN.LEFT + 350, width: 55, text: rowIdx < rowDataLimit ? `${rows[rowIdx].verifiedWeight}` : '' },
        { x: PdfStyle.MARGIN.LEFT + 405, width: 65, text: rowIdx < rowDataLimit ? `${rows[rowIdx].vessel} (${rows[rowIdx].pln})` : '' },
        { x: PdfStyle.MARGIN.LEFT + 470, width: 70, text: rowIdx < rowDataLimit ? `${getImoOrCfrForMultiVesselSchedule(rows[rowIdx])}` : '' },
        { x: PdfStyle.MARGIN.LEFT + 540, width: LICENCE_HOLDER_COLUMN_WIDTH, text: rowIdx < rowDataLimit ? `${rows[rowIdx].licenceHolder}` : '' },
        { x: PdfStyle.MARGIN.LEFT + 585, width: LICENCE_DETAIL_COLUMN_WIDTH, text: rowIdx < rowDataLimit ? `${rows[rowIdx].licenceDetail} ${rows[rowIdx].homePort}` : '' },
        { x: PdfStyle.MARGIN.LEFT + 660, width: 75, text: rowIdx < rowDataLimit ? formatCatchAreaData(rows[rowIdx]) : '' },
        { x: PdfStyle.MARGIN.LEFT + 735, width: 45, text: rowIdx < rowDataLimit && rows[rowIdx].gearCode ? `${rows[rowIdx].gearCode}` : '' }
    ];

    cellData.forEach(cell => {
        createMVSTableDataCell(doc, tableBodyRow, cell.x, yPos, cell.width, cellHeight, cell.text);
    });
};

const appendixTransportDetails = (doc, data, startY) => {
    doc.font(PdfStyle.FONT.REGULAR);
    let yPos = startY;
    
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

    // Field heights adjusted to fill the page:
    const singleLineHeight = PdfStyle.ROW.HEIGHT; // 1 line
    const vesselFieldHeight = PdfStyle.ROW.HEIGHT * 5; // 5 lines
    const flightFieldHeight = PdfStyle.ROW.HEIGHT * 4; // 4 lines
    const truckFieldHeight = PdfStyle.ROW.HEIGHT * 4; // 4 lines
    const railwayFieldHeight = PdfStyle.ROW.HEIGHT * 3; // 3 lines
    const freightFieldHeight = PdfStyle.ROW.HEIGHT * 3; // 3 lines
    const containerFieldHeight = PdfStyle.ROW.HEIGHT * 6; // 6 lines
    const otherDocsFieldHeight = PdfStyle.ROW.HEIGHT * 20; // 20 lines

    const labelWidth = 156;
    const valueWidth = 383;

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
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + (singleLineHeight * 2), labelWidth, singleLineHeight, 'Point of destination')),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + labelWidth, yPos + (singleLineHeight * 2), valueWidth, singleLineHeight, pointOfDestination)),
            ]),
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + (singleLineHeight * 3), labelWidth, vesselFieldHeight, 'Vessel name and flag')),
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + labelWidth, yPos + (singleLineHeight * 3), valueWidth, vesselFieldHeight, vcDetails)),
            ]),
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + (singleLineHeight * 3) + vesselFieldHeight, labelWidth, flightFieldHeight, 'Flight number/airway bill number')),
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + labelWidth, yPos + (singleLineHeight * 3) + vesselFieldHeight, valueWidth, flightFieldHeight, flightNumber)),
            ]),
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + (singleLineHeight * 3) + vesselFieldHeight + flightFieldHeight, labelWidth, truckFieldHeight, 'Truck nationality and registration number')),
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + labelWidth, yPos + (singleLineHeight * 3) + vesselFieldHeight + flightFieldHeight, valueWidth, truckFieldHeight, truckDetails)),
            ]),
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + (singleLineHeight * 3) + vesselFieldHeight + flightFieldHeight + truckFieldHeight, labelWidth, railwayFieldHeight, 'Railway bill number')),
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + labelWidth, yPos + (singleLineHeight * 3) + vesselFieldHeight + flightFieldHeight + truckFieldHeight, valueWidth, railwayFieldHeight, railwayBillNumber)),
            ]),
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + (singleLineHeight * 3) + vesselFieldHeight + flightFieldHeight + truckFieldHeight + railwayFieldHeight, labelWidth, freightFieldHeight, 'Freight bill number')),
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + labelWidth, yPos + (singleLineHeight * 3) + vesselFieldHeight + flightFieldHeight + truckFieldHeight + railwayFieldHeight, valueWidth, freightFieldHeight, freightBillNumber)),
            ]),
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + (singleLineHeight * 3) + vesselFieldHeight + flightFieldHeight + truckFieldHeight + railwayFieldHeight + freightFieldHeight, labelWidth, containerFieldHeight, 'Container identification number(s)')),
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + labelWidth, yPos + (singleLineHeight * 3) + vesselFieldHeight + flightFieldHeight + truckFieldHeight + railwayFieldHeight + freightFieldHeight, valueWidth, containerFieldHeight, containerIdentificationNumber)),
            ]),
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + (singleLineHeight * 3) + vesselFieldHeight + flightFieldHeight + truckFieldHeight + railwayFieldHeight + freightFieldHeight + containerFieldHeight, labelWidth, otherDocsFieldHeight, 'Other transport documents (e.g. bill of landing, CMR, air waybill)')),
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + labelWidth, yPos + (singleLineHeight * 3) + vesselFieldHeight + flightFieldHeight + truckFieldHeight + railwayFieldHeight + freightFieldHeight + containerFieldHeight, valueWidth, otherDocsFieldHeight, otherTransportDocuments)),
            ])
        ])
    ]));
};

const appendixExporterAndImportDetails = (doc, data, isSample, buff, startY) => {
    // This function now renders exporter details and Official use only section on page 7
    let yPos = startY;
    
    // Exporter Details section
    doc.font(PdfStyle.FONT.BOLD);
    doc.fontSize(PdfStyle.FONT_SIZE.MEDIUM);
    doc.addStructure(doc.struct('H3', () => {
        doc.text('Exporter Details', PdfStyle.MARGIN.LEFT, yPos);
    }));
    doc.font(PdfStyle.FONT.REGULAR);
    yPos += 20;

    const exporterAddress = PdfUtils.constructAddress([
        data.exporter?.addressOne, 
        data.exporter?.addressTwo,
        data.exporter?.townCity, 
        data.exporter?.postcode
    ]) ?? '';
    const exporterFullName = data.exporter?.exporterFullName ?? '';
    const exporterCompanyName = data.exporter?.exporterCompanyName ?? '';

    let cellHeight = PdfStyle.ROW.HEIGHT * 5 + 5;

    doc.addStructure(doc.struct('Table', [
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos, 100, PdfStyle.ROW.HEIGHT + 5, 'Name')),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 100, yPos, 430, PdfStyle.ROW.HEIGHT + 5, exporterFullName)),
            ]),
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + PdfStyle.ROW.HEIGHT + 5, 100, cellHeight, 'Address')),
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 100, yPos + PdfStyle.ROW.HEIGHT + 5, 430, cellHeight, [exporterCompanyName, exporterAddress])),
            ]),
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + PdfStyle.ROW.HEIGHT + 5 + cellHeight, 100, cellHeight, 'Signature')),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 100, yPos + PdfStyle.ROW.HEIGHT + 5 + cellHeight, 430, cellHeight)),
            ])
        ])
    ]));

    yPos = yPos + PdfStyle.ROW.HEIGHT + 5 + (cellHeight * 2) + 30;
    
    // Official use only section - original format
    cellHeight = PdfStyle.ROW.HEIGHT * 8;
    
    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', () => {
                    PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT, yPos, 270, cellHeight, 'FOR OFFICIAL USE ONLY');
                }),
                doc.struct('TH', () => {
                    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 270, yPos, 260, cellHeight, 'Import Control Authority Stamp');
                })
            ])
        ])
    ]));

    yPos += cellHeight + 20;
    
    // Validation paragraph
    doc.font(PdfStyle.FONT.BOLD);
    doc.addStructure(doc.struct('P', () => {
        doc.text('Validated by the appropriate competent authority (MMO, Scottish Ministers, Welsh Ministers, Department of Agriculture, Environment and Rural Affairs for Northern Ireland, Marine Resources, Growth and Housing and Environment for Jersey, Sea Fisheries, Committee for Economic Development for Guernsey and Department Environment, Food and Agriculture for the Isle of Man) in accordance with article 15 of Council Regulation (EU) 1005/2008 (as retained under s.3(1) European Union (Withdrawal) Act 2018)', PdfStyle.MARGIN.LEFT + 10, yPos);
    }));
    
    yPos += 80;
    
    // QR Code
    const shouldGenerateQRCode = !data.isBlankTemplate && !isSample;
    if (shouldGenerateQRCode && buff) {
        PdfUtils.qrCode(doc, buff, PdfStyle.MARGIN.LEFT + 20, yPos);
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
    if (!vessel) return null;
    
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
            } else if (typeof docs === 'string') {
                // Handle string format (newline-separated)
                const lines = docs.split('\n').map(line => line.trim()).filter(line => line.length > 0);
                documentLines = documentLines.concat(lines);
            }
        }
    });
    
    // Limit to 25 documents (maintains insertion order)
    documentLines = documentLines.slice(0, 25);
    
    return documentLines.join('\n');
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
    doc.addStructure(doc.struct('H3', {}, () => {
        doc.text('Transport Details', 0, startY + 18, {
            align: 'center'
        });
    }));
};

const generateSection11 = (doc, data, startY) => {
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + PdfStyle.ROW.HEIGHT * 2, '11    Importer Declaration:');
    }));
    let yPos = startY + PdfStyle.ROW.HEIGHT * 3;
    const headerHeight = PdfStyle.ROW.HEIGHT * 3 - 4;
    const rowHeight = PdfStyle.ROW.HEIGHT * 3;

    // Reusable column structure for importer rows
    const importerRowsStructure = [
        { leftMargin: 15, width: 250 },
        { leftMargin: 265, width: 95 },
        { leftMargin: 360, width: 95 },
        { leftMargin: 455, width: 80 }
    ];

    // First importer table
    const importerHeadersfirst = [
        { leftMargin: 15, width: 250, text: ['Company, name, address, EORI number and contact details of importer (specify details)'] },
        { leftMargin: 265, width: 95, text: 'Signature' },
        { leftMargin: 360, width: 95, text: 'Date' },
        { leftMargin: 455, width: 80, text: 'Seal' }
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

    // Second importer table
    const importerHeaders = [
        { leftMargin: 15, width: 250, text: ['Company, name, address, EORI number and contact details of representative of the importer (specify details)'] },
        { leftMargin: 265, width: 95, text: 'Signature' },
        { leftMargin: 360, width: 95, text: 'Date' },
        { leftMargin: 455, width: 80, text: 'Seal' }
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

    yPos += headerHeight + rowHeight;

    const createTable = (headerDefs, columnDefs, tableYPos) => {
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


    const article14_1Headers = [
        { leftMargin: 15, width: 250, text: ['Document under Article 14(1) of Regulation (EC) No 1005/2008'] },
        { leftMargin: 265, width: 95, text: 'Yes/No (as appropriate)' },
        { leftMargin: 360, width: 175, text: 'References' }
    ];
    const article14_1Cols = [
        { leftMargin: 15, width: 250 },
        { leftMargin: 265, width: 95 },
        { leftMargin: 360, width: 175 }
    ];
    doc.addStructure(createTable(article14_1Headers, article14_1Cols, yPos));
    yPos += headerHeight + rowHeight;

    const article14_2Headers = [
        { leftMargin: 15, width: 250, text: ['Document under Article 14(2) of Regulation (EC) No 1005/2008'] },
        { leftMargin: 265, width: 95, text: 'Yes/No (as appropriate)' },
        { leftMargin: 360, width: 175, text: 'References (processing statement document number(s))' }
    ];
    const article14_2Cols = [
        { leftMargin: 15, width: 250 },
        { leftMargin: 265, width: 95 },
        { leftMargin: 360, width: 175 }
    ];
    doc.addStructure(createTable(article14_2Headers, article14_2Cols, yPos));
    yPos += headerHeight + rowHeight;

    const memberStateHeaders = [
        { leftMargin: 15, width: 520, text: 'Member State and office of import' }
    ];
    const memberStateCols = [
        { leftMargin: 15, width: 520 }
    ];
    doc.addStructure(createTable(memberStateHeaders, memberStateCols, yPos));
    yPos += headerHeight + rowHeight;

    const transportHeaders = [
        { leftMargin: 15, width: 250, text: 'Means of transport upon arrival (airplane,vehicle, ship, train)' },
        { leftMargin: 265, width: 95, text: 'Transport document reference' },
        { leftMargin: 360, width: 175, text: 'Estimated time of arrival (if submission under Article 12(1) of Regulation (EC) No 1005/2008' }
    ];
    const transportCols = [
        { leftMargin: 15, width: 250 },
        { leftMargin: 265, width: 95 },
        { leftMargin: 360, width: 175 }
    ];
    doc.addStructure(createTable(transportHeaders, transportCols, yPos));
    yPos += headerHeight + rowHeight;

    const customsHeaders = [
        { leftMargin: 15, width: 300, text: 'Customs declaration number (if issued)' },
        { leftMargin: 315, width: 220, text: 'CHED number (if available)' }
    ];
    const customsCols = [
        { leftMargin: 15, width: 300 },
        { leftMargin: 315, width: 220 }
    ];
    doc.addStructure(createTable(customsHeaders, customsCols, yPos));
    yPos += headerHeight + rowHeight;

    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        doc.lineWidth(1.5);
        doc.undash();
        doc.moveTo(PdfStyle.MARGIN.LEFT + 225, yPos + 0.5).lineTo(PdfStyle.MARGIN.LEFT + 225, yPos + headerHeight - 0.5).stroke('#ffffff');
    }));
    PdfUtils.separator(doc, yPos + 5);
}

const section17 = (doc, data, startY) => {
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '4    Re-export control');
    }));
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
    doc.addStructure(doc.struct('P', () => {
        doc.text('* Tick as appropriate', PdfStyle.MARGIN.LEFT + 15, yPos);
    }));

    PdfUtils.separator(doc, yPos + 15);
};

const section16 = (doc, data, startY) => {
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '3    Authority');
    }));
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
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '2');
    }));

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
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '1    Description of re-exported product');
    }));
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

    // Section 13 - Refusal of catch certificate (EU2026 changes)
    let yPos = startY + PdfStyle.ROW.HEIGHT * 3;
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '13');
    }));
    const headerHeight = PdfStyle.ROW.HEIGHT * 2 - 3;
    const rowHeight = PdfStyle.ROW.HEIGHT+20;
    let cellHeight = PdfStyle.ROW.HEIGHT * 2 - 3;

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

    const th1 = doc.struct('TH', () => PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 85, headerHeight, 'Refusal of catch certificate'));
    const th2 = doc.struct('TH', () => PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 100, yPos, 350, headerHeight, 'Catch certificate refused on the basis of the following provision of Regulation (EC) No 1005/2008:'));
    const th3 = doc.struct('TH', () => PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 450, yPos, 80, headerHeight, 'Tick as appropriate'));
    
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
            const td1 = doc.struct('TD', () => PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos + cellHeight, 85, totalRowsHeight));
            tableBodyRow.add(td1);
        }
        
        const td2 = doc.struct('TD', () => PdfUtils.fieldBgWhite(doc, PdfStyle.MARGIN.LEFT + 100, rowY, 350, rowHeight, text));
        const td3 = doc.struct('TD', () => PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 450, rowY, 80, rowHeight));
        
        tableBodyRow.add(td2);
        tableBodyRow.add(td3);
        tableBodyRow.end();
    });

    tableBody.end();
    myTable.end();
};

const section12 = (doc, data, startY) => {
    let yPos = startY + PdfStyle.ROW.HEIGHT * 3;
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '12');
    }));

    const headerHeight =  PdfStyle.ROW.HEIGHT * 2 - 3;
    const rowHeight = PdfStyle.ROW.HEIGHT * 3;

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
    yPos += headerHeight + rowHeight + 5;
    doc.addStructure(doc.struct('P', () => {
        doc.text('* Tick as appropriate', PdfStyle.MARGIN.LEFT + 15, yPos);
    }));
};

const section11 = (doc, data, startY) => {
    generateSection11(doc, data, startY);
};

const section10 = (doc, data, startY) => {
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + 12, '10    Transport details: See Appendix I');
    }));
    PdfUtils.separator(doc, startY + 36);
};

const section9 = (doc, data, isSample, buff, startY) => {
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '9    Flag State Authority Validation:');
    }));
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
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '8');
    }));

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
    doc.addStructure(doc.struct('P', () => {
        doc.text('* Date of acceptance by exporter of the veracity of the contents of this document', PdfStyle.MARGIN.LEFT + 15, yPos);
    }));

    PdfUtils.separator(doc, startY + 137);
};

const section7 = (doc, data, startY) => {

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '7    Transhipment and/or landing authorisation within a port area:');
    }));
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
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '6');
    }));

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
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '5    Name of master of fishing vessel or of fishing licence holder – Signature:');
    }));

    yPos += PdfStyle.ROW.HEIGHT;

    const licenceHolder = isMultiVessel(data.exportPayload) ? "Multiple vessels - See schedule" : getLicenceHolder(data.exportPayload);
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 515, PdfStyle.ROW.HEIGHT, licenceHolder);
    }));

    yPos += PdfStyle.ROW.HEIGHT + 5;

    doc.addStructure(doc.struct('P', () => {
        doc.text('* I am a representative of the vessel (s) shown on this document', PdfStyle.MARGIN.LEFT + 15, yPos);
    }));
    PdfUtils.separator(doc, startY + 45);
};

const section4 = (doc, data, startY) => {
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '4    References to applicable conservation and management measures');
    }));
    let policy = '';
    if (data.conservation) {
        policy = data.conservation.conservationReference === 'Other' ? data.conservation.anotherConservation : data.conservation.conservationReference;
    }
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, startY + 12, 515, PdfStyle.ROW.HEIGHT * 2, policy);
    }));
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

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '3    Description of Product');
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 15, startY + 14, 'Type of processing authorised on board:');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, startY + 26, 515, PdfStyle.ROW.HEIGHT);
    }));

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

    createSection3HeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + 15, startY + 48, 110, cellHeight, 'Species');
    createSection3HeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + 125, startY + 48, 55, cellHeight, 'Product Code');
    createSection3HeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + 180, startY + 48, 80, cellHeight, ['Catch Area(s)', '(Catch Area,', 'EEZ, RFMO,', 'High Seas)']);
    createSection3HeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + 260, startY + 48, 80, cellHeight, ['Catch Date(s)', '(from - to)']);
    createSection3HeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + 340, startY + 48, 55, cellHeight, 'Estimated weight to be landed in kg');
    createSection3HeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + 395, startY + 48, 55, cellHeight, 'Net catch weight in kg');
    createSection3HeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + 450, startY + 48, 80, cellHeight, 'Verified weight landed (net catch weight in kg)');

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
        const rowCellData = getSection3RowData(rowIdx, arrLength, rowData, hasData);

        createSection3DataCell(doc, tableBodyRow, { x: PdfStyle.MARGIN.LEFT + 15, y, width: 110, height: PdfStyle.ROW.HEIGHT + 30, content: rowCellData.speciesText });
        createSection3DataCell(doc, tableBodyRow, { x: PdfStyle.MARGIN.LEFT + 125, y, width: 55, height: PdfStyle.ROW.HEIGHT + 30, content: rowCellData.commodityCodeText });
        createSection3DataCell(doc, tableBodyRow, { x: PdfStyle.MARGIN.LEFT + 180, y, width: 80, height: PdfStyle.ROW.HEIGHT + 30, content: rowCellData.catchAreasText, lineSpacing: 4 });
        createSection3DataCell(doc, tableBodyRow, { x: PdfStyle.MARGIN.LEFT + 260, y, width: 80, height: PdfStyle.ROW.HEIGHT + 30, content: rowCellData.datesText, lineSpacing: 2 });
        createSection3DataCell(doc, tableBodyRow, { x: PdfStyle.MARGIN.LEFT + 340, y, width: 55, height: PdfStyle.ROW.HEIGHT + 30, content: '' });
        createSection3DataCell(doc, tableBodyRow, { x: PdfStyle.MARGIN.LEFT + 395, y, width: 55, height: PdfStyle.ROW.HEIGHT + 30, content: rowCellData.exportWeightText });
        createSection3DataCell(doc, tableBodyRow, { x: PdfStyle.MARGIN.LEFT + 450, y, width: 80, height: PdfStyle.ROW.HEIGHT + 30, content: '' });

        tableBodyRow.end();
        y += PdfStyle.ROW.HEIGHT + 30;
    }


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

const getVesselNameField = (vesselCounts, items) => {
    const vesselCount = Object.keys(vesselCounts).length;
    if (vesselCount === 1) {
        return items[0].landings[0].model.vessel.vesselName;
    } else if (vesselCount > 1) {
        return 'Multiple vessels - SEE SCHEDULE';
    }
    return '';
};

const getSingleVesselDetails = (vesselCounts, items) => {
    if (Object.keys(vesselCounts).length !== 1) {
        return { pln: '', homePortAndFlag: '', licenceNumber: '', licenceValidTo: '' };
    }
    
    const vessel = items[0].landings[0].model.vessel;
    let licenceValidTo = '';
    if (vessel.licenceValidTo) {
        licenceValidTo = moment(vessel.licenceValidTo, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY');
    }
    
    return {
        pln: vessel.pln,
        homePortAndFlag: vessel.flag + ' - ' + vessel.homePort,
        licenceNumber: vessel.licenceNumber,
        licenceValidTo: licenceValidTo
    };
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

    const vesselDetails = getSingleVesselDetails(vesselCounts, items);

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + 4, '2    Fishing Vessel Name');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 120, startY + 2, 155, PdfStyle.ROW.HEIGHT, getVesselNameField(vesselCounts, items));
    }));

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 285, startY + 4, 'Flag - Home Port');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 400, startY + 2, 130, PdfStyle.ROW.HEIGHT, vesselDetails.homePortAndFlag);
    }));

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 15, startY + 29, 'Call Sign / PLN');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 120, startY + 27, 155, PdfStyle.ROW.HEIGHT, vesselDetails.pln);
    }));

    let imoNumberOrCfr = getImoOrCfr(vesselCounts, data);
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 285, startY + 18, 'IMO number or other');
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 285, startY + 30, 'unique vessel identifier');
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 285, startY + 42, '(if applicable)');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 400, startY + 26, 130, PdfStyle.ROW.HEIGHT, imoNumberOrCfr);
    }));

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 15, startY + 54, 'Fishing Licence No.');
    }));

    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 120, startY + 52, 220, PdfStyle.ROW.HEIGHT, vesselDetails.licenceNumber || '');
    }));

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 350, startY + 54, 'Valid until');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 400, startY + 52, 130, PdfStyle.ROW.HEIGHT, vesselDetails.licenceValidTo || '');
    }));


    function getFishingGear(exportPayload) {
        const firstLanding = exportPayload?.items?.[0]?.landings?.[0];
        return firstLanding?.model?.gearType ?? '';
    }
    let fishingGearText = isMultiVessel(data.exportPayload) ? 'Multiple vessels - SEE SCHEDULE' : getFishingGear(data.exportPayload);

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 15, startY + 77, 'Fishing Gear');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 120, startY + 77, 410, PdfStyle.ROW.HEIGHT, fishingGearText ?? '');
    }));

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 15, startY + 100, 'Mobile satellite service no Telefax no Telephone no E-mail address (if issued)');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, startY + 112, 515, PdfStyle.ROW.HEIGHT);
    }));

    PdfUtils.separator(doc, startY + 137);
};

const reExportCertificateHeader = (doc, data, isSample, startY) => {
    doc.fontSize(PdfStyle.FONT_SIZE.MEDIUM);
    doc.addStructure(doc.struct('H3', {}, () => {
        doc.text('(ii) RE-EXPORT CERTIFICATE', PdfStyle.MARGIN.LEFT, startY);
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        doc.lineWidth(2);
        doc.moveTo(185, startY + 4).lineTo(560, startY + 4).stroke();
    }));

    const yPos = startY + 20;
    
    // Certificate Number
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT, yPos, 'Certificate Number');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 105, yPos - 2, 130, PdfStyle.ROW.HEIGHT, '');
    }));

    // Date
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 245, yPos, 'Date');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 275, yPos - 2, 110, PdfStyle.ROW.HEIGHT, '');
    }));

    // Member State
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 395, yPos, 'Member State');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 475, yPos - 2, 55, PdfStyle.ROW.HEIGHT, '');
    }));

    PdfUtils.separator(doc, yPos + 25);
};

const section1 = (doc, data, isSample, startY) => {
    doc.fontSize(PdfStyle.FONT_SIZE.MEDIUM);
    doc.addStructure(doc.struct('H3', {}, () => {
        doc.text('(i) CATCH CERTIFICATE', PdfStyle.MARGIN.LEFT, startY);
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        doc.lineWidth(2);
        doc.moveTo(153, startY + 4).lineTo(560, startY + 4).stroke();
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
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT, startY + 20, 'Document Number');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 95, startY + 18, 160, PdfStyle.ROW.HEIGHT, documentNumber);
    }));

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, 300, startY + 20, 'Validating Authority');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 380, startY + 18, 150, PdfStyle.ROW.HEIGHT, 'Marine Management Organisation');
    }));

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + 40, '1    Name');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 65, startY + 38, 465, PdfStyle.ROW.HEIGHT, 'Illegal Unreported and Unregulated (IUU) Fishing Team');
    }));

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 15, startY + 60, 'Address');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 65, startY + 58, 465, PdfStyle.ROW.HEIGHT * 2 + 5, 'Tyneside House, Skinnerburn Rd, Newcastle upon Tyne, United Kingdom. NE4 7AR');
    }));

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 65, startY + 100, 'Tel.');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 90, startY + 98, 200, PdfStyle.ROW.HEIGHT, '0300 123 1032');
    }));

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 300, startY + 100, 'Email');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 330, startY + 98, 200, PdfStyle.ROW.HEIGHT, 'ukiuuslo@marinemanagement.org.uk');
    }));

    PdfUtils.separator(doc, startY + 123);

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

const mvsHeadingCell = ({doc, x, y, width, height, text}, isBold, fontSize, align, style = MVS_STYLES.DEFAULT) => {
    const textArr = normalizeTextToArray(text);
    mvsCell({doc, x, y, width, height, topPad: height / 3, textArr}, isBold, fontSize, align, style);
};

const mvsTableCell = ({doc, x, y, width, height, text}, isBold, fontSize, align, style = MVS_STYLES.DEFAULT) => {
    const textArr = normalizeTextToArray(text);
    return mvsCell({doc, x, y, width, height, topPad: 4, textArr}, isBold, fontSize, align, style);
};

const mvsCell = ({doc, x, y, width, height, topPad, textArr}, isBold, fontSize, align, style) => {
    const { lineColor, textColor, bgColour } = style;
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
module.exports.calculatePageDimensions = calculatePageDimensions;
module.exports.paginateRows = paginateRows;
module.exports.calculateRequiredCellHeightStatic = calculateRequiredCellHeightStatic;
module.exports.calculateRequiredCellHeight = calculateRequiredCellHeight;
