const { formatCatchAreaData } = require('../../../src/pdf/renderExportCert');

describe('formatCatchAreaData', () => {

    test('should return empty string when row is null', () => {
        const result = formatCatchAreaData(null);
        expect(result).toBe('');
    });

    test('should return empty string when row is undefined', () => {
        const result = formatCatchAreaData(undefined);
        expect(result).toBe('');
    });

    test('should return only FAO area when no other fields present', () => {
        const row = {
            faoArea: 'FAO27'
        };
        const result = formatCatchAreaData(row);
        expect(result).toBe('FAO27');
    });

    test('should return empty string when faoArea is not provided', () => {
        const row = {};
        const result = formatCatchAreaData(row);
        expect(result).toBe('');
    });

    test('should format single EEZ country code', () => {
        const row = {
            faoArea: 'FAO27',
            exclusiveEconomicZones: [{ isoCodeAlpha2: 'GB' }]
        };
        const result = formatCatchAreaData(row);
        expect(result).toBe('FAO27\nGB');
    });

    test('should format multiple EEZ country codes as comma-separated', () => {
        const row = {
            faoArea: 'FAO27',
            exclusiveEconomicZones: [
                { isoCodeAlpha2: 'GB' },
                { isoCodeAlpha2: 'FR' },
                { isoCodeAlpha2: 'DE' }
            ]
        };
        const result = formatCatchAreaData(row);
        expect(result).toBe('FAO27\nGB, FR, DE');
    });

    test('should handle EEZ as plain string when isoCodeAlpha2 property not present', () => {
        const row = {
            faoArea: 'FAO27',
            exclusiveEconomicZones: ['GB', 'FR']
        };
        const result = formatCatchAreaData(row);
        expect(result).toBe('FAO27\nGB, FR');
    });

    test('should not add EEZ line when array is empty', () => {
        const row = {
            faoArea: 'FAO27',
            exclusiveEconomicZones: []
        };
        const result = formatCatchAreaData(row);
        expect(result).toBe('FAO27');
    });

    test('should extract RFMO acronym from full name with parentheses', () => {
        const row = {
            faoArea: 'FAO27',
            rfmo: 'International Commission for the Conservation of Atlantic Tunas (ICCAT)'
        };
        const result = formatCatchAreaData(row);
        expect(result).toBe('FAO27\nICCAT');
    });

    test('should use full RFMO text when no parentheses present', () => {
        const row = {
            faoArea: 'FAO27',
            rfmo: 'ICCAT'
        };
        const result = formatCatchAreaData(row);
        expect(result).toBe('FAO27\nICCAT');
    });

    test('should extract RFMO acronym with multiple word acronym', () => {
        const row = {
            faoArea: 'FAO21',
            rfmo: 'North East Atlantic Fisheries Commission (NEAFC)'
        };
        const result = formatCatchAreaData(row);
        expect(result).toBe('FAO21\nNEAFC');
    });

    test('should add High seas text when highSeasArea is Yes', () => {
        const row = {
            faoArea: 'FAO27',
            highSeasArea: 'Yes'
        };
        const result = formatCatchAreaData(row);
        expect(result).toBe('FAO27\nHigh seas');
    });

    test('should not add High seas text when highSeasArea is No', () => {
        const row = {
            faoArea: 'FAO27',
            highSeasArea: 'No'
        };
        const result = formatCatchAreaData(row);
        expect(result).toBe('FAO27');
    });

    test('should not add High seas text when highSeasArea is undefined', () => {
        const row = {
            faoArea: 'FAO27'
        };
        const result = formatCatchAreaData(row);
        expect(result).toBe('FAO27');
    });

    test('should format all fields together - single EEZ with High seas Yes', () => {
        const row = {
            faoArea: 'FAO27',
            exclusiveEconomicZones: [{ isoCodeAlpha2: 'GB' }],
            rfmo: 'International Commission for the Conservation of Atlantic Tunas (ICCAT)',
            highSeasArea: 'Yes'
        };
        const result = formatCatchAreaData(row);
        expect(result).toBe('FAO27\nGB\nICCAT\nHigh seas');
    });

    test('should format all fields together - multiple EEZ with High seas No', () => {
        const row = {
            faoArea: 'FAO27',
            exclusiveEconomicZones: [{ isoCodeAlpha2: 'GB' }, { isoCodeAlpha2: 'FR' }],
            rfmo: 'Indian Ocean Tuna Commission (IOTC)',
            highSeasArea: 'No'
        };
        const result = formatCatchAreaData(row);
        expect(result).toBe('FAO27\nGB, FR\nIOTC');
    });

    test('should format all fields together - multiple EEZ with RFMO and High seas', () => {
        const row = {
            faoArea: 'FAO21',
            exclusiveEconomicZones: [
                { isoCodeAlpha2: 'NO' },
                { isoCodeAlpha2: 'IS' },
                { isoCodeAlpha2: 'DK' }
            ],
            rfmo: 'North East Atlantic Fisheries Commission (NEAFC)',
            highSeasArea: 'Yes'
        };
        const result = formatCatchAreaData(row);
        expect(result).toBe('FAO21\nNO, IS, DK\nNEAFC\nHigh seas');
    });

    test('should handle mixed EEZ format - objects and strings', () => {
        const row = {
            faoArea: 'FAO48',
            exclusiveEconomicZones: [
                { isoCodeAlpha2: 'AU' },
                'NZ'
            ]
        };
        const result = formatCatchAreaData(row);
        expect(result).toBe('FAO48\nAU, NZ');
    });

    test('should handle RFMO with very short acronym in parentheses', () => {
        const row = {
            faoArea: 'FAO77',
            rfmo: 'Commission for the Conservation of Southern Bluefin Tuna (CCSBT)'
        };
        const result = formatCatchAreaData(row);
        expect(result).toBe('FAO77\nCCSBT');
    });

    test('should handle RFMO with acronym exactly 10 characters', () => {
        const row = {
            faoArea: 'FAO48',
            rfmo: 'Test Commission (TENCHARACT)'
        };
        const result = formatCatchAreaData(row);
        expect(result).toBe('FAO48\nTENCHARACT');
    });

    test('should not extract RFMO acronym if parentheses content exceeds 10 characters', () => {
        const row = {
            faoArea: 'FAO48',
            rfmo: 'Test Commission (MORETHANTENCHARACTERS)'
        };
        const result = formatCatchAreaData(row);
        expect(result).toBe('FAO48\nTest Commission (MORETHANTENCHARACTERS)');
    });

    test('should handle complex real-world scenario', () => {
        const row = {
            faoArea: 'FAO87',
            exclusiveEconomicZones: [{ isoCodeAlpha2: 'US' }],
            rfmo: 'Western and Central Pacific Fisheries Commission (WCPFC)',
            highSeasArea: 'Yes'
        };
        const result = formatCatchAreaData(row);
        expect(result).toBe('FAO87\nUS\nWCPFC\nHigh seas');
    });
});
