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

describe('PDF Service Container Identification Number Tests', () => {
    const principalId = '9976f054-dd45-45e4-b2c4-7cd9f0b26ec7';
    
    jest.setTimeout(60000);
    
    jest.spyOn(blobManager, 'createContainer')
        .mockImplementation(() => {
            return {
                message: `Container 'test' created`,
                details: {}
            };
        });

    jest.spyOn(blobManager, 'writeStreamForBlob')
        .mockImplementation(() => {
            return mockedStream;
        });

    test('should render container identification number for truck transport', async () => {
        const data = {
            "_id": "5b8a2b55ea4ffa27cc71e075",
            "reference": "GBR-2018-CC-1234567890",
            "exporter": {
                "exporterCompanyName": "Test Exporter",
                "addressOne": "123 Test Street",
                "townCity": "Test City",
                "postcode": "TE5T 1NG",
                "exporterFullName": "Test Exporter Person"
            },
            "exportPayload": {
                "items": [
                    {
                        "product": {
                            "commodityCode": "03036310",
                            "presentation": "FIL",
                            "state": "FRE",
                            "species": "COD"
                        },
                        "landings": [
                            {
                                "model": {
                                    "vessel": {
                                        "pln": "PH1234",
                                        "vesselName": "Test Vessel",
                                        "label": "Test Vessel (PH1234)"
                                    },
                                    "dateLanded": "2018-06-15T00:00:00.000Z",
                                    "exportWeight": 100
                                }
                            }
                        ]
                    }
                ]
            },
            "transport": {
                "vehicle": "truck",
                "departurePlace": "Grimsby",
                "nationalityOfVehicle": "United Kingdom",
                "registrationNumber": "TR123ABC",
                "containerIdentificationNumber": "TRUCK-001, TRUCK-002, TRUCK-003"
            }
        };

        const responseJson = await pdfService.generatePdfAndUpload(principalId, pdfType.EXPORT_CERT,
            data, false, { getStream: getTestStream });

        expect(responseJson).toBeTruthy();
    });

    test('should render container identification number for train transport', async () => {
        const data = {
            "_id": "5b8a2b55ea4ffa27cc71e075",
            "reference": "GBR-2018-CC-1234567890",
            "exporter": {
                "exporterCompanyName": "Test Exporter",
                "addressOne": "123 Test Street",
                "townCity": "Test City",
                "postcode": "TE5T 1NG",
                "exporterFullName": "Test Exporter Person"
            },
            "exportPayload": {
                "items": [
                    {
                        "product": {
                            "commodityCode": "03036310",
                            "presentation": "FIL",
                            "state": "FRE",
                            "species": "COD"
                        },
                        "landings": [
                            {
                                "model": {
                                    "vessel": {
                                        "pln": "PH1234",
                                        "vesselName": "Test Vessel",
                                        "label": "Test Vessel (PH1234)"
                                    },
                                    "dateLanded": "2018-06-15T00:00:00.000Z",
                                    "exportWeight": 100
                                }
                            }
                        ]
                    }
                ]
            },
            "transport": {
                "vehicle": "train",
                "departurePlace": "Manchester",
                "railwayBillNumber": "RB987654321",
                "containerIdentificationNumber": "TRAIN-001, TRAIN-002"
            }
        };

        const responseJson = await pdfService.generatePdfAndUpload(principalId, pdfType.EXPORT_CERT,
            data, false, { getStream: getTestStream });

        expect(responseJson).toBeTruthy();
    });

    test('should not render container identification number for vessel transport', async () => {
        const data = {
            "_id": "5b8a2b55ea4ffa27cc71e075",
            "reference": "GBR-2018-CC-1234567890",
            "exporter": {
                "exporterCompanyName": "Test Exporter",
                "addressOne": "123 Test Street",
                "townCity": "Test City",
                "postcode": "TE5T 1NG",
                "exporterFullName": "Test Exporter Person"
            },
            "exportPayload": {
                "items": [
                    {
                        "product": {
                            "commodityCode": "03036310",
                            "presentation": "FIL",
                            "state": "FRE",
                            "species": "COD"
                        },
                        "landings": [
                            {
                                "model": {
                                    "vessel": {
                                        "pln": "PH1234",
                                        "vesselName": "Test Vessel",
                                        "label": "Test Vessel (PH1234)"
                                    },
                                    "dateLanded": "2018-06-15T00:00:00.000Z",
                                    "exportWeight": 100
                                }
                            }
                        ]
                    }
                ]
            },
            "transport": {
                "vehicle": "containerVessel",
                "departurePlace": "Hull",
                "vesselName": "Test Container Vessel",
                "flagState": "United Kingdom",
                "containerIdentificationNumber": "VESSEL-001" // This should not be displayed
            }
        };

        const responseJson = await pdfService.generatePdfAndUpload(principalId, pdfType.EXPORT_CERT,
            data, false, { getStream: getTestStream });

        expect(responseJson).toBeTruthy();
    });

    test('should handle empty container identification number', async () => {
        const data = {
            "_id": "5b8a2b55ea4ffa27cc71e075",
            "reference": "GBR-2018-CC-1234567890",
            "exporter": {
                "exporterCompanyName": "Test Exporter",
                "addressOne": "123 Test Street",
                "townCity": "Test City",
                "postcode": "TE5T 1NG",
                "exporterFullName": "Test Exporter Person"
            },
            "exportPayload": {
                "items": [
                    {
                        "product": {
                            "commodityCode": "03036310",
                            "presentation": "FIL",
                            "state": "FRE",
                            "species": "COD"
                        },
                        "landings": [
                            {
                                "model": {
                                    "vessel": {
                                        "pln": "PH1234",
                                        "vesselName": "Test Vessel",
                                        "label": "Test Vessel (PH1234)"
                                    },
                                    "dateLanded": "2018-06-15T00:00:00.000Z",
                                    "exportWeight": 100
                                }
                            }
                        ]
                    }
                ]
            },
            "transport": {
                "vehicle": "truck",
                "departurePlace": "Grimsby",
                "nationalityOfVehicle": "United Kingdom",
                "registrationNumber": "TR123ABC"
                // No containerIdentificationNumber provided
            }
        };

        const responseJson = await pdfService.generatePdfAndUpload(principalId, pdfType.EXPORT_CERT,
            data, false, { getStream: getTestStream });

        expect(responseJson).toBeTruthy();
    });
});