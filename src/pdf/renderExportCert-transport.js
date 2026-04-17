const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');

const renderTransportDetailsTable = (doc, yPos, transportData, fieldHeights, widths) => {
    const {
        countryOfExport, departurePlace, pointOfDestination, vcDetails,
        flightNumber, truckDetails, railwayBillNumber, freightBillNumber,
        containerIdentificationNumber, otherTransportDocuments
    } = transportData;

    const {
        singleLineHeight, destinationFieldHeight, vesselFieldHeight, flightFieldHeight, truckFieldHeight,
        railwayFieldHeight, freightFieldHeight, containerFieldHeight, otherDocsFieldHeight
    } = fieldHeights;

    const { labelWidth, valueWidth, multiplier2, multiplier3 } = widths;

    doc.addStructure(doc.struct('Table', [
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos, labelWidth, singleLineHeight, 'Country of exportation')),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + labelWidth, yPos, valueWidth, singleLineHeight, countryOfExport)),
            ]),
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + singleLineHeight, labelWidth, singleLineHeight, 'Port/airport/other point of departure')),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + labelWidth, yPos + singleLineHeight, valueWidth, singleLineHeight, departurePlace)),
            ]),
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + (singleLineHeight * multiplier2), labelWidth, destinationFieldHeight, 'Point of destination')),
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + labelWidth, yPos + (singleLineHeight * multiplier2), valueWidth, destinationFieldHeight, pointOfDestination)),
            ]),
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + (singleLineHeight * multiplier3), labelWidth, vesselFieldHeight, 'Vessel name and flag')),
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + labelWidth, yPos + (singleLineHeight * multiplier3), valueWidth, vesselFieldHeight, vcDetails)),
            ]),
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + (singleLineHeight * multiplier3) + vesselFieldHeight, labelWidth, flightFieldHeight, 'Flight number/airway bill number')),
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + labelWidth, yPos + (singleLineHeight * multiplier3) + vesselFieldHeight, valueWidth, flightFieldHeight, flightNumber)),
            ]),
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + (singleLineHeight * multiplier3) + vesselFieldHeight + flightFieldHeight, labelWidth, truckFieldHeight, 'Truck nationality and registration number')),
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + labelWidth, yPos + (singleLineHeight * multiplier3) + vesselFieldHeight + flightFieldHeight, valueWidth, truckFieldHeight, truckDetails)),
            ]),
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + (singleLineHeight * multiplier3) + vesselFieldHeight + flightFieldHeight + truckFieldHeight, labelWidth, railwayFieldHeight, 'Railway bill number')),
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + labelWidth, yPos + (singleLineHeight * multiplier3) + vesselFieldHeight + flightFieldHeight + truckFieldHeight, valueWidth, railwayFieldHeight, railwayBillNumber)),
            ]),
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + (singleLineHeight * multiplier3) + vesselFieldHeight + flightFieldHeight + truckFieldHeight + railwayFieldHeight, labelWidth, freightFieldHeight, 'Freight bill number')),
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + labelWidth, yPos + (singleLineHeight * multiplier3) + vesselFieldHeight + flightFieldHeight + truckFieldHeight + railwayFieldHeight, valueWidth, freightFieldHeight, freightBillNumber)),
            ]),
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + (singleLineHeight * multiplier3) + vesselFieldHeight + flightFieldHeight + truckFieldHeight + railwayFieldHeight + freightFieldHeight, labelWidth, containerFieldHeight, 'Container identification number(s)')),
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + labelWidth, yPos + (singleLineHeight * multiplier3) + vesselFieldHeight + flightFieldHeight + truckFieldHeight + railwayFieldHeight + freightFieldHeight, valueWidth, containerFieldHeight, containerIdentificationNumber)),
            ]),
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + (singleLineHeight * multiplier3) + vesselFieldHeight + flightFieldHeight + truckFieldHeight + railwayFieldHeight + freightFieldHeight + containerFieldHeight, labelWidth, otherDocsFieldHeight, 'Other transport documents (e.g. bill of landing, CMR, air waybill)')),
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + labelWidth, yPos + (singleLineHeight * multiplier3) + vesselFieldHeight + flightFieldHeight + truckFieldHeight + railwayFieldHeight + freightFieldHeight + containerFieldHeight, valueWidth, otherDocsFieldHeight, otherTransportDocuments)),
            ])
        ])
    ]));
};

