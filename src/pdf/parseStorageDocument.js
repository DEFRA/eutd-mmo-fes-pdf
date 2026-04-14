const muhammara = require('muhammara');
const PDFDigitalForm = require('../utils/pdf-digital-form');

const DEPT_PLACE_KEY = 'Date  Port or Place of Departure';
const DEPT_CONTAINER_NUMBERS_KEY = 'Container numbers where applicable';
const DEPT_DETAILS_KEY = 'Details of Transport';

const FP_STORAGE_FAC_NAME_KEY = 'Name';
const FP_STORAGE_FAC_ADDRESS_KEY = 'Address';
const FP_STORAGE_FAC_CHILLED_KEY =  'Chilled';
const FP_STORAGE_FAC_FROZEN_KEY =  'Frozen';

const FP_CONS_PROD_KEY = 'Description';
const FP_CONS_CODE_KEY = 'Commodity Code';
const FP_CONS_CC_KEY = 'Catch Cert';
const FP_CONS_WEIGHT_KEY = 'Weight';
const FP_CONS_DATE_KEY = 'Date of unloading';
const FP_CONS_PLACE_KEY = 'Place of unloading';
const FP_CONS_TRANSPORT_KEY = 'Transport';

const EXPORTER_COMPANY_NAME_KEY = 'Company name';
const EXPORTER_ADDRESS_KEY = 'Address_2';
const EXPORTER_DATE_ACCEPT_KEY = 'Date';

const DATE_ISSUED_KEY = 'Date Issued';

const SCHED_CONS_PROD_KEY_PREFIX = 'Exact description of fisheries productsRow';
const SCHED_CONS_CODE_KEY_PREFIX = 'Commodity CodeRow';
const SCHED_CONS_CC_KEY_PREFIX = 'Catch Certificate  Processing StatementRow';
const SCHED_CONS_WEIGHT_KEY_PREFIX = 'WeightkgRow';
const SCHED_CONS_DATE_KEY_PREFIX = 'Date of unloadingRow';
const SCHED_CONS_PLACE_KEY_PREFIX = 'Place of unloadingRow';
const SCHED_CONS_TRANSPORT_KEY_PREFIX = 'Details of transport unloaded fromRow';

const SCHED_FAC_NAME_KEY_PREFIX = 'Name';
const SCHED_FAC_ADDRESS_KEY_PREFIX = 'AddressRow';

const hasFrontPageConsDetails = (raw) => {
    const hasBasic = (raw?.[FP_CONS_PROD_KEY]?.trim()?.length > 0)
        || (raw?.[FP_CONS_CODE_KEY]?.trim()?.length > 0)
        || (raw[FP_CONS_CC_KEY]?.trim()?.length > 0);
    const hasOptional = (raw?.[FP_CONS_WEIGHT_KEY]?.trim()?.length > 0)
        || (raw?.[FP_CONS_DATE_KEY]?.trim()?.length > 0)
        || (raw?.[FP_CONS_PLACE_KEY]?.trim()?.length > 0)
        || (raw?.[FP_CONS_TRANSPORT_KEY]?.trim()?.length > 0);
    return hasBasic || hasOptional;
};

const isConsDetailItemEmpty = (item) => {
    const basicEmpty = !item?.product?.trim() && !item?.commodityCode?.trim() && !item?.certificateNumber?.trim();
    const optionalEmpty = !item?.productWeight?.trim() && !item?.dateOfUnloading?.trim() && !item?.placeOfUnloading?.trim()
        && !item?.transportUnloadedFrom?.trim();
    return basicEmpty && optionalEmpty;
};

