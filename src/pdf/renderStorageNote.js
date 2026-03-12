const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const CommonUtils = require('../utils/common-utils');

const getSectionContinuedTitle = (sectionNumber, type) => {
    const typeLabel = type === 'arrival' ? 'arrival to' : 'departure from';
    return `${sectionNumber}.    Consignment details (upon ${typeLabel} the place of storage) continued`;
};

// Transport key constants to avoid duplication
const TRANSPORT_VEHICLE_KEY = 'transport.vehicle';
const ARRIVAL_TRANSPORT_VEHICLE_KEY = 'arrivalTransport.vehicle';

const PAGE_HEIGHT = 780;
const GAP = 15;
const SECTION_4_SEPARATOR_GAP = 30;
const CONSIGNMENT_SEPARATOR_OFFSET = 5;
const COL3=3
const COL5=5
const SECTION_1_SPACING= 560

// Spacing and layout constants
const TITLE_OFFSET = 12;
const HEADER_SUBROW_OFFSET = 30;
const MARGIN_OFFSET = 15;
const SPACING_SMALL = 5;
const SPACING_MEDIUM = 9;
const SPACING_LARGE = 15;

// Section 4 (Storage Facility Details) column widths and positions
const SECTION_4_COL1_WIDTH = 110;    // Name
const SECTION_4_COL1_X = MARGIN_OFFSET;
const SECTION_4_COL2_X = SECTION_4_COL1_X + SECTION_4_COL1_WIDTH;  // 125
const SECTION_4_COL2_WIDTH = 145;    // Address

// Transport field keys
const ARRIVAL_TRANSPORT_CONTAINER_NUMBERS = 'arrivalTransport.containerNumbers';
const TRANSPORT_CONTAINER_NUMBERS = 'transport.containerNumbers';
const SECTION_4_COL3_X = SECTION_4_COL2_X + SECTION_4_COL2_WIDTH;  // 270
const SECTION_4_COL3_WIDTH = 110;    // Approval number
const SECTION_4_COL4_X = SECTION_4_COL3_X + SECTION_4_COL3_WIDTH;  // 380
const SECTION_4_COL4_WIDTH = 150;    // Stored as
const SECTION_4_SUBROW_COL_WIDTH = 50;
const SECTION_4_SUBROW_COL2_X = SECTION_4_COL4_X + SECTION_4_SUBROW_COL_WIDTH;  // 430
const SECTION_4_SUBROW_COL3_X = SECTION_4_COL4_X + 100; // 480

// Section 7 (Exporter Details) column widths and positions
const SECTION_7_COL1_WIDTH = 150;    // Company name
const SECTION_7_COL1_X = MARGIN_OFFSET;
const SECTION_7_COL2_X = SECTION_7_COL1_X + SECTION_7_COL1_WIDTH;  // 165
const SECTION_7_COL2_WIDTH = 280;    // Address
const SECTION_7_COL3_X = SECTION_7_COL2_X + SECTION_7_COL2_WIDTH;  // 425
const SECTION_7_COL3_WIDTH = 110;    // Date of submission

// Row height multipliers
const CONSIGNMENT_HEADER_MULTIPLIER = 2.8;
const CONSIGNMENT_CELL_MULTIPLIER = 3;
const SECTION_4_HEADER_MULTIPLIER = 4;
const SECTION_4_DATA_MULTIPLIER = 6;

// Section 1 (Declaration) layout constants
const SECTION_1_TOP_LINE_OFFSET = 4;
const SECTION_1_LABEL_OFFSET = 17;
const SECTION_1_FIELD_OFFSET_X = 95;
const SECTION_1_FIELD_OFFSET_Y = 15;
const SECTION_1_FIELD_WIDTH = 160;
const SECTION_1_DECLARING_AUTHORITY_X = 300;
const SECTION_1_DECLARING_AUTHORITY_WIDTH = 150;
const SECTION_1_DECLARING_AUTHORITY_Y = 15;
const SECTION_1_NAME_Y = 40;
const SECTION_1_NAME_LABEL_Y = 40;
const SECTION_1_NAME_FIELD_X = 65;
const SECTION_1_NAME_FIELD_Y = 38;
const SECTION_1_NAME_FIELD_WIDTH = 465;
const SECTION_1_ADDRESS_LABEL_X = 15;
const SECTION_1_ADDRESS_LABEL_Y = 60;
const SECTION_1_ADDRESS_FIELD_X = 65;
const SECTION_1_ADDRESS_FIELD_Y = 58;
const SECTION_1_ADDRESS_FIELD_WIDTH = 465;
const SECTION_1_ADDRESS_FIELD_HEIGHT_MULTIPLIER = 2;
const SECTION_1_TEL_LABEL_Y = 100;
const SECTION_1_TEL_FIELD_X = 90;
const SECTION_1_TEL_FIELD_Y = 98;
const SECTION_1_TEL_FIELD_WIDTH = 200;
const SECTION_1_EMAIL_LABEL_X = 300;
const SECTION_1_EMAIL_LABEL_Y = 100;
const SECTION_1_EMAIL_FIELD_X = 330;
const SECTION_1_EMAIL_FIELD_Y = 98;
const SECTION_1_EMAIL_FIELD_WIDTH = 200;
const SECTION_1_BOTTOM_LINE_Y = 120;
const SECTION_1_BOTTOM_LINE_X_END = 600;
const SECTION_1_LINE_WIDTH_THIN = 0.75;
const SECTION_1_LINE_WIDTH_THICK = 2;
const SECTION_1_LINE_DASH_SIZE = 2;
const SECTION_1_LINE_SPACE = 2;

