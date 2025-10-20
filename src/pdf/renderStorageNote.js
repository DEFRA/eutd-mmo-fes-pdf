const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const CommonUtils = require('../utils/common-utils');

const renderStorageNote = async (data, isSample, uri, stream) => {

    let buff = null;
    if (!isSample) {
        buff = await PdfUtils.generateQRCode(uri);
    }

    const doc = CommonUtils.createBaseDocument(uri);
    doc.pipe(stream);

    PdfUtils.heading(doc, 'STORAGE DOCUMENT');

    section1(doc, data, isSample, PdfStyle.MARGIN.TOP + 65);
    section2(doc, data, PdfStyle.MARGIN.TOP + 193);
    section3(doc, data, PdfStyle.MARGIN.TOP + 305);
    section4(doc, data, PdfStyle.MARGIN.TOP + 398);
    section5(doc, data, PdfStyle.MARGIN.TOP + 498);
    section6(doc, data, isSample, buff,PdfStyle.MARGIN.TOP + 594);

    if (isSample) {
        CommonUtils.addSampleWatermark(doc);
    }
    PdfUtils.endOfPage(doc, 1);

    let schedY = PdfStyle.MARGIN.TOP;
    let pageHeight = 780;
    let page = 1;

    if (data.catches.length > 1) {
        const { schedYUp, pageUp} = formatCatchesData(schedY, pageHeight, page, data, doc, isSample);
        page = pageUp;
        schedY = schedYUp;

        if (isSample) {
            CommonUtils.addSampleWatermark(doc);
        }
        PdfUtils.endOfPage(doc, page);
    }
    doc.end();
};

const getTransportUnloadedFromDetails = (data) => {
    const arrivalTransport = data.arrivalTransport;

    if (!arrivalTransport?.vehicle) return undefined;

    const vehicle = arrivalTransport.vehicle.toUpperCase();
    
    // Check for truck
    if (vehicle === 'TRUCK' && arrivalTransport.registrationNumber) {
        return `Truck: ${arrivalTransport.registrationNumber}`;
    }
    
    // Check for train/railway
    if (vehicle === 'TRAIN' && arrivalTransport.railwayBillNumber) {
        return `Train: ${arrivalTransport.railwayBillNumber}`;
    }
    
    // Check for plane/flight
    if (vehicle === 'PLANE' && arrivalTransport.flightNumber) {
        return `Plane: ${arrivalTransport.flightNumber}`;
    }
    
    // Check for container vessel
    if (vehicle === 'CONTAINERVESSEL' && arrivalTransport.vesselName) {
        return `Container vessel: ${arrivalTransport.vesselName}`;
    }
    
    // Fallback to empty string if no matching transport details found
    return '';
};


