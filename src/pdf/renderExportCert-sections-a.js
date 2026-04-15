/* eslint-disable no-magic-numbers */
const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');

const YES_NO_AS_APPROPRIATE = 'Yes/No (as appropriate)';

const end = (doc, startY) => {
    let yPos = startY + 10 * PdfStyle.ROW.HEIGHT + 10;
    const cellHeight = PdfStyle.ROW.HEIGHT * 8;
    PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT, yPos, 270, cellHeight, 'FOR OFFICIAL USE ONLY');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 270, yPos, 260, cellHeight, 'Import Control Authority Stamp');

    yPos += cellHeight + 20;
    doc.font(PdfStyle.FONT.BOLD);
    doc.text('Validated by the appropriate competent authority (MMO, Scottish Ministers, Welsh Ministers, Department of Agriculture, Environment and Rural Affairs for Northern Ireland, Marine Resources, Growth and Housing and Environment for Jersey, Sea Fisheries, Committee for Economic Development for Guernsey and Department Environment, Food and Agriculture for the Isle of Man) in accordance with article 15 of Council Regulation (EU) 1005/2008 (as retained under s.3(1) European Union (Withdrawal) Act 2018)', PdfStyle.MARGIN.LEFT + 10, yPos);
};

function getAppendixTransportModel(data) {
    return {
        countryOfExport: data.transport?.exportedFrom ? data.transport.exportedFrom : 'United Kingdom',
        pointOfDestination: data.transport?.pointOfDestination ?? '',
        departurePlace: getDeparturePlace(data),
        vcDetails: getVcDetails(data),
        flightNumber: getFlightDetails(data),
        truckDetails: getTruckDetails(data),
        railwayBillNumber: getRailwayBillNumber(data),
        freightBillNumber: getFreightBillNumber(data),
        otherTransportDocuments: getOtherTransportDocuments(data),
        containerIdentificationNumber: getContainerIdentificationNumber(data),
    };
}

function renderTransportDetailsTable(doc, model, yPos) {
    const fields = [
        { label: 'Country of exportation', value: model.countryOfExport, rowOffset: 0 },
        { label: 'Port/airport/other point of departure', value: model.departurePlace, rowOffset: 1 },
        { label: 'Point of destination', value: model.pointOfDestination, rowOffset: 2 },
        { label: 'Vessel name and flag', value: model.vcDetails, rowOffset: 3 },
        { label: 'Flight number/airway bill number', value: model.flightNumber, rowOffset: 4 },
        { label: 'Truck nationality and registration number', value: model.truckDetails, rowOffset: 5 },
        { label: 'Railway bill number', value: model.railwayBillNumber, rowOffset: 6 },
        { label: 'Freight bill number', value: model.freightBillNumber, rowOffset: 7 },
        { label: 'Container identification number(s)', value: model.containerIdentificationNumber, rowOffset: 8 },
        { label: 'Other transport documents (e.g. bill of landing, CMR, air waybill)', value: model.otherTransportDocuments, rowOffset: 9, cellHeight: PdfStyle.ROW.HEIGHT * 5 },
    ];

    const rows = fields.map(({ label, value, rowOffset, cellHeight: ch }) => {
        const cellHeight = ch || PdfStyle.ROW.HEIGHT;
        return doc.struct('TR', [
            doc.struct('TH', () => PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT, yPos + (PdfStyle.ROW.HEIGHT * rowOffset), 265, cellHeight, label)),
            doc.struct('TD', () => PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 265, yPos + (PdfStyle.ROW.HEIGHT * rowOffset), 265, cellHeight, value)),
        ]);
    });

    doc.addStructure(doc.struct('Table', rows));
}

const appendixTransportDetails = (doc, data, startY) => {
    doc.font(PdfStyle.FONT.BOLD);
    doc.fontSize(PdfStyle.FONT_SIZE.MEDIUM);
    doc.text('Transport Details', 0, startY, { align: 'center' });
    doc.font(PdfStyle.FONT.REGULAR);
    
    let yPos = startY + 20;
    const transportModel = getAppendixTransportModel(data);
    renderTransportDetailsTable(doc, transportModel, yPos);

    yPos = yPos + (PdfStyle.ROW.HEIGHT * 13) + PdfStyle.ROW.HEIGHT + 7;

    doc.fontSize(PdfStyle.FONT_SIZE.LARGE);
    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT, yPos, 'Container number(s) list attached');
    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 270, yPos, 'Exporter details');
    yPos = yPos + PdfStyle.ROW.HEIGHT - 2;

    const containerCellHeight = PdfStyle.ROW.HEIGHT * 8;
    const containerNumber = data?.transport?.containerNumber ?? '';
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT, yPos, 250, containerCellHeight, containerNumber.toString());

    const exporterAddress = PdfUtils.constructAddress([
        data.exporter?.addressOne,
        data.exporter?.addressTwo,
        data.exporter?.townCity,
        data.exporter?.postcode
    ]) ?? '';
    const exporterFullName = data.exporter?.exporterFullName ?? '';
    const exporterCompanyName = data.exporter?.exporterCompanyName ?? '';

    const cellHeight = PdfStyle.ROW.HEIGHT * 5 + 5;

    doc.addStructure(doc.struct('Table', [
        doc.struct('TR', [
            doc.struct('TH', () => PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 270, yPos, 100, PdfStyle.ROW.HEIGHT + 5, 'Name')),
            doc.struct('TD', () => PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 370, yPos, 160, PdfStyle.ROW.HEIGHT + 5, exporterFullName)),
        ]),
        doc.struct('TR', [
            doc.struct('TH', () => PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 270, yPos + PdfStyle.ROW.HEIGHT + 5, 100, cellHeight, 'Address')),
            doc.struct('TD', () => PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 370, yPos + PdfStyle.ROW.HEIGHT + 5, 160, cellHeight, [exporterCompanyName, exporterAddress])),
        ]),
        doc.struct('TR', [
            doc.struct('TH', () => PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 270, yPos + PdfStyle.ROW.HEIGHT + 5 + cellHeight, 100, cellHeight, 'Signature')),
            doc.struct('TD', () => PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 370, yPos + PdfStyle.ROW.HEIGHT + 5 + cellHeight, 160, cellHeight)),
        ])
    ]));

    PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT + 5 + (cellHeight * 2) + 10);
};

