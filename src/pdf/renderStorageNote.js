const PDFDocument = require('pdfkit');
const path = require('path');
const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');

const renderStorageNote = async (data, isSample, uri, stream) => {

    const sampleWatermarkImageFile = path.join(__dirname, '../resources/sample-watermark.png');
    let buff = null;
    if (!isSample) {
        buff = await PdfUtils.generateQRCode(uri);
    }

    const doc = new PDFDocument({
        layout: 'portrait',
        size: 'A4',
        lang: 'en_GB',
        margins: {
            top: PdfStyle.MARGIN.TOP,
            bottom: PdfStyle.MARGIN.BOT,
            left: PdfStyle.MARGIN.LEFT,
            right: PdfStyle.MARGIN.RIGHT,
        },
        pdfVersion: "1.5",
        tagged: true,
        displayTitle: true,
        info: {
            Title: path.basename(uri).split`.`[0]
        }
    });
    doc.pipe(stream);

    PdfUtils.heading(doc, 'STORAGE DOCUMENT');

    section1(doc, data, isSample, PdfStyle.MARGIN.TOP + 65);
    section2(doc, data, PdfStyle.MARGIN.TOP + 193);
    section3(doc, data, PdfStyle.MARGIN.TOP + 305);
    section4(doc, data, PdfStyle.MARGIN.TOP + 398);
    section5(doc, data, PdfStyle.MARGIN.TOP + 498);
    section6(doc, data, isSample, buff,PdfStyle.MARGIN.TOP + 594);

    if (isSample) {
        doc.image(sampleWatermarkImageFile, PdfStyle.MARGIN.LEFT + 10, 120, {scale: 1});
    }
    PdfUtils.endOfPage(doc, 1);

    let schedY = PdfStyle.MARGIN.TOP;
    let pageHeight = 780;
    let page = 1;

    if (data.catches.length > 1) {
        let cellHeight = PdfStyle.ROW.HEIGHT * 2 - 5;
        let catchesLength = data.catches.length;
        if (schedY === PdfStyle.MARGIN.TOP || schedY + 150 > pageHeight) {
            schedY = PdfStyle.MARGIN.TOP;
            if (page !== 1) {
                PdfUtils.endOfPage(doc, page);
            }
            page += 1;
            schedY = startSpeciesSchedulePage(doc, page, schedY);
        } else {
            schedY += 25;
            PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, schedY, '2    Consignment details continued');
            schedY += 20;
            addSpeciesScheduleTableHeaders(doc, schedY);
            schedY += cellHeight;
        }
        cellHeight = PdfStyle.ROW.HEIGHT * 3 + 9;
        for (let catchesIdx = 0; catchesIdx < catchesLength; catchesIdx++) {
            PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 15, schedY, 90, cellHeight, data.catches[catchesIdx].product);
            PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 105, schedY, 60, cellHeight, data.catches[catchesIdx].commodityCode);
            PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 165, schedY, 100, cellHeight, data.catches[catchesIdx].certificateNumber);
            PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 265, schedY, 50, cellHeight, data.catches[catchesIdx].productWeight);
            PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 315, schedY, 55, cellHeight, data.catches[catchesIdx].dateOfUnloading);
            PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 370, schedY, 60, cellHeight, data.catches[catchesIdx].placeOfUnloading);
            PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 430, schedY, 100, cellHeight, data.catches[catchesIdx].transportUnloadedFrom);
            schedY += cellHeight;

            if (schedY + cellHeight > pageHeight && (catchesIdx + 1 < catchesLength)) {
                schedY = PdfStyle.MARGIN.TOP;
                if (isSample) {
                    doc.image(sampleWatermarkImageFile, PdfStyle.MARGIN.LEFT + 10, 120, {scale: 1});
                }
                PdfUtils.endOfPage(doc, page);
                page += 1;
                schedY = startSpeciesSchedulePage(doc, page, schedY);
            }
        }
    }

    if (data.storageFacilities.length > 1) {
        let sfLength = data.storageFacilities.length;
        let cellHeight = PdfStyle.ROW.HEIGHT * 2 - 5;

        if (schedY === PdfStyle.MARGIN.TOP || schedY + 150 > pageHeight) {
            schedY = PdfStyle.MARGIN.TOP;
            if (page !== 1) {
                if (isSample) {
                    doc.image(sampleWatermarkImageFile, PdfStyle.MARGIN.LEFT + 10, 120, {scale: 1});
                }
                PdfUtils.endOfPage(doc, page);
            }
            page += 1;
            schedY = startFacilitySchedulePage(doc, page, schedY);
        } else {
            schedY += 25;
            PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, schedY, '4    Storage facility details continued');
            schedY += 20;
            addStorageFacilityTableHeaders(doc, schedY);
            schedY += PdfStyle.ROW.HEIGHT * 2;
        }

        for (let sfIdx = 0; sfIdx < sfLength; sfIdx++) {
            let sfAddress = PdfUtils.constructAddress([data.storageFacilities[sfIdx].facilityAddressOne,
                data.storageFacilities[sfIdx].facilityAddressTwo,
                data.storageFacilities[sfIdx].facilityTownCity,
                data.storageFacilities[sfIdx].facilityPostcode]);

            PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 15, schedY, 150, cellHeight, data.storageFacilities[sfIdx].facilityName);
            PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 165, schedY, 365, cellHeight, sfAddress);

            schedY += cellHeight;

            if (schedY + cellHeight > pageHeight && (sfIdx + 1 < sfLength)) {

                schedY += 5;
                doc.text('* Tick as appropriate', PdfStyle.MARGIN.LEFT + 15, schedY);

                schedY = PdfStyle.MARGIN.TOP;
                if (isSample) {
                    doc.image(sampleWatermarkImageFile, PdfStyle.MARGIN.LEFT + 10, 120, {scale: 1});
                }
                PdfUtils.endOfPage(doc, page);
                page += 1;
                schedY = startFacilitySchedulePage(doc, page, schedY);
            }
        }
    }

    if (data.storageFacilities.length > 1 || data.catches.length > 1) {
        if (isSample) {
            doc.image(sampleWatermarkImageFile, PdfStyle.MARGIN.LEFT + 10, 120, {scale: 1});
        }
        PdfUtils.endOfPage(doc, page);
    }
    doc.end();
};

