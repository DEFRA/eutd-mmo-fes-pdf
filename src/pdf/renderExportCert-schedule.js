const path = require('node:path');
const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const CommonUtils = require('../utils/common-utils');
const { MVS_STYLES, mvsHeadingCell, mvsTableCell, createMVSTableHeaderCell, createMVSTableDataCell } = require('./renderExportCert-mvs-cells');
const { getProductScheduleRows } = require('./renderExportCert-data');

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
const DOCUMENT_NUMBER_SECTION_WIDTH = 90;
const MVS_HEADER_SECOND_COL_X = 230;
const IMO_VESSEL_IDENTIFIER_TEXT = 'IMO number or other unique vessel identifier (if applicable)';

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

const MAX_ROWS_PER_PAGE = 5;
const WATERMARK_OFFSET_X = 70;
const WATERMARK_OFFSET_Y = 70;
const MULTI_VESSEL_BLANK_TEMPLATE_PAGE_COUNT = 3;

// Constant for QR code section X offset to avoid magic numbers
const QR_CODE_SECTION_X_OFFSET = 500;
// Constant for document number section artifact X offset to avoid magic numbers
const DOCUMENT_NUMBER_SECTION_ARTIFACT_X_OFFSET = 580;

function getImoOrCfrForMultiVesselSchedule(row) {
    if (row.imo) {
        return row.imo;
    } else if (row.cfr) {
        return row.cfr;
    } else {
        return '';
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

const shouldStartNewPage = (currentPageHeight, tempHeight, availableHeight, currentRowCount, maxRowsPerPage) => {
    const exceedsHeight = currentPageHeight + tempHeight > availableHeight;
    const exceedsRowLimit = currentRowCount >= maxRowsPerPage;
    const hasExistingRows = currentRowCount > 0;
    return (exceedsHeight || exceedsRowLimit) && hasExistingRows;
};

const paginateRows = (rows, availableHeight, maxRowsPerPage = MAX_ROWS_PER_PAGE) => {
    const pages = [];
    let currentPageRows = [];
    let currentPageHeight = 0;

    // Calculate the maximum height required for the Master/Licence Holder column across all rows
    const maxLicenceHolderHeight = calculateMaxRowHeightForLicenceHolder(rows);

    for (let i = 0; i < rows.length; i++) {
        const tempHeight = maxLicenceHolderHeight;

        if (shouldStartNewPage(currentPageHeight, tempHeight, availableHeight, currentPageRows.length, maxRowsPerPage)) {
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

// Helper function to safely get row data or return empty string
const getRowValue = (rowIdx, rowDataLimit, rows, valueAccessor) => {
    if (rowIdx >= rowDataLimit) {
        return '';
    }
    return valueAccessor(rows[rowIdx]);
};

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

module.exports = {
    calculateRowHeight,
    calculateMaxRowHeightForLicenceHolder,
    calculatePageDimensions,
    shouldStartNewPage,
    paginateRows,
    renderMultiVesselPages,
    renderMultiVesselScheduleHeader,
    multiVesselScheduleHeading,
    multiVesselScheduleHeadingDynamic,
    formatCatchAreaData,
    calculateRequiredCellHeight,
    calculateRequiredCellHeightStatic,
    renderTableRow,
    generateMultiVesselTableRows,
};