const formatCatchesData = (schedY, pageHeight, page, data, doc, isSample) => {
    let cellHeight = PdfStyle.ROW.HEIGHT * 2 - 5;
    let catchesLength = data.catches.length;
    let tableStruct;
    if (schedY === PdfStyle.MARGIN.TOP || schedY + 150 > pageHeight) {
        schedY = PdfStyle.MARGIN.TOP;
        if (page !== 1) {
            PdfUtils.endOfPage(doc, page);
        }
        page += 1;
        const {updatedStartY,  tableStruct: speciesTableStruct} = startSpeciesSchedulePage(doc, schedY);
        schedY = updatedStartY;
        tableStruct = speciesTableStruct;
    } else {
        schedY += 25;
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, schedY, '2    Consignment details continued');
        schedY += 20;
        tableStruct = addSpeciesScheduleTableHeaders(doc, schedY);
        schedY += cellHeight;
    }
    let tableBody = doc.struct('TBody');
    tableStruct.add(tableBody);

    cellHeight = PdfStyle.ROW.HEIGHT * 3 + 9;
    for (let catchesIdx = 0; catchesIdx < catchesLength; catchesIdx++) {
        const tableBodyRow = doc.struct('TR');
        tableBody.add(tableBodyRow);

        const TdOne = doc.struct('TD');
        tableBodyRow.add(TdOne);
        const TdOneContent = doc.markStructureContent('TD');
        TdOne.add(TdOneContent);
        PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 15, schedY, 90, cellHeight, data.catches[catchesIdx].product);
        TdOne.end();

        const TdTwo = doc.struct('TD');
        tableBodyRow.add(TdTwo);
        const TdTwoContent = doc.markStructureContent('TD');
        TdTwo.add(TdTwoContent);
        PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 105, schedY, 60, cellHeight, data.catches[catchesIdx].commodityCode);
        TdTwo.end();

        const TdThree = doc.struct('TD');
        tableBodyRow.add(TdThree);
        const TdThreeContent = doc.markStructureContent('TD');
        TdThree.add(TdThreeContent);
        PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 165, schedY, 100, cellHeight, data.catches[catchesIdx].certificateNumber);
        TdThree.end();

        const TdFour = doc.struct('TD');
        tableBodyRow.add(TdFour);
        const TdFourContent = doc.markStructureContent('TD');
        TdFour.add(TdFourContent);
        PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 265, schedY, 50, cellHeight, data.catches[catchesIdx].productWeight);
        TdFour.end();

        const TdFive = doc.struct('TD');
        tableBodyRow.add(TdFive);
        const TdFiveContent = doc.markStructureContent('TD');
        TdFive.add(TdFiveContent);
        PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 315, schedY, 55, cellHeight, data.facilityArrivalDate);
        TdFive.end();

        const TdSix = doc.struct('TD');
        tableBodyRow.add(TdSix);
        const TdSixContent = doc.markStructureContent('TD');
        TdSix.add(TdSixContent);
        PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 370, schedY, 60, cellHeight, data.arrivalTransport?.placeOfUnloading);
        TdSix.end();

        const TdSeven = doc.struct('TD');
        tableBodyRow.add(TdSeven);
        const TdSevenContent = doc.markStructureContent('TD');
        TdSeven.add(TdSevenContent);
        PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 430, schedY, 100, cellHeight, getTransportUnloadedFromDetails(data));
        TdSeven.end();

        schedY += cellHeight;
        tableBodyRow.end();
        if (schedY + cellHeight > pageHeight && (catchesIdx + 1 < catchesLength)) {
            doc.endMarkedContent();
            tableBody.end();
            tableStruct.end();

            schedY = PdfStyle.MARGIN.TOP;
            if (isSample) {
                CommonUtils.addSampleWatermark(doc);
            }
            PdfUtils.endOfPage(doc, page);
            page += 1;
            const {updatedStartY,  tableStruct: speciesTableStruct } = startSpeciesSchedulePage(doc, schedY);
            schedY = updatedStartY;
            tableStruct = speciesTableStruct;
            tableBody = doc.struct('TBody');
            tableStruct.add(tableBody);
        }
    }
    return { schedYUp: schedY, pageUp: page};
}

const startSpeciesSchedulePage = (doc, startY) => {
    CommonUtils.startScheduledPage(doc, startY, 'STORAGE DOCUMENT - SCHEDULE');
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + 85, '2    Consignment details continued');
    const tableStruct = addSpeciesScheduleTableHeaders(doc, startY + 105);
    return {updatedStartY: startY + 105 + PdfStyle.ROW.HEIGHT * 2 - 5, tableStruct};
}

