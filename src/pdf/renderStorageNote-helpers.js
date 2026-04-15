/* eslint-disable no-magic-numbers */
const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const CommonUtils = require('../utils/common-utils');

const ARRIVAL_TRANSPORT_VEHICLE_KEY = 'arrivalTransport.vehicle';
const TRANSPORT_VEHICLE_KEY = 'transport.vehicle';

const addStructuredTableCell = (doc, row, structureType, cellConfig, drawCellFn) => {
    const {x, y, width, height, content} = cellConfig;
    const cell = doc.struct(structureType);
    row.add(cell);
    const cellContent = doc.markStructureContent(structureType);
    cell.add(cellContent);
    drawCellFn(doc, x, y, width, height, content);
    cell.end();
};

const renderSection8DeclarationTable = (doc, isSample, buff, startY) => {
    let yPos = startY + 50;
    const cellHeight = PdfStyle.ROW.HEIGHT * 5 + 10;

    const myTable = doc.struct('Table');
    doc.addStructure(myTable);

    const myTableHead = doc.struct('THead');
    myTable.add(myTableHead);

    const myTableHeadRow = doc.struct('TR');
    myTableHead.add(myTableHeadRow);
    addStructuredTableCell(doc, myTableHeadRow, 'TH', {x: PdfStyle.MARGIN.LEFT + 15, y: yPos, width: 235, height: PdfStyle.ROW.HEIGHT, content: 'Name and Address'}, (document, x, y, width, height, content) => PdfUtils.tableHeaderCell(document, x, y, width, height, content));
    addStructuredTableCell(doc, myTableHeadRow, 'TH', {x: PdfStyle.MARGIN.LEFT + 250, y: yPos, width: 200, height: PdfStyle.ROW.HEIGHT, content: 'Validation'}, (document, x, y, width, height, content) => PdfUtils.tableHeaderCell(document, x, y, width, height, content));
    addStructuredTableCell(doc, myTableHeadRow, 'TH', {x: PdfStyle.MARGIN.LEFT + 450, y: yPos, width: 80, height: PdfStyle.ROW.HEIGHT, content: 'Date Issued'}, (document, x, y, width, height, content) => PdfUtils.tableHeaderCell(document, x, y, width, height, content));
    myTableHeadRow.end();
    myTableHead.end();

    yPos += PdfStyle.ROW.HEIGHT;

    const tableBody = doc.struct('TBody');
    myTable.add(tableBody);

    const tableBodyRow = doc.struct('TR');
    tableBody.add(tableBodyRow);

    addStructuredTableCell(
        doc,
        tableBodyRow,
        'TD',
        {
            x: PdfStyle.MARGIN.LEFT + 15,
            y: yPos,
            width: 235,
            height: cellHeight,
            content: [
                'Illegal Unreported and Unregulated (IUU) Fishing Team,',
                'Marine Management Organisation,',
                'Tyneside House, Skinnerburn Rd,',
                'Newcastle upon Tyne. NE4 7AR',
                'United Kingdom',
                'Tel: 0300 123 1032',
                'Email: ukiuuslo@marinemanagement.org.uk'
            ]
        },
        (document, x, y, width, height, content) => PdfUtils.field(document, x, y, width, height, content)
    );
    addStructuredTableCell(doc, tableBodyRow, 'TD', {x: PdfStyle.MARGIN.LEFT + 250, y: yPos, width: 200, height: cellHeight}, (document, x, y, width, height) => PdfUtils.tableHeaderCell(document, x, y, width, height));

    if (!isSample) {
        PdfUtils.qrCode(doc, buff, PdfStyle.MARGIN.LEFT + 255, startY + 75);
    }

    addStructuredTableCell(doc, tableBodyRow, 'TD', {x: PdfStyle.MARGIN.LEFT + 450, y: yPos, width: 80, height: cellHeight, content: PdfUtils.todaysDate()}, (document, x, y, width, height, content) => PdfUtils.field(document, x, y, width, height, content));

    tableBodyRow.end();
    doc.endMarkedContent();
    tableBody.end();
    myTable.end();

    return yPos + cellHeight + 8;
};

