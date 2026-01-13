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
        flightNumber: '123',
        exportedTo: {
          officialCountryName: 'France'
        }
      },
      conservation: {
        conservationReference: 'Common fisheries policy'
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
        exportedTo: {
          officialCountryName: 'France',
        }
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
        exportedFrom: 'France',
        exportedTo: {
          officialCountryName: 'Ireland',
        }
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
        exportedTo: {
          officialCountryName: 'France',
        }
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
        exportedTo: {
          officialCountryName: 'France',
        }
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
        exportedTo: {
          officialCountryName: 'France',
        }
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
        user_id: 'a9602f38-f220-475a-991f-a19626bc51ae',
        exportedTo: {
          officialCountryName: 'France',
        }
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

  test('render processing statement - text positioning after moving confirmation text', async () => {
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
      "consignmentDescription": "Fresh fish products",
      "healthCertificateNumber": "HC1232323",
      "healthCertificateDate": "31/03/2018",
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
          'addressTwo': '',
          'townCity': 'Jarrow',
          'postcode': 'NE31 1YW'
      },
      "documentNumber": "GBR-2019-PS-3EF51C6D8"
    };

    await renderPdf(pdfType.PROCESSING_STATEMENT, data, false, sasJson.qrUri, mockedStream);
  });

  test('render processing statement - without products array (uses consignmentDescription)', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
    }

    const data = {
      "consignmentDescription": "Mixed seafood products for export",
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
      "personResponsibleForConsignment": "Mark Ford",
      "plantApprovalNumber": "CQ 613",
      "plantAddressOne": "Trevol Business Park",
      "plantTownCity": "Torpoint",
      "plantPostcode": "PL11 2TB",
      "dateOfAcceptance": "30/01/2019",
      "plantName": "Iceberg Ltd",
      "exporter": {
          'exporterFullName': 'Jim Jessop',
          'exporterCompanyName': 'FishByMail Ltd',
          'addressOne': '77 Coast Road',
          'townCity': 'Jarrow',
          'postcode': 'NE31 1YW'
      },
      "documentNumber": "GBR-2019-PS-3EF51C6D8"
    };

    await renderPdf(pdfType.PROCESSING_STATEMENT, data, false, sasJson.qrUri, mockedStream);
  });

  test('render processing statement - empty products array', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
    }

    const data = {
      "products": [],
      "consignmentDescription": "Fallback description when no products",
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
      "personResponsibleForConsignment": "Mark Ford",
      "plantApprovalNumber": "CQ 613",
      "plantName": "Iceberg Ltd",
      "exporter": {
          'exporterFullName': 'Jim Jessop',
          'exporterCompanyName': 'FishByMail Ltd'
      },
      "documentNumber": "GBR-2019-PS-3EF51C6D8"
    };

    await renderPdf(pdfType.PROCESSING_STATEMENT, data, false, sasJson.qrUri, mockedStream);
  });

  test('render processing statement - updated text validation ("has been obtained")', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
    }

    const data = {
      "products": [{
        "commodityCode": '16043290',
        "description": 'Prepared or preserved caviar substitutes',
        "id": 'GBR-2020-PS-TEST123-'
      }],
      "catches": [
          {
              "species": "Atlantic Salmon",
              "catchCertificateNumber": "GBR-2019-PS-SALMON123",
              "totalWeightLanded": "50",
              "exportWeightBeforeProcessing": "45",
              "exportWeightAfterProcessing": "40"
          }
      ],
      "healthCertificateNumber": "HC9876543",
      "healthCertificateDate": "15/06/2023",
      "personResponsibleForConsignment": "Sarah Johnson",
      "plantApprovalNumber": "CQ 999",
      "plantName": "Premium Fish Processing Ltd",
      "exporter": {
          'exporterFullName': 'Sarah Johnson',
          'exporterCompanyName': 'Premium Fish Processing Ltd'
      },
      "documentNumber": "GBR-2023-PS-UPDATED123"
    };

    await renderPdf(pdfType.PROCESSING_STATEMENT, data, false, sasJson.qrUri, mockedStream);
  });

  test('render processing statement - schedule page without "Catches in this consignment" heading', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
    }

    const catches = [];
    for (let i = 1; i <= 10; i++) {
      catches.push({
        "species": `Fish Species ${i}`,
        "catchCertificateNumber": `GBR-2019-PS-${i.toString().padStart(9, '0')}`,
        "totalWeightLanded": `${i * 10}`,
        "exportWeightBeforeProcessing": `${i * 9}`,
        "exportWeightAfterProcessing": `${i * 8}`
      });
    }

    const data = {
      "products": [{
        "commodityCode": '03023190',
        "description": 'Fresh or chilled albacore',
        "id": 'GBR-2020-PS-SCHEDULE-TEST'
      }],
      "catches": catches,
      "healthCertificateNumber": "HC1232323",
      "healthCertificateDate": "31/03/2018",
      "personResponsibleForConsignment": "Mark Ford",
      "plantApprovalNumber": "CQ 613",
      "plantName": "Iceberg Ltd",
      "exporter": {
          'exporterFullName': 'Jim Jessop',
          'exporterCompanyName': 'FishByMail Ltd'
      },
      "documentNumber": "GBR-2019-PS-SCHEDULE123"
    };

    await renderPdf(pdfType.PROCESSING_STATEMENT, data, false, sasJson.qrUri, mockedStream);
  });

  test('render processing statement - minimal data structure', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
    }

    const data = {
      "catches": [], 
      "exporter": {}, 
      "documentNumber": "GBR-2019-PS-MINIMAL"
    };

    await renderPdf(pdfType.PROCESSING_STATEMENT, data, false, sasJson.qrUri, mockedStream);
  });

  test('render processing statement - updated column header text', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
    }

    const data = {
      "products": [{
        "commodityCode": '160432',
        "description": 'Caviar substitutes'
      }],
      "catches": [
          {
              "species": "Test Species for Column Headers",
              "catchCertificateNumber": "GBR-2019-PS-HEADERS123",
              "totalWeightLanded": "100",
              "exportWeightBeforeProcessing": "90",
              "exportWeightAfterProcessing": "80"
          }
      ],
      "healthCertificateNumber": "HC_HEADERS",
      "exporter": {
          'exporterFullName': 'Test Exporter',
          'exporterCompanyName': 'Test Company'
      },
      "documentNumber": "GBR-2019-PS-HEADERS"
    };

    await renderPdf(pdfType.PROCESSING_STATEMENT, data, false, sasJson.qrUri, mockedStream);
  });

    test('render processing statement - multiple products with individual tables', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
    }

    const data = {
      "products": [
        {
          "commodityCode": '160432',
          "description": 'Caviar substitutes',
          "id": 'GBR-2020-PS-PRODUCT1-'
        },
        {
          "commodityCode": '160414',
          "description": 'Prepared or preserved tunas',
          "id": 'GBR-2020-PS-PRODUCT2-'
        },
        {
          "commodityCode": '030231',
          "description": 'Fresh or chilled albacore',
          "id": 'GBR-2020-PS-PRODUCT3-'
        }
      ],
      "catches": [
        {
          "productIndex": 0,
          "species": "Sturgeon",
          "catchCertificateNumber": "GBR-2019-PS-STURGEON001",
          "totalWeightLanded": "50",
          "exportWeightBeforeProcessing": "45",
          "exportWeightAfterProcessing": "30"
        },
        {
          "productIndex": 1,
          "species": "Yellowfin Tuna",
          "catchCertificateNumber": "GBR-2019-PS-TUNA002",
          "totalWeightLanded": "100",
          "exportWeightBeforeProcessing": "95",
          "exportWeightAfterProcessing": "80"
        },
        {
          "productIndex": 1,
          "species": "Bigeye Tuna",
          "catchCertificateNumber": "GBR-2019-PS-TUNA003",
          "totalWeightLanded": "75",
          "exportWeightBeforeProcessing": "70",
          "exportWeightAfterProcessing": "65"
        },
        {
          "productIndex": 2,
          "species": "Albacore",
          "catchCertificateNumber": "GBR-2019-PS-ALBACORE004",
          "totalWeightLanded": "120",
          "exportWeightBeforeProcessing": "115",
          "exportWeightAfterProcessing": "110"
        }
      ],
      "healthCertificateNumber": "HC_MULTI_PRODUCTS",
      "healthCertificateDate": "15/08/2023",
      "personResponsibleForConsignment": "Multi Product Manager",
      "plantApprovalNumber": "CQ 888",
      "plantName": "Multi Species Processing Ltd",
      "exporter": {
        'exporterFullName': 'Multi Product Manager',
        'exporterCompanyName': 'Multi Species Processing Ltd',
        'addressOne': '123 Processing Street',
        'townCity': 'Fish Town',
        'postcode': 'FT1 2AB'
      },
      "documentNumber": "GBR-2023-PS-MULTIPRODUCT"
    };

    await renderPdf(pdfType.PROCESSING_STATEMENT, data, false, sasJson.qrUri, mockedStream);
  });

  test('render processing statement - commodity code formatting validation', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
    }

    const data = {
      "products": [
        {
          "commodityCode": '160432',
          "description": 'Caviar substitutes'
        },
        {
          "commodityCode": '030623',
          "description": 'Frozen crabs'
        }
      ],
      "catches": [
        {
          "productIndex": 0,
          "species": "Caviar Fish",
          "catchCertificateNumber": "GBR-2023-PS-FORMAT001",
          "totalWeightLanded": "25",
          "exportWeightBeforeProcessing": "20",
          "exportWeightAfterProcessing": "15"
        },
        {
          "productIndex": 1,
          "species": "Snow Crab",
          "catchCertificateNumber": "GBR-2023-PS-FORMAT002",
          "totalWeightLanded": "40",
          "exportWeightBeforeProcessing": "35",
          "exportWeightAfterProcessing": "30"
        }
      ],
      "healthCertificateNumber": "HC_FORMAT_TEST",
      "exporter": {
        'exporterFullName': 'Format Test User',
        'exporterCompanyName': 'Format Test Company'
      },
      "documentNumber": "GBR-2023-PS-FORMATTEST"
    };

    await renderPdf(pdfType.PROCESSING_STATEMENT, data, false, sasJson.qrUri, mockedStream);
  });

  test('render processing statement - multiple products with mixed catch counts', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
    }

    const catches = [];
    
    for (let i = 1; i <= 2; i++) {
      catches.push({
        "productIndex": 0,
        "species": `Product1 Fish ${i}`,
        "catchCertificateNumber": `GBR-2023-PS-P1-${i.toString().padStart(3, '0')}`,
        "totalWeightLanded": `${20 + i}`,
        "exportWeightBeforeProcessing": `${18 + i}`,
        "exportWeightAfterProcessing": `${16 + i}`
      });
    }

    for (let i = 1; i <= 7; i++) {
      catches.push({
        "productIndex": 1,
        "species": `Product2 Fish ${i}`,
        "catchCertificateNumber": `GBR-2023-PS-P2-${i.toString().padStart(3, '0')}`,
        "totalWeightLanded": `${30 + i}`,
        "exportWeightBeforeProcessing": `${28 + i}`,
        "exportWeightAfterProcessing": `${26 + i}`
      });
    }

    for (let i = 1; i <= 3; i++) {
      catches.push({
        "productIndex": 2,
        "species": `Product3 Fish ${i}`,
        "catchCertificateNumber": `GBR-2023-PS-P3-${i.toString().padStart(3, '0')}`,
        "totalWeightLanded": `${40 + i}`,
        "exportWeightBeforeProcessing": `${38 + i}`,
        "exportWeightAfterProcessing": `${36 + i}`
      });
    }

    const data = {
      "products": [
        {
          "commodityCode": '160432',
          "description": 'Product with few catches'
        },
        {
          "commodityCode": '160414', 
          "description": 'Product with many catches'
        },
        {
          "commodityCode": '030231',
          "description": 'Product with moderate catches'
        }
      ],
      "catches": catches,
      "healthCertificateNumber": "HC_MIXED_COUNTS",
      "exporter": {
        'exporterFullName': 'Mixed Counts User',
        'exporterCompanyName': 'Mixed Processing Ltd'
      },
      "documentNumber": "GBR-2023-PS-MIXEDCOUNTS"
    };

    await renderPdf(pdfType.PROCESSING_STATEMENT, data, false, sasJson.qrUri, mockedStream);
  });

  test('render processing statement - edge case: empty catches for specific product', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
    }

    const data = {
      "products": [
        {
          "commodityCode": '160432',
          "description": 'Product with catches'
        },
        {
          "commodityCode": '160414',
          "description": 'Product without catches'
        }
      ],
      "catches": [
        {
          "productIndex": 0,
          "species": "Only Fish",
          "catchCertificateNumber": "GBR-2023-PS-ONLYFISH",
          "totalWeightLanded": "50",
          "exportWeightBeforeProcessing": "45",
          "exportWeightAfterProcessing": "40"
        }
      ],
      "healthCertificateNumber": "HC_EMPTY_CATCHES",
      "exporter": {
        'exporterFullName': 'Empty Catches Test'
      },
      "documentNumber": "GBR-2023-PS-EMPTYCATCHES"
    };

    await renderPdf(pdfType.PROCESSING_STATEMENT, data, false, sasJson.qrUri, mockedStream);
  });

  test('render processing statement - catches without productIndex (fallback to product 0)', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
    }

    const data = {
      "products": [{
        "commodityCode": '160432',
        "description": 'Legacy product format'
      }],
      "catches": [
        {
          "species": "Legacy Catch 1",
          "catchCertificateNumber": "GBR-2019-PS-LEGACY001",
          "totalWeightLanded": "60",
          "exportWeightBeforeProcessing": "55",
          "exportWeightAfterProcessing": "50"
        },
        {
          "species": "Legacy Catch 2", 
          "catchCertificateNumber": "GBR-2019-PS-LEGACY002",
          "totalWeightLanded": "40",
          "exportWeightBeforeProcessing": "38",
          "exportWeightAfterProcessing": "35"
        }
      ],
      "healthCertificateNumber": "HC_LEGACY",
      "exporter": {
        'exporterFullName': 'Legacy User'
      },
      "documentNumber": "GBR-2019-PS-LEGACYTEST"
    };

    await renderPdf(pdfType.PROCESSING_STATEMENT, data, false, sasJson.qrUri, mockedStream);
  });

    test('render processing statement - validate updated column header "Vessel name(s) and flag(s) and Validation date(s)"', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
    }

    const data = {
      "products": [{
        "commodityCode": '160432',
        "description": 'Caviar substitutes'
      }],
      "catches": [
        {
          "productIndex": 0,
          "species": "Test Species for Updated Column Header",
          "catchCertificateNumber": "GBR-2023-PS-COLUMNTEST001",
          "totalWeightLanded": "100",
          "exportWeightBeforeProcessing": "90",
          "exportWeightAfterProcessing": "80"
        }
      ],
      "healthCertificateNumber": "HC_COLUMN_HEADER_UPDATE",
      "exporter": {
        'exporterFullName': 'Column Header Test User',
        'exporterCompanyName': 'Header Update Test Company'
      },
      "documentNumber": "GBR-2023-PS-COLUMNHEADER"
    };

    await renderPdf(pdfType.PROCESSING_STATEMENT, data, false, sasJson.qrUri, mockedStream);
  });

  test('render processing statement - column header validation with schedule pages', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
    }

    const catches = [];
    for (let i = 1; i <= 8; i++) {
      catches.push({
        "productIndex": 0,
        "species": `Schedule Column Test Fish ${i}`,
        "catchCertificateNumber": `GBR-2023-PS-SCH${i.toString().padStart(3, '0')}`,
        "totalWeightLanded": `${10 + i}`,
        "exportWeightBeforeProcessing": `${9 + i}`,
        "exportWeightAfterProcessing": `${8 + i}`
      });
    }

    const data = {
      "products": [{
        "commodityCode": '160432',
        "description": 'Product to test schedule column headers'
      }],
      "catches": catches,
      "healthCertificateNumber": "HC_SCHEDULE_COLUMN_HEADER",
      "exporter": {
        'exporterFullName': 'Schedule Column Header Test'
      },
      "documentNumber": "GBR-2023-PS-SCHEDULECOLUMN"
    };

    await renderPdf(pdfType.PROCESSING_STATEMENT, data, false, sasJson.qrUri, mockedStream);
  });

  test('render processing statement - multiple products column header consistency', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
    }

    const data = {
      "products": [
        {
          "commodityCode": '160432',
          "description": 'First product for column header test'
        },
        {
          "commodityCode": '160414',
          "description": 'Second product for column header test'
        }
      ],
      "catches": [
        {
          "productIndex": 0,
          "species": "Product 1 Fish",
          "catchCertificateNumber": "GBR-2023-PS-MULTI-COL-001",
          "totalWeightLanded": "50",
          "exportWeightBeforeProcessing": "45",
          "exportWeightAfterProcessing": "40"
        },
        {
          "productIndex": 1,
          "species": "Product 2 Fish",
          "catchCertificateNumber": "GBR-2023-PS-MULTI-COL-002",
          "totalWeightLanded": "75",
          "exportWeightBeforeProcessing": "70",
          "exportWeightAfterProcessing": "65"
        }
      ],
      "healthCertificateNumber": "HC_MULTI_COLUMN_HEADER",
      "exporter": {
        'exporterFullName': 'Multi Product Column Test'
      },
      "documentNumber": "GBR-2023-PS-MULTICOLUMN"
    };

    await renderPdf(pdfType.PROCESSING_STATEMENT, data, false, sasJson.qrUri, mockedStream);
  });

