const muhammara = require('muhammara');
const PDFDigitalForm = require('../utils/pdf-digital-form');

const EXPORTER_ADDRESS_KEY = 'Name and address of Exporter';
const SINGLE_VESSEL_PLN_KEY = 'Call sign/PLN';
const SINGLE_VESSEL_NAME_KEY = 'Vessel';
const SINGLE_VESSEL_FLAG_KEY = 'Flag - Home Port & Reg Number';
const SINGLE_VESSEL_LICENSE_NO_KEY = 'Fishing Licence number';
const SINGLE_VESSEL_IMO_KEY = 'IMO';
const SINGLE_VESSEL_LICENSE_VALID_TO_KEY = 'Licence valid to';
const SINGLE_VESSEL_GEAR_CODE_KEY = 'Fishing Gear';
const SINGLE_VESSEL_CONTACT_KEY = 'Inmarsat No Telefax No Telephone No Email address if issued';

const VESSEL_REP_KEY = 'Person responsible for vessels';

const SCHED_SPECIES_ROW_1_KEY = 'SpeciesRow1';

const FP_PROD_CODE_KEY_PREFIX = 'Product Code ';
const FP_SPECIES_KEY_PREFIX = 'Species ';
const FP_CATCH_AREA_KEY_PREFIX = 'Catch Areas ';
const FP_DATES_LANDED_KEY_PREFIX = 'Catch Date ';
const FP_WEIGHT_KEY_PREFIX = 'Net catch weight ';

const TRANSPORT_PLACE_OF_DEPARTURE_KEY = 'Port/airport/other point of departure';
const TRANSPORT_POINT_OF_DESTINATION_KEY = 'Point of destination';
const TRANSPORT_VESSEL_KEY = 'Vessel name and flag';
const TRANSPORT_FLIGHT_NO_KEY = 'Flight number/airway bill number';
const TRANSPORT_REG_NO_KEY = 'Truck nationality and registration number';
const TRANSPORT_RAILWAY_BILL_NO_KEY = 'Railway bill number';
const TRANSPORT_FREIGHT_BILL_NO_KEY = 'Freight bill number';
const TRANSPORT_CONTAINER_ID_KEY = 'Container identification numbers';
const TRANSPORT_OTHER_DOCS_KEY = 'Other transport documents';
const TRANSPORT_EXPORTER_NAME_KEY = 'Name_2';
const TRANSPORT_EXPORTER_ADDRESS_KEY = 'Address_3';
const TRANSPORT_CONTAINER_NUMS_KEY = 'Container numbers';

const DATE_ACCEPTANCE_KEY = 'Date of Acceptance';
const DATE_ISSUED_KEY = 'Date Issued';

const SCHED_SPECIES_PREFIX = 'SpeciesRow';
const SCHED_PRESENTATION_PREFIX = 'PresentationRow';
const SCHED_PRODUCT_CODE_PREFIX = 'Product codeRow';
const SCHED_DATE_LANDED_PREFIX = 'Date LandedRow';
const SCHED_CONSIGNED_WEIGHT_PREFIX = 'Consigned weight kgRow';
const SCHED_VESSEL_NAME_PREFIX = 'Vessel nameRow';
const SCHED_VESSEL_PLN_PREFIX = 'PLN  CallsignRow';
const SCHED_VESSEL_IMO_PREFIX = 'IMO  Lloyds NumberRow';
const SCHED_VESSEL_LICENCE_NO_PREFIX = 'Licence NumberRow';
const SCHED_FAO_AREA_PREFIX = 'FAO AREARow';

const parseExportCert = async (pdfJson, buffer) => {
    let result = {...pdfJson};
    let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(buffer));
    let form = new PDFDigitalForm(pdfReader);
    let raw = form.createSimpleKeyValue();
    result.errors = [];

    result.exporter = parseExporter(raw);
    result.errors = result.errors.concat(validateExporter(result.exporter));

    let singleVessel;
    if (raw[SCHED_SPECIES_ROW_1_KEY] === null || raw[SCHED_SPECIES_ROW_1_KEY].trim().length === 0) {
        // no schedule extract single vessel details from first page
        singleVessel = parseSingleVessel(raw, result);
        result.errors = result.errors.concat(validateSingleVessel(singleVessel));
        // and that catch info from the first page
        extractFrontPageExportPayload(raw, singleVessel, result);
    } else if ((raw[FP_SPECIES_KEY_PREFIX + '1'] &&  raw[FP_SPECIES_KEY_PREFIX + '1'].trim().length > 0)
                || (raw[FP_PROD_CODE_KEY_PREFIX + '1'] &&  raw[FP_PROD_CODE_KEY_PREFIX + '1'].trim().length > 0)
                || (raw[FP_SPECIES_KEY_PREFIX + '2'] &&  raw[FP_SPECIES_KEY_PREFIX + '2'].trim().length > 0)
                || (raw[FP_PROD_CODE_KEY_PREFIX + '2'] &&  raw[FP_PROD_CODE_KEY_PREFIX + '2'].trim().length > 0)) {
        // cant have items in schedule and front page product details
        result.errors = result.errors.concat('Export payload details have been added to both the front page and the schedule');
    }
    else {
        extractScheduleExportPayload(raw, result);
    }

    result.transport = parseTransport(raw);

    result.errors = result.errors.concat(validateTransport(result.transport));

    result.dateAcceptance = raw[DATE_ACCEPTANCE_KEY];
    result.errors = result.errors.concat(validateRequired(result.dateAcceptance, 'Date of acceptance is required'));
    result.dateIssued = raw[DATE_ISSUED_KEY];
    result.errors = result.errors.concat(validateRequired(result.dateIssued, 'Date issued is required'));

    return result;
};