const section8 = (doc, _data, isSample, buff, startY) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '8    Declaration by the competent authority');
    }));
    const infoText = 'I hereby declare that the information provided in this document is correct and that the products concerned did not undergo operations other than unloading, reloading or any operation designed to preserve them in good and genuine condition, and remained under the surveillance of the declaring authority.';
    doc.addStructure(doc.struct('P', () => {
        doc.font(PdfStyle.FONT.REGULAR).fontSize(PdfStyle.FONT_SIZE.SMALL);
        doc.text(infoText, PdfStyle.MARGIN.LEFT, startY + 14, { width: 520 });
    }));
    const yPos = renderSection8DeclarationTable(doc, isSample, buff, startY);
    doc.addStructure(doc.struct('P', () => {
        doc.font(PdfStyle.FONT.REGULAR);
        doc.fontSize(PdfStyle.FONT_SIZE.SMALL);
        doc.text('Validated by the appropriate competent authority (MMO, Scottish Ministers, Welsh Ministers, Department of Agriculture, Environment and Rural Affairs for Northern Ireland, Marine Resources, Growth and Housing and Environment for Jersey, Sea Fisheries, Committee for Economic Development for Guernsey and Department Environment, Food and Agriculture for the Isle of Man) in accordance with article 15 of Council Regulation (EU) 1005/2008 (as retained under s.3(1) European Union (Withdrawal) Act 2018)', PdfStyle.MARGIN.LEFT + 10, yPos);
    }));
}

const renderSection4TableHead = (doc, myTable, yPos, cellHeight, subCellHeight) => {
    const tableHead = doc.struct('THead');
    myTable.add(tableHead);

    const tableHeadRow = doc.struct('TR');
    tableHead.add(tableHeadRow);
    addStructuredTableCell(doc, tableHeadRow, 'TH', {x: PdfStyle.MARGIN.LEFT + 15, y: yPos, width: 110, height: cellHeight, content: ['Name']}, (document, x, y, width, height, content) => PdfUtils.tableHeaderCell(document, x, y, width, height, content));
    addStructuredTableCell(doc, tableHeadRow, 'TH', {x: PdfStyle.MARGIN.LEFT + 125, y: yPos, width: 145, height: cellHeight, content: 'Address'}, (document, x, y, width, height, content) => PdfUtils.tableHeaderCell(document, x, y, width, height, content));
    addStructuredTableCell(doc, tableHeadRow, 'TH', {x: PdfStyle.MARGIN.LEFT + 270, y: yPos, width: 110, height: cellHeight, content: ['Approval number', '(if applicable)']}, (document, x, y, width, height, content) => PdfUtils.tableHeaderCell(document, x, y, width, height, content));
    addStructuredTableCell(doc, tableHeadRow, 'TH', {x: PdfStyle.MARGIN.LEFT + 380, y: yPos, width: 150, height: cellHeight, content: ['Stored as', '(tick as appropriate)']}, (document, x, y, width, height, content) => PdfUtils.tableHeaderCell(document, x, y, width, height, content));
    tableHeadRow.end();

    const tableHeadSubRow = doc.struct('TR');
    tableHead.add(tableHeadSubRow);
    addStructuredTableCell(doc, tableHeadSubRow, 'TH', {x: PdfStyle.MARGIN.LEFT + 380, y: yPos + 30, width: 50, height: subCellHeight, content: 'Chilled'}, (document, x, y, width, height, content) => PdfUtils.tableHeaderCell(document, x, y, width, height, content));
    addStructuredTableCell(doc, tableHeadSubRow, 'TH', {x: PdfStyle.MARGIN.LEFT + 430, y: yPos + 30, width: 50, height: subCellHeight, content: 'Frozen'}, (document, x, y, width, height, content) => PdfUtils.tableHeaderCell(document, x, y, width, height, content));
    addStructuredTableCell(doc, tableHeadSubRow, 'TH', {x: PdfStyle.MARGIN.LEFT + 480, y: yPos + 30, width: 50, height: subCellHeight, content: 'Other'}, (document, x, y, width, height, content) => PdfUtils.tableHeaderCell(document, x, y, width, height, content));
    tableHeadSubRow.end();
    tableHead.end();
};