const getVehicleType = (data) => {
    return data?.transport?.vehicle?.toUpperCase() ?? '';
};

function buildSection11Tables() {
    return [
        {
            label: 'Article 14(1)',
            headers: [
                { leftMargin: 15, width: 250, text: ['Document under Article 14(1) of Regulation (EC) No 1005/2008'] },
                { leftMargin: 265, width: 270, text: YES_NO_AS_APPROPRIATE },
            ],
        },
        {
            label: 'Article 14(2)',
            headers: [
                { leftMargin: 15, width: 250, text: ['Document under Article 14(2) of Regulation (EC) No 1005/2008'] },
                { leftMargin: 265, width: 95, text: YES_NO_AS_APPROPRIATE },
                { leftMargin: 360, width: 175, text: 'References (processing statement document number(s))' },
            ],
        },
        {
            label: 'Member State',
            headers: [
                { leftMargin: 15, width: 520, text: 'Member State and office of import' },
            ],
        },
        {
            label: 'Means of Transport',
            headers: [
                { leftMargin: 15, width: 250, text: 'Means of transport upon arrival (airplane,vehicle, ship, train)' },
                { leftMargin: 265, width: 95, text: 'Transport document reference' },
                { leftMargin: 360, width: 175, text: 'Estimated time of arrival (if submission under Article 12(1) of Regulation (EC) No 1005/2008' },
            ],
        },
        {
            label: 'Customs/CHED',
            headers: [
                { leftMargin: 15, width: 300, text: 'Customs declaration number (if issued)' },
                { leftMargin: 315, width: 220, text: 'CHED number (if available)' },
            ],
        },
    ];
}

function renderSection11DetailTable(doc, yPos, headerHeight, rowHeight, headers) {
    const rows = headers.map(h => ({ leftMargin: h.leftMargin, width: h.width }));
    const headRowCells = headers.map(h =>
        doc.struct('TH', () =>
            PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + h.leftMargin, yPos, h.width, headerHeight, h.text)
        )
    );
    const bodyRowCells = rows.map(r =>
        doc.struct('TD', () =>
            PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + r.leftMargin, yPos + headerHeight, r.width, rowHeight)
        )
    );

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [doc.struct('TR', headRowCells)]),
        doc.struct('TBody', [doc.struct('TR', bodyRowCells)]),
    ]));
}

const getVcDetails = (data) => {
    const vehicleType = getVehicleType(data);

    if (vehicleType === 'CONTAINERVESSEL') {
        const vesselName = data.transport.vesselName ? `${data.transport.vesselName} ` : '';
        const flagState = data.transport.flagState ?? '';
        return `${vesselName}${flagState}`;
    }
    
    if (vehicleType === 'DIRECTLANDING') {
        const vessel = data.exportPayload?.items?.[0]?.landings?.[0]?.model?.vessel;
        const vesselName = vessel?.vesselName ? `${vessel.vesselName} ` : '';
        const pln = vessel?.pln ? `(${vessel.pln})` : '';
        return `${vesselName}${pln}`;
    }
    
    return '';
};

const getDeparturePlace = (data) => {
    const departurePlace = data?.transport?.cmr === 'true' 
        ? 'See attached transport documents' 
        : (data?.transport?.departurePlace ?? '');
    return departurePlace;
};

const getFlightDetails = (data) => {
    return data?.transport?.flightNumber ?? '';
};

const getTruckDetails = (data) => {
    if (data?.transport?.vehicle?.toUpperCase() !== 'TRUCK') {
        return '';
    }
    
    const nationality = data.transport.nationalityOfVehicle 
        ? `${data.transport.nationalityOfVehicle} ` 
        : '';
    const registration = data.transport.registrationNumber ?? '';
    
    return `${nationality}${registration}`;
};

