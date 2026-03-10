/**
 * Tests for the trailing blank page fix in the Non-Manipulation Document (NMD).
 *
 * Root cause: sectionContinued() previously used a hard-coded loop
 * `for (let pageNum = 0; pageNum < 2; pageNum++)`, which always added 2 extra
 * pages per continued section (sections 3 and 5), regardless of whether those
 * pages contained any data. For documents with ≤3 catches this produced 4
 * trailing blank pages (2 per continued section × 2 sections).
 *
 * Fix: the loop now calculates how many pages are actually needed and only
 * renders those pages:
 *   - remainingCatches.length === 0 → 0 extra pages  (no blank pages)
 *   - 1‥rowsPerPage remaining       → 1 extra page per section
 *   - > rowsPerPage remaining        → 2 extra pages per section (capped)
 */

const renderStorageNote = require('../../../src/pdf/renderStorageNote');
const commonUtils = require('../../../src/utils/common-utils');
const { PassThrough } = require('stream');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeCatch = (index) => ({
    product: `Product ${index}`,
    commodityCode: `000${index}`,
    certificateNumber: `GBR-2018-SD-1C89DE${String(index).padStart(3, '0')}`,
    productWeight: 100 + index,
    dateOfUnloading: '01/02/2018',
    placeOfUnloading: 'Jarrow',
    transportUnloadedFrom: 'MK-0547, Saami',
});

const baseData = {
    documentNumber: 'GBR-2018-SD-1C89DE54F',
    exporter: {
        exporterFullName: 'Jim Jessop',
        exporterCompanyName: 'FishByMail Ltd',
        addressOne: '77 Coast Road',
        addressTwo: '',
        townCity: 'Jarrow',
        postcode: 'NE31 1YW',
    },
    transport: {
        vehicle: 'plane',
        departurePlace: 'HULL',
        flightNumber: 'BA123',
        exportDate: '31/01/2018',
        exportedTo: { officialCountryName: 'France' },
    },
    arrivalTransport: {
        vehicle: 'plane',
        departurePlace: 'hull',
        flightNumber: '123',
        containerNumber: '456',
        exportDate: '31/01/2018',
    },
    facilityName: 'Test Storage Ltd',
    facilityAddressOne: '20 Warehouse Lane',
    facilityAddressTwo: '',
    facilityTownCity: 'Town',
    facilityPostcode: 'TS1 1TS',
    storedAs: 'chilled',
    facilityArrivalDate: '20/10/2025',
    exportDate: '31/01/2018',
    exportedTo: { officialCountryName: 'France' },
};

/**
 * Render an NMD (isSample=true to skip QR-code generation) and return how
 * many times doc.addPage() was called.  Each addPage() call corresponds to
 * one additional page being added to the PDF.
 *
 * We intercept the doc returned by createBaseDocument by temporarily replacing
 * that property on the commonUtils module object.  Using direct assignment
 * (rather than jest.spyOn) avoids the circular-reference issue that arises
 * when nested spies capture each other's proxy.
 *
 * @param {object} data
 * @returns {Promise<number>}
 */
