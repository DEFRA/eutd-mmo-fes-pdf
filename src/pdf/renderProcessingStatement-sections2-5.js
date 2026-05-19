const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const { createTableHeaderRow, createTableBodyWithRow } = require('./renderProcessingStatement-table-utils');

const SECTION_HEADER_Y_OFFSET = 12;
const SEPARATOR_SPACING = 8;
const FOOTNOTE_TEXT_X_OFFSET = 15;

const ROW_HEIGHT_MULTIPLIER_2 = 2;
const ROW_HEIGHT_MULTIPLIER_3 = 3;
const ROW_HEIGHT_MULTIPLIER_4 = 4;
const ROW_HEIGHT_MULTIPLIER_5 = 5;
const ROW_HEIGHT_MULTIPLIER_7 = 7;
const ROW_HEIGHT_ADJUSTMENT_5 = 5;
const ROW_HEIGHT_ADJUSTMENT_9 = 9;

const TABLE_COL_OFFSET_15 = 15;
const TABLE_COL_OFFSET_95 = 95;
const TABLE_COL_OFFSET_125 = 125;
const TABLE_COL_OFFSET_145 = 145;
const TABLE_COL_OFFSET_175 = 175;
const TABLE_COL_OFFSET_250 = 250;
const TABLE_COL_OFFSET_255 = 255;
const TABLE_COL_OFFSET_280 = 280;
const TABLE_COL_OFFSET_375 = 375;
const TABLE_COL_OFFSET_400 = 400;
const TABLE_COL_OFFSET_450 = 450;
const TABLE_COL_OFFSET_460 = 460;

const TABLE_COL_WIDTH_50 = 50;
const TABLE_COL_WIDTH_70 = 70;
const TABLE_COL_WIDTH_80 = 80;
const TABLE_COL_WIDTH_85 = 85;
const TABLE_COL_WIDTH_95 = 95;
const TABLE_COL_WIDTH_110 = 110;
const TABLE_COL_WIDTH_130 = 130;
const TABLE_COL_WIDTH_155 = 155;
const TABLE_COL_WIDTH_160 = 160;
const TABLE_COL_WIDTH_200 = 200;
const TABLE_COL_WIDTH_235 = 235;
const TABLE_COL_WIDTH_255 = 255;
const TABLE_COL_WIDTH_355 = 355;
const TABLE_COL_WIDTH_515 = 515;

const STATEMENT_LINE_WIDTH = 2;
const STATEMENT_LINE_END_X = 560;
const STATEMENT_LINE_Y_OFFSET = 4;
const STATEMENT_LABEL_Y_OFFSET = 17;
const STATEMENT_FIELD_Y_OFFSET = 15;
const STATEMENT_SEPARATOR_Y_OFFSET = 40;

const ENDORSEMENT_QR_CODE_Y_OFFSET = 28;
const ENDORSEMENT_FOOTER_SPACING = 4;
const ENDORSEMENT_TEXT_X_OFFSET = 15;

const statement = (doc, data, isSample, startY) => {
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        doc.lineWidth(STATEMENT_LINE_WIDTH);
        doc.moveTo(PdfStyle.MARGIN.LEFT, startY + STATEMENT_LINE_Y_OFFSET).lineTo(STATEMENT_LINE_END_X, startY + STATEMENT_LINE_Y_OFFSET).stroke();
    }));

    let documentNumber = '';
    if (isSample) {
        documentNumber = '###-####-##-#########';
    } else {
        documentNumber = data.documentNumber;
    }

    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT, startY + STATEMENT_LABEL_Y_OFFSET, 'Document Number');
    }));
    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_95, startY + STATEMENT_FIELD_Y_OFFSET, TABLE_COL_WIDTH_160, PdfStyle.ROW.HEIGHT, documentNumber);
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.separator(doc, startY + STATEMENT_SEPARATOR_Y_OFFSET);
    }));
};

