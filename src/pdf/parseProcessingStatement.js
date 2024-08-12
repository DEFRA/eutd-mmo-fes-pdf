const muhammara = require('muhammara');
const PDFDigitalForm = require('../utils/pdf-digital-form');

const PROD_DESC_KEY = 'Fishery product description';
const PLANT_NAME_KEY = 'Processing plant';
const PLANT_APPROVAL_NUM_KEY = 'Plant approval number';
const RESP_PERSON_KEY = 'Responsible person';
const PLANT_ADDRESS_KEY = 'Address';
const DATE_ACCEPTANCE_KEY = 'Date of acceptance';

const HEALTH_CERT_NUM_KEY = 'Health certificate number';
const HEALTH_CERT_DATE_KEY = 'Date';

const EXPORTER_COMPANY_KEY = 'Company';
const EXPORTER_ADDRESS_KEY = 'Address_2';

const FP_CATCHES_CC_NUM_KEY_PREFIX = 'Catch certificate CC number';
const FP_CATCHES_VESSEL_KEY_PREFIX = 'Vessel name and Validation date';
const FP_CATCHES_CATCH_DESC_KEY_PREFIX = 'Catch description';
const FP_CATCHES_TOTAL_LANDED_WEIGHT_KEY_PREFIX = 'Total landed weightkg';
const FP_CATCHES_CATCH_PROCESSED_WEIGHT_KEY_PREFIX = 'Catch Processed Weight';
const FP_CATCHES_PROCESSED_WEIGHT_KEY_PREFIX = 'Processed fishery product';

const DATE_ISSUED_KEY = 'Date IssuedIllegal Unreported and Unregulated IUU Fishing Team Marine Management Organisation Lancaster House Hampshire Court Newcastle upon Tyne NE4 7YJ United Kingdom Tel 0300 123 1032 Email ukiuuslomarinemanagementorguk';

const SCHED_CATCHES_CC_NUM_KEY_PREFIX = 'Catch certificate CC numberRow';
const SCHED_CATCHES_VESSEL_KEY_PREFIX = 'Vessel name and Validation dateRow';
const SCHED_CATCHES_CATCH_DESC_KEY_PREFIX = 'Catch descriptionRow';
const SCHED_CATCHES_TOTAL_LANDED_WEIGHT_KEY_PREFIX = 'Total landed weightkgRow';
const SCHED_CATCHES_CATCH_PROCESSED_WEIGHT_KEY_PREFIX = 'Catch processed kgRow';
const SCHED_CATCHES_PROCESSED_WEIGHT_KEY_PREFIX = 'Processed fishery productkgRow';

