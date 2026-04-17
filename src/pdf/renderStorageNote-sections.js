const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const {
    TITLE_OFFSET,
    MARGIN_OFFSET,
    SPACING_SMALL,
    SPACING_MEDIUM,
    HEADER_SUBROW_OFFSET,
    CONSIGNMENT_PADDING_X,
    SEPARATOR_OFFSET_AFTER_CELL,
    SEPARATOR_SPACING,
    SECTION_1_SPACING,
    SECTION_1_TOP_LINE_OFFSET,
    SECTION_1_LABEL_OFFSET,
    SECTION_1_FIELD_OFFSET_X,
    SECTION_1_FIELD_OFFSET_Y,
    SECTION_1_FIELD_WIDTH,
    SECTION_1_DECLARING_AUTHORITY_X,
    SECTION_1_DECLARING_AUTHORITY_WIDTH,
    SECTION_1_DECLARING_AUTHORITY_Y,
    SECTION_1_NAME_Y,
    SECTION_1_NAME_FIELD_X,
    SECTION_1_NAME_FIELD_Y,
    SECTION_1_NAME_FIELD_WIDTH,
    SECTION_1_ADDRESS_LABEL_X,
    SECTION_1_ADDRESS_LABEL_Y,
    SECTION_1_ADDRESS_FIELD_X,
    SECTION_1_ADDRESS_FIELD_Y,
    SECTION_1_ADDRESS_FIELD_WIDTH,
    SECTION_1_ADDRESS_FIELD_HEIGHT_MULTIPLIER,
    SECTION_1_TEL_LABEL_Y,
    SECTION_1_TEL_FIELD_X,
    SECTION_1_TEL_FIELD_Y,
    SECTION_1_TEL_FIELD_WIDTH,
    SECTION_1_EMAIL_LABEL_X,
    SECTION_1_EMAIL_LABEL_Y,
    SECTION_1_EMAIL_FIELD_X,
    SECTION_1_EMAIL_FIELD_Y,
    SECTION_1_EMAIL_FIELD_WIDTH,
    SECTION_1_BOTTOM_LINE_Y,
    SECTION_1_BOTTOM_LINE_X_END,
    SECTION_1_LINE_WIDTH_THIN,
    SECTION_1_LINE_WIDTH_THICK,
    SECTION_1_LINE_DASH_SIZE,
    SECTION_1_LINE_SPACE,
    SECTION_4_COL1_WIDTH,
    SECTION_4_COL2_X,
    SECTION_4_COL2_WIDTH,
    SECTION_4_COL3_X,
    SECTION_4_COL3_WIDTH,
    SECTION_4_COL4_X,
    SECTION_4_COL4_WIDTH,
    SECTION_4_SUBROW_COL_WIDTH,
    SECTION_4_SUBROW_COL2_X,
    SECTION_4_SUBROW_COL3_X,
    SECTION_4_HEADER_MULTIPLIER,
    SECTION_4_DATA_MULTIPLIER,
    SECTION_7_COL1_WIDTH,
    SECTION_7_COL2_X,
    SECTION_7_COL2_WIDTH,
    SECTION_7_COL3_X,
    SECTION_7_COL3_WIDTH,
    SECTION_7_ADDITIONAL_SPACING,
    SECTION_8_Y_OFFSET,
    SECTION_8_INFO_TEXT_Y_OFFSET,
    SECTION_8_INFO_TEXT_WIDTH,
    SECTION_8_QR_CODE_Y_OFFSET,
    SECTION_8_CELL_HEIGHT_PADDING,
    SECTION_8_FOOTER_TEXT_X,
    SECTION_8_COL1_X,
    SECTION_8_COL1_WIDTH,
    SECTION_8_COL2_X,
    SECTION_8_COL2_WIDTH,
    SECTION_8_QR_CODE_X,
    SECTION_8_COL3_X,
    SECTION_8_COL3_WIDTH,
    ROW_HEIGHT_MULTIPLIER_3_5,
    ROW_HEIGHT_MULTIPLIER_4,
    ROW_HEIGHT_MULTIPLIER_5,
} = require('./renderStorageNote-constants');