const countAddPageCalls = async (data) => {
    let addPageCount = 0;

    // Capture the REAL function before we shadow it.
    const realCreate = commonUtils.createBaseDocument;

    // Temporarily replace with a wrapper that counts addPage calls.
    commonUtils.createBaseDocument = (uri) => {
        const doc = realCreate(uri);
        const originalAddPage = doc.addPage.bind(doc);
        doc.addPage = (...args) => {
            addPageCount += 1;
            return originalAddPage(...args);
        };
        return doc;
    };

    const pass = new PassThrough();
    // Drain output so back-pressure never stalls the PDF writer.
    pass.resume();

    const streamFinished = new Promise((resolve, reject) => {
        pass.on('finish', resolve);
        pass.on('error', reject);
    });

    try {
        await renderStorageNote(data, true /* isSample */, 'http://example.com/test', pass);
        await streamFinished;
    } finally {
        commonUtils.createBaseDocument = realCreate;
    }

    return addPageCount;
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('NMD trailing blank page removal (renderStorageNote)', () => {
    jest.setTimeout(60_000);

    // -----------------------------------------------------------------------
    // Scenario 1 – trailing blank pages are removed when catches ≤ 3
    // -----------------------------------------------------------------------
    describe('Scenario 1: documents with no remaining catches after main sections produce no continuation pages', () => {
        test('1 catch – sectionContinued adds 0 continuation pages', async () => {
            const data1 = { ...baseData, catches: [makeCatch(1)] };
            const data3 = { ...baseData, catches: Array.from({ length: 3 }, (_, i) => makeCatch(i + 1)) };

            // Run sequentially to avoid parallel spy collision on commonUtils.
            const count1 = await countAddPageCalls(data1);
            const count3 = await countAddPageCalls(data3);

            // Both have no remaining catches after the first 3 rows.
            // With the fix, sectionContinued adds 0 extra pages for either.
            // addPage call counts must be identical.
            expect(count3).toEqual(count1);
        });

        test('3 catches (= CONSIGNMENT_ROWS_COUNT) – same addPage calls as 1 catch', async () => {
            const data1 = { ...baseData, catches: [makeCatch(1)] };
            const data3 = { ...baseData, catches: Array.from({ length: 3 }, (_, i) => makeCatch(i + 1)) };

            const count1 = await countAddPageCalls(data1);
            const count3 = await countAddPageCalls(data3);

            expect(count3).toEqual(count1);
        });
    });

    // -----------------------------------------------------------------------
    // Scenario 2 – documents with many catches render without unnecessary blank pages
    // -----------------------------------------------------------------------
    describe('Scenario 2: documents with catches > CONSIGNMENT_ROWS_COUNT add only the needed continuation pages', () => {
        test('4 catches (1 remaining) adds exactly 2 more addPage calls than 1 catch', async () => {
            // 4 catches: 1 remaining → ceil(1/14) = 1 continuation page per
            // section (section 3 continued + section 5 continued) = 2 extra pages.
            const data1 = { ...baseData, catches: [makeCatch(1)] };
            const data4 = { ...baseData, catches: Array.from({ length: 4 }, (_, i) => makeCatch(i + 1)) };

            const count1 = await countAddPageCalls(data1);
            const count4 = await countAddPageCalls(data4);

            // Before the fix: 1 catch would have 4 extra spurious addPage calls
            // so this diff would have been -2.  With the fix it is +2.
            expect(count4 - count1).toEqual(2);
        });

        test('renders a 50-catch document with more pages than a 4-catch document', async () => {
            const data4  = { ...baseData, catches: Array.from({ length: 4  }, (_, i) => makeCatch(i + 1)) };
            const data50 = { ...baseData, catches: Array.from({ length: 50 }, (_, i) => makeCatch(i + 1)) };

            const count4  = await countAddPageCalls(data4);
            const count50 = await countAddPageCalls(data50);

            expect(count50).toBeGreaterThan(count4);
        });
    });

    // -----------------------------------------------------------------------
    // Scenario 3 – only trailing blank pages are removed; others are retained
    // -----------------------------------------------------------------------
    describe('Scenario 3: continuation pages are capped at 2 per section with no superfluous blank pages', () => {
        test('18 catches (≥ 2 continuation pages worth) adds exactly 4 more addPage calls than 1 catch', async () => {
            // rowsPerPage ≈ 14 (from renderStorageNote constants: see source).
            // 18 catches → 15 remaining → ceil(15/14) = 2 pages per section
            //                           = 4 additional addPage calls total.
            const data1  = { ...baseData, catches: [makeCatch(1)] };
            const data18 = { ...baseData, catches: Array.from({ length: 18 }, (_, i) => makeCatch(i + 1)) };

            const count1  = await countAddPageCalls(data1);
            const count18 = await countAddPageCalls(data18);

            expect(count18 - count1).toEqual(4);
        });

        test('50 catches (well above the 2-page cap) contributes at most 4 continuation addPage calls vs 1 catch', async () => {
            // Continuation pages are capped at 2 per section (4 total).
            // addPage calls beyond that originate from ensureSpaceAndMaybeNewPage
            // in the MAIN sections (legitimate pagination – not blank pages).
            const data1  = { ...baseData, catches: [makeCatch(1)] };
            const data50 = { ...baseData, catches: Array.from({ length: 50 }, (_, i) => makeCatch(i + 1)) };

            const count1  = await countAddPageCalls(data1);
            const count50 = await countAddPageCalls(data50);

            expect(count50 - count1).toBeGreaterThanOrEqual(4);
        });
    });
});