const startSpeciesSchedulePage = (doc, page, startY) => {
    startSchedulePage(doc, page, startY);
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + 85, '2    Consignment details continued');
    addSpeciesScheduleTableHeaders(doc, startY + 105);
    return startY + 105 + PdfStyle.ROW.HEIGHT * 2 - 5;
}

const addSpeciesScheduleTableHeaders = (doc, startY) => {
    let cellHeight = PdfStyle.ROW.HEIGHT * 2 - 5;
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, startY, 90, cellHeight, ['Exact description of', 'fisheries products']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 105, startY, 60, cellHeight, ['Commodity', 'Code']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 165, startY, 100, cellHeight, ['Catch Certificate /', 'Processing Statement']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 265, startY, 50, cellHeight, ['Weight(kg)']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 315, startY, 55, cellHeight, ['Date of unloading']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 370, startY, 60, cellHeight, ['Place of unloading']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 430, startY, 100, cellHeight, ['Details of transport', '(unloaded from)']);
}

const addStorageFacilityTableHeaders = (doc, startY) => {
    let cellHeight = PdfStyle.ROW.HEIGHT * 2;
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, startY, 150, cellHeight, ['Name']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 165, startY, 365, cellHeight, 'Address');
}

const startFacilitySchedulePage = (doc, page, startY) => {
    startSchedulePage(doc, page, startY);
    let cellHeight = PdfStyle.ROW.HEIGHT * 2;
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + 85, '4    Storage facility details continued');
    addStorageFacilityTableHeaders(doc, startY + 105);
    return startY + 105 + cellHeight;
}

const startSchedulePage = (doc, page, startY) => {
    doc.addPage({
        size: 'A4',
        margins: {
            top: PdfStyle.MARGIN.TOP,
            bottom: PdfStyle.MARGIN.BOT,
            left: PdfStyle.MARGIN.LEFT,
            right: PdfStyle.MARGIN.RIGHT,
        },
        layout: 'portrait'
    });
    PdfUtils.heading(doc, 'STORAGE DOCUMENT - SCHEDULE');

    doc.lineWidth(2);
    doc.moveTo(PdfStyle.MARGIN.LEFT, startY + 70).lineTo(560, startY + 70).stroke();
}

