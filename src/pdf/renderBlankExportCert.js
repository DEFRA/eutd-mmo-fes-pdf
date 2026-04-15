const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const moment = require ('moment');
const muhammara = require('muhammara');
const PDFStreamForNodeJsStream = require('./PDFStreamForNodeJsStream');
const PDFStreamForImageBuffer = require('./PDFStreamForImageBuffer');

const SAMPLE_WATERMARK_X = 30;
const SAMPLE_WATERMARK_Y = 100;
const DOC_NUMBER_X_TOP = 130;
const DOC_NUMBER_Y_TOP = 712;
const DOC_NUMBER_X_BOTTOM = 128;
const DOC_NUMBER_Y_BOTTOM = 494;
const QR_SCALE = 0.235;
const QR_TEXT_X_OFFSET = 95;
const QR_TEXT_Y_1 = 40;
const QR_TEXT_Y_2 = 26;
const QR_TEXT_Y_3 = 12;
const QR_MAIN_X = 350;
const QR_MAIN_Y = 130;
const QR_SECONDARY_X = 70;
const QR_SECONDARY_Y = 70;
const QR_TRAILING_X = 617;
const QR_TRAILING_Y = 445;
const FONT_PATH = 'fonts/arial.ttf';
const FONT_SIZE_10 = 10;
const FONT_SIZE_11 = 11;
const GRAY_COLOR = 0x00;
const PAGE_1 = 1;
const PAGE_2 = 2;
const PAGE_3 = 3;
const PAGE_5 = 5;
const PAGE_6 = 6;
const PAGE_7 = 7;
const PAGE_8 = 8;

const SAMPLE_PAGE_INDICES = [PAGE_1,PAGE_2,PAGE_3];
const QR_PAGE_CONFIGS = [
    {pageIndex:PAGE_1, x:QR_MAIN_X, y:QR_MAIN_Y},
    {pageIndex:PAGE_5, x:QR_SECONDARY_X, y:QR_SECONDARY_Y}
];
const TRAILING_PAGE_INDICES = [PAGE_6,PAGE_7,PAGE_8];

const writeDocumentNumber = (ctx, pdfWriter, pathToTemplate, docNumber, x, y) => {
    ctx.writeText(
        docNumber,
        x, y,
        {font:pdfWriter.getFontForFile(pathToTemplate + FONT_PATH),size:FONT_SIZE_10,colorspace:'gray',color:GRAY_COLOR}
    );
};

const renderTrailingPage = (pageIndex, pathToTemplate, pdfWriter, docNumber, isSample, watermarkStreamImageXObject, imageXObject) => {
    const pageModifier = new muhammara.PDFPageModifier(pdfWriter, pageIndex);
    const ctx = pageModifier.startContext().getContext();
    writeDocumentNumber(ctx, pdfWriter, pathToTemplate, docNumber, DOC_NUMBER_X_BOTTOM, DOC_NUMBER_Y_BOTTOM);
    if (isSample) {
        renderSampleWatermark(ctx, watermarkStreamImageXObject, DOC_NUMBER_X_TOP, 0);
    } else {
        renderQrCode(pathToTemplate, pdfWriter, ctx, imageXObject, QR_TRAILING_X, QR_TRAILING_Y);
    }
    pageModifier.endContext().writePage();
};

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
        renderSampleWatermark(ctx, watermarkStreamImageXObject, SAMPLE_WATERMARK_X, SAMPLE_WATERMARK_Y);
    }
    writeDocumentNumber(ctx, pdfWriter, pathToTemplate, docNumber, DOC_NUMBER_X_TOP, DOC_NUMBER_Y_TOP);
    pageModifier.endContext().writePage();

    if (isSample) {
        SAMPLE_PAGE_INDICES.forEach((pageIndex) => {
            pageModifier = new muhammara.PDFPageModifier(pdfWriter, pageIndex);
            ctx = pageModifier.startContext().getContext();
            renderSampleWatermark(ctx, watermarkStreamImageXObject, SAMPLE_WATERMARK_X, SAMPLE_WATERMARK_Y);
            pageModifier.endContext().writePage();
        });
    } else {
        QR_PAGE_CONFIGS.forEach(({pageIndex, x, y}) => {
            pageModifier = new muhammara.PDFPageModifier(pdfWriter, pageIndex);
            ctx = pageModifier.startContext().getContext();
            renderQrCode(pathToTemplate, pdfWriter, ctx, imageXObject, x, y);
            pageModifier.endContext().writePage();
        });
    }

    TRAILING_PAGE_INDICES.forEach((pageIndex) => {
        renderTrailingPage(pageIndex, pathToTemplate, pdfWriter, docNumber, isSample, watermarkStreamImageXObject, imageXObject);
    });

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

module.exports = renderBlankExportCert;