const section2 = (doc, data, startY) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '2.  Processing plant details');
    }));
    let yPos = startY + SECTION_HEADER_Y_OFFSET;
    const cellHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_2 - ROW_HEIGHT_ADJUSTMENT_5;
    const ppAddress = PdfUtils.constructAddress([data.plantAddressOne, data.plantAddressTwo, data.plantTownCity, data.plantPostcode]);

    const myTable = doc.struct('Table');
    doc.addStructure(myTable);

    const headers = [
        { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_15, width: TABLE_COL_WIDTH_110, height: cellHeight, content: ['Processing plant'] },
        { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_125, width: TABLE_COL_WIDTH_155, height: cellHeight, content: 'Address' },
        { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_280, width: TABLE_COL_WIDTH_95, height: cellHeight, content: ['Plant approval', 'number'] },
        { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_375, width: TABLE_COL_WIDTH_85, height: cellHeight, content: ['Responsible', 'person'] },
        { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_460, width: TABLE_COL_WIDTH_70, height: cellHeight, content: ['Date of', 'acceptance (*)'] }
    ];

    createTableHeaderRow(doc, myTable, headers, yPos);

    const cells = [
        { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_15, width: TABLE_COL_WIDTH_110, height: PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_7 - ROW_HEIGHT_ADJUSTMENT_9, content: data.plantName, isWrapped: true, yOffset: cellHeight },
        { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_125, width: TABLE_COL_WIDTH_155, height: PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_7 - ROW_HEIGHT_ADJUSTMENT_9, content: ppAddress, isWrapped: true, noEllipsis: true, yOffset: cellHeight },
        { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_280, width: TABLE_COL_WIDTH_95, height: PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_7 - ROW_HEIGHT_ADJUSTMENT_9, content: data.plantApprovalNumber, isWrapped: false, yOffset: cellHeight },
        { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_375, width: TABLE_COL_WIDTH_85, height: PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_7 - ROW_HEIGHT_ADJUSTMENT_9, content: data.personResponsibleForConsignment, isWrapped: true, yOffset: cellHeight },
        { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_460, width: TABLE_COL_WIDTH_70, height: PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_7 - ROW_HEIGHT_ADJUSTMENT_9, content: data.dateOfAcceptance, isWrapped: false, yOffset: cellHeight }
    ];

    createTableBodyWithRow(doc, myTable, cells, yPos);

    yPos += cellHeight + PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_7 - ROW_HEIGHT_ADJUSTMENT_9 + ROW_HEIGHT_ADJUSTMENT_5;
    doc.addStructure(doc.struct('P', () => {
        doc.text('* Date of acceptance by the process plant\'s responsible person of the veracity of the contents of this processing statement', PdfStyle.MARGIN.LEFT + FOOTNOTE_TEXT_X_OFFSET, yPos);
    }));

    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT);
    }));

    return yPos + PdfStyle.ROW.HEIGHT;
};

const section3 = (doc, data, startY) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '3.  Health certificate details');
    }));
    const yPos = startY + SECTION_HEADER_Y_OFFSET;

    const myTable = doc.struct('Table');
    doc.addStructure(myTable);

    const tableRow = doc.struct('TR');
    myTable.add(tableRow);

    const tableHeadOne = doc.struct('TH');
    tableRow.add(tableHeadOne);
    const tableHeadOneContent = doc.markStructureContent('TH');
    tableHeadOne.add(tableHeadOneContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_15, yPos, TABLE_COL_WIDTH_130, PdfStyle.ROW.HEIGHT, 'Health certificate number');
    tableHeadOne.end();

    const TdOne = doc.struct('TD');
    tableRow.add(TdOne);
    const TdOneContent = doc.markStructureContent('TD');
    TdOne.add(TdOneContent);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_145, yPos, TABLE_COL_WIDTH_255, PdfStyle.ROW.HEIGHT, data.healthCertificateNumber);
    TdOne.end();

    const tableHeadTwo = doc.struct('TH');
    tableRow.add(tableHeadTwo);
    const tableHeadTwoContent = doc.markStructureContent('TH');
    tableHeadTwo.add(tableHeadTwoContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_400, yPos, TABLE_COL_WIDTH_50, PdfStyle.ROW.HEIGHT, 'Date');
    tableHeadTwo.end();

    const TdTwo = doc.struct('TD');
    tableRow.add(TdTwo);
    const TdTwoContent = doc.markStructureContent('TD');
    TdTwo.add(TdTwoContent);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_450, yPos, TABLE_COL_WIDTH_80, PdfStyle.ROW.HEIGHT, data.healthCertificateDate);
    TdTwo.end();

    tableRow.end();
    doc.endMarkedContent();
    myTable.end();

    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT + SEPARATOR_SPACING);
    }));

    return yPos + PdfStyle.ROW.HEIGHT + SEPARATOR_SPACING;
};

const section4 = (doc, data, startY) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '4.  Exporter details');
    }));
    const yPos = startY + SECTION_HEADER_Y_OFFSET;
    const cellHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_4;
    const exporterAddress = PdfUtils.constructAddress([data.exporter.addressOne, data.exporter.addressTwo, data.exporter.townCity, data.exporter.postcode]);

    const myTable = doc.struct('Table');
    doc.addStructure(myTable);

    const headers = [
        { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_15, width: TABLE_COL_WIDTH_160, height: PdfStyle.ROW.HEIGHT, content: 'Company' },
        { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_175, width: TABLE_COL_WIDTH_355, height: PdfStyle.ROW.HEIGHT, content: 'Address' }
    ];

    createTableHeaderRow(doc, myTable, headers, yPos);

    const cells = [
        { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_15, width: TABLE_COL_WIDTH_160, height: cellHeight, content: data.exporter.exporterCompanyName, isWrapped: false, yOffset: PdfStyle.ROW.HEIGHT },
        { x: PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_175, width: TABLE_COL_WIDTH_355, height: cellHeight, content: exporterAddress, isWrapped: true, noEllipsis: true, yOffset: PdfStyle.ROW.HEIGHT }
    ];

    createTableBodyWithRow(doc, myTable, cells, yPos);

    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT + cellHeight + SEPARATOR_SPACING);
    }));

    return yPos + PdfStyle.ROW.HEIGHT + cellHeight + SEPARATOR_SPACING;
};

