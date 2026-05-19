const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const CommonUtils = require('../utils/common-utils');

const { section1 } = require('./renderProcessingStatement-section1');
const { section2, section3, section4, section5, statement } = require('./renderProcessingStatement-sections2-5');
const { endSchedulePage } = require('./renderProcessingStatement-schedule');
const { startNewPage } = require('./renderProcessingStatement-product-table');

// Page layout constants
const PAGE_HEIGHT = 780;
const PAGINATION_RESERVED_SPACE = 50;
const NEW_PAGE_START_Y_OFFSET = 25;
const SECTION_SPACING = 5;

// Y offset constants
const SECTION_HEADER_Y_OFFSET = 12;
const STATEMENT_HEADER_Y_START = 55;
const SECTION1_Y_START = 95;

// Separator and spacing constants
const SEPARATOR_SPACING = 5;
const SEPARATOR_HEIGHT = 3;

// Row height multipliers
const ROW_HEIGHT_MULTIPLIER_2 = 2;
const ROW_HEIGHT_MULTIPLIER_3 = 3;
const ROW_HEIGHT_MULTIPLIER_5 = 5;
const ROW_HEIGHT_MULTIPLIER_6 = 6;

// Row height adjustments
const ROW_HEIGHT_ADJUSTMENT_5 = 5;
const ROW_HEIGHT_ADJUSTMENT_9 = 9;

// Endorsement section constants
const ENDORSEMENT_FOOTER_SPACING = 2;
const ENDORSEMENT_FOOTER_HEIGHT = 60;

const estimateSection2Height = () => {
    const headerHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_2 - ROW_HEIGHT_ADJUSTMENT_5;
    const bodyHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_6 - ROW_HEIGHT_ADJUSTMENT_9;
    const footerTextHeight = PdfStyle.ROW.HEIGHT;
    const separatorHeight = SEPARATOR_SPACING;

    return SECTION_HEADER_Y_OFFSET + headerHeight + bodyHeight + ROW_HEIGHT_ADJUSTMENT_5 + footerTextHeight + separatorHeight;
};

const estimateSection3Height = () => {
    const tableHeight = PdfStyle.ROW.HEIGHT;
    const separatorHeight = SEPARATOR_SPACING;

    return SECTION_HEADER_Y_OFFSET + tableHeight + separatorHeight;
};

const estimateSection4Height = () => {
    const headerHeight = PdfStyle.ROW.HEIGHT;
    const bodyHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_2;
    const separatorHeight = SEPARATOR_SPACING;

    return SECTION_HEADER_Y_OFFSET + headerHeight + bodyHeight + separatorHeight;
};

const estimateSection5Height = () => {
    const headerHeight = PdfStyle.ROW.HEIGHT;
    const bodyHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_5;
    const footerTextHeight = ENDORSEMENT_FOOTER_HEIGHT;

    return SECTION_HEADER_Y_OFFSET + headerHeight + bodyHeight + ENDORSEMENT_FOOTER_SPACING + footerTextHeight;
};

const checkPageBreak = (currentY, sectionHeight, usablePageHeight, doc, isSample, currentPage) => {
    if (currentY + sectionHeight > usablePageHeight) {
        const newPage = startNewPage(doc, isSample, currentPage);
        return { needsBreak: true, page: newPage, y: PdfStyle.MARGIN.TOP + NEW_PAGE_START_Y_OFFSET };
    }
    return { needsBreak: false, page: currentPage, y: currentY };
};

const renderProcessingStatement = async (data, isSample, uri, stream) => {
    let buff = null;
    if (!isSample) {
        buff = await PdfUtils.generateQRCode(uri);
    }
    const doc = CommonUtils.createBaseDocument(uri);
    doc.pipe(stream);

    PdfUtils.heading(doc, 'PROCESSING STATEMENT');

    let currentPage = 1;
    const usablePageHeight = PAGE_HEIGHT - PAGINATION_RESERVED_SPACE;

    statement(doc, data, isSample, PdfStyle.MARGIN.TOP + STATEMENT_HEADER_Y_START);

    let currentY = PdfStyle.MARGIN.TOP + SECTION1_Y_START;
    const section1Result = section1(doc, data, currentY, isSample, currentPage);
    const section1EndY = section1Result.yPos;
    currentPage = section1Result.page;

    // Section 2
    currentY = section1EndY + SECTION_SPACING;
    let breakResult = checkPageBreak(currentY, estimateSection2Height(), usablePageHeight, doc, isSample, currentPage);
    currentY = breakResult.y;
    currentPage = breakResult.page;
    const section2EndY = section2(doc, data, currentY);

    // Section 3
    currentY = section2EndY + SECTION_SPACING;
    breakResult = checkPageBreak(currentY, estimateSection3Height(), usablePageHeight, doc, isSample, currentPage);
    currentY = breakResult.y;
    currentPage = breakResult.page;
    const section3EndY = section3(doc, data, currentY);

    // Section 4
    currentY = section3EndY + SECTION_SPACING;
    breakResult = checkPageBreak(currentY, estimateSection4Height(), usablePageHeight, doc, isSample, currentPage);
    currentY = breakResult.y;
    currentPage = breakResult.page;
    const section4EndY = section4(doc, data, currentY);

    // Section 5 (Endorsement)
    currentY = section4EndY + SECTION_SPACING;
    breakResult = checkPageBreak(currentY, estimateSection5Height(), usablePageHeight, doc, isSample, currentPage);
    currentY = breakResult.y;
    currentPage = breakResult.page;

    section5(doc, isSample, buff, currentY);

    if (isSample) {
        CommonUtils.addSampleWatermark(doc);
    }
    PdfUtils.endOfPage(doc, currentPage);

    endSchedulePage(doc, data, isSample);

    doc.end();
};

module.exports = renderProcessingStatement;
