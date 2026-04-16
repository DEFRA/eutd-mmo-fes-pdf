const moment = require('moment');
const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const {
    DATE_FORMAT_DDMMYYYY,
    isMultiVessel,
    getDescOfProductRows,
    getProductScheduleRows,
    getExportWeightText,
    getImoOrCfr,
    getFishingGear,
} = require('./renderExportCert-data');
const {
    createSection3HeaderCell,
    createSection3DataCell,
    getSection3RowData,
} = require('./renderExportCert-mvs-cells');

// Used in section8 which also references this constant value
const SECTION2_SEPARATOR_OFFSET_Y = 137;

const renderSection3HeaderAndField = (doc, startY) => {
    const LABEL_OFFSET_X = 15;
    const LABEL_OFFSET_Y = 14;
    const FIELD_OFFSET_Y = 26;
    const FIELD_WIDTH = 515;

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '3    Description of Product:');
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + LABEL_OFFSET_X, startY + LABEL_OFFSET_Y, 'Type of processing authorised on board:');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + LABEL_OFFSET_X, startY + FIELD_OFFSET_Y, FIELD_WIDTH, PdfStyle.ROW.HEIGHT);
    }));
};

const renderSection3TableHeader = (doc, tableHeadRow, startY, cellHeight) => {
    const TABLE_OFFSET_Y = 48;
    const SPECIES_COL_OFFSET = 15;
    const SPECIES_COL_WIDTH = 110;
    const PRODUCT_CODE_COL_OFFSET = 125;
    const PRODUCT_CODE_COL_WIDTH = 55;
    const CATCH_AREA_COL_OFFSET = 180;
    const CATCH_AREA_COL_WIDTH = 80;
    const CATCH_DATE_COL_OFFSET = 260;
    const CATCH_DATE_COL_WIDTH = 80;
    const ESTIMATED_WEIGHT_COL_OFFSET = 340;
    const ESTIMATED_WEIGHT_COL_WIDTH = 55;
    const NET_CATCH_WEIGHT_COL_OFFSET = 395;
    const NET_CATCH_WEIGHT_COL_WIDTH = 55;
    const VERIFIED_WEIGHT_COL_OFFSET = 450;
    const VERIFIED_WEIGHT_COL_WIDTH = 80;

    createSection3HeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + SPECIES_COL_OFFSET, startY + TABLE_OFFSET_Y, SPECIES_COL_WIDTH, cellHeight, 'Species');
    createSection3HeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + PRODUCT_CODE_COL_OFFSET, startY + TABLE_OFFSET_Y, PRODUCT_CODE_COL_WIDTH, cellHeight, 'Product Code');
    createSection3HeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + CATCH_AREA_COL_OFFSET, startY + TABLE_OFFSET_Y, CATCH_AREA_COL_WIDTH, cellHeight, ['Catch Area(s)', '(Catch Area,', 'EEZ, RFMO,', 'High Seas)']);
    createSection3HeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + CATCH_DATE_COL_OFFSET, startY + TABLE_OFFSET_Y, CATCH_DATE_COL_WIDTH, cellHeight, ['Catch Date(s)', '(from - to)']);
    createSection3HeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + ESTIMATED_WEIGHT_COL_OFFSET, startY + TABLE_OFFSET_Y, ESTIMATED_WEIGHT_COL_WIDTH, cellHeight, 'Estimated weight to be landed in kg');
    createSection3HeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + NET_CATCH_WEIGHT_COL_OFFSET, startY + TABLE_OFFSET_Y, NET_CATCH_WEIGHT_COL_WIDTH, cellHeight, 'Net catch weight in kg');
    createSection3HeaderCell(doc, tableHeadRow, PdfStyle.MARGIN.LEFT + VERIFIED_WEIGHT_COL_OFFSET, startY + TABLE_OFFSET_Y, VERIFIED_WEIGHT_COL_WIDTH, cellHeight, 'Verified weight landed (net catch weight in kg)');
};