// Consignment table column widths
const CONSIGNMENT_COL_DESCRIPTION_WIDTH = 85;
const CONSIGNMENT_COL_SPECIES_WIDTH = 65;
const CONSIGNMENT_COL_PRODUCT_CODE_WIDTH = 45;
const CONSIGNMENT_COL_CERTIFICATE_WIDTH = 135;
const CONSIGNMENT_COL_NET_WEIGHT_WIDTH = 80;
const CONSIGNMENT_COL_FISHERY_PRODUCT_WIDTH = 105;
const CONSIGNMENT_COL_WIDTHS = [
    CONSIGNMENT_COL_DESCRIPTION_WIDTH,
    CONSIGNMENT_COL_SPECIES_WIDTH,
    CONSIGNMENT_COL_PRODUCT_CODE_WIDTH,
    CONSIGNMENT_COL_CERTIFICATE_WIDTH,
    CONSIGNMENT_COL_NET_WEIGHT_WIDTH,
    CONSIGNMENT_COL_FISHERY_PRODUCT_WIDTH
];

// Consignment table constants
const CONSIGNMENT_PADDING_X = 15;
const CONSIGNMENT_ROW_PADDING = 10;

// Section 6 constants
const SECTION_6_ADDITIONAL_HEIGHT = 8;

// Separator spacing
const SEPARATOR_OFFSET_AFTER_CELL = 8;
const SEPARATOR_SPACING = 8;

// Page layout constants
const NEW_PAGE_START_Y_OFFSET = 25;
const CONTINUED_SECTION_START_Y = 25;
const MAIN_HEADER_Y_OFFSET = 65;

// Row height multipliers for various sections
const ROW_HEIGHT_MULTIPLIER_2 = 2;
const ROW_HEIGHT_MULTIPLIER_3_5 = 3.5;
const ROW_HEIGHT_MULTIPLIER_4 = 4;
const ROW_HEIGHT_MULTIPLIER_5 = 5;
const ROW_HEIGHT_MULTIPLIER_6 = 6;

// Consignment table specific
const CONSIGNMENT_ROWS_COUNT = 3;
const CONSIGNMENT_CELL_HEIGHT_MULTIPLIER = 3;

// Offset for consignment table start Y position
const CONSIGNMENT_TABLE_START_Y_OFFSET = 12;
const TRANSPORT_DETAILS_TABLE_START_Y_OFFSET = 12;

// Section height adjustments
const SECTION_2_FIELD_SPACING = 10;
const SECTION_ADDITIONAL_SPACING = 5;
const SECTION_7_ADDITIONAL_SPACING = 4;

// Section 4 specific
const SECTION_4_HEADER_ROW_MULTIPLIER = 2;
const SECTION_4_DATA_ROW_MULTIPLIER = 5;

// Section 8 (Declaration) constants
const SECTION_8_Y_OFFSET = 50;
const SECTION_8_INFO_TEXT_Y_OFFSET = 14;
const SECTION_8_INFO_TEXT_WIDTH = 520;
const SECTION_8_QR_CODE_Y_OFFSET = 75;
const SECTION_8_TABLE_Y_OFFSET = 50;
const SECTION_8_CELL_HEIGHT_BASE = 5;
const SECTION_8_CELL_HEIGHT_PADDING = 10;
const SECTION_8_FOOTER_HEIGHT = 60;
const SECTION_8_COL1_X = 15;
const SECTION_8_COL1_WIDTH = 235;
const SECTION_8_COL2_X = 250;
const SECTION_8_COL2_WIDTH = 200;
const SECTION_8_QR_CODE_X = 255;
const SECTION_8_COL3_X = 450;
const SECTION_8_COL3_WIDTH = 80;
const SECTION_8_FOOTER_TEXT_X = 10;

// Transport details table constants
const TRANSPORT_DETAILS_COL1_WIDTH = 220;
const TRANSPORT_DETAILS_COL2_WIDTH = 295;
const TRANSPORT_DETAILS_COL2_X = 235;
const TRANSPORT_DETAILS_ROW_PADDING = 10;

let currentPage = 1;
 
const formatCurrentDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
};

const renderStorageNote = async (data, isSample, uri, stream) => {
    currentPage = 1; 
    
    let buff = null;
    if (!isSample) {
        buff = await PdfUtils.generateQRCode(uri);
    }

    const dateOfSubmission = formatCurrentDate();

    const doc = CommonUtils.createBaseDocument(uri);
    doc.pipe(stream);
 
    PdfUtils.heading(doc, 'NON-MANIPULATION DOCUMENT');
    const startY = PdfStyle.MARGIN.TOP + MAIN_HEADER_Y_OFFSET;
 
    renderAllSections(doc, data, isSample, buff, startY, dateOfSubmission);
 
    if (isSample) {
        CommonUtils.addSampleWatermark(doc);
    }
    PdfUtils.endOfPage(doc, currentPage);
 
    doc.end();
};
 
