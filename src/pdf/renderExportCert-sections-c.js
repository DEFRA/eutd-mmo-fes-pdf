/* eslint-disable no-magic-numbers */
const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const moment = require('moment');

const DATE_FORMAT = 'DD/MM/YYYY';
const MULTI_VESSEL_THRESHOLD = 6;
const IMO_IDENTIFIER_LABEL = 'IMO number or other unique vessel identifier (if applicable)';

function getVesselCount(exportPayload){
    const items = exportPayload?.items ?? [];

    const vesselCounts = {};
    let catchLength = 0;    // calculate number of lines. so we can calculate number of maxPages

    items.forEach((item) => {
        item.landings.forEach((landing) => {
            vesselCounts[landing.model.vessel.vesselName + landing.model.vessel.pln + landing.model.vessel.licenceNumber] = (vesselCounts[landing.model.vessel.vesselName + landing.model.vessel.pln + landing.model.vessel.licenceNumber] || 0) + 1;
            catchLength += 1;
        })
    });

    return { vesselCounts, catchLength };
}

function isMultiVessel(exportPayload){
    const { vesselCounts, catchLength } = getVesselCount(exportPayload);
    return Object.keys(vesselCounts).length > 1 || catchLength > MULTI_VESSEL_THRESHOLD;
}

function getCatchDates(startDate, dateLanded){
    const formattedStartDate = startDate ? moment(startDate).format(DATE_FORMAT) : null;
    const formattedDateLanded = moment(dateLanded).format(DATE_FORMAT);
    return formattedStartDate ? `${formattedStartDate} - ${formattedDateLanded}` : formattedDateLanded;
}

function getLandingDetail(vessel) {
    const licenceNumber = vessel.licenceNumber ?? '';
    if(!licenceNumber || !vessel.licenceValidTo) {
        return licenceNumber;
    }

    const dte = moment(vessel.licenceValidTo).format(DATE_FORMAT);
    return `${licenceNumber} - ${dte}`;
}

function getProductScheduleRows(exportPayload) {

    const items = exportPayload?.items ?? [];
    const rows = [];
    items.forEach((item) => {
        item.landings.forEach((landing) => {
            const vessel = landing.model.vessel;
            const faoArea = landing.model?.faoArea?.length > 0 ? landing.model.faoArea : 'FAO27';

            rows.push({
                species: item.product.species.admin ?? item.product.species.label,
                presentation: item.product.presentation.admin ?? item.product.presentation.label,
                commodityCode: item.product.commodityCodeAdmin ?? item.product.commodityCode,
                catchAreas: faoArea,
                dateLanded: getCatchDates(landing.model.startDate, landing.model.dateLanded),
                estimatedWeight: "",
                exportWeight: landing.model.exportWeight,
                verifiedWeight: "",
                vessel: vessel.vesselName,
                pln: vessel.pln,
                licenceDetail: getLandingDetail(vessel),
                faoArea: faoArea,
                homePort: vessel.homePort || '',
                imo: vessel.imoNumber || '',
                cfr: vessel.cfr || '',
                licenceHolder: vessel.licenceHolder,
                gearCode: landing.model.gearCode,
            });
        });
    });
    return rows;
}

/* eslint-disable no-magic-numbers */
const section6 = (doc, _data, startY) => {

    let yPos = startY;
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '6');

    const cellHeight = PdfStyle.ROW.HEIGHT * 2;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 220, cellHeight, ['Declaration of Transhipment at Sea', 'Name of Master of Fishing Vessel'])),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 235, yPos, 100, cellHeight, ['Signature', 'and Date'])),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 335, yPos, 115, cellHeight, ['Transhipment', 'Date/Area/Position'])),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 450, yPos, 80, cellHeight, 'Estimated weight (kg)'))
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos + cellHeight, 220, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 235, yPos + cellHeight, 100, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 335, yPos + cellHeight, 115, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 450, yPos + cellHeight, 80, cellHeight))
            ])
        ])
    ]));

    yPos += cellHeight + 30;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 100, cellHeight, ['Master of Receiving', 'Vessel'])),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 115, yPos, 100, cellHeight, 'Signature')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 215, yPos, 90, cellHeight, 'Vessel Name')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 305, yPos, 90, cellHeight, 'Call Sign')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 395, yPos, 135, cellHeight, [IMO_IDENTIFIER_LABEL]))
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos + cellHeight, 100, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 115, yPos + cellHeight, 100, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 215, yPos + cellHeight, 90, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 305, yPos + cellHeight, 90, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 395, yPos + cellHeight, 135, cellHeight))
            ])
        ])
    ]));
    PdfUtils.separator(doc, startY + 130);
};

