const path = require('node:path');
const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const moment = require ('moment');
const muhammara = require('muhammara');
const PDFStreamForNodeJsStream = require('./PDFStreamForNodeJsStream');
const PDFStreamForImageBuffer = require('./PDFStreamForImageBuffer');

const QR_CODE_X_POSITION_PAGE_6 = 50;
const QR_CODE_Y_POSITION_PAGE_6 = 328;
const PAGE_MODIFIER_INDEX_SCHEDULE_3 = 9;
const SCHEDULE_DOC_NUMBER_X = 128;
const SCHEDULE_DOC_NUMBER_Y = 454;
const SCHEDULE_QR_CODE_X = 617;
const SCHEDULE_QR_CODE_Y = 405;
const PAGE_MODIFIER_INDEX_PAGE_3 = 3;
const PAGE_MODIFIER_INDEX_PAGE_6 = 6;
const PAGE_MODIFIER_INDEX_SCHEDULE_1 = 7;
const PAGE_MODIFIER_INDEX_SCHEDULE_2 = 8;
const DOC_NUMBER_X = 130;
const DOC_NUMBER_Y = 712;
const WATERMARK_PAGES_X = 30;
const WATERMARK_PAGES_Y = 100;
const WATERMARK_SCHEDULE_X = 130;
const WATERMARK_SCHEDULE_Y = 0;
const QR_CODE_PAGE_1_X = 350;
const QR_CODE_PAGE_1_Y = 130;
const QR_CODE_SCALE = 0.235;
const QR_TEXT_X_OFFSET = 95;
const QR_TEXT_LINE_1_Y_OFFSET = 40;
const QR_TEXT_LINE_2_Y_OFFSET = 26;
const QR_TEXT_LINE_3_Y_OFFSET = 12;
const QR_TEXT_SIZE = 11;
const DOC_NUMBER_SIZE = 10;
const ARIAL_FONT = 'fonts/arial.ttf';

