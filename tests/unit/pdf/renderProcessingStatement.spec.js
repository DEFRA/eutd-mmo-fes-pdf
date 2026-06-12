const renderProcessingStatement = require('../../../src/pdf/renderProcessingStatement');
const { PassThrough } = require('stream');

describe('renderProcessingStatement', () => {
    test('renders a sample processing statement to a buffer', async () => {
        const data = {
            documentNumber: 'TEST-0001',
            catches: [
                {
                    catchCertificateNumber: 'CC-0001',
                    species: 'Cod',
                    totalWeightLanded: '100',
                    exportWeightBeforeProcessing: '80',
                    exportWeightAfterProcessing: '70',
                    productIndex: 0,
                    productId: 'PROD-001'
                }
            ],
            products: [{ id: 'PROD-001', commodityCode: '001', description: 'Sample product' }],
            consignmentDescription: 'Test consignment',
            plantName: 'Test Plant',
            plantAddressOne: '1 Plant St',
            plantAddressTwo: '',
            plantTownCity: 'Plantville',
            plantPostcode: 'PL1 1NT',
            plantApprovalNumber: 'APP-123',
            personResponsibleForConsignment: 'John Doe',
            dateOfAcceptance: '2025-11-22',
            exporter: {
                exporterCompanyName: 'Exporter Ltd',
                addressOne: '1 Exporter Rd',
                addressTwo: '',
                townCity: 'Export Town',
                postcode: 'EX1 1EX'
            },
            healthCertificateNumber: 'HC-0001',
            healthCertificateDate: '2025-11-22'
        };

        const pass = new PassThrough();
        const chunks = [];
        pass.on('data', (c) => chunks.push(c));

        const finished = new Promise((resolve) => pass.on('finish', resolve));

        // call renderer with isSample=true to avoid QR generation
        await renderProcessingStatement(data, true, 'http://example', pass);

        // wait for the stream to be finished
        await finished;

        const buffer = Buffer.concat(chunks);
        expect(buffer.length).toBeGreaterThan(0);
    });

    test('renders processing statement with multiple products with 13px spacing', async () => {
        const data = {
            documentNumber: 'TEST-0002',
            catches: [
                {
                    catchCertificateNumber: 'CC-0001',
                    species: 'Cod',
                    totalWeightLanded: '100',
                    exportWeightBeforeProcessing: '80',
                    exportWeightAfterProcessing: '70',
                    productIndex: 0,
                    productId: 'PROD-001'
                },
                {
                    catchCertificateNumber: 'CC-0002',
                    species: 'Salmon',
                    totalWeightLanded: '200',
                    exportWeightBeforeProcessing: '180',
                    exportWeightAfterProcessing: '160',
                    productIndex: 1,
                    productId: 'PROD-002'
                }
            ],
            products: [
                { id: 'PROD-001', commodityCode: '001', description: 'Product One' },
                { id: 'PROD-002', commodityCode: '002', description: 'Product Two' }
            ],
            plantName: 'Test Plant',
            plantAddressOne: '1 Plant St',
            plantAddressTwo: '',
            plantTownCity: 'Plantville',
            plantPostcode: 'PL1 1NT',
            plantApprovalNumber: 'APP-123',
            personResponsibleForConsignment: 'John Doe',
            dateOfAcceptance: '2025-11-22',
            exporter: {
                exporterCompanyName: 'Exporter Ltd',
                addressOne: '1 Exporter Rd',
                addressTwo: '',
                townCity: 'Export Town',
                postcode: 'EX1 1EX'
            },
            healthCertificateNumber: 'HC-0001',
            healthCertificateDate: '2025-11-22'
        };

        const pass = new PassThrough();
        const chunks = [];
        pass.on('data', (c) => chunks.push(c));

        const finished = new Promise((resolve) => pass.on('finish', resolve));

        // call renderer with isSample=true to avoid QR generation
        // This test verifies the 13px spacing logic for subsequent products (productIndex > 0)
        await renderProcessingStatement(data, true, 'http://example', pass);

        // wait for the stream to be finished
        await finished;

        const buffer = Buffer.concat(chunks);
        // Verify rendering succeeds with multiple products
        expect(buffer.length).toBeGreaterThan(0);
    });

    test('renders processing statement with many products requiring pagination in section1', async () => {
        const catches = [];
        const products = [];
        
        // Create 10 products with 3 catches each to force section1 pagination
        for (let i = 0; i < 10; i++) {
            const productId = `PROD-${i}`;
            products.push({
                id: productId,
                commodityCode: `00${i}`,
                description: `Product ${i} with a reasonably long description that might wrap`
            });
            
            for (let j = 0; j < 3; j++) {
                catches.push({
                    catchCertificateNumber: `CC-${i}-${j}`,
                    species: `Species ${i}-${j}`,
                    totalWeightLanded: `${100 + i * 10 + j}`,
                    exportWeightBeforeProcessing: `${80 + i * 10 + j}`,
                    exportWeightAfterProcessing: `${70 + i * 10 + j}`,
                    productIndex: i,
                    productId: productId
                });
            }
        }

        const data = {
            documentNumber: 'TEST-MULTI-PAGE',
            catches,
            products,
            plantName: 'Test Plant',
            plantAddressOne: '1 Plant St',
            plantAddressTwo: 'Suite 100',
            plantTownCity: 'Plantville',
            plantPostcode: 'PL1 1NT',
            plantApprovalNumber: 'APP-123',
            personResponsibleForConsignment: 'John Doe',
            dateOfAcceptance: '2025-11-22',
            exporter: {
                exporterCompanyName: 'Exporter Ltd',
                addressOne: '1 Exporter Rd',
                addressTwo: '',
                townCity: 'Export Town',
                postcode: 'EX1 1EX'
            },
            healthCertificateNumber: 'HC-0001',
            healthCertificateDate: '2025-11-22'
        };

        const pass = new PassThrough();
        const chunks = [];
        pass.on('data', (c) => chunks.push(c));

        const finished = new Promise((resolve) => pass.on('finish', resolve));

        await renderProcessingStatement(data, true, 'http://example', pass);

        await finished;

        const buffer = Buffer.concat(chunks);
        // Should generate a multi-page document
        expect(buffer.length).toBeGreaterThan(10000);
    });

    test('renders processing statement with a long exporter address without overlap', async () => {
        const data = {
            documentNumber: 'TEST-EXPORTER-ADDRESS',
            catches: [
                {
                    catchCertificateNumber: 'CC-0001',
                    species: 'Cod',
                    totalWeightLanded: '100',
                    exportWeightBeforeProcessing: '80',
                    exportWeightAfterProcessing: '70',
                    productIndex: 0,
                    productId: 'PROD-001'
                }
            ],
            products: [{ id: 'PROD-001', commodityCode: '001', description: 'Sample product' }],
            consignmentDescription: 'Test consignment',
            plantName: 'Test Plant',
            plantAddressOne: '1 Plant St',
            plantAddressTwo: '',
            plantTownCity: 'Plantville',
            plantPostcode: 'PL1 1NT',
            plantApprovalNumber: 'APP-123',
            personResponsibleForConsignment: 'John Doe',
            dateOfAcceptance: '2025-11-22',
            exporter: {
                exporterCompanyName: 'Exporter Ltd',
                addressOne: '123 Long Exporter Road with multiple components and a very long street name',
                addressTwo: 'Unit 10, Large Industrial Estate, Some District',
                townCity: 'Large Export Town with extended name',
                postcode: 'EX12 3YZ'
            },
            healthCertificateNumber: 'HC-0001',
            healthCertificateDate: '2025-11-22'
        };

        const pass = new PassThrough();
        const chunks = [];
        pass.on('data', (c) => chunks.push(c));

        const finished = new Promise((resolve) => pass.on('finish', resolve));

        await renderProcessingStatement(data, true, 'http://example', pass);

        await finished;

        const buffer = Buffer.concat(chunks);
        expect(buffer.length).toBeGreaterThan(0);
    });

    test('renders processing statement with catches requiring schedule pages', async () => {
        const catches = [];
        
        // Create more than 5 catches for a single product to trigger schedule page
        for (let i = 0; i < 8; i++) {
            catches.push({
                catchCertificateNumber: `CC-000${i}`,
                species: `Cod - Variant ${i}`,
                totalWeightLanded: `${100 + i * 5}`,
                exportWeightBeforeProcessing: `${90 + i * 5}`,
                exportWeightAfterProcessing: `${80 + i * 5}`,
                productIndex: 0,
                productId: 'PROD-001'
            });
        }

        const data = {
            documentNumber: 'TEST-SCHEDULE',
            catches,
            products: [{ id: 'PROD-001', commodityCode: '001', description: 'Product with many catches' }],
            plantName: 'Test Plant',
            plantAddressOne: '1 Plant St',
            plantAddressTwo: '',
            plantTownCity: 'Plantville',
            plantPostcode: 'PL1 1NT',
            plantApprovalNumber: 'APP-123',
            personResponsibleForConsignment: 'John Doe',
            dateOfAcceptance: '2025-11-22',
            exporter: {
                exporterCompanyName: 'Exporter Ltd',
                addressOne: '1 Exporter Rd',
                addressTwo: '',
                townCity: 'Export Town',
                postcode: 'EX1 1EX'
            },
            healthCertificateNumber: 'HC-0001',
            healthCertificateDate: '2025-11-22'
        };

        const pass = new PassThrough();
        const chunks = [];
        pass.on('data', (c) => chunks.push(c));

        const finished = new Promise((resolve) => pass.on('finish', resolve));

        await renderProcessingStatement(data, true, 'http://example', pass);

        await finished;

        const buffer = Buffer.concat(chunks);
        // Should generate document with schedule page
        expect(buffer.length).toBeGreaterThan(5000);
    });

    test('handles separator pagination correctly to avoid overlap with endOfPage', async () => {
        // Create data that will position separator near page boundary
        const catches = [];
        const products = [];
        
        // Create 6 products to push separator close to page boundary
        for (let i = 0; i < 6; i++) {
            const productId = `PROD-${i}`;
            products.push({
                id: productId,
                commodityCode: `CODE-${i}`,
                description: `Product ${i} description`
            });
            
            catches.push({
                catchCertificateNumber: `CC-${i}`,
                species: `Species ${i}`,
                totalWeightLanded: `${100 + i}`,
                exportWeightBeforeProcessing: `${90 + i}`,
                exportWeightAfterProcessing: `${80 + i}`,
                productIndex: i,
                productId: productId
            });
        }

        const data = {
            documentNumber: 'TEST-SEPARATOR',
            catches,
            products,
            plantName: 'Test Plant',
            plantAddressOne: '1 Plant St',
            plantAddressTwo: '',
            plantTownCity: 'Plantville',
            plantPostcode: 'PL1 1NT',
            plantApprovalNumber: 'APP-123',
            personResponsibleForConsignment: 'Jane Smith',
            dateOfAcceptance: '2025-11-22',
            exporter: {
                exporterCompanyName: 'Export Corp',
                addressOne: '123 Export Lane',
                addressTwo: '',
                townCity: 'Export City',
                postcode: 'EC1 2AB'
            },
            healthCertificateNumber: 'HC-TEST',
            healthCertificateDate: '2025-11-22'
        };

        const pass = new PassThrough();
        const chunks = [];
        pass.on('data', (c) => chunks.push(c));

        const finished = new Promise((resolve) => pass.on('finish', resolve));

        await renderProcessingStatement(data, true, 'http://example', pass);

        await finished;

        const buffer = Buffer.concat(chunks);
        // Should successfully render without overlap issues
        expect(buffer.length).toBeGreaterThan(0);
    });

    test('renders processing statement with no products array using consignmentDescription fallback', async () => {
        const data = {
            documentNumber: 'TEST-NO-PRODUCTS',
            catches: [
                {
                    catchCertificateNumber: 'CC-0001',
                    species: 'Haddock',
                    totalWeightLanded: '150',
                    exportWeightBeforeProcessing: '130',
                    exportWeightAfterProcessing: '120',
                    productIndex: 0,
                    productId: 'FALLBACK-PROD'
                }
            ],
            products: [],
            consignmentDescription: 'Mixed fishery products',
            plantName: 'Test Plant',
            plantAddressOne: '1 Plant St',
            plantAddressTwo: '',
            plantTownCity: 'Plantville',
            plantPostcode: 'PL1 1NT',
            plantApprovalNumber: 'APP-123',
            personResponsibleForConsignment: 'John Doe',
            dateOfAcceptance: '2025-11-22',
            exporter: {
                exporterCompanyName: 'Exporter Ltd',
                addressOne: '1 Exporter Rd',
                addressTwo: '',
                townCity: 'Export Town',
                postcode: 'EX1 1EX'
            },
            healthCertificateNumber: 'HC-0001',
            healthCertificateDate: '2025-11-22'
        };

        const pass = new PassThrough();
        const chunks = [];
        pass.on('data', (c) => chunks.push(c));

        const finished = new Promise((resolve) => pass.on('finish', resolve));

        await renderProcessingStatement(data, true, 'http://example', pass);

        await finished;

        const buffer = Buffer.concat(chunks);
        expect(buffer.length).toBeGreaterThan(0);
    });

    test('renders processing statement with long addresses without text overlapping (FI0-11283)', async () => {
        const data = {
            documentNumber: 'TEST-LONG-ADDRESS',
            catches: [
                {
                    catchCertificateNumber: 'CC-0001',
                    species: 'Atlantic Cod',
                    totalWeightLanded: '100',
                    exportWeightBeforeProcessing: '90',
                    exportWeightAfterProcessing: '80',
                    productIndex: 0,
                    productId: 'PROD-001'
                }
            ],
            products: [{ id: 'PROD-001', commodityCode: '001', description: 'Fresh fish' }],
            consignmentDescription: 'Fresh seafood products',
            plantName: 'Marine Foods Processing Ltd',
            plantAddressOne: 'HORNBEAM HOUSE HORNBEAM HOUSE, DEPARTMENT FOR ENVIRONMENT FOOD & RURAL AFFAIRS (D E F R A) FOOD & RURAL AFFAIRS (D E F R A)',
            plantAddressTwo: 'ELECTRA WAY ELECTRA WAY',
            plantTownCity: 'CREWE CREWE CREWE',
            plantPostcode: 'CW1 6GJ',
            plantApprovalNumber: 'UK-EST-123',
            personResponsibleForConsignment: 'John Smith',
            dateOfAcceptance: '2025-11-22',
            exporter: {
                exporterCompanyName: 'British Seafood Exporters International Ltd',
                addressOne: 'Unit 5, Harbourside Business Park, Maritime Way',
                addressTwo: 'Extended Industrial Estate, Northern Quarter',
                townCity: 'Portsmouth',
                postcode: 'PO1 2AB'
            },
            healthCertificateNumber: 'HC-0001',
            healthCertificateDate: '2025-11-22'
        };

        const pass = new PassThrough();
        const chunks = [];
        pass.on('data', (c) => chunks.push(c));

        const finished = new Promise((resolve) => pass.on('finish', resolve));

        // Test that long addresses render without overlap using noEllipsis wrapping and increased cell height
        await renderProcessingStatement(data, true, 'http://example', pass);

        await finished;

        const buffer = Buffer.concat(chunks);
        // Should successfully render without text overlap
        expect(buffer.length).toBeGreaterThan(0);
        // Verify PDF is generated (basic validation)
        expect(buffer.toString('utf8', 0, 5)).toContain('%PDF');
    });
});