const formatAddress = (obj) => {
    const { addressOne, townCity, postcode } = obj;
    return [addressOne, townCity, postcode].filter(Boolean).join('\n');
};

const createSection4TableHeaders = (doc, myTable, yPos, cellHeight, subCellHeight) => {
    const tableHead = doc.struct('THead');
    myTable.add(tableHead);

    const tableHeadRow = doc.struct('TR');
    tableHead.add(tableHeadRow);

    const tableHeadOne = doc.struct('TH');
    tableHeadRow.add(tableHeadOne);
    const tableHeadOneContent = doc.markStructureContent('TH');
    tableHeadOne.add(tableHeadOneContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + MARGIN_OFFSET, yPos, SECTION_4_COL1_WIDTH, cellHeight, ['Name']);
    tableHeadOne.end();

    const tableHeadTwo = doc.struct('TH');
    tableHeadRow.add(tableHeadTwo);
    const tableHeadTwoContent = doc.markStructureContent('TH');
    tableHeadTwo.add(tableHeadTwoContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SECTION_4_COL2_X, yPos, SECTION_4_COL2_WIDTH, cellHeight, 'Address');
    tableHeadTwo.end();

    const tableHeadThree = doc.struct('TH');
    tableHeadRow.add(tableHeadThree);
    const tableHeadThreeContent = doc.markStructureContent('TH');
    tableHeadThree.add(tableHeadThreeContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SECTION_4_COL3_X, yPos, SECTION_4_COL3_WIDTH, cellHeight, ['Approval number', '(if applicable)']);
    tableHeadThree.end();

    const tableHeadFour = doc.struct('TH');
    tableHeadRow.add(tableHeadFour);
    const tableHeadFourContent = doc.markStructureContent('TH');
    tableHeadFour.add(tableHeadFourContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SECTION_4_COL4_X, yPos, SECTION_4_COL4_WIDTH, cellHeight, ['Stored as', '(tick as appropriate)']);
    tableHeadFour.end();

    tableHeadRow.end();
    const tableHeadSubRow = doc.struct('TR');
    tableHead.add(tableHeadSubRow);

    const tableHeadFourSubOne = doc.struct('TH');
    tableHeadSubRow.add(tableHeadFourSubOne);
    const tableHeadFourSubOneContent = doc.markStructureContent('TH');
    tableHeadFourSubOne.add(tableHeadFourSubOneContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SECTION_4_COL4_X, yPos + HEADER_SUBROW_OFFSET, SECTION_4_SUBROW_COL_WIDTH, subCellHeight, 'Chilled');
    tableHeadFourSubOne.end();

    const tableHeadFourSubTwo = doc.struct('TH');
    tableHeadSubRow.add(tableHeadFourSubTwo);
    const tableHeadFourSubTwoContent = doc.markStructureContent('TH');
    tableHeadFourSubTwo.add(tableHeadFourSubTwoContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SECTION_4_SUBROW_COL2_X, yPos + HEADER_SUBROW_OFFSET, SECTION_4_SUBROW_COL_WIDTH, subCellHeight, 'Frozen');
    tableHeadFourSubTwo.end();

    const tableHeadFourSubThree = doc.struct('TH');
    tableHeadSubRow.add(tableHeadFourSubThree);
    const tableHeadFourSubThreeContent = doc.markStructureContent('TH');
    tableHeadFourSubThree.add(tableHeadFourSubThreeContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SECTION_4_SUBROW_COL3_X, yPos + HEADER_SUBROW_OFFSET, SECTION_4_SUBROW_COL_WIDTH, subCellHeight, 'Other');
    tableHeadFourSubThree.end();

    tableHeadSubRow.end();
    tableHead.end();
};

