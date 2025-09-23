const { renderPdf } = require('../../../src/pdf/pdfRenderer');
const { pdfType } = require('../../../src/pdf/pdfRenderer');

const { PassThrough } = require('stream');
const mockedStream = new PassThrough();

mockedStream.on('data', (d) => {
});

mockedStream.on('end', function() {
});

mockedStream.emit('data', 'hello world');
mockedStream.end();
mockedStream.destroy();

describe('pdfServiceExportCert: should run with no errors', () => {
  test('render multischedule pdf', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
    }

    const data = {
      documentNumber: "GBR-2018-CC-1C89DE54F",
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
                                label: "GOLDEN BELLS 11 (B192)"
                            },
                            dateLanded: "2019-01-26T00:00:00.000Z",
                            exportWeight: "10"
                        }
                    },
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
                                label: "GOLDEN BELLS 11 (B192)",
                                licenceValidTo: "2030-12-31T00:00:00"
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
                                label: "GOLDEN BELLS 11 (B192)"
                            },
                            dateLanded: "2019-01-24T00:00:00.000Z",
                            exportWeight: "30",
                            faoArea: "FAO27"
                        }
                    },
                    {
                      addMode: false,
                      editMode: false,
                      model: {
                          id: "ce1fe347-2825-4152-884b-e8bad5ccde61",
                          vessel: {
                              pln: "H1100",
                              vesselName: "WIRON 5",
                              homePort: "PLYMOUTH",
                              registrationNumber: "H1100",
                              licenceNumber: "12480",
                              label: "WIRON 5 (H1100)"
                          },
                          dateLanded: "2019-01-24T00:00:00.000Z",
                          exportWeight: "30",
                          faoArea: "FAO27"
                      }
                  }
                ]
            }
        ]
      },
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
        departurePlace: 'hull',
        user_id: 'a9602f38-f220-475a-991f-a19626bc51ae',
        flightNumber: '123',
        containerNumber: '456',
      },
      conservation: {
        conservationReference: 'Common fisheries policy',
      },
    };

    await renderPdf(pdfType.EXPORT_CERT, data, false, sasJson.qrUri, mockedStream);
  });

  test('render transport pdf: TRUCK', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
    }

    const data = {
      documentNumber: "GBR-2018-CC-1C89DE54F",
      exporter: {
        exporterFullName: 'Jim Jessop',
        exporterCompanyName: 'FishByMail Ltd',
        addressOne: '77 Coast Road',
        addressTwo: '',
        townCity: 'Jarrow',
        postcode: 'NE31 1YW',
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
                                label: "GOLDEN BELLS 11 (B192)",
                                licenceValidTo: "2030-12-31T00:00:00"
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
                                label: "GOLDEN BELLS 11 (B192)"
                            },
                            dateLanded: "2019-01-24T00:00:00.000Z",
                            exportWeight: "30",
                            faoArea: "FAO27"
                        }
                    }
                ]
            }
        ]
      },
      transport: {
        vehicle: 'truck',
        cmr: 'true',
        departurePlace: 'hull',
        user_id: 'a9602f38-f220-475a-991f-a19626bc51ae',
        nationalityOfVehicle: 'UK',
        registrationNumber: '456',
      },
      conservation: {
        conservationReference: 'Common fisheries policy',
      },
  };

    await renderPdf(pdfType.EXPORT_CERT, data, false, sasJson.qrUri, mockedStream);
  });

  test('render transport pdf: CONTAINER VESSEL', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
    }

    const data = {
      documentNumber: "GBR-2018-CC-1C89DE54F",
      exporter: {
        exporterFullName: 'Jim Jessop',
        exporterCompanyName: 'FishByMail Ltd',
        addressOne: '77 Coast Road',
        addressTwo: '',
        townCity: 'Jarrow',
        postcode: 'NE31 1YW',
      },
      exportPayload: {
        items: [
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
                                label: "GOLDEN BELLS 11 (B192)",
                                licenceValidTo: "2030-12-31T00:00:00",
                                imoNumber: '1111'
                            },
                            dateLanded: "2019-01-25T00:00:00.000Z",
                            exportWeight: "20"
                        }
                    }
                ]
            }
        ]
      },
      transport: {
        vehicle: 'CONTAINERVESSEL',
        flagState: 'UK',
        departurePlace: 'hull',
        user_id: 'a9602f38-f220-475a-991f-a19626bc51ae',
        vesselName: '123',
        containerNumber: '456',
        exportedFrom: 'France'
      },
      conservation: {
        conservationReference: 'Other',
        anotherConservation: 'Ireland'
      },
  };

    await renderPdf(pdfType.EXPORT_CERT, data, false, sasJson.qrUri, mockedStream);
  });

  test('render transport pdf: DIRECTLANDING', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
    }

    const data = {
      documentNumber: "GBR-2018-CC-1C89DE54F",
      exporter: {
        exporterFullName: 'Jim Jessop',
        exporterCompanyName: 'FishByMail Ltd',
        addressOne: '77 Coast Road',
        addressTwo: '',
        townCity: 'Jarrow',
        postcode: 'NE31 1YW',
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
                                label: "GOLDEN BELLS 11 (B192)",
                                licenceValidTo: "2030-12-31T00:00:00"
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
                                label: "GOLDEN BELLS 11 (B192)"
                            },
                            dateLanded: "2019-01-24T00:00:00.000Z",
                            exportWeight: "30",
                            faoArea: "FAO27"
                        }
                    }
                ]
            }
        ]
      },
      transport: {
        vehicle: 'DIRECTLANDING',
        flagState: 'UK',
        departurePlace: 'hull',
        user_id: 'a9602f38-f220-475a-991f-a19626bc51ae',
      },
      conservation: {
        conservationReference: 'Common fisheries policy',
      },
  };

    await renderPdf(pdfType.EXPORT_CERT, data, false, sasJson.qrUri, mockedStream);
  });

  test('render transport pdf: TRUCK: (no details)', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
    }

    const data = {
      documentNumber: "GBR-2018-CC-1C89DE54F",
      exporter: {
        exporterFullName: 'Jim Jessop',
        exporterCompanyName: 'FishByMail Ltd',
        addressOne: '77 Coast Road',
        addressTwo: '',
        townCity: 'Jarrow',
        postcode: 'NE31 1YW',
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
                                label: "GOLDEN BELLS 11 (B192)",
                                licenceValidTo: "2030-12-31T00:00:00"
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
                                label: "GOLDEN BELLS 11 (B192)"
                            },
                            dateLanded: "2019-01-24T00:00:00.000Z",
                            exportWeight: "30",
                            faoArea: "FAO27"
                        }
                    }
                ]
            }
        ]
      },
      transport: {
        vehicle: 'truck',
        cmr: 'true',
        departurePlace: 'hull',
        user_id: 'a9602f38-f220-475a-991f-a19626bc51ae'
      },
      conservation: {
        conservationReference: 'Common fisheries policy',
      },
  };

    await renderPdf(pdfType.EXPORT_CERT, data, false, sasJson.qrUri, mockedStream);
  });

  test('render transport pdf: CONTAINER VESSEL (no details)', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
    }

    const data = {
      documentNumber: "GBR-2018-CC-1C89DE54F",
      exporter: {
        exporterFullName: 'Jim Jessop',
        exporterCompanyName: 'FishByMail Ltd',
        addressOne: '77 Coast Road',
        addressTwo: '',
        townCity: 'Jarrow',
        postcode: 'NE31 1YW',
      },
      exportPayload: {
        items: [
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
                                label: "GOLDEN BELLS 11 (B192)",
                                licenceValidTo: "2030-12-31T00:00:00",
                                imoNumber: '1111'
                            },
                            dateLanded: "2019-01-25T00:00:00.000Z",
                            exportWeight: "20"
                        }
                    }
                ]
            }
        ]
      },
      transport: {
        vehicle: 'CONTAINERVESSEL',
        user_id: 'a9602f38-f220-475a-991f-a19626bc51ae',
      },
      conservation: {
        conservationReference: 'Other',
        anotherConservation: 'Ireland'
      },
  };

    await renderPdf(pdfType.EXPORT_CERT, data, false, sasJson.qrUri, mockedStream);
  });

  test('render transport pdf: DIRECTLANDING (no details)', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
    }

    const data = {
      documentNumber: "GBR-2018-CC-1C89DE54F",
      exporter: {
        exporterFullName: 'Jim Jessop',
        exporterCompanyName: 'FishByMail Ltd',
        addressOne: '77 Coast Road',
        addressTwo: '',
        townCity: 'Jarrow',
        postcode: 'NE31 1YW',
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
                                homePort: "ARDGLASS",
                                registrationNumber: "A12186",
                                licenceNumber: "10106",
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
                                label: "GOLDEN BELLS 11 (B192)",
                                licenceValidTo: "2030-12-31T00:00:00"
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
                                homePort: "ARDGLASS",
                                registrationNumber: "A12186",
                                licenceNumber: "10106",
                                label: "GOLDEN BELLS 11 (B192)"
                            },
                            dateLanded: "2019-01-24T00:00:00.000Z",
                            exportWeight: "30",
                            faoArea: "FAO27"
                        }
                    }
                ]
            }
        ]
      },
      transport: {
        vehicle: 'DIRECTLANDING',
        user_id: 'a9602f38-f220-475a-991f-a19626bc51ae',
      },
      conservation: {
        conservationReference: 'Common fisheries policy',
      },
  };

    await renderPdf(pdfType.EXPORT_CERT, data, false, sasJson.qrUri, mockedStream);
  });

  test('render processing statement', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
    }

    const data = {
      "products": [{
        "commodityCode": '03023190',
        "description": 'Fresh or chilled albacore',
        "id": 'GBR-2020-PS-3CA09BE17-'
      },{
        "commodityCode": '03023190',
        "description": 'Fresh or chilled albacore',
        "id": 'GBR-2020-PS-3CA09BE17-'
      }],
      "catches": [
          {
              "species": "Atlantic Cod",
              "catchCertificateNumber": "GBR-2019-PS-3EF51C999",
              "totalWeightLanded": "100",
              "exportWeightBeforeProcessing": "100",
              "exportWeightAfterProcessing": "100"
          }
      ],
      "healthCertificateNumber": "HC1232323",
      "healthCertificateDate": "31/03/2018",
      "addAnotherCatch": "notset",
      "personResponsibleForConsignment": "Mark Ford",
      "plantApprovalNumber": "CQ 613",
      "plantAddressOne": "Trevol Business Park",
      "plantAddressTwo": "Trevol Road",
      "plantTownCity": "Torpoint",
      "plantPostcode": "PL11 2TB",
      "dateOfAcceptance": "30/01/2019",
      "plantName": "Iceberg Ltd",
      "exporter": {
          'exporterFullName': 'Jim Jessop',
          'exporterCompanyName': 'FishByMail Ltd',
          'addressOne': '77 Coast Road',
          'addressTwo': 'My address is extra specially particularly long',
          'townCity': 'Jarrow',
          'postcode': 'NE31 1YW'
      },
      "documentNumber": "GBR-2019-PS-3EF51C6D8"
  };

    await renderPdf(pdfType.PROCESSING_STATEMENT, data, false, sasJson.qrUri, mockedStream);
  });

  test('render transport pdf: SD TRUCK', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
    }

    const data = {
      documentNumber: "GBR-2018-SD-1C89DE54F",
      exporter: {
        exporterFullName: 'Jim Jessop',
        exporterCompanyName: 'FishByMail Ltd',
        addressOne: '77 Coast Road',
        addressTwo: '',
        townCity: 'Jarrow',
        postcode: 'NE31 1YW',
      },
      catches: [
          {
              product: 'cod',
              commodityCode: '0123456',
              certificateNumber: 'GBR-2018-SD-3456789012345678901234567890123456789001',
              productWeight: 200,
              dateOfUnloading: '01/02/2018',
              placeOfUnloading: 'Jarrow',
              transportUnloadedFrom: 'MK-0547, Saami'
          }
      ],
      storageFacilities: [
          {
              facilityName: 'Test Processor 1',
              facilityAddressOne: '20',
              facilityAddressTwo: '',
              facilityTownCity: 'Town',
              facilityPostcode: 'test',
              storedAs: "chilled"
          }
      ],
      transport: {
        vehicle: 'truck',
        cmr: 'true',
        departurePlace: 'hull',
        user_id: 'a9602f38-f220-475a-991f-a19626bc51ae',
        nationalityOfVehicle: 'UK',
        registrationNumber: '456',
      }
    };

    await renderPdf(pdfType.STORAGE_NOTE, data, false, sasJson.qrUri, mockedStream);
  });

  test('render transport pdf: SD CONTAINER VESSEL', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
    }

    const data = {
      documentNumber: "GBR-2018-SD-1C89DE54F",
      exporter: {
        exporterFullName: 'Jim Jessop',
        exporterCompanyName: 'FishByMail Ltd',
        addressOne: '77 Coast Road',
        addressTwo: '',
        townCity: 'Jarrow',
        postcode: 'NE31 1YW',
      },
      catches: [
          {
              product: 'cod',
              commodityCode: '0123456',
              certificateNumber: 'GBR-2018-SD-3456789012345678901234567890123456789001',
              productWeight: 200,
              dateOfUnloading: '01/02/2018',
              placeOfUnloading: 'Jarrow',
              transportUnloadedFrom: 'MK-0547, Saami'
          }
      ],
      storageFacilities: [
          {
              facilityName: 'Test Processor 1',
              facilityAddressOne: '20',
              facilityAddressTwo: '',
              facilityTownCity: 'Town',
              facilityPostcode: 'test',
              storedAs: "chilled"
          }
      ],
      transport: {
        vehicle: 'CONTAINERVESSEL',
        flagState: 'UK',
        departurePlace: 'hull',
        user_id: 'a9602f38-f220-475a-991f-a19626bc51ae',
        vesselName: '123',
                        containerNumbers: [
                    'ABCD1', 'ABCD2', 'ABCD3', 'ABCD4', 'ABCD5'
                ],
        exportedFrom: 'France'
      }
    };

    await renderPdf(pdfType.STORAGE_NOTE, data, false, sasJson.qrUri, mockedStream);
  });

  test('render transport pdf: SD PLANE', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
    }

    const data = {
      documentNumber: "GBR-2018-SD-1C89DE54F",
      exporter: {
        exporterFullName: 'Jim Jessop',
        exporterCompanyName: 'FishByMail Ltd',
        addressOne: '77 Coast Road',
        addressTwo: '',
        townCity: 'Jarrow',
        postcode: 'NE31 1YW',
      },
      catches: [
          {
              product: 'cod',
              commodityCode: '0123456',
              certificateNumber: 'GBR-2018-SD-3456789012345678901234567890123456789001',
              productWeight: 200,
              dateOfUnloading: '01/02/2018',
              placeOfUnloading: 'Jarrow',
              transportUnloadedFrom: 'MK-0547, Saami'
          }
      ],
      storageFacilities: [
          {
              facilityName: 'Test Processor 1',
              facilityAddressOne: '20',
              facilityAddressTwo: '',
              facilityTownCity: 'Town',
              facilityPostcode: 'test',
              storedAs: "chilled"
          }
      ],
      transport: {
        vehicle: 'PLANE',
        flightNumber: 'BA078',
        departurePlace: 'hull',
        user_id: 'a9602f38-f220-475a-991f-a19626bc51ae',
        vesselName: '123',
        containerNumber: '456',
        exportedFrom: 'France'
      }
    };

    await renderPdf(pdfType.STORAGE_NOTE, data, false, sasJson.qrUri, mockedStream);
  });

  test('render transport pdf: SD DIRECT LANDING', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
    }

    const data = {
      documentNumber: "GBR-2018-SD-1C89DE54F",
      exporter: {
        exporterFullName: 'Jim Jessop',
        exporterCompanyName: 'FishByMail Ltd',
        addressOne: '77 Coast Road',
        addressTwo: '',
        townCity: 'Jarrow',
        postcode: 'NE31 1YW',
      },
      catches: [
          {
              product: 'cod',
              commodityCode: '0123456',
              certificateNumber: 'GBR-2018-SD-3456789012345678901234567890123456789001',
              productWeight: 200,
              dateOfUnloading: '01/02/2018',
              placeOfUnloading: 'Jarrow',
              transportUnloadedFrom: 'MK-0547, Saami',
              vessel: 'WIRON 5',
              pln: 'H110'
          }
      ],
      storageFacilities: [
          {
              facilityName: 'Test Processor 1',
              facilityAddressOne: '20',
              facilityAddressTwo: '',
              facilityTownCity: 'Town',
              facilityPostcode: 'test',
              storedAs: "chilled"
          }
      ],
      transport: {
        vehicle: 'DIRECTLANDING',
        flagState: 'UK',
        departurePlace: 'hull',
      }
    };

    await renderPdf(pdfType.STORAGE_NOTE, data, false, sasJson.qrUri, mockedStream);
  });

  test('render transport pdf: SD TRUCK (no details)', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
    }

    const data = {
      documentNumber: "GBR-2018-SD-1C89DE54F",
      exporter: {
        exporterFullName: 'Jim Jessop',
        exporterCompanyName: 'FishByMail Ltd',
        addressOne: '77 Coast Road',
        addressTwo: '',
        townCity: 'Jarrow',
        postcode: 'NE31 1YW',
      },
      catches: [
          {
              product: 'cod',
              commodityCode: '0123456',
              certificateNumber: 'GBR-2018-SD-3456789012345678901234567890123456789001',
              productWeight: 200,
              dateOfUnloading: '01/02/2018',
              placeOfUnloading: 'Jarrow',
              transportUnloadedFrom: 'MK-0547, Saami'
          }
      ],
      storageFacilities: [
          {
              facilityName: 'Test Processor 1',
              facilityAddressOne: '20',
              facilityAddressTwo: '',
              facilityTownCity: 'Town',
              facilityPostcode: 'test',
              storedAs: "chilled"
          }
      ],
      transport: {
        vehicle: 'truck'
      }
    };

    await renderPdf(pdfType.STORAGE_NOTE, data, false, sasJson.qrUri, mockedStream);
  });

  test('render transport pdf: SD CONTAINER VESSEL (no details)', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
    }

    const data = {
      documentNumber: "GBR-2018-SD-1C89DE54F",
      exporter: {
        exporterFullName: 'Jim Jessop',
        exporterCompanyName: 'FishByMail Ltd',
        addressOne: '77 Coast Road',
        addressTwo: '',
        townCity: 'Jarrow',
        postcode: 'NE31 1YW',
      },
      catches: [
          {
              product: 'cod',
              commodityCode: '0123456',
              certificateNumber: 'GBR-2018-SD-3456789012345678901234567890123456789001',
              productWeight: 200,
              dateOfUnloading: '01/02/2018',
              placeOfUnloading: 'Jarrow',
              transportUnloadedFrom: 'MK-0547, Saami'
          }
      ],
      storageFacilities: [
          {
              facilityName: 'Test Processor 1',
              facilityAddressOne: '20',
              facilityAddressTwo: '',
              facilityTownCity: 'Town',
              facilityPostcode: 'test',
              storedAs: "chilled"
          }
      ],
      transport: {
        vehicle: 'CONTAINERVESSEL'
      }
    };

    await renderPdf(pdfType.STORAGE_NOTE, data, false, sasJson.qrUri, mockedStream);
  });

  test('render transport pdf: SD DIRECT LANDING (no details)', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
    }

    const data = {
      documentNumber: "GBR-2018-SD-1C89DE54F",
      exporter: {
        exporterFullName: 'Jim Jessop',
        exporterCompanyName: 'FishByMail Ltd',
        addressOne: '77 Coast Road',
        addressTwo: '',
        townCity: 'Jarrow',
        postcode: 'NE31 1YW',
      },
      catches: [
          {
              product: 'cod',
              commodityCode: '0123456',
              certificateNumber: 'GBR-2018-SD-3456789012345678901234567890123456789001',
              productWeight: 200,
              dateOfUnloading: '01/02/2018',
              placeOfUnloading: 'Jarrow',
              transportUnloadedFrom: 'MK-0547, Saami'
          }
      ],
      storageFacilities: [
          {
              facilityName: 'Test Processor 1',
              facilityAddressOne: '20',
              facilityAddressTwo: '',
              facilityTownCity: 'Town',
              facilityPostcode: 'test',
              storedAs: "chilled"
          }
      ],
      transport: {
        vehicle: 'DIRECTLANDING'
      }
    };

    await renderPdf(pdfType.STORAGE_NOTE, data, false, sasJson.qrUri, mockedStream);
  });
});
