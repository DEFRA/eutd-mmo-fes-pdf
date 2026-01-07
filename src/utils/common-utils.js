const PDFDocument = require('pdfkit');
const PdfStyle = require('../pdf/mmoPdfStyles');
const PdfUtils = require('../pdf/mmoPdfUtils');
const path = require('path');

module.exports = {
  createBaseDocument:(uri) => {
    return new PDFDocument({
      layout: 'portrait',
      size: 'A4',
      lang: 'en_GB',
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
          Title: path.basename(uri).split`.`[0]
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
      doc.moveTo(PdfStyle.MARGIN.LEFT, startY + 70).lineTo(560, startY + 70).stroke();
    }));
  }
}