const section5 = (doc, data, startY) => {
    let yPos = startY;
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '5    Name of master of fishing vessel or of fishing licence holder – Signature:');

    yPos += PdfStyle.ROW.HEIGHT;

    const licenceHolder = isMultiVessel(data.exportPayload) ? "Multiple vessels - See schedule" : getLicenceHolder(data.exportPayload);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 515, PdfStyle.ROW.HEIGHT, licenceHolder);

    yPos += PdfStyle.ROW.HEIGHT + 5;

    doc.text('* I am a representative of the vessel (s) shown on this document', PdfStyle.MARGIN.LEFT + 15, yPos);
    PdfUtils.separator(doc, startY + 45);
};

const section4 = (doc, data, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '4    References of applicable conservation and management measures');
    let policy = '';
    if (data.conservation) {
        policy = data.conservation.conservationReference === 'Other' ? data.conservation.anotherConservation : data.conservation.conservationReference;
    }
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, startY + 12, 515, PdfStyle.ROW.HEIGHT * 2, policy);
    PdfUtils.separator(doc, startY + 52);
};

function getLicenceHolder(exportPayload) {
    if (exportPayload?.items && exportPayload.items.length > 0) {
        const landings = exportPayload.items[0].landings;
        return landings && landings.length > 0 && landings[0].model?.vessel ? landings[0].model.vessel.licenceHolder : ''
    }

    return '';
}

function getDescOfProductRows(exportPayload) {
    const items = exportPayload?.items ?? [];
    const accum = {};
    if (items.length > 0) {
        items.forEach((item) => {
            item.landings.forEach((landing) => {
                const dte = moment(landing.model.dateLanded).format(DATE_FORMAT);
                let faoArea = 'FAO27';
                if (landing.model.faoArea && landing.model.faoArea.length > 0) {
                    faoArea = landing.model.faoArea;
                }
                const accumItem = accum[item.product.species.code + item.product.commodityCode + faoArea +landing.model.vessel.vesselName + landing.model.vessel.pln + dte];
                if (accumItem) {
                    const accumTotal = Number.parseFloat(accumItem.exportWeight) + Number.parseFloat(landing.model.exportWeight)
                    accumItem.exportWeight = accumTotal.toFixed(2);
                } else {
                    accum[item.product.species.code + item.product.commodityCode + faoArea + landing.model.vessel.vesselName + landing.model.vessel.pln + dte] = {
                        species: item.product.species.admin ?? item.product.species.label,
                        commodityCode: item.product.commodityCodeAdmin ?? item.product.commodityCode,
                        catchAreas: faoArea,
                        exclusiveEconomicZones: landing.model.exclusiveEconomicZones,
                        rfmo: landing.model.rfmo,
                        highSeasArea: landing.model.highSeasArea,
                        dates: getCatchDates(landing.model.startDate, landing.model.dateLanded),
                        exportWeight: Number(landing.model.exportWeight)
                    }
                }
            })
        });
    }
    return Object.values(accum);
}


function getExportWeight(weight) {
    return `${Number(Number(weight).toFixed(2)) > 9999999.99 ? Number.parseInt(weight, 10) : Number(weight).toFixed(2)}`;
}

function getExportWeightText(rowIdx, arrLength, rowData) {
    if (rowIdx < arrLength) {
        return getExportWeight(rowData[rowIdx].exportWeight);
    }
    return '';
}

function getImoOrCfrForMultiVesselSchedule(row) {
    if (row.imo) {
        return row.imo;
    } else if (row.cfr) {
        return row.cfr;
    } else {
        return '';
    }
}

function getImoOrCfr(vesselCounts, data) {
    if (Object.keys(vesselCounts).length === 1) {
        if (data.exportPayload.items[0].landings[0].model.vessel.imoNumber) {
            return data.exportPayload.items[0].landings[0].model.vessel.imoNumber;
        } else if (data.exportPayload.items[0].landings[0].model.vessel.cfr) {
            return data.exportPayload.items[0].landings[0].model.vessel.cfr;
        } else {
            return '';
        }
    }
    return '';
}

function getFishingGear(exportPayload) {
    const firstLanding = exportPayload?.items?.[0]?.landings?.[0];
    return firstLanding?.model?.gearType ?? '';
}

