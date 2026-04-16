const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const { isMultiVessel, getLicenceHolder } = require('./renderExportCert-data');

// IMO vessel identifier text also used in schedule.js (defined independently)
const IMO_VESSEL_IDENTIFIER_TEXT = 'IMO number or other unique vessel identifier (if applicable)';
// Separator offset shared with section2 in sections-1-3.js
const SECTION2_SEPARATOR_OFFSET_Y = 137;
const SECTION8_CELL_HEIGHT_MULTIPLIER = 7;
const SECTION8_PARAGRAPH_OFFSET = 5;

const section4 = (doc, data, startY) => {
    const FIELD_OFFSET_X = 15;
    const FIELD_OFFSET_Y = 12;
    const FIELD_WIDTH = 515;
    const FIELD_HEIGHT_MULTIPLIER = 2;
    const SEPARATOR_OFFSET_Y = 52;

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '4    References to applicable conservation and management measures:');
    }));
    let policy = '';
    if (data.conservation) {
        policy = data.conservation.conservationReference === 'Other' ? data.conservation.anotherConservation : data.conservation.conservationReference;
    }
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + FIELD_OFFSET_X, startY + FIELD_OFFSET_Y, FIELD_WIDTH, PdfStyle.ROW.HEIGHT * FIELD_HEIGHT_MULTIPLIER, policy);
    }));
    PdfUtils.separator(doc, startY + SEPARATOR_OFFSET_Y);
};

const section5 = (doc, data, startY) => {
    const FIELD_OFFSET_X = 15;
    const FIELD_WIDTH = 515;
    const YPOS_INCREMENT = 5;
    const TEXT_OFFSET_X = 15;
    const SEPARATOR_OFFSET_Y = 45;

    let yPos = startY;
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '5    Name of master of fishing vessel or of fishing licence holder – Signature:');
    }));

    yPos += PdfStyle.ROW.HEIGHT;

    const licenceHolder = isMultiVessel(data.exportPayload) ? "Multiple vessels - See schedule" : getLicenceHolder(data.exportPayload);
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + FIELD_OFFSET_X, yPos, FIELD_WIDTH, PdfStyle.ROW.HEIGHT, licenceHolder);
    }));

    yPos += PdfStyle.ROW.HEIGHT + YPOS_INCREMENT;

    doc.addStructure(doc.struct('P', () => {
        doc.font(PdfStyle.FONT.BOLD);
        doc.fillColor('#000000');
        doc.text('* I am a representative of the vessel (s) shown on this document', PdfStyle.MARGIN.LEFT + TEXT_OFFSET_X, yPos);
        doc.font(PdfStyle.FONT.REGULAR);
        doc.fillColor('#353535');
    }));
    PdfUtils.separator(doc, startY + SEPARATOR_OFFSET_Y);
};