const appendixTransportDetails = (doc, data, startY) => {
    const DESTINATION_FIELD_HEIGHT_MULTIPLIER = 3;
    const VESSEL_FIELD_HEIGHT_MULTIPLIER = 5;
    const FLIGHT_FIELD_HEIGHT_MULTIPLIER = 4;
    const TRUCK_FIELD_HEIGHT_MULTIPLIER = 4;
    const RAILWAY_FIELD_HEIGHT_MULTIPLIER = 3;
    const FREIGHT_FIELD_HEIGHT_MULTIPLIER = 3;
    const CONTAINER_FIELD_HEIGHT_MULTIPLIER = 6;
    const OTHER_DOCS_FIELD_HEIGHT_MULTIPLIER = 20;
    const TRANSPORT_LABEL_WIDTH = 156;
    const TRANSPORT_VALUE_WIDTH = 383;
    const SINGLE_LINE_YPOS_MULTIPLIER_2 = 2;
    const SINGLE_LINE_YPOS_MULTIPLIER_3 = 5;

    doc.font(PdfStyle.FONT.REGULAR);
    const yPos = startY;

    const transportModes = getTransportModes(data);

    const firstTransport = transportModes[0] || {};
    const countryOfExport = firstTransport.exportedFrom || data.transport?.exportedFrom || 'United Kingdom';
    const pointOfDestination = firstTransport.pointOfDestination || data.transport?.pointOfDestination || '';
    const departurePlace = getDeparturePlace(data);

    const vcDetails = getVcDetails(data);
    const flightNumber = getFlightDetails(data);
    const truckDetails = getTruckDetails(data);
    const railwayBillNumber = getRailwayBillNumber(data);
    const freightBillNumber = getFreightBillNumber(data);
    const otherTransportDocuments = getOtherTransportDocuments(data);
    const containerIdentificationNumber = getContainerIdentificationNumber(data);

    const transportData = {
        countryOfExport, departurePlace, pointOfDestination, vcDetails,
        flightNumber, truckDetails, railwayBillNumber, freightBillNumber,
        containerIdentificationNumber, otherTransportDocuments
    };

    const fieldHeights = {
        singleLineHeight: PdfStyle.ROW.HEIGHT,
        destinationFieldHeight: PdfStyle.ROW.HEIGHT * DESTINATION_FIELD_HEIGHT_MULTIPLIER,
        vesselFieldHeight: PdfStyle.ROW.HEIGHT * VESSEL_FIELD_HEIGHT_MULTIPLIER,
        flightFieldHeight: PdfStyle.ROW.HEIGHT * FLIGHT_FIELD_HEIGHT_MULTIPLIER,
        truckFieldHeight: PdfStyle.ROW.HEIGHT * TRUCK_FIELD_HEIGHT_MULTIPLIER,
        railwayFieldHeight: PdfStyle.ROW.HEIGHT * RAILWAY_FIELD_HEIGHT_MULTIPLIER,
        freightFieldHeight: PdfStyle.ROW.HEIGHT * FREIGHT_FIELD_HEIGHT_MULTIPLIER,
        containerFieldHeight: PdfStyle.ROW.HEIGHT * CONTAINER_FIELD_HEIGHT_MULTIPLIER,
        otherDocsFieldHeight: PdfStyle.ROW.HEIGHT * OTHER_DOCS_FIELD_HEIGHT_MULTIPLIER
    };

    const widths = {
        labelWidth: TRANSPORT_LABEL_WIDTH,
        valueWidth: TRANSPORT_VALUE_WIDTH,
        multiplier2: SINGLE_LINE_YPOS_MULTIPLIER_2,
        multiplier3: SINGLE_LINE_YPOS_MULTIPLIER_3
    };

    renderTransportDetailsTable(doc, yPos, transportData, fieldHeights, widths);
};