const parseProcessingStatement = async (pdfJson, buffer) => {

    let result = {...pdfJson};
    let pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(buffer));
    let form = new PDFDigitalForm(pdfReader);
    let raw = form.createSimpleKeyValue();
    result.errors = [];

    result.consignmentDescription = raw[PROD_DESC_KEY];
    result.errors = result.errors.concat(validateRequired(result.consignmentDescription, 'A description of the processed product is required'));

    result.plantName = raw[PLANT_NAME_KEY];
    result.errors = result.errors.concat(validateRequired(result.plantName, 'The processing plant name is required'));

    result.plantAddress = raw[PLANT_ADDRESS_KEY];
    result.errors = result.errors.concat(validateRequired(result.plantAddress, 'The processing plant address is required'));

    result.plantApprovalNumber = raw[PLANT_APPROVAL_NUM_KEY];
    result.errors = result.errors.concat(validateRequired(result.plantApprovalNumber, 'The processing plant approval number is required'));

    result.personResponsibleForConsignment = raw[RESP_PERSON_KEY];
    result.errors = result.errors.concat(validateRequired(result.personResponsibleForConsignment, 'The responsible person is required'));

    result.dateOfAcceptance = raw[DATE_ACCEPTANCE_KEY];
    result.errors = result.errors.concat(validateRequired(result.dateOfAcceptance, 'The date of acceptance by the responsible person is required'));

    result.healthCertificateNumber = raw[HEALTH_CERT_NUM_KEY];
    result.errors = result.errors.concat(validateRequired(result.healthCertificateNumber, 'The health certificate number is required'));

    result.healthCertificateDate = raw[HEALTH_CERT_DATE_KEY];
    result.errors = result.errors.concat(validateRequired(result.healthCertificateDate, 'The health certificate date is required'));

    result.exporter = parseExporter(raw);
    result.errors = result.errors.concat(validateExporter(result.exporter));

    result.dateIssued = raw[DATE_ISSUED_KEY];
    result.errors = result.errors.concat(validateRequired(result.dateIssued, 'The date issued is required'));

    if (raw[SCHED_CATCHES_CC_NUM_KEY_PREFIX + '1'] === null || raw[SCHED_CATCHES_CATCH_DESC_KEY_PREFIX + '1'].trim().length === 0) {
        // no schedule extract catch details from first page
        extractFrontPageCatchDetails(raw, result);
    } else {
        // Parse schedule pages
        if ((raw[FP_CATCHES_CATCH_DESC_KEY_PREFIX + '0'] &&  raw[FP_CATCHES_CATCH_DESC_KEY_PREFIX + '0'].trim().length > 0)
            || (raw[FP_CATCHES_CC_NUM_KEY_PREFIX + '10'] &&  raw[FP_CATCHES_CC_NUM_KEY_PREFIX + '10'].trim().length > 0)
            || (raw[FP_CATCHES_TOTAL_LANDED_WEIGHT_KEY_PREFIX + '0'] && raw[FP_CATCHES_TOTAL_LANDED_WEIGHT_KEY_PREFIX + '0'].trim().length > 0)
            || (raw[FP_CATCHES_CATCH_PROCESSED_WEIGHT_KEY_PREFIX] &&  raw[FP_CATCHES_CATCH_PROCESSED_WEIGHT_KEY_PREFIX].trim().length > 0)
            || (raw[FP_CATCHES_PROCESSED_WEIGHT_KEY_PREFIX] &&  raw[FP_CATCHES_PROCESSED_WEIGHT_KEY_PREFIX].trim().length > 0)) {
            // cant have items in schedule and front page product details
            result.errors = result.errors.concat('Catch details have been added to both the front page and the schedule');
        } else {
            extractScheduleCatchDetails(raw, result);
        }
    }
    return result;
};

const extractScheduleCatchDetails = (raw, result) => {
    let catches = [];
    let pageIdx;
    let rowIdx;
    for (pageIdx = 2; pageIdx <= 4; pageIdx++) {
        for (rowIdx = 1; rowIdx <= 24; rowIdx++) {
            let item = extractScheduleCatchDetailItem(pageIdx, rowIdx, raw);
            if (item) {
                catches.push(item);
                result.errors = result.errors.concat(validateScheduleCatchDetailItem(pageIdx, rowIdx, item));
            }
        }
    }
    result.catches = catches;
};

const extractScheduleCatchDetailItem = (pageIdx, rowIdx, raw) => {
    let item = {};
    let speciesKey = SCHED_CATCHES_CATCH_DESC_KEY_PREFIX + rowIdx;
    let catchCertificateNumberKey = SCHED_CATCHES_CC_NUM_KEY_PREFIX + rowIdx;
    let totalWeightLandedKey = SCHED_CATCHES_TOTAL_LANDED_WEIGHT_KEY_PREFIX + rowIdx;
    let exportWeightBeforeProcessingKey = SCHED_CATCHES_CATCH_PROCESSED_WEIGHT_KEY_PREFIX + rowIdx;
    let exportWeightAfterProcessingKey = SCHED_CATCHES_PROCESSED_WEIGHT_KEY_PREFIX + rowIdx;

    if (2!== pageIdx) {
        speciesKey = speciesKey + '_' + (pageIdx - 1);
        catchCertificateNumberKey = catchCertificateNumberKey + '_' + (pageIdx - 1);
        totalWeightLandedKey = totalWeightLandedKey + '_' + (pageIdx - 1);
        exportWeightBeforeProcessingKey = exportWeightBeforeProcessingKey + '_' + (pageIdx - 1);
        exportWeightAfterProcessingKey = exportWeightAfterProcessingKey + '_' + (pageIdx - 1);
    }

    item.species = raw[speciesKey];
    item.catchCertificateNumber = raw[catchCertificateNumberKey];
    item.totalWeightLanded = raw[totalWeightLandedKey];
    item.exportWeightBeforeProcessing = raw[exportWeightBeforeProcessingKey];
    item.exportWeightAfterProcessing = raw[exportWeightAfterProcessingKey];

    if ((!item.species || item.species.trim().length === 0)
        && (!item.catchCertificateNumber || item.catchCertificateNumber.trim().length === 0)
        && (!item.totalWeightLanded || item.totalWeightLanded.trim().length === 0)
        && (!item.exportWeightBeforeProcessing || item.exportWeightBeforeProcessing.trim().length === 0)
        && (!item.exportWeightAfterProcessing || item.exportWeightAfterProcessing.trim().length === 0)) {
        return null;
    } else {
        return item;
    }
};