const section6 = (doc, startY) => {
    const CELL_HEIGHT_MULTIPLIER = 2;
    const DECLARATION_COL_OFFSET = 15;
    const DECLARATION_COL_WIDTH = 220;
    const SIGNATURE_DATE_COL_OFFSET = 235;
    const SIGNATURE_DATE_COL_WIDTH = 100;
    const TRANSHIPMENT_COL_OFFSET = 335;
    const TRANSHIPMENT_COL_WIDTH = 115;
    const ESTIMATED_WEIGHT_COL_OFFSET = 450;
    const ESTIMATED_WEIGHT_COL_WIDTH = 80;
    const YPOS_INCREMENT = 30;

    let yPos = startY;
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '6');
    }));

    const cellHeight = PdfStyle.ROW.HEIGHT * CELL_HEIGHT_MULTIPLIER;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT + DECLARATION_COL_OFFSET, yPos, DECLARATION_COL_WIDTH, cellHeight, ['Declaration of Transhipment at Sea', 'Name of Master of Fishing Vessel'])),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SIGNATURE_DATE_COL_OFFSET, yPos, SIGNATURE_DATE_COL_WIDTH, cellHeight, ['Signature', 'and Date'])),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + TRANSHIPMENT_COL_OFFSET, yPos, TRANSHIPMENT_COL_WIDTH, cellHeight, ['Transhipment', 'Date/Area/Position'])),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + ESTIMATED_WEIGHT_COL_OFFSET, yPos, ESTIMATED_WEIGHT_COL_WIDTH, cellHeight, 'Estimated weight (kg)'))
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + DECLARATION_COL_OFFSET, yPos + cellHeight, DECLARATION_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SIGNATURE_DATE_COL_OFFSET, yPos + cellHeight, SIGNATURE_DATE_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + TRANSHIPMENT_COL_OFFSET, yPos + cellHeight, TRANSHIPMENT_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + ESTIMATED_WEIGHT_COL_OFFSET, yPos + cellHeight, ESTIMATED_WEIGHT_COL_WIDTH, cellHeight))
            ])
        ])
    ]));
    yPos += cellHeight + YPOS_INCREMENT;

    const MASTER_COL_OFFSET = 15;
    const MASTER_COL_WIDTH = 100;
    const SIGNATURE_COL_OFFSET = 115;
    const SIGNATURE_COL_WIDTH = 100;
    const VESSEL_NAME_COL_OFFSET = 215;
    const VESSEL_NAME_COL_WIDTH = 90;
    const CALL_SIGN_COL_OFFSET = 305;
    const CALL_SIGN_COL_WIDTH = 90;
    const IMO_IDENTIFIER_COL_OFFSET = 395;
    const IMO_IDENTIFIER_COL_WIDTH = 135;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + MASTER_COL_OFFSET, yPos, MASTER_COL_WIDTH, cellHeight, ['Master of Receiving', 'Vessel'])),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SIGNATURE_COL_OFFSET, yPos, SIGNATURE_COL_WIDTH, cellHeight, 'Signature')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + VESSEL_NAME_COL_OFFSET, yPos, VESSEL_NAME_COL_WIDTH, cellHeight, 'Vessel Name')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + CALL_SIGN_COL_OFFSET, yPos, CALL_SIGN_COL_WIDTH, cellHeight, 'Call Sign')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + IMO_IDENTIFIER_COL_OFFSET, yPos, IMO_IDENTIFIER_COL_WIDTH, cellHeight, [IMO_VESSEL_IDENTIFIER_TEXT]))
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + MASTER_COL_OFFSET, yPos + cellHeight, MASTER_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SIGNATURE_COL_OFFSET, yPos + cellHeight, SIGNATURE_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + VESSEL_NAME_COL_OFFSET, yPos + cellHeight, VESSEL_NAME_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + CALL_SIGN_COL_OFFSET, yPos + cellHeight, CALL_SIGN_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + IMO_IDENTIFIER_COL_OFFSET, yPos + cellHeight, IMO_IDENTIFIER_COL_WIDTH, cellHeight))
            ])
        ])
    ]));

    const SEPARATOR_OFFSET = 130;
    PdfUtils.separator(doc, startY + SEPARATOR_OFFSET);
};

const renderSection7LandingAuthTable = (doc, yPos, cellHeight) => {
    const NAME_COL_OFFSET = 15;
    const NAME_COL_WIDTH = 65;
    const AUTHORITY_COL_OFFSET = 80;
    const AUTHORITY_COL_WIDTH = 60;
    const SIGNATURE_COL_OFFSET = 140;
    const SIGNATURE_COL_WIDTH = 60;
    const ADDRESS_COL_OFFSET = 200;
    const ADDRESS_COL_WIDTH = 65;
    const TEL_COL_OFFSET = 265;
    const TEL_COL_WIDTH = 60;
    const PORT_LANDING_COL_OFFSET = 325;
    const PORT_LANDING_COL_WIDTH = 75;
    const DATE_LANDING_COL_OFFSET = 400;
    const DATE_LANDING_COL_WIDTH = 130;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + NAME_COL_OFFSET, yPos, NAME_COL_WIDTH, cellHeight, 'Name')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + AUTHORITY_COL_OFFSET, yPos, AUTHORITY_COL_WIDTH, cellHeight, 'Authority')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SIGNATURE_COL_OFFSET, yPos, SIGNATURE_COL_WIDTH, cellHeight, 'Signature')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + ADDRESS_COL_OFFSET, yPos, ADDRESS_COL_WIDTH, cellHeight, 'Address')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + TEL_COL_OFFSET, yPos, TEL_COL_WIDTH, cellHeight, 'Tel.')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + PORT_LANDING_COL_OFFSET, yPos, PORT_LANDING_COL_WIDTH, cellHeight, 'Port of landing (as appropriate)')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + DATE_LANDING_COL_OFFSET, yPos, DATE_LANDING_COL_WIDTH, cellHeight, 'Date of landing (as appropriate)')),
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + NAME_COL_OFFSET, yPos + cellHeight, NAME_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + AUTHORITY_COL_OFFSET, yPos + cellHeight, AUTHORITY_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SIGNATURE_COL_OFFSET, yPos + cellHeight, SIGNATURE_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + ADDRESS_COL_OFFSET, yPos + cellHeight, ADDRESS_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + TEL_COL_OFFSET, yPos + cellHeight, TEL_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + PORT_LANDING_COL_OFFSET, yPos + cellHeight, PORT_LANDING_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + DATE_LANDING_COL_OFFSET, yPos + cellHeight, DATE_LANDING_COL_WIDTH, cellHeight)),
            ])
        ])
    ]));
};

