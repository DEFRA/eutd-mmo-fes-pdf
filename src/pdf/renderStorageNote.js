const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const CommonUtils = require('../utils/common-utils');
const {
    PAGE_HEIGHT,
    GAP,
    SECTION_4_SEPARATOR_GAP,
    SECTION_1_BOTTOM_LINE_Y,
    MAIN_HEADER_Y_OFFSET,
    NEW_PAGE_START_Y_OFFSET,
    SECTION_6_TO_7_SPACING,
    SECTION_ADDITIONAL_SPACING,
    SECTION_8_CELL_HEIGHT_PADDING,
    SECTION_8_FOOTER_HEIGHT,
    SEPARATOR_SPACING,
    TITLE_OFFSET,
    SPACING_SMALL,
    SPACING_MEDIUM,
    SPACING_LARGE,
    CONSIGNMENT_HEADER_MULTIPLIER,
    CONSIGNMENT_CELL_MULTIPLIER,
    CONSIGNMENT_ROWS_COUNT,
    CONSIGNMENT_SEPARATOR_OFFSET,
    SECTION_4_HEADER_ROW_MULTIPLIER,
    SECTION_4_DATA_ROW_MULTIPLIER,
    ROW_HEIGHT_MULTIPLIER_2,
    ROW_HEIGHT_MULTIPLIER_3_5,
    ROW_HEIGHT_MULTIPLIER_4,
    ROW_HEIGHT_MULTIPLIER_5,
    ROW_HEIGHT_MULTIPLIER_6,
    SECTION_2_FIELD_SPACING,
    ARRIVAL_TRANSPORT_VEHICLE_KEY,
    ARRIVAL_TRANSPORT_CONTAINER_NUMBERS,
    TRANSPORT_VEHICLE_KEY,
    TRANSPORT_CONTAINER_NUMBERS,
} = require('./renderStorageNote-constants');
const { getSectionContinuedTitle, section3, section5, sectionContinued } = require('./renderStorageNote-consignment');
const { shouldUseExpandedHeight, section2, section6 } = require('./renderStorageNote-transport');
const { section1, section4, section7, section8 } = require('./renderStorageNote-sections');







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

    const documentTitle = data.documentNumber
        ? `Non-Manipulation Document - ${data.documentNumber}`
        : 'Non-Manipulation Document';
    const doc = CommonUtils.createBaseDocument(uri, documentTitle);
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
    startY = startY + section6Height + GAP + SECTION_6_TO_7_SPACING;

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
    const pageRef = { value: currentPage };
    sectionContinued(doc, data, isSample, '3', 'arrival', pageRef);
    // Section 5 Continued
    sectionContinued(doc, data, isSample, '5', 'departure', pageRef);
    currentPage = pageRef.value;

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
 





 







 
 



















 
module.exports = renderStorageNote;
module.exports.getSectionContinuedTitle = getSectionContinuedTitle;