const addSpeciesScheduleTableHeaders = (doc, startY) => {
    let cellHeight = PdfStyle.ROW.HEIGHT * 2 - 5;
    const tableStruct = doc.struct('Table');
    doc.addStructure(tableStruct);

    const tableHead = doc.struct('THead');
    tableStruct.add(tableHead);

    const tableHeadRow = doc.struct('TR');
    tableHead.add(tableHeadRow);

    const tableHeadOne = doc.struct('TH');
    tableHeadRow.add(tableHeadOne);
    const tableHeadOneContent = doc.markStructureContent('TH');
    tableHeadOne.add(tableHeadOneContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, startY, 90, cellHeight, ['Exact description of', 'fisheries products']);
    tableHeadOne.end();

    const tableHeadTwo = doc.struct('TH');
    tableHeadRow.add(tableHeadTwo);
    const tableHeadTwoContent = doc.markStructureContent('TH');
    tableHeadTwo.add(tableHeadTwoContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 105, startY, 60, cellHeight, ['Commodity', 'Code']);
    tableHeadTwo.end();

    const tableHeadThree = doc.struct('TH');
    tableHeadRow.add(tableHeadThree);
    const tableHeadThreeContent = doc.markStructureContent('TH');
    tableHeadThree.add(tableHeadThreeContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 165, startY, 100, cellHeight, ['Catch Certificate /', 'Processing Statement']);
    tableHeadThree.end();

    const tableHeadFour = doc.struct('TH');
    tableHeadRow.add(tableHeadFour);
    const tableHeadFourContent = doc.markStructureContent('TH');
    tableHeadFour.add(tableHeadFourContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 265, startY, 50, cellHeight, ['Weight(kg)']);
    tableHeadFour.end();

    const tableHeadFive = doc.struct('TH');
    tableHeadRow.add(tableHeadFive);
    const tableHeadFiveContent = doc.markStructureContent('TH');
    tableHeadFive.add(tableHeadFiveContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 315, startY, 55, cellHeight, ['Date of unloading']);
    tableHeadFive.end();

    const tableHeadSix = doc.struct('TH');
    tableHeadRow.add(tableHeadSix);
    const tableHeadSixContent = doc.markStructureContent('TH');
    tableHeadSix.add(tableHeadSixContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 370, startY, 60, cellHeight, ['Place of unloading']);
    tableHeadSix.end();

    const tableHeadSeven = doc.struct('TH');
    tableHeadRow.add(tableHeadSeven);
    const tableHeadSevenContent = doc.markStructureContent('TH');
    tableHeadSeven.add(tableHeadSevenContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 430, startY, 100, cellHeight, ['Details of transport', '(unloaded from)']);
    tableHeadSeven.end();

    tableHeadRow.end();
    tableHead.end();
    return tableStruct;
}

const addStorageFacilityTableHeaders = (doc, startY) => {
    let cellHeight = PdfStyle.ROW.HEIGHT * 2;
    const tableStruct = doc.struct('Table');
    doc.addStructure(tableStruct);

    const tableHead = doc.struct('THead');
    tableStruct.add(tableHead);

    const tableHeadRow = doc.struct('TR');
    tableHead.add(tableHeadRow);

    const tableHeadOne = doc.struct('TH');
    tableHeadRow.add(tableHeadOne);
    const tableHeadOneContent = doc.markStructureContent('TH');
    tableHeadOne.add(tableHeadOneContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, startY, 150, cellHeight, ['Name']);
    tableHeadOne.end();

    const tableHeadTwo = doc.struct('TH');
    tableHeadRow.add(tableHeadTwo);
    const tableHeadTwoContent = doc.markStructureContent('TH');
    tableHeadTwo.add(tableHeadTwoContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 165, startY, 365, cellHeight, 'Address');
    tableHeadTwo.end();

    tableHeadRow.end();
    tableHead.end();
    return tableStruct;
}

const startFacilitySchedulePage = (doc, startY) => {
    CommonUtils.startScheduledPage(doc, startY, 'STORAGE DOCUMENT - SCHEDULE');
    let cellHeight = PdfStyle.ROW.HEIGHT * 2;
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + 85, '4    Storage facility details continued');
    const tableStruct = addStorageFacilityTableHeaders(doc, startY + 105);
    return { updatedStartY: startY + 105 + cellHeight, tableStruct };
}