const renderAllSections = (doc, data, isSample, buff, initialStartY, dateOfSubmission) => {
    let startY = initialStartY;
 
    const ensureSpaceAndMaybeNewPage = (estHeight) => {
        if (startY + estHeight > PAGE_HEIGHT) {
            if (isSample){
                CommonUtils.addSampleWatermark(doc);
            }
            PdfUtils.endOfPage(doc, currentPage);
            doc.addPage();
            currentPage += 1;
            if (isSample) {
                CommonUtils.addSampleWatermark(doc);
            }
            startY = PdfStyle.MARGIN.TOP + NEW_PAGE_START_Y_OFFSET;
        }
    };
 
    // Section 1
    const section1Height = estimateSection1();
    ensureSpaceAndMaybeNewPage(section1Height);
    section1(doc, data, isSample, startY);
    startY = startY + section1Height + GAP;
 
    // Section 2
    const section2Height = estimateSection2();
    ensureSpaceAndMaybeNewPage(section2Height);
    section2(doc, data, startY);
    startY = startY + section2Height + GAP;
 
    // Section 3
    const section3Height = estimateConsignmentSection();
    ensureSpaceAndMaybeNewPage(section3Height);
    section3(doc, data, startY);
    startY = startY + section3Height + GAP;
 
    // Section 4
    const section4Height = estimateSection4();
    ensureSpaceAndMaybeNewPage(section4Height);
    section4(doc, data, startY);
    
    startY = startY + section4Height + GAP + SECTION_4_SEPARATOR_GAP;
 
    // Section 5
    const section5Height = estimateConsignmentSection();
    ensureSpaceAndMaybeNewPage(section5Height);
    section5(doc, data, startY);
    startY = startY + section5Height + GAP;
 
    // Section 6
    const section6Height = estimateSection6();
    ensureSpaceAndMaybeNewPage(section6Height);
    section6(doc, data, startY);
    startY = startY + section6Height + GAP + SECTION_ADDITIONAL_SPACING;

    // Section 7
    const section7Height = estimateSection7();
    ensureSpaceAndMaybeNewPage(section7Height);
    section7(doc, data, startY, dateOfSubmission);
    startY = startY + section7Height + GAP + SECTION_ADDITIONAL_SPACING;

    // Section 8
    const section8Height = estimateSection8();
    ensureSpaceAndMaybeNewPage(section8Height);
    section8(doc, isSample, buff, startY);
    startY = startY + section8Height;
     // Section 3 Continued  
    sectionContinued(doc, data, isSample, '3', 'arrival');
   // Section 5 Continued 
    sectionContinued(doc, data, isSample, '5', 'departure');

    return startY;
};

const estimateSection1 = () => SECTION_1_BOTTOM_LINE_Y;
 
const estimateSection2 = () => {
    const rows = [
        'arrivalTransport.departureCountry',
        'arrivalTransport.departureDate',
        'arrivalTransport.departurePort',
        ARRIVAL_TRANSPORT_VEHICLE_KEY,
        ARRIVAL_TRANSPORT_CONTAINER_NUMBERS,
        'facilityArrivalDate',
        'arrivalTransport.placeOfUnloading'
    ];
    let sum = 0;
    rows.forEach(key => {
        const height = shouldUseExpandedHeight(key) ? PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_6 : PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_2;
        sum += (height + SECTION_2_FIELD_SPACING);
    });
    return TITLE_OFFSET + sum + SEPARATOR_SPACING;
};

const estimateConsignmentSection = () => {
    const headerCellHeight = PdfStyle.ROW.HEIGHT * CONSIGNMENT_HEADER_MULTIPLIER;
    const cellHeight = PdfStyle.ROW.HEIGHT * CONSIGNMENT_CELL_MULTIPLIER;
    return TITLE_OFFSET + headerCellHeight + (CONSIGNMENT_ROWS_COUNT * cellHeight) + CONSIGNMENT_SEPARATOR_OFFSET + PdfStyle.ROW.HEIGHT;
};
 
const estimateSection4 = () => {
    const headerHeight = PdfStyle.ROW.HEIGHT * SECTION_4_HEADER_ROW_MULTIPLIER;
    const dataRowHeight = PdfStyle.ROW.HEIGHT * SECTION_4_DATA_ROW_MULTIPLIER;
    return TITLE_OFFSET + headerHeight + dataRowHeight + SPACING_LARGE;
};
 
const estimateSection6 = () => {
    const rows = [
        'transport.exportDate',
        'transport.departurePlace',
        TRANSPORT_VEHICLE_KEY,
        TRANSPORT_CONTAINER_NUMBERS,
        'transport.exportedTo.officialCountryName'
    ];
    let sum = 0;
    rows.forEach(key => {
        const height = shouldUseExpandedHeight(key) ? PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_3_5 : PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_2;
        sum += (height + SPACING_MEDIUM);
    });
    return TITLE_OFFSET + sum + SPACING_LARGE;
};

const estimateSection7 = () => {
    const headerHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_3_5;
    const contentHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_4 - SPACING_MEDIUM;
    const footerHeight = PdfStyle.ROW.HEIGHT;
    return TITLE_OFFSET + headerHeight + contentHeight + SPACING_SMALL + footerHeight;
};

const estimateSection8 = () => {
    const cellHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_5 + SECTION_8_CELL_HEIGHT_PADDING;
    return TITLE_OFFSET + cellHeight + SEPARATOR_SPACING + SECTION_8_FOOTER_HEIGHT;
};
 
const section3 = (doc, data, startY) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '3.    Consignment details (upon arrival to the place of storage)');
    }));
    createConsignmentTable(doc, data, startY + CONSIGNMENT_TABLE_START_Y_OFFSET, 'arrival', CONSIGNMENT_ROWS_COUNT);
};

