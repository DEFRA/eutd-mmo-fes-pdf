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

const SCHED_FAC_PAGE = 5;
const ROW_THRESHOLD_1 = 3;
const ROW_THRESHOLD_2 = 6;
const ROW_THRESHOLD_3 = 9;
const ROW_THRESHOLD_4 = 12;

const isBlank = (val) => !val || val.trim().length === 0;

const hasFrontPageConsBasicData = (raw) =>
    raw?.[FP_CONS_PROD_KEY]?.trim()?.length > 0
    || raw?.[FP_CONS_CODE_KEY]?.trim()?.length > 0
    || raw[FP_CONS_CC_KEY]?.trim()?.length > 0;

const hasFrontPageConsLogisticsData = (raw) =>
    raw?.[FP_CONS_WEIGHT_KEY]?.trim()?.length > 0
    || raw?.[FP_CONS_DATE_KEY]?.trim()?.length > 0
    || raw?.[FP_CONS_PLACE_KEY]?.trim()?.length > 0
    || raw?.[FP_CONS_TRANSPORT_KEY]?.trim()?.length > 0;

const hasFrontPageConsData = (raw) =>
    hasFrontPageConsBasicData(raw) || hasFrontPageConsLogisticsData(raw);

const isEmptyConsItem = (item) => {
    const noIds = !item?.product?.trim() && !item?.commodityCode?.trim() && !item?.certificateNumber?.trim();
    const noMeta = !item?.productWeight?.trim() && !item?.dateOfUnloading?.trim()
        && !item?.placeOfUnloading?.trim() && !item?.transportUnloadedFrom?.trim();
    return noIds && noMeta;
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
    } else if (hasFrontPageConsData(raw)) {
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
    if ((raw[SCHED_FAC_ADDRESS_KEY_PREFIX + '1'] === null || raw[SCHED_FAC_ADDRESS_KEY_PREFIX + '1'].trim().length === 0)) {
        // no schedule - extract facility details from first page
        extractFrontPageFacilityDetails(raw, result);
    } else if (raw?.[FP_STORAGE_FAC_ADDRESS_KEY]?.trim()?.length > 0) {
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
    for (pageIdx = SCHED_FAC_PAGE; pageIdx <= SCHED_FAC_PAGE; pageIdx++) {
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
    const item = {};
    let nameKey = SCHED_FAC_NAME_KEY_PREFIX;
    let addressKey = SCHED_FAC_ADDRESS_KEY_PREFIX;

    if (rowIdx !== 1) {
        nameKey = `${nameKey} ${rowIdx}`;
    }

    addressKey = addressKey + rowIdx;

    item.facilityName = raw[nameKey];
    item.facilityAddress = raw[addressKey];

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

    let rowIdx = rIdx;
    const item = {};

    // the editable pdf fieldnames are whack...
    if (pageIdx === 2) {
        if (rowIdx > ROW_THRESHOLD_1) {
            rowIdx++;
        }
        if (rowIdx > ROW_THRESHOLD_2) {
            rowIdx++;
        }
        if (rowIdx > ROW_THRESHOLD_3) {
            rowIdx++;
        }
        if (rowIdx > ROW_THRESHOLD_4) {
            rowIdx++;
        }
    }

    let productKey = SCHED_CONS_PROD_KEY_PREFIX + rowIdx;
    let codeKey = SCHED_CONS_CODE_KEY_PREFIX + rowIdx;
    let catchCertKey = SCHED_CONS_CC_KEY_PREFIX + rowIdx;
    let weightKey = SCHED_CONS_WEIGHT_KEY_PREFIX + rowIdx;
    let dateKey = SCHED_CONS_DATE_KEY_PREFIX + rowIdx;
    let placeKey = SCHED_CONS_PLACE_KEY_PREFIX + rowIdx;
    let transportKey = SCHED_CONS_TRANSPORT_KEY_PREFIX + rowIdx;

    if (pageIdx > 2) {
        const pageSuffix = `0${pageIdx - 2}`;
        productKey = `${productKey}${pageSuffix}`;
        codeKey = `${codeKey}${pageSuffix}`;
        catchCertKey = `${catchCertKey}${pageSuffix}`;
        weightKey = `${weightKey}${pageSuffix}`;
        dateKey = `${dateKey}${pageSuffix}`;
        placeKey = `${placeKey}${pageSuffix}`;
        transportKey = `${transportKey}${pageSuffix}`;
    }

    item.product = raw[productKey];
    item.commodityCode = raw[codeKey];
    item.certificateNumber = raw[catchCertKey];
    item.productWeight = raw[weightKey];
    item.dateOfUnloading = raw[dateKey];
    item.placeOfUnloading = raw[placeKey];
    item.transportUnloadedFrom = raw[transportKey];

    return isEmptyConsItem(item) ? null : item;
};

const extractExporterDetails = (raw, result) => {
    const exporterDetails = {
        exporterCompanyName: raw[EXPORTER_COMPANY_NAME_KEY],
        exporterAddress: raw[EXPORTER_ADDRESS_KEY],
        exporterDateAccepted: raw[EXPORTER_DATE_ACCEPT_KEY],
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
        facilityAddress: raw[FP_STORAGE_FAC_ADDRESS_KEY],
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
        transportUnloadedFrom: raw[FP_CONS_TRANSPORT_KEY],
    };

    return (isBlank(item.product) && isBlank(item.commodityCode) && isBlank(item.certificateNumber)) ? null : item;
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

const CONS_ITEM_REQUIRED_FIELDS = [
    { field: 'product', message: 'Description of fishery products required' },
    { field: 'commodityCode', message: 'Commodity code required' },
    { field: 'certificateNumber', message: 'Catch certificate or processing statement number required' },
    { field: 'productWeight', message: 'Weight (kg) required' },
    { field: 'dateOfUnloading', message: 'Date of unloading required' },
    { field: 'placeOfUnloading', message: 'Place of unloading required' },
    { field: 'transportUnloadedFrom', message: 'Details of transport unloaded from required' },
];

const validateFrontPageConsDetailItem = (item) =>
    CONS_ITEM_REQUIRED_FIELDS
        .filter(({ field }) => isBlank(item[field]))
        .map(({ message }) => message);

const validateScheduleConsDetailItem = (pageIdx, rowIdx, item) =>
    CONS_ITEM_REQUIRED_FIELDS
        .filter(({ field }) => isBlank(item[field]))
        .map(({ message }) => `${message} on schedule page ${pageIdx} row ${rowIdx}`);

const validateRequired = (item, errorMessage) => {
    const errors = [];
    if (!item || item.trim().length === 0) {
        errors.push(errorMessage);
    }
    return errors;
};

module.exports = parseStorageDocument;