const renderSection3TableBody = (doc, tableBody, startY, cellHeight, rowData, arrLength, allRowsLength) => {
    const TABLE_OFFSET_Y = 48;
    const SPECIES_COL_OFFSET = 15;
    const SPECIES_COL_WIDTH = 110;
    const PRODUCT_CODE_COL_OFFSET = 125;
    const PRODUCT_CODE_COL_WIDTH = 55;
    const CATCH_AREA_COL_OFFSET = 180;
    const CATCH_AREA_COL_WIDTH = 80;
    const CATCH_DATE_COL_OFFSET = 260;
    const CATCH_DATE_COL_WIDTH = 80;
    const ESTIMATED_WEIGHT_COL_OFFSET = 340;
    const ESTIMATED_WEIGHT_COL_WIDTH = 55;
    const NET_CATCH_WEIGHT_COL_OFFSET = 395;
    const NET_CATCH_WEIGHT_COL_WIDTH = 55;
    const VERIFIED_WEIGHT_COL_OFFSET = 450;
    const VERIFIED_WEIGHT_COL_WIDTH = 80;
    const ROW_HEIGHT_ADDITION = 30;
    const ROW_INCREMENT = 30;
    const LIST_LIMIT = 6;
    const CATCH_AREA_LINE_SPACING = 4;
    const CATCH_DATE_LINE_SPACING = 2;
    const SEE_SCHEDULE_CELL_HEIGHT_MULTIPLIER = 6;
    const FIELD_WIDTH = 515;

    let y = startY + TABLE_OFFSET_Y + cellHeight;
    let listLimit = LIST_LIMIT;
    if (arrLength > LIST_LIMIT) {
        listLimit = 0;
    }

    for (let rowIdx = 0; rowIdx < listLimit; rowIdx++) {
        const tableBodyRow = doc.struct('TR');
        tableBody.add(tableBodyRow);

        const hasData = rowIdx < arrLength;
        const rowCellData = getSection3RowData(rowIdx, arrLength, rowData, hasData);

        createSection3DataCell(doc, tableBodyRow, { x: PdfStyle.MARGIN.LEFT + SPECIES_COL_OFFSET, y, width: SPECIES_COL_WIDTH, height: PdfStyle.ROW.HEIGHT + ROW_HEIGHT_ADDITION, content: rowCellData.speciesText, lineSpacing: 2 });
        createSection3DataCell(doc, tableBodyRow, { x: PdfStyle.MARGIN.LEFT + PRODUCT_CODE_COL_OFFSET, y, width: PRODUCT_CODE_COL_WIDTH, height: PdfStyle.ROW.HEIGHT + ROW_HEIGHT_ADDITION, content: rowCellData.commodityCodeText });
        createSection3DataCell(doc, tableBodyRow, { x: PdfStyle.MARGIN.LEFT + CATCH_AREA_COL_OFFSET, y, width: CATCH_AREA_COL_WIDTH, height: PdfStyle.ROW.HEIGHT + ROW_HEIGHT_ADDITION, content: rowCellData.catchAreasText, lineSpacing: CATCH_AREA_LINE_SPACING });
        createSection3DataCell(doc, tableBodyRow, { x: PdfStyle.MARGIN.LEFT + CATCH_DATE_COL_OFFSET, y, width: CATCH_DATE_COL_WIDTH, height: PdfStyle.ROW.HEIGHT + ROW_HEIGHT_ADDITION, content: rowCellData.datesText, lineSpacing: CATCH_DATE_LINE_SPACING });
        createSection3DataCell(doc, tableBodyRow, { x: PdfStyle.MARGIN.LEFT + ESTIMATED_WEIGHT_COL_OFFSET, y, width: ESTIMATED_WEIGHT_COL_WIDTH, height: PdfStyle.ROW.HEIGHT + ROW_HEIGHT_ADDITION, content: '' });
        createSection3DataCell(doc, tableBodyRow, { x: PdfStyle.MARGIN.LEFT + NET_CATCH_WEIGHT_COL_OFFSET, y, width: NET_CATCH_WEIGHT_COL_WIDTH, height: PdfStyle.ROW.HEIGHT + ROW_HEIGHT_ADDITION, content: rowCellData.exportWeightText });
        createSection3DataCell(doc, tableBodyRow, { x: PdfStyle.MARGIN.LEFT + VERIFIED_WEIGHT_COL_OFFSET, y, width: VERIFIED_WEIGHT_COL_WIDTH, height: PdfStyle.ROW.HEIGHT + ROW_HEIGHT_ADDITION, content: '' });

        tableBodyRow.end();
        y += PdfStyle.ROW.HEIGHT + ROW_INCREMENT;
    }

    if (arrLength > LIST_LIMIT) {
        const seeScheduleCellHeight = PdfStyle.ROW.HEIGHT * SEE_SCHEDULE_CELL_HEIGHT_MULTIPLIER;
        const seeScheduleRow = doc.struct('TR', () => {
            PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SPECIES_COL_OFFSET, y, FIELD_WIDTH, seeScheduleCellHeight, `SEE SCHEDULE (${allRowsLength} rows)`);
        });
        tableBody.add(seeScheduleRow);
        seeScheduleRow.end();
    }
};