const renderBlankExportCert = async (data, isSample, uri, stream, pathToTemplate) => {
    const inStream = new muhammara.PDFRStreamForFile(pathToTemplate + 'export-cert-blank.pdf'); // './src/resources/export-cert-blank.pdf'
    const pdfStream = new PDFStreamForNodeJsStream(stream);
    const pdfWriter = muhammara.createWriterToModify(inStream, pdfStream);
    let watermarkStreamImageXObject, imageXObject;
    if (isSample) {
        const sampleWatermarkStream = new muhammara.PDFRStreamForFile(pathToTemplate + 'sample-watermark.png'); // './src/resources/export-cert-blank.pdf'
        watermarkStreamImageXObject = pdfWriter.createFormXObjectFromPNG(sampleWatermarkStream);
    } else {
        const qrCodeBuffer = await PdfUtils.generateQRCode(uri);
        const PdfImgStream =  new muhammara.PDFRStreamForBuffer(qrCodeBuffer);
        imageXObject = pdfWriter.createFormXObjectFromPNG(PdfImgStream);
    }

    let pageModifier = new muhammara.PDFPageModifier(pdfWriter,0);
    let ctx = pageModifier.startContext().getContext();

    let docNumber = data.documentNumber;
    if (isSample) {
        docNumber = '###-####-##-#########';
        renderSampleWatermark(pdfWriter, ctx, watermarkStreamImageXObject, WATERMARK_PAGES_X, WATERMARK_PAGES_Y);
    }
    ctx.writeText(
        docNumber,
        DOC_NUMBER_X, DOC_NUMBER_Y,
        {font:pdfWriter.getFontForFile(pathToTemplate + ARIAL_FONT),size:DOC_NUMBER_SIZE,colorspace:'gray',color:0x00}
    );
    pageModifier.endContext().writePage();

    if (isSample) {
        pageModifier = new muhammara.PDFPageModifier(pdfWriter, 1);
        ctx = pageModifier.startContext().getContext();
        renderSampleWatermark(pdfWriter, ctx, watermarkStreamImageXObject, WATERMARK_PAGES_X, WATERMARK_PAGES_Y);
        pageModifier.endContext().writePage();

        pageModifier = new muhammara.PDFPageModifier(pdfWriter, 2);
        ctx = pageModifier.startContext().getContext();
        renderSampleWatermark(pdfWriter, ctx, watermarkStreamImageXObject, WATERMARK_PAGES_X, WATERMARK_PAGES_Y);
        pageModifier.endContext().writePage();

        pageModifier = new muhammara.PDFPageModifier(pdfWriter, PAGE_MODIFIER_INDEX_PAGE_3);
        ctx = pageModifier.startContext().getContext();
        renderSampleWatermark(pdfWriter, ctx, watermarkStreamImageXObject, WATERMARK_PAGES_X, WATERMARK_PAGES_Y);
        pageModifier.endContext().writePage();
    } else {
        pageModifier = new muhammara.PDFPageModifier(pdfWriter, 1);
        ctx = pageModifier.startContext().getContext();
        renderQrCode(pathToTemplate, pdfWriter, ctx, imageXObject, QR_CODE_PAGE_1_X, QR_CODE_PAGE_1_Y);
        pageModifier.endContext().writePage();

        pageModifier = new muhammara.PDFPageModifier(pdfWriter, PAGE_MODIFIER_INDEX_PAGE_6);
        ctx = pageModifier.startContext().getContext();
        renderQrCode(pathToTemplate, pdfWriter, ctx, imageXObject, QR_CODE_X_POSITION_PAGE_6, QR_CODE_Y_POSITION_PAGE_6);
        pageModifier.endContext().writePage();
    }

    // Page 7: Schedule 1
    pageModifier = new muhammara.PDFPageModifier(pdfWriter, PAGE_MODIFIER_INDEX_SCHEDULE_1);
    ctx = pageModifier.startContext().getContext();
    ctx.writeText(
        docNumber,
        SCHEDULE_DOC_NUMBER_X, SCHEDULE_DOC_NUMBER_Y,
        {font:pdfWriter.getFontForFile(pathToTemplate + ARIAL_FONT),size:DOC_NUMBER_SIZE,colorspace:'gray',color:0x00}
    );
    if (isSample) {
        renderSampleWatermark(pdfWriter, ctx, watermarkStreamImageXObject, WATERMARK_SCHEDULE_X, WATERMARK_SCHEDULE_Y);
    } else {
        renderQrCode(pathToTemplate, pdfWriter, ctx, imageXObject, SCHEDULE_QR_CODE_X, SCHEDULE_QR_CODE_Y);
    }
    pageModifier.endContext().writePage();

    // Page 8: Schedule 2
    pageModifier = new muhammara.PDFPageModifier(pdfWriter, PAGE_MODIFIER_INDEX_SCHEDULE_2);
    ctx = pageModifier.startContext().getContext();
    ctx.writeText(
        docNumber,
        SCHEDULE_DOC_NUMBER_X, SCHEDULE_DOC_NUMBER_Y,
        {font:pdfWriter.getFontForFile(pathToTemplate + ARIAL_FONT),size:DOC_NUMBER_SIZE,colorspace:'gray',color:0x00}
    );
    if (isSample) {
        renderSampleWatermark(pdfWriter, ctx, watermarkStreamImageXObject, WATERMARK_SCHEDULE_X, WATERMARK_SCHEDULE_Y);
    } else {
        renderQrCode(pathToTemplate, pdfWriter, ctx, imageXObject, SCHEDULE_QR_CODE_X, SCHEDULE_QR_CODE_Y);
    }
    pageModifier.endContext().writePage();

    // Page 9: Schedule 3
    pageModifier = new muhammara.PDFPageModifier(pdfWriter, PAGE_MODIFIER_INDEX_SCHEDULE_3);
    ctx = pageModifier.startContext().getContext();
    ctx.writeText(
        docNumber,
        SCHEDULE_DOC_NUMBER_X, SCHEDULE_DOC_NUMBER_Y,
        {font:pdfWriter.getFontForFile(pathToTemplate + ARIAL_FONT),size:DOC_NUMBER_SIZE,colorspace:'gray',color:0x00}
    );
    if (isSample) {
        renderSampleWatermark(pdfWriter, ctx, watermarkStreamImageXObject, WATERMARK_SCHEDULE_X, WATERMARK_SCHEDULE_Y);
    } else {
        renderQrCode(pathToTemplate, pdfWriter, ctx, imageXObject, SCHEDULE_QR_CODE_X, SCHEDULE_QR_CODE_Y);
    }
    pageModifier.endContext().writePage();

    pdfWriter.end();
    stream.end();

};

const renderQrCode = (pathToTemplate, pdfWriter, ctx, imageXObject, x, y) => {
    ctx.q()
        .cm(1,0,0,1,x,y)
        .cm(QR_CODE_SCALE,0,0,QR_CODE_SCALE,0,0)
        .doXObject(imageXObject)
        .Q();

    ctx.writeText(
        'Use the QR code',
        x + QR_TEXT_X_OFFSET, y + QR_TEXT_LINE_1_Y_OFFSET,
        {font:pdfWriter.getFontForFile(pathToTemplate + ARIAL_FONT),size:QR_TEXT_SIZE,colorspace:'gray',color:0x00}
    );
    ctx.writeText(
        'to check that this',
        x + QR_TEXT_X_OFFSET, y + QR_TEXT_LINE_2_Y_OFFSET,
        {font:pdfWriter.getFontForFile(pathToTemplate + ARIAL_FONT),size:QR_TEXT_SIZE,colorspace:'gray',color:0x00}
    );
    ctx.writeText(
        'certificate is valid',
        x + QR_TEXT_X_OFFSET, y + QR_TEXT_LINE_3_Y_OFFSET,
        {font:pdfWriter.getFontForFile(pathToTemplate + ARIAL_FONT),size:QR_TEXT_SIZE,colorspace:'gray',color:0x00}
    );
}

const renderSampleWatermark = (_pdfWriter, ctx, imageXObject, x, y) => {
    ctx.q()
        .cm(1,0,0,1,x,y)
        //.cm(0.235,0,0,0.235,0,0)
        .doXObject(imageXObject)
        .Q();
}

module.exports = renderBlankExportCert;