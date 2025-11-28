const pdfService = require('../../../src/pdfService');
const blobManager = require('../../../src/storage/blobManager');
const { pdfType } = require('../../../src/pdf/pdfRenderer');
const fs = require('fs');

const { PassThrough } = require('stream');
const mockedStream = new PassThrough();

mockedStream.on('data', (d) => {
});

mockedStream.on('end', function() {
});

mockedStream.emit('data', 'hello world');
mockedStream.end();
mockedStream.destroy();

const getTestStream = function(principalId, blobName) {
    return fs.createWriteStream('./tests/test.pdf');
}

describe('pdfService', () => {

    jest.setTimeout(60000);

    test('should create the expected pdf', async () => {
        const mockCreateContainer = jest.spyOn(blobManager, 'createContainer');
        mockCreateContainer.mockResolvedValue(undefined);
    
        const mockWriteStreamForBlob = jest.spyOn(blobManager, 'writeStreamForBlob');
        mockWriteStreamForBlob.mockResolvedValue(mockedStream);

        const principalId = '527fb0dd-b1d7-46c8-bfed-e06b373d041c';

        const data = {
            documentNumber: "GBR-2018-SD-1C89DE54F",
            exporter: {
                'exporterFullName': 'Jim Jessop',
                'exporterCompanyName': 'FishByMail Ltd',
                'addressOne': '77 Coast Road',
                'addressTwo': 'My address is particularly long',
                'townCity': 'Jarrow',
                'postcode': 'NE31 1YW'
            },
            exportPayload: {
                items: [
                    {
                        product: {
                            commodityCode: "03036310",
                            presentation: {
                                "code": "FIL",
                                "label": "Filleted"
                            },
                            state: {
                                "code": "FRO",
                                "label": "Frozen"
                            },
                            species: {
                                "code": "COD",
                                "label": "Atlantic cod (COD)"
                            }
                        },
                        landings: [
                            {
                                addMode: false,
                                editMode: false,
                                model: {
                                    id: "ce1fe347-2825-4152-884b-e8bad5ccde61",
                                    vessel: {
                                        pln: "B192",
                                        vesselName: "GOLDEN BELLS 11",
                                        homePort: "ARDGLASS",
                                        registrationNumber: "A12186",
                                        licenceNumber: "10106",
                                        licenceValidTo: "2027-12-31T00:00:00",
                                        label: "GOLDEN BELLS 11 (B192)"
                                    },
                                    dateLanded: "2019-01-28T00:00:00.000Z",
                                    exportWeight: "10"
                                }
                            }
                        ]
                    },
                    {
                        product: {
                            commodityCode: "30363359",
                            presentation: {
                                "code": "FIL",
                                "label": "Filleted"
                            },
                            state: {
                                "code": "FRO",
                                "label": "Frozen"
                            },
                            species: {
                                "code": "HER",
                                "label": "Atlantic Herring (HER)"
                            }
                        },
                        landings: [
                            {
                                addMode: false,
                                editMode: false,
                                model: {
                                    id: "ce1fe347-2825-4152-884b-e8bad5ccde61",
                                    vessel: {
                                        pln: "B192",
                                        vesselName: "GOLDEN BELLS 11",
                                        homePort: "ARDGLASS",
                                        registrationNumber: "A12186",
                                        licenceNumber: "10106",
                                        licenceValidTo: "2027-12-31T00:00:00",
                                        label: "GOLDEN BELLS 11 (B192)"
                                    },
                                    dateLanded: "2019-01-27T00:00:00.000Z",
                                    exportWeight: "20"
                                }
                            }
                        ]
                    },
                    {
                        product: {
                            commodityCode: "30363301",
                            presentation: {
                                "code": "FIL",
                                "label": "Filleted"
                            },
                            state: {
                                "code": "FRO",
                                "label": "Frozen"
                            },
                            species: {
                                "code": "FISH1",
                                "label": "FISH1 (FISH1)"
                            }
                        },
                        landings: [
                            {
                                addMode: false,
                                editMode: false,
                                model: {
                                    id: "ce1fe347-2825-4152-884b-e8bad5ccde61",
                                    vessel: {
                                        pln: "B192",
                                        vesselName: "GOLDEN BELLS 11",
                                        homePort: "ARDGLASS",
                                        registrationNumber: "A12186",
                                        licenceNumber: "10106",
                                        licenceValidTo: "2027-12-31T00:00:00",
                                        label: "GOLDEN BELLS 11 (B192)"
                                    },
                                    dateLanded: "2019-01-26T00:00:00.000Z",
                                    exportWeight: "30"
                                }
                            }
                        ]
                    },
                    {
                        product: {
                            commodityCode: "30000002",
                            presentation: {
                                "code": "FIL",
                                "label": "Filleted"
                            },
                            state: {
                                "code": "FRO",
                                "label": "Frozen"
                            },
                            species: {
                                "code": "FISH2",
                                "label": "FISH2 (FISH2)"
                            }
                        },
                        landings: [
                            {
                                addMode: false,
                                editMode: false,
                                model: {
                                    id: "ce1fe347-2825-4152-884b-e8bad5ccde61",
                                    vessel: {
                                        pln: "B192",
                                        vesselName: "GOLDEN BELLS 11",
                                        homePort: "ARDGLASS",
                                        registrationNumber: "A12186",
                                        licenceNumber: "10106",
                                        licenceValidTo: "2027-12-31T00:00:00",
                                        label: "GOLDEN BELLS 11 (B192)"
                                    },
                                    dateLanded: "2019-01-25T00:00:00.000Z",
                                    exportWeight: "20"
                                }
                            }
                        ]
                    },
                    {
                        product: {
                            commodityCode: "30000003",
                            presentation: {
                                "code": "FIL",
                                "label": "Filleted"
                            },
                            state: {
                                "code": "FRO",
                                "label": "Frozen"
                            },
                            species: {
                                "code": "FISH3",
                                "label": "FISH3 (FISH3)"
                            }
                        },
                        landings: [
                            {
                                addMode: false,
                                editMode: false,
                                model: {
                                    id: "ce1fe347-2825-4152-884b-e8bad5ccde61",
                                    vessel: {
                                        pln: "B192",
                                        vesselName: "GOLDEN BELLS 11",
                                        homePort: "ARDGLASS",
                                        registrationNumber: "A12186",
                                        licenceNumber: "10106",
                                        licenceValidTo: "2027-12-31T00:00:00",
                                        label: "GOLDEN BELLS 11 (B192)"
                                    },
                                    dateLanded: "2019-01-24T00:00:00.000Z",
                                    exportWeight: "30"
                                }
                            }
                        ]
                    },
                    {
                        product: {
                            commodityCode: "30000004",
                            presentation: {
                                "code": "FIL",
                                "label": "Filleted"
                            },
                            state: {
                                "code": "FRO",
                                "label": "Frozen"
                            },
                            species: {
                                "code": "FISH4",
                                "label": "FISH4 (FISH4)"
                            }
                        },
                        landings: [
                            {
                                addMode: false,
                                editMode: false,
                                model: {
                                    id: "ce1fe347-2825-4152-884b-e8bad5ccde61",
                                    vessel: {
                                        pln: "B192",
                                        vesselName: "GOLDEN BELLS 11",
                                        homePort: "ARDGLASS",
                                        registrationNumber: "A12186",
                                        licenceNumber: "10106",
                                        licenceValidTo: "2027-12-31T00:00:00",
                                        label: "GOLDEN BELLS 11 (B192)"
                                    },
                                    dateLanded: "2019-01-23T00:00:00.000Z",
                                    exportWeight: "40"
                                }
                            }
                        ]
                    }
                ]
            },
            transport: {
                "vehicle": "plane",
                "departurePlace": "hull",
                "user_id": "a9602f38-f220-475a-991f-a19626bc51ae",
                "flightNumber": "123",
                "containerNumber": "456",
                "exportedTo": {
                    "officialCountryName": 'France',
                }
            },
            conservation: {
                "conservationReference": "Common fisheries policy"
            }
        };

        const responseJson = await pdfService.generatePdfAndUpload(principalId, pdfType.EXPORT_CERT,
            data, false, { getStream: getTestStream });

        expect(responseJson).toBeTruthy();

    });

    test("should handle catch areas with RFMO and EEZ data", async () => {
        const mockCreateContainer = jest.spyOn(blobManager, 'createContainer');
        mockCreateContainer.mockResolvedValue(undefined);
    
        const mockWriteStreamForBlob = jest.spyOn(blobManager, 'writeStreamForBlob');
        mockWriteStreamForBlob.mockResolvedValue(mockedStream);

        const principalId = '527fb0dd-b1d7-46c8-bfed-e06b373d041c';

        const data = {
            documentNumber: "GBR-2024-CC-TEST001",
            exporter: {
                exporterFullName: "Test Exporter",
                exporterCompanyName: "Test Company",
                addressOne: "123 Test St",
                townCity: "Test City",
                postcode: "TS1 1TS",
            },
            exportPayload: {
                items: [
                    {
                        product: {
                            commodityCode: "03036310",
                            presentation: {
                                code: "FIL",
                                label: "Filleted",
                            },
                            state: {
                                code: "FRO",
                                label: "Frozen",
                            },
                            species: {
                                code: "COD",
                                label: "Atlantic cod (COD)",
                            },
                        },
                        landings: [
                            {
                                model: {
                                    id: "test-id-1",
                                    vessel: {
                                        pln: "V001",
                                        vesselName: "TEST VESSEL",
                                        label: "TEST VESSEL (V001)",
                                        homePort: "PETERHEAD",
                                        imoNumber: "1111111",
                                    },
                                    dateLanded: "2024-11-01T00:00:00.000Z",
                                    exportWeight: 100,
                                    catchAreas: "FAO27",
                                    exclusiveEconomicZones: [
                                        { isoCodeAlpha2: "GB" },
                                        { isoCodeAlpha2: "FR" },
                                        { isoCodeAlpha2: "NO" }
                                    ],
                                    rfmo: "North East Atlantic Fisheries Commission (NEAFC)",
                                    highSeasArea: "Yes",
                                },
                            },
                        ],
                    },
                    {
                        product: {
                            commodityCode: "03036400",
                            presentation: {
                                code: "FIL",
                                label: "Filleted",
                            },
                            state: {
                                code: "FRO",
                                label: "Frozen",
                            },
                            species: {
                                code: "HAD",
                                label: "Haddock (HAD)",
                            },
                        },
                        landings: [
                            {
                                model: {
                                    id: "test-id-2",
                                    vessel: {
                                        pln: "V001",
                                        vesselName: "TEST VESSEL",
                                        label: "TEST VESSEL (V001)",
                                        homePort: "PETERHEAD",
                                        imoNumber: "1111111",
                                    },
                                    dateLanded: "2024-11-02T00:00:00.000Z",
                                    exportWeight: 150,
                                    catchAreas: "FAO21",
                                    exclusiveEconomicZones: [
                                        { isoCodeAlpha2: "US" },
                                        { isoCodeAlpha2: "CA" }
                                    ],
                                    rfmo: "NAFO (Northwest Atlantic Fisheries Organization)",
                                    highSeasArea: "No",
                                },
                            },
                        ],
                    },
                    {
                        product: {
                            commodityCode: "03036500",
                            presentation: {
                                code: "WHO",
                                label: "Whole",
                            },
                            state: {
                                code: "FRE",
                                label: "Fresh",
                            },
                            species: {
                                code: "MAC",
                                label: "Mackerel (MAC)",
                            },
                        },
                        landings: [
                            {
                                model: {
                                    id: "test-id-3",
                                    vessel: {
                                        pln: "V001",
                                        vesselName: "TEST VESSEL",
                                        label: "TEST VESSEL (V001)",
                                        homePort: "PETERHEAD",
                                        imoNumber: "1111111",
                                    },
                                    dateLanded: "2024-11-03T00:00:00.000Z",
                                    exportWeight: 200,
                                    catchAreas: "FAO34",
                                    exclusiveEconomicZones: [
                                        { isoCodeAlpha2: "AR" }
                                    ],
                                    rfmo: "SEAFO (South East Atlantic Fisheries Organisation)",
                                    highSeasArea: "Yes",
                                },
                            },
                        ],
                    },
                    {
                        product: {
                            commodityCode: "03036600",
                            presentation: {
                                code: "FIL",
                                label: "Filleted",
                            },
                            state: {
                                code: "FRO",
                                label: "Frozen",
                            },
                            species: {
                                code: "HER",
                                label: "Herring (HER)",
                            },
                        },
                        landings: [
                            {
                                model: {
                                    id: "test-id-4",
                                    vessel: {
                                        pln: "V001",
                                        vesselName: "TEST VESSEL",
                                        label: "TEST VESSEL (V001)",
                                        homePort: "PETERHEAD",
                                        imoNumber: "1111111",
                                    },
                                    dateLanded: "2024-11-04T00:00:00.000Z",
                                    exportWeight: 80,
                                    catchAreas: "FAO27",
                                    exclusiveEconomicZones: [
                                        { isoCodeAlpha2: "BE" },
                                        { isoCodeAlpha2: "NL" },
                                        { isoCodeAlpha2: "DE" }
                                    ],
                                    rfmo: "North East Atlantic Fisheries Commission (NEAFC)",
                                    highSeasArea: "No",
                                },
                            },
                        ],
                    },
                    {
                        product: {
                            commodityCode: "03036700",
                            presentation: {
                                code: "GUT",
                                label: "Gutted",
                            },
                            state: {
                                code: "FRO",
                                label: "Frozen",
                            },
                            species: {
                                code: "PLE",
                                label: "Plaice (PLE)",
                            },
                        },
                        landings: [
                            {
                                model: {
                                    id: "test-id-5",
                                    vessel: {
                                        pln: "V001",
                                        vesselName: "TEST VESSEL",
                                        label: "TEST VESSEL (V001)",
                                        homePort: "PETERHEAD",
                                        imoNumber: "1111111",
                                    },
                                    dateLanded: "2024-11-05T00:00:00.000Z",
                                    exportWeight: 120,
                                    catchAreas: "FAO27",
                                    exclusiveEconomicZones: [
                                        { isoCodeAlpha2: "DK" }
                                    ],
                                    rfmo: "North East Atlantic Fisheries Commission (NEAFC)",
                                    highSeasArea: "Yes",
                                },
                            },
                        ],
                    },
                    {
                        product: {
                            commodityCode: "03036800",
                            presentation: {
                                code: "FIL",
                                label: "Filleted",
                            },
                            state: {
                                code: "FRO",
                                label: "Frozen",
                            },
                            species: {
                                code: "SOL",
                                label: "Sole (SOL)",
                            },
                        },
                        landings: [
                            {
                                model: {
                                    id: "test-id-6",
                                    vessel: {
                                        pln: "V001",
                                        vesselName: "TEST VESSEL",
                                        label: "TEST VESSEL (V001)",
                                        homePort: "PETERHEAD",
                                        imoNumber: "1111111",
                                    },
                                    dateLanded: "2024-11-06T00:00:00.000Z",
                                    exportWeight: 90,
                                    catchAreas: "FAO27",
                                    exclusiveEconomicZones: [
                                        { isoCodeAlpha2: "GB" },
                                        { isoCodeAlpha2: "IE" }
                                    ],
                                    rfmo: "North East Atlantic Fisheries Commission (NEAFC)",
                                    highSeasArea: "No",
                                },
                            },
                        ],
                    },
                ],
            },
            transport: {
                vehicle: "truck",
                cmr: "CMR-TEST-001",
                exportedTo: {
                    officialCountryName: "France",
                },
            },
            conservation: {
                conservationReference: "Common Fisheries Policy",
            },
        };

        const responseJson = await pdfService.generatePdfAndUpload(principalId, pdfType.EXPORT_CERT,
            data, false, { getStream: getTestStream });

        expect(responseJson).toBeTruthy();
    });

    test("should handle exclusiveEconomicZones with multiple EEZ entries", async () => {
        const mockCreateContainer = jest.spyOn(blobManager, 'createContainer');
        mockCreateContainer.mockResolvedValue(undefined);
    
        const mockWriteStreamForBlob = jest.spyOn(blobManager, 'writeStreamForBlob');
        mockWriteStreamForBlob.mockResolvedValue(mockedStream);

        const principalId = '527fb0dd-b1d7-46c8-bfed-e06b373d041c';

        const data = {
            documentNumber: "GBR-2024-CC-TEST002",
            exporter: {
                exporterFullName: "Test Exporter",
                exporterCompanyName: "Test Company",
                addressOne: "123 Test St",
                townCity: "Test City",
                postcode: "TS1 1TS",
            },
            exportPayload: {
                items: [
                    {
                        product: {
                            commodityCode: "03036310",
                            presentation: {
                                code: "FIL",
                                label: "Filleted",
                            },
                            state: {
                                code: "FRO",
                                label: "Frozen",
                            },
                            species: {
                                code: "COD",
                                label: "Atlantic cod (COD)",
                            },
                        },
                        landings: [
                            {
                                model: {
                                    id: "test-id-1",
                                    vessel: {
                                        pln: "V001",
                                        vesselName: "TEST VESSEL",
                                        label: "TEST VESSEL (V001)",
                                        homePort: "PETERHEAD",
                                        imoNumber: "1111111",
                                    },
                                    dateLanded: "2024-11-01T00:00:00.000Z",
                                    exportWeight: 100,
                                    catchAreas: "FAO27",
                                    exclusiveEconomicZones: [
                                        { isoCodeAlpha2: "GB" },
                                        { isoCodeAlpha2: "FR" },
                                        { isoCodeAlpha2: "NO" },
                                        { isoCodeAlpha2: "BE" },
                                        { isoCodeAlpha2: "NL" }
                                    ],
                                    rfmo: "NEAFC",
                                    highSeasArea: "Yes",
                                },
                            },
                        ],
                    },
                    {
                        product: {
                            commodityCode: "03036400",
                            presentation: {
                                code: "FIL",
                                label: "Filleted",
                            },
                            state: {
                                code: "FRO",
                                label: "Frozen",
                            },
                            species: {
                                code: "HAD",
                                label: "Haddock (HAD)",
                            },
                        },
                        landings: [
                            {
                                model: {
                                    id: "test-id-2",
                                    vessel: {
                                        pln: "V001",
                                        vesselName: "TEST VESSEL",
                                        label: "TEST VESSEL (V001)",
                                        homePort: "PETERHEAD",
                                        imoNumber: "1111111",
                                    },
                                    dateLanded: "2024-11-02T00:00:00.000Z",
                                    exportWeight: 150,
                                    catchAreas: "FAO21",
                                    exclusiveEconomicZones: [
                                        { isoCodeAlpha2: "US" }
                                    ],
                                    rfmo: "NAFO",
                                    highSeasArea: "No",
                                },
                            },
                        ],
                    },
                    {
                        product: {
                            commodityCode: "03036500",
                            presentation: {
                                code: "WHO",
                                label: "Whole",
                            },
                            state: {
                                code: "FRE",
                                label: "Fresh",
                            },
                            species: {
                                code: "MAC",
                                label: "Mackerel (MAC)",
                            },
                        },
                        landings: [
                            {
                                model: {
                                    id: "test-id-3",
                                    vessel: {
                                        pln: "V001",
                                        vesselName: "TEST VESSEL",
                                        label: "TEST VESSEL (V001)",
                                        homePort: "PETERHEAD",
                                        imoNumber: "1111111",
                                    },
                                    dateLanded: "2024-11-03T00:00:00.000Z",
                                    exportWeight: 200,
                                    catchAreas: "FAO34",
                                    exclusiveEconomicZones: [
                                        { isoCodeAlpha2: "AR" },
                                        { isoCodeAlpha2: "BR" }
                                    ],
                                    rfmo: "SEAFO",
                                    highSeasArea: "Yes",
                                },
                            },
                        ],
                    },
                    {
                        product: {
                            commodityCode: "03036600",
                            presentation: {
                                code: "FIL",
                                label: "Filleted",
                            },
                            state: {
                                code: "FRO",
                                label: "Frozen",
                            },
                            species: {
                                code: "HER",
                                label: "Herring (HER)",
                            },
                        },
                        landings: [
                            {
                                model: {
                                    id: "test-id-4",
                                    vessel: {
                                        pln: "V001",
                                        vesselName: "TEST VESSEL",
                                        label: "TEST VESSEL (V001)",
                                        homePort: "PETERHEAD",
                                        imoNumber: "1111111",
                                    },
                                    dateLanded: "2024-11-04T00:00:00.000Z",
                                    exportWeight: 80,
                                    catchAreas: "FAO27",
                                    exclusiveEconomicZones: [
                                        { isoCodeAlpha2: "DK" }
                                    ],
                                    rfmo: "NEAFC",
                                    highSeasArea: "No",
                                },
                            },
                        ],
                    },
                    {
                        product: {
                            commodityCode: "03036700",
                            presentation: {
                                code: "GUT",
                                label: "Gutted",
                            },
                            state: {
                                code: "FRO",
                                label: "Frozen",
                            },
                            species: {
                                code: "PLE",
                                label: "Plaice (PLE)",
                            },
                        },
                        landings: [
                            {
                                model: {
                                    id: "test-id-5",
                                    vessel: {
                                        pln: "V001",
                                        vesselName: "TEST VESSEL",
                                        label: "TEST VESSEL (V001)",
                                        homePort: "PETERHEAD",
                                        imoNumber: "1111111",
                                    },
                                    dateLanded: "2024-11-05T00:00:00.000Z",
                                    exportWeight: 120,
                                    catchAreas: "FAO27",
                                    exclusiveEconomicZones: [
                                        { isoCodeAlpha2: "SE" },
                                        { isoCodeAlpha2: "FI" }
                                    ],
                                    rfmo: "NEAFC",
                                    highSeasArea: "Yes",
                                },
                            },
                        ],
                    },
                    {
                        product: {
                            commodityCode: "03036800",
                            presentation: {
                                code: "FIL",
                                label: "Filleted",
                            },
                            state: {
                                code: "FRO",
                                label: "Frozen",
                            },
                            species: {
                                code: "SOL",
                                label: "Sole (SOL)",
                            },
                        },
                        landings: [
                            {
                                model: {
                                    id: "test-id-6",
                                    vessel: {
                                        pln: "V001",
                                        vesselName: "TEST VESSEL",
                                        label: "TEST VESSEL (V001)",
                                        homePort: "PETERHEAD",
                                        imoNumber: "1111111",
                                    },
                                    dateLanded: "2024-11-06T00:00:00.000Z",
                                    exportWeight: 90,
                                    catchAreas: "FAO27",
                                    exclusiveEconomicZones: [
                                        { isoCodeAlpha2: "GB" },
                                        { isoCodeAlpha2: "IE" },
                                        { isoCodeAlpha2: "IS" }
                                    ],
                                    rfmo: "NEAFC",
                                    highSeasArea: "No",
                                },
                            },
                        ],
                    },
                ],
            },
            transport: {
                vehicle: "truck",
                cmr: "CMR-TEST-002",
                exportedTo: {
                    officialCountryName: "France",
                },
            },
            conservation: {
                conservationReference: "Common Fisheries Policy",
            },
        };

        const responseJson = await pdfService.generatePdfAndUpload(principalId, pdfType.EXPORT_CERT,
            data, false, { getStream: getTestStream });

        expect(responseJson).toBeTruthy();
    });

    test("should handle empty exclusiveEconomicZones and no high seas area", async () => {
        const mockCreateContainer = jest.spyOn(blobManager, 'createContainer');
        mockCreateContainer.mockResolvedValue(undefined);
    
        const mockWriteStreamForBlob = jest.spyOn(blobManager, 'writeStreamForBlob');
        mockWriteStreamForBlob.mockResolvedValue(mockedStream);

        const principalId = '527fb0dd-b1d7-46c8-bfed-e06b373d041c';

        const data = {
            documentNumber: "GBR-2024-CC-TEST003",
            exporter: {
                exporterFullName: "Test Exporter",
                exporterCompanyName: "Test Company",
                addressOne: "123 Test St",
                townCity: "Test City",
                postcode: "TS1 1TS",
            },
            exportPayload: {
                items: [
                    {
                        product: {
                            commodityCode: "03036310",
                            presentation: {
                                code: "FIL",
                                label: "Filleted",
                            },
                            state: {
                                code: "FRO",
                                label: "Frozen",
                            },
                            species: {
                                code: "COD",
                                label: "Atlantic cod (COD)",
                            },
                        },
                        landings: [
                            {
                                model: {
                                    id: "test-id-1",
                                    vessel: {
                                        pln: "V001",
                                        vesselName: "TEST VESSEL",
                                        label: "TEST VESSEL (V001)",
                                        homePort: "PETERHEAD",
                                        imoNumber: "1111111",
                                    },
                                    dateLanded: "2024-11-01T00:00:00.000Z",
                                    exportWeight: 100,
                                    catchAreas: "FAO27",
                                    exclusiveEconomicZones: [],
                                    rfmo: "NEAFC",
                                    highSeasArea: "",
                                },
                            },
                        ],
                    },
                    {
                        product: {
                            commodityCode: "03036400",
                            presentation: {
                                code: "FIL",
                                label: "Filleted",
                            },
                            state: {
                                code: "FRO",
                                label: "Frozen",
                            },
                            species: {
                                code: "HAD",
                                label: "Haddock (HAD)",
                            },
                        },
                        landings: [
                            {
                                model: {
                                    id: "test-id-2",
                                    vessel: {
                                        pln: "V001",
                                        vesselName: "TEST VESSEL",
                                        label: "TEST VESSEL (V001)",
                                        homePort: "PETERHEAD",
                                        imoNumber: "1111111",
                                    },
                                    dateLanded: "2024-11-02T00:00:00.000Z",
                                    exportWeight: 150,
                                    catchAreas: "FAO21",
                                    exclusiveEconomicZones: [],
                                    rfmo: "",
                                    highSeasArea: "No",
                                },
                            },
                        ],
                    },
                    {
                        product: {
                            commodityCode: "03036500",
                            presentation: {
                                code: "WHO",
                                label: "Whole",
                            },
                            state: {
                                code: "FRE",
                                label: "Fresh",
                            },
                            species: {
                                code: "MAC",
                                label: "Mackerel (MAC)",
                            },
                        },
                        landings: [
                            {
                                model: {
                                    id: "test-id-3",
                                    vessel: {
                                        pln: "V001",
                                        vesselName: "TEST VESSEL",
                                        label: "TEST VESSEL (V001)",
                                        homePort: "PETERHEAD",
                                        imoNumber: "1111111",
                                    },
                                    dateLanded: "2024-11-03T00:00:00.000Z",
                                    exportWeight: 200,
                                    catchAreas: "FAO34",
                                    exclusiveEconomicZones: [],
                                    rfmo: "",
                                    highSeasArea: "",
                                },
                            },
                        ],
                    },
                    {
                        product: {
                            commodityCode: "03036600",
                            presentation: {
                                code: "FIL",
                                label: "Filleted",
                            },
                            state: {
                                code: "FRO",
                                label: "Frozen",
                            },
                            species: {
                                code: "HER",
                                label: "Herring (HER)",
                            },
                        },
                        landings: [
                            {
                                model: {
                                    id: "test-id-4",
                                    vessel: {
                                        pln: "V001",
                                        vesselName: "TEST VESSEL",
                                        label: "TEST VESSEL (V001)",
                                        homePort: "PETERHEAD",
                                        imoNumber: "1111111",
                                    },
                                    dateLanded: "2024-11-04T00:00:00.000Z",
                                    exportWeight: 80,
                                    catchAreas: "FAO27",
                                    exclusiveEconomicZones: null,
                                    rfmo: "NEAFC",
                                    highSeasArea: "No",
                                },
                            },
                        ],
                    },
                    {
                        product: {
                            commodityCode: "03036700",
                            presentation: {
                                code: "GUT",
                                label: "Gutted",
                            },
                            state: {
                                code: "FRO",
                                label: "Frozen",
                            },
                            species: {
                                code: "PLE",
                                label: "Plaice (PLE)",
                            },
                        },
                        landings: [
                            {
                                model: {
                                    id: "test-id-5",
                                    vessel: {
                                        pln: "V001",
                                        vesselName: "TEST VESSEL",
                                        label: "TEST VESSEL (V001)",
                                        homePort: "PETERHEAD",
                                        imoNumber: "1111111",
                                    },
                                    dateLanded: "2024-11-05T00:00:00.000Z",
                                    exportWeight: 120,
                                    catchAreas: "FAO27",
                                    exclusiveEconomicZones: undefined,
                                    rfmo: null,
                                    highSeasArea: "Yes",
                                },
                            },
                        ],
                    },
                    {
                        product: {
                            commodityCode: "03036800",
                            presentation: {
                                code: "FIL",
                                label: "Filleted",
                            },
                            state: {
                                code: "FRO",
                                label: "Frozen",
                            },
                            species: {
                                code: "SOL",
                                label: "Sole (SOL)",
                            },
                        },
                        landings: [
                            {
                                model: {
                                    id: "test-id-6",
                                    vessel: {
                                        pln: "V001",
                                        vesselName: "TEST VESSEL",
                                        label: "TEST VESSEL (V001)",
                                        homePort: "PETERHEAD",
                                        imoNumber: "1111111",
                                    },
                                    dateLanded: "2024-11-06T00:00:00.000Z",
                                    exportWeight: 90,
                                    catchAreas: "FAO27",
                                    exclusiveEconomicZones: [],
                                    rfmo: "",
                                    highSeasArea: "",
                                },
                            },
                        ],
                    },
                ],
            },
            transport: {
                vehicle: "truck",
                cmr: "CMR-TEST-003",
                exportedTo: {
                    officialCountryName: "France",
                },
            },
            conservation: {
                conservationReference: "Common Fisheries Policy",
            },
        };

        const responseJson = await pdfService.generatePdfAndUpload(principalId, pdfType.EXPORT_CERT,
            data, false, { getStream: getTestStream });

        expect(responseJson).toBeTruthy();
    });

    test("should handle missing catch area fields gracefully", async () => {
        const mockCreateContainer = jest.spyOn(blobManager, 'createContainer');
        mockCreateContainer.mockResolvedValue(undefined);
    
        const mockWriteStreamForBlob = jest.spyOn(blobManager, 'writeStreamForBlob');
        mockWriteStreamForBlob.mockResolvedValue(mockedStream);

        const principalId = '527fb0dd-b1d7-46c8-bfed-e06b373d041c';

        const data = {
            documentNumber: "GBR-2024-CC-TEST004",
            exporter: {
                exporterFullName: "Test Exporter",
                exporterCompanyName: "Test Company",
                addressOne: "123 Test St",
                townCity: "Test City",
                postcode: "TS1 1TS",
            },
            exportPayload: {
                items: [
                    {
                        product: {
                            commodityCode: "03036310",
                            presentation: {
                                code: "FIL",
                                label: "Filleted",
                            },
                            state: {
                                code: "FRO",
                                label: "Frozen",
                            },
                            species: {
                                code: "COD",
                                label: "Atlantic cod (COD)",
                            },
                        },
                        landings: [
                            {
                                model: {
                                    id: "test-id-1",
                                    vessel: {
                                        pln: "V001",
                                        vesselName: "TEST VESSEL",
                                        label: "TEST VESSEL (V001)",
                                        homePort: "PETERHEAD",
                                        imoNumber: "1111111",
                                    },
                                    dateLanded: "2024-11-01T00:00:00.000Z",
                                    exportWeight: 100,
                                    catchAreas: "FAO27",
                                },
                            },
                        ],
                    },
                    {
                        product: {
                            commodityCode: "03036400",
                            presentation: {
                                code: "FIL",
                                label: "Filleted",
                            },
                            state: {
                                code: "FRO",
                                label: "Frozen",
                            },
                            species: {
                                code: "HAD",
                                label: "Haddock (HAD)",
                            },
                        },
                        landings: [
                            {
                                model: {
                                    id: "test-id-2",
                                    vessel: {
                                        pln: "V001",
                                        vesselName: "TEST VESSEL",
                                        label: "TEST VESSEL (V001)",
                                        homePort: "PETERHEAD",
                                        imoNumber: "1111111",
                                    },
                                    dateLanded: "2024-11-02T00:00:00.000Z",
                                    exportWeight: 150,
                                    catchAreas: "FAO21",
                                    rfmo: "NAFO",
                                },
                            },
                        ],
                    },
                    {
                        product: {
                            commodityCode: "03036500",
                            presentation: {
                                code: "WHO",
                                label: "Whole",
                            },
                            state: {
                                code: "FRE",
                                label: "Fresh",
                            },
                            species: {
                                code: "MAC",
                                label: "Mackerel (MAC)",
                            },
                        },
                        landings: [
                            {
                                model: {
                                    id: "test-id-3",
                                    vessel: {
                                        pln: "V001",
                                        vesselName: "TEST VESSEL",
                                        label: "TEST VESSEL (V001)",
                                        homePort: "PETERHEAD",
                                        imoNumber: "1111111",
                                    },
                                    dateLanded: "2024-11-03T00:00:00.000Z",
                                    exportWeight: 200,
                                    catchAreas: "FAO34",
                                    highSeasArea: "Yes",
                                },
                            },
                        ],
                    },
                    {
                        product: {
                            commodityCode: "03036600",
                            presentation: {
                                code: "FIL",
                                label: "Filleted",
                            },
                            state: {
                                code: "FRO",
                                label: "Frozen",
                            },
                            species: {
                                code: "HER",
                                label: "Herring (HER)",
                            },
                        },
                        landings: [
                            {
                                model: {
                                    id: "test-id-4",
                                    vessel: {
                                        pln: "V001",
                                        vesselName: "TEST VESSEL",
                                        label: "TEST VESSEL (V001)",
                                        homePort: "PETERHEAD",
                                        imoNumber: "1111111",
                                    },
                                    dateLanded: "2024-11-04T00:00:00.000Z",
                                    exportWeight: 80,
                                    catchAreas: "FAO27",
                                    exclusiveEconomicZones: [
                                        { isoCodeAlpha2: "BE" }
                                    ],
                                },
                            },
                        ],
                    },
                    {
                        product: {
                            commodityCode: "03036700",
                            presentation: {
                                code: "GUT",
                                label: "Gutted",
                            },
                            state: {
                                code: "FRO",
                                label: "Frozen",
                            },
                            species: {
                                code: "PLE",
                                label: "Plaice (PLE)",
                            },
                        },
                        landings: [
                            {
                                model: {
                                    id: "test-id-5",
                                    vessel: {
                                        pln: "V001",
                                        vesselName: "TEST VESSEL",
                                        label: "TEST VESSEL (V001)",
                                        homePort: "PETERHEAD",
                                        imoNumber: "1111111",
                                    },
                                    dateLanded: "2024-11-05T00:00:00.000Z",
                                    exportWeight: 120,
                                    catchAreas: "FAO27",
                                },
                            },
                        ],
                    },
                    {
                        product: {
                            commodityCode: "03036800",
                            presentation: {
                                code: "FIL",
                                label: "Filleted",
                            },
                            state: {
                                code: "FRO",
                                label: "Frozen",
                            },
                            species: {
                                code: "SOL",
                                label: "Sole (SOL)",
                            },
                        },
                        landings: [
                            {
                                model: {
                                    id: "test-id-6",
                                    vessel: {
                                        pln: "V001",
                                        vesselName: "TEST VESSEL",
                                        label: "TEST VESSEL (V001)",
                                        homePort: "PETERHEAD",
                                        imoNumber: "1111111",
                                    },
                                    dateLanded: "2024-11-06T00:00:00.000Z",
                                    exportWeight: 90,
                                    catchAreas: "FAO27",
                                },
                            },
                        ],
                    },
                ],
            },
            transport: {
                vehicle: "truck",
                cmr: "CMR-TEST-004",
                exportedTo: {
                    officialCountryName: "France",
                },
            },
            conservation: {
                conservationReference: "Common Fisheries Policy",
            },
        };

        const responseJson = await pdfService.generatePdfAndUpload(principalId, pdfType.EXPORT_CERT,
            data, false, { getStream: getTestStream });

        expect(responseJson).toBeTruthy();
    });
});