const section3 = (doc, data, startY) => {
    const CELL_HEIGHT_MULTIPLIER = 3;
    const SEPARATOR_OFFSET_Y = 388;

    renderSection3HeaderAndField(doc, startY);

    const cellHeight = PdfStyle.ROW.HEIGHT * CELL_HEIGHT_MULTIPLIER;
    const rowData = getDescOfProductRows(data.exportPayload);
    const arrLength = rowData.length;
    const allRowsLength = getProductScheduleRows(data.exportPayload).length;

    const myTable = doc.struct('Table');
    doc.addStructure(myTable);

    const tableHead = doc.struct('THead');
    myTable.add(tableHead);

    const tableHeadRow = doc.struct('TR');
    tableHead.add(tableHeadRow);

    renderSection3TableHeader(doc, tableHeadRow, startY, cellHeight);

    tableHeadRow.end();
    tableHead.end();

    const tableBody = doc.struct('TBody');
    myTable.add(tableBody);

    renderSection3TableBody(doc, tableBody, startY, cellHeight, rowData, arrLength, allRowsLength);

    tableBody.end();
    myTable.end();
    PdfUtils.separator(doc, startY + SEPARATOR_OFFSET_Y);
};

const getVesselNameField = (vesselCounts, items) => {
    const vesselCount = Object.keys(vesselCounts).length;
    if (vesselCount === 1) {
        return items[0].landings[0].model.vessel.vesselName;
    } else if (vesselCount > 1) {
        return 'Multiple vessels - SEE SCHEDULE';
    } else {
        return '';
    }
};

const getSingleVesselDetails = (vesselCounts, items) => {
    if (Object.keys(vesselCounts).length !== 1) {
        return { pln: '', homePortAndFlag: '', licenceNumber: '', licenceValidTo: '' };
    }

    const vessel = items[0].landings[0].model.vessel;
    let licenceValidTo = '';
    if (vessel.licenceValidTo) {
        licenceValidTo = moment(vessel.licenceValidTo, 'YYYY-MM-DD[T]HH:mm:ss').format(DATE_FORMAT_DDMMYYYY);
    }

    return {
        pln: vessel.pln,
        homePortAndFlag: `${vessel.flag} - ${vessel.homePort}`,
        licenceNumber: vessel.licenceNumber,
        licenceValidTo: licenceValidTo
    };
};

const renderSection2VesselNameAndPort = (doc, vesselCounts, items, vesselDetails, startY) => {
    const VESSEL_NAME_LABEL_OFFSET_Y = 4;
    const VESSEL_NAME_FIELD_OFFSET_X = 120;
    const VESSEL_NAME_FIELD_OFFSET_Y = 2;
    const VESSEL_NAME_FIELD_WIDTH = 155;

    const FLAG_PORT_LABEL_OFFSET_X = 285;
    const FLAG_PORT_LABEL_OFFSET_Y = 4;
    const FLAG_PORT_FIELD_OFFSET_X = 400;
    const FLAG_PORT_FIELD_OFFSET_Y = 2;
    const FLAG_PORT_FIELD_WIDTH = 130;

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + VESSEL_NAME_LABEL_OFFSET_Y, '2    Fishing Vessel Name:');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + VESSEL_NAME_FIELD_OFFSET_X, startY + VESSEL_NAME_FIELD_OFFSET_Y, VESSEL_NAME_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, getVesselNameField(vesselCounts, items));
    }));

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + FLAG_PORT_LABEL_OFFSET_X, startY + FLAG_PORT_LABEL_OFFSET_Y, 'Flag - Home Port');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + FLAG_PORT_FIELD_OFFSET_X, startY + FLAG_PORT_FIELD_OFFSET_Y, FLAG_PORT_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, vesselDetails.homePortAndFlag);
    }));
};