function getSection2Model(data) {
    const vesselCounts = {};
    const items = data.exportPayload?.items ?? [];

    items.forEach((item) => {
        item.landings.forEach((landing) => {
            const vessel = landing.model.vessel;
            const vesselKey = vessel.vesselName + vessel.pln + vessel.licenceNumber;
            vesselCounts[vesselKey] = (vesselCounts[vesselKey] || 0) + 1;
        });
    });

    const vesselCount = Object.keys(vesselCounts).length;
    const singleVessel = vesselCount === 1 ? items[0].landings[0].model.vessel : null;
    let vesselName = '';
    if (singleVessel) {
        vesselName = singleVessel.vesselName;
    } else if (vesselCount > 1) {
        vesselName = 'Multiple vessels - SEE SCHEDULE';
    } else {
        // Intentionally empty: default empty vessel name.
    }

    return {
        vesselName,
        homePortAndFlag: singleVessel ? `${singleVessel.flag} - ${singleVessel.homePort}` : '',
        pln: singleVessel?.pln ?? '',
        licenceNumber: singleVessel?.licenceNumber ?? '',
        licenceValidTo: singleVessel?.licenceValidTo
            ? moment(singleVessel.licenceValidTo, 'YYYY-MM-DD[T]HH:mm:ss').format(DATE_FORMAT)
            : '',
        imoNumberOrCfr: getImoOrCfr(vesselCounts, data),
        fishingGearText: isMultiVessel(data.exportPayload) ? 'Multiple vessels - SEE SCHEDULE' : getFishingGear(data.exportPayload),
    };
}

function buildCatchAreasText(row) {
    if (!row) {
        return '';
    }
    const rfmoAcronym = row.rfmo?.match(/\(([^)]{1,10})\)/) ? row.rfmo.match(/\(([^)]{1,10})\)/)[1] : '';
    const eezText = row.exclusiveEconomicZones?.map(eez => eez.isoCodeAlpha2).join(', ') || '';
    const highSeasText = row.highSeasArea === 'Yes' ? 'High Seas' : '';
    return [row.catchAreas, eezText, rfmoAcronym, highSeasText].filter(Boolean).join('\n');
}

function renderSection3Header(doc, myTable, startY, cellHeight) {
    const headerSpecs = [
        { leftMargin: 15, width: 110, text: 'Species' },
        { leftMargin: 125, width: 55, text: 'Product Code' },
        { leftMargin: 180, width: 80, text: ['Catch Area(s)', '(Catch Area,', 'EEZ, RFMO,', 'High Seas)'] },
        { leftMargin: 260, width: 80, text: ['Catch Date(s)', '(from - to)'] },
        { leftMargin: 340, width: 55, text: 'Estimated weight to be landed in kg' },
        { leftMargin: 395, width: 55, text: 'Net catch weight in kg' },
        { leftMargin: 450, width: 80, text: 'Verified weight landed (net catch weight in kg)' },
    ];

    const tableHead = doc.struct('THead');
    myTable.add(tableHead);
    const tableHeadRow = doc.struct('TR');
    tableHead.add(tableHeadRow);

    headerSpecs.forEach((spec) => {
        const headerCell = doc.struct('TH');
        tableHeadRow.add(headerCell);
        const headerContent = doc.markStructureContent('TH');
        headerCell.add(headerContent);
        PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + spec.leftMargin, startY + 48, spec.width, cellHeight, spec.text);
        headerCell.end();
    });

    tableHeadRow.end();
    tableHead.end();
}

function renderSection3BodyRow(doc, tableBodyRow, y, rowIdx, arrLength, rowData) {
    const row = rowData[rowIdx] || {};
    const rowSpecs = [
        { leftMargin: 15, width: 110, text: row.species || '' },
        { leftMargin: 125, width: 55, text: row.commodityCode || '' },
        { leftMargin: 180, width: 80, text: buildCatchAreasText(rowData[rowIdx]), lines: 4 },
        { leftMargin: 260, width: 80, text: row.dates || '', lines: 2 },
        { leftMargin: 340, width: 55, text: '' },
        { leftMargin: 395, width: 55, text: getExportWeightText(rowIdx, arrLength, rowData) },
        { leftMargin: 450, width: 80, text: '' },
    ];

    rowSpecs.forEach((spec) => {
        const bodyCell = doc.struct('TD');
        tableBodyRow.add(bodyCell);
        const bodyContent = doc.markStructureContent('TD');
        bodyCell.add(bodyContent);
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + spec.leftMargin, y, spec.width, PdfStyle.ROW.HEIGHT + 30, spec.text, spec.lines);
        bodyCell.end();
    });
}