const sectionContinued = (doc, data, isSample, sectionNumber, type) => {
    const headerCellHeight = PdfStyle.ROW.HEIGHT * CONSIGNMENT_HEADER_MULTIPLIER;
    const cellHeight = PdfStyle.ROW.HEIGHT * CONSIGNMENT_CELL_MULTIPLIER;
    const titleHeight = TITLE_OFFSET; 
    const availableHeight = PAGE_HEIGHT - PdfStyle.MARGIN.TOP - CONTINUED_SECTION_START_Y - titleHeight;
    const rowsPerPage = Math.floor((availableHeight - headerCellHeight - CONSIGNMENT_SEPARATOR_OFFSET - PdfStyle.ROW.HEIGHT) / cellHeight);
    
    const allCatches = data?.catches || [];
    const remainingCatches = allCatches.slice(CONSIGNMENT_ROWS_COUNT);
    
    const sectionTitle = getSectionContinuedTitle(sectionNumber, type);

    // Only render continuation pages that have content — avoid trailing blank pages
    const numPagesNeeded = remainingCatches.length > 0
        ? Math.ceil(remainingCatches.length / rowsPerPage)
        : 0;
    const numPagesToRender = Math.min(numPagesNeeded, 2);

    for (let pageNum = 0; pageNum < numPagesToRender; pageNum++) {
        if (isSample){
            CommonUtils.addSampleWatermark(doc);
        }
        PdfUtils.endOfPage(doc, currentPage);
        doc.addPage();
        currentPage += 1;
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
        
        if (pageData.catches.length === 0 && remainingCatches.length === 0) {
            pageData.catches = [];
        }
        
        createConsignmentTable(doc, pageData, startY + titleHeight, type, rowsPerPage, false);
    }
};

const section5 = (doc, data, startY) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '5.    Consignment details (upon departure from the place of storage)');
    }));
    createConsignmentTable(doc, data, startY + CONSIGNMENT_TABLE_START_Y_OFFSET, 'departure', CONSIGNMENT_ROWS_COUNT);
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
    // weights object
    const allWeights = {
        weightField,
        netWeightField,
    }
 
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
 
 
const formatAddress = (obj) => {
    const { addressOne, townCity, postcode } = obj;
    return [
        addressOne,
        townCity,
        postcode
    ].filter(Boolean).join('\n');
};

const section7 = (doc, data, startY, dateOfSubmission) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '7.    Exporter details');
    }));
    let yPos = startY + TITLE_OFFSET;
    const cellHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_3_5;

    const myTable = doc.struct('Table');
    doc.addStructure(myTable);

    const myTableHead = doc.struct('THead');
    myTable.add(myTableHead);

    const myTableHeadRow = doc.struct('TR');
    myTableHead.add(myTableHeadRow);

    const myTableHeadOne = doc.struct('TH');
    myTableHeadRow.add(myTableHeadOne);
    const myTableHeadOneContent = doc.markStructureContent('TH');
    myTableHeadOne.add(myTableHeadOneContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + MARGIN_OFFSET, yPos, SECTION_7_COL1_WIDTH, cellHeight, 'Company name');
    myTableHeadOne.end();

    const myTableHeadTwo = doc.struct('TH');
    myTableHeadRow.add(myTableHeadTwo);
    const myTableHeadTwoContent = doc.markStructureContent('TH');
    myTableHeadTwo.add(myTableHeadTwoContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SECTION_7_COL2_X, yPos, SECTION_7_COL2_WIDTH, cellHeight, 'Address');
    myTableHeadTwo.end();

    const myTableHeadThree = doc.struct('TH');
    myTableHeadRow.add(myTableHeadThree);
    const myTableHeadThreeContent = doc.markStructureContent('TH');
    myTableHeadThree.add(myTableHeadThreeContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SECTION_7_COL3_X, yPos, SECTION_7_COL3_WIDTH, cellHeight, 'Date of submission of this\ndocument by exporter to the\ncompetent authority');
    myTableHeadThree.end();

    myTableHeadRow.end();
    myTableHead.end();

    const tableBody = doc.struct('TBody');
    myTable.add(tableBody);

    const tableBodyRow = doc.struct('TR');
    tableBody.add(tableBodyRow);

    const TdOne = doc.struct('TD');
    tableBodyRow.add(TdOne);
    const TdOneContent = doc.markStructureContent('TD');
    TdOne.add(TdOneContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + MARGIN_OFFSET, yPos + cellHeight, SECTION_7_COL1_WIDTH, PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_4, data.exporter.exporterCompanyName);
    TdOne.end();

    const TdTwo = doc.struct('TD');
    tableBodyRow.add(TdTwo);
    const TdTwoContent = doc.markStructureContent('TD');
    TdTwo.add(TdTwoContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + SECTION_7_COL2_X, yPos + cellHeight, SECTION_7_COL2_WIDTH, PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_4, formatAddress(data.exporter));
    TdTwo.end();

    const TdThree = doc.struct('TD');
    tableBodyRow.add(TdThree);
    const TdThreeContent = doc.markStructureContent('TD');
    TdThree.add(TdThreeContent);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SECTION_7_COL3_X, yPos + cellHeight, SECTION_7_COL3_WIDTH, PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_4, dateOfSubmission);
    TdThree.end();

    tableBodyRow.end();
    doc.endMarkedContent();
    tableBody.end();
    myTable.end();

    yPos += cellHeight + PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_4 + SPACING_SMALL;

    doc.addStructure(doc.struct('P', () => {
        doc.text('* Date of acceptance by exporter of the veracity of the contents of this document', PdfStyle.MARGIN.LEFT + CONSIGNMENT_PADDING_X, yPos);
    }));

    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT + SECTION_7_ADDITIONAL_SPACING);
    }));
};