const renderSection2CallSignAndImo = (doc, vesselCounts, data, vesselDetails, startY) => {
    const CALL_SIGN_LABEL_OFFSET_X = 15;
    const CALL_SIGN_LABEL_OFFSET_Y = 29;
    const CALL_SIGN_FIELD_OFFSET_X = 120;
    const CALL_SIGN_FIELD_OFFSET_Y = 27;
    const CALL_SIGN_FIELD_WIDTH = 155;

    const IMO_LABEL_OFFSET_X = 285;
    const IMO_LABEL_LINE1_OFFSET_Y = 18;
    const IMO_LABEL_LINE2_OFFSET_Y = 30;
    const IMO_LABEL_LINE3_OFFSET_Y = 42;
    const IMO_FIELD_OFFSET_X = 400;
    const IMO_FIELD_OFFSET_Y = 26;
    const IMO_FIELD_WIDTH = 130;

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + CALL_SIGN_LABEL_OFFSET_X, startY + CALL_SIGN_LABEL_OFFSET_Y, 'Call Sign / PLN');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + CALL_SIGN_FIELD_OFFSET_X, startY + CALL_SIGN_FIELD_OFFSET_Y, CALL_SIGN_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, vesselDetails.pln);
    }));

    const imoNumberOrCfr = getImoOrCfr(vesselCounts, data);
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + IMO_LABEL_OFFSET_X, startY + IMO_LABEL_LINE1_OFFSET_Y, 'IMO number or other');
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + IMO_LABEL_OFFSET_X, startY + IMO_LABEL_LINE2_OFFSET_Y, 'unique vessel identifier');
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + IMO_LABEL_OFFSET_X, startY + IMO_LABEL_LINE3_OFFSET_Y, '(if applicable)');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + IMO_FIELD_OFFSET_X, startY + IMO_FIELD_OFFSET_Y, IMO_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, imoNumberOrCfr);
    }));
};

const renderSection2LicenceAndGear = (doc, data, vesselDetails, startY) => {
    const LICENCE_LABEL_OFFSET_X = 15;
    const LICENCE_LABEL_OFFSET_Y = 54;
    const LICENCE_FIELD_OFFSET_X = 120;
    const LICENCE_FIELD_OFFSET_Y = 52;
    const LICENCE_FIELD_WIDTH = 220;

    const VALID_UNTIL_LABEL_OFFSET_X = 350;
    const VALID_UNTIL_LABEL_OFFSET_Y = 54;
    const VALID_UNTIL_FIELD_OFFSET_X = 400;
    const VALID_UNTIL_FIELD_OFFSET_Y = 52;
    const VALID_UNTIL_FIELD_WIDTH = 130;

    const GEAR_LABEL_OFFSET_X = 15;
    const GEAR_LABEL_OFFSET_Y = 77;
    const GEAR_FIELD_OFFSET_X = 120;
    const GEAR_FIELD_OFFSET_Y = 77;
    const GEAR_FIELD_WIDTH = 410;

    const MOBILE_LABEL_OFFSET_X = 15;
    const MOBILE_LABEL_OFFSET_Y = 100;
    const MOBILE_FIELD_OFFSET_X = 15;
    const MOBILE_FIELD_OFFSET_Y = 112;
    const MOBILE_FIELD_WIDTH = 515;

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + LICENCE_LABEL_OFFSET_X, startY + LICENCE_LABEL_OFFSET_Y, 'Fishing Licence No.');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + LICENCE_FIELD_OFFSET_X, startY + LICENCE_FIELD_OFFSET_Y, LICENCE_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, vesselDetails.licenceNumber || '');
    }));

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + VALID_UNTIL_LABEL_OFFSET_X, startY + VALID_UNTIL_LABEL_OFFSET_Y, 'Valid until');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + VALID_UNTIL_FIELD_OFFSET_X, startY + VALID_UNTIL_FIELD_OFFSET_Y, VALID_UNTIL_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, vesselDetails.licenceValidTo || '');
    }));

    const fishingGearText = isMultiVessel(data.exportPayload) ? 'Multiple vessels - SEE SCHEDULE' : getFishingGear(data.exportPayload);

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + GEAR_LABEL_OFFSET_X, startY + GEAR_LABEL_OFFSET_Y, 'Fishing Gear');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + GEAR_FIELD_OFFSET_X, startY + GEAR_FIELD_OFFSET_Y, GEAR_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, fishingGearText ?? '');
    }));

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + MOBILE_LABEL_OFFSET_X, startY + MOBILE_LABEL_OFFSET_Y, 'Mobile satellite service no Telefax no Telephone no E-mail address (if issued)');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + MOBILE_FIELD_OFFSET_X, startY + MOBILE_FIELD_OFFSET_Y, MOBILE_FIELD_WIDTH, PdfStyle.ROW.HEIGHT);
    }));
};