const getRailwayBillNumber = (data) => {
    return data?.transport?.railwayBillNumber ?? '';
};

const getContainerIdentificationNumber = (data) => {
    const vehicleType = getVehicleType(data);
    
    // Only show container identification number for truck and train transport
    if (vehicleType === 'TRUCK' || vehicleType === 'TRAIN') {
        return data.transport.containerIdentificationNumber ?? '';
    }
    
    return '';
};

const getFreightBillNumber = (data) => {
    let freightBillNumber = '';
    if (data.transport) {
        freightBillNumber = data.transport.freightBillNumber;
    }

    return freightBillNumber;
}

const getOtherTransportDocuments = (data) => {
    let documentLines = [];
    
    if (data.transport?.documents && Array.isArray(data.transport.documents)) {
        documentLines = data.transport.documents
        .sort((a, b) => {
            const aKey = a.name || a.reference || '';
            const bKey = b.name || b.reference || '';
            return aKey.localeCompare(bKey, undefined, { numeric: true });
        })
        .map(doc => {
            if (doc.name && doc.reference) {
                return `${doc.name} - ${doc.reference}`;
            }
            return '';
        })
        .filter(line => line.length > 0);
    }
    
    return documentLines;
};

const appendixHeading = (doc, startY) => {

    doc.fillColor('#353535');
    doc.fontSize(PdfStyle.FONT_SIZE.LARGE);
    doc.font(PdfStyle.FONT.BOLD);
    doc.addStructure(doc.struct('H2', {}, () => {
        doc.text('Appendix I', 0, startY, {
            align: 'center'
        });
    }));
};
const generateTable = (doc, yPos, headerHeight, rowHeight, headers, rows) => {
    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', {}, () => {
                headers.forEach((header, _index) => {
                    doc.addStructure(
                        doc.struct('TH', () =>
                            PdfUtils.tableHeaderCell(
                                doc,
                                PdfStyle.MARGIN.LEFT + header.leftMargin,
                                yPos,
                                header.width,
                                headerHeight,
                                header.text
                            )
                        )
                    );
                });
            })
        ]),
        doc.struct('TBody', [
            doc.struct('TR', {}, () => {
                rows.forEach((row, _index) => {
                    doc.addStructure(
                        doc.struct('TD', () =>
                            PdfUtils.field(
                                doc,
                                PdfStyle.MARGIN.LEFT + row.leftMargin,
                                yPos + headerHeight,
                                row.width,
                                rowHeight
                            )
                        )
                    );
                });
            })
        ])
    ]));
};

const generateSection11 = (doc, _data, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + PdfStyle.ROW.HEIGHT * 2, '11    Importer Declaration:');
    let yPos = startY + PdfStyle.ROW.HEIGHT * 3;
    const headerHeight = PdfStyle.ROW.HEIGHT * 3 - 4;
    const rowHeight = PdfStyle.ROW.HEIGHT * 3;

    const importerHeaders = [
        { leftMargin: 15, width: 250, text: ['Company, name, address, EORI number and contact details of representative of the importer (specify details)'] },
        { leftMargin: 265, width: 95, text: 'Signature' },
        { leftMargin: 360, width: 95, text: 'Date' },
        { leftMargin: 455, width: 80, text: 'Seal' }
    ];
    const importerRows = [
        { leftMargin: 15, width: 250 },
        { leftMargin: 265, width: 95 },
        { leftMargin: 360, width: 95 },
        { leftMargin: 455, width: 80 }
    ];
    generateTable(doc, yPos, headerHeight, rowHeight, importerHeaders, importerRows);

    yPos += headerHeight + rowHeight;

    // Table 2: Product Details
    const productHeaders = [
        { leftMargin: 15, width: 250, text: 'Product Description' },
        { leftMargin: 265, width: 95, text: 'CN code' },
        { leftMargin: 360, width: 95, text: 'Net weight in kg' },
        { leftMargin: 455, width: 80, text: 'Net fishery product weight in kg' }
    ];
    const productRows = [
        { leftMargin: 15, width: 250 },
        { leftMargin: 265, width: 95 },
        { leftMargin: 360, width: 95 },
        { leftMargin: 455, width: 80 }
    ];
    generateTable(doc, yPos, headerHeight, rowHeight, productHeaders, productRows);

    yPos += headerHeight + rowHeight;
    const detailTables = buildSection11Tables();
    detailTables.forEach((table) => {
        renderSection11DetailTable(doc, yPos, headerHeight, rowHeight, table.headers);
        yPos += headerHeight + rowHeight;
    });

    yPos += headerHeight + rowHeight;
    doc.lineWidth(1.5);
    doc.undash();
    doc.moveTo(PdfStyle.MARGIN.LEFT + 225, yPos + 0.5).lineTo(PdfStyle.MARGIN.LEFT + 225, yPos + headerHeight - 0.5).stroke('#ffffff');
}


module.exports = {
    end,
    appendixHeading,
    appendixTransportDetails,
    generateSection11,
};