const extractScheduleExportPayload = (raw, result) => {
    let items = [];
    let pageIdx;
    let rowIdx;
    for (pageIdx = 1; pageIdx <= 3; pageIdx++) {
        for (rowIdx = 1; rowIdx <= 14; rowIdx++) {
            let item = extractScheduleExportItem(pageIdx, rowIdx, raw);
            if (item) {
                items.push(item);
                result.errors = result.errors.concat(validateScheduleExportItem(pageIdx, rowIdx, item));
            }
        }
    }
    result.exportPayload = {
        items: items
    }
}

const extractScheduleExportItem = (pageIdx, rowIdx, raw) => {
    let item = {
        product: extractScheduleExportItemProduct(pageIdx, rowIdx, raw)
    }
    if (!item.product) {
        return null;
    } else {
        item.landings = extractScheduleExportItemLandings(pageIdx, rowIdx, raw);
        return item;
    }
}

const extractScheduleExportItemProduct = (pageIdx, rowIdx, raw) => {
    let product = {};
    let prodCodeKey = SCHED_PRODUCT_CODE_PREFIX + rowIdx;
    let speciesKey = SCHED_SPECIES_PREFIX + rowIdx;
    let presKey = SCHED_PRESENTATION_PREFIX + rowIdx;

    if (1!== pageIdx) {
        prodCodeKey = prodCodeKey + '_' + pageIdx;
        speciesKey = speciesKey + '_' + pageIdx;
        presKey = presKey + '_' + pageIdx;
    }

    product.commodityCode = raw[prodCodeKey];
    product.species = {
        label: raw[speciesKey]
    };
    product.presentation = {
        label: raw[presKey]
    };
    if ((!product.commodityCode || product.commodityCode.trim().length === 0)
        && (!product.species?.label || product.species.label.trim().length === 0)
        && (!product.presentation?.label || product.presentation.label.trim().length === 0)) {
        return null;
    } else {
        return product;
    }
}

const extractScheduleExportItemLandings = (pageIdx, rowIdx, raw) => {
    let landings = [{ model: {}}];
    let dateLandedKey = SCHED_DATE_LANDED_PREFIX + rowIdx;
    let consignedWeightKey = SCHED_CONSIGNED_WEIGHT_PREFIX + rowIdx;
    let vesselNameKey = SCHED_VESSEL_NAME_PREFIX + rowIdx;
    let vesselPlnKey = SCHED_VESSEL_PLN_PREFIX + rowIdx;
    let vesselImoKey = SCHED_VESSEL_IMO_PREFIX + rowIdx;
    let vesselLicenseNoKey = SCHED_VESSEL_LICENCE_NO_PREFIX + rowIdx;
    let faoAreaKey = SCHED_FAO_AREA_PREFIX + rowIdx;

    if (1!== pageIdx) {
        dateLandedKey = dateLandedKey + '_' + pageIdx;
        consignedWeightKey = consignedWeightKey + '_' + pageIdx;
        vesselNameKey = vesselNameKey + '_' + pageIdx;
        vesselPlnKey = vesselPlnKey + '_' + pageIdx;
        vesselImoKey = vesselImoKey + '_' + pageIdx;
        vesselLicenseNoKey = vesselLicenseNoKey + '_' + pageIdx;
        faoAreaKey = faoAreaKey + '_' + pageIdx;
    }

    landings[0].model.faoArea = raw[faoAreaKey];
    landings[0].model.dateLanded = raw[dateLandedKey];
    landings[0].model.exportWeight = raw[consignedWeightKey];
    if (!landings[0].model.faoArea || landings[0].model.faoArea.trim().length === 0) {
        landings[0].model.faoArea = 'FAO27';
    }

    landings[0].model.vessel = {
        'pln': raw[vesselPlnKey],
        'vesselName': raw[vesselNameKey],
        'licenceNumber': raw[vesselLicenseNoKey],
        'imoNumber': raw[vesselImoKey],
        'label': raw[vesselNameKey]
    };
    return landings;
}

