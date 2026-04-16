const path = require('node:path');
const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const muhammara = require('muhammara');
const PDFStreamForNodeJsStream = require('./PDFStreamForNodeJsStream');

// QR Code rendering constants
const QR_CODE_SCALE = 0.235;
const QR_CODE_X_POSITION = 320;
const QR_CODE_Y_POSITION = 100;
const QR_TEXT_X_OFFSET = 65;
const QR_TEXT_FIRST_LINE_Y_OFFSET = 38;
const QR_TEXT_SECOND_LINE_Y_OFFSET = 24;
const QR_TEXT_THIRD_LINE_Y_OFFSET = 10;
const QR_TEXT_FONT_SIZE = 11;
const QR_TEXT_COLOR = 0x00;
const QR_TEXT_FONT_PATH = 'fonts/arial.ttf';

// Document number constants
const DOC_NUMBER_X_POSITION = 130;
const DOC_NUMBER_Y_POSITION = 716;
const DOC_NUMBER_FONT_SIZE = 10;

// Watermark constants
const WATERMARK_X_POSITION = 30;
const WATERMARK_Y_POSITION = 100;

// Page index constants
const FIRST_PAGE_INDEX = 0;
const SECOND_PAGE_INDEX = 1;
const FIRST_WATERMARK_PAGE_INDEX = 2;
const SECOND_WATERMARK_PAGE_INDEX = 3;
const THIRD_WATERMARK_PAGE_INDEX = 4;

// Template file constants
const STORAGE_DOC_TEMPLATE_FILE = 'storage-doc-blank.pdf';
const SAMPLE_WATERMARK_FILE = 'sample-watermark.png';
const QR_TEXT_FONT_FILE = 'fonts/arial.ttf';

const renderBlankStorageDoc = async (data, isSample, uri, stream, pathToTemplate) => {
    const inStream = new muhammara.PDFRStreamForFile(pathToTemplate + STORAGE_DOC_TEMPLATE_FILE);
    const pdfStream = new PDFStreamForNodeJsStream(stream);
    const pdfWriter = muhammara.createWriterToModify(inStream, pdfStream);
    let watermarkStreamImageXObject, imageXObject;
    if (isSample) {
        const sampleWatermarkStream = new muhammara.PDFRStreamForFile(pathToTemplate + SAMPLE_WATERMARK_FILE);
        watermarkStreamImageXObject = pdfWriter.createFormXObjectFromPNG(sampleWatermarkStream);
    } else {
        const qrCodeBuffer = await PdfUtils.generateQRCode(uri);
        const PdfImgStream = new muhammara.PDFRStreamForBuffer(qrCodeBuffer);
        imageXObject = pdfWriter.createFormXObjectFromPNG(PdfImgStream);
    }
    renderFirstPage(pdfWriter, pathToTemplate, data, isSample, watermarkStreamImageXObject);
    renderSecondPage(pdfWriter, pathToTemplate, isSample, watermarkStreamImageXObject, imageXObject);
    renderAdditionalPages(pdfWriter, watermarkStreamImageXObject, isSample);

    pdfWriter.end();
    stream.end();
};

const renderFirstPage = (pdfWriter, pathToTemplate, data, isSample, watermarkStreamImageXObject) => {
    const pageModifier = new muhammara.PDFPageModifier(pdfWriter, FIRST_PAGE_INDEX);
    const ctx = pageModifier.startContext().getContext();
    let docNumber = data.documentNumber;

    if (isSample) {
        docNumber = '###-####-##-#########';
        renderSampleWatermark(pdfWriter, ctx, watermarkStreamImageXObject, WATERMARK_X_POSITION, WATERMARK_Y_POSITION);
    }
    ctx.writeText(
        docNumber,
        DOC_NUMBER_X_POSITION, DOC_NUMBER_Y_POSITION,
        {font:pdfWriter.getFontForFile(pathToTemplate + QR_TEXT_FONT_PATH),size:DOC_NUMBER_FONT_SIZE,colorspace:'gray',color:QR_TEXT_COLOR}
    );

    pageModifier.endContext().writePage();
};

const renderSecondPage = (pdfWriter, pathToTemplate, isSample, watermarkStreamImageXObject, imageXObject) => {
    const pageModifier = new muhammara.PDFPageModifier(pdfWriter, SECOND_PAGE_INDEX);
    const ctx = pageModifier.startContext().getContext();

    if (isSample) {
        renderSampleWatermark(pdfWriter, ctx, watermarkStreamImageXObject, WATERMARK_X_POSITION, WATERMARK_Y_POSITION);
    } else {
        renderQrCode(pathToTemplate, pdfWriter, ctx, imageXObject, QR_CODE_X_POSITION, QR_CODE_Y_POSITION);
    }

    pageModifier.endContext().writePage();
};

const renderQrCode = (pathToTemplate, pdfWriter, ctx, imageXObject, x, y) => {
    ctx.q()
        .cm(1,0,0,1,x,y)
        .cm(QR_CODE_SCALE,0,0,QR_CODE_SCALE,0,0)
        .doXObject(imageXObject)
        .Q();

    ctx.writeText(
        'Use the QR code',
        x + QR_TEXT_X_OFFSET, y + QR_TEXT_FIRST_LINE_Y_OFFSET,
        {font:pdfWriter.getFontForFile(pathToTemplate + QR_TEXT_FONT_FILE),size:QR_TEXT_FONT_SIZE,colorspace:'gray',color:QR_TEXT_COLOR}
    );
    ctx.writeText(
        'to check that this',
        x + QR_TEXT_X_OFFSET, y + QR_TEXT_SECOND_LINE_Y_OFFSET,
        {font:pdfWriter.getFontForFile(pathToTemplate + QR_TEXT_FONT_FILE),size:QR_TEXT_FONT_SIZE,colorspace:'gray',color:QR_TEXT_COLOR}
    );
    ctx.writeText(
        'certificate is valid',
        x + QR_TEXT_X_OFFSET, y + QR_TEXT_THIRD_LINE_Y_OFFSET,
        {font:pdfWriter.getFontForFile(pathToTemplate + QR_TEXT_FONT_FILE),size:QR_TEXT_FONT_SIZE,colorspace:'gray',color:QR_TEXT_COLOR}
    );
}

const renderSampleWatermark = (_pdfWriter, ctx, imageXObject, x, y) => {
    ctx.q()
        .cm(1,0,0,1,x,y)
        //.cm(0.235,0,0,0.235,0,0)
        .doXObject(imageXObject)
        .Q();
}

const renderAdditionalPages = (pdfWriter, watermarkStreamImageXObject, isSample) => {
    if (isSample) {
        renderWatermarkPage(pdfWriter, watermarkStreamImageXObject, FIRST_WATERMARK_PAGE_INDEX);
        renderWatermarkPage(pdfWriter, watermarkStreamImageXObject, SECOND_WATERMARK_PAGE_INDEX);
        renderWatermarkPage(pdfWriter, watermarkStreamImageXObject, THIRD_WATERMARK_PAGE_INDEX);
    }
};

const renderWatermarkPage = (pdfWriter, watermarkStreamImageXObject, pageIndex) => {
    const pageModifier = new muhammara.PDFPageModifier(pdfWriter, pageIndex);
    const ctx = pageModifier.startContext().getContext();
    renderSampleWatermark(pdfWriter, ctx, watermarkStreamImageXObject, WATERMARK_X_POSITION, WATERMARK_Y_POSITION);
    pageModifier.endContext().writePage();
};

module.exports = renderBlankStorageDoc;