const parseStorageDocument = async (pdfJson, buffer) => {
    const result = {...pdfJson};
    const pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(buffer));
    const form = new PDFDigitalForm(pdfReader);
    const raw = form.createSimpleKeyValue();
    result.errors = [];

    if ((raw[SCHED_CONS_PROD_KEY_PREFIX + '1'] === null || raw[SCHED_CONS_PROD_KEY_PREFIX + '1'].trim().length === 0)
            && (raw[SCHED_CONS_CODE_KEY_PREFIX + '1'] === null || raw[SCHED_CONS_CODE_KEY_PREFIX + '1'].trim().length === 0)) {
        // no schedule extract catch details from first page
        extractFrontPageConsDetails(raw, result);
    } else if (hasFrontPageConsDetails(raw)) {
        // cant have items in schedule and front page product details
        result.errors = result.errors.concat('Consignment details have been added to both the front page and the schedule');
    } else {
        extractScheduleConsDetails(raw, result);
    }

    extractDepartureDetails(raw, result);
    extractExporterDetails(raw, result);

    // A problem with the editable pdf makes it difficult for us to determine whether the storage facilities
    // are provided on the front page or the schedule
    // The storage facility name on the front page and the first row in the schedule (Name) have the same field name :(
    if (/*(raw[SCHED_FAC_NAME_KEY_PREFIX] === null || raw[SCHED_FAC_NAME_KEY_PREFIX].trim().length === 0) &&*/
        (raw[SCHED_FAC_ADDRESS_KEY_PREFIX + '1'] === null || raw[SCHED_FAC_ADDRESS_KEY_PREFIX + '1'].trim().length === 0)
        )
    {
        // no schedule - extract facility details from first page
        extractFrontPageFacilityDetails(raw, result);
    } else if (/*(raw[FP_STORAGE_FAC_NAME_KEY] &&  raw[FP_STORAGE_FAC_NAME_KEY].trim().length > 0)
            || */raw?.[FP_STORAGE_FAC_ADDRESS_KEY]?.trim()?.length > 0
            )
    {
        // cant have items in schedule and front page facility details
        result.errors = result.errors.concat('Storage facility details have been added to both the front page and the schedule');
    } else {
        extractScheduleFacilityDetails(raw, result);
    }

    result.dateIssued = raw[DATE_ISSUED_KEY];
    result.errors = result.errors.concat(validateRequired(result.dateIssued, 'Date issued is required'));

    return result;
};

const extractScheduleFacilityDetails = (raw, result) => {
    const facilities = [];
    let pageIdx;
    let rowIdx;
    const SCHEDULE_PAGE = 5;
    for (pageIdx = SCHEDULE_PAGE; pageIdx <= SCHEDULE_PAGE; pageIdx++) {
        for (rowIdx = 1; rowIdx <= 24; rowIdx++) {
            const item = extractScheduleFacilityDetailItem(pageIdx, rowIdx, raw);
            if (item) {
                facilities.push(item);
                result.errors = result.errors.concat(validateScheduleFacilityDetailItem(pageIdx, rowIdx, item));
            }
        }
    }
    result.storageFacilities = facilities;
};

const extractScheduleFacilityDetailItem = (_pageIdx, rowIdx, raw) => {
    const nameKey = rowIdx === 1 ? SCHED_FAC_NAME_KEY_PREFIX : `${SCHED_FAC_NAME_KEY_PREFIX} ${rowIdx}`;
    const addressKey = `${SCHED_FAC_ADDRESS_KEY_PREFIX}${rowIdx}`;

    const item = {
        facilityName: raw[nameKey],
        facilityAddress: raw[addressKey]
    };

    if ((!item.facilityName || item.facilityName.trim().length === 0)
        && (!item.facilityAddress || item.facilityAddress.trim().length === 0))
    {
        return null;
    } else {
        return item;
    }
};

const extractScheduleConsDetails = (raw, result) => {
    const catches = [];
    let pageIdx;
    let rowIdx;
    for (pageIdx = 2; pageIdx <= 4; pageIdx++) {
        for (rowIdx = 1; rowIdx <= 24; rowIdx++) {
            const item = extractScheduleConsDetailItem(pageIdx, rowIdx, raw);
            if (item) {
                catches.push(item);
                result.errors = result.errors.concat(validateScheduleConsDetailItem(pageIdx, rowIdx, item));
            }
        }
    }
    result.catches = catches;
};

