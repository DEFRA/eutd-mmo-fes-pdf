const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const moment = require ('moment');
const muhammara = require('muhammara');
const PDFStreamForNodeJsStream = require('./PDFStreamForNodeJsStream');
const PDFStreamForImageBuffer = require('./PDFStreamForImageBuffer');

const SAMPLE_WATERMARK_X = 30;
const SAMPLE_WATERMARK_Y = 100;
const DOC_NUMBER_X = 130;
const DOC_NUMBER_Y = 720;
const QR_CODE_X = 285;
const QR_CODE_Y = 115;
const QR_SCALE = 0.235;
const QR_TEXT_X_OFFSET = 95;
const QR_TEXT_Y_1 = 50;
const QR_TEXT_Y_2 = 36;
const QR_TEXT_Y_3 = 22;
const PAGE_1 = 1;
const PAGE_2 = 2;
const PAGE_3 = 3;
const FONT_SIZE_10 = 10;
const FONT_SIZE_11 = 11;
const FONT_PATH = 'fonts/arial.ttf';
const GRAY_COLOR = 0x00;

const renderBlankProcStmnt = async (data, isSample, uri, stream, pathToTemplate) => {
    const inStream = new muhammara.PDFRStreamForFile(pathToTemplate + 'proc-stmnt-blank.pdf');
    const pdfStream = new PDFStreamForNodeJsStream(stream);
    const pdfWriter = muhammara.createWriterToModify(inStream, pdfStream);
    let watermarkStreamImageXObject, imageXObject;
    if (isSample) {
        const sampleWatermarkStream = new muhammara.PDFRStreamForFile(pathToTemplate + 'sample-watermark.png'); // './src/resources/export-cert-blank.pdf'
        watermarkStreamImageXObject = pdfWriter.createFormXObjectFromPNG(sampleWatermarkStream);
    } else {
        const qrCodeBuffer = await PdfUtils.generateQRCode(uri);
        const PdfImgStream = new muhammara.PDFRStreamForBuffer(qrCodeBuffer);
        imageXObject = pdfWriter.createFormXObjectFromPNG(PdfImgStream);
    }

    let pageModifier = new muhammara.PDFPageModifier(pdfWriter, 0);
    let ctx = pageModifier.startContext().getContext();
    let docNumber = data.documentNumber;

    if (isSample) {
        docNumber = '###-####-##-#########';
        renderSampleWatermark(ctx, watermarkStreamImageXObject, SAMPLE_WATERMARK_X, SAMPLE_WATERMARK_Y);
    }
    ctx.writeText(
        docNumber,
        DOC_NUMBER_X, DOC_NUMBER_Y,
        {font: pdfWriter.getFontForFile(pathToTemplate + FONT_PATH), size: FONT_SIZE_10, colorspace: 'gray', color: GRAY_COLOR}
    );

    if (isSample) {
        renderSampleWatermark(ctx, watermarkStreamImageXObject, SAMPLE_WATERMARK_X, SAMPLE_WATERMARK_Y);
    } else {
        renderQrCode(pathToTemplate, pdfWriter, ctx, imageXObject, QR_CODE_X, QR_CODE_Y);
    }
    pageModifier.endContext().writePage();

    if (isSample) {
        pageModifier = new muhammara.PDFPageModifier(pdfWriter, PAGE_1);
        ctx = pageModifier.startContext().getContext();
        renderSampleWatermark(ctx, watermarkStreamImageXObject, SAMPLE_WATERMARK_X, SAMPLE_WATERMARK_Y);
        pageModifier.endContext().writePage();

        pageModifier = new muhammara.PDFPageModifier(pdfWriter, PAGE_2);
        ctx = pageModifier.startContext().getContext();
        renderSampleWatermark(ctx, watermarkStreamImageXObject, SAMPLE_WATERMARK_X, SAMPLE_WATERMARK_Y);
        pageModifier.endContext().writePage();

        pageModifier = new muhammara.PDFPageModifier(pdfWriter, PAGE_3);
        ctx = pageModifier.startContext().getContext();
        renderSampleWatermark(ctx, watermarkStreamImageXObject, SAMPLE_WATERMARK_X, SAMPLE_WATERMARK_Y);
        pageModifier.endContext().writePage();
    }

    pdfWriter.end();
    stream.end();
};

const renderQrCode = (pathToTemplate, pdfWriter, ctx, imageXObject, x, y) => {
    const font = pdfWriter.getFontForFile(pathToTemplate + FONT_PATH);
    ctx.q()
        .cm(1,0,0,1,x,y)
        .cm(QR_SCALE,0,0,QR_SCALE,0,0)
        .doXObject(imageXObject)
        .Q();

    ctx.writeText(
        'Use the QR code',
        x + QR_TEXT_X_OFFSET, y + QR_TEXT_Y_1,
        {font,size:FONT_SIZE_11,colorspace:'gray',color:GRAY_COLOR}
    );
    ctx.writeText(
        'to check that this',
        x + QR_TEXT_X_OFFSET, y + QR_TEXT_Y_2,
        {font,size:FONT_SIZE_11,colorspace:'gray',color:GRAY_COLOR}
    );
    ctx.writeText(
        'certificate is valid',
        x + QR_TEXT_X_OFFSET, y + QR_TEXT_Y_3,
        {font,size:FONT_SIZE_11,colorspace:'gray',color:GRAY_COLOR}
    );
}

const renderSampleWatermark = (ctx, imageXObject, x, y) => {
    ctx.q()
        .cm(1,0,0,1,x,y)
        //.cm(0.235,0,0,0.235,0,0)
        .doXObject(imageXObject)
        .Q();
}

module.exports = renderBlankProcStmnt;