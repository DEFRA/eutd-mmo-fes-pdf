const pdfService = require('../../../src/pdfService');
const blobManager = require('../../../src/storage/blobManager');
const { pdfType } = require('../../../src/pdf/pdfRenderer');
const fs = require('fs');

const { PassThrough } = require('stream');
const mockedStream = new PassThrough();

mockedStream.on('data', (d) => {});
mockedStream.on('end', function() {});
mockedStream.emit('data', 'hello world');
mockedStream.end();
mockedStream.destroy();

const getTestStream = function(principalId, blobName) {
    return fs.createWriteStream('./tests/test-multi-transport.pdf');
};

describe('pdfService - Multiple Transport Modes', () => {
    const mockCreateContainer = jest.spyOn(blobManager, 'createContainer');
    mockCreateContainer.mockResolvedValue(undefined);

    const mockWriteStreamForBlob = jest.spyOn(blobManager, 'writeStreamForBlob');
    mockWriteStreamForBlob.mockResolvedValue(mockedStream);

    jest.setTimeout(60000);

    test('should create export cert with 5 transport modes (max as per requirements)', async () => {
        const containerName = 'export-certificates';
        const data = {
            documentNumber: "GBR-2024-CC-ABC123456",
            exporter: {
                exporterFullName: "Test Exporter",
                exporterCompanyName: "Export Co Ltd",
                addressOne: "123 Test Street",
                townCity: "London",
                postcode: "SW1A 1AA",
            },
            exportPayload: {
                items: [
                    {
                        product: {
                            commodityCode: "03036310",
                            presentation: { code: "FIL", label: "Filleted" },
                            state: { code: "FRO", label: "Frozen" },
                            species: { code: "COD", label: "Atlantic cod (COD)" },
                        },
                        landings: [
                            {
                                model: {
                                    vessel: {
                                        pln: "B192",
                                        vesselName: "TEST VESSEL",
                                        homePort: "LONDON",
                                    },
                                    dateLanded: "2024-01-15T00:00:00.000Z",
                                    exportWeight: 100,
                                },
                            },
                        ],
                    },
                ],
            },
            // 5 transport modes: 2 containerVessel, 2 truck, 1 plane
            transportations: [
                {
                    vehicle: "containerVessel",
                    vesselName: "MV Atlantic Star",
                    flagState: "GB",
                    transportDocuments: [
                        { name: "Bill of Lading", reference: "BOL-2024-001" },
                        { name: "Container Manifest", reference: "CM-ATL-001" },
                        { name: "Cargo Declaration", reference: "CD-ATL-001" }
                    ],
                    containerIdentificationNumber: "MSCU1234567",
                    departurePlace: "Southampton",
                    exportedFrom: "United Kingdom",
                    exportedTo: { officialCountryName: "France" },
                    pointOfDestination: "Le Havre",
                    freightBillNumber: "FBN-ATL-001"
                },
                {
                    vehicle: "containerVessel",
                    vesselName: "MV Pacific Express",
                    flagState: "NL",
                    transportDocuments: [
                        { name: "Bill of Lading", reference: "BOL-2024-002" }
                    ],
                    containerNumber: "HLCU9876543",
                    departurePlace: "Felixstowe",
                    exportedFrom: "United Kingdom",
                    exportedTo: { officialCountryName: "Belgium" },
                    pointOfDestination: "Antwerp",
                    freightBillNumber: "FBN-PAC-002"
                },
                {
                    vehicle: "truck",
                    nationalityOfVehicle: "GB",
                    registrationNumber: "TRK-123-GB",
                    transportDocuments: [
                        { name: "CMR", reference: "CMR-2024-001" },
                        { name: "Customs Transit", reference: "CT-TRK-001" }
                    ],
                    containerIdentificationNumber: "TRKU1111111",
                    departurePlace: "Dover",
                    exportedFrom: "United Kingdom",
                    exportedTo: { officialCountryName: "France" },
                    pointOfDestination: "Calais",
                    freightBillNumber: "FBN-TRK-001"
                },
                {
                    vehicle: "truck",
                    nationalityOfVehicle: "FR",
                    registrationNumber: "TRK-456-FR",
                    transportDocuments: [
                        { name: "CMR", reference: "CMR-2024-002" }
                    ],
                    containerIdentificationNumber: "TRKU2222222",
                    departurePlace: "Folkestone",
                    exportedFrom: "United Kingdom",
                    exportedTo: { officialCountryName: "Belgium" },
                    pointOfDestination: "Brussels",
                    freightBillNumber: "FBN-TRK-002"
                },
                {
                    vehicle: "plane",
                    flightNumber: "BA2490",
                    transportDocuments: [
                        { name: "Air Waybill", reference: "AWB-125-45678901" },
                        { name: "Shipper's Declaration", reference: "SD-BA-001" }
                    ],
                    departurePlace: "London Heathrow Airport",
                    exportedFrom: "United Kingdom",
                    exportedTo: { officialCountryName: "Germany" },
                    pointOfDestination: "Frankfurt Airport",
                    freightBillNumber: "FBN-BA-001"
                }
            ],
            conservation: {
                conservationReference: "Common Fisheries Policy",
            },
            reExportedFromNonMemberCountries: [
                {
                    country: "Norway",
                    certificateNumber: "NOR-2024-001",
                },
            ],
        };

        const responseJson = await pdfService.generatePdfAndUpload(
            containerName,
            pdfType.EXPORT_CERT,
            data,
            false,
            { getStream: getTestStream }
        );

        expect(responseJson).toBeTruthy();
    });
});