const extractScheduleConsDetailItem = (pageIdx, rIdx, raw) => {
    // the editable pdf fieldnames are whack...
    const ROW_BUMP_1 = 3;
    const ROW_BUMP_2 = 6;
    const ROW_BUMP_3 = 9;
    const ROW_BUMP_4 = 12;
    let rowIdx = rIdx;
    const item = {};

    if (pageIdx === 2) {
        if (rowIdx > ROW_BUMP_1) {
            rowIdx++;
        }
        if (rowIdx > ROW_BUMP_2) {
            rowIdx++;
        }
        if (rowIdx > ROW_BUMP_3) {
            rowIdx++;
        }
        if (rowIdx > ROW_BUMP_4) {
            rowIdx++;
        }
    }

    const pageSuffix = pageIdx > 2 ? `0${pageIdx - 2}` : '';
    const productKey = `${SCHED_CONS_PROD_KEY_PREFIX}${rowIdx}${pageSuffix}`;
    const codeKey = `${SCHED_CONS_CODE_KEY_PREFIX}${rowIdx}${pageSuffix}`;
    const catchCertKey = `${SCHED_CONS_CC_KEY_PREFIX}${rowIdx}${pageSuffix}`;
    const weightKey = `${SCHED_CONS_WEIGHT_KEY_PREFIX}${rowIdx}${pageSuffix}`;
    const dateKey = `${SCHED_CONS_DATE_KEY_PREFIX}${rowIdx}${pageSuffix}`;
    const placeKey = `${SCHED_CONS_PLACE_KEY_PREFIX}${rowIdx}${pageSuffix}`;
    const transportKey = `${SCHED_CONS_TRANSPORT_KEY_PREFIX}${rowIdx}${pageSuffix}`;

    item.product = raw[productKey];
    item.commodityCode = raw[codeKey];
    item.certificateNumber = raw[catchCertKey];
    item.productWeight = raw[weightKey];
    item.dateOfUnloading = raw[dateKey];
    item.placeOfUnloading = raw[placeKey];
    item.transportUnloadedFrom = raw[transportKey];

    if (isConsDetailItemEmpty(item)) {
        return null;
    } else {
        return item;
    }
};

const extractExporterDetails = (raw, result) => {
    const exporterDetails = {
        exporterCompanyName: raw[EXPORTER_COMPANY_NAME_KEY],
        exporterAddress: raw[EXPORTER_ADDRESS_KEY],
        exporterDateAccepted: raw[EXPORTER_DATE_ACCEPT_KEY]
    };
    result.errors = result.errors.concat(validateRequired(exporterDetails.exporterCompanyName, 'Exporter company name is required'));
    result.errors = result.errors.concat(validateRequired(exporterDetails.exporterAddress, 'Exporter address is required'));
    result.errors = result.errors.concat(validateRequired(exporterDetails.exporterDateAccepted, 'Exporter date of acceptance is required'));
    result.exporterDetails = exporterDetails;
}

const extractDepartureDetails = (raw, result) => {
    result.departurePlace = raw[DEPT_PLACE_KEY];
    result.errors = result.errors.concat(validateRequired(result.departurePlace, 'Date / port or place of departure is required'));

    result.departureTransport = raw[DEPT_DETAILS_KEY];
    result.errors = result.errors.concat(validateRequired(result.departurePlace, 'Details of transport required'));

    result.departureContainers = raw[DEPT_CONTAINER_NUMBERS_KEY];
}

const extractFrontPageFacilityDetails = (raw, result) => {
    const facilities = [];
    const item = extractFrontPageFacilityDetailItem(raw);
    if (item) {
        facilities.push(item);
        result.errors = result.errors.concat(validateFrontPageFacilityDetailItem(item));
    }
    if (facilities.length === 0) {
        result.errors = result.errors.concat('No storage facilities listed');
    }
    result.storageFacilities = facilities;
};

const extractFrontPageFacilityDetailItem = (raw) => {
    const item = {
        facilityName: raw[FP_STORAGE_FAC_NAME_KEY],
        facilityAddress: raw[FP_STORAGE_FAC_ADDRESS_KEY]
    };

    if ((!item.facilityName || item.facilityName.trim().length === 0)
        && (!item.facilityAddress || item.facilityAddress.trim().length === 0))
    {
        return null;
    } else {
        return item;
    }
};

const extractFrontPageConsDetails = (raw, result) => {
    const catches = [];
    const item = extractFrontPageConsDetailItem(raw);
    if (item) {
        catches.push(item);
        result.errors = result.errors.concat(validateFrontPageConsDetailItem(item));
    }
    if (catches.length === 0) {
        result.errors = result.errors.concat('No consignment details listed');
    }
    result.catches = catches;
};

