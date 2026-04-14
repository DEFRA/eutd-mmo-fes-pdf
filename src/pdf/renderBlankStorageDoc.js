const path = require('node:path');
const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const muhammara = require('muhammara');
const PDFStreamForNodeJsStream = require('./PDFStreamForNodeJsStream');

const SAMPLE_WATERMARK_X = 30;
const SAMPLE_WATERMARK_Y = 100;
const DOC_NUMBER_X = 130;
const DOC_NUMBER_Y = 716;
const QR_CODE_X = 290;
const QR_CODE_Y = 150;
const SCALE_FACTOR = 0.235;
const QR_TEXT_X_OFFSET = 95;
const QR_TEXT_LINE_1_Y_OFFSET = 50;
const QR_TEXT_LINE_2_Y_OFFSET = 36;
const QR_TEXT_LINE_3_Y_OFFSET = 22;
const PAGE_INDEX_THREE = 3;

const renderBlankStorageDoc = async (data, isSample, uri, stream, pathToTemplate) => {
    const inStream = new muhammara.PDFRStreamForFile(pathToTemplate + 'storage-doc-blank.pdf');
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
    let pageModifier = new muhammara.PDFPageModifier(pdfWriter,0);
    let ctx = pageModifier.startContext().getContext();
    let docNumber = data.documentNumber;

    if (isSample) {
        docNumber = '###-####-##-#########';
        renderSampleWatermark(ctx, watermarkStreamImageXObject, SAMPLE_WATERMARK_X, SAMPLE_WATERMARK_Y);
    }
    ctx.writeText(
        docNumber,
        DOC_NUMBER_X, DOC_NUMBER_Y,
        {font:pdfWriter.getFontForFile(pathToTemplate + 'fonts/arial.ttf'),size:10,colorspace:'gray',color:0x00}
    );

    if (isSample) {
        renderSampleWatermark(ctx, watermarkStreamImageXObject, SAMPLE_WATERMARK_X, SAMPLE_WATERMARK_Y);
    }
    pageModifier.endContext().writePage();

    pageModifier = new muhammara.PDFPageModifier(pdfWriter, 1);
    ctx = pageModifier.startContext().getContext();

    if(isSample) {
        renderSampleWatermark(ctx, watermarkStreamImageXObject, SAMPLE_WATERMARK_X, SAMPLE_WATERMARK_Y);
    }
    else {
        renderQrCode(pathToTemplate, pdfWriter, ctx, imageXObject, QR_CODE_X, QR_CODE_Y);
    }

    pageModifier.endContext().writePage();
    
    if (isSample) {
        pageModifier = new muhammara.PDFPageModifier(pdfWriter, 2);
        ctx = pageModifier.startContext().getContext();
        renderSampleWatermark(ctx, watermarkStreamImageXObject, SAMPLE_WATERMARK_X, SAMPLE_WATERMARK_Y);
        pageModifier.endContext().writePage();

        pageModifier = new muhammara.PDFPageModifier(pdfWriter, PAGE_INDEX_THREE);
        ctx = pageModifier.startContext().getContext();
        renderSampleWatermark(ctx, watermarkStreamImageXObject, SAMPLE_WATERMARK_X, SAMPLE_WATERMARK_Y);
        pageModifier.endContext().writePage();

        pageModifier = new muhammara.PDFPageModifier(pdfWriter, 4);
        ctx = pageModifier.startContext().getContext();
        renderSampleWatermark(ctx, watermarkStreamImageXObject, SAMPLE_WATERMARK_X, SAMPLE_WATERMARK_Y);
        pageModifier.endContext().writePage();
    }

    pdfWriter.end();
    stream.end();
};

const renderQrCode = (pathToTemplate, pdfWriter, ctx, imageXObject, x, y) => {
    const qrTextOptions = {
        font: pdfWriter.getFontForFile(pathToTemplate + 'fonts/arial.ttf'),
        size: 11,
        colorspace: 'gray',
        color: 0x00
    };

    ctx.q()
        .cm(1,0,0,1,x,y)
        .cm(SCALE_FACTOR,0,0,SCALE_FACTOR,0,0)
        .doXObject(imageXObject)
        .Q();

    ctx.writeText(
        'Use the QR code',
        x + QR_TEXT_X_OFFSET, y + QR_TEXT_LINE_1_Y_OFFSET,
        qrTextOptions
    );
    ctx.writeText(
        'to check that this',
        x + QR_TEXT_X_OFFSET, y + QR_TEXT_LINE_2_Y_OFFSET,
        qrTextOptions
    );
    ctx.writeText(
        'certificate is valid',
        x + QR_TEXT_X_OFFSET, y + QR_TEXT_LINE_3_Y_OFFSET,
        qrTextOptions
    );
}

const renderSampleWatermark = (ctx, imageXObject, x, y) => {
    ctx.q()
        .cm(1,0,0,1,x,y)
        //.cm(0.235,0,0,0.235,0,0)
        .doXObject(imageXObject)
        .Q();
}
module.exports = renderBlankStorageDoc;