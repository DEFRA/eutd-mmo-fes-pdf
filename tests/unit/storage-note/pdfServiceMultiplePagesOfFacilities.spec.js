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
      documentNumber: "GBR-2018-SD-1C89DE54F",
      exporter: {
        exporterFullName: "Jim Jessop",
        exporterCompanyName: "FishByMail Ltd",
        addressOne: "77 Coast Road",
        addressTwo: "My address is particularly long",
        townCity: "Jarrow",
        postcode: "NE31 1YW",
      },
      catches: [
        {
          product: "cod",
          commodityCode: "0123456",
          certificateNumber: "GBR-2018-SD-1C89DE54F",
          productWeight: 30,
          dateOfUnloading: "01/02/2018",
          placeOfUnloading: "Jarrow",
          transportUnloadedFrom: "MK-0547, Saami",
        },
        {
          product: "White fish tails",
          commodityCode: "012126",
          certificateNumber: "GBR-2018-SD-1C89DE55F",
          productWeight: 40,
          dateOfUnloading: "01/02/2018",
          placeOfUnloading: "Jarrow",
          transportUnloadedFrom: "MK-0547, Saami",
        },
      ],
      storageFacilities: [
        {
          facilityName: "Test Processor 1",
          facilityAddressOne: "1",
          facilityAddressTwo: "This address is massively huge",
          facilityTownCity: "I mean really really really really really big",
          facilityPostcode: "NE1 4T",
          storedAs: "chilled",
        },
        {
          facilityName: "Test Processor 2",
          facilityAddressOne: "2",
          facilityAddressTwo: "",
          facilityTownCity: "Test",
          facilityPostcode: "Test",
          storedAs: "chilled",
        },
        {
          facilityName: "Test Processor 3",
          facilityAddressOne: "3",
          facilityAddressTwo: "",
          facilityTownCity: "Test",
          facilityPostcode: "Test",
          storedAs: "chilled",
        },
        {
          facilityName: "Test Processor 4",
          facilityAddressOne: "4",
          facilityAddressTwo: "",
          facilityTownCity: "Test",
          facilityPostcode: "Test",
          storedAs: "chilled",
        },
        {
          facilityName: "Test Processor 5",
          facilityAddressOne: "5",
          facilityAddressTwo: "",
          facilityTownCity: "Test",
          facilityPostcode: "Test",
          storedAs: "chilled",
        },
        {
          facilityName: "Test Processor 6",
          facilityAddressOne: "6",
          facilityAddressTwo: "",
          facilityTownCity: "Test",
          facilityPostcode: "Test",
        },
        {
          facilityName: "Test Processor 7",
          facilityAddressOne: "7",
          facilityAddressTwo: "",
          facilityTownCity: "Test",
          facilityPostcode: "Test",
          storedAs: "chilled",
        },
        {
          facilityName: "Test Processor 8",
          facilityAddressOne: "8",
          facilityAddressTwo: "",
          facilityTownCity: "Test",
          facilityPostcode: "Test",
          storedAs: "chilled",
        },
        {
          facilityName: "Test Processor 9",
          facilityAddressOne: "9",
          facilityAddressTwo: "",
          facilityTownCity: "Test",
          facilityPostcode: "Test",
          storedAs: "chilled",
        },
        {
          facilityName: "Test Processor 10",
          facilityAddressOne: "10",
          facilityAddressTwo: "",
          facilityTownCity: "Test",
          facilityPostcode: "Test",
          storedAs: "chilled",
        },
        {
          facilityName: "Test Processor 11",
          facilityAddressOne: "11",
          facilityAddressTwo: "",
          facilityTownCity: "Test",
          facilityPostcode: "Test",
          storedAs: "chilled",
        },
        {
          facilityName: "Test Processor 12",
          facilityAddressOne: "12",
          facilityAddressTwo: "",
          facilityTownCity: "Test",
          facilityPostcode: "Test",
          storedAs: "chilled",
        },
        {
          facilityName: "Test Processor 13",
          facilityAddressOne: "13",
          facilityAddressTwo: "",
          facilityTownCity: "Test",
          facilityPostcode: "Test",
          storedAs: "chilled",
        },
        {
          facilityName: "Test Processor 14",
          facilityAddressOne: "14",
          facilityAddressTwo: "",
          facilityTownCity: "Test",
          facilityPostcode: "Test",
          storedAs: "chilled",
        },
        {
          facilityName: "Test Processor 15",
          facilityAddressOne: "15",
          facilityAddressTwo: "",
          facilityTownCity: "Test",
          facilityPostcode: "Test",
          storedAs: "chilled",
        },
        {
          facilityName: "Test Processor 16",
          facilityAddressOne: "16",
          facilityAddressTwo: "",
          facilityTownCity: "Test",
          facilityPostcode: "Test",
          storedAs: "chilled",
        },
        {
          facilityName: "Test Processor 17",
          facilityAddressOne: "17",
          facilityAddressTwo: "",
          facilityTownCity: "Test",
          facilityPostcode: "Test",
          storedAs: "chilled",
        },
        {
          facilityName: "Test Processor 18",
          facilityAddressOne: "18",
          facilityAddressTwo: "",
          facilityTownCity: "Test",
          facilityPostcode: "Test",
          storedAs: "chilled",
        },
        {
          facilityName: "Test Processor 19",
          facilityAddressOne: "19",
          facilityAddressTwo: "",
          facilityTownCity: "Test",
          facilityPostcode: "Test",
          storedAs: "chilled",
        },
        {
          facilityName: "Test Processor 20",
          facilityAddressOne: "20",
          facilityAddressTwo: "",
          facilityTownCity: "Test",
          facilityPostcode: "Test",
          storedAs: "chilled",
        },
        {
          facilityName: "Test Processor 21",
          facilityAddressOne: "21",
          facilityAddressTwo: "",
          facilityTownCity: "Test",
          facilityPostcode: "Test",
          storedAs: "chilled",
        },
        {
          facilityName: "Test Processor 22",
          facilityAddressOne: "22",
          facilityAddressTwo: "",
          facilityTownCity: "Test",
          facilityPostcode: "Test",
          storedAs: "chilled",
        },
        {
          facilityName: "Test Processor 23",
          facilityAddressOne: "23",
          facilityAddressTwo: "",
          facilityTownCity: "Test",
          facilityPostcode: "Test",
          storedAs: "chilled",
        },
        {
          facilityName: "Test Processor 24",
          facilityAddressOne: "24",
          facilityAddressTwo: "",
          facilityTownCity: "Test",
          facilityPostcode: "Test",
          storedAs: "chilled",
        },
        {
          facilityName: "Test Processor 25",
          facilityAddressOne: "25",
          facilityAddressTwo: "",
          facilityTownCity: "Test",
          facilityPostcode: "Test",
          storedAs: "chilled",
        },
        {
          facilityName: "Test Processor 26",
          facilityAddressOne: "26",
          facilityAddressTwo: "",
          facilityTownCity: "Test",
          facilityPostcode: "Test",
          storedAs: "chilled",
        },
      ],
      transport: {
        vehicle: "plane",
        departurePlace: "hull",
        flightNumber: "123",
        containerNumber: "456",
        exportDate: "31/01/2018",
        exportedTo: {
          officialCountryName: "France",
        },
      },
    };

    const responseJson = await pdfService.generatePdfAndUpload(
      principalId,
      pdfType.STORAGE_NOTE,
      data,
      false,
      { getStream: getTestStream }
    );

    expect(responseJson).toBeTruthy();
  });
});
