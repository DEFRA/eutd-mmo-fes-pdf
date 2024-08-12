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
    return fs.createWriteStream('./tests/testGW.pdf');
}

describe('pdfService', () => {

    jest.setTimeout(60000);

    test('should create the expected pdf with the correct number of pages', async () => {
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
                                "code": "S1",
                                "label": "S1"
                            }
                        },
                        landings: [
                            {
                                addMode: false,
                                editMode: false,
                                model: {
                                    id: "ce1fe347-2825-4152-884b-e8bad5ccde61",
                                    vessel: {
                                        pln: "V1",
                                        vesselName: "V1",
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
                                "code": "S2",
                                "label": "S2",
                            }
                        },
                        landings: [
                            {
                                addMode: false,
                                editMode: false,
                                model: {
                                    id: "ce1fe347-2825-4152-884b-e8bad5ccde61",
                                    vessel: {
                                        pln: "V2",
                                        vesselName: "V2",
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
                                "code": "S3",
                                "label": "S3"
                            }
                        },
                        landings: [
                            {
                                addMode: false,
                                editMode: false,
                                model: {
                                    id: "ce1fe347-2825-4152-884b-e8bad5ccde61",
                                    vessel: {
                                        pln: "V3",
                                        vesselName: "V3",
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
                                "code": "S4",
                                "label": "S4"
                            }
                        },
                        landings: [
                            {
                                addMode: false,
                                editMode: false,
                                model: {
                                    id: "ce1fe347-2825-4152-884b-e8bad5ccde61",
                                    vessel: {
                                        pln: "V4",
                                        vesselName: "V4",
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
                                "code": "S5",
                                "label": "S5"
                            }
                        },
                        landings: [
                            {
                                addMode: false,
                                editMode: false,
                                model: {
                                    id: "ce1fe347-2825-4152-884b-e8bad5ccde61",
                                    vessel: {
                                        pln: "V5",
                                        vesselName: "V5",
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
                                "code": "S6",
                                "label": "S6"
                            }
                        },
                        landings: [
                            {
                                addMode: false,
                                editMode: false,
                                model: {
                                    id: "ce1fe347-2825-4152-884b-e8bad5ccde61",
                                    vessel: {
                                        pln: "V6",
                                        vesselName: "V6",
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
                                "code": "S7",
                                "label": "S7",
                            }
                        },
                        landings: [
                            {
                                addMode: false,
                                editMode: false,
                                model: {
                                    id: "ce1fe347-2825-4152-884b-e8bad5ccde61",
                                    vessel: {
                                        pln: "V7",
                                        vesselName: "V7",
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
                                "code": "S8",
                                "label": "S8",
                            }
                        },
                        landings: [
                            {
                                addMode: false,
                                editMode: false,
                                model: {
                                    id: "ce1fe347-2825-4152-884b-e8bad5ccde61",
                                    vessel: {
                                        pln: "V8",
                                        vesselName: "V8",
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
                                "code": "S9",
                                "label": "S9"
                            }
                        },
                        landings: [
                            {
                                addMode: false,
                                editMode: false,
                                model: {
                                    id: "ce1fe347-2825-4152-884b-e8bad5ccde61",
                                    vessel: {
                                        pln: "V8",
                                        vesselName: "V8",
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