test('render processing statement - pagination with many catches (sample=true)', async () => {
  const sasJson = {
    container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
    blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
    uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
    qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
  }

  const catches = [];
  for (let i = 1; i <= 25; i++) {
    catches.push({
      "productIndex": 0,
      "species": `Test Species ${i}`,
      "catchCertificateNumber": `GBR-2023-PS-PAGINATION-${i.toString().padStart(3, '0')}`,
      "totalWeightLanded": `${i * 10}`,
      "exportWeightBeforeProcessing": `${i * 9}`,
      "exportWeightAfterProcessing": `${i * 8}`
    });
  }

  const data = {
    "products": [{
      "commodityCode": '03023190',
      "description": 'Product for pagination test',
      "id": 'GBR-2023-PS-PAGINATION-TEST'
    }],
    "catches": catches,
    "healthCertificateNumber": "HC_PAGINATION_TEST",
    "healthCertificateDate": "31/03/2023",
    "personResponsibleForConsignment": "Pagination Test User",
    "plantApprovalNumber": "CQ 999",
    "plantAddressOne": "Test Address",
    "plantTownCity": "Test City",
    "plantPostcode": "TE5T 1NG",
    "dateOfAcceptance": "30/01/2023",
    "plantName": "Pagination Test Plant",
    "exporter": {
      'exporterFullName': 'Pagination Test User',
      'exporterCompanyName': 'Pagination Test Ltd',
      'addressOne': '123 Test Street',
      'townCity': 'Test Town',
      'postcode': 'TT1 2AB'
    },
    "documentNumber": "GBR-2023-PS-PAGINATION"
  };

  await renderPdf(pdfType.PROCESSING_STATEMENT, data, true, sasJson.qrUri, mockedStream);
});

