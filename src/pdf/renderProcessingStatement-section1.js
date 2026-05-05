const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const { createProductTable, getProductsArray, startNewPage } = require('./renderProcessingStatement-product-table');

const SECTION_HEADER_Y_OFFSET = 12;
const PAGE_HEIGHT = 780;
const PAGINATION_RESERVED_SPACE = 50;
const NEW_PAGE_START_Y_OFFSET = 25;
const SEPARATOR_SPACING = 8;
const SEPARATOR_HEIGHT = 3;
const PRODUCT_SPACING = 13;
const PRODUCT_DESCRIPTION_SPACING_AFTER = 3;
const PRODUCT_TABLE_LABEL_SPACING = 2;
const PRODUCT_SPACING_BETWEEN = 8;
const ROW_HEIGHT_MULTIPLIER_2 = 2;
const ROW_HEIGHT_MULTIPLIER_3 = 3;
const ROW_HEIGHT_ADJUSTMENT_5 = 5;
const ROW_HEIGHT_ADJUSTMENT_7 = 7;
const TABLE_COL_OFFSET_15 = 15;
const TABLE_COL_WIDTH_515 = 515;

const formatProductDescription = (product) => {
    return product.commodityCode
        ? `${product.commodityCode} - ${product.description || ''}`
        : (product.description || '');
};

const renderProductDescription = (doc, product, startY) => {
    const cellHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_2 - ROW_HEIGHT_ADJUSTMENT_5;
    const productDescription = formatProductDescription(product);

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_15, startY, TABLE_COL_WIDTH_515, cellHeight, productDescription, ROW_HEIGHT_MULTIPLIER_2);
    }));
    return startY + cellHeight + PRODUCT_DESCRIPTION_SPACING_AFTER;
};

const renderProductTable = (doc, data, productIndex, startY, currentPage, isSample, usablePageHeight) => {
    let yPos = startY;

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_15, yPos, 'has been obtained from catches under the following catch certificate(s):');
    }));
    yPos += PdfStyle.ROW.HEIGHT + PRODUCT_TABLE_LABEL_SPACING;

    return createProductTable(doc, data, yPos, productIndex, currentPage, isSample, usablePageHeight);
};

// Refactored: Accept a single options object to reduce parameter count
const renderSingleProduct = ({
    doc,
    data,
    product,
    productIndex,
    startY,
    currentPage,
    isSample,
    usablePageHeight
}) => {
    let yPos = startY;
    let page = currentPage;

    if (productIndex > 0) {
        yPos += PRODUCT_SPACING;
    }

    if (productIndex === 0) {
        doc.addStructure(doc.struct('H3', () => {
            PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '1.');
        }));
    }

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_15, yPos, 'I confirm that the processed fishery product:');
    }));
    yPos += PdfStyle.ROW.HEIGHT - PRODUCT_DESCRIPTION_SPACING_AFTER;

    yPos = renderProductDescription(doc, product, yPos);

    const tableResult = renderProductTable(doc, data, productIndex, yPos, page, isSample, usablePageHeight);
    yPos = tableResult.yPos;
    page = tableResult.page;

    if (productIndex > 0) {
        yPos += PRODUCT_SPACING_BETWEEN;
    }

    return { yPos, page };
};

const section1 = (doc, data, startY, isSample, currentPage) => {
    let yPos = startY + SECTION_HEADER_Y_OFFSET;
    const products = getProductsArray(data);
    let page = currentPage;
    const usablePageHeight = PAGE_HEIGHT - PAGINATION_RESERVED_SPACE;

    for (let productIndex = 0; productIndex < products.length; productIndex++) {
        const minProductStartHeight = SECTION_HEADER_Y_OFFSET + PdfStyle.ROW.HEIGHT + (PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_2 - ROW_HEIGHT_ADJUSTMENT_5) + ROW_HEIGHT_ADJUSTMENT_5 + PdfStyle.ROW.HEIGHT + ROW_HEIGHT_ADJUSTMENT_5 + (PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_3 - ROW_HEIGHT_ADJUSTMENT_7);

        if (yPos + minProductStartHeight > usablePageHeight) {
            page = startNewPage(doc, isSample, page);
            yPos = PdfStyle.MARGIN.TOP + NEW_PAGE_START_Y_OFFSET;

            if (productIndex === 0) {
                doc.addStructure(doc.struct('H3', () => {
                    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '1');
                }));
            }
        }

        const result = renderSingleProduct({
            doc,
            data,
            product: products[productIndex],
            productIndex,
            startY: yPos,
            currentPage: page,
            isSample,
            usablePageHeight
        });
        yPos = result.yPos;
        page = result.page;
    }

    const separatorY = yPos + SEPARATOR_SPACING;
    const separatorEndY = separatorY + SEPARATOR_HEIGHT;

    if (separatorEndY > usablePageHeight) {
        page = startNewPage(doc, isSample, page);
        yPos = PdfStyle.MARGIN.TOP + NEW_PAGE_START_Y_OFFSET;
        doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
            PdfUtils.separator(doc, yPos);
        }));
        return { yPos: yPos, page };
    }

    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.separator(doc, separatorY);
    }));
    return { yPos: separatorY, page };
};

module.exports = {
    section1,
};