const section3 = (doc, data, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '3    Description of Product');
    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 15, startY + 14, 'Type of processing authorised on board:');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, startY + 26, 515, PdfStyle.ROW.HEIGHT);

    let cellHeight = PdfStyle.ROW.HEIGHT * 3;
    const rowData = getDescOfProductRows(data.exportPayload);
    const arrLength = rowData.length;
    const allRowsLength = getProductScheduleRows(data.exportPayload).length;

    const myTable = doc.struct('Table');
    doc.addStructure(myTable);
    renderSection3Header(doc, myTable, startY, cellHeight);

    const tableBody = doc.struct('TBody');
    myTable.add(tableBody);

    let y = startY + 48 + cellHeight;
    const listLimit = arrLength > 6 ? 0 : 6;

    for (let rowIdx = 0; rowIdx < listLimit; rowIdx++) {
        const tableBodyRow = doc.struct('TR');
        tableBody.add(tableBodyRow);
        renderSection3BodyRow(doc, tableBodyRow, y, rowIdx, arrLength, rowData);
        tableBodyRow.end();
        y += PdfStyle.ROW.HEIGHT + 30;
    }
    doc.endMarkedContent();

    if (arrLength > 6) {
        cellHeight = PdfStyle.ROW.HEIGHT * 6;
        const seeScheduleRow = doc.struct('TR', () => {
            PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, y, 515, cellHeight, `SEE SCHEDULE (${allRowsLength} rows)`);
        });
        tableBody.add(seeScheduleRow);
        seeScheduleRow.end();
    }

    tableBody.end();
    myTable.end();
    PdfUtils.separator(doc, startY + 388);
};

const section2 = (doc, data, startY) => {
    const section2Model = getSection2Model(data);

    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + 4, '2    Fishing Vessel Name');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 120, startY + 2, 155, PdfStyle.ROW.HEIGHT, section2Model.vesselName);

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 285, startY + 4, 'Flag - Home Port');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 400, startY + 2, 130, PdfStyle.ROW.HEIGHT, section2Model.homePortAndFlag);

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 15, startY + 29, 'Call Sign / PLN');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 120, startY + 27, 155, PdfStyle.ROW.HEIGHT, section2Model.pln);

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 285, startY + 18, 'IMO number or other');
    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 285, startY + 30, 'unique vessel identifier');
    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 285, startY + 42, '(if applicable)');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 400, startY + 26, 130, PdfStyle.ROW.HEIGHT, section2Model.imoNumberOrCfr);

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 15, startY + 54, 'Fishing Licence No.');

    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 120, startY + 52, 220, PdfStyle.ROW.HEIGHT, section2Model.licenceNumber);

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 350, startY + 54, 'Valid to');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 400, startY + 52, 130, PdfStyle.ROW.HEIGHT, section2Model.licenceValidTo);

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 15, startY + 77, 'Fishing Gear');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 120, startY + 77, 410, PdfStyle.ROW.HEIGHT, section2Model.fishingGearText);

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 15, startY + 100, 'Inmarsat No. Telefax No. Telephone No. E-mail address (if issued)');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, startY + 112, 515, PdfStyle.ROW.HEIGHT);

    PdfUtils.separator(doc, startY + 137);
};

const section1 = (doc, data, isSample, startY) => {
    doc.fontSize(PdfStyle.FONT_SIZE.MEDIUM);
    doc.addStructure(doc.struct('H3', {}, () => {
        doc.text('(i) CATCH CERTIFICATE', PdfStyle.MARGIN.LEFT, startY);
    }));
    doc.lineWidth(2);
    doc.moveTo(153, startY + 4).lineTo(560, startY + 4).stroke();

    let documentNumber = '';
    if (!data.isBlankTemplate) {
        if (isSample) {
            documentNumber = '###-####-##-#########';
        } else {
            documentNumber = data.documentNumber;
        }
    }
    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT, startY + 20, 'Document Number');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 95, startY + 18, 160, PdfStyle.ROW.HEIGHT, documentNumber);

    PdfUtils.label(doc, 300, startY + 20, 'Validating Authority');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 380, startY + 18, 150, PdfStyle.ROW.HEIGHT, 'Marine Management Organisation');

    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + 40, '1    Name');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 65, startY + 38, 465, PdfStyle.ROW.HEIGHT, 'Illegal Unreported and Unregulated (IUU) Fishing Team');

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 15, startY + 60, 'Address');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 65, startY + 58, 465, PdfStyle.ROW.HEIGHT * 2 + 5, 'Tyneside House, Skinnerburn Rd, Newcastle upon Tyne, United Kingdom. NE4 7AR');

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 65, startY + 100, 'Tel.');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 90, startY + 98, 200, PdfStyle.ROW.HEIGHT, '0300 123 1032');

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 300, startY + 100, 'Email');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 330, startY + 98, 200, PdfStyle.ROW.HEIGHT, 'ukiuuslo@marinemanagement.org.uk');

    PdfUtils.separator(doc, startY + 123);

};


module.exports = {
    getCatchDates,
    getLandingDetail,
    getVesselCount,
    isMultiVessel,
    getProductScheduleRows,
    getImoOrCfrForMultiVesselSchedule,
    section1, section2, section3, section4, section5, section6,
};