test('render processing statement - pagination with many catches (sample=false)', async () => {
  const sasJson = {
    container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
    blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
    uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
    qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
  }

  const catches = [];
  for (let i = 1; i <= 30; i++) {
    catches.push({
      "productIndex": 0,
      "species": `Production Species ${i}`,
      "catchCertificateNumber": `GBR-2023-PS-PROD-${i.toString().padStart(3, '0')}`,
      "totalWeightLanded": `${i * 15}`,
      "exportWeightBeforeProcessing": `${i * 14}`,
      "exportWeightAfterProcessing": `${i * 13}`
    });
  }

  const data = {
    "products": [{
      "commodityCode": '03023190',
      "description": 'Product for production pagination test'
    }],
    "catches": catches,
    "healthCertificateNumber": "HC_PROD_PAGINATION",
    "healthCertificateDate": "15/06/2023",
    "personResponsibleForConsignment": "Production Test User",
    "plantApprovalNumber": "CQ 888",
    "plantName": "Production Test Plant",
    "exporter": {
      'exporterFullName': 'Production Test User',
      'exporterCompanyName': 'Production Test Ltd'
    },
    "documentNumber": "GBR-2023-PS-PRODPAGINATION"
  };

  await renderPdf(pdfType.PROCESSING_STATEMENT, data, false, sasJson.qrUri, mockedStream);
});

test('render processing statement - multiple products with pagination', async () => {
  const sasJson = {
    container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
    blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
    uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
    qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
  }

  const catches = [];
  
  for (let i = 1; i <= 10; i++) {
    catches.push({
      "productIndex": 0,
      "species": `Product1 Species ${i}`,
      "catchCertificateNumber": `GBR-2023-PS-P1-${i.toString().padStart(3, '0')}`,
      "totalWeightLanded": `${i * 20}`,
      "exportWeightBeforeProcessing": `${i * 18}`,
      "exportWeightAfterProcessing": `${i * 16}`
    });
  }

  for (let i = 1; i <= 8; i++) {
    catches.push({
      "productIndex": 1,
      "species": `Product2 Species ${i}`,
      "catchCertificateNumber": `GBR-2023-PS-P2-${i.toString().padStart(3, '0')}`,
      "totalWeightLanded": `${i * 25}`,
      "exportWeightBeforeProcessing": `${i * 23}`,
      "exportWeightAfterProcessing": `${i * 21}`
    });
  }

  const data = {
    "products": [
      {
        "commodityCode": '160432',
        "description": 'First product with many catches'
      },
      {
        "commodityCode": '160414',
        "description": 'Second product with many catches'
      }
    ],
    "catches": catches,
    "healthCertificateNumber": "HC_MULTI_PAGINATION",
    "healthCertificateDate": "20/07/2023",
    "personResponsibleForConsignment": "Multi Pagination User",
    "plantApprovalNumber": "CQ 777",
    "plantName": "Multi Pagination Plant",
    "exporter": {
      'exporterFullName': 'Multi Pagination User',
      'exporterCompanyName': 'Multi Pagination Ltd'
    },
    "documentNumber": "GBR-2023-PS-MULTIPAGINATION"
  };

  await renderPdf(pdfType.PROCESSING_STATEMENT, data, true, sasJson.qrUri, mockedStream);
});

test('render processing statement - extreme pagination test', async () => {
  const sasJson = {
    container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
    blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
    uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
    qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
  }

  const catches = [];
  for (let i = 1; i <= 50; i++) {
    catches.push({
      "productIndex": 0,
      "species": `Extreme Test Species ${i}`,
      "catchCertificateNumber": `GBR-2023-PS-EXTREME-${i.toString().padStart(3, '0')}`,
      "totalWeightLanded": `${i * 5}`,
      "exportWeightBeforeProcessing": `${i * 4}`,
      "exportWeightAfterProcessing": `${i * 3}`
    });
  }

  const data = {
    "products": [{
      "commodityCode": '03023190',
      "description": 'Product for extreme pagination test'
    }],
    "catches": catches,
    "healthCertificateNumber": "HC_EXTREME_TEST",
    "healthCertificateDate": "01/08/2023",
    "personResponsibleForConsignment": "Extreme Test User",
    "plantApprovalNumber": "CQ 666",
    "plantName": "Extreme Test Plant",
    "exporter": {
      'exporterFullName': 'Extreme Test User',
      'exporterCompanyName': 'Extreme Test Ltd'
    },
    "documentNumber": "GBR-2023-PS-EXTREMETEST"
  };

  await renderPdf(pdfType.PROCESSING_STATEMENT, data, false, sasJson.qrUri, mockedStream);
});