const section6 = (doc, data, isSample, buff, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, 'Endorsement by the competent authority');
    let yPos = startY + 12;
    let cellHeight = PdfStyle.ROW.HEIGHT * 5 + 10;

    const myTable = doc.struct('Table');
    doc.addStructure(myTable);

    const myTableHead = doc.struct('THead');
    myTable.add(myTableHead);

    const myTableHeadRow = doc.struct('TR');
    myTableHead.add(myTableHeadRow);

    const myTableHeadOne = doc.struct('TH');
    myTableHeadRow.add(myTableHeadOne);
    const myTableHeadOneContent = doc.markStructureContent('TH');
    myTableHeadOne.add(myTableHeadOneContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 235, PdfStyle.ROW.HEIGHT, 'Name and Address');
    myTableHeadOne.end();

    const myTableHeadTwo = doc.struct('TH');
    myTableHeadRow.add(myTableHeadTwo);
    const myTableHeadTwoContent = doc.markStructureContent('TH');
    myTableHeadTwo.add(myTableHeadTwoContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 250, yPos, 200, PdfStyle.ROW.HEIGHT, 'Validation');
    myTableHeadTwo.end();

    const myTableHeadThree = doc.struct('TH');
    myTableHeadRow.add(myTableHeadThree);
    const myTableHeadThreeContent = doc.markStructureContent('TH');
    myTableHeadThree.add(myTableHeadThreeContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 450, yPos, 80, PdfStyle.ROW.HEIGHT, 'Date Issued');
    myTableHeadThree.end();

    myTableHeadRow.end();
    myTableHead.end();

    yPos += PdfStyle.ROW.HEIGHT;

    const tableBody = doc.struct('TBody');
    myTable.add(tableBody);

    const tableBodyRow = doc.struct('TR');
    tableBody.add(tableBodyRow);

    const TdOne = doc.struct('TD');
    tableBodyRow.add(TdOne);
    const TdOneContent = doc.markStructureContent('TD');
    TdOne.add(TdOneContent);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 235, cellHeight, ['Illegal Unreported and Unregulated (IUU) Fishing Team,',
        'Marine Management Organisation,', 'Lancaster House, Hampshire Court,', 'Newcastle upon Tyne. NE4 7YJ', 'United Kingdom',
        'Tel: 0300 123 1032',
        'Email: ukiuuslo@marinemanagement.org.uk']);
    TdOne.end();
    
    const TdTwo = doc.struct('TD');
    tableBodyRow.add(TdTwo); 
    const TdTwoContent = doc.markStructureContent('TD');
    TdTwo.add(TdTwoContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 250, yPos, 200, cellHeight);
    TdTwo.end();
    
    if (!isSample) {
        PdfUtils.qrCode(doc, buff, PdfStyle.MARGIN.LEFT + 255, startY + 30);
    }

    const TdThree = doc.struct('TD');
    tableBodyRow.add(TdThree);
    const TdThreeContent = doc.markStructureContent('TD');
    TdThree.add(TdThreeContent);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 450, yPos, 80, cellHeight, PdfUtils.todaysDate())
    TdThree.end();
    
    tableBodyRow.end();
    doc.endMarkedContent();
    tableBody.end();
    myTable.end();

    yPos += cellHeight + 8;
    doc.font(PdfStyle.FONT.REGULAR);
    doc.fontSize(PdfStyle.FONT_SIZE.SMALL);
    doc.text('Validated by the appropriate competent authority (MMO, Scottish Ministers, Welsh Ministers, Department of Agriculture, Environment and Rural Affairs for Northern Ireland, Marine Resources, Growth and Housing and Environment for Jersey, Sea Fisheries, Committee for Economic Development for Guernsey and Department Environment, Food and Agriculture for the Isle of Man) in accordance with article 15 of Council Regulation (EU) 1005/2008 (as retained under s.3(1) European Union (Withdrawal) Act 2018)', PdfStyle.MARGIN.LEFT + 10, yPos);

}

