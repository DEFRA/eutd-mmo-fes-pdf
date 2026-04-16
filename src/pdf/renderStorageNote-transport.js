const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const {
    MARGIN_OFFSET,
    TRANSPORT_VEHICLE_KEY,
    ARRIVAL_TRANSPORT_VEHICLE_KEY,
    ARRIVAL_TRANSPORT_CONTAINER_NUMBERS,
    TRANSPORT_CONTAINER_NUMBERS,
    TRANSPORT_DETAILS_COL1_WIDTH,
    TRANSPORT_DETAILS_COL2_WIDTH,
    TRANSPORT_DETAILS_COL2_X,
    TRANSPORT_DETAILS_ROW_PADDING,
    TRANSPORT_DETAILS_TABLE_START_Y_OFFSET,
    ROW_HEIGHT_MULTIPLIER_2,
    ROW_HEIGHT_MULTIPLIER_3_5,
    ROW_HEIGHT_MULTIPLIER_6,
    SEPARATOR_SPACING,
} = require('./renderStorageNote-constants');

const getNestedValue = (obj, path) => {
    const result = path
        .split('.')
        .reduce((acc, part) => (acc?.[part] === undefined ? '' : acc[part]), obj);

    return Array.isArray(result) ? result.join(', ') : result;
};

const isVehicleTransportKey = (key) =>
    key === ARRIVAL_TRANSPORT_VEHICLE_KEY || key === TRANSPORT_VEHICLE_KEY;

const isContainerNumberKey = (key) =>
    key === ARRIVAL_TRANSPORT_CONTAINER_NUMBERS || key === TRANSPORT_CONTAINER_NUMBERS;

const isPointOfDestinationKey = (key) =>
    key === 'transport.pointOfDestination' || key === 'arrivalTransport.pointOfDestination';

const shouldUseExpandedHeight = (key) =>
    isVehicleTransportKey(key) || isContainerNumberKey(key) || isPointOfDestinationKey(key);

const getTransportType = (transport) =>
    (transport.vehicle || '').toLowerCase();

const formatVesselTransport = (transport) => `Vessel: ${transport.vesselName || ''} - ${transport.flagState || ''}`;
const formatTruckTransport = (transport) => {
    const parts = [transport.registrationNumber, transport.freightBillNumber].filter(v => v?.trim());
    return `Truck: ${parts.join(' - ')}`;
};
const formatTrainTransport = (transport) => {
    const parts = [transport.railwayBillNumber, transport.freightBillNumber].filter(v => v?.trim());
    return `Train: ${parts.join(' - ')}`;
};
const formatPlaneTransport = (transport) => {
    const parts = [transport.flightNumber, transport.airwayBillNumber, transport.freightBillNumber].filter(v => v?.trim());
    return `Plane: ${parts.join(' - ')}`;
};

const TRANSPORT_TYPE_FORMATTERS = {
    'containervessel': formatVesselTransport,
    'truck': formatTruckTransport,
    'train': formatTrainTransport,
    'plane': formatPlaneTransport
};

const formatTransportValue = (rowKey, data, isArrival = true) => {
    if (!isVehicleTransportKey(rowKey)) {
        return getNestedValue(data, rowKey);
    }

    const transport = isArrival ? (data.arrivalTransport || {}) : (data.transport || {});
    const type = getTransportType(transport);
    const formatter = TRANSPORT_TYPE_FORMATTERS[type];
    return formatter ? formatter(transport) : '';
};

const renderTransportDetailsTable = (doc, startY, rows, data, isArrival) => {
    let yPos = startY;
    const col1Width = TRANSPORT_DETAILS_COL1_WIDTH;
    const col2Width = TRANSPORT_DETAILS_COL2_WIDTH;

    const myTable = doc.struct('Table');
    doc.addStructure(myTable);

    const tableBody = doc.struct('TBody');
    myTable.add(tableBody);

    rows.forEach(row => {
        const heightMultiplier = isArrival ? ROW_HEIGHT_MULTIPLIER_6 : ROW_HEIGHT_MULTIPLIER_3_5;
        const height = shouldUseExpandedHeight(row.key) ? PdfStyle.ROW.HEIGHT * heightMultiplier : PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER_2;
        const value = formatTransportValue(row.key, data, isArrival);

        const tableRow = doc.struct('TR');
        tableBody.add(tableRow);

        const headerCell = doc.struct('TH');
        tableRow.add(headerCell);
        const headerCellContent = doc.markStructureContent('TH');
        headerCell.add(headerCellContent);
        PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT + MARGIN_OFFSET, yPos, col1Width, height + TRANSPORT_DETAILS_ROW_PADDING, row.label);
        headerCell.end();

        const dataCell = doc.struct('TD');
        tableRow.add(dataCell);
        const dataCellContent = doc.markStructureContent('TD');
        dataCell.add(dataCellContent);

        if (shouldUseExpandedHeight(row.key)) {
            PdfUtils.wrappedFieldNoEllipsis(doc, PdfStyle.MARGIN.LEFT + TRANSPORT_DETAILS_COL2_X, yPos, col2Width, height + TRANSPORT_DETAILS_ROW_PADDING, value);
        } else {
            PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + TRANSPORT_DETAILS_COL2_X, yPos, col2Width, height + TRANSPORT_DETAILS_ROW_PADDING, value);
        }
        dataCell.end();

        tableRow.end();

        yPos += height + TRANSPORT_DETAILS_ROW_PADDING;
    });

    doc.endMarkedContent();
    tableBody.end();
    myTable.end();

    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.separator(doc, yPos + SEPARATOR_SPACING);
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
        { label: 'Container number(s) (where applicable)', key: ARRIVAL_TRANSPORT_CONTAINER_NUMBERS },
        { label: 'Date of arrival to the place of storage (unloading)', key: 'facilityArrivalDate' },
        { label: 'Place of storage', key: 'arrivalTransport.placeOfUnloading' }
    ];

    renderTransportDetailsTable(doc, startY + TRANSPORT_DETAILS_TABLE_START_Y_OFFSET, rows, data, true);
};

const section6 = (doc, data, startY) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '6.  Departure from the place of storage - details');
    }));

    const rows = [
        { label: 'Date of departure from the place of storage (reloading)', key: 'transport.exportDate' },
        { label: 'Last port, airport or point of departure from the country of storage', key: 'transport.departurePlace' },
        { label: 'Details of transport (Vessel name and flag / flight number - airway bill / railway bill / freight bill - truck registration number)', key: TRANSPORT_VEHICLE_KEY },
        { label: 'Container number(s) (where applicable)', key: TRANSPORT_CONTAINER_NUMBERS },
        { label: 'Point of destination: Port, airport or other point of destination', key: 'transport.pointOfDestination' }
    ];

    renderTransportDetailsTable(doc, startY + TRANSPORT_DETAILS_TABLE_START_Y_OFFSET, rows, data, false);
};

module.exports = {
    shouldUseExpandedHeight,
    section2,
    section6,
};