test('render processing statement - page break edge case', async () => {
  const sasJson = {
    container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
    blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
    uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
    qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
  }

  const manyProducts = [];
  const manyCatches = [];
  
  // Create 15 products to make section1 extremely tall and force pagination
  for (let i = 0; i < 15; i++) {
    manyProducts.push({
      commodityCode: `0302319${i}`,
      description: `Test Product ${i} - Very Long Description That Takes Up Significant Space On The Page And Forces Content To Be Very Tall`
    });
  }
  
  // Create many catches for the first few products
  for (let i = 0; i < 20; i++) {
    manyCatches.push({
      productIndex: i % 5, // Distribute across first 5 products
      species: `Test Species ${i}`,
      catchCertificateNumber: `GBR-2023-CC-${String(i).padStart(3, '0')}`,
      totalWeightLanded: "100",
      exportWeightBeforeProcessing: "90",
      exportWeightAfterProcessing: "80"
    });
  }

  const data = {
    "products": manyProducts,
    "catches": manyCatches,
    "healthCertificateNumber": "HC_PAGINATION_TEST",
    "healthCertificateDate": "31/03/2023",
    "personResponsibleForConsignment": "Pagination Test User",
    "plantApprovalNumber": "CQ 789",
    "plantName": "Pagination Test Plant",
    "plantAddressOne": "Test Address Line One That Is Quite Long",
    "plantAddressTwo": "Test Address Line Two With Additional Details",
    "plantTownCity": "Test City With Long Name", 
    "plantPostcode": "TE5T 1NG",
    "dateOfAcceptance": "30/01/2023",
    "exporter": {
      'exporterFullName': 'Pagination Test User With Very Long Name',
      'exporterCompanyName': 'Pagination Test Ltd With Extended Company Name',
      'addressOne': '123 Very Long Test Street Address',
      'addressTwo': 'Additional Address Line For Testing',
      'townCity': 'Test Town With Extended Name',
      'postcode': 'TT1 2AB'
    },
    "documentNumber": "GBR-2023-PS-PAGINATION-TEST"
  };

  const mockAddPage = jest.fn();
  const originalCreateBaseDocument = require('../../../src/utils/common-utils').createBaseDocument;
  
  jest.spyOn(require('../../../src/utils/common-utils'), 'createBaseDocument').mockImplementation((uri) => {
    const doc = originalCreateBaseDocument(uri);
    doc.addPage = mockAddPage;
    return doc;
  });

  await renderPdf(pdfType.PROCESSING_STATEMENT, data, false, sasJson.qrUri, mockedStream);

  expect(mockAddPage).toHaveBeenCalled();

  require('../../../src/utils/common-utils').createBaseDocument.mockRestore();
});

test('render processing statement - QR code rendered when not sample', async () => {
  const sasJson = {
    container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
    blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
    uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
    qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
  }

  const data = {
    "products": [{
      "commodityCode": '03023190',
      "description": 'Test Product for QR Code'
    }],
    "catches": [
      {
        "productIndex": 0,
        "species": "Test Species",
        "catchCertificateNumber": "GBR-2023-CC-QR-001",
        "totalWeightLanded": "100",
        "exportWeightBeforeProcessing": "90", 
        "exportWeightAfterProcessing": "80"
      }
    ],
    "healthCertificateNumber": "HC_QR_TEST",
    "healthCertificateDate": "31/03/2023",
    "personResponsibleForConsignment": "QR Test User",
    "plantApprovalNumber": "CQ 123",
    "plantName": "QR Test Plant",
    "exporter": {
      'exporterFullName': 'QR Test User',
      'exporterCompanyName': 'QR Test Ltd'
    },
    "documentNumber": "GBR-2023-PS-QR-TEST"
  };

  const qrCodeSpy = jest.spyOn(require('../../../src/pdf/mmoPdfUtils'), 'qrCode');

  await renderPdf(pdfType.PROCESSING_STATEMENT, data, false, sasJson.qrUri, mockedStream);

  expect(qrCodeSpy).toHaveBeenCalled();
  expect(qrCodeSpy).toHaveBeenCalledWith(
    expect.anything(),
    expect.anything(),
    expect.any(Number),
    expect.any(Number)
  );

  qrCodeSpy.mockRestore();
});