const section5 = (doc, data, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '5    Exporter details');
    let yPos = startY + 12;
    let cellHeight = PdfStyle.ROW.HEIGHT * 3;
    let exporterAddress = PdfUtils.constructAddress([data.exporter.addressOne, data.exporter.addressTwo,
        data.exporter.townCity, data.exporter.postcode]);
    
    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 150, PdfStyle.ROW.HEIGHT, 'Company name')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 165, yPos, 265, PdfStyle.ROW.HEIGHT, 'Address')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 430, yPos, 100, PdfStyle.ROW.HEIGHT, ['Date of acceptance (*)'])),
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 15, yPos + PdfStyle.ROW.HEIGHT, 150, cellHeight, data.exporter.exporterCompanyName)),
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 165, yPos + PdfStyle.ROW.HEIGHT, 265, cellHeight, exporterAddress)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 430, yPos + PdfStyle.ROW.HEIGHT, 100, cellHeight, PdfUtils.todaysDate())),
            ])
        ])
    ]));

    yPos += PdfStyle.ROW.HEIGHT + cellHeight + 5;
    doc.text('* Date of acceptance by exporter of the veracity of the contents of this document', PdfStyle.MARGIN.LEFT + 15, yPos);

    PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT);
}

const section4 = (doc, data, startY) => {

    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '4    Storage facility details');
    let yPos = startY + 12;
    let cellHeight = PdfStyle.ROW.HEIGHT * 2;

    const myTable = doc.struct('Table');
    doc.addStructure(myTable);

    const tableHead = doc.struct('THead');
    myTable.add(tableHead);

    const tableHeadRow = doc.struct('TR');
    tableHead.add(tableHeadRow);

    const tableHeadOne = doc.struct('TH');
    tableHeadRow.add(tableHeadOne);
    const tableHeadOneContent = doc.markStructureContent('TH');
    tableHeadOne.add(tableHeadOneContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 150, PdfStyle.ROW.HEIGHT, ['Name']);
    tableHeadOne.end();

    const tableHeadTwo = doc.struct('TH');
    tableHeadRow.add(tableHeadTwo);
    const tableHeadTwoContent = doc.markStructureContent('TH');
    tableHeadTwo.add(tableHeadTwoContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 165, yPos, 365, PdfStyle.ROW.HEIGHT, 'Address');
    tableHeadTwo.end();

    tableHeadRow.end();
    tableHead.end();

    const tableBody = doc.struct('TBody');
    myTable.add(tableBody);

    const tableBodyRow = doc.struct('TR');
    tableBody.add(tableBodyRow);

   
    yPos += cellHeight;
    let sfAddress = '';
    sfAddress = PdfUtils.constructAddress([data.facilityAddressOne,
        data.facilityAddressTwo,
        data.facilityTownCity,
        data.facilityPostcode]);
    const TdOne = doc.struct('TD');
    tableBodyRow.add(TdOne);
    const TdOneContent = doc.markStructureContent('TD');
    TdOne.add(TdOneContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 15, yPos - 15, 150, cellHeight, data.facilityName);
    TdOne.end();
    const TdTwo = doc.struct('TD');
    tableBodyRow.add(TdTwo);
    const TdTwoContent = doc.markStructureContent('TD');
    TdTwo.add(TdTwoContent)
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 165, yPos - 15, 365, cellHeight, sfAddress);
    TdTwo.end();
    tableBodyRow.end();
    doc.endMarkedContent();
    tableBody.end();
    myTable.end();

    PdfUtils.separator(doc, yPos + cellHeight + 8);
}

const getVcDetails = (data, ) => {
    let vcDetails = '';
    if (data.transport.vehicle.toUpperCase() === 'CONTAINERVESSEL') {
        if (data.transport.vesselName) {
            vcDetails = data.transport.vesselName + ' ';
        }
        if (data.transport.flagState) {
            vcDetails = data.transport.flagState;
        }
    }
    else if (data.transport.vehicle.toUpperCase() === 'DIRECTLANDING') {
        if (data.catches[0].vessel) {
            vcDetails = data.catches[0].vessel + ' ';
        }
        if (data.catches[0].pln) {
            vcDetails = data.catches[0].pln;
        }
    }
    return vcDetails;
};