const createSection4TableHeaders = (doc, myTable, yPos, cellHeight, subCellHeight) => {
    const tableHead = doc.struct('THead');
    myTable.add(tableHead);
 
    const tableHeadRow = doc.struct('TR');
    tableHead.add(tableHeadRow);
 
    const tableHeadOne = doc.struct('TH');
    tableHeadRow.add(tableHeadOne);
    const tableHeadOneContent = doc.markStructureContent('TH');
    tableHeadOne.add(tableHeadOneContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + MARGIN_OFFSET, yPos, SECTION_4_COL1_WIDTH, cellHeight, ['Name']);
    tableHeadOne.end();
 
    const tableHeadTwo = doc.struct('TH');
    tableHeadRow.add(tableHeadTwo);
    const tableHeadTwoContent = doc.markStructureContent('TH');
    tableHeadTwo.add(tableHeadTwoContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SECTION_4_COL2_X, yPos, SECTION_4_COL2_WIDTH, cellHeight, 'Address');
    tableHeadTwo.end();
 
    const tableHeadThree = doc.struct('TH');
    tableHeadRow.add(tableHeadThree);
    const tableHeadThreeContent = doc.markStructureContent('TH');
    tableHeadThree.add(tableHeadThreeContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SECTION_4_COL3_X, yPos, SECTION_4_COL3_WIDTH, cellHeight, ['Approval number', '(if applicable)']);
    tableHeadThree.end();
 
    const tableHeadFour = doc.struct('TH');
    tableHeadRow.add(tableHeadFour);
    const tableHeadFourContent = doc.markStructureContent('TH');
    tableHeadFour.add(tableHeadFourContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SECTION_4_COL4_X, yPos, SECTION_4_COL4_WIDTH, cellHeight, ['Stored as', '(tick as appropriate)']);
    tableHeadFour.end();
 
    tableHeadRow.end();
    const tableHeadSubRow = doc.struct('TR');
    tableHead.add(tableHeadSubRow);
 
    const tableHeadFourSubOne = doc.struct('TH');
    tableHeadSubRow.add(tableHeadFourSubOne);
    const tableHeadFourSubOneContent = doc.markStructureContent('TH');
    tableHeadFourSubOne.add(tableHeadFourSubOneContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SECTION_4_COL4_X, yPos + HEADER_SUBROW_OFFSET, SECTION_4_SUBROW_COL_WIDTH, subCellHeight, 'Chilled');
    tableHeadFourSubOne.end();
 
    const tableHeadFourSubTwo = doc.struct('TH');
    tableHeadSubRow.add(tableHeadFourSubTwo);
    const tableHeadFourSubTwoContent = doc.markStructureContent('TH');
    tableHeadFourSubTwo.add(tableHeadFourSubTwoContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SECTION_4_SUBROW_COL2_X, yPos + HEADER_SUBROW_OFFSET, SECTION_4_SUBROW_COL_WIDTH, subCellHeight, 'Frozen');
    tableHeadFourSubTwo.end();
 
    const tableHeadFourSubThree = doc.struct('TH');
    tableHeadSubRow.add(tableHeadFourSubThree);
    const tableHeadFourSubThreeContent = doc.markStructureContent('TH');
    tableHeadFourSubThree.add(tableHeadFourSubThreeContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SECTION_4_SUBROW_COL3_X, yPos + HEADER_SUBROW_OFFSET, SECTION_4_SUBROW_COL_WIDTH, subCellHeight, 'Other');
    tableHeadFourSubThree.end();
 
    tableHeadSubRow.end();
    tableHead.end();
};

const createSection4TableRow = (doc, tableBodyRow, yPos, dataRowHeight, data) => {
    const sfAddress = PdfUtils.constructAddress([data.facilityAddressOne,
        data.facilityAddressTwo,
        data.facilityTownCity,
        data.facilityPostcode]);
 
    const TdOne = doc.struct('TD');
    tableBodyRow.add(TdOne);
    const TdOneContent = doc.markStructureContent('TD');
    TdOne.add(TdOneContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + MARGIN_OFFSET, yPos - MARGIN_OFFSET, SECTION_4_COL1_WIDTH, dataRowHeight, data.facilityName);
    TdOne.end();
 
    const TdTwo = doc.struct('TD');
    tableBodyRow.add(TdTwo);
    const TdTwoContent = doc.markStructureContent('TD');
    TdTwo.add(TdTwoContent)
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + SECTION_4_COL2_X, yPos - MARGIN_OFFSET, SECTION_4_COL2_WIDTH, dataRowHeight, sfAddress);
    TdTwo.end();
    
    const TdThree = doc.struct('TD');
    tableBodyRow.add(TdThree);
    const TdThreeContent = doc.markStructureContent('TD');
    TdThree.add(TdThreeContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + SECTION_4_COL3_X, yPos - MARGIN_OFFSET, SECTION_4_COL3_WIDTH, dataRowHeight, data.facilityApprovalNumber);
    TdThree.end();
 
    const TdFourSubOne = doc.struct('TD');
    tableBodyRow.add(TdFourSubOne);
    const TdFourSubOneContent = doc.markStructureContent('TD');
    TdFourSubOne.add(TdFourSubOneContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + SECTION_4_COL4_X, yPos - MARGIN_OFFSET, SECTION_4_SUBROW_COL_WIDTH, dataRowHeight, data.facilityStorage === "Chilled" ? "Chilled" : "");
    TdFourSubOne.end();
 
    const TdFourSubTwo = doc.struct('TD');
    tableBodyRow.add(TdFourSubTwo);
    const TdFourSubTwoContent = doc.markStructureContent('TD');
    TdFourSubTwo.add(TdFourSubTwoContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + SECTION_4_SUBROW_COL2_X, yPos - MARGIN_OFFSET, SECTION_4_SUBROW_COL_WIDTH, dataRowHeight, data.facilityStorage === "Frozen" ? "Frozen" : "");
    TdFourSubTwo.end();
 
    const TdFourSubThree = doc.struct('TD');
    tableBodyRow.add(TdFourSubThree);
    const TdFourSubThreeContent = doc.markStructureContent('TD');
    TdFourSubThree.add(TdFourSubThreeContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + SECTION_4_SUBROW_COL3_X, yPos - MARGIN_OFFSET, SECTION_4_SUBROW_COL_WIDTH, dataRowHeight, data.facilityStorage === "Other" ? "Other" : "");
    TdFourSubThree.end();
};