const renderSection4TableBody = (doc, myTable, data, yPos, cellHeight) => {
    const tableBody = doc.struct('TBody');
    myTable.add(tableBody);

    const tableBodyRow = doc.struct('TR');
    tableBody.add(tableBodyRow);

    const sfAddress = PdfUtils.constructAddress([
        data.facilityAddressOne,
        data.facilityAddressTwo,
        data.facilityTownCity,
        data.facilityPostcode
    ]);

    addStructuredTableCell(doc, tableBodyRow, 'TD', {x: PdfStyle.MARGIN.LEFT + 15, y: yPos - 15, width: 110, height: cellHeight, content: data.facilityName}, (document, x, y, width, height, content) => PdfUtils.wrappedField(document, x, y, width, height, content));
    addStructuredTableCell(doc, tableBodyRow, 'TD', {x: PdfStyle.MARGIN.LEFT + 125, y: yPos - 15, width: 145, height: cellHeight, content: sfAddress}, (document, x, y, width, height, content) => PdfUtils.wrappedField(document, x, y, width, height, content));
    addStructuredTableCell(doc, tableBodyRow, 'TD', {x: PdfStyle.MARGIN.LEFT + 270, y: yPos - 15, width: 110, height: cellHeight, content: data.facilityApprovalNumber}, (document, x, y, width, height, content) => PdfUtils.wrappedField(document, x, y, width, height, content));
    addStructuredTableCell(doc, tableBodyRow, 'TD', {x: PdfStyle.MARGIN.LEFT + 380, y: yPos, width: 50, height: cellHeight - 15, content: data.facilityStorage === 'Chilled' ? 'Chilled' : ''}, (document, x, y, width, height, content) => PdfUtils.wrappedField(document, x, y, width, height, content));
    addStructuredTableCell(doc, tableBodyRow, 'TD', {x: PdfStyle.MARGIN.LEFT + 430, y: yPos, width: 50, height: cellHeight - 15, content: data.facilityStorage === 'Frozen' ? 'Frozen' : ''}, (document, x, y, width, height, content) => PdfUtils.wrappedField(document, x, y, width, height, content));
    addStructuredTableCell(doc, tableBodyRow, 'TD', {x: PdfStyle.MARGIN.LEFT + 480, y: yPos, width: 50, height: cellHeight - 15, content: data.facilityStorage === 'Other' ? 'Other' : ''}, (document, x, y, width, height, content) => PdfUtils.wrappedField(document, x, y, width, height, content));

    tableBodyRow.end();
    doc.endMarkedContent();
    tableBody.end();
};

const section4 = (doc, data, startY) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '4.    Storage facility details');
    }));
    let yPos = startY + 12;
    const cellHeight = PdfStyle.ROW.HEIGHT * 3;
    const subCellHeight = PdfStyle.ROW.HEIGHT;
 
    const myTable = doc.struct('Table');
    doc.addStructure(myTable);

    renderSection4TableHead(doc, myTable, yPos, cellHeight, subCellHeight);

    yPos += cellHeight;
    renderSection4TableBody(doc, myTable, data, yPos, cellHeight);
    myTable.end();
 
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.separator(doc, yPos + (PdfStyle.ROW.HEIGHT * 2) + 8);
    }));
}

const getNestedValue = (obj, path) => {  
    const result = path
        .split('.')
        .reduce((acc, part) => acc?.[part] ?? '', obj);
    
    return Array.isArray(result) ? result.join(', ') : result;
};
 
const isVehicleTransportKey = (key) => 
    key === ARRIVAL_TRANSPORT_VEHICLE_KEY || key === TRANSPORT_VEHICLE_KEY;

const getTransportType = (transport) => 
    (transport.vehicle || '').toLowerCase();

const transportFormatters = {
    containervessel: (transport) => `Vessel: ${transport.vesselName || ''} - ${transport.flagState || ''}`,
    truck: (transport) => `Truck: ${transport.registrationNumber || ''} - ${transport.freightBillNumber || ''}`,
    train: (transport) => `Train: ${transport.railwayBillNumber || ''} - ${transport.freightBillNumber || ''}`,
    plane: (transport) => `Plane: ${transport.flightNumber || ''} - ${transport.airwayBillNumber || ''} - ${transport.freightBillNumber || ''}`
};

const formatTransportValue = (rowKey, data, isArrival = true) => {
    if (!isVehicleTransportKey(rowKey)) {
        return getNestedValue(data, rowKey);
    }
    
    const transport = isArrival ? (data.arrivalTransport || {}) : (data.transport || {});
    const type = getTransportType(transport);

    const formatter = transportFormatters[type];
    return formatter ? formatter(transport) : '';
};