const extractFrontPageCatchDetails = (raw, result) => {
    let catches = [];
    let i;
    for (i = 1; i <= 5; i++) {
        let item = extractFrontPageCatchDetailItem(i, raw);
        if (item) {
            catches.push(item);
            result.errors = result.errors.concat(validateFrontPageCatchDetailItem(i, item));
        }
    }
    if (catches.length === 0) {
        result.errors = result.errors.concat('No catch details listed');
    }
    result.catches = catches;
}

const extractFrontPageCatchDetailItem = (i, raw) => {
    // Unfortunately the editable PDF has been badly created with random keys for catch cert rows!
    let item = {};
    switch (i) {
        case 1:
            item.species = raw[FP_CATCHES_CATCH_DESC_KEY_PREFIX + '0'];
            item.catchCertificateNumber = raw[FP_CATCHES_CC_NUM_KEY_PREFIX + '10'];
            item.totalWeightLanded = raw[FP_CATCHES_TOTAL_LANDED_WEIGHT_KEY_PREFIX + '0'];
            item.exportWeightBeforeProcessing = raw[FP_CATCHES_CATCH_PROCESSED_WEIGHT_KEY_PREFIX];
            item.exportWeightAfterProcessing = raw[FP_CATCHES_PROCESSED_WEIGHT_KEY_PREFIX];
            break;
        case 2:
            item.species = raw[FP_CATCHES_CATCH_DESC_KEY_PREFIX + '20'];
            item.catchCertificateNumber = raw[FP_CATCHES_CC_NUM_KEY_PREFIX + '20'];
            item.totalWeightLanded = raw[FP_CATCHES_TOTAL_LANDED_WEIGHT_KEY_PREFIX + '20'];
            item.exportWeightBeforeProcessing = raw[FP_CATCHES_CATCH_PROCESSED_WEIGHT_KEY_PREFIX + '21'];
            item.exportWeightAfterProcessing = raw[FP_CATCHES_PROCESSED_WEIGHT_KEY_PREFIX + '21'];
            break;
        case 3:
            item.species = raw[FP_CATCHES_CATCH_DESC_KEY_PREFIX + ' 3'];
            item.catchCertificateNumber = raw[FP_CATCHES_CC_NUM_KEY_PREFIX + '3'];
            item.totalWeightLanded = raw[FP_CATCHES_TOTAL_LANDED_WEIGHT_KEY_PREFIX + ' 3'];
            item.exportWeightBeforeProcessing = raw[FP_CATCHES_CATCH_PROCESSED_WEIGHT_KEY_PREFIX + ' 3'];
            item.exportWeightAfterProcessing = raw[FP_CATCHES_PROCESSED_WEIGHT_KEY_PREFIX + ' 3'];
            break;
        case 4:
            item.species = raw[FP_CATCHES_CATCH_DESC_KEY_PREFIX];
            item.catchCertificateNumber = raw[FP_CATCHES_CC_NUM_KEY_PREFIX + ' 4'];
            item.totalWeightLanded = raw[FP_CATCHES_TOTAL_LANDED_WEIGHT_KEY_PREFIX + ' 4'];
            item.exportWeightBeforeProcessing = raw[FP_CATCHES_CATCH_PROCESSED_WEIGHT_KEY_PREFIX + ' 4'];
            item.exportWeightAfterProcessing = raw[FP_CATCHES_PROCESSED_WEIGHT_KEY_PREFIX + ' 4'];
            break;
        case 5:
            item.species = raw[FP_CATCHES_CATCH_DESC_KEY_PREFIX + ' 5'];
            item.catchCertificateNumber = raw[FP_CATCHES_CC_NUM_KEY_PREFIX + ' 6'];
            item.totalWeightLanded = raw[FP_CATCHES_TOTAL_LANDED_WEIGHT_KEY_PREFIX + ' 5'];
            item.exportWeightBeforeProcessing = raw[FP_CATCHES_CATCH_PROCESSED_WEIGHT_KEY_PREFIX + ' 5'];
            item.exportWeightAfterProcessing = raw[FP_CATCHES_PROCESSED_WEIGHT_KEY_PREFIX + ' 5'];
            break;
    }

    if ((!item.catchCertificateNumber || item.catchCertificateNumber.trim().length === 0)
        && (!item.species || item.species.trim().length === 0)) {
        return null;
    } else {
        return item;
    }
};