const extractFrontPageExportPayload = (raw, singleVessel, result) => {
    let items = [];
    let i;
    for (i = 0; i < 6; i++) {
        let item = extractFrontPageExportItem(i, raw, singleVessel);
        if (item) {
            items.push(item);
            result.errors = result.errors.concat(validateFrontPageExportItem(i, item));
        }
    }
    if (items.length === 0) {
        result.errors = result.errors.concat('No export items listed');
    }
    result.exportPayload = {
        items: items
    }
}

const extractFrontPageExportItem = (i, raw, singleVessel) => {
    let item = {
        product: extractFrontPageExportItemProduct(i, raw)
    }
    if (!item.product) {
        return null;
    } else {
        item.landings = extractFrontPageExportItemLandings(i, raw, singleVessel);
        return item;
    }
}

const extractFrontPageExportItemProduct = (i, raw) => {
    let product = {};
    product.commodityCode = raw[FP_PROD_CODE_KEY_PREFIX + (i + 1)];
    product.species = {
        label: raw[FP_SPECIES_KEY_PREFIX + (i + 1)]
    };
    if ((!product.commodityCode || product.commodityCode.trim().length === 0)
            && (!product.species?.label || product.species.label.trim().length === 0)) {
        return null;
    } else {
        return product;
    }
}

const extractFrontPageExportItemLandings = (i, raw, singleVessel) => {
    let landings = [{ model: {}}];
    landings[0].model.faoArea = raw[FP_CATCH_AREA_KEY_PREFIX + i];
    landings[0].model.dateLanded = raw[FP_DATES_LANDED_KEY_PREFIX + i];
    landings[0].model.exportWeight = raw[FP_WEIGHT_KEY_PREFIX + i];
    landings[0].model.vessel = singleVessel;

    if (!landings[0].model.faoArea || landings[0].model.faoArea.trim().length === 0) {
        landings[0].model.faoArea = 'FAO27';
    }
    return landings;
}

const hasValue = (value) => {
    return value?.trim()?.length > 0;
};

const setIfHasValue = (obj, key, value) => {
    if (hasValue(value)) {
        obj[key] = value;
    }
};

const parseTransport = (raw) => {
    const transport = {};
    let vehicle = '';
    
    // Vehicle type detection - last valid value wins
    const vehicleMap = [
        { key: TRANSPORT_FLIGHT_NO_KEY, type: 'plane', field: 'flightNumber' },
        { key: TRANSPORT_REG_NO_KEY, type: 'truck', field: 'registrationNumber' },
        { key: TRANSPORT_RAILWAY_BILL_NO_KEY, type: 'train', field: 'railwayBillNumber' },
        { key: TRANSPORT_VESSEL_KEY, type: 'containerVessel', field: 'vesselName' }
    ];
    
    vehicleMap.forEach(({ key, type, field }) => {
        if (hasValue(raw?.[key])) {
            vehicle = type;
            transport[field] = raw[key];
        }
    });
    
    if (!vehicle) {
        vehicle = 'directLanding';
    }
    
    // Simple field mappings
    const fieldMappings = [
        { key: TRANSPORT_PLACE_OF_DEPARTURE_KEY, field: 'departurePlace' },
        { key: TRANSPORT_FREIGHT_BILL_NO_KEY, field: 'freightBillNumber' },
        { key: TRANSPORT_CONTAINER_NUMS_KEY, field: 'containerNumber' },
        { key: TRANSPORT_CONTAINER_ID_KEY, field: 'containerIdentificationNumber' },
        { key: TRANSPORT_OTHER_DOCS_KEY, field: 'otherDocuments' },
        { key: TRANSPORT_EXPORTER_NAME_KEY, field: 'exporterName' },
        { key: TRANSPORT_EXPORTER_ADDRESS_KEY, field: 'exporterAddress' }
    ];
    
    fieldMappings.forEach(({ key, field }) => {
        setIfHasValue(transport, field, raw?.[key]);
    });
// Map Point of destination to exportedTo.pointOfDestination
    if (hasValue(raw?.[TRANSPORT_POINT_OF_DESTINATION_KEY])) {
        transport.exportedTo = { pointOfDestination: raw[TRANSPORT_POINT_OF_DESTINATION_KEY] };
    }
    transport.vehicle = vehicle;
    return transport;
};

const parseExporter = (raw) => {
    let exporter = {};
    exporter.exporterFullName = raw[VESSEL_REP_KEY];
    exporter.exporterAddress = raw[EXPORTER_ADDRESS_KEY]; // ! not a direct match to online form
    return exporter;
};