const section6 = (doc, data, isSample, buff, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, 'Endorsement by the competent authority');
    let yPos = startY + 12;
    let cellHeight = PdfStyle.ROW.HEIGHT * 5 + 10;

    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 235, PdfStyle.ROW.HEIGHT, 'Name and Address');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 250, yPos, 200, PdfStyle.ROW.HEIGHT, 'Validation');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 450, yPos, 80, PdfStyle.ROW.HEIGHT, 'Date Issued');

    yPos += PdfStyle.ROW.HEIGHT;

    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 235, cellHeight, ['Illegal Unreported and Unregulated (IUU) Fishing Team,',
        'Marine Management Organisation,', 'Lancaster House, Hampshire Court,', 'Newcastle upon Tyne. NE4 7YJ', 'United Kingdom',
        'Tel: 0300 123 1032',
        'Email: ukiuuslo@marinemanagement.org.uk']);

    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 250, yPos, 200, cellHeight);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 450, yPos, 80, cellHeight, PdfUtils.todaysDate());
    if (!isSample) {
        PdfUtils.qrCode(doc, buff, PdfStyle.MARGIN.LEFT + 255, startY + 30);
    }

    yPos += cellHeight + 8;
    doc.font(PdfStyle.FONT.REGULAR);
    doc.fontSize(PdfStyle.FONT_SIZE.SMALL);
    doc.text('Validated by the appropriate competent authority (MMO, Scottish Ministers, Welsh Ministers, Department of Agriculture, Environment and Rural Affairs for Northern Ireland, Marine Resources, Growth and Housing and Environment for Jersey, Sea Fisheries, Committee for Economic Development for Guernsey and Department Environment, Food and Agriculture for the Isle of Man) in accordance with article 15 of Council Regulation (EU) 1005/2008 (as retained under s.3(1) European Union (Withdrawal) Act 2018)', PdfStyle.MARGIN.LEFT + 10, yPos);

}

const section5 = (doc, data, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '5    Exporter details');
    let yPos = startY + 12;
    let cellHeight = PdfStyle.ROW.HEIGHT * 3;

    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 150, PdfStyle.ROW.HEIGHT, 'Company name');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 165, yPos, 265, PdfStyle.ROW.HEIGHT, 'Address');
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 430, yPos, 100, PdfStyle.ROW.HEIGHT, ['Date of acceptance (*)']);

    yPos += PdfStyle.ROW.HEIGHT;

    let exporterAddress = PdfUtils.constructAddress([data.exporter.addressOne, data.exporter.addressTwo,
        data.exporter.townCity, data.exporter.postcode]);

    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 150, cellHeight, data.exporter.exporterCompanyName);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 165, yPos, 265, cellHeight, exporterAddress);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 430, yPos, 100, cellHeight, PdfUtils.todaysDate());

    yPos += cellHeight + 5;
    doc.text('* Date of acceptance by exporter of the veracity of the contents of this document', PdfStyle.MARGIN.LEFT + 15, yPos);

    PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT);
}

const section4 = (doc, data, startY) => {

    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '4    Storage facility details');
    let yPos = startY + 12;
    let cellHeight = PdfStyle.ROW.HEIGHT * 2;

    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 150, PdfStyle.ROW.HEIGHT, ['Name']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 165, yPos, 365, PdfStyle.ROW.HEIGHT, 'Address');

    yPos += cellHeight;

    let arrLength = data.storageFacilities.length;
    if (arrLength > 1) {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos - 15, 515, cellHeight,
            'MULTIPLE STORAGE FACILITIES ( ' + data.storageFacilities.length + ' ) - SEE SCHEDULE');
    } else {
        let sfAddress = '';
        if (0 < arrLength) {
            sfAddress = PdfUtils.constructAddress([data.storageFacilities[0].facilityAddressOne,
                data.storageFacilities[0].facilityAddressTwo,
                data.storageFacilities[0].facilityTownCity,
                data.storageFacilities[0].facilityPostcode]);
        }
        PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 15, yPos - 15, 150, cellHeight, data.storageFacilities[0].facilityName);
        PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 165, yPos - 15, 365, cellHeight, sfAddress);

    }

    PdfUtils.separator(doc, yPos + cellHeight + 8);
}