const section2 = (doc, data, startY) => {
    const SEPARATOR_OFFSET_Y = SECTION2_SEPARATOR_OFFSET_Y;

    const vesselCounts = {};
    let items = [];
    if (data.exportPayload?.items) {
        items = data.exportPayload.items;
    }

    if (items.length > 0) {
        items.forEach((item) => {
            item.landings.forEach((landing) => {
                vesselCounts[landing.model.vessel.vesselName + landing.model.vessel.pln + landing.model.vessel.licenceNumber] = (vesselCounts[landing.model.vessel.vesselName + landing.model.vessel.pln + landing.model.vessel.licenceNumber] || 0) + 1;
            })
        });
    }

    const vesselDetails = getSingleVesselDetails(vesselCounts, items);

    renderSection2VesselNameAndPort(doc, vesselCounts, items, vesselDetails, startY);
    renderSection2CallSignAndImo(doc, vesselCounts, data, vesselDetails, startY);
    renderSection2LicenceAndGear(doc, data, vesselDetails, startY);

    PdfUtils.separator(doc, startY + SEPARATOR_OFFSET_Y);
};

const renderSection1Header = (doc, startY) => {
    const HEADER_LINE_WIDTH = 2;
    const HEADER_LINE_START_X = 153;
    const HEADER_LINE_END_X = 560;
    const HEADER_LINE_OFFSET_Y = 4;

    doc.fontSize(PdfStyle.FONT_SIZE.MEDIUM);
    doc.addStructure(doc.struct('H3', {}, () => {
        doc.text('(i) CATCH CERTIFICATE', PdfStyle.MARGIN.LEFT, startY);
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        doc.lineWidth(HEADER_LINE_WIDTH);
        doc.moveTo(HEADER_LINE_START_X, startY + HEADER_LINE_OFFSET_Y).lineTo(HEADER_LINE_END_X, startY + HEADER_LINE_OFFSET_Y).stroke();
    }));
};

const renderSection1DocumentAndAuthority = (doc, data, isSample, startY) => {
    const DOC_NUMBER_LABEL_OFFSET_Y = 20;
    const DOC_NUMBER_FIELD_OFFSET_X = 95;
    const DOC_NUMBER_FIELD_OFFSET_Y = 18;
    const DOC_NUMBER_FIELD_WIDTH = 160;

    const VALIDATING_AUTH_LABEL_X = 300;
    const VALIDATING_AUTH_LABEL_OFFSET_Y = 20;
    const VALIDATING_AUTH_FIELD_OFFSET_X = 380;
    const VALIDATING_AUTH_FIELD_OFFSET_Y = 18;
    const VALIDATING_AUTH_FIELD_WIDTH = 150;

    let documentNumber = '';
    if (!data.isBlankTemplate) {
        if (isSample) {
            documentNumber = '###-####-##-#########';
        } else {
            documentNumber = data.documentNumber;
        }
    }

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT, startY + DOC_NUMBER_LABEL_OFFSET_Y, 'Document Number');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + DOC_NUMBER_FIELD_OFFSET_X, startY + DOC_NUMBER_FIELD_OFFSET_Y, DOC_NUMBER_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, documentNumber);
    }));

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, VALIDATING_AUTH_LABEL_X, startY + VALIDATING_AUTH_LABEL_OFFSET_Y, 'Validating Authority');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + VALIDATING_AUTH_FIELD_OFFSET_X, startY + VALIDATING_AUTH_FIELD_OFFSET_Y, VALIDATING_AUTH_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, 'Marine Management Organisation');
    }));
};

