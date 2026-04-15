const path = require('path');
const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const moment = require ('moment');
const muhammara = require('muhammara');
const PDFStreamForNodeJsStream = require('./PDFStreamForNodeJsStream');
const PDFStreamForImageBuffer = require('./PDFStreamForImageBuffer');

const renderBlankProcStmnt = async (data, isSample, uri, stream, pathToTemplate) => {
    const inStream = new muhammara.PDFRStreamForFile(pathToTemplate + 'proc-stmnt-blank.pdf');
    const pdfStream = new PDFStreamForNodeJsStream(stream);
    let pdfWriter = muhammara.createWriterToModify(inStream, pdfStream);
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
        renderSampleWatermark(pdfWriter, ctx, watermarkStreamImageXObject, 30, 100);
    }
    ctx.writeText(
        docNumber,
        130, 720,
        {font: pdfWriter.getFontForFile(pathToTemplate + 'fonts/arial.ttf'), size: 10, colorspace: 'gray', color: 0x00}
    );

    if (isSample) {
        renderSampleWatermark(pdfWriter, ctx, watermarkStreamImageXObject, 30, 100);
    } else {
        renderQrCode(pathToTemplate, pdfWriter, ctx, imageXObject, 285, 115);
    }
    pageModifier.endContext().writePage();

    // Handle page 1 (the additional schedule page in the template)
    pageModifier = new muhammara.PDFPageModifier(pdfWriter, 1);
    ctx = pageModifier.startContext().getContext();
    
    if (isSample) {
        renderSampleWatermark(pdfWriter, ctx, watermarkStreamImageXObject, 30, 100);
    }
    
    pageModifier.endContext().writePage();

    pdfWriter.end();
    stream.end();
};

const renderQrCode = (pathToTemplate, pdfWriter, ctx, imageXObject, x, y) => {
    ctx.q()
        .cm(1,0,0,1,x,y)
        .cm(0.235,0,0,0.235,0,0)
        .doXObject(imageXObject)
        .Q();

    ctx.writeText(
        'Use the QR code',
        x + 95, y + 50,
        {font:pdfWriter.getFontForFile(pathToTemplate + 'fonts/arial.ttf'),size:11,colorspace:'gray',color:0x00}
    );
    ctx.writeText(
        'to check that this',
        x + 95, y + 36,
        {font:pdfWriter.getFontForFile(pathToTemplate + 'fonts/arial.ttf'),size:11,colorspace:'gray',color:0x00}
    );
    ctx.writeText(
        'certificate is valid',
        x + 95, y + 22,
        {font:pdfWriter.getFontForFile(pathToTemplate + 'fonts/arial.ttf'),size:11,colorspace:'gray',color:0x00}
    );
}

const renderSampleWatermark = (pdfWriter, ctx, imageXObject, x, y) => {
    ctx.q()
        .cm(1,0,0,1,x,y)
        //.cm(0.235,0,0,0.235,0,0)
        .doXObject(imageXObject)
        .Q();
}

module.exports = renderBlankProcStmnt;