const getTruckDetails = (data) => {
    let truckDetails = '';
    if (data.transport.vehicle && data.transport.vehicle.toUpperCase() === 'TRUCK') {
        if (data.transport.nationalityOfVehicle) {
            truckDetails = data.transport.nationalityOfVehicle + ' ';
        }
        if (data.transport.registrationNumber) {
            truckDetails = data.transport.registrationNumber;
        }
    }
    return truckDetails;
};

const getTransportDetails = (vcDetails, truckDetails, data) => {
    let transportDetails = ''
    if (vcDetails.length > 0) {
        transportDetails = 'Vessel: ' + vcDetails;
    } else if (data.transport.flightNumber && data.transport.flightNumber.length > 0) {
        transportDetails = 'Flight: ' + data.transport.flightNumber;
    } else if (truckDetails.length > 0) {
        transportDetails = 'Truck: ' + truckDetails;
    } else if (data.transport.railwayBillNumber && data.transport.railwayBillNumber.length > 0) {
        transportDetails = 'Railway: ' + data.transport.railwayBillNumber;
    } else {
        transportDetails = 'See attached transport documents';
    }
    return transportDetails;
};

const getContainerNumbers = (transport) => {
    if (transport.containerNumbers && transport.containerNumbers.length > 0) {
        return transport.containerNumbers.join(', ');
    } else if (transport.containerNumber) {
        return transport.containerNumber;
    } else {
        return '';
    }
}

const section3 = (doc, data, startY) => {
    let vcDetails = '';
    if (data.transport.vehicle) {
        vcDetails = getVcDetails(data);
    }

    let truckDetails = getTruckDetails(data);
    let transportDetails = getTransportDetails(vcDetails, truckDetails, data);

    let departureDateAndPlace = '';
    if (data.transport.exportDate) {
        departureDateAndPlace += data.transport.exportDate;
        if (data.transport.departurePlace) {
            departureDateAndPlace += ' - ';
            departureDateAndPlace += data.transport.departurePlace;
        }
    } else if (data.transport.departurePlace) {
        departureDateAndPlace += data.transport.departurePlace;
    }

    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '3    Departure details');
    let yPos = startY + 12;
    let cellHeight = PdfStyle.ROW.HEIGHT * 2 - 5;

    doc.addStructure(doc.struct('Table', [
        doc.struct('TR', [
            doc.struct('TH', ()=> PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 250, PdfStyle.ROW.HEIGHT, 'Date / Port or Place of Departure')),
            doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 265, yPos, 265, PdfStyle.ROW.HEIGHT, departureDateAndPlace)),
        ]),
        doc.struct('TR', [
            doc.struct('TH', ()=> PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT + 15, yPos + PdfStyle.ROW.HEIGHT, 250, cellHeight, ['Details of transport:', '(Vessel / flight number / railway bill / truck registration)'])),
            doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 265, yPos + PdfStyle.ROW.HEIGHT, 265, cellHeight, transportDetails)),
        ]),
        doc.struct('TR', [
            doc.struct('TH', ()=> PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT + 15, yPos + PdfStyle.ROW.HEIGHT + cellHeight, 250, cellHeight, ['Container numbers (where applicable)'])),
            doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 265, yPos + PdfStyle.ROW.HEIGHT + cellHeight, 265, cellHeight, getContainerNumbers(data.transport))),
        ])
    ]));

    PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT + (cellHeight * 2) + 8);
}

