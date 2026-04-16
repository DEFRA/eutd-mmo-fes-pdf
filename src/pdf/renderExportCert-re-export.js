const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');

const REEXPORT_HEADER_LINE_START_X = 185;
const REEXPORT_HEADER_LINE_END_X = 560;
const REEXPORT_HEADER_VERTICAL_OFFSET = 20;

const reExportCertificateHeader = (doc, startY) => {
    const HEADER_LINE_WIDTH = 2;
    const HEADER_LINE_OFFSET_Y = 4;
    const CERTIFICATE_NUMBER_FIELD_OFFSET_X = 105;
    const CERTIFICATE_NUMBER_FIELD_WIDTH = 130;
    const DATE_LABEL_OFFSET_X = 245;
    const DATE_FIELD_OFFSET_X = 275;
    const DATE_FIELD_WIDTH = 110;
    const MEMBER_STATE_LABEL_OFFSET_X = 395;
    const MEMBER_STATE_FIELD_OFFSET_X = 475;
    const MEMBER_STATE_FIELD_WIDTH = 55;
    const FIELD_OFFSET_Y = -2;
    const SEPARATOR_OFFSET_Y = 25;

    doc.fontSize(PdfStyle.FONT_SIZE.MEDIUM);
    doc.addStructure(doc.struct('H3', {}, () => {
        doc.text('(ii) RE-EXPORT CERTIFICATE', PdfStyle.MARGIN.LEFT, startY);
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        doc.lineWidth(HEADER_LINE_WIDTH);
        doc.moveTo(REEXPORT_HEADER_LINE_START_X, startY + HEADER_LINE_OFFSET_Y).lineTo(REEXPORT_HEADER_LINE_END_X, startY + HEADER_LINE_OFFSET_Y).stroke();
    }));

    const yPos = startY + REEXPORT_HEADER_VERTICAL_OFFSET;

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT, yPos, 'Certificate Number');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + CERTIFICATE_NUMBER_FIELD_OFFSET_X, yPos + FIELD_OFFSET_Y, CERTIFICATE_NUMBER_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, '');
    }));

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + DATE_LABEL_OFFSET_X, yPos, 'Date');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + DATE_FIELD_OFFSET_X, yPos + FIELD_OFFSET_Y, DATE_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, '');
    }));

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + MEMBER_STATE_LABEL_OFFSET_X, yPos, 'Member State');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + MEMBER_STATE_FIELD_OFFSET_X, yPos + FIELD_OFFSET_Y, MEMBER_STATE_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, '');
    }));

    PdfUtils.separator(doc, yPos + SEPARATOR_OFFSET_Y);
};

const section14 = (doc, startY) => {
    const YPOS_INCREMENT = 12;
    const CELL_HEIGHT_MULTIPLIER = 2;
    const CELL_HEIGHT_ADJUSTMENT = 3;
    const SPECIES_COL_OFFSET = 15;
    const SPECIES_COL_WIDTH = 205;
    const PRODUCT_CODE_COL_OFFSET = 220;
    const PRODUCT_CODE_COL_WIDTH = 150;
    const BALANCE_COL_OFFSET = 370;
    const BALANCE_COL_WIDTH = 160;
    const ROW_HEIGHT_MULTIPLIER = 10;
    const SEPARATOR_OFFSET = 8;

    let yPos = startY;
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '1    Description of re-exported product');
    }));
    yPos += YPOS_INCREMENT;
    const cellHeight = PdfStyle.ROW.HEIGHT * CELL_HEIGHT_MULTIPLIER - CELL_HEIGHT_ADJUSTMENT;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SPECIES_COL_OFFSET, yPos, SPECIES_COL_WIDTH, cellHeight, 'Species')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + PRODUCT_CODE_COL_OFFSET, yPos, PRODUCT_CODE_COL_WIDTH, cellHeight, 'Product code')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + BALANCE_COL_OFFSET, yPos, BALANCE_COL_WIDTH, cellHeight, ['Balance from total quantity declared', 'in the catch certificate'])),
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SPECIES_COL_OFFSET, yPos + cellHeight, SPECIES_COL_WIDTH, PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + PRODUCT_CODE_COL_OFFSET, yPos + cellHeight, PRODUCT_CODE_COL_WIDTH, PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + BALANCE_COL_OFFSET, yPos + cellHeight, BALANCE_COL_WIDTH, PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER)),
            ])
        ])
    ]));

    PdfUtils.separator(doc, (yPos + cellHeight) + (PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER) + SEPARATOR_OFFSET);
};

const section15 = (doc, startY) => {
    const CELL_HEIGHT_MULTIPLIER = 6;
    const NAME_COL_OFFSET = 15;
    const NAME_COL_WIDTH = 140;
    const ADDRESS_COL_OFFSET = 155;
    const ADDRESS_COL_WIDTH = 215;
    const SIGNATURE_COL_OFFSET = 370;
    const SIGNATURE_COL_WIDTH = 90;
    const DATE_COL_OFFSET = 460;
    const DATE_COL_WIDTH = 70;
    const SEPARATOR_OFFSET = 8;

    const yPos = startY;
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '2');
    }));

    const cellHeight = PdfStyle.ROW.HEIGHT * CELL_HEIGHT_MULTIPLIER;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT + NAME_COL_OFFSET, yPos, NAME_COL_WIDTH, PdfStyle.ROW.HEIGHT, 'Name of re-exporter')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + ADDRESS_COL_OFFSET, yPos, ADDRESS_COL_WIDTH, PdfStyle.ROW.HEIGHT, 'Address')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SIGNATURE_COL_OFFSET, yPos, SIGNATURE_COL_WIDTH, PdfStyle.ROW.HEIGHT, 'Signature')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + DATE_COL_OFFSET, yPos, DATE_COL_WIDTH, PdfStyle.ROW.HEIGHT, 'Date'))
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + NAME_COL_OFFSET, yPos + PdfStyle.ROW.HEIGHT, NAME_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + ADDRESS_COL_OFFSET, yPos + PdfStyle.ROW.HEIGHT, ADDRESS_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SIGNATURE_COL_OFFSET, yPos + PdfStyle.ROW.HEIGHT, SIGNATURE_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + DATE_COL_OFFSET, yPos + PdfStyle.ROW.HEIGHT, DATE_COL_WIDTH, cellHeight))
            ])
        ])
    ]));

    PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT + cellHeight + SEPARATOR_OFFSET);
};