const section6 = (doc, data, startY) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '6.  Departure from the place of storage - details');
    }));

    const rows = [
        { label: 'Date of departure from the place of storage (reloading)', key: 'transport.exportDate' },
        { label: 'Last port, airport or point of departure from the country of storage', key: 'transport.departurePlace' },
        { label: 'Details of transport (Vessel name and flag / flight number - airway bill / railway bill / freight bill - truck registration number)', key: TRANSPORT_VEHICLE_KEY },
        { label: 'Container number(s) (where applicable)', key: TRANSPORT_CONTAINER_NUMBERS },
        { label: 'Point of destination: Port, airport or other point of destination', key: 'transport.pointOfDestination' }
    ];

    renderTransportDetailsTable(doc, startY + TRANSPORT_DETAILS_TABLE_START_Y_OFFSET, rows, data, false);
};

const createSection8TableHeaders = (doc, myTable, yPos) => {
    const myTableHead = doc.struct('THead');
    myTable.add(myTableHead);

    const myTableHeadRow = doc.struct('TR');
    myTableHead.add(myTableHeadRow);

    const myTableHeadOne = doc.struct('TH');
    myTableHeadRow.add(myTableHeadOne);
    const myTableHeadOneContent = doc.markStructureContent('TH');
    myTableHeadOne.add(myTableHeadOneContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SECTION_8_COL1_X, yPos, SECTION_8_COL1_WIDTH, PdfStyle.ROW.HEIGHT, 'Name and Address');
    myTableHeadOne.end();

    const myTableHeadTwo = doc.struct('TH');
    myTableHeadRow.add(myTableHeadTwo);
    const myTableHeadTwoContent = doc.markStructureContent('TH');
    myTableHeadTwo.add(myTableHeadTwoContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SECTION_8_COL2_X, yPos, SECTION_8_COL2_WIDTH, PdfStyle.ROW.HEIGHT, 'Validation');
    myTableHeadTwo.end();

    const myTableHeadThree = doc.struct('TH');
    myTableHeadRow.add(myTableHeadThree);
    const myTableHeadThreeContent = doc.markStructureContent('TH');
    myTableHeadThree.add(myTableHeadThreeContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SECTION_8_COL3_X, yPos, SECTION_8_COL3_WIDTH, PdfStyle.ROW.HEIGHT, 'Date Issued');
    myTableHeadThree.end();

    myTableHeadRow.end();
    myTableHead.end();
};

const createSection8TableRow = (doc, tableBody, yPos, cellHeight, isSample, buff, startY) => {
    const tableBodyRow = doc.struct('TR');
    tableBody.add(tableBodyRow);

    const TdOne = doc.struct('TD');
    tableBodyRow.add(TdOne);
    const TdOneContent = doc.markStructureContent('TD');
    TdOne.add(TdOneContent);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SECTION_8_COL1_X, yPos, SECTION_8_COL1_WIDTH, cellHeight, ['Illegal Unreported and Unregulated (IUU) Fishing Team,',
        'Marine Management Organisation,', 'Tyneside House, Skinnerburn Rd,', 'Newcastle upon Tyne. NE4 7AR', 'United Kingdom',
        'Tel: 0300 123 1032',
        'Email: ukiuuslo@marinemanagement.org.uk']);
    TdOne.end();

    const TdTwo = doc.struct('TD');
    tableBodyRow.add(TdTwo);
    const TdTwoContent = doc.markStructureContent('TD');
    TdTwo.add(TdTwoContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SECTION_8_COL2_X, yPos, SECTION_8_COL2_WIDTH, cellHeight);
    TdTwo.end();

    if (!isSample) {
        PdfUtils.qrCode(doc, buff, PdfStyle.MARGIN.LEFT + SECTION_8_QR_CODE_X, startY + SECTION_8_QR_CODE_Y_OFFSET);
    }

    const TdThree = doc.struct('TD');
    tableBodyRow.add(TdThree);
    const TdThreeContent = doc.markStructureContent('TD');
    TdThree.add(TdThreeContent);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SECTION_8_COL3_X, yPos, SECTION_8_COL3_WIDTH, cellHeight, PdfUtils.todaysDate())
    TdThree.end();

    tableBodyRow.end();
};

const section8 = (doc, isSample, buff, startY) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '8    Declaration by the competent authority');
    }));
    let yPos = startY + SECTION_8_Y_OFFSET;
    const cellHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_5 + SECTION_8_CELL_HEIGHT_PADDING;

    const infoText = 'I hereby declare that the information provided in this document is correct and that the products concerned did not undergo operations other than unloading, reloading or any operation designed to preserve them in good and genuine condition, and remained under the surveillance of the declaring authority.';
    doc.addStructure(doc.struct('P', () => {
        doc.font(PdfStyle.FONT.REGULAR).fontSize(PdfStyle.FONT_SIZE.SMALL);
        doc.text(infoText, PdfStyle.MARGIN.LEFT, startY + SECTION_8_INFO_TEXT_Y_OFFSET, { width: SECTION_8_INFO_TEXT_WIDTH });
    }));

    const myTable = doc.struct('Table');
    doc.addStructure(myTable);

    createSection8TableHeaders(doc, myTable, yPos);

    yPos += PdfStyle.ROW.HEIGHT;

    const tableBody = doc.struct('TBody');
    myTable.add(tableBody);

    createSection8TableRow(doc, tableBody, yPos, cellHeight, isSample, buff, startY);

    doc.endMarkedContent();
    tableBody.end();
    myTable.end();

    yPos += cellHeight + SEPARATOR_SPACING;
    doc.addStructure(doc.struct('P', () => {
        doc.font(PdfStyle.FONT.REGULAR);
        doc.fontSize(PdfStyle.FONT_SIZE.SMALL);
        doc.text('Validated by the appropriate competent authority (MMO, Scottish Ministers, Welsh Ministers, Department of Agriculture, Environment and Rural Affairs for Northern Ireland, Marine Resources, Growth and Housing and Environment for Jersey, Sea Fisheries, Committee for Economic Development for Guernsey and Department Environment, Food and Agriculture for the Isle of Man) in accordance with article 15 of Council Regulation (EU) 1005/2008 (as retained under s.3(1) European Union (Withdrawal) Act 2018)', PdfStyle.MARGIN.LEFT + SECTION_8_FOOTER_TEXT_X, yPos);
    }));
}