const renderTransportDetailsTable = (doc, startY, rows, data, isArrival) => {
    let yPos = startY;
    const col1Width = 250;
    const col2Width = 265;

    const myTable = doc.struct('Table');
    doc.addStructure(myTable);

    const tableBody = doc.struct('TBody');
    myTable.add(tableBody);

    rows.forEach(row => {
        const height = isVehicleTransportKey(row.key) ? PdfStyle.ROW.HEIGHT * 2.4 : PdfStyle.ROW.HEIGHT * 2;
        const value = formatTransportValue(row.key, data, isArrival);

        const tableRow = doc.struct('TR');
        tableBody.add(tableRow);

        const headerCell = doc.struct('TH');
        tableRow.add(headerCell);
        const headerCellContent = doc.markStructureContent('TH');
        headerCell.add(headerCellContent);
        PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT + 15, yPos, col1Width, height, row.label);
        headerCell.end();

        const dataCell = doc.struct('TD');
        tableRow.add(dataCell);
        const dataCellContent = doc.markStructureContent('TD');
        dataCell.add(dataCellContent);
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 265, yPos, col2Width, height, value);
        dataCell.end();

        tableRow.end();

        yPos += height;
    });

    doc.endMarkedContent();
    tableBody.end();
    myTable.end();

    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.separator(doc, yPos + 8);
    }));
};
 
const section2 = (doc, data, startY) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '2.  Arrival to the place of storage - details');
    }));
    
    const rows = [
        { label: 'Place of departure of the product', key: 'arrivalTransport.departureCountry' },
        { label: 'Date of departure:', key: 'arrivalTransport.departureDate' },
        { label: 'Last port, airport or other point of departure before arrival to the country of storage', key: 'arrivalTransport.departurePort' },
        { label: 'Details of transport (Vessel name and flag / flight number - airway bill / railway bill / freight bill - truck registration number)', key: ARRIVAL_TRANSPORT_VEHICLE_KEY },
        { label: 'Container number(s) (where applicable)', key: 'arrivalTransport.containerNumbers' },
        { label: 'Date of arrival to the place of storage (unloading)', key: 'facilityArrivalDate' },
        { label: 'Place of storage', key: 'arrivalTransport.placeOfUnloading' }
    ];
    
    renderTransportDetailsTable(doc, startY + 12, rows, data, true);
}
 
const section1 = (doc, data, isSample, startY) => {
    let documentNumber = '';
    if (isSample) {
        documentNumber = '###-####-##-#########';
    } else {
        documentNumber = data.documentNumber;
    }
 
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        doc.lineWidth(2);
        doc.moveTo(PdfStyle.MARGIN.LEFT, startY + 4).lineTo(560, startY + 4).stroke();
    }));
 
    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT, startY + 17, 'Document Number');
    }));
    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 95, startY + 15, 160, PdfStyle.ROW.HEIGHT, documentNumber);
    }));

    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.label(doc, 300, startY + 17, 'Declaring Authority');
    }));
    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 380, startY + 15, 150, PdfStyle.ROW.HEIGHT, 'Marine Management Organisation');
    }));    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + 40, '1.    Name');
    }));
    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 65, startY + 38, 465, PdfStyle.ROW.HEIGHT, 'Illegal Unreported and Unregulated (IUU) Fishing Team');
    }));

    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 15, startY + 60, 'Address');
    }));
    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 65, startY + 58, 465, PdfStyle.ROW.HEIGHT * 2 + 5, 'Tyneside House, Skinnerburn Rd, Newcastle upon Tyne, United Kingdom. NE4 7AR');
    }));
 
    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 65, startY + 100, 'Tel.');
    }));
    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 90, startY + 98, 200, PdfStyle.ROW.HEIGHT, '0300 123 1032');
    }));

    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 300, startY + 100, 'Email');
    }));
    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 330, startY + 98, 200, PdfStyle.ROW.HEIGHT, 'ukiuuslo@marinemanagement.org.uk');
    }));    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        doc.lineWidth(0.75);
        doc.moveTo(0, startY + 120).lineTo(600, startY + 120).dash(2, {space: 2}).stroke();
    }));
};

module.exports = {
    renderSection8DeclarationTable,
    section8,
    renderSection4TableHead,
    renderSection4TableBody,
    section4,
    renderTransportDetailsTable,
    section2,
    section1,
    ARRIVAL_TRANSPORT_VEHICLE_KEY,
    TRANSPORT_VEHICLE_KEY,
    addStructuredTableCell,
};
