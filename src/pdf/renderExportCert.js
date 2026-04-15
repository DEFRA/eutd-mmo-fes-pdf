const PdfUtils = require('./mmoPdfUtils');
const CommonUtils = require('../utils/common-utils');
const {
    addMainCertificatePages,
    processBlankTemplate,
    processMultiData,
} = require('./renderExportCert-helpers');

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
    addMainCertificatePages(doc, data, isSample, buff);

    const isDictionaryTabs = !doc.page.dictionary.Tabs;

    if (data.isBlankTemplate) {
        processBlankTemplate(data, doc, isDictionaryTabs, isSample, buff);
    } else {
        processMultiData(data, doc, isDictionaryTabs, isSample, buff);
    }

    doc.end();
};

module.exports = renderExportCert;