const section2 = (doc, data, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '2    Consignment details');
    let yPos = startY + 12;

    let cellHeight = PdfStyle.ROW.HEIGHT * 2;

    const mySection2Table = doc.struct('Table');
    doc.addStructure(mySection2Table);

    const tableSection2Head = doc.struct('THead');
    mySection2Table.add(tableSection2Head);

    const myTableHeadRow = doc.struct('TR');
    tableSection2Head.add(myTableHeadRow);

    const tableHeadOne = doc.struct('TH');
    myTableHeadRow.add(tableHeadOne);
    const tableHeadOneContent = doc.markStructureContent('TH');
    tableHeadOne.add(tableHeadOneContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 90, cellHeight, ['Exact description of', 'fisheries products']);
    tableHeadOne.end();

    const tableHeadTwo = doc.struct('TH');
    myTableHeadRow.add(tableHeadTwo);
    const tableHeadTwoContent = doc.markStructureContent('TH');
    tableHeadTwo.add(tableHeadTwoContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 105, yPos, 60, cellHeight, ['Commodity', 'Code']);
    tableHeadTwo.end();

    const tableHeadThree = doc.struct('TH');
    myTableHeadRow.add(tableHeadThree);
    const tableHeadThreeContent = doc.markStructureContent('TH');
    tableHeadThree.add(tableHeadThreeContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 165, yPos, 100, cellHeight, ['Catch Certificate /', 'Processing Statement']);
    tableHeadThree.end();

    const tableHeadFour = doc.struct('TH');
    myTableHeadRow.add(tableHeadFour);
    const tableHeadFourContent = doc.markStructureContent('TH');
    tableHeadFour.add(tableHeadFourContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 265, yPos, 50, cellHeight, ['Weight(kg)']);
    tableHeadFour.end();

    const tableHeadFive = doc.struct('TH');
    myTableHeadRow.add(tableHeadFive);
    const tableHeadFiveContent = doc.markStructureContent('TH');
    tableHeadFive.add(tableHeadFiveContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 315, yPos, 55, cellHeight, ['Date of unloading'])
    tableHeadFive.end();

    const tableHeadSix = doc.struct('TH');
    myTableHeadRow.add(tableHeadSix);
    const tableHeadSixContent = doc.markStructureContent('TH');
    tableHeadSix.add(tableHeadSixContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 370, yPos, 60, cellHeight, ['Place of unloading'])
    tableHeadSix.end();

    const tableHeadSeven = doc.struct('TH');
    myTableHeadRow.add(tableHeadSeven);
    const tableHeadSevenContent = doc.markStructureContent('TH');
    tableHeadSeven.add(tableHeadSevenContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 430, yPos, 100, cellHeight, ['Details of transport', '(unloaded from)']);
    tableHeadSeven.end();

    myTableHeadRow.end();
    tableSection2Head.end();

    const tableBody = doc.struct('TBody');
    mySection2Table.add(tableBody);

    yPos += cellHeight;

    let arrLength = data.catches.length;
    let listLimit = 1;
    if (arrLength > 1) {
        listLimit = 0;
    }

    cellHeight = PdfStyle.ROW.HEIGHT * 3 + 9;

    for (let rowIdx = 0; rowIdx < listLimit; rowIdx++) {
        const tableBodyRow = doc.struct('TR');
        tableBody.add(tableBodyRow);
        generateSectionTwoRows(doc, yPos, cellHeight, rowIdx, arrLength, data, tableBodyRow);
        tableBodyRow.end();
        yPos += cellHeight;
    }

    if (arrLength > 1) {
        cellHeight = PdfStyle.ROW.HEIGHT * 3 - 9;
        const tableBodyRow = doc.struct('TR');
        tableBody.add(tableBodyRow);

        const TdOne = doc.struct('TD');
        tableBodyRow.add(TdOne);
        const TdOneContent = doc.markStructureContent('TD');
        TdOne.add(TdOneContent);
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 515, cellHeight, 'SEE SCHEDULE (' + data.catches.length + ' rows)')
        TdOne.end();
        tableBodyRow.end();
        yPos += cellHeight;
    }

    doc.endMarkedContent();
    tableBody.end();
    mySection2Table.end();

    PdfUtils.separator(doc, yPos + 8);
}