const appendixExporterAndImportDetails = (doc, data, isSample, buff, startY) => {
    const EXPORTER_SECTION_HEADER_Y_OFFSET = 20;
    const NAME_ROW_HEIGHT_MULTIPLIER = 5;
    const ROW_HEIGHT_ADJUSTMENT = 5;
    const EXPORTER_LABEL_COL_WIDTH = 100;
    const EXPORTER_VALUE_COL_WIDTH = 430;
    const OFFICIAL_USE_HEIGHT_MULTIPLIER = 8;
    const OFFICIAL_USE_COL1_WIDTH = 270;
    const OFFICIAL_USE_COL2_WIDTH = 260;
    const OFFICIAL_USE_Y_OFFSET = 20;
    const VALIDATION_TEXT_X_OFFSET = 10;
    const VALIDATION_Y_OFFSET = 80;
    const QR_CODE_X_OFFSET = 20;
    const TABLE_SPACING = 30;
    const CELL_HEIGHT_MULTIPLIER_2 = 2;

    let yPos = startY;

    doc.font(PdfStyle.FONT.BOLD);
    doc.fontSize(PdfStyle.FONT_SIZE.MEDIUM);
    doc.addStructure(doc.struct('H3', () => {
        doc.text('Exporter Details', PdfStyle.MARGIN.LEFT, yPos);
    }));
    doc.font(PdfStyle.FONT.REGULAR);
    yPos += EXPORTER_SECTION_HEADER_Y_OFFSET;

    const exporterAddress = PdfUtils.constructAddress([
        data.exporter?.addressOne,
        data.exporter?.addressTwo,
        data.exporter?.townCity,
        data.exporter?.postcode
    ]) ?? '';
    const exporterFullName = data.exporter?.exporterFullName ?? '';
    const exporterCompanyName = data.exporter?.exporterCompanyName ?? '';

    let cellHeight = PdfStyle.ROW.HEIGHT * NAME_ROW_HEIGHT_MULTIPLIER + ROW_HEIGHT_ADJUSTMENT;

    doc.addStructure(doc.struct('Table', [
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos, EXPORTER_LABEL_COL_WIDTH, PdfStyle.ROW.HEIGHT + ROW_HEIGHT_ADJUSTMENT, 'Name')),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + EXPORTER_LABEL_COL_WIDTH, yPos, EXPORTER_VALUE_COL_WIDTH, PdfStyle.ROW.HEIGHT + ROW_HEIGHT_ADJUSTMENT, exporterFullName)),
            ]),
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + PdfStyle.ROW.HEIGHT + ROW_HEIGHT_ADJUSTMENT, EXPORTER_LABEL_COL_WIDTH, cellHeight, 'Address')),
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + EXPORTER_LABEL_COL_WIDTH, yPos + PdfStyle.ROW.HEIGHT + ROW_HEIGHT_ADJUSTMENT, EXPORTER_VALUE_COL_WIDTH, cellHeight, [exporterCompanyName, exporterAddress])),
            ]),
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + PdfStyle.ROW.HEIGHT + ROW_HEIGHT_ADJUSTMENT + cellHeight, EXPORTER_LABEL_COL_WIDTH, cellHeight, 'Signature')),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + EXPORTER_LABEL_COL_WIDTH, yPos + PdfStyle.ROW.HEIGHT + ROW_HEIGHT_ADJUSTMENT + cellHeight, EXPORTER_VALUE_COL_WIDTH, cellHeight)),
            ])
        ])
    ]));

    yPos = yPos + PdfStyle.ROW.HEIGHT + ROW_HEIGHT_ADJUSTMENT + (cellHeight * CELL_HEIGHT_MULTIPLIER_2) + TABLE_SPACING;

    cellHeight = PdfStyle.ROW.HEIGHT * OFFICIAL_USE_HEIGHT_MULTIPLIER;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', () => {
                    PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT, yPos, OFFICIAL_USE_COL1_WIDTH, cellHeight, 'FOR OFFICIAL USE ONLY');
                }),
                doc.struct('TH', () => {
                    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + OFFICIAL_USE_COL1_WIDTH, yPos, OFFICIAL_USE_COL2_WIDTH, cellHeight, 'Import Control Authority Stamp');
                })
            ])
        ])
    ]));

    yPos += cellHeight + OFFICIAL_USE_Y_OFFSET;

    doc.font(PdfStyle.FONT.BOLD);
    doc.addStructure(doc.struct('P', () => {
        doc.text('Validated by the appropriate competent authority (MMO, Scottish Ministers, Welsh Ministers, Department of Agriculture, Environment and Rural Affairs for Northern Ireland, Marine Resources, Growth and Housing and Environment for Jersey, Sea Fisheries, Committee for Economic Development for Guernsey and Department Environment, Food and Agriculture for the Isle of Man) in accordance with article 15 of Council Regulation (EU) 1005/2008 (as retained under s.3(1) European Union (Withdrawal) Act 2018)', PdfStyle.MARGIN.LEFT + VALIDATION_TEXT_X_OFFSET, yPos);
    }));

    yPos += VALIDATION_Y_OFFSET;

    const shouldGenerateQRCode = !data.isBlankTemplate && !isSample;
    if (shouldGenerateQRCode && buff) {
        PdfUtils.qrCode(doc, buff, PdfStyle.MARGIN.LEFT + QR_CODE_X_OFFSET, yPos);
    }
};