const createSection4TableRow = (doc, tableBodyRow, yPos, dataRowHeight, data) => {
    const sfAddress = PdfUtils.constructAddress([data.facilityAddressOne,
        data.facilityAddressTwo,
        data.facilityTownCity,
        data.facilityPostcode]);

    const TdOne = doc.struct('TD');
    tableBodyRow.add(TdOne);
    const TdOneContent = doc.markStructureContent('TD');
    TdOne.add(TdOneContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + MARGIN_OFFSET, yPos - MARGIN_OFFSET, SECTION_4_COL1_WIDTH, dataRowHeight, data.facilityName);
    TdOne.end();

    const TdTwo = doc.struct('TD');
    tableBodyRow.add(TdTwo);
    const TdTwoContent = doc.markStructureContent('TD');
    TdTwo.add(TdTwoContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + SECTION_4_COL2_X, yPos - MARGIN_OFFSET, SECTION_4_COL2_WIDTH, dataRowHeight, sfAddress);
    TdTwo.end();

    const TdThree = doc.struct('TD');
    tableBodyRow.add(TdThree);
    const TdThreeContent = doc.markStructureContent('TD');
    TdThree.add(TdThreeContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + SECTION_4_COL3_X, yPos - MARGIN_OFFSET, SECTION_4_COL3_WIDTH, dataRowHeight, data.facilityApprovalNumber);
    TdThree.end();

    const TdFourSubOne = doc.struct('TD');
    tableBodyRow.add(TdFourSubOne);
    const TdFourSubOneContent = doc.markStructureContent('TD');
    TdFourSubOne.add(TdFourSubOneContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + SECTION_4_COL4_X, yPos - MARGIN_OFFSET, SECTION_4_SUBROW_COL_WIDTH, dataRowHeight, data.facilityStorage === "Chilled" ? "Chilled" : "");
    TdFourSubOne.end();

    const TdFourSubTwo = doc.struct('TD');
    tableBodyRow.add(TdFourSubTwo);
    const TdFourSubTwoContent = doc.markStructureContent('TD');
    TdFourSubTwo.add(TdFourSubTwoContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + SECTION_4_SUBROW_COL2_X, yPos - MARGIN_OFFSET, SECTION_4_SUBROW_COL_WIDTH, dataRowHeight, data.facilityStorage === "Frozen" ? "Frozen" : "");
    TdFourSubTwo.end();

    const TdFourSubThree = doc.struct('TD');
    tableBodyRow.add(TdFourSubThree);
    const TdFourSubThreeContent = doc.markStructureContent('TD');
    TdFourSubThree.add(TdFourSubThreeContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + SECTION_4_SUBROW_COL3_X, yPos - MARGIN_OFFSET, SECTION_4_SUBROW_COL_WIDTH, dataRowHeight, data.facilityStorage === "Other" ? "Other" : "");
    TdFourSubThree.end();
};

const section4 = (doc, data, startY) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '4.    Storage facility details');
    }));
    let yPos = startY + TITLE_OFFSET;
    const cellHeight = PdfStyle.ROW.HEIGHT * SECTION_4_HEADER_MULTIPLIER;
    const dataRowHeight = PdfStyle.ROW.HEIGHT * SECTION_4_DATA_MULTIPLIER;
    const subCellHeight = PdfStyle.ROW.HEIGHT;

    const myTable = doc.struct('Table');
    doc.addStructure(myTable);

    createSection4TableHeaders(doc, myTable, yPos, cellHeight, subCellHeight);

    const tableBody = doc.struct('TBody');
    myTable.add(tableBody);

    const tableBodyRow = doc.struct('TR');
    tableBody.add(tableBodyRow);

    yPos += cellHeight;

    createSection4TableRow(doc, tableBodyRow, yPos, dataRowHeight, data);

    tableBodyRow.end();
    doc.endMarkedContent();
    tableBody.end();
    myTable.end();

    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.separator(doc, yPos + dataRowHeight + SEPARATOR_OFFSET_AFTER_CELL);
    }));
};

