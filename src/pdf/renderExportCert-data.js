const moment = require('moment');

const DATE_FORMAT_DDMMYYYY = 'DD/MM/YYYY';
const MAX_SINGLE_VESSEL_LINES = 6;

function getVesselCount(exportPayload){
    let items = [];

    if (exportPayload?.items) {
        items =  exportPayload.items;
    }

    const vesselCounts = {};
    let catchLength = 0;    // calculate number of lines. so we can calculate number of maxPages

    items.forEach((item) => {
        item.landings.forEach((landing) => {
            vesselCounts[landing.model.vessel.vesselName + landing.model.vessel.pln + landing.model.vessel.licenceNumber] = (vesselCounts[landing.model.vessel.vesselName + landing.model.vessel.pln + landing.model.vessel.licenceNumber]?? 0) + 1;
            catchLength += 1;
        })
    });

    return { vesselCounts, catchLength };
}

function isMultiVessel(exportPayload){
    const { vesselCounts, catchLength } = getVesselCount(exportPayload);
    return Object.keys(vesselCounts).length > 1 || catchLength > MAX_SINGLE_VESSEL_LINES;
}

function getCatchDates(startDate, dateLanded){
    const formattedStartDate = startDate ? moment(startDate).format(DATE_FORMAT_DDMMYYYY) : null;
    const formattedDateLanded = moment(dateLanded).format(DATE_FORMAT_DDMMYYYY);
    return formattedStartDate ? `${formattedStartDate} - ${formattedDateLanded}` : formattedDateLanded;
}

function getLandingDetail(vessel) {
    let landingDetail = vessel.licenceNumber ?? '';
    if (landingDetail && vessel.licenceValidTo) {
        const dte = moment(vessel.licenceValidTo).format(DATE_FORMAT_DDMMYYYY);
        landingDetail = `${landingDetail} - ${dte}`;
    }
    return landingDetail;
}

function buildProductRow(item, landing, faoArea, landingDetail) {
    return {
        species: item.product.species.admin ?? item.product.species.label,
        presentation: item.product.presentation.admin ?? item.product.presentation.label,
        commodityCode: item.product.commodityCodeAdmin ?? item.product.commodityCode,
        catchAreas: faoArea,
        dateLanded: getCatchDates(landing.model.startDate, landing.model.dateLanded),
        estimatedWeight: "",
        exportWeight: landing.model.exportWeight,
        verifiedWeight: "",
        vessel: landing.model.vessel.vesselName,
        pln: landing.model.vessel.pln,
        licenceDetail: landingDetail,
        faoArea: faoArea,
        exclusiveEconomicZones: landing.model.exclusiveEconomicZones,
        rfmo: landing.model.rfmo,
        highSeasArea: landing.model.highSeasArea,
        homePort: landing.model.vessel.homePort ?? '',
        imo: landing.model.vessel.imoNumber ?? '',
        cfr: landing.model.vessel.cfr ?? '',
        licenceHolder: landing.model.vessel.licenceHolder ?? '',
        gearCode: landing.model.gearCode,
    };
}

function getProductScheduleRows(exportPayload) {
    const items = exportPayload?.items ?? [];
    const rows = [];
    items.forEach((item) => {
        item.landings.forEach((landing) => {
            const faoArea = landing.model?.faoArea?.length > 0 ? landing.model.faoArea : 'FAO27';
            const landingDetail = getLandingDetail(landing.model.vessel);
            rows.push(buildProductRow(item, landing, faoArea, landingDetail));
        });
    });
    return rows;
}

function getLicenceHolder(exportPayload) {
    if (exportPayload?.items && exportPayload.items.length > 0) {
        const landings = exportPayload.items[0].landings;
        return landings && landings.length > 0 && landings[0].model?.vessel ? landings[0].model.vessel.licenceHolder : ''
    }

    return '';
}

function getDescOfProductRows(exportPayload) {

    let items = [];
    if (exportPayload?.items) {
        items =  exportPayload.items;
    }
    const accum = {};
    if (items.length > 0) {
        items.forEach((item) => {
            item.landings.forEach((landing) => {
                const dte = moment(landing.model.dateLanded).format(DATE_FORMAT_DDMMYYYY);
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

const MAX_EXPORT_WEIGHT = 9999999.99;

function getExportWeight(weight) {
    const numericWeight = Number(weight);
    return `${numericWeight > MAX_EXPORT_WEIGHT ? Number.parseInt(numericWeight) : numericWeight.toFixed(2)}`;
}

function getExportWeightText(rowIdx, arrLength, rowData) {
    if (rowIdx < arrLength) {
        return getExportWeight(rowData[rowIdx].exportWeight);
    }
    return '';
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

module.exports = {
    DATE_FORMAT_DDMMYYYY,
    getVesselCount,
    isMultiVessel,
    getCatchDates,
    getLandingDetail,
    buildProductRow,
    getProductScheduleRows,
    getLicenceHolder,
    getDescOfProductRows,
    MAX_EXPORT_WEIGHT,
    getExportWeight,
    getExportWeightText,
    getImoOrCfr,
    getFishingGear,
};
