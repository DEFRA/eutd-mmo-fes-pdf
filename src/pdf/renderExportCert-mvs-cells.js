const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const { getExportWeightText } = require('./renderExportCert-data');

const MVS_STYLES = {
    DEFAULT: { lineColor: '#767676', textColor: '#353535', bgColour: '#ffffff' },
    YELLOW_HEADER: { lineColor: '#767676', textColor: '#353535', bgColour: '#ffcc00' },
    YELLOW_BRIGHT: { lineColor: '#767676', textColor: '#353535', bgColour: '#ffff00' }
};

const normalizeTextToArray = (text) => {
    if (Array.isArray(text)) {
        return text;
    }
    if (text) {
        return [text];
    }
    return null;
};

const MVS_HEADING_CELL_TOP_PAD_DIVISOR = 3;

const mvsHeadingCell = ({doc, x, y, width, height, text}, isBold, fontSize, align, style = MVS_STYLES.DEFAULT) => {
    const textArr = normalizeTextToArray(text);
    mvsCell({doc, x, y, width, height, topPad: height / MVS_HEADING_CELL_TOP_PAD_DIVISOR, textArr}, isBold, fontSize, align, style);
};

const mvsTableCell = ({doc, x, y, width, height, text}, isBold, fontSize, align, style = MVS_STYLES.DEFAULT) => {
    const textArr = normalizeTextToArray(text);
    return mvsCell({doc, x, y, width, height, topPad: 4, textArr}, isBold, fontSize, align, style);
};

const MVS_CELL_LINE_WIDTH = 0.75;

const mvsCell = ({doc, x, y, width, height, topPad, textArr}, isBold, fontSize, align, style) => {
    const { lineColor, textColor, bgColour } = style;
    let yPos = y;
    doc.undash();
    doc.lineWidth(MVS_CELL_LINE_WIDTH);
    doc.rect(x, y, width, height);
    if (bgColour) {
        doc.fillAndStroke(bgColour, lineColor);
    } else {
        doc.stroke(lineColor);
    }
    doc.fillColor(textColor);
    if (textArr && textArr.length > 0) {
        if (isBold) {
            doc.font(PdfStyle.FONT.BOLD);
        } else {
            doc.font(PdfStyle.FONT.REGULAR);
        }
        doc.fontSize(fontSize);
        doc.text(textArr[0], x + 4, yPos + topPad, {
            width: width - 8,
            align: align
        });
        const arrlength = textArr.length;
        for (let idx = 1; idx < arrlength; idx++) {
            yPos += 10;
            doc.moveDown(1);
            doc.text(textArr[idx], x + 4, yPos + topPad, {
                width: width - 8,
                align: align
            });
        }
    }
};

const createMVSTableHeaderCell = (doc, tableHeadRow, x, y, width, height, text) => {
    const tableHead = doc.struct('TH', () => {
        mvsTableCell({doc, x, y, width, height, text}, true, PdfStyle.FONT_SIZE.SMALLER, 'center', MVS_STYLES.YELLOW_BRIGHT);
    });
    tableHeadRow.add(tableHead);
};

const createMVSTableDataCell = (doc, tableBodyRow, x, y, width, height, text) => {
    const td = doc.struct('TD', () => {
        mvsTableCell({doc, x, y, width, height, text}, false, PdfStyle.FONT_SIZE.SMALLER, 'left', MVS_STYLES.DEFAULT);
    });
    tableBodyRow.add(td);
};

const createSection3HeaderCell = (doc, tableHeadRow, x, y, width, height, content) => {
    const tableHead = doc.struct('TH', () => {
        PdfUtils.tableHeaderCell(doc, x, y, width, height, content);
    });
    tableHeadRow.add(tableHead);
};

const createSection3DataCell = (doc, tableBodyRow, cellConfig) => {
    const { x, y, width, height, content, lineSpacing = 1 } = cellConfig;
    const td = doc.struct('TD', () => {
        PdfUtils.field(doc, x, y, width, height, content, lineSpacing);
    });
    tableBodyRow.add(td);
};

const getSection3RowData = (rowIdx, arrLength, rowData, hasData) => {
    let speciesText = '';
    let commodityCodeText = '';
    let datesText = '';
    let catchAreasText = '';
    let exportWeightText = '';

    if (hasData) {
        const row = rowData[rowIdx];
        speciesText = `${row.species}`;
        commodityCodeText = `${row.commodityCode}`;
        datesText = `${row.dates}`;
        const rfmoAcronym = row.rfmo?.match(/\(([^)]{1,10})\)/) ? row.rfmo.match(/\(([^)]{1,10})\)/)[1] : '';
        const eezText = row.exclusiveEconomicZones?.map(eez => eez.isoCodeAlpha2).join(', ') || '';
        const highSeasText = row.highSeasArea === 'Yes' ? 'High Seas' : '';
        catchAreasText = [row.catchAreas, eezText, rfmoAcronym, highSeasText].filter(Boolean).join('\n');
        exportWeightText = getExportWeightText(rowIdx, arrLength, rowData);
    }

    return { speciesText, commodityCodeText, datesText, catchAreasText, exportWeightText };
};

module.exports = {
    MVS_STYLES,
    normalizeTextToArray,
    mvsHeadingCell,
    mvsTableCell,
    mvsCell,
    createMVSTableHeaderCell,
    createMVSTableDataCell,
    createSection3HeaderCell,
    createSection3DataCell,
    getSection3RowData,
};