const createSection8TableHeaders = (doc, myTable, yPos) => {
    const myTableHead = doc.struct('THead');
    myTable.add(myTableHead);

    const myTableHeadRow = doc.struct('TR');
    myTableHead.add(myTableHeadRow);

    const myTableHeadOne = doc.struct('TH');
    myTableHeadRow.add(myTableHeadOne);
    const myTableHeadOneContent = doc.markStructureContent('TH');
    myTableHeadOne.add(myTableHeadOneContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SECTION_8_COL1_X, yPos, SECTION_8_COL1_WIDTH, PdfStyle.ROW.HEIGHT, 'Name and Address');
    myTableHeadOne.end();

    const myTableHeadTwo = doc.struct('TH');
    myTableHeadRow.add(myTableHeadTwo);
    const myTableHeadTwoContent = doc.markStructureContent('TH');
    myTableHeadTwo.add(myTableHeadTwoContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SECTION_8_COL2_X, yPos, SECTION_8_COL2_WIDTH, PdfStyle.ROW.HEIGHT, 'Validation');
    myTableHeadTwo.end();

    const myTableHeadThree = doc.struct('TH');
    myTableHeadRow.add(myTableHeadThree);
    const myTableHeadThreeContent = doc.markStructureContent('TH');
    myTableHeadThree.add(myTableHeadThreeContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SECTION_8_COL3_X, yPos, SECTION_8_COL3_WIDTH, PdfStyle.ROW.HEIGHT, 'Date Issued');
    myTableHeadThree.end();

    myTableHeadRow.end();
    myTableHead.end();
};

const createSection8TableRow = (doc, tableBody, yPos, cellHeight, isSample, buff, startY) => {
    const tableBodyRow = doc.struct('TR');
    tableBody.add(tableBodyRow);

    const TdOne = doc.struct('TD');
    tableBodyRow.add(TdOne);
    const TdOneContent = doc.markStructureContent('TD');
    TdOne.add(TdOneContent);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SECTION_8_COL1_X, yPos, SECTION_8_COL1_WIDTH, cellHeight, ['Illegal Unreported and Unregulated (IUU) Fishing Team,',
        'Marine Management Organisation,', 'Tyneside House, Skinnerburn Rd,', 'Newcastle upon Tyne. NE4 7AR', 'United Kingdom',
        'Tel: 0300 123 1032',
        'Email: ukiuuslo@marinemanagement.org.uk']);
    TdOne.end();

    const TdTwo = doc.struct('TD');
    tableBodyRow.add(TdTwo);
    const TdTwoContent = doc.markStructureContent('TD');
    TdTwo.add(TdTwoContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SECTION_8_COL2_X, yPos, SECTION_8_COL2_WIDTH, cellHeight);
    TdTwo.end();

    if (!isSample) {
        PdfUtils.qrCode(doc, buff, PdfStyle.MARGIN.LEFT + SECTION_8_QR_CODE_X, startY + SECTION_8_QR_CODE_Y_OFFSET);
    }

    const TdThree = doc.struct('TD');
    tableBodyRow.add(TdThree);
    const TdThreeContent = doc.markStructureContent('TD');
    TdThree.add(TdThreeContent);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SECTION_8_COL3_X, yPos, SECTION_8_COL3_WIDTH, cellHeight, PdfUtils.todaysDate());
    TdThree.end();

    tableBodyRow.end();
};