const section16 = (doc, startY) => {
    const YPOS_OFFSET = 12;
    const CELL_HEIGHT_MULTIPLIER = 6;
    const NAME_COL_OFFSET = 15;
    const NAME_COL_WIDTH = 210;
    const SIGNATURE_COL_OFFSET = 225;
    const SIGNATURE_COL_WIDTH = 110;
    const DATE_COL_OFFSET = 335;
    const DATE_COL_WIDTH = 95;
    const SEAL_COL_OFFSET = 430;
    const SEAL_COL_WIDTH = 100;
    const SEPARATOR_OFFSET = 8;

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '3    Authority');
    }));
    const yPos = startY + YPOS_OFFSET;
    const cellHeight = PdfStyle.ROW.HEIGHT * CELL_HEIGHT_MULTIPLIER;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + NAME_COL_OFFSET, yPos, NAME_COL_WIDTH, PdfStyle.ROW.HEIGHT, 'Name / title')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SIGNATURE_COL_OFFSET, yPos, SIGNATURE_COL_WIDTH, PdfStyle.ROW.HEIGHT, 'Signature')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + DATE_COL_OFFSET, yPos, DATE_COL_WIDTH, PdfStyle.ROW.HEIGHT, 'Date')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SEAL_COL_OFFSET, yPos, SEAL_COL_WIDTH, PdfStyle.ROW.HEIGHT, 'Seal'))
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + NAME_COL_OFFSET, yPos + PdfStyle.ROW.HEIGHT, NAME_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SIGNATURE_COL_OFFSET, yPos + PdfStyle.ROW.HEIGHT, SIGNATURE_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + DATE_COL_OFFSET, yPos + PdfStyle.ROW.HEIGHT, DATE_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SEAL_COL_OFFSET, yPos + PdfStyle.ROW.HEIGHT, SEAL_COL_WIDTH, cellHeight))
            ])
        ])
    ]));

    PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT + cellHeight + SEPARATOR_OFFSET);
};

const section17 = (doc, startY) => {
    const YPOS_OFFSET = 12;
    const CELL_HEIGHT_MULTIPLIER = 2;
    const CELL_HEIGHT_ADJUSTMENT = 3;
    const PLACE_COL_OFFSET = 15;
    const PLACE_COL_WIDTH = 155;
    const AUTHORISED_COL_OFFSET = 170;
    const AUTHORISED_COL_WIDTH = 110;
    const VERIFICATION_COL_OFFSET = 280;
    const VERIFICATION_COL_WIDTH = 110;
    const DECLARATION_COL_OFFSET = 390;
    const DECLARATION_COL_WIDTH = 140;
    const ROW_HEIGHT_MULTIPLIER = 6;
    const YPOS_INCREMENT = 5;
    const TEXT_OFFSET_X = 15;
    const SEPARATOR_OFFSET = 15;

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '4    Re-export control');
    }));
    let yPos = startY + YPOS_OFFSET;
    const cellHeight = PdfStyle.ROW.HEIGHT * CELL_HEIGHT_MULTIPLIER - CELL_HEIGHT_ADJUSTMENT;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + PLACE_COL_OFFSET, yPos, PLACE_COL_WIDTH, cellHeight, 'Place')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + AUTHORISED_COL_OFFSET, yPos, AUTHORISED_COL_WIDTH, cellHeight, 'Re-export authorised (*)')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + VERIFICATION_COL_OFFSET, yPos, VERIFICATION_COL_WIDTH, cellHeight, 'Verification requested (*)')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + DECLARATION_COL_OFFSET, yPos, DECLARATION_COL_WIDTH, cellHeight, ['Re-export declaration', 'number and date']))
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + PLACE_COL_OFFSET, yPos + cellHeight, PLACE_COL_WIDTH, PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + AUTHORISED_COL_OFFSET, yPos + cellHeight, AUTHORISED_COL_WIDTH, PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + VERIFICATION_COL_OFFSET, yPos + cellHeight, VERIFICATION_COL_WIDTH, PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + DECLARATION_COL_OFFSET, yPos + cellHeight, DECLARATION_COL_WIDTH, PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER))
            ])
        ])
    ]));

    yPos += cellHeight + PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER + YPOS_INCREMENT;
    doc.addStructure(doc.struct('P', () => {
        doc.text('* Tick as appropriate', PdfStyle.MARGIN.LEFT + TEXT_OFFSET_X, yPos);
    }));

    PdfUtils.separator(doc, yPos + SEPARATOR_OFFSET);
};

module.exports = {
    reExportCertificateHeader,
    section14,
    section15,
    section16,
    section17,
};