const parseSingleVessel = (raw, result) => {
    let vessel = {};
    vessel.pln = raw[SINGLE_VESSEL_PLN_KEY];
    vessel.vesselName = raw[SINGLE_VESSEL_NAME_KEY];
    vessel.flag = raw[SINGLE_VESSEL_FLAG_KEY];
    vessel.licenceNumber = raw[SINGLE_VESSEL_LICENSE_NO_KEY];
    vessel.imoNumber = raw[SINGLE_VESSEL_IMO_KEY];
    vessel.licenceValidTo = raw[SINGLE_VESSEL_LICENSE_VALID_TO_KEY];
    vessel.gearCode = raw[SINGLE_VESSEL_GEAR_CODE_KEY];
    vessel.label = raw[SINGLE_VESSEL_NAME_KEY];
    vessel.contact = raw[SINGLE_VESSEL_CONTACT_KEY];
    return vessel;
};

const verifyExportItemLabel = (label) => {
    return !label || label?.trim()?.length === 0
}

const validateScheduleExportItem = (pageIdx, rowIdx, item) => {

    const errors = [];
    if (verifyExportItemLabel(item.product.species.label)) {
        errors.push('Species required on schedule page ' + pageIdx + ' row ' + rowIdx);
    }
    if (verifyExportItemLabel(item.product.presentation.label)) {
        errors.push('Presentation required on schedule page ' + pageIdx + ' row ' + rowIdx);
    }
    if (verifyExportItemLabel(item.product.commodityCode)) {
        errors.push('Product code required on schedule page ' + pageIdx + ' row ' + rowIdx);
    }
    if (verifyExportItemLabel(item.landings[0].model.dateLanded)) {
        errors.push('Dates landed required on schedule page ' + pageIdx + ' row ' + rowIdx);
    }
    if (verifyExportItemLabel(item.landings[0].model.exportWeight)) {
        errors.push('Consigned weight (kg) required on schedule page ' + pageIdx + ' row ' + rowIdx);
    }

    if (!item.landings[0].model.vessel || verifyExportItemLabel(item.landings[0].model.vessel.vesselName)) {
        errors.push('Vessel name is required on schedule page ' + pageIdx + ' row ' + rowIdx);
    }
    if (!item.landings[0].model.vessel || verifyExportItemLabel(item.landings[0].model.vessel.pln)) {
        errors.push('PLN / Call Sign is required on schedule page ' + pageIdx + ' row ' + rowIdx);
    }
    if (!item.landings[0].model.vessel || verifyExportItemLabel(item.landings[0].model.vessel.imoNumber)) {
        errors.push('IMO / Lloyd’s number is required on schedule page ' + pageIdx + ' row ' + rowIdx);
    }
    if (!item.landings[0].model.vessel || verifyExportItemLabel(item.landings[0].model.vessel.licenceNumber)) {
        errors.push('Fishing licence number is required on schedule page ' + pageIdx + ' row ' + rowIdx);
    }
    return errors;
}

const validateFrontPageExportItem = (idx, item) => {

    const errors = [];
    if (!item.product.species.label || item.product.species.label.trim().length === 0) {
        errors.push('Species required on row ' + (idx + 1));
    }
    if (!item.product.commodityCode || item.product.commodityCode.trim().length === 0) {
        errors.push('Product code required on row ' + (idx + 1));
    }

    if (!item.landings[0].model.dateLanded || item.landings[0].model.dateLanded.trim().length === 0) {
        errors.push('Dates landed required on row ' + (idx + 1));
    }

    if (!item.landings[0].model.exportWeight || item.landings[0].model.exportWeight.trim().length === 0) {
        errors.push('Estimated weight to be landed (kg) required on row ' + (idx + 1));
    }
    return errors;
}

const validateSingleVessel = (vessel) => {
    const errors = [];
    if (!vessel?.vesselName || vessel.vesselName.trim().length === 0) {
        errors.push('Vessel name is required');
    }
    if (!vessel?.pln || vessel.pln.trim().length === 0) {
        errors.push('Vessel Call Sign / PLN is required');
    }
    if (!vessel?.licenceNumber || vessel.licenceNumber.trim().length === 0) {
        errors.push('Fishing licence number is required');
    }
    return errors;
};

const validateExporter = (exporter) => {
    let errors = validateRequired(exporter.exporterFullName, 'Name of master or representative (exporter) required');
    errors = errors.concat(validateRequired(exporter.exporterAddress, 'Exporter name and address required'));
    return errors;
};

const validateTransport = (transport) => {
    let errors = validateRequired(transport.departurePlace, 'Place of departure is required');
    return errors;
};

const validateRequired = (item, errorMessage) => {
    const errors = [];
    if (!item || item.trim().length === 0) {
        errors.push(errorMessage);
    }
    return errors;
};

module.exports = parseExportCert;
module.exports.parseTransport = parseTransport;