const section8 = (doc, isSample, buff, startY) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '8.    Declaration by the competent authority');
    }));
    let yPos = startY + SECTION_8_Y_OFFSET;
    const cellHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_5 + SECTION_8_CELL_HEIGHT_PADDING;

    const infoText = 'I hereby declare that the information provided in this document is correct and that the products concerned did not undergo operations other than unloading, reloading or any operation designed to preserve them in good and genuine condition, and remained under the surveillance of the declaring authority.';
    doc.addStructure(doc.struct('P', () => {
        doc.font(PdfStyle.FONT.REGULAR).fontSize(PdfStyle.FONT_SIZE.SMALL);
        doc.text(infoText, PdfStyle.MARGIN.LEFT, startY + SECTION_8_INFO_TEXT_Y_OFFSET, { width: SECTION_8_INFO_TEXT_WIDTH });
    }));

    const myTable = doc.struct('Table');
    doc.addStructure(myTable);

    createSection8TableHeaders(doc, myTable, yPos);

    yPos += PdfStyle.ROW.HEIGHT;

    const tableBody = doc.struct('TBody');
    myTable.add(tableBody);

    createSection8TableRow(doc, tableBody, yPos, cellHeight, isSample, buff, startY);

    doc.endMarkedContent();
    tableBody.end();
    myTable.end();

    yPos += cellHeight + SEPARATOR_SPACING;
    doc.addStructure(doc.struct('P', () => {
        doc.font(PdfStyle.FONT.REGULAR);
        doc.fontSize(PdfStyle.FONT_SIZE.SMALL);
        doc.text('Validated by the appropriate competent authority (MMO, Scottish Ministers, Welsh Ministers, Department of Agriculture, Environment and Rural Affairs for Northern Ireland, Marine Resources, Growth and Housing and Environment for Jersey, Sea Fisheries, Committee for Economic Development for Guernsey and Department Environment, Food and Agriculture for the Isle of Man) in accordance with article 15 of Council Regulation (EU) 1005/2008 (as retained under s.3(1) European Union (Withdrawal) Act 2018)', PdfStyle.MARGIN.LEFT + SECTION_8_FOOTER_TEXT_X, yPos);
    }));
};

const section7 = (doc, data, startY, dateOfSubmission) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '7.    Exporter details');
    }));
    let yPos = startY + TITLE_OFFSET;
    const cellHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_3_5;

    const myTable = doc.struct('Table');
    doc.addStructure(myTable);

    const myTableHead = doc.struct('THead');
    myTable.add(myTableHead);

    const myTableHeadRow = doc.struct('TR');
    myTableHead.add(myTableHeadRow);

    const myTableHeadOne = doc.struct('TH');
    myTableHeadRow.add(myTableHeadOne);
    const myTableHeadOneContent = doc.markStructureContent('TH');
    myTableHeadOne.add(myTableHeadOneContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + MARGIN_OFFSET, yPos, SECTION_7_COL1_WIDTH, cellHeight, 'Company name');
    myTableHeadOne.end();

    const myTableHeadTwo = doc.struct('TH');
    myTableHeadRow.add(myTableHeadTwo);
    const myTableHeadTwoContent = doc.markStructureContent('TH');
    myTableHeadTwo.add(myTableHeadTwoContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SECTION_7_COL2_X, yPos, SECTION_7_COL2_WIDTH, cellHeight, 'Address');
    myTableHeadTwo.end();

    const myTableHeadThree = doc.struct('TH');
    myTableHeadRow.add(myTableHeadThree);
    const myTableHeadThreeContent = doc.markStructureContent('TH');
    myTableHeadThree.add(myTableHeadThreeContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SECTION_7_COL3_X, yPos, SECTION_7_COL3_WIDTH, cellHeight, 'Date of submission of this\ndocument by exporter to the\ncompetent authority');
    myTableHeadThree.end();

    myTableHeadRow.end();
    myTableHead.end();

    const tableBody = doc.struct('TBody');
    myTable.add(tableBody);

    const tableBodyRow = doc.struct('TR');
    tableBody.add(tableBodyRow);

    const TdOne = doc.struct('TD');
    tableBodyRow.add(TdOne);
    const TdOneContent = doc.markStructureContent('TD');
    TdOne.add(TdOneContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + MARGIN_OFFSET, yPos + cellHeight, SECTION_7_COL1_WIDTH, PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_4, data.exporter.exporterCompanyName);
    TdOne.end();

    const TdTwo = doc.struct('TD');
    tableBodyRow.add(TdTwo);
    const TdTwoContent = doc.markStructureContent('TD');
    TdTwo.add(TdTwoContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + SECTION_7_COL2_X, yPos + cellHeight, SECTION_7_COL2_WIDTH, PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_4, formatAddress(data.exporter));
    TdTwo.end();

    const TdThree = doc.struct('TD');
    tableBodyRow.add(TdThree);
    const TdThreeContent = doc.markStructureContent('TD');
    TdThree.add(TdThreeContent);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SECTION_7_COL3_X, yPos + cellHeight, SECTION_7_COL3_WIDTH, PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_4, dateOfSubmission);
    TdThree.end();

    tableBodyRow.end();
    doc.endMarkedContent();
    tableBody.end();
    myTable.end();

    yPos += cellHeight + PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_4 + SPACING_SMALL;

    doc.addStructure(doc.struct('P', () => {
        doc.text('* Date of acceptance by exporter of the veracity of the contents of this document', PdfStyle.MARGIN.LEFT + CONSIGNMENT_PADDING_X, yPos);
    }));

    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT + SECTION_7_ADDITIONAL_SPACING);
    }));
};