const section4 = (doc, data, startY) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '4.    Storage facility details');
    }));
    let yPos = startY + TITLE_OFFSET;
    const cellHeight = PdfStyle.ROW.HEIGHT * SECTION_4_HEADER_MULTIPLIER;
    const dataRowHeight = PdfStyle.ROW.HEIGHT * SECTION_4_DATA_MULTIPLIER;
    const subCellHeight = PdfStyle.ROW.HEIGHT;
 
    const myTable = doc.struct('Table');
    doc.addStructure(myTable);
 
    createSection4TableHeaders(doc, myTable, yPos, cellHeight, subCellHeight);
 
    const tableBody = doc.struct('TBody');
    myTable.add(tableBody);
 
    const tableBodyRow = doc.struct('TR');
    tableBody.add(tableBodyRow);
 
    yPos += cellHeight;

    createSection4TableRow(doc, tableBodyRow, yPos, dataRowHeight, data);
 
    tableBodyRow.end();
    doc.endMarkedContent();
    tableBody.end();
    myTable.end();
 
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.separator(doc, yPos + dataRowHeight + SEPARATOR_OFFSET_AFTER_CELL);
    }));
}

const getNestedValue = (obj, path) => {  
    const result = path
        .split('.')
        .reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : ''), obj);
    
    return Array.isArray(result) ? result.join(', ') : result;
};
 
const isVehicleTransportKey = (key) => 
    key === ARRIVAL_TRANSPORT_VEHICLE_KEY || key === TRANSPORT_VEHICLE_KEY;

const isContainerNumberKey = (key) =>
    key === ARRIVAL_TRANSPORT_CONTAINER_NUMBERS || key === TRANSPORT_CONTAINER_NUMBERS;

const isPointOfDestinationKey = (key) =>
    key === 'transport.pointOfDestination' || key === 'arrivalTransport.pointOfDestination';

const shouldUseExpandedHeight = (key) =>
    isVehicleTransportKey(key) || isContainerNumberKey(key) || isPointOfDestinationKey(key);

const getTransportType = (transport) => 
    (transport.vehicle || '').toLowerCase();

const formatVesselTransport = (transport) => `Vessel: ${transport.vesselName || ''} - ${transport.flagState || ''}`;
const formatTruckTransport = (transport) => `Truck: ${transport.registrationNumber || ''} - ${transport.freightBillNumber || ''}`;
const formatTrainTransport = (transport) => `Train: ${transport.railwayBillNumber || ''} - ${transport.freightBillNumber || ''}`;
const formatPlaneTransport = (transport) => `Plane: ${transport.flightNumber || ''} - ${transport.airwayBillNumber || ''} - ${transport.freightBillNumber || ''}`;

const TRANSPORT_TYPE_FORMATTERS = {
    'containervessel': formatVesselTransport,
    'truck': formatTruckTransport,
    'train': formatTrainTransport,
    'plane': formatPlaneTransport
};

const getContainerNumbers = (transport) => {
    // Prefer new 'containerNumber' field, fall back to legacy 'containerNumbers'
    // This ensures migration from containerNumbers to containerNumber works correctly
    const containerNum = transport.containerNumber || transport.containerNumbers;
    
    if (!containerNum) {
        return '';
    }
    
    // If it's an array, join with ', '; if it's a string, return as-is
    return Array.isArray(containerNum) ? containerNum.join(', ') : containerNum;
};

const formatTransportValue = (rowKey, data, isArrival = true) => {
    const transport = isArrival ? (data.arrivalTransport || {}) : (data.transport || {});
    
    if (!isVehicleTransportKey(rowKey)) {
        // Special handling for container numbers with backward compatibility
        if (isContainerNumberKey(rowKey)) {
            return getContainerNumbers(transport);
        }
        return getNestedValue(data, rowKey);
    }

    const type = getTransportType(transport);
    const formatter = TRANSPORT_TYPE_FORMATTERS[type];
    return formatter ? formatter(transport) : '';
};