const renderEndorsementHeader = (doc, startY) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, 'Endorsement by the competent authority');
    }));
};

const renderEndorsementTable = (doc, isSample, buff, startY) => {
    let yPos = startY + SECTION_HEADER_Y_OFFSET;
    const cellHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_5;

    const tableStruct = doc.struct('Table');
    doc.addStructure(tableStruct);

    const tableHead = doc.struct('THead');
    tableStruct.add(tableHead);

    const tableHeadRow = doc.struct('TR');
    tableHead.add(tableHeadRow);

    const tableHeadOne = doc.struct('TH');
    tableHeadRow.add(tableHeadOne);
    const tableHeadOneContent = doc.markStructureContent('TH');
    tableHeadOne.add(tableHeadOneContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_15, yPos, TABLE_COL_WIDTH_235, PdfStyle.ROW.HEIGHT, 'Name and Address');
    tableHeadOne.end();

    const tableHeadTwo = doc.struct('TH');
    tableHeadRow.add(tableHeadTwo);
    const tableHeadTwoContent = doc.markStructureContent('TH');
    tableHeadTwo.add(tableHeadTwoContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_250, yPos, TABLE_COL_WIDTH_200, PdfStyle.ROW.HEIGHT, 'Validation');
    tableHeadTwo.end();

    const tableHeadThree = doc.struct('TH');
    tableHeadRow.add(tableHeadThree);
    const tableHeadThreeContent = doc.markStructureContent('TH');
    tableHeadThree.add(tableHeadThreeContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_450, yPos, TABLE_COL_WIDTH_80, PdfStyle.ROW.HEIGHT, 'Date Issued');
    tableHeadThree.end();

    tableHeadRow.end();
    tableHead.end();

    yPos += PdfStyle.ROW.HEIGHT;

    const tableBody = doc.struct('TBody');
    tableStruct.add(tableBody);

    const tableBodyRow = doc.struct('TR');
    tableBody.add(tableBodyRow);

    const TdOne = doc.struct('TD');
    tableBodyRow.add(TdOne);
    const TdOneContent = doc.markStructureContent('TD');
    TdOne.add(TdOneContent);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_15, yPos, TABLE_COL_WIDTH_235, cellHeight,
        ['Illegal Unreported and Unregulated (IUU) Fishing Team,',
        'Marine Management Organisation,', 'Tyneside House, Skinnerburn Rd,', 'Newcastle upon Tyne. NE4 7AR', 'United Kingdom',
        'Tel: 0300 123 1032',
        'Email: ukiuuslo@marinemanagement.org.uk']);
    TdOne.end();

    const TdTwo = doc.struct('TD');
    tableBodyRow.add(TdTwo);
    const TdTwoContent = doc.markStructureContent('TD');
    TdTwo.add(TdTwoContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_250, yPos, TABLE_COL_WIDTH_200, cellHeight);
    if (!isSample) {
        PdfUtils.qrCode(doc, buff, PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_255, startY + ENDORSEMENT_QR_CODE_Y_OFFSET);
    }
    TdTwo.end();

    const TdThree = doc.struct('TD');
    tableBodyRow.add(TdThree);
    const TdThreeContent = doc.markStructureContent('TD');
    TdThree.add(TdThreeContent);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + TABLE_COL_OFFSET_450, yPos, TABLE_COL_WIDTH_80, cellHeight, PdfUtils.todaysDate());
    TdThree.end();
    tableBodyRow.end();

    doc.endMarkedContent();
    tableBody.end();
    tableStruct.end();

    return yPos + cellHeight + ENDORSEMENT_FOOTER_SPACING;
};

const renderEndorsementFooterText = (doc, startY) => {
    doc.addStructure(doc.struct('P', () => {
        doc.font(PdfStyle.FONT.REGULAR);
        doc.fontSize(PdfStyle.FONT_SIZE.SMALL);
        doc.text('Validated by the appropriate competent authority (MMO, Scottish Ministers, Welsh Ministers, Department of Agriculture, Environment and Rural Affairs for Northern Ireland, Marine Resources, Growth and Housing and Environment for Jersey, Sea Fisheries, Committee for Economic Development for Guernsey and Department Environment, Food and Agriculture for the Isle of Man) in accordance with article 15 of Council Regulation (EU) 1005/2008 (as retained under s.3(1) European Union (Withdrawal) Act 2018)', PdfStyle.MARGIN.LEFT + ENDORSEMENT_TEXT_X_OFFSET, startY, {
            width: TABLE_COL_WIDTH_515,
            lineBreak: true
        });
    }));
};

const section5 = (doc, isSample, buff, startY) => {
    renderEndorsementHeader(doc, startY);
    const footerStartY = renderEndorsementTable(doc, isSample, buff, startY);
    renderEndorsementFooterText(doc, footerStartY);
};

module.exports = {
    section2,
    section3,
    section4,
    section5,
    statement,
};
