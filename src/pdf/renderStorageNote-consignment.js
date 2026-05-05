const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const CommonUtils = require('../utils/common-utils');
const {
    COL3,
    COL5,
    TITLE_OFFSET,
    PAGE_HEIGHT,
    CONSIGNMENT_PADDING_X,
    CONSIGNMENT_ROW_PADDING,
    CONSIGNMENT_COL_WIDTHS,
    CONSIGNMENT_ROWS_COUNT,
    CONSIGNMENT_TABLE_START_Y_OFFSET,
    CONSIGNMENT_SEPARATOR_OFFSET,
    CONSIGNMENT_HEADER_MULTIPLIER,
    CONSIGNMENT_CELL_MULTIPLIER,
    CONTINUED_SECTION_START_Y,
    NEW_PAGE_START_Y_OFFSET,
} = require('./renderStorageNote-constants');

const getSectionContinuedTitle = (sectionNumber, type) => {
    const typeLabel = type === 'arrival' ? 'arrival to' : 'departure from';
    return `${sectionNumber}.    Consignment details (upon ${typeLabel} the place of storage) continued`;
};

const getWeightLabel = (type) => type === 'arrival' ? 'entering' : 'departing';
const getWeighField = (type) => type === 'arrival' ? 'netWeightProductArrival' : 'netWeightProductDeparture';
const getNetWeightField = (type) => type === 'arrival' ? 'netWeightFisheryProductArrival' : 'netWeightFisheryProductDeparture';

const createConsignmentTableHeaders = (doc, myTable, yPos, colWidths, headerCellHeight, weightLabel) => {
    const myTableHead = doc.struct('THead');
    myTable.add(myTableHead);

    const myTableHeadRow = doc.struct('TR');
    myTableHead.add(myTableHeadRow);

    const myTableHeadOne = doc.struct('TH');
    myTableHeadRow.add(myTableHeadOne);
    const myTableHeadOneContent = doc.markStructureContent('TH');
    myTableHeadOne.add(myTableHeadOneContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + CONSIGNMENT_PADDING_X, yPos, colWidths[0], headerCellHeight, 'Description of fisheries products');
    myTableHeadOne.end();

    const myTableHeadTwo = doc.struct('TH');
    myTableHeadRow.add(myTableHeadTwo);
    const myTableHeadTwoContent = doc.markStructureContent('TH');
    myTableHeadTwo.add(myTableHeadTwoContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + CONSIGNMENT_PADDING_X + colWidths[0], yPos, colWidths[1], headerCellHeight, 'Species');
    myTableHeadTwo.end();

    const myTableHeadThree = doc.struct('TH');
    myTableHeadRow.add(myTableHeadThree);
    const myTableHeadThreeContent = doc.markStructureContent('TH');
    myTableHeadThree.add(myTableHeadThreeContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + CONSIGNMENT_PADDING_X + colWidths[0] + colWidths[1], yPos, colWidths[2], headerCellHeight, 'Product Code');
    myTableHeadThree.end();

    const myTableHeadFour = doc.struct('TH');
    myTableHeadRow.add(myTableHeadFour);
    const myTableHeadFourContent = doc.markStructureContent('TH');
    myTableHeadFour.add(myTableHeadFourContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + CONSIGNMENT_PADDING_X + colWidths[0] + colWidths[1] + colWidths[2], yPos, colWidths[COL3], headerCellHeight, ['Catch Certificate / Processing', 'Statement/non-manipulation ', 'declaration number(s) (if',  'applicable)']);
    myTableHeadFour.end();

    const myTableHeadFive = doc.struct('TH');
    myTableHeadRow.add(myTableHeadFive);
    const myTableHeadFiveContent = doc.markStructureContent('TH');
    myTableHeadFive.add(myTableHeadFiveContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + CONSIGNMENT_PADDING_X + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[COL3], yPos, colWidths[4], headerCellHeight, ['Net weight in kg', `${weightLabel} the`, 'place of storage']);
    myTableHeadFive.end();

    const myTableHeadSix = doc.struct('TH');
    myTableHeadRow.add(myTableHeadSix);
    const myTableHeadSixContent = doc.markStructureContent('TH');
    myTableHeadSix.add(myTableHeadSixContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + CONSIGNMENT_PADDING_X + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[COL3] + colWidths[4], yPos, colWidths[COL5], headerCellHeight, ['Net fishery product', `weight in kg ${weightLabel}`, 'the place of storage']);
    myTableHeadSix.end();

    myTableHeadRow.end();
    myTableHead.end();
};