const getVehicleType = (data) => {
    return data?.transport?.vehicle?.toUpperCase() ?? '';
};

const getTransportModes = (data) => {
    if (Array.isArray(data.transportations)) {
        return data.transportations;
    }

    if (data.transport) {
        return [data.transport];
    }

    return [];
};

const formatVesselDetail = (vesselName, flagStateOrPln) => {
    const name = vesselName ? `${vesselName} ` : '';
    const detail = (name + (flagStateOrPln ?? '')).toString().trim();
    return detail;
};

const extractVesselFromTransport = (transport) => {
    const transportVehicleType = (transport.vehicle || '').toUpperCase();

    if (transportVehicleType === 'CONTAINERVESSEL' || transportVehicleType === 'DIRECTLANDING') {
        return formatVesselDetail(transport.vesselName, transport.flagState);
    }

    return null;
};

const extractVesselFromExportPayload = (data) => {
    const vessel = data.exportPayload?.items?.[0]?.landings?.[0]?.model?.vessel;
    if (!vessel) {
        return null;
    }

    const pln = vessel.pln ? `(${vessel.pln})` : '';
    return formatVesselDetail(vessel.vesselName, pln);
};

const getVcDetails = (data) => {
    const transportModes = getTransportModes(data);
    const vesselDetails = [];

    transportModes.forEach(transport => {
        const detail = extractVesselFromTransport(transport);
        if (detail) {
            vesselDetails.push(detail);
        }
    });

    if (vesselDetails.length === 0 && getVehicleType(data) === 'DIRECTLANDING') {
        const detail = extractVesselFromExportPayload(data);
        if (detail) {
            vesselDetails.push(detail);
        }
    }

    return vesselDetails.join(', ');
};

const extractDeparturePlaceFromTransport = (transport) => {
    if (transport.cmr === 'true') {
        return 'See attached transport documents';
    }

    if (transport.departurePlace) {
        const place = transport.departurePlace.toString().trim();
        return place || null;
    }

    return null;
};

const addUniqueDeparturePlace = (departurePlaces, place) => {
    if (place && !departurePlaces.includes(place)) {
        departurePlaces.push(place);
    }
};

const getDeparturePlace = (data) => {
    const transportModes = getTransportModes(data);
    const departurePlaces = [];

    transportModes.forEach(transport => {
        const place = extractDeparturePlaceFromTransport(transport);
        addUniqueDeparturePlace(departurePlaces, place);
    });

    if (departurePlaces.length === 0 && data.transport) {
        const place = extractDeparturePlaceFromTransport(data.transport);
        if (place) {
            departurePlaces.push(place);
        }
    }

    return departurePlaces.join(', ');
};

const getFlightDetails = (data) => {
    const transportModes = getTransportModes(data);
    const flightNumbers = [];

    transportModes.forEach(transport => {
        const transportVehicleType = (transport.vehicle || '').toUpperCase();
        if (transportVehicleType === 'PLANE' && transport.flightNumber) {
            flightNumbers.push(transport.flightNumber.toString());
        }
    });

    return flightNumbers.join(', ');
};