const section1 = (doc, data, isSample, startY) => {
    const documentNumber = isSample ? '###-####-##-#########' : data.documentNumber;

    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        doc.lineWidth(SECTION_1_LINE_WIDTH_THICK);
        doc.moveTo(PdfStyle.MARGIN.LEFT, startY + SECTION_1_TOP_LINE_OFFSET).lineTo(SECTION_1_SPACING, startY + SECTION_1_TOP_LINE_OFFSET).stroke();
    }));

    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT, startY + SECTION_1_LABEL_OFFSET, 'Document Number');
    }));
    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SECTION_1_FIELD_OFFSET_X, startY + SECTION_1_FIELD_OFFSET_Y, SECTION_1_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, documentNumber);
    }));

    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.label(doc, SECTION_1_DECLARING_AUTHORITY_X, startY + SECTION_1_LABEL_OFFSET, 'Declaring Authority');
    }));
    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SECTION_4_COL4_X, startY + SECTION_1_DECLARING_AUTHORITY_Y, SECTION_1_DECLARING_AUTHORITY_WIDTH, PdfStyle.ROW.HEIGHT, 'Marine Management Organisation');
    }));
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + SECTION_1_NAME_Y, '1.    Name');
    }));
    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SECTION_1_NAME_FIELD_X, startY + SECTION_1_NAME_FIELD_Y, SECTION_1_NAME_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, 'Illegal Unreported and Unregulated (IUU) Fishing Team');
    }));

    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + SECTION_1_ADDRESS_LABEL_X, startY + SECTION_1_ADDRESS_LABEL_Y, 'Address');
    }));
    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SECTION_1_ADDRESS_FIELD_X, startY + SECTION_1_ADDRESS_FIELD_Y, SECTION_1_ADDRESS_FIELD_WIDTH, PdfStyle.ROW.HEIGHT * SECTION_1_ADDRESS_FIELD_HEIGHT_MULTIPLIER + SPACING_SMALL, 'Tyneside House, Skinnerburn Rd, Newcastle upon Tyne, United Kingdom. NE4 7AR');
    }));

    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + SECTION_1_ADDRESS_FIELD_X, startY + SECTION_1_TEL_LABEL_Y, 'Tel.');
    }));
    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SECTION_1_TEL_FIELD_X, startY + SECTION_1_TEL_FIELD_Y, SECTION_1_TEL_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, '0300 123 1032');
    }));

    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + SECTION_1_EMAIL_LABEL_X, startY + SECTION_1_EMAIL_LABEL_Y, 'Email');
    }));
    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SECTION_1_EMAIL_FIELD_X, startY + SECTION_1_EMAIL_FIELD_Y, SECTION_1_EMAIL_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, 'ukiuuslo@marinemanagement.org.uk');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        doc.lineWidth(SECTION_1_LINE_WIDTH_THIN);
        doc.moveTo(0, startY + SECTION_1_BOTTOM_LINE_Y).lineTo(SECTION_1_BOTTOM_LINE_X_END, startY + SECTION_1_BOTTOM_LINE_Y).dash(SECTION_1_LINE_DASH_SIZE, {space: SECTION_1_LINE_SPACE}).stroke();
    }));
};

module.exports = { section1, section4, section7, section8 };