const parseExporter = (raw) => {
    let exporter = {};
    exporter.exporterCompanyName = raw[EXPORTER_COMPANY_KEY];
    exporter.exporterAddress = raw[EXPORTER_ADDRESS_KEY]; // ! not a direct match to online form
    return exporter;
};

const validateFrontPageCatchDetailItem = (idx, item) => {
    const errors = [];
    if (!item.species || item.species.trim().length === 0) {
        errors.push('Catch description required on row ' + idx);
    }
    if (!item.catchCertificateNumber || item.catchCertificateNumber.trim().length === 0) {
        errors.push('Catch certificate number required on row ' + idx);
    }

    if (!item.totalWeightLanded || item.totalWeightLanded.trim().length === 0) {
        errors.push('Total landed weight (kg) required on row ' + idx);
    }

    if (!item.exportWeightBeforeProcessing || item.exportWeightBeforeProcessing.trim().length === 0) {
        errors.push('Catch processed (kg) required on row ' + idx);
    }

    if (!item.exportWeightAfterProcessing || item.exportWeightAfterProcessing.trim().length === 0) {
        errors.push('Processed fishery product (kg) required on row ' + idx);
    }
    return errors;
}

const validateScheduleCatchDetailItem = (pageIdx, rowIdx, item) => {
    const errors = [];
    if (!item.species || item.species.trim().length === 0) {
        errors.push('Catch description required on schedule page ' + pageIdx + ' row ' + rowIdx);
    }
    if (!item.catchCertificateNumber || item.catchCertificateNumber.trim().length === 0) {
        errors.push('Catch certificate number required on schedule page ' + pageIdx + ' row ' + rowIdx);
    }

    if (!item.totalWeightLanded || item.totalWeightLanded.trim().length === 0) {
        errors.push('Total landed weight (kg) required on schedule page ' + pageIdx + ' row ' + rowIdx);
    }

    if (!item.exportWeightBeforeProcessing || item.exportWeightBeforeProcessing.trim().length === 0) {
        errors.push('Catch processed (kg) required on schedule page ' + pageIdx + ' row ' + rowIdx);
    }

    if (!item.exportWeightAfterProcessing || item.exportWeightAfterProcessing.trim().length === 0) {
        errors.push('Processed fishery product (kg) required on schedule page ' + pageIdx + ' row ' + rowIdx);
    }
    return errors;
}

const validateRequired = (item, errorMessage) => {
    const errors = [];
    if (!item || item.trim().length === 0) {
        errors.push(errorMessage);
    }
    return errors;
};

const validateExporter = (exporter) => {
    let errors = validateRequired(exporter.exporterCompanyName, 'Name of exporter company required');
    errors = errors.concat(validateRequired(exporter.exporterAddress, 'Address of exporter company required'));
    return errors;
};

module.exports = parseProcessingStatement;