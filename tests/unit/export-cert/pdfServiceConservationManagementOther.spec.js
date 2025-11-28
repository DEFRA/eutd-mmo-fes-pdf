const pdfService = require("../../../src/pdfService");
const blobManager = require("../../../src/storage/blobManager");
const { pdfType } = require("../../../src/pdf/pdfRenderer");
const fs = require("fs");

const { PassThrough } = require("stream");
const mockedStream = new PassThrough();

mockedStream.on("data", (d) => {});

mockedStream.on("end", function () {});

mockedStream.emit("data", "hello world");
mockedStream.end();
mockedStream.destroy();

const getTestStream = function (principalId, blobName) {
  return fs.createWriteStream("./tests/test.pdf");
};

describe("pdfService", () => {
  jest.setTimeout(60000);

  test("should create the expected pdf", async () => {
    const mockCreateContainer = jest.spyOn(blobManager, "createContainer");
    mockCreateContainer.mockResolvedValue(undefined);

    const mockWriteStreamForBlob = jest.spyOn(
      blobManager,
      "writeStreamForBlob"
    );
    mockWriteStreamForBlob.mockResolvedValue(mockedStream);

    const principalId = "527fb0dd-b1d7-46c8-bfed-e06b373d041c";

    const data = {
      documentNumber: "GB-11-22-33",
      exporter: {
        exporterFullName: "Jim Jessop",
        exporterCompanyName: "FishByMail Ltd",
        addressOne: "77 Coast Road",
        addressTwo: "My address is particularly long",
        townCity: "Jarrow",
        postcode: "NE31 1YW",
      },
      exportPayload: {
        items: [
          {
            product: {
              commodityCode: "30000001",
              presentation: {
                code: "FIL",
                label: "Filleted",
              },
              state: {
                code: "FRO",
                label: "Frozen",
              },
              species: {
                code: "FISH1",
                label: "FISH1 (FISH1)",
              },
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
                  },
                  dateLanded: "2019-01-26T00:00:00.000Z",
                  exportWeight: "10",
                },
              },
            ],
          },
          {
            product: {
              commodityCode: "30000002",
              presentation: {
                code: "FIL",
                label: "Filleted",
              },
              state: {
                code: "FRO",
                label: "Frozen",
              },
              species: {
                code: "FISH2",
                label: "FISH2 (FISH2)",
              },
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
                  },
                  dateLanded: "2019-01-25T00:00:00.000Z",
                  exportWeight: "20",
                },
              },
            ],
          },
        ],
      },
      transport: {
        vehicle: "plane",
        departurePlace: "hull",
        user_id: "a9602f38-f220-475a-991f-a19626bc51ae",
        flightNumber: "123",
        containerNumber: "456",
        exportedTo: {
          officialCountryName: "France",
        },
      },
      conservation: {
        conservationReference: "Other",
        anotherConservation: "Aussie conservation policy",
      },
    };

    const responseJson = await pdfService.generatePdfAndUpload(
      principalId,
      pdfType.EXPORT_CERT,
      data,
      false,
      { getStream: getTestStream }
    );

    expect(responseJson).toBeTruthy();
  });
});