const extractFrontPageConsDetailItem = (raw) => {
    const item = {
        product: raw[FP_CONS_PROD_KEY],
        commodityCode: raw[FP_CONS_CODE_KEY],
        certificateNumber: raw[FP_CONS_CC_KEY],
        productWeight: raw[FP_CONS_WEIGHT_KEY],
        dateOfUnloading: raw[FP_CONS_DATE_KEY],
        placeOfUnloading: raw[FP_CONS_PLACE_KEY],
        transportUnloadedFrom: raw[FP_CONS_TRANSPORT_KEY]
    };

    if ((!item.product || item.product.trim().length === 0)
        && (!item.commodityCode || item.commodityCode.trim().length === 0)
        && (!item.certificateNumber || item.certificateNumber.trim().length === 0)) {
        return null;
    } else {
        return item;
    }
};

const validateFrontPageFacilityDetailItem = (item) => {
    const errors = [];
    if (!item.facilityName || item.facilityName.trim().length === 0) {
        errors.push('Storage facility name is required');
    }
    if (!item.facilityAddress || item.facilityAddress.trim().length === 0) {
        errors.push('Storage facility address is required');
    }
    return errors;
};

const validateScheduleFacilityDetailItem = (pageIdx, rowIdx, item) => {
    const errors = [];
    if (!item.facilityName || item.facilityName.trim().length === 0) {
        errors.push(`Storage facility name is required on schedule page ${pageIdx} row ${rowIdx}`);
    }
    if (!item.facilityAddress || item.facilityAddress.trim().length === 0) {
        errors.push(`Storage facility address is required on schedule page ${pageIdx} row ${rowIdx}`);
    }
    return errors;
};

const validateFrontPageConsDetailItem = (item) => {
    const errors = [];
    if (!item.product || item.product.trim().length === 0) {
        errors.push('Description of fishery products required');
    }
    if (!item.commodityCode || item.commodityCode.trim().length === 0) {
        errors.push('Commodity code required');
    }
    if (!item.certificateNumber || item.certificateNumber.trim().length === 0) {
        errors.push('Catch certificate or processing statement number required');
    }
    if (!item.productWeight || item.productWeight.trim().length === 0) {
        errors.push('Weight (kg) required');
    }
    if (!item.dateOfUnloading || item.dateOfUnloading.trim().length === 0) {
        errors.push('Date of unloading required');
    }
    if (!item.placeOfUnloading || item.placeOfUnloading.trim().length === 0) {
        errors.push('Place of unloading required');
    }
    if (!item.transportUnloadedFrom || item.transportUnloadedFrom.trim().length === 0) {
        errors.push('Details of transport unloaded from required');
    }
    return errors;
};

const validateScheduleConsDetailItem = (pageIdx, rowIdx, item) => {
    const errors = [];
    if (!item.product || item.product.trim().length === 0) {
        errors.push(`Description of fishery products required on schedule page ${pageIdx} row ${rowIdx}`);
    }
    if (!item.commodityCode || item.commodityCode.trim().length === 0) {
        errors.push(`Commodity code required on schedule page ${pageIdx} row ${rowIdx}`);
    }
    if (!item.certificateNumber || item.certificateNumber.trim().length === 0) {
        errors.push(`Catch certificate or processing statement number required on schedule page ${pageIdx} row ${rowIdx}`);
    }
    if (!item.productWeight || item.productWeight.trim().length === 0) {
        errors.push(`Weight (kg) required on schedule page ${pageIdx} row ${rowIdx}`);
    }
    if (!item.dateOfUnloading || item.dateOfUnloading.trim().length === 0) {
        errors.push(`Date of unloading required on schedule page ${pageIdx} row ${rowIdx}`);
    }
    if (!item.placeOfUnloading || item.placeOfUnloading.trim().length === 0) {
        errors.push(`Place of unloading required on schedule page ${pageIdx} row ${rowIdx}`);
    }
    if (!item.transportUnloadedFrom || item.transportUnloadedFrom.trim().length === 0) {
        errors.push(`Details of transport unloaded from required on schedule page ${pageIdx} row ${rowIdx}`);
    }
    return errors;
};

const validateRequired = (item, errorMessage) => {
    const errors = [];
    if (!item || item.trim().length === 0) {
        errors.push(errorMessage);
    }
    return errors;
};

module.exports = parseStorageDocument;