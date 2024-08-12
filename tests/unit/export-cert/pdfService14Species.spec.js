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
                            commodityCode: "30000001",
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
                                        licenceValidTo: "2300-02-10T00:00:00Z",
                                        label: "GOLDEN BELLS 11 (B192)"
                                    },
                                    dateLanded: "2019-01-26T00:00:00.000Z",
                                    exportWeight: "10"
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
                                        licenceValidTo: "2300-02-10T00:00:00Z",
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
                                        licenceValidTo: "2300-02-10T00:00:00Z",
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
                                        licenceValidTo: "2300-02-10T00:00:00Z",
                                        label: "GOLDEN BELLS 11 (B192)"
                                    },
                                    dateLanded: "2019-01-23T00:00:00.000Z",
                                    exportWeight: "40"
                                }
                            }
                        ]
                    },
                    {
                        product: {
                            commodityCode: "30000005",
                            presentation: {
                                "code": "FIL",
                                "label": "Filleted"
                            },
                            state: {
                                "code": "FRO",
                                "label": "Frozen"
                            },
                            species: {
                                "code": "FISH5",
                                "label": "FISH5 (FISH5)"
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
                                        licenceValidTo: "2300-02-10T00:00:00Z",
                                        label: "GOLDEN BELLS 11 (B192)"
                                    },
                                    dateLanded: "2019-01-22T00:00:00.000Z",
                                    exportWeight: "50"
                                }
                            }
                        ]
                    },
                    {
                        product: {
                            commodityCode: "30000006",
                            presentation: {
                                "code": "FIL",
                                "label": "Filleted"
                            },
                            state: {
                                "code": "FRO",
                                "label": "Frozen"
                            },
                            species: {
                                "code": "FISH6",
                                "label": "FISH6 (FISH6)"
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
                                        licenceValidTo: "2300-02-10T00:00:00Z",
                                        label: "GOLDEN BELLS 11 (B192)"
                                    },
                                    dateLanded: "2019-01-26T00:00:00.000Z",
                                    exportWeight: "60"
                                }
                            }
                        ]
                    },
                    {
                        product: {
                            commodityCode: "30000007",
                            presentation: {
                                "code": "FIL",
                                "label": "Filleted"
                            },
                            state: {
                                "code": "FRO",
                                "label": "Frozen"
                            },
                            species: {
                                "code": "FISH7",
                                "label": "FISH7 (FISH7)"
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
                                        licenceValidTo: "2300-02-10T00:00:00Z",
                                        label: "GOLDEN BELLS 11 (B192)"
                                    },
                                    dateLanded: "2019-01-25T00:00:00.000Z",
                                    exportWeight: "70"
                                }
                            }
                        ]
                    },
                    {
                        product: {
                            commodityCode: "30000008",
                            presentation: {
                                "code": "FIL",
                                "label": "Filleted"
                            },
                            state: {
                                "code": "FRO",
                                "label": "Frozen"
                            },
                            species: {
                                "code": "FISH8",
                                "label": "FISH8 (FISH8)"
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
                                        licenceValidTo: "2300-02-10T00:00:00Z",
                                        label: "GOLDEN BELLS 11 (B192)"
                                    },
                                    dateLanded: "2019-01-24T00:00:00.000Z",
                                    exportWeight: "80"
                                }
                            }
                        ]
                    },
                    {
                        product: {
                            commodityCode: "30000009",
                            presentation: {
                                "code": "FIL",
                                "label": "Filleted"
                            },
                            state: {
                                "code": "FRO",
                                "label": "Frozen"
                            },
                            species: {
                                "code": "FISH9",
                                "label": "FISH9 (FISH9)"
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
                                        licenceValidTo: "2300-02-10T00:00:00Z",
                                        label: "GOLDEN BELLS 11 (B192)"
                                    },
                                    dateLanded: "2019-01-23T00:00:00.000Z",
                                    exportWeight: "90"
                                }
                            }
                        ]
                    },
                    {
                        product: {
                            commodityCode: "30000010",
                            presentation: {
                                "code": "FIL",
                                "label": "Filleted"
                            },
                            state: {
                                "code": "FRO",
                                "label": "Frozen"
                            },
                            species: {
                                "code": "FISH10",
                                "label": "FISH10 (FISH10)"
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
                                        licenceValidTo: "2300-02-10T00:00:00Z",
                                        label: "GOLDEN BELLS 11 (B192)"
                                    },
                                    dateLanded: "2019-01-22T00:00:00.000Z",
                                    exportWeight: "100"
                                }
                            }
                        ]
                    },
                    {
                        product: {
                            commodityCode: "30000011",
                            presentation: {
                                "code": "FIL",
                                "label": "Filleted"
                            },
                            state: {
                                "code": "FRO",
                                "label": "Frozen"
                            },
                            species: {
                                "code": "FISH11",
                                "label": "FISH11 (FISH11)"
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
                                        licenceValidTo: "2300-02-10T00:00:00Z",
                                        label: "GOLDEN BELLS 11 (B192)"
                                    },
                                    dateLanded: "2019-01-26T00:00:00.000Z",
                                    exportWeight: "110"
                                }
                            }
                        ]
                    },
                    {
                        product: {
                            commodityCode: "30000012",
                            presentation: {
                                "code": "FIL",
                                "label": "Filleted"
                            },
                            state: {
                                "code": "FRO",
                                "label": "Frozen"
                            },
                            species: {
                                "code": "FISH12",
                                "label": "FISH12 (FISH12)"
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
                                        licenceValidTo: "2300-02-10T00:00:00Z",
                                        label: "GOLDEN BELLS 11 (B192)"
                                    },
                                    dateLanded: "2019-01-25T00:00:00.000Z",
                                    exportWeight: "120"
                                }
                            }
                        ]
                    },
                    {
                        product: {
                            commodityCode: "30000013",
                            presentation: {
                                "code": "FIL",
                                "label": "Filleted"
                            },
                            state: {
                                "code": "FRO",
                                "label": "Frozen"
                            },
                            species: {
                                "code": "FISH13",
                                "label": "FISH13 (FISH13)"
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
                                        licenceValidTo: "2300-02-10T00:00:00Z",
                                        label: "GOLDEN BELLS 11 (B192)"
                                    },
                                    dateLanded: "2019-01-24T00:00:00.000Z",
                                    exportWeight: "130"
                                }
                            }
                        ]
                    },
                    {
                        product: {
                            commodityCode: "30000014",
                            presentation: {
                                "code": "FIL",
                                "label": "Filleted"
                            },
                            state: {
                                "code": "FRO",
                                "label": "Frozen"
                            },
                            species: {
                                "code": "FISH14",
                                "label": "FISH14 (FISH14)"
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
                                        licenceValidTo: "2300-02-10T00:00:00Z",
                                        label: "GOLDEN BELLS 11 (B192)"
                                    },
                                    dateLanded: "2019-01-23T00:00:00.000Z",
                                    exportWeight: "140",
                                    faoArea: "FAO01"
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
                "containerNumber": "456"
            },
            conservation: {
                "conservationReference": "Common fisheries policy"
            }
        };

        const responseJson = await pdfService.generatePdfAndUpload(principalId, pdfType.EXPORT_CERT,
            data, false, { getStream: getTestStream });

        expect(responseJson).toBeTruthy();

    })
});