const renderSection1ContactDetails = (doc, startY) => {
    const NAME_LABEL_OFFSET_Y = 40;
    const NAME_FIELD_OFFSET_X = 65;
    const NAME_FIELD_OFFSET_Y = 38;
    const NAME_FIELD_WIDTH = 465;

    const ADDRESS_LABEL_OFFSET_X = 15;
    const ADDRESS_LABEL_OFFSET_Y = 60;
    const ADDRESS_FIELD_OFFSET_X = 65;
    const ADDRESS_FIELD_OFFSET_Y = 58;
    const ADDRESS_FIELD_WIDTH = 465;
    const ADDRESS_FIELD_HEIGHT_MULTIPLIER = 2;
    const ADDRESS_FIELD_HEIGHT_ADJUSTMENT = 5;

    const TEL_LABEL_OFFSET_X = 65;
    const TEL_LABEL_OFFSET_Y = 100;
    const TEL_FIELD_OFFSET_X = 90;
    const TEL_FIELD_OFFSET_Y = 98;
    const TEL_FIELD_WIDTH = 200;

    const EMAIL_LABEL_OFFSET_X = 300;
    const EMAIL_LABEL_OFFSET_Y = 100;
    const EMAIL_FIELD_OFFSET_X = 330;
    const EMAIL_FIELD_OFFSET_Y = 98;
    const EMAIL_FIELD_WIDTH = 200;

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + NAME_LABEL_OFFSET_Y, '1    Name:');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + NAME_FIELD_OFFSET_X, startY + NAME_FIELD_OFFSET_Y, NAME_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, 'Illegal Unreported and Unregulated (IUU) Fishing Team');
    }));

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + ADDRESS_LABEL_OFFSET_X, startY + ADDRESS_LABEL_OFFSET_Y, 'Address');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + ADDRESS_FIELD_OFFSET_X, startY + ADDRESS_FIELD_OFFSET_Y, ADDRESS_FIELD_WIDTH, PdfStyle.ROW.HEIGHT * ADDRESS_FIELD_HEIGHT_MULTIPLIER + ADDRESS_FIELD_HEIGHT_ADJUSTMENT, 'Tyneside House, Skinnerburn Rd, Newcastle upon Tyne, United Kingdom. NE4 7AR');
    }));

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + TEL_LABEL_OFFSET_X, startY + TEL_LABEL_OFFSET_Y, 'Tel.');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + TEL_FIELD_OFFSET_X, startY + TEL_FIELD_OFFSET_Y, TEL_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, '0300 123 1032');
    }));

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + EMAIL_LABEL_OFFSET_X, startY + EMAIL_LABEL_OFFSET_Y, 'Email');
    }));
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + EMAIL_FIELD_OFFSET_X, startY + EMAIL_FIELD_OFFSET_Y, EMAIL_FIELD_WIDTH, PdfStyle.ROW.HEIGHT, 'ukiuuslo@marinemanagement.org.uk');
    }));
};

const section1 = (doc, data, isSample, startY) => {
    const SEPARATOR_OFFSET_Y = 123;

    renderSection1Header(doc, startY);
    renderSection1DocumentAndAuthority(doc, data, isSample, startY);
    renderSection1ContactDetails(doc, startY);
    PdfUtils.separator(doc, startY + SEPARATOR_OFFSET_Y);
};

module.exports = {
    section1,
    section2,
    section3,
    SECTION2_SEPARATOR_OFFSET_Y,
};
