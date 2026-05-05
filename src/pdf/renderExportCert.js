const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const CommonUtils = require('../utils/common-utils');

const { isMultiVessel, getVesselCount, getProductScheduleRows } = require('./renderExportCert-data');
const {
    calculateRowHeight,
    calculateMaxRowHeightForLicenceHolder,
    calculatePageDimensions,
    paginateRows,
    renderMultiVesselPages,
    renderMultiVesselScheduleHeader,
    multiVesselScheduleHeading,
    multiVesselScheduleHeadingDynamic,
    formatCatchAreaData,
    calculateRequiredCellHeight,
    calculateRequiredCellHeightStatic,
} = require('./renderExportCert-schedule');
const {
    appendixHeading,
    appendixTransportDetails,
    appendixExporterAndImportDetails,
    getVehicleType,
    getTransportModes,
    getVcDetails,
    getDeparturePlace,
    getFlightDetails,
    getTruckDetails,
    getRailwayBillNumber,
    getContainerIdentificationNumber,
    getFreightBillNumber,
    getOtherTransportDocuments,
} = require('./renderExportCert-transport');
const { reExportCertificateHeader, section14, section15, section16, section17 } = require('./renderExportCert-re-export');
const { section1, section2, section3 } = require('./renderExportCert-sections-1-3');
const { section4, section5, section6, section7, section8, section9, section10 } = require('./renderExportCert-sections-4-10');
const { section11, section12, section13 } = require('./renderExportCert-sections-11-13');

const SECTION14_Y_OFFSET = 70;
const SECTION15_Y_OFFSET = 280;
const SECTION16_Y_OFFSET = 400;
const SECTION17_Y_OFFSET = 530;
const APPENDIX_TRANSPORT_Y_OFFSET = 40;

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
    if (isMultiVessel(data.exportPayload)) {
        const rows = getProductScheduleRows(data.exportPayload);
        const availableHeight = calculatePageDimensions();
        const pages = paginateRows(rows, availableHeight);

        renderMultiVesselPages(doc, data, pages, rows, isDictionaryTabs, isSample, buff);
    }
}

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
