const path = require('node:path');
const PdfStyle = require('./mmoPdfStyles');

const WATERMARK_X = 30;
const WATERMARK_Y = 100;
const DOC_NUMBER_X = 130;
const DOC_NUMBER_Y = 720;
const DOC_NUMBER_SIZE = 10;
const QR_CODE_X = 285;
const QR_CODE_Y = 115;
const QR_TEXT_OFFSET_X = 95;
const QR_TEXT_LINE1_Y = 50;
const QR_TEXT_LINE2_Y = 36;
const QR_TEXT_LINE3_Y = 22;
const QR_CODE_SCALE = 0.235;
const QR_TEXT_SIZE = 11;
const PdfUtils = require('./mmoPdfUtils');
const moment = require ('moment');
const muhammara = require('muhammara');
const PDFStreamForNodeJsStream = require('./PDFStreamForNodeJsStream');
const PDFStreamForImageBuffer = require('./PDFStreamForImageBuffer');

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

    const arialFontPath = pathToTemplate + 'fonts/arial.ttf';
    let pageModifier = new muhammara.PDFPageModifier(pdfWriter, 0);
    let ctx = pageModifier.startContext().getContext();
    let docNumber = data.documentNumber;

    if (isSample) {
        docNumber = '###-####-##-#########';
        renderSampleWatermark(ctx, watermarkStreamImageXObject, WATERMARK_X, WATERMARK_Y);
    }
    ctx.writeText(
        docNumber,
        DOC_NUMBER_X, DOC_NUMBER_Y,
        {font: pdfWriter.getFontForFile(arialFontPath), size: DOC_NUMBER_SIZE, colorspace: 'gray', color: 0x00}
    );

    if (isSample) {
        renderSampleWatermark(ctx, watermarkStreamImageXObject, WATERMARK_X, WATERMARK_Y);
    } else {
        renderQrCode(arialFontPath, pdfWriter, ctx, imageXObject, QR_CODE_X, QR_CODE_Y);
    }
    pageModifier.endContext().writePage();

    // Handle page 1 (the additional schedule page in the template)
    pageModifier = new muhammara.PDFPageModifier(pdfWriter, 1);
    ctx = pageModifier.startContext().getContext();
    
    if (isSample) {
        renderSampleWatermark(ctx, watermarkStreamImageXObject, WATERMARK_X, WATERMARK_Y);
    }
    
    pageModifier.endContext().writePage();

    pdfWriter.end();
    stream.end();
};

const renderQrCode = (arialFontPath, pdfWriter, ctx, imageXObject, x, y) => {
    ctx.q()
        .cm(1,0,0,1,x,y)
        .cm(QR_CODE_SCALE,0,0,QR_CODE_SCALE,0,0)
        .doXObject(imageXObject)
        .Q();

    ctx.writeText(
        'Use the QR code',
        x + QR_TEXT_OFFSET_X, y + QR_TEXT_LINE1_Y,
        {font:pdfWriter.getFontForFile(arialFontPath),size:QR_TEXT_SIZE,colorspace:'gray',color:0x00}
    );
    ctx.writeText(
        'to check that this',
        x + QR_TEXT_OFFSET_X, y + QR_TEXT_LINE2_Y,
        {font:pdfWriter.getFontForFile(arialFontPath),size:QR_TEXT_SIZE,colorspace:'gray',color:0x00}
    );
    ctx.writeText(
        'certificate is valid',
        x + QR_TEXT_OFFSET_X, y + QR_TEXT_LINE3_Y,
        {font:pdfWriter.getFontForFile(arialFontPath),size:QR_TEXT_SIZE,colorspace:'gray',color:0x00}
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