const createConsignmentTableRow = (doc, tableBody, rowY, colWidths, cellHeight, catchData, allWeights) => {
    const tableBodyRow = doc.struct('TR');
    tableBody.add(tableBodyRow);

    const TdOne = doc.struct('TD');
    tableBodyRow.add(TdOne);
    const TdOneContent = doc.markStructureContent('TD');
    TdOne.add(TdOneContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + CONSIGNMENT_PADDING_X, rowY, colWidths[0], cellHeight, catchData?.productDescription || ' ');
    TdOne.end();

    const TdTwo = doc.struct('TD');
    tableBodyRow.add(TdTwo);
    const TdTwoContent = doc.markStructureContent('TD');
    TdTwo.add(TdTwoContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + CONSIGNMENT_PADDING_X + colWidths[0], rowY, colWidths[1], cellHeight, catchData?.product || ' ');
    TdTwo.end();

    const TdThree = doc.struct('TD');
    tableBodyRow.add(TdThree);
    const TdThreeContent = doc.markStructureContent('TD');
    TdThree.add(TdThreeContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + CONSIGNMENT_PADDING_X + colWidths[0] + colWidths[1], rowY, colWidths[2], cellHeight, catchData?.commodityCode || ' ');
    TdThree.end();

    const TdFour = doc.struct('TD');
    tableBodyRow.add(TdFour);
    const TdFourContent = doc.markStructureContent('TD');
    TdFour.add(TdFourContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + CONSIGNMENT_PADDING_X + colWidths[0] + colWidths[1] + colWidths[2], rowY, colWidths[COL3], cellHeight, catchData?.certificateNumber || ' ');
    TdFour.end();

    const TdFive = doc.struct('TD');
    tableBodyRow.add(TdFive);
    const TdFiveContent = doc.markStructureContent('TD');
    TdFive.add(TdFiveContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + CONSIGNMENT_PADDING_X + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[COL3], rowY, colWidths[4], cellHeight, catchData?.[allWeights.weightField] ? Number(catchData[allWeights.weightField]).toFixed(2) : ' ');
    TdFive.end();

    const TdSix = doc.struct('TD');
    tableBodyRow.add(TdSix);
    const TdSixContent = doc.markStructureContent('TD');
    TdSix.add(TdSixContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + CONSIGNMENT_PADDING_X + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[COL3] + colWidths[4], rowY, colWidths[COL5], cellHeight, catchData?.[allWeights.netWeightField] ? Number(catchData[allWeights.netWeightField]).toFixed(2) : ' ');
    TdSix.end();

    tableBodyRow.end();
};