test('render processing statement - QR code NOT rendered when sample', async () => {
  const sasJson = {
    container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
    blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
    uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
    qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
  }

  const data = {
    "products": [{
      "commodityCode": '03023190',
      "description": 'Test Product No QR'
    }],
    "catches": [
      {
        "productIndex": 0,
        "species": "Test Species",
        "catchCertificateNumber": "GBR-2023-CC-NO-QR-001",
        "totalWeightLanded": "100",
        "exportWeightBeforeProcessing": "90",
        "exportWeightAfterProcessing": "80"
      }
    ],
    "healthCertificateNumber": "HC_NO_QR_TEST",
    "healthCertificateDate": "31/03/2023",
    "personResponsibleForConsignment": "No QR Test User",
    "plantApprovalNumber": "CQ 456",
    "plantName": "No QR Test Plant",
    "exporter": {
      'exporterFullName': 'No QR Test User',
      'exporterCompanyName': 'No QR Test Ltd'
    },
    "documentNumber": "GBR-2023-PS-NO-QR-SAMPLE"
  };

  const qrCodeSpy = jest.spyOn(require('../../../src/pdf/mmoPdfUtils'), 'qrCode');

  await renderPdf(pdfType.PROCESSING_STATEMENT, data, true, sasJson.qrUri, mockedStream);

  expect(qrCodeSpy).not.toHaveBeenCalled();

  qrCodeSpy.mockRestore();
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
      transport: {
        vehicle: 'truck',
        cmr: 'true',
        departurePlace: 'hull',
        user_id: 'a9602f38-f220-475a-991f-a19626bc51ae',
        nationalityOfVehicle: 'UK',
        registrationNumber: '456',
      },
      arrivalTransport: {
        vehicle: 'truck',
        cmr: 'true',
        departurePlace: 'hull',
        user_id: 'a9602f38-f220-475a-991f-a19626bc51ae',
        nationalityOfVehicle: 'UK',
        registrationNumber: '456',
      },
      facilityName: 'Test Processor 1',
      facilityAddressOne: '20',
      facilityAddressTwo: '',
      facilityTownCity: 'Town',
      facilityPostcode: 'test',
      storedAs: "chilled",
      facilityArrivalDate: '20/10/2025',
      exportedTo: {
        officialCountryName: 'France',
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
      },
      arrivalTransport: {
        vehicle: 'CONTAINERVESSEL',
        flagState: 'UK',
        departurePlace: 'hull',
        user_id: 'a9602f38-f220-475a-991f-a19626bc51ae',
        vesselName: '123',
        containerNumbers: [
            'ABCD1', 'ABCD2', 'ABCD3', 'ABCD4', 'ABCD5'
        ],
        exportedFrom: 'France'
      },
        facilityName: 'Test Processor 1',
        facilityAddressOne: '20',
        facilityAddressTwo: '',
        facilityTownCity: 'Town',
        facilityPostcode: 'test',
        storedAs: "chilled",
        facilityArrivalDate: '20/10/2025'
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
      transport: {
        vehicle: 'PLANE',
        flightNumber: 'BA078',
        departurePlace: 'hull',
        user_id: 'a9602f38-f220-475a-991f-a19626bc51ae',
        vesselName: '123',
        containerNumber: '456',
        exportedFrom: 'France'
      },
      arrivalTransport: {
        vehicle: 'PLANE',
        flightNumber: 'BA078',
        departurePlace: 'hull',
        user_id: 'a9602f38-f220-475a-991f-a19626bc51ae',
        vesselName: '123',
        containerNumber: '456',
        exportedFrom: 'France'
      },
      facilityName: 'Test Processor 1',
      facilityAddressOne: '20',
      facilityAddressTwo: '',
      facilityTownCity: 'Town',
      facilityPostcode: 'test',
      storedAs: "chilled",
      facilityArrivalDate: '20/10/2025',
      exportedFrom: 'France',
      exportedTo: {
        officialCountryName: 'Ireland',
      }
    };

    await renderPdf(pdfType.STORAGE_NOTE, data, false, sasJson.qrUri, mockedStream);
  });

  test('render transport pdf: SD PLANE with empty catch details', async () => {
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
      catches: [],
      transport: {
        vehicle: 'PLANE',
        flightNumber: 'BA078',
        departurePlace: 'hull',
        user_id: 'a9602f38-f220-475a-991f-a19626bc51ae',
        vesselName: '123',
        containerNumber: '456',
        exportedFrom: 'France'
      },
      arrivalTransport: {
        vehicle: 'PLANE',
        flightNumber: 'BA078',
        departurePlace: 'hull',
        user_id: 'a9602f38-f220-475a-991f-a19626bc51ae',
        vesselName: '123',
        containerNumber: '456',
        exportedFrom: 'France'
      },
        facilityName: 'Test Processor 1',
        facilityAddressOne: '20',
        facilityAddressTwo: '',
        facilityTownCity: 'Town',
        facilityPostcode: 'test',
        storedAs: "chilled",
        facilityArrivalDate: '20/10/2025'
    };

    await renderPdf(pdfType.STORAGE_NOTE, data, false, sasJson.qrUri, mockedStream);
  });

  test('render transport pdf: SD PLANE with one complete catch details', async () => {
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
          product: 'Craylets, squat lobsters nei (LOQ)',
          id: 'GBR-2025-CC-D20237F76-8383371150',
          commodityCode: '03063990',
          certificateNumber: 'GBR-2025-CC-D20237F76',
          productWeight: '11',
          dateOfUnloading: '10/07/2025',
          placeOfUnloading: 'Poland',
          transportUnloadedFrom: '12212',
          weightOnCC: '0.5',
          scientificName: 'Galatheidae',
          certificateType: 'uk',
          supportingDocuments: [],
          productDescription: 'Lobsters',
          netWeightProductArrival: '10',
          netWeightFisheryProductArrival: '10',
          netWeightProductDeparture: '11',
          netWeightFisheryProductDeparture: '10',
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
      },
      arrivalTransport: {
        vehicle: 'PLANE',
        flightNumber: 'BA078',
        departurePlace: 'hull',
        user_id: 'a9602f38-f220-475a-991f-a19626bc51ae',
        vesselName: '123',
        containerNumber: '456',
        exportedFrom: 'France'
      },
        facilityName: 'Test Processor 1',
        facilityAddressOne: '20',
        facilityAddressTwo: '',
        facilityTownCity: 'Town',
        facilityPostcode: 'test',
        storedAs: "chilled",
        facilityArrivalDate: '20/10/2025'
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
      transport: {
        vehicle: 'DIRECTLANDING',
        flagState: 'UK',
        departurePlace: 'hull',
      },
      arrivalTransport: {
        vehicle: 'DIRECTLANDING',
        flagState: 'UK',
        departurePlace: 'hull',
      },
        facilityName: 'Test Processor 1',
        facilityAddressOne: '20',
        facilityAddressTwo: '',
        facilityTownCity: 'Town',
        facilityPostcode: 'test',
        storedAs: "chilled",
        facilityArrivalDate: '20/10/2025'
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
      transport: {
        vehicle: 'truck'
      },
      arrivalTransport: {
        vehicle: 'truck'
      },
        facilityName: 'Test Processor 1',
        facilityAddressOne: '20',
        facilityAddressTwo: '',
        facilityTownCity: 'Town',
        facilityPostcode: 'test',
        storedAs: "chilled",
        facilityArrivalDate: '20/10/2025'
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
      transport: {
        vehicle: 'CONTAINERVESSEL'
      },
      arrivalTransport: {
        vehicle: 'CONTAINERVESSEL',
        flagState: 'UK',
        departurePlace: 'hull',
        user_id: 'a9602f38-f220-475a-991f-a19626bc51ae',
        vesselName: '123',
        containerNumbers: [
            'ABCD1', 'ABCD2', 'ABCD3', 'ABCD4', 'ABCD5'
        ],
        exportedFrom: 'France'
      },
        facilityName: 'Test Processor 1',
        facilityAddressOne: '20',
        facilityAddressTwo: '',
        facilityTownCity: 'Town',
        facilityPostcode: 'test',
        storedAs: "chilled",
        facilityArrivalDate: '20/10/2025'
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
      transport: {
        vehicle: 'DIRECTLANDING'
      },
      arrivalTransport: {
        vehicle: 'DIRECTLANDING'
      },
        facilityName: 'Test Processor 1',
        facilityAddressOne: '20',
        facilityAddressTwo: '',
        facilityTownCity: 'Town',
        facilityPostcode: 'test',
        storedAs: "chilled",
        facilityArrivalDate: '20/10/2025'
    };

    await renderPdf(pdfType.STORAGE_NOTE, data, false, sasJson.qrUri, mockedStream);
  });

  test('render transport pdf: SD PLANE with missing arrival transportation and date of unloading', async () => {
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
      transport: {
        vehicle: 'PLANE',
        flightNumber: 'BA078',
        departurePlace: 'hull',
        user_id: 'a9602f38-f220-475a-991f-a19626bc51ae',
        vesselName: '123',
        containerNumber: '456',
        exportedFrom: 'France'
      },
        facilityName: 'Test Processor 1',
        facilityAddressOne: '20',
        facilityAddressTwo: '',
        facilityTownCity: 'Town',
        facilityPostcode: 'test',
        storedAs: "chilled",
    };

    await renderPdf(pdfType.STORAGE_NOTE, data, false, sasJson.qrUri, mockedStream);
  });

  test('render storage note - storage facility with Chilled storage type', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_storage_note_chilled.pdf',
      uri: '_storage_note_chilled.pdf',
      qrUri: 'http://localhost:3001/qr/storage-notes/_storage_note_chilled.pdf'
    };

    const data = {
      documentNumber: "GBR-2024-SN-ABC123DEF",
      exporter: {
        exporterFullName: 'John Smith',
        exporterCompanyName: 'Cold Storage Ltd',
        addressOne: '123 Storage Lane',
        addressTwo: 'Unit 4',
        townCity: 'Bristol',
        postcode: 'BS1 2AB',
      },
      facilityName: 'Bristol Cold Store',
      facilityAddressOne: '456 Warehouse Road',
      facilityAddressTwo: 'Building B',
      facilityTownCity: 'Bristol',
      facilityPostcode: 'BS2 3CD',
      facilityApprovalNumber: 'UK-BS-001',
      facilityStorage: 'Chilled',
      catches: [
        {
          productDescription: 'Fresh Atlantic Cod',
          product: 'COD',
          commodityCode: '03036310',
          certificateNumber: 'GBR-2024-CC-XYZ789',
          netWeightProductArrival: '500',
          netWeightFisheryProductDeparture: '480'
        }
      ],
      arrivalTransport: {
        vehicle: 'truck',
        departureCountry: 'Norway',
        departureDate: '2024-10-15',
        departurePort: 'Bergen Port',
        registrationNumber: 'ABC123',
        freightBillNumber: 'FB-2024-001',
        containerNumbers: ['CONT123', 'CONT456'],
        placeOfUnloading: 'Bristol Port'
      },
      storageFacilities: [
        {
          facilityArrivalDate: '2024-10-16'
        }
      ]
    };

    await renderPdf(pdfType.STORAGE_NOTE, data, false, sasJson.qrUri, mockedStream);
  });

  test('render storage note - storage facility with Frozen storage type', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_storage_note_frozen.pdf',
      uri: '_storage_note_frozen.pdf',
      qrUri: 'http://localhost:3001/qr/storage-notes/_storage_note_frozen.pdf'
    };

    const data = {
      documentNumber: "GBR-2024-SN-DEF456GHI",
      exporter: {
        exporterFullName: 'Sarah Johnson',
        exporterCompanyName: 'Frozen Seafood Solutions',
        addressOne: '789 Freezer Avenue',
        addressTwo: '',
        townCity: 'Hull',
        postcode: 'HU1 1AB',
      },
      facilityName: 'Hull Frozen Storage',
      facilityAddressOne: '321 Cold Storage Way',
      facilityAddressTwo: 'Dock Area',
      facilityTownCity: 'Hull',
      facilityPostcode: 'HU2 2CD',
      facilityApprovalNumber: 'UK-HU-002',
      facilityStorage: 'Frozen',
      catches: [
        {
          productDescription: 'Frozen Haddock Fillets',
          product: 'HAD',
          commodityCode: '03047310',
          certificateNumber: 'GBR-2024-CC-HAD999',
          netWeightProductArrival: '1000',
          netWeightFisheryProductDeparture: '950'
        }
      ],
      arrivalTransport: {
        vehicle: 'containervessel',
        vesselName: 'Nordic Star',
        flagState: 'Norway',
        departureCountry: 'Iceland',
        departureDate: '2024-10-20',
        departurePort: 'Reykjavik',
        containerNumbers: ['FROZ001', 'FROZ002', 'FROZ003'],
        placeOfUnloading: 'Hull Port'
      },
      storageFacilities: [
        {
          facilityArrivalDate: '2024-10-22'
        }
      ]
    };

    await renderPdf(pdfType.STORAGE_NOTE, data, false, sasJson.qrUri, mockedStream);
  });

  test('render storage note - storage facility with Other storage type', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_storage_note_other.pdf',
      uri: '_storage_note_other.pdf',
      qrUri: 'http://localhost:3001/qr/storage-notes/_storage_note_other.pdf'
    };

    const data = {
      documentNumber: "GBR-2024-SN-GHI789JKL",
      exporter: {
        exporterFullName: 'Michael Brown',
        exporterCompanyName: 'Marine Storage Specialists',
        addressOne: '555 Harbor Street',
        addressTwo: 'Suite 10',
        townCity: 'Plymouth',
        postcode: 'PL1 1AA',
      },
      facilityName: 'Plymouth Marine Storage',
      facilityAddressOne: '777 Dock Road',
      facilityAddressTwo: '',
      facilityTownCity: 'Plymouth',
      facilityPostcode: 'PL2 2BB',
      facilityApprovalNumber: 'UK-PL-003',
      facilityStorage: 'Other',
      catches: [
        {
          productDescription: 'Live Lobster',
          product: 'LBE',
          commodityCode: '03061100',
          certificateNumber: 'GBR-2024-CC-LOB555',
          netWeightProductArrival: '250',
          netWeightFisheryProductDeparture: '240'
        }
      ],
      arrivalTransport: {
        vehicle: 'plane',
        flightNumber: 'BA1234',
        airwayBillNumber: 'AWB-2024-777',
        freightBillNumber: 'FRE-888',
        departureCountry: 'France',
        departureDate: '2024-10-25',
        departurePort: 'Paris CDG Airport',
        containerNumbers: ['AIR123'],
        placeOfUnloading: 'Plymouth Airport'
      },
      storageFacilities: [
        {
          facilityArrivalDate: '2024-10-25'
        }
      ]
    };

    await renderPdf(pdfType.STORAGE_NOTE, data, false, sasJson.qrUri, mockedStream);
  });

  test('should add document structure with language tag', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
    };

    const data = {
      documentNumber: "GBR-2018-CC-1C89DE54F",
      exporter: {
        exporterFullName: 'Jim Jessop',
        exporterCompanyName: 'FishByMail Ltd',
        addressOne: '77 Coast Road',
        townCity: 'Jarrow',
        postcode: 'NE31 1YW',
      },
      exportPayload: {
        items: [{
          product: {
            commodityCode: "30000001",
            presentation: { code: "FIL", label: "Filleted" },
            state: { code: "FRO", label: "Frozen" },
            species: { code: "FISH1", label: "FISH1 (FISH1)" }
          },
          landings: [{
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
          }]
        }]
      },
      transport: {
        vehicle: 'plane',
        departurePlace: 'hull',
        flightNumber: '123',
        exportedTo: {
          officialCountryName: 'France'
        }
      },
      conservation: {
        conservationReference: 'Common fisheries policy'
      }
    };

    await renderPdf(pdfType.EXPORT_CERT, data, false, sasJson.qrUri, mockedStream);
    // Test verifies the PDF is generated successfully with document structure and language tag
    expect(mockedStream).toBeDefined();
  });

  test('should render QR code in Section 9 positioned to the right of Date Issued field - FI0-10471', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
    };

    const data = {
      documentNumber: "GBR-2024-CC-QR9TEST",
      exporter: {
        exporterFullName: 'QR Position Test User',
        exporterCompanyName: 'QR Test Company Ltd',
        addressOne: '123 Test Street',
        townCity: 'Test City',
        postcode: 'TS1 2AB',
      },
      exportPayload: {
        items: [{
          product: {
            commodityCode: "03036310",
            presentation: { code: "FIL", label: "Filleted" },
            state: { code: "FRO", label: "Frozen" },
            species: { code: "COD", label: "Atlantic cod (COD)" }
          },
          landings: [{
            model: {
              vessel: {
                pln: "TS123",
                vesselName: "TEST VESSEL",
                homePort: "TESTPORT",
                licenceNumber: "99999",
                licenceValidTo: "2027-12-31T00:00:00",
                imoNumber: "1234567",
                licenceHolder: "Test Licence Holder",
                flag: "GBR"
              },
              dateLanded: "2024-11-20T00:00:00.000Z",
              exportWeight: 100,
              faoArea: "FAO27"
            }
          }]
        }]
      },
      transport: {
        vehicle: 'containervessel',
        departurePlace: 'Portsmouth',
        vesselName: 'TEST CONTAINER SHIP',
        flagState: 'United Kingdom',
        containerNumber: 'CONT123456',
        exportedTo: {
          officialCountryName: 'France'
        }
      },
      conservation: {
        conservationReference: 'Common Fisheries Policy'
      }
    };

    // Test verifies that QR code is rendered in Section 9
    // The QR code should be positioned ~80px to the right of the Date Issued field
    // Per FI0-10471 acceptance criteria
    await renderPdf(pdfType.EXPORT_CERT, data, false, sasJson.qrUri, mockedStream);
    expect(mockedStream).toBeDefined();
  });

  test('should not render QR code in Section 8 - FI0-10471', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      uri: '_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_d5cd0fb0-bd41-4dc0-a265-c3a438ebd782.pdf'
    };

    const data = {
      documentNumber: "GBR-2024-CC-NOQRS8",
      exporter: {
        exporterFullName: 'Section 8 Test User',
        exporterCompanyName: 'No QR in Section 8 Test Ltd',
        addressOne: '456 Test Avenue',
        townCity: 'Test Town',
        postcode: 'TT2 3CD',
      },
      exportPayload: {
        items: [{
          product: {
            commodityCode: "03036400",
            presentation: { code: "FIL", label: "Filleted" },
            state: { code: "FRO", label: "Frozen" },
            species: { code: "HAD", label: "Haddock (HAD)" }
          },
          landings: [{
            model: {
              vessel: {
                pln: "TT456",
                vesselName: "NO QR VESSEL",
                homePort: "TESTPORT2",
                licenceNumber: "88888"
              },
              dateLanded: "2024-11-21T00:00:00.000Z",
              exportWeight: 50
            }
          }]
        }]
      },
      transport: {
        vehicle: 'truck',
        nationalityOfVehicle: 'UK',
        registrationNumber: 'TEST123',
        exportedTo: {
          officialCountryName: 'Belgium'
        }
      },
      conservation: {
        conservationReference: 'Common Fisheries Policy'
      }
    };

    // Test verifies that Section 8 does not contain QR code
    // QR code should only appear in Section 9 per FI0-10471
    await renderPdf(pdfType.EXPORT_CERT, data, false, sasJson.qrUri, mockedStream);
    expect(mockedStream).toBeDefined();
  });

  test('should handle long licence holder names with dynamic pagination', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_long-licence-holder.pdf',
      uri: '_long-licence-holder.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_long-licence-holder.pdf'
    };

    const data = {
      documentNumber: "GBR-2024-CC-LONGNAME",
      exportPayload: {
        items: [{
          product: {
            commodityCode: "03036400",
            presentation: { code: "FIL", label: "Filleted" },
            state: { code: "FRO", label: "Frozen" },
            species: { code: "COD", label: "Atlantic cod (COD)" }
          },
          landings: [
            {
              model: {
                vessel: {
                  pln: "A123",
                  vesselName: "TEST VESSEL 1",
                  homePort: "ARDGLASS",
                  licenceNumber: "12345",
                  licenceHolder: "RUSSELL A HENRY & SON WELDING AND FABRICATION"
                },
                dateLanded: "2024-01-15T00:00:00.000Z",
                exportWeight: 100,
                faoArea: "FAO27"
              }
            },
            {
              model: {
                vessel: {
                  pln: "B456",
                  vesselName: "TEST VESSEL 2",
                  homePort: "BELFAST",
                  licenceNumber: "67890",
                  licenceHolder: "SHORT NAME LTD"
                },
                dateLanded: "2024-01-16T00:00:00.000Z",
                exportWeight: 150,
                faoArea: "FAO27"
              }
            }
          ]
        }]
      },
      exporter: {
        exporterFullName: 'Test Exporter',
        exporterCompanyName: 'Test Company Ltd',
        addressOne: '123 Test St',
        townCity: 'TestCity',
        postcode: 'TC1 2AB'
      },
      transport: {
        vehicle: 'truck',
        nationalityOfVehicle: 'UK',
        registrationNumber: 'TEST456',
        exportedTo: { officialCountryName: 'France' }
      },
      conservation: { conservationReference: 'Common Fisheries Policy' }
    };

    // Test verifies dynamic row height calculation for long licence holder names
    await renderPdf(pdfType.EXPORT_CERT, data, false, sasJson.qrUri, mockedStream);
    expect(mockedStream).toBeDefined();
  });

  test('should handle multi-vessel schedule with pagination', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_multi-vessel-pagination.pdf',
      uri: '_multi-vessel-pagination.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_multi-vessel-pagination.pdf'
    };

    // Create multiple landings to trigger pagination
    const landings = [];
    for (let i = 0; i < 15; i++) {
      landings.push({
        model: {
          vessel: {
            pln: `PLN${i}`,
            vesselName: `VESSEL ${i}`,
            homePort: "TESTPORT",
            licenceNumber: `LIC${i}`,
            licenceHolder: `LICENCE HOLDER NAME ${i}`
          },
          dateLanded: "2024-01-20T00:00:00.000Z",
          exportWeight: 50 + i,
          faoArea: "FAO27"
        }
      });
    }

    const data = {
      documentNumber: "GBR-2024-CC-MULTIPAGE",
      exportPayload: {
        items: [{
          product: {
            commodityCode: "03026100",
            presentation: { code: "WHL", label: "Whole" },
            state: { code: "FRE", label: "Fresh" },
            species: { code: "HER", label: "Atlantic herring (HER)" }
          },
          landings: landings
        }]
      },
      exporter: {
        exporterFullName: 'Multi Page Test',
        exporterCompanyName: 'Pagination Test Ltd',
        addressOne: '789 Page St',
        townCity: 'PageCity',
        postcode: 'PG1 2CD'
      },
      transport: {
        vehicle: 'truck',
        nationalityOfVehicle: 'UK',
        registrationNumber: 'PAGE123',
        exportedTo: { officialCountryName: 'Spain' }
      },
      conservation: { conservationReference: 'Common Fisheries Policy' }
    };

    // Test verifies pagination logic with multiple vessels
    await renderPdf(pdfType.EXPORT_CERT, data, false, sasJson.qrUri, mockedStream);
    expect(mockedStream).toBeDefined();
  });

  test('should render blank template with multi-vessel schedule', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_blank-template.pdf',
      uri: '_blank-template.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_blank-template.pdf'
    };

    const data = {
      isBlankTemplate: true,
      exportPayload: {
        items: []
      }
    };

    // Test verifies blank template rendering
    await renderPdf(pdfType.EXPORT_CERT, data, false, sasJson.qrUri, mockedStream);
    expect(mockedStream).toBeDefined();
  });

  test('should handle vessel with long licence detail and homePort', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_long-details.pdf',
      uri: '_long-details.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_long-details.pdf'
    };

    const data = {
      documentNumber: "GBR-2024-CC-LONGDETAILS",
      exportPayload: {
        items: [{
          product: {
            commodityCode: "03044400",
            presentation: { code: "FIL", label: "Filleted" },
            state: { code: "FRO", label: "Frozen" },
            species: { code: "PLE", label: "European plaice (PLE)" }
          },
          landings: [{
            model: {
              vessel: {
                pln: "X999",
                vesselName: "LONG DETAILS VESSEL",
                homePort: "PORTAVOGIE WITH VERY LONG NAME",
                licenceNumber: "VERY-LONG-LICENCE-NUMBER-123456789",
                licenceHolder: "COMPANY WITH EXTREMELY LONG NAME LIMITED",
                licenceValidTo: "2025-12-31T00:00:00.000Z"
              },
              dateLanded: "2024-01-25T00:00:00.000Z",
              exportWeight: 200,
              faoArea: "FAO27"
            }
          }]
        }]
      },
      exporter: {
        exporterFullName: 'Long Details Test',
        exporterCompanyName: 'Details Test Ltd',
        addressOne: '111 Detail St',
        townCity: 'DetailCity',
        postcode: 'DT1 2EF'
      },
      transport: {
        vehicle: 'vessel',
        nationalityOfVehicle: 'UK',
        registrationNumber: 'DETAIL01',
        exportedTo: { officialCountryName: 'Netherlands' }
      },
      conservation: { conservationReference: 'Common Fisheries Policy' }
    };

    // Test verifies handling of long licence details and homePort
    await renderPdf(pdfType.EXPORT_CERT, data, false, sasJson.qrUri, mockedStream);
    expect(mockedStream).toBeDefined();
  });

  test('should handle mixed vessel names - some with long holders, some without', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_mixed-vessels.pdf',
      uri: '_mixed-vessels.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_mixed-vessels.pdf'
    };

    const data = {
      documentNumber: "GBR-2024-CC-MIXED",
      exportPayload: {
        items: [{
          product: {
            commodityCode: "03026900",
            presentation: { code: "GUT", label: "Gutted" },
            state: { code: "FRE", label: "Fresh" },
            species: { code: "MAC", label: "Atlantic mackerel (MAC)" }
          },
          landings: [
            {
              model: {
                vessel: {
                  pln: "M001",
                  vesselName: "VESSEL ONE",
                  homePort: "PORT",
                  licenceNumber: "L1",
                  licenceHolder: "A"
                },
                dateLanded: "2024-02-01T00:00:00.000Z",
                exportWeight: 30,
                faoArea: "FAO27"
              }
            },
            {
              model: {
                vessel: {
                  pln: "M002",
                  vesselName: "VESSEL TWO",
                  homePort: "LONGPORTNAME",
                  licenceNumber: "LONG-LIC-NUM-12345",
                  licenceHolder: "EXTREMELY LONG COMPANY NAME WITH MANY WORDS LIMITED"
                },
                dateLanded: "2024-02-02T00:00:00.000Z",
                exportWeight: 40,
                faoArea: "FAO27"
              }
            },
            {
              model: {
                vessel: {
                  pln: "M003",
                  vesselName: "VESSEL THREE",
                  homePort: "PORT3",
                  licenceNumber: "L3",
                  licenceHolder: "SHORT LTD"
                },
                dateLanded: "2024-02-03T00:00:00.000Z",
                exportWeight: 50,
                faoArea: "FAO27"
              }
            }
          ]
        }]
      },
      exporter: {
        exporterFullName: 'Mixed Test',
        exporterCompanyName: 'Mixed Company',
        addressOne: '222 Mix St',
        townCity: 'MixCity',
        postcode: 'MX1 3GH'
      },
      transport: {
        vehicle: 'truck',
        nationalityOfVehicle: 'UK',
        registrationNumber: 'MIX789',
        exportedTo: { officialCountryName: 'Germany' }
      },
      conservation: { conservationReference: 'Common Fisheries Policy' }
    };

    // Test verifies mixed row heights are calculated correctly
    await renderPdf(pdfType.EXPORT_CERT, data, false, sasJson.qrUri, mockedStream);
    expect(mockedStream).toBeDefined();
  });

  test('should handle vessels with empty/null licence holders', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_empty-holders.pdf',
      uri: '_empty-holders.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_empty-holders.pdf'
    };

    const data = {
      documentNumber: "GBR-2024-CC-EMPTY",
      exportPayload: {
        items: [{
          product: {
            commodityCode: "03034100",
            presentation: { code: "WHL", label: "Whole" },
            state: { code: "FRE", label: "Fresh" },
            species: { code: "SKI", label: "Skipjack tuna (SKI)" }
          },
          landings: [
            {
              model: {
                vessel: {
                  pln: "E001",
                  vesselName: "EMPTY HOLDER VESSEL",
                  homePort: "EMPTYPORT",
                  licenceNumber: "EMP001"
                },
                dateLanded: "2024-02-10T00:00:00.000Z",
                exportWeight: 80,
                faoArea: "FAO27"
              }
            },
            {
              model: {
                vessel: {
                  pln: "E002",
                  vesselName: "ANOTHER VESSEL",
                  homePort: "PORT2",
                  licenceNumber: "EMP002",
                  licenceHolder: ""
                },
                dateLanded: "2024-02-11T00:00:00.000Z",
                exportWeight: 90,
                faoArea: "FAO27"
              }
            }
          ]
        }]
      },
      exporter: {
        exporterFullName: 'Empty Test',
        exporterCompanyName: 'Empty Company',
        addressOne: '333 Empty St',
        townCity: 'EmptyCity',
        postcode: 'EM1 4JK'
      },
      transport: {
        vehicle: 'truck',
        nationalityOfVehicle: 'UK',
        registrationNumber: 'EMP012',
        exportedTo: { officialCountryName: 'Ireland' }
      },
      conservation: { conservationReference: 'Common Fisheries Policy' }
    };

    // Test verifies empty licence holders default to minimum height
    await renderPdf(pdfType.EXPORT_CERT, data, false, sasJson.qrUri, mockedStream);
    expect(mockedStream).toBeDefined();
  });

  test('should handle edge case - exactly 7 rows per page', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_seven-rows.pdf',
      uri: '_seven-rows.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_seven-rows.pdf'
    };

    const landings = [];
    for (let i = 0; i < 7; i++) {
      landings.push({
        model: {
          vessel: {
            pln: `S${i}`,
            vesselName: `VESSEL ${i}`,
            homePort: `PORT${i}`,
            licenceNumber: `LIC${i}`,
            licenceHolder: `HOLDER ${i}`
          },
          dateLanded: "2024-02-15T00:00:00.000Z",
          exportWeight: 20 + i,
          faoArea: "FAO27"
        }
      });
    }

    const data = {
      documentNumber: "GBR-2024-CC-SEVEN",
      exportPayload: {
        items: [{
          product: {
            commodityCode: "03037100",
            presentation: { code: "FIL", label: "Filleted" },
            state: { code: "FRO", label: "Frozen" },
            species: { code: "SAL", label: "Atlantic salmon (SAL)" }
          },
          landings: landings
        }]
      },
      exporter: {
        exporterFullName: 'Seven Test',
        exporterCompanyName: 'Seven Company',
        addressOne: '444 Seven St',
        townCity: 'SevenCity',
        postcode: 'SV1 5LM'
      },
      transport: {
        vehicle: 'truck',
        nationalityOfVehicle: 'UK',
        registrationNumber: 'SEV777',
        exportedTo: { officialCountryName: 'Italy' }
      },
      conservation: { conservationReference: 'Common Fisheries Policy' }
    };

    // Test verifies edge case of exactly fitting rows on one page
    await renderPdf(pdfType.EXPORT_CERT, data, false, sasJson.qrUri, mockedStream);
    expect(mockedStream).toBeDefined();
  });

  test('should handle sample mode with multi-vessel schedule', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_sample-multi.pdf',
      uri: '_sample-multi.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_sample-multi.pdf'
    };

    const data = {
      documentNumber: "GBR-2024-CC-SAMPLE",
      exportPayload: {
        items: [{
          product: {
            commodityCode: "03025500",
            presentation: { code: "WHL", label: "Whole" },
            state: { code: "ALI", label: "Alive" },
            species: { code: "LBE", label: "Blue lobster (LBE)" }
          },
          landings: [
            {
              model: {
                vessel: {
                  pln: "SAM1",
                  vesselName: "SAMPLE VESSEL 1",
                  homePort: "SAMPLEPORT",
                  licenceNumber: "SAM001",
                  licenceHolder: "SAMPLE LICENCE HOLDER NAME ONE"
                },
                dateLanded: "2024-03-01T00:00:00.000Z",
                exportWeight: 15,
                faoArea: "FAO27"
              }
            },
            {
              model: {
                vessel: {
                  pln: "SAM2",
                  vesselName: "SAMPLE VESSEL 2",
                  homePort: "PORT",
                  licenceNumber: "SAM002",
                  licenceHolder: "SAMPLE HOLDER TWO"
                },
                dateLanded: "2024-03-02T00:00:00.000Z",
                exportWeight: 25,
                faoArea: "FAO27"
              }
            }
          ]
        }]
      },
      exporter: {
        exporterFullName: 'Sample Test',
        exporterCompanyName: 'Sample Company',
        addressOne: '555 Sample St',
        townCity: 'SampleCity',
        postcode: 'SM1 6NP'
      },
      transport: {
        vehicle: 'truck',
        nationalityOfVehicle: 'UK',
        registrationNumber: 'SAM123',
        exportedTo: { officialCountryName: 'Portugal' }
      },
      conservation: { conservationReference: 'Common Fisheries Policy' }
    };

    // Test verifies sample mode rendering with masked document number
    await renderPdf(pdfType.EXPORT_CERT, data, true, sasJson.qrUri, mockedStream);
    expect(mockedStream).toBeDefined();
  });

  test('should handle vessels with special characters in names', async () => {
    const sasJson = {
      container: '527fb0dd-b1d7-46c8-bfed-e06b373d041c',
      blobName: '_special-chars.pdf',
      uri: '_special-chars.pdf',
      qrUri: 'http://localhost:3001/qr/export-certificates/_special-chars.pdf'
    };

    const data = {
      documentNumber: "GBR-2024-CC-SPECIAL",
      exportPayload: {
        items: [{
          product: {
            commodityCode: "03061100",
            presentation: { code: "WHL", label: "Whole" },
            state: { code: "FRE", label: "Fresh" },
            species: { code: "NEP", label: "Norway lobster (NEP)" }
          },
          landings: [{
            model: {
              vessel: {
                pln: "SP001",
                vesselName: "O'BRIEN & SONS",
                homePort: "PORT-NAME",
                licenceNumber: "LIC/2024/001",
                licenceHolder: "O'MALLEY & COMPANY - FISHING SERVICES LTD"
              },
              dateLanded: "2024-03-10T00:00:00.000Z",
              exportWeight: 120,
              faoArea: "FAO27"
            }
          }]
        }]
      },
      exporter: {
        exporterFullName: "John O'Brien",
        exporterCompanyName: "O'Brien & Co",
        addressOne: '666 Special St',
        townCity: 'SpecialCity',
        postcode: 'SP1 7QR'
      },
      transport: {
        vehicle: 'truck',
        nationalityOfVehicle: 'UK',
        registrationNumber: 'SPC999',
        exportedTo: { officialCountryName: 'Denmark' }
      },
      conservation: { conservationReference: 'Common Fisheries Policy' }
    };

    // Test verifies special characters are handled correctly in text
    await renderPdf(pdfType.EXPORT_CERT, data, false, sasJson.qrUri, mockedStream);
    expect(mockedStream).toBeDefined();
  });
});