const generateSectionTwoRows = (doc, yPos, cellHeight, rowIdx, arrLength, data, tableBodyRow) => {
    const TdOne = doc.struct('TD');
    tableBodyRow.add(TdOne);
    const TdOneContent = doc.markStructureContent('TD');
    TdOne.add(TdOneContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 90, cellHeight, rowIdx < arrLength ? `${data.catches[rowIdx].product}` : '');
    TdOne.end();

    const TdTwo = doc.struct('TD');
    tableBodyRow.add(TdTwo);
    const TdTwoContent = doc.markStructureContent('TD');
    TdTwo.add(TdTwoContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 105, yPos, 60, cellHeight, rowIdx < arrLength ? `${data.catches[rowIdx].commodityCode}` : '');
    TdTwo.end();

    const TdThree = doc.struct('TD');
    tableBodyRow.add(TdThree);
    const TdThreeContent = doc.markStructureContent('TD');
    TdThree.add(TdThreeContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 165, yPos, 100, cellHeight, rowIdx < arrLength ? `${data.catches[rowIdx].certificateNumber}` : '');
    TdThree.end();

    const TdFour = doc.struct('TD');
    tableBodyRow.add(TdFour);
    const TdFourContent = doc.markStructureContent('TD');
    TdFour.add(TdFourContent)
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 265, yPos, 50, cellHeight, rowIdx < arrLength ? `${data.catches[rowIdx].productWeight}` : '');
    TdFour.end();

    const TdFive = doc.struct('TD');
    tableBodyRow.add(TdFive);
    const TdFiveContent = doc.markStructureContent('TD');
    TdFive.add(TdFiveContent)
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 315, yPos, 55, cellHeight, data.facilityArrivalDate ?? '');
    TdFive.end();

    const TdSix = doc.struct('TD');
    tableBodyRow.add(TdSix);
    const TdSixContent = doc.markStructureContent('TD');
    TdSix.add(TdSixContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 370, yPos, 60, cellHeight, data.arrivalTransport?.placeOfUnloading ?? '');
    TdSix.end();

    const TdSeven = doc.struct('TD');
    tableBodyRow.add(TdSeven);
    const TdSevenContent = doc.markStructureContent('TD');
    TdSeven.add(TdSevenContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 430, yPos, 100, cellHeight, getTransportUnloadedFromDetails(data) ?? '');
    TdSeven.end();
}

const section1 = (doc, data, isSample, startY) => {

    let documentNumber = '';
    if (isSample) {
        documentNumber = '###-####-##-#########';
    } else {
        documentNumber = data.documentNumber;
    }

    doc.lineWidth(2);
    doc.moveTo(PdfStyle.MARGIN.LEFT, startY + 4).lineTo(560, startY + 4).stroke();

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT, startY + 17, 'Document Number');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 95, startY + 15, 160, PdfStyle.ROW.HEIGHT, documentNumber);

    PdfUtils.label(doc, 300, startY + 17, 'Validating Authority');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 380, startY + 15, 150, PdfStyle.ROW.HEIGHT, 'Marine Management Organisation');

    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + 40, '1    Name');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 65, startY + 38, 465, PdfStyle.ROW.HEIGHT, 'Illegal Unreported and Unregulated (IUU) Fishing Team');

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 15, startY + 60, 'Address');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 65, startY + 58, 465, PdfStyle.ROW.HEIGHT * 2 + 5, 'Lancaster House, Hampshire Court, Newcastle upon Tyne, United Kingdom. NE4 7YJ');

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 65, startY + 100, 'Tel.');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 90, startY + 98, 200, PdfStyle.ROW.HEIGHT, '0300 123 1032');

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 300, startY + 100, 'Email');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 330, startY + 98, 200, PdfStyle.ROW.HEIGHT, 'ukiuuslo@marinemanagement.org.uk');

    doc.lineWidth(0.75);
    doc.moveTo(0, startY + 120).lineTo(600, startY + 120).dash(2, {space: 2}).stroke();
};

module.exports = renderStorageNote;
