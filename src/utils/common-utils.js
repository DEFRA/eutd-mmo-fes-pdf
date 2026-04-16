const PDFDocument = require('pdfkit');
const PdfStyle = require('../pdf/mmoPdfStyles');
const PdfUtils = require('../pdf/mmoPdfUtils');
const path = require('node:path');
const SEPARATOR_LINE_X2 = 560;
const SEPARATOR_LINE_Y_OFFSET = 70;
module.exports = {
  createBaseDocument:(uri, documentTitle) => {
    return new PDFDocument({
      layout: 'portrait',
      size: 'A4',
      lang: 'en-GB',
      margins: {
          top: PdfStyle.MARGIN.TOP,
          bottom: PdfStyle.MARGIN.BOT,
          left: PdfStyle.MARGIN.LEFT,
          right: PdfStyle.MARGIN.RIGHT,
      },
      pdfVersion: "1.5",
      tagged: true,
      displayTitle: true,
      info: {
          Title: documentTitle || path.basename(uri).split`.`[0]
      }
    });
  },
  addSampleWatermark: (doc, leftMarginOffset = 10, rightMargin = 120) => {
    const sampleWatermarkImageFile = path.join(__dirname, '../resources/sample-watermark.png');
    doc.addStructure(doc.struct('Figure', {
      alt: 'Sample'
    }, () => {
      doc.image(sampleWatermarkImageFile, PdfStyle.MARGIN.LEFT + leftMarginOffset, rightMargin, {scale: 1});
    }));
  },
  startScheduledPage: (doc, startY, headingText) => {
    doc.addPage({
        size: 'A4',
        margins: {
            top: PdfStyle.MARGIN.TOP,
            bottom: PdfStyle.MARGIN.BOT,
            left: PdfStyle.MARGIN.LEFT,
            right: PdfStyle.MARGIN.RIGHT,
        },
        layout: 'portrait'
    });
    PdfUtils.heading(doc, headingText);
  
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
      doc.lineWidth(2);
      doc.moveTo(PdfStyle.MARGIN.LEFT, startY + SEPARATOR_LINE_Y_OFFSET).lineTo(SEPARATOR_LINE_X2, startY + SEPARATOR_LINE_Y_OFFSET).stroke();
    }));
  }
}
