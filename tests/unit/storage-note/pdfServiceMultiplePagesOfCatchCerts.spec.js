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
            catches: [
                {
                    product: 'cod',
                    commodityCode: '00001',
                    certificateNumber: 'GBR-2018-SD-1C89DE54F',
                    productWeight: 30,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'White fish tails',
                    commodityCode: '00002',
                    certificateNumber: 'GBR-2018-SD-1C89DE55F',
                    productWeight: 40,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Assorted fish products',
                    commodityCode: '00003',
                    certificateNumber: 'GBR-2018-SD-1C89DE56F',
                    productWeight: 260,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Fish plus',
                    commodityCode: '00004',
                    certificateNumber: 'GBR-2018-SD-1C89DE56F',
                    productWeight: 260,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Crabs nippas',
                    commodityCode: '00005',
                    certificateNumber: 'GBR-2018-SD-1C89DE57F',
                    productWeight: 3004,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Fish cakes',
                    commodityCode: '00006',
                    certificateNumber: 'GBR-2018-SD-1C99DE58W',
                    productWeight: 3204,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'White fish tails',
                    commodityCode: '00007',
                    certificateNumber: 'GBR-2018-SD-1C89DE55F',
                    productWeight: 40,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Assorted fish products',
                    commodityCode: '00008',
                    certificateNumber: 'GBR-2018-SD-1C89DE56F',
                    productWeight: 260,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Crabs nippas',
                    commodityCode: '00009',
                    certificateNumber: 'GBR-2018-SD-1C89DE57F',
                    productWeight: 3004,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Fish cakes',
                    commodityCode: '000010',
                    certificateNumber: 'GBR-2018-SD-1C99DE58W',
                    productWeight: 3204,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'cod',
                    commodityCode: '00011',
                    certificateNumber: 'GBR-2018-SD-1C89DE54F',
                    productWeight: 30,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'White fish tails',
                    commodityCode: '00012',
                    certificateNumber: 'GBR-2018-SD-1C89DE55F',
                    productWeight: 40,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Assorted fish products',
                    commodityCode: '00013',
                    certificateNumber: 'GBR-2018-SD-1C89DE56F',
                    productWeight: 260,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Crabs nippas',
                    commodityCode: '00014',
                    certificateNumber: 'GBR-2018-SD-1C89DE57F',
                    productWeight: 3004,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Fish cakes',
                    commodityCode: '00015',
                    certificateNumber: 'GBR-2018-SD-1C99DE58W',
                    productWeight: 3204,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'White fish tails',
                    commodityCode: '00016',
                    certificateNumber: 'GBR-2018-SD-1C89DE55F',
                    productWeight: 40,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Assorted fish products',
                    commodityCode: '00017',
                    certificateNumber: 'GBR-2018-SD-1C89DE56F',
                    productWeight: 260,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Crabs nippas',
                    commodityCode: '00018',
                    certificateNumber: 'GBR-2018-SD-1C89DE57F',
                    productWeight: 3004,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Fish cakes',
                    commodityCode: '000019',
                    certificateNumber: 'GBR-2018-SD-1C99DE58W',
                    productWeight: 3204,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Fish cakes',
                    commodityCode: '000020',
                    certificateNumber: 'GBR-2018-SD-1C99DE58W',
                    productWeight: 3204,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'cod',
                    commodityCode: '00021',
                    certificateNumber: 'GBR-2018-SD-1C89DE54F',
                    productWeight: 30,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'White fish tails',
                    commodityCode: '00022',
                    certificateNumber: 'GBR-2018-SD-1C89DE55F',
                    productWeight: 40,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Assorted fish products',
                    commodityCode: '00023',
                    certificateNumber: 'GBR-2018-SD-1C89DE56F',
                    productWeight: 260,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Crabs nippas',
                    commodityCode: '00024',
                    certificateNumber: 'GBR-2018-SD-1C89DE57F',
                    productWeight: 3004,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Fish cakes',
                    commodityCode: '00025',
                    certificateNumber: 'GBR-2018-SD-1C99DE58W',
                    productWeight: 3204,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'White fish tails',
                    commodityCode: '00026',
                    certificateNumber: 'GBR-2018-SD-1C89DE55F',
                    productWeight: 40,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Assorted fish products',
                    commodityCode: '00027',
                    certificateNumber: 'GBR-2018-SD-1C89DE56F',
                    productWeight: 260,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Crabs nippas',
                    commodityCode: '00028',
                    certificateNumber: 'GBR-2018-SD-1C89DE57F',
                    productWeight: 3004,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Fish cakes',
                    commodityCode: '000029',
                    certificateNumber: 'GBR-2018-SD-1C99DE58W',
                    productWeight: 3204,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Fish cakes',
                    commodityCode: '000030',
                    certificateNumber: 'GBR-2018-SD-1C99DE58W',
                    productWeight: 3204,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'cod',
                    commodityCode: '00031',
                    certificateNumber: 'GBR-2018-SD-1C89DE54F',
                    productWeight: 30,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'White fish tails',
                    commodityCode: '00032',
                    certificateNumber: 'GBR-2018-SD-1C89DE55F',
                    productWeight: 40,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Assorted fish products',
                    commodityCode: '00033',
                    certificateNumber: 'GBR-2018-SD-1C89DE56F',
                    productWeight: 260,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Crabs nippas',
                    commodityCode: '00034',
                    certificateNumber: 'GBR-2018-SD-1C89DE57F',
                    productWeight: 3004,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Fish cakes',
                    commodityCode: '00035',
                    certificateNumber: 'GBR-2018-SD-1C99DE58W',
                    productWeight: 3204,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'White fish tails',
                    commodityCode: '00036',
                    certificateNumber: 'GBR-2018-SD-1C89DE55F',
                    productWeight: 40,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Assorted fish products',
                    commodityCode: '00037',
                    certificateNumber: 'GBR-2018-SD-1C89DE56F',
                    productWeight: 260,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Crabs nippas',
                    commodityCode: '00038',
                    certificateNumber: 'GBR-2018-SD-1C89DE57F',
                    productWeight: 3004,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Fish cakes',
                    commodityCode: '000039',
                    certificateNumber: 'GBR-2018-SD-1C99DE58W',
                    productWeight: 3204,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Fish cakes',
                    commodityCode: '000040',
                    certificateNumber: 'GBR-2018-SD-1C99DE58W',
                    productWeight: 3204,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'cod',
                    commodityCode: '00041',
                    certificateNumber: 'GBR-2018-SD-1C89DE54F',
                    productWeight: 30,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'White fish tails',
                    commodityCode: '00042',
                    certificateNumber: 'GBR-2018-SD-1C89DE55F',
                    productWeight: 40,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Assorted fish products',
                    commodityCode: '00043',
                    certificateNumber: 'GBR-2018-SD-1C89DE56F',
                    productWeight: 260,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Crabs nippas',
                    commodityCode: '00044',
                    certificateNumber: 'GBR-2018-SD-1C89DE57F',
                    productWeight: 3004,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Fish cakes',
                    commodityCode: '00045',
                    certificateNumber: 'GBR-2018-SD-1C99DE58W',
                    productWeight: 3204,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'White fish tails',
                    commodityCode: '00046',
                    certificateNumber: 'GBR-2018-SD-1C89DE55F',
                    productWeight: 40,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Assorted fish products',
                    commodityCode: '00047',
                    certificateNumber: 'GBR-2018-SD-1C89DE56F',
                    productWeight: 260,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Crabs nippas',
                    commodityCode: '00048',
                    certificateNumber: 'GBR-2018-SD-1C89DE57F',
                    productWeight: 3004,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Fish cakes',
                    commodityCode: '000049',
                    certificateNumber: 'GBR-2018-SD-1C99DE58W',
                    productWeight: 3204,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                },
                {
                    product: 'Fish cakes',
                    commodityCode: '000050',
                    certificateNumber: 'GBR-2018-SD-1C99DE58W',
                    productWeight: 3204,
                    dateOfUnloading: '01/02/2018',
                    placeOfUnloading: 'Jarrow',
                    transportUnloadedFrom: 'MK-0547, Saami'
                }
            ],
            storageFacilities: [
                {
                    facilityName: 'Storage Facility 1',
                    facilityAddressOne: '20',
                    facilityAddressTwo: '',
                    facilityTownCity: 'Town',
                    facilityPostcode: 'test',
                    storedAs: "frozen"
                }
            ],
            transport: {
                "vehicle": "plane",
                "departurePlace": "hull",
                "flightNumber": "123",
                "containerNumber": "456",
                "exportDate": "31/01/2018"
            }
        };

        const responseJson = await pdfService.generatePdfAndUpload(principalId, pdfType.STORAGE_NOTE,
            data, false, { getStream: getTestStream });

        expect(responseJson).toBeTruthy();

    })
});