const renderTransportDetailsTable = (doc, startY, rows, data, isArrival) => {
    let yPos = startY;
    const col1Width = TRANSPORT_DETAILS_COL1_WIDTH;
    const col2Width = TRANSPORT_DETAILS_COL2_WIDTH;

    const myTable = doc.struct('Table');
    doc.addStructure(myTable);

    const tableBody = doc.struct('TBody');
    myTable.add(tableBody);

    rows.forEach(row => {
        const heightMultiplier = isArrival ? ROW_HEIGHT_MULTIPLIER_6 : ROW_HEIGHT_MULTIPLIER_3_5;
        const height = shouldUseExpandedHeight(row.key) ? PdfStyle.ROW.HEIGHT * heightMultiplier : PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_2;
        const value = formatTransportValue(row.key, data, isArrival);

        const tableRow = doc.struct('TR');
        tableBody.add(tableRow);

        const headerCell = doc.struct('TH');
        tableRow.add(headerCell);
        const headerCellContent = doc.markStructureContent('TH');
        headerCell.add(headerCellContent);
        PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT + MARGIN_OFFSET, yPos, col1Width, height + TRANSPORT_DETAILS_ROW_PADDING, row.label);
        headerCell.end();

        const dataCell = doc.struct('TD');
        tableRow.add(dataCell);
        const dataCellContent = doc.markStructureContent('TD');
        dataCell.add(dataCellContent);
        
        if (shouldUseExpandedHeight(row.key)) {
            PdfUtils.wrappedFieldNoEllipsis(doc, PdfStyle.MARGIN.LEFT + TRANSPORT_DETAILS_COL2_X, yPos, col2Width, height + TRANSPORT_DETAILS_ROW_PADDING, value);
        } else {
            PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + TRANSPORT_DETAILS_COL2_X, yPos, col2Width, height + TRANSPORT_DETAILS_ROW_PADDING, value);
        }
        dataCell.end();

        tableRow.end();

        yPos += height + TRANSPORT_DETAILS_ROW_PADDING;
    });

    doc.endMarkedContent();
    tableBody.end();
    myTable.end();

    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.separator(doc, yPos + SEPARATOR_SPACING);
    }));
};
 
const section2 = (doc, data, startY) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '2.  Arrival to the place of storage - details');
    }));
    
    const rows = [
        { label: 'Place of departure of the product', key: 'arrivalTransport.departureCountry' },
        { label: 'Date of departure:', key: 'arrivalTransport.departureDate' },
        { label: 'Last port, airport or other point of departure before arrival to the country of storage', key: 'arrivalTransport.departurePort' },
        { label: 'Details of transport (Vessel name and flag / flight number - airway bill / railway bill / freight bill - truck registration number)', key: ARRIVAL_TRANSPORT_VEHICLE_KEY },
        { label: 'Container number(s) (where applicable)', key: ARRIVAL_TRANSPORT_CONTAINER_NUMBERS },
        { label: 'Date of arrival to the place of storage (unloading)', key: 'facilityArrivalDate' },
        { label: 'Place of storage', key: 'arrivalTransport.placeOfUnloading' }
    ];
    
    renderTransportDetailsTable(doc, startY + TRANSPORT_DETAILS_TABLE_START_Y_OFFSET, rows, data, true);
}
 
const section1 = (doc, data, isSample, startY) => {
    let documentNumber = '';
    if (isSample) {
        documentNumber = '###-####-##-#########';
    } else {
        documentNumber = data.documentNumber;
    }
 
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        doc.lineWidth(SECTION_1_LINE_WIDTH_THICK);
        doc.moveTo(PdfStyle.MARGIN.LEFT, startY + SECTION_1_TOP_LINE_OFFSET).lineTo(SECTION_1_SPACING, startY + SECTION_1_TOP_LINE_OFFSET).stroke();
    }));
 
    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT, startY + SECTION_1_LABEL_OFFSET, 'Document Number');
    }));
    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SECTION_1_FIELD_OFFSET_X, startY + SECTION_1_FIELD_OFFSET_Y, SECTION_1_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, documentNumber);
    }));

    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.label(doc, SECTION_1_DECLARING_AUTHORITY_X, startY + SECTION_1_LABEL_OFFSET, 'Declaring Authority');
    }));
    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SECTION_4_COL4_X, startY + SECTION_1_DECLARING_AUTHORITY_Y, SECTION_1_DECLARING_AUTHORITY_WIDTH, PdfStyle.ROW.HEIGHT, 'Marine Management Organisation');
    }));    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + SECTION_1_NAME_Y, '1.    Name');
    }));
    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SECTION_1_NAME_FIELD_X, startY + SECTION_1_NAME_FIELD_Y, SECTION_1_NAME_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, 'Illegal Unreported and Unregulated (IUU) Fishing Team');
    }));

    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + SECTION_1_ADDRESS_LABEL_X, startY + SECTION_1_ADDRESS_LABEL_Y, 'Address');
    }));
    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SECTION_1_ADDRESS_FIELD_X, startY + SECTION_1_ADDRESS_FIELD_Y, SECTION_1_ADDRESS_FIELD_WIDTH, PdfStyle.ROW.HEIGHT * SECTION_1_ADDRESS_FIELD_HEIGHT_MULTIPLIER + SPACING_SMALL, 'Tyneside House, Skinnerburn Rd, Newcastle upon Tyne, United Kingdom. NE4 7AR');
    }));
 
    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + SECTION_1_ADDRESS_FIELD_X, startY + SECTION_1_TEL_LABEL_Y, 'Tel.');
    }));
    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SECTION_1_TEL_FIELD_X, startY + SECTION_1_TEL_FIELD_Y, SECTION_1_TEL_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, '0300 123 1032');
    }));

    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + SECTION_1_EMAIL_LABEL_X, startY + SECTION_1_EMAIL_LABEL_Y, 'Email');
    }));
    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SECTION_1_EMAIL_FIELD_X, startY + SECTION_1_EMAIL_FIELD_Y, SECTION_1_EMAIL_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, 'ukiuuslo@marinemanagement.org.uk');
    }));    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        doc.lineWidth(SECTION_1_LINE_WIDTH_THIN);
        doc.moveTo(0, startY + SECTION_1_BOTTOM_LINE_Y).lineTo(SECTION_1_BOTTOM_LINE_X_END, startY + SECTION_1_BOTTOM_LINE_Y).dash(SECTION_1_LINE_DASH_SIZE, {space: SECTION_1_LINE_SPACE}).stroke();
    }));
};
 
module.exports = renderStorageNote;
module.exports.getSectionContinuedTitle = getSectionContinuedTitle;