const renderSection7TranshipmentTable = (doc, yPos, cellHeight) => {
    const IMO_VESSEL_COL_OFFSET = 15;
    const IMO_VESSEL_COL_WIDTH = 185;
    const PORT_TRANSHIP_COL_OFFSET = 200;
    const PORT_TRANSHIP_COL_WIDTH = 125;
    const DATE_TRANSHIP_COL_OFFSET = 325;
    const DATE_TRANSHIP_COL_WIDTH = 75;
    const RECEIVING_VESSEL_COL_OFFSET = 400;
    const RECEIVING_VESSEL_COL_WIDTH = 50;
    const SEAL1_COL_OFFSET = 450;
    const SEAL1_COL_WIDTH = 40;
    const SEAL2_COL_OFFSET = 490;
    const SEAL2_COL_WIDTH = 40;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + IMO_VESSEL_COL_OFFSET, yPos, IMO_VESSEL_COL_WIDTH, cellHeight, IMO_VESSEL_IDENTIFIER_TEXT)),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + PORT_TRANSHIP_COL_OFFSET, yPos, PORT_TRANSHIP_COL_WIDTH, cellHeight, 'Port of transhipment (as appropriate)')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + DATE_TRANSHIP_COL_OFFSET, yPos, DATE_TRANSHIP_COL_WIDTH, cellHeight, 'Date of transhipment (as appropriate)')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + RECEIVING_VESSEL_COL_OFFSET, yPos, RECEIVING_VESSEL_COL_WIDTH, cellHeight, 'Name and\nregistration\nnumber of\nreceiving\nvessel')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SEAL1_COL_OFFSET, yPos, SEAL1_COL_WIDTH, cellHeight, 'Seal (Stamp)')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SEAL2_COL_OFFSET, yPos, SEAL2_COL_WIDTH, cellHeight, 'Seal (Stamp)'))
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + IMO_VESSEL_COL_OFFSET, yPos + cellHeight, IMO_VESSEL_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + PORT_TRANSHIP_COL_OFFSET, yPos + cellHeight, PORT_TRANSHIP_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + DATE_TRANSHIP_COL_OFFSET, yPos + cellHeight, DATE_TRANSHIP_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + RECEIVING_VESSEL_COL_OFFSET, yPos + cellHeight, RECEIVING_VESSEL_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SEAL1_COL_OFFSET, yPos + cellHeight, SEAL1_COL_WIDTH, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SEAL2_COL_OFFSET, yPos + cellHeight, SEAL2_COL_WIDTH, cellHeight))
            ])
        ])
    ]));
};

const section7 = (doc, startY) => {
    const YPOS_OFFSET = 12;
    const CELL_HEIGHT_MULTIPLIER = 2.5;
    const CELL_HEIGHT_ADJUSTMENT = 6;
    const YPOS_INCREMENT_BETWEEN_TABLES = 32;
    const SECOND_TABLE_HEIGHT_MULTIPLIER = 4.5;
    const SEPARATOR_OFFSET = 209;

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '7    Transhipment and/or landing authorisation within a port area:');
    }));

    let yPos = startY + YPOS_OFFSET;
    let cellHeight = PdfStyle.ROW.HEIGHT * CELL_HEIGHT_MULTIPLIER - CELL_HEIGHT_ADJUSTMENT;

    renderSection7LandingAuthTable(doc, yPos, cellHeight);

    yPos += cellHeight + YPOS_INCREMENT_BETWEEN_TABLES;
    cellHeight = PdfStyle.ROW.HEIGHT * SECOND_TABLE_HEIGHT_MULTIPLIER - CELL_HEIGHT_ADJUSTMENT;

    renderSection7TranshipmentTable(doc, yPos, cellHeight);

    PdfUtils.separator(doc, startY + SEPARATOR_OFFSET);
};