const getTruckDetails = (data) => {
    const transportModes = getTransportModes(data);
    const truckDetails = [];

    transportModes.forEach(transport => {
        const transportVehicleType = (transport.vehicle || '').toUpperCase();
        if (transportVehicleType === 'TRUCK') {
            const nationality = transport.nationalityOfVehicle
                ? `${transport.nationalityOfVehicle} `
                : '';
            const registration = transport.registrationNumber ?? '';
            const detail = (nationality + registration).toString().trim();
            if (detail) {
                truckDetails.push(detail);
            }
        }
    });

    return truckDetails.join(', ');
};

const getRailwayBillNumber = (data) => {
    const transportModes = getTransportModes(data);
    const railwayBillNumbers = [];

    transportModes.forEach(transport => {
        const transportVehicleType = (transport.vehicle || '').toUpperCase();
        if (transportVehicleType === 'TRAIN' && transport.railwayBillNumber) {
            railwayBillNumbers.push(transport.railwayBillNumber.toString());
        }
    });

    return railwayBillNumbers.join(', ');
};

const getContainerIdentificationNumber = (data) => {
    const transportModes = getTransportModes(data);
    const containerNumbers = [];

    transportModes.forEach(transport => {
        const containerNum = transport.containerIdentificationNumber || transport.containerNumber;
        if (containerNum) {
            containerNumbers.push(containerNum.toString());
        }
    });

    return containerNumbers.join(', ');
};

const getFreightBillNumber = (data) => {
    const transportModes = getTransportModes(data);
    const freightBillNumbers = [];

    transportModes.forEach(transport => {
        if (transport.freightBillNumber) {
            freightBillNumbers.push(transport.freightBillNumber.toString());
        }
    });

    return freightBillNumbers.join(', ');
};

const MAX_TRANSPORT_DOCUMENTS = 25;

const getOtherTransportDocuments = (data) => {
    const transportModes = getTransportModes(data);
    let documentLines = [];

    transportModes.forEach(transport => {
        const transportVehicleType = (transport.vehicle || '').toUpperCase();
        if (transportVehicleType === 'PLANE' && transport.airwayBillNumber) {
            documentLines.push(`Air waybill: ${transport.airwayBillNumber}`);
        }

        const docs = transport.transportDocuments || transport.documents;

        if (docs) {
            if (Array.isArray(docs)) {
                const formattedDocs = docs
                    .map(doc => {
                        if (doc.name && doc.reference) {
                            return `${doc.name} - ${doc.reference}`;
                        }
                        return '';
                    })
                    .filter(line => line.length > 0);

                documentLines = documentLines.concat(formattedDocs);
            } else {
                const lines = docs.split('\n').map(line => line.trim()).filter(line => line.length > 0);
                documentLines = documentLines.concat(lines);
            }
        }
    });

    documentLines = documentLines.slice(0, MAX_TRANSPORT_DOCUMENTS);

    return documentLines.join('\n');
};

const APPENDIX_HEADING_VERTICAL_OFFSET = 18;

const appendixHeading = (doc, startY) => {

    doc.fillColor('#353535');
    doc.fontSize(PdfStyle.FONT_SIZE.LARGE);
    doc.font(PdfStyle.FONT.BOLD);
    doc.addStructure(doc.struct('H2', {}, () => {
        doc.text('Appendix I', 0, startY, {
            align: 'center'
        });
    }));
    doc.addStructure(doc.struct('H3', {}, () => {
        doc.text('Transport Details', 0, startY + APPENDIX_HEADING_VERTICAL_OFFSET, {
            align: 'center'
        });
    }));
};

module.exports = {
    appendixHeading,
    appendixTransportDetails,
    appendixExporterAndImportDetails,
    getVehicleType,
    getTransportModes,
    getVcDetails,
    getDeparturePlace,
    getFlightDetails,
    getTruckDetails,
    getRailwayBillNumber,
    getContainerIdentificationNumber,
    getFreightBillNumber,
    getOtherTransportDocuments,
};