const createConsignmentTable = (doc, data, startY, type, maxRows = null, showSeparator = true) => {
    const yPos = startY;
    const cellHeight = PdfStyle.ROW.HEIGHT * CONSIGNMENT_CELL_MULTIPLIER;
    const headerCellHeight = PdfStyle.ROW.HEIGHT * CONSIGNMENT_HEADER_MULTIPLIER;
    const colWidths = CONSIGNMENT_COL_WIDTHS;

    const weightLabel = getWeightLabel(type);
    const weightField = getWeighField(type);
    const netWeightField = getNetWeightField(type);
    const allWeights = { weightField, netWeightField };

    const myTable = doc.struct('Table');
    doc.addStructure(myTable);

    createConsignmentTableHeaders(doc, myTable, yPos, colWidths, headerCellHeight, weightLabel);

    const tableBody = doc.struct('TBody');
    myTable.add(tableBody);

    const allCatches = data?.catches || [];
    const totalRowsToRender = maxRows === null ? Math.max(allCatches.length, 1) : maxRows;

    for (let idx = 0; idx < totalRowsToRender; idx++) {
        const rowY = yPos + headerCellHeight + (idx * cellHeight);
        const c = idx < allCatches.length ? allCatches[idx] : null;
        createConsignmentTableRow(doc, tableBody, rowY, colWidths, cellHeight, c, allWeights);
    }

    doc.endMarkedContent();
    tableBody.end();
    myTable.end();

    if (showSeparator) {
        const rowsCount = maxRows === null ? (data?.catches?.length || 1) : maxRows;
        const finalY = yPos + headerCellHeight + (rowsCount * cellHeight) + CONSIGNMENT_ROW_PADDING;
        doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
            PdfUtils.separator(doc, finalY + PdfStyle.ROW.HEIGHT);
        }));
    }
};

const section3 = (doc, data, startY) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '3.    Consignment details (upon arrival to the place of storage)');
    }));
    createConsignmentTable(doc, data, startY + CONSIGNMENT_TABLE_START_Y_OFFSET, 'arrival', CONSIGNMENT_ROWS_COUNT);
};

const section5 = (doc, data, startY) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '5.    Consignment details (upon departure from the place of storage)');
    }));
    createConsignmentTable(doc, data, startY + CONSIGNMENT_TABLE_START_Y_OFFSET, 'departure', CONSIGNMENT_ROWS_COUNT);
};

const sectionContinued = (doc, data, isSample, sectionNumber, type, pageRef) => {
    const headerCellHeight = PdfStyle.ROW.HEIGHT * CONSIGNMENT_HEADER_MULTIPLIER;
    const cellHeight = PdfStyle.ROW.HEIGHT * CONSIGNMENT_CELL_MULTIPLIER;
    const titleHeight = TITLE_OFFSET;
    const availableHeight = PAGE_HEIGHT - PdfStyle.MARGIN.TOP - CONTINUED_SECTION_START_Y - titleHeight;
    const rowsPerPage = Math.floor((availableHeight - headerCellHeight - CONSIGNMENT_SEPARATOR_OFFSET - PdfStyle.ROW.HEIGHT) / cellHeight);

    const allCatches = data?.catches || [];
    const remainingCatches = allCatches.slice(CONSIGNMENT_ROWS_COUNT);

    const sectionTitle = getSectionContinuedTitle(sectionNumber, type);

    const numPagesNeeded = remainingCatches.length > 0
        ? Math.ceil(remainingCatches.length / rowsPerPage)
        : 0;
    const numPagesToRender = Math.min(numPagesNeeded, 2);

    for (let pageNum = 0; pageNum < numPagesToRender; pageNum++) {
        if (isSample) {
            CommonUtils.addSampleWatermark(doc);
        }
        PdfUtils.endOfPage(doc, pageRef.value);
        doc.addPage();
        pageRef.value += 1;
        if (isSample) {
            CommonUtils.addSampleWatermark(doc);
        }

        const startY = PdfStyle.MARGIN.TOP + CONTINUED_SECTION_START_Y;

        doc.addStructure(doc.struct('H3', () => {
            PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, sectionTitle);
        }));

        const startIdx = pageNum * rowsPerPage;
        const endIdx = startIdx + rowsPerPage;
        const pageData = {
            catches: remainingCatches.slice(startIdx, endIdx)
        };

        createConsignmentTable(doc, pageData, startY + titleHeight, type, rowsPerPage, false);
    }
};

module.exports = {
    getSectionContinuedTitle,
    createConsignmentTable,
    section3,
    section5,
    sectionContinued,
};