const section8 = (doc, data, startY) => {

    let yPos = startY;
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '8');
    }));

    const cellHeight = PdfStyle.ROW.HEIGHT * SECTION8_CELL_HEIGHT_MULTIPLIER + 2;

    const exporterAddress = PdfUtils.constructAddress([
        data.exporter?.addressOne,
        data.exporter?.addressTwo,
        data.exporter?.townCity,
        data.exporter?.postcode
    ]) ?? '';
    const exporterFullName = data.exporter?.exporterFullName ?? '';
    const exporterCompanyName = data.exporter?.exporterCompanyName ?? '';

    let dateOfAcceptance = PdfUtils.todaysDate();
    if (data.isBlankTemplate) {
        dateOfAcceptance = '';
    }

    const EXPORTER_NAME_COL_OFFSET = 15;
    const EXPORTER_NAME_COL_WIDTH = 230;
    const SIGNATURE_COL_OFFSET = 245;
    const SIGNATURE_COL_WIDTH = 115;
    const DATE_ACCEPTANCE_COL_OFFSET = 360;
    const DATE_ACCEPTANCE_COL_WIDTH = 95;
    const SEAL_COL_OFFSET = 455;
    const SEAL_COL_WIDTH = 75;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT + EXPORTER_NAME_COL_OFFSET, yPos, EXPORTER_NAME_COL_WIDTH, PdfStyle.ROW.HEIGHT, 'Name and address of Exporter')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SIGNATURE_COL_OFFSET, yPos, SIGNATURE_COL_WIDTH, PdfStyle.ROW.HEIGHT, 'Signature')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + DATE_ACCEPTANCE_COL_OFFSET, yPos, DATE_ACCEPTANCE_COL_WIDTH, PdfStyle.ROW.HEIGHT, 'Date of acceptance(*)')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SEAL_COL_OFFSET, yPos, SEAL_COL_WIDTH, PdfStyle.ROW.HEIGHT, 'Seal'))
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + EXPORTER_NAME_COL_OFFSET, yPos + PdfStyle.ROW.HEIGHT, EXPORTER_NAME_COL_WIDTH, cellHeight,
                    [exporterFullName, exporterCompanyName, exporterAddress])),
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + SIGNATURE_COL_OFFSET, yPos + PdfStyle.ROW.HEIGHT, SIGNATURE_COL_WIDTH, cellHeight, exporterFullName)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + DATE_ACCEPTANCE_COL_OFFSET, yPos + PdfStyle.ROW.HEIGHT, DATE_ACCEPTANCE_COL_WIDTH, cellHeight, dateOfAcceptance)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SEAL_COL_OFFSET, yPos + PdfStyle.ROW.HEIGHT, SEAL_COL_WIDTH, cellHeight))
            ])
        ])
    ]));

    yPos += cellHeight + SECTION8_PARAGRAPH_OFFSET + PdfStyle.ROW.HEIGHT;
    const EXPORTER_ACCEPTANCE_LABEL_X_OFFSET = 15;

    doc.addStructure(doc.struct('P', () => {
        doc.text('* Date of acceptance by exporter of the veracity of the contents of this document', PdfStyle.MARGIN.LEFT + EXPORTER_ACCEPTANCE_LABEL_X_OFFSET, yPos);
    }));

    PdfUtils.separator(doc, startY + SECTION2_SEPARATOR_OFFSET_Y);
};

const section9 = (doc, data, isSample, buff, startY) => {
    const YPOS_OFFSET = 12;
    const CELL_HEIGHT_MULTIPLIER = 2;
    const CELL_HEIGHT_ADJUSTMENT = 3;
    const FIELD_OFFSET_X = 15;
    const FIELD_WIDTH = 250;
    const QR_CODE_OFFSET_X = 80;
    const SEPARATOR_OFFSET_Y = 66;

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '9    Flag State Authority Validation:');
    }));
    const yPos = startY + YPOS_OFFSET;
    const cellHeight = PdfStyle.ROW.HEIGHT * CELL_HEIGHT_MULTIPLIER - CELL_HEIGHT_ADJUSTMENT;

    let dateIssued = PdfUtils.todaysDate();
    if (data.isBlankTemplate) {
        dateIssued = '';
    }

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + FIELD_OFFSET_X, yPos, FIELD_WIDTH, PdfStyle.ROW.HEIGHT, 'Date Issued')),
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=>  PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + FIELD_OFFSET_X, yPos + PdfStyle.ROW.HEIGHT, FIELD_WIDTH, cellHeight, dateIssued)),
            ])
        ])
    ]));

    const qrXPosition = PdfStyle.MARGIN.LEFT + FIELD_OFFSET_X + FIELD_WIDTH + QR_CODE_OFFSET_X;

    if (!data.isBlankTemplate && !isSample) {
        PdfUtils.qrCode(doc, buff, qrXPosition, startY);
    }

    PdfUtils.separator(doc, startY + SEPARATOR_OFFSET_Y);
};

const section10 = (doc, startY) => {
    const YPOS_OFFSET = 12;
    const SEPARATOR_OFFSET_Y = 36;

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + YPOS_OFFSET, '10    Transport details: See Appendix I');
    }));
    PdfUtils.separator(doc, startY + SEPARATOR_OFFSET_Y);
};

module.exports = {
    section4,
    section5,
    section6,
    section7,
    section8,
    section9,
    section10,
};