const section3 = (doc, data, startY) => {

    let vcDetails = '';
    if (data.transport.vehicle) {
        if (data.transport.vehicle.toUpperCase() === 'CONTAINERVESSEL') {
            if (data.transport.vesselName) {
                vcDetails = vcDetails + data.transport.vesselName + ' ';
            }
            if (data.transport.flagState) {
                vcDetails = vcDetails + data.transport.flagState;
            }
        }
        else if (data.transport.vehicle.toUpperCase() === 'DIRECTLANDING') {
            if (data.catches[0].vessel) {
                vcDetails = vcDetails + data.catches[0].vessel + ' ';
            }
            if (data.catches[0].pln) {
                vcDetails = vcDetails + data.catches[0].pln;
            }
        }
    }
    let truckDetails = '';
    if (data.transport.vehicle && data.transport.vehicle.toUpperCase() === 'TRUCK') {
        if (data.transport.nationalityOfVehicle) {
            truckDetails = truckDetails + data.transport.nationalityOfVehicle + ' ';
        }
        if (data.transport.registrationNumber) {
            truckDetails = truckDetails + data.transport.registrationNumber;
        }
    }

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
    PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 250, PdfStyle.ROW.HEIGHT, 'Date / Port or Place of Departure');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 265, yPos, 265, PdfStyle.ROW.HEIGHT, departureDateAndPlace);
    yPos = yPos + PdfStyle.ROW.HEIGHT;
    let cellHeight = PdfStyle.ROW.HEIGHT * 2 - 5;
    PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 250, cellHeight, ['Details of transport:', '(Vessel / flight number / railway bill / truck registration)']);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 265, yPos, 265, cellHeight, transportDetails);
    yPos = yPos + cellHeight;
    PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 250, cellHeight, ['Container numbers (where applicable)']);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 265, yPos, 265, cellHeight, data.transport.containerNumber?data.transport.containerNumber:'');
    PdfUtils.separator(doc, yPos + cellHeight + 8);
}

const section2 = (doc, data, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '2    Consignment details');
    let yPos = startY + 12;

    let cellHeight = PdfStyle.ROW.HEIGHT * 2;

    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 90, cellHeight, ['Exact description of', 'fisheries products']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 105, yPos, 60, cellHeight, ['Commodity', 'Code']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 165, yPos, 100, cellHeight, ['Catch Certificate /', 'Processing Statement']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 265, yPos, 50, cellHeight, ['Weight(kg)']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 315, yPos, 55, cellHeight, ['Date of unloading']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 370, yPos, 60, cellHeight, ['Place of unloading']);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 430, yPos, 100, cellHeight, ['Details of transport', '(unloaded from)']);

    yPos += cellHeight;

    let arrLength = data.catches.length;
    let listLimit = 1;
    if (arrLength > 1) {
        listLimit = 0;
    }

    cellHeight = PdfStyle.ROW.HEIGHT * 3 + 9;

    for (let rowIdx = 0; rowIdx < listLimit; rowIdx++) {
        PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 90, cellHeight, rowIdx < arrLength ? `${data.catches[rowIdx].product}` : '');
        PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 105, yPos, 60, cellHeight, rowIdx < arrLength ? `${data.catches[rowIdx].commodityCode}` : '');
        PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 165, yPos, 100, cellHeight, rowIdx < arrLength ? `${data.catches[rowIdx].certificateNumber}` : '');
        PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 265, yPos, 50, cellHeight, rowIdx < arrLength ? `${data.catches[rowIdx].productWeight}` : '');
        PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 315, yPos, 55, cellHeight, rowIdx < arrLength ? `${data.catches[rowIdx].dateOfUnloading}` : '');
        PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 370, yPos, 60, cellHeight, rowIdx < arrLength ? `${data.catches[rowIdx].placeOfUnloading}` : '');
        PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 430, yPos, 100, cellHeight, rowIdx < arrLength ? `${data.catches[rowIdx].transportUnloadedFrom}` : '');
        yPos += cellHeight;
    }

    if (arrLength > 1) {
        cellHeight = PdfStyle.ROW.HEIGHT * 3 - 9;
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 515, cellHeight,
            'SEE SCHEDULE (' + data.catches.length + ' rows)');
        yPos += cellHeight;
    }
    PdfUtils.separator(doc, yPos + 8);
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
