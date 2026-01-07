const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const CommonUtils = require('../utils/common-utils');

const getSectionContinuedTitle = (sectionNumber, type) => {
    const typeLabel = type === 'arrival' ? 'arrival to' : 'departure from';
    return `${sectionNumber}.    Consignment details (upon ${typeLabel} the place of storage) continued`;
};

const PAGE_HEIGHT = 780;
const GAP = 15;
let currentPage = 1;
 
const formatCurrentDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
};

const renderStorageNote = async (data, isSample, uri, stream) => {
    currentPage = 1; 
    
    let buff = null;
    if (!isSample) {
        buff = await PdfUtils.generateQRCode(uri);
    }

    const dateOfSubmission = formatCurrentDate();

    const doc = CommonUtils.createBaseDocument(uri);
    doc.pipe(stream);
 
    PdfUtils.heading(doc, 'NON-MANIPULATION DOCUMENT');
    let startY = PdfStyle.MARGIN.TOP + 65;
 
    renderAllSections(doc, data, isSample, buff, startY, dateOfSubmission);
 
    if (isSample) CommonUtils.addSampleWatermark(doc);
    PdfUtils.endOfPage(doc, currentPage);
 
    doc.end();
};
 
const renderAllSections = (doc, data, isSample, buff, initialStartY, dateOfSubmission) => {
    let startY = initialStartY;
 
    const ensureSpaceAndMaybeNewPage = (estHeight) => {
        if (startY + estHeight > PAGE_HEIGHT) {
            if (isSample) CommonUtils.addSampleWatermark(doc);
            PdfUtils.endOfPage(doc, currentPage);
            doc.addPage();
            currentPage += 1;
            if (isSample) CommonUtils.addSampleWatermark(doc);
            startY = PdfStyle.MARGIN.TOP + 25;
        }
    };
 
    // Section 1
    const section1Height = estimateSection1();
    ensureSpaceAndMaybeNewPage(section1Height);
    section1(doc, data, isSample, startY);
    startY = startY + section1Height + GAP;
 
    // Section 2
    const section2Height = estimateSection2();
    ensureSpaceAndMaybeNewPage(section2Height);
    section2(doc, data, startY);
    startY = startY + section2Height + GAP;
 
    // Section 3
    const section3Height = estimateConsignmentSection();
    ensureSpaceAndMaybeNewPage(section3Height);
    section3(doc, data, startY);
    startY = startY + section3Height + GAP;
 
    // Section 4
    const section4Height = estimateSection4();
    ensureSpaceAndMaybeNewPage(section4Height);
    section4(doc, data, startY);
    
    startY = startY + section4Height + GAP;
 
    // Section 5
    const section5Height = estimateConsignmentSection();
    ensureSpaceAndMaybeNewPage(section5Height);
    section5(doc, data, startY);
    startY = startY + section5Height + GAP;
 
    // Section 6
    const section6Height = estimateSection6();
    ensureSpaceAndMaybeNewPage(section6Height);
    section6(doc, data, startY);
    startY = startY + section6Height + GAP + 5;

    // Section 7
    const section7Height = estimateSection7();
    ensureSpaceAndMaybeNewPage(section7Height);
    section7(doc, data, startY, dateOfSubmission);
    startY = startY + section7Height + GAP + 5;

    // Section 8
    const section8Height = estimateSection8();
    ensureSpaceAndMaybeNewPage(section8Height);
    section8(doc, data, isSample, buff, startY);
    startY = startY + section8Height;
     // Section 3 Continued  
    sectionContinued(doc, data, isSample, '3', 'arrival');
   // Section 5 Continued 
    sectionContinued(doc, data, isSample, '5', 'departure');

    return startY;
};

const estimateSection1 = () => 120;
 
const estimateSection2 = () => {
    const rows = [
        'arrivalTransport.departureCountry',
        'arrivalTransport.departureDate',
        'arrivalTransport.departurePort',
        'arrivalTransport.vehicle',
        'arrivalTransport.containerNumbers',
        'facilityArrivalDate',
        'arrivalTransport.placeOfUnloading'
    ];
    let sum = 0;
    rows.forEach(key => {
        const height = shouldUseExpandedHeight(key) ? PdfStyle.ROW.HEIGHT * 6 : PdfStyle.ROW.HEIGHT * 2;
        sum += (height + 10);
    });
    return 12 + sum + 8;
};

const estimateConsignmentSection = () => {
    const headerCellHeight = PdfStyle.ROW.HEIGHT * 2.8;
    const cellHeight = PdfStyle.ROW.HEIGHT * 3;
    return 12 + headerCellHeight + (3 * cellHeight) + 5 + PdfStyle.ROW.HEIGHT;
};
 
const estimateSection4 = () => {
    const cellHeight = PdfStyle.ROW.HEIGHT * 2;
    return 12 + cellHeight + cellHeight + 15;
};
 
const estimateSection6 = () => {
    const rows = [
        'transport.exportDate',
        'transport.departurePlace',
        'transport.vehicle',
        'transport.containerNumbers',
        'transport.exportedTo.officialCountryName'
    ];
    let sum = 0;
    rows.forEach(key => {
        const height = shouldUseExpandedHeight(key) ? PdfStyle.ROW.HEIGHT * 3.5 : PdfStyle.ROW.HEIGHT * 2;
        sum += (height + 10);
    });
    return 12 + sum + 8;
};

const estimateSection7 = () => {
    const headerHeight = PdfStyle.ROW.HEIGHT * 2 - 5;
    const contentHeight = PdfStyle.ROW.HEIGHT * 3 - 9;
    const footerHeight = PdfStyle.ROW.HEIGHT;
    return 12 + headerHeight + contentHeight + 5 + footerHeight;
};

const estimateSection8 = () => {
    const cellHeight = PdfStyle.ROW.HEIGHT * 5 + 10;
    return 12 + cellHeight + 8 + 60;
};
 
const section3 = (doc, data, startY) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '3.    Consignment details (upon arrival to the place of storage)');
    }));
    createConsignmentTable(doc, data, startY + 12, 'arrival', 3);
};

const sectionContinued = (doc, data, isSample, sectionNumber, type) => {
    const headerCellHeight = PdfStyle.ROW.HEIGHT * 2.8;
    const cellHeight = PdfStyle.ROW.HEIGHT * 3;
    const titleHeight = 12; 
    const availableHeight = PAGE_HEIGHT - PdfStyle.MARGIN.TOP - 25 - titleHeight;
    const rowsPerPage = Math.floor((availableHeight - headerCellHeight - 5 - PdfStyle.ROW.HEIGHT) / cellHeight);
    
    const allCatches = data?.catches || [];
    const remainingCatches = allCatches.slice(3);
    
    const sectionTitle = getSectionContinuedTitle(sectionNumber, type);
    
    for (let pageNum = 0; pageNum < 2; pageNum++) {
        if (isSample) CommonUtils.addSampleWatermark(doc);
        PdfUtils.endOfPage(doc, currentPage);
        doc.addPage();
        currentPage += 1;
        if (isSample) CommonUtils.addSampleWatermark(doc);
        
        const startY = PdfStyle.MARGIN.TOP + 25;
        
        doc.addStructure(doc.struct('H3', () => {
            PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, sectionTitle);
        }));
        
        const startIdx = pageNum * rowsPerPage;
        const endIdx = startIdx + rowsPerPage;
        const pageData = {
            catches: remainingCatches.slice(startIdx, endIdx)
        };
        
        if (pageData.catches.length === 0 && remainingCatches.length === 0) {
            pageData.catches = [];
        }
        
        createConsignmentTable(doc, pageData, startY + titleHeight, type, rowsPerPage, false);
    }
};

const section5 = (doc, data, startY) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '5.    Consignment details (upon departure from the place of storage)');
    }));
    createConsignmentTable(doc, data, startY + 12, 'departure', 3);
};
 
const getWeightLabel = (type) => type === 'arrival' ? 'entering' : 'departing';
const getWeighField = (type) => type === 'arrival' ? 'netWeightProductArrival' : 'netWeightProductDeparture';

const createConsignmentTable = (doc, data, startY, type, maxRows = null, showSeparator = true) => {
    const yPos = startY;
    const cellHeight = PdfStyle.ROW.HEIGHT * 3;
    const headerCellHeight = PdfStyle.ROW.HEIGHT * 2.8;
    const colWidths = [85, 65, 45, 135, 80, 105];
 
    const weightLabel = getWeightLabel(type);
    const weightField = getWeighField(type);
 
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
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, colWidths[0], headerCellHeight, 'Description of fisheries products');
    myTableHeadOne.end();

    const myTableHeadTwo = doc.struct('TH');
    myTableHeadRow.add(myTableHeadTwo);
    const myTableHeadTwoContent = doc.markStructureContent('TH');
    myTableHeadTwo.add(myTableHeadTwoContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15 + colWidths[0], yPos, colWidths[1], headerCellHeight, 'Species');
    myTableHeadTwo.end();

    const myTableHeadThree = doc.struct('TH');
    myTableHeadRow.add(myTableHeadThree);
    const myTableHeadThreeContent = doc.markStructureContent('TH');
    myTableHeadThree.add(myTableHeadThreeContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15 + colWidths[0] + colWidths[1], yPos, colWidths[2], headerCellHeight, 'Product Code');
    myTableHeadThree.end();

    const myTableHeadFour = doc.struct('TH');
    myTableHeadRow.add(myTableHeadFour);
    const myTableHeadFourContent = doc.markStructureContent('TH');
    myTableHeadFour.add(myTableHeadFourContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15 + colWidths[0] + colWidths[1] + colWidths[2], yPos, colWidths[3], headerCellHeight, ['Catch Certificate / Processing', 'Statement/non-manipulation ', 'declaration number(s) (if',  'applicable)']);
    myTableHeadFour.end();

    const myTableHeadFive = doc.struct('TH');
    myTableHeadRow.add(myTableHeadFive);
    const myTableHeadFiveContent = doc.markStructureContent('TH');
    myTableHeadFive.add(myTableHeadFiveContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], yPos, colWidths[4], headerCellHeight, ['Net weight in kg', `${weightLabel} the`, 'place of storage']);
    myTableHeadFive.end();

    const myTableHeadSix = doc.struct('TH');
    myTableHeadRow.add(myTableHeadSix);
    const myTableHeadSixContent = doc.markStructureContent('TH');
    myTableHeadSix.add(myTableHeadSixContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], yPos, colWidths[5], headerCellHeight, ['Net fishery product', `weight in kg ${weightLabel}`, 'the place of storage']);
    myTableHeadSix.end();

    myTableHeadRow.end();
    myTableHead.end();

    const tableBody = doc.struct('TBody');
    myTable.add(tableBody);

    const allCatches = data?.catches || [];
    const totalRowsToRender = maxRows === null ? Math.max(allCatches.length, 1) : maxRows;

    for (let idx = 0; idx < totalRowsToRender; idx++) {
        const rowY = yPos + headerCellHeight + (idx * cellHeight);
        const c = idx < allCatches.length ? allCatches[idx] : null;
        
        const tableBodyRow = doc.struct('TR');
        tableBody.add(tableBodyRow);

        const TdOne = doc.struct('TD');
        tableBodyRow.add(TdOne);
        const TdOneContent = doc.markStructureContent('TD');
        TdOne.add(TdOneContent);
        PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 15, rowY, colWidths[0], cellHeight, c?.productDescription || ' ');
        TdOne.end();

        const TdTwo = doc.struct('TD');
        tableBodyRow.add(TdTwo);
        const TdTwoContent = doc.markStructureContent('TD');
        TdTwo.add(TdTwoContent);
        PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 15 + colWidths[0], rowY, colWidths[1], cellHeight, c?.product || ' ');
        TdTwo.end();

        const TdThree = doc.struct('TD');
        tableBodyRow.add(TdThree);
        const TdThreeContent = doc.markStructureContent('TD');
        TdThree.add(TdThreeContent);
        PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 15 + colWidths[0] + colWidths[1], rowY, colWidths[2], cellHeight, c?.commodityCode || ' ');
        TdThree.end();

        const TdFour = doc.struct('TD');
        tableBodyRow.add(TdFour);
        const TdFourContent = doc.markStructureContent('TD');
        TdFour.add(TdFourContent);
        PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 15 + colWidths[0] + colWidths[1] + colWidths[2], rowY, colWidths[3], cellHeight, c?.certificateNumber || ' ');
        TdFour.end();

        const TdFive = doc.struct('TD');
        tableBodyRow.add(TdFive);
        const TdFiveContent = doc.markStructureContent('TD');
        TdFive.add(TdFiveContent);
        PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 15 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], rowY, colWidths[4], cellHeight, c?.[weightField] || ' ');
        TdFive.end();

        const TdSix = doc.struct('TD');
        tableBodyRow.add(TdSix);
        const TdSixContent = doc.markStructureContent('TD');
        TdSix.add(TdSixContent);
        PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 15 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], rowY, colWidths[5], cellHeight, c?.netWeightFisheryProductDeparture || ' ');
        TdSix.end();

        tableBodyRow.end();
    }

    doc.endMarkedContent();
    tableBody.end();
    myTable.end();
 
    if (showSeparator) {
        const rowsCount = maxRows === null ? (data?.catches?.length || 1) : maxRows;
        const finalY = yPos + headerCellHeight + (rowsCount * cellHeight) + 5;
        doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
            PdfUtils.separator(doc, finalY + PdfStyle.ROW.HEIGHT);
        }));
    }
};
 
 
const formatAddress = (obj) => {
    const { addressOne, townCity, postcode } = obj;
    return [
        addressOne,
        townCity,
        postcode
    ].filter(Boolean).join('\n');
};

const section7 = (doc, data, startY, dateOfSubmission) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '7.    Exporter details');
    }));
    let yPos = startY + 12;
    let cellHeight = PdfStyle.ROW.HEIGHT * 2 - 5;

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
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 150, cellHeight, 'Company name');
    myTableHeadOne.end();

    const myTableHeadTwo = doc.struct('TH');
    myTableHeadRow.add(myTableHeadTwo);
    const myTableHeadTwoContent = doc.markStructureContent('TH');
    myTableHeadTwo.add(myTableHeadTwoContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 165, yPos, 200, cellHeight, 'Address');
    myTableHeadTwo.end();

    const myTableHeadThree = doc.struct('TH');
    myTableHeadRow.add(myTableHeadThree);
    const myTableHeadThreeContent = doc.markStructureContent('TH');
    myTableHeadThree.add(myTableHeadThreeContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 365, yPos, 165, cellHeight, ['Date of submission of this document by', 'exporter to the competent authority']);
    myTableHeadThree.end();

    myTableHeadRow.end();
    myTableHead.end();

    const tableBody = doc.struct('TBody');
    myTable.add(tableBody);

    const tableBodyRow = doc.struct('TR');
    tableBody.add(tableBodyRow);

    const TdOne = doc.struct('TD');
    tableBodyRow.add(TdOne);
    const TdOneContent = doc.markStructureContent('TD');
    TdOne.add(TdOneContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 15, yPos + cellHeight, 150, PdfStyle.ROW.HEIGHT * 3, data.exporter.exporterCompanyName);
    TdOne.end();

    const TdTwo = doc.struct('TD');
    tableBodyRow.add(TdTwo);
    const TdTwoContent = doc.markStructureContent('TD');
    TdTwo.add(TdTwoContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 165, yPos + cellHeight, 200, PdfStyle.ROW.HEIGHT * 3, formatAddress(data.exporter));
    TdTwo.end();

    const TdThree = doc.struct('TD');
    tableBodyRow.add(TdThree);
    const TdThreeContent = doc.markStructureContent('TD');
    TdThree.add(TdThreeContent);
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 365, yPos + cellHeight, 165, PdfStyle.ROW.HEIGHT * 3, dateOfSubmission);
    TdThree.end();

    tableBodyRow.end();
    doc.endMarkedContent();
    tableBody.end();
    myTable.end();

    yPos += cellHeight + PdfStyle.ROW.HEIGHT * 3 + 5;

    doc.addStructure(doc.struct('P', () => {
        doc.text('* Date of acceptance by exporter of the veracity of the contents of this document', PdfStyle.MARGIN.LEFT + 15, yPos);
    }));

    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT + 4);
    }));
};

const section6 = (doc, data, startY) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '6.  Departure from the place of storage - details');
    }));

    const rows = [
        { label: 'Date of departure from the place of storage (reloading)', key: 'transport.exportDate' },
        { label: 'Last port, airport or point of departure from the country of storage', key: 'transport.departurePlace' },
        { label: 'Details of transport (Vessel name and flag / flight number - airway bill / railway bill / freight bill - truck registration number)', key: 'transport.vehicle' },
        { label: 'Container number(s) (where applicable)', key: 'transport.containerNumbers' },
        { label: 'Point of destination: Port, airport or other point of destination', key: 'transport.pointOfDestination' }
    ];

    renderTransportDetailsTable(doc, startY + 12, rows, data, false);
};

const section8 = (doc, data, isSample, buff, startY) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '8    Declaration by the competent authority');
    }));
    let yPos = startY + 50;
    let cellHeight = PdfStyle.ROW.HEIGHT * 5 + 10;

    const infoText = 'I hereby declare that the information provided in this document is correct and that the products concerned did not undergo operations other than unloading, reloading or any operation designed to preserve them in good and genuine condition, and remained under the surveillance of the declaring authority.';
    doc.addStructure(doc.struct('P', () => {
        doc.font(PdfStyle.FONT.REGULAR).fontSize(PdfStyle.FONT_SIZE.SMALL);
        doc.text(infoText, PdfStyle.MARGIN.LEFT, startY + 14, { width: 520 });
    }));

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
        'Marine Management Organisation,', 'Tyneside House, Skinnerburn Rd,', 'Newcastle upon Tyne. NE4 7AR', 'United Kingdom',
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
        PdfUtils.qrCode(doc, buff, PdfStyle.MARGIN.LEFT + 255, startY + 75);
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
    doc.addStructure(doc.struct('P', () => {
        doc.font(PdfStyle.FONT.REGULAR);
        doc.fontSize(PdfStyle.FONT_SIZE.SMALL);
        doc.text('Validated by the appropriate competent authority (MMO, Scottish Ministers, Welsh Ministers, Department of Agriculture, Environment and Rural Affairs for Northern Ireland, Marine Resources, Growth and Housing and Environment for Jersey, Sea Fisheries, Committee for Economic Development for Guernsey and Department Environment, Food and Agriculture for the Isle of Man) in accordance with article 15 of Council Regulation (EU) 1005/2008 (as retained under s.3(1) European Union (Withdrawal) Act 2018)', PdfStyle.MARGIN.LEFT + 10, yPos);
    }));
}

const section4 = (doc, data, startY) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '4.    Storage facility details');
    }));
    let yPos = startY + 12;
    let cellHeight = PdfStyle.ROW.HEIGHT * 3;
    let subCellHeight = PdfStyle.ROW.HEIGHT;
 
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
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 110, cellHeight, ['Name']);
    tableHeadOne.end();
 
    const tableHeadTwo = doc.struct('TH');
    tableHeadRow.add(tableHeadTwo);
    const tableHeadTwoContent = doc.markStructureContent('TH');
    tableHeadTwo.add(tableHeadTwoContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 125, yPos, 145, cellHeight, 'Address');
    tableHeadTwo.end();
 
    const tableHeadThree = doc.struct('TH');
    tableHeadRow.add(tableHeadThree);
    const tableHeadThreeContent = doc.markStructureContent('TH');
    tableHeadThree.add(tableHeadThreeContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 270, yPos, 110, cellHeight, ['Approval number', '(if applicable)']);
    tableHeadThree.end();
 
    const tableHeadFour = doc.struct('TH');
    tableHeadRow.add(tableHeadFour);
    const tableHeadFourContent = doc.markStructureContent('TH');
    tableHeadFour.add(tableHeadFourContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 380, yPos, 150, cellHeight, ['Stored as', '(tick as appropriate)']);
    tableHeadFour.end();
 
    tableHeadRow.end();
    const tableHeadSubRow = doc.struct('TR');
    tableHead.add(tableHeadSubRow);
 
    const tableHeadFourSubOne = doc.struct('TH');
    tableHeadSubRow.add(tableHeadFourSubOne);
    const tableHeadFourSubOneContent = doc.markStructureContent('TH');
    tableHeadFourSubOne.add(tableHeadFourSubOneContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 380, yPos + 30, 50, subCellHeight, 'Chilled');
    tableHeadFourSubOne.end();
 
    const tableHeadFourSubTwo = doc.struct('TH');
    tableHeadSubRow.add(tableHeadFourSubTwo);
    const tableHeadFourSubTwoContent = doc.markStructureContent('TH');
    tableHeadFourSubTwo.add(tableHeadFourSubTwoContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 430, yPos + 30, 50, subCellHeight, 'Frozen');
    tableHeadFourSubTwo.end();
 
    const tableHeadFourSubThree = doc.struct('TH');
    tableHeadSubRow.add(tableHeadFourSubThree);
    const tableHeadFourSubThreeContent = doc.markStructureContent('TH');
    tableHeadFourSubThree.add(tableHeadFourSubThreeContent);
    PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 480, yPos + 30, 50, subCellHeight, 'Other');
    tableHeadFourSubThree.end();
 
    tableHeadSubRow.end();
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
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 15, yPos - 15, 110, cellHeight, data.facilityName);
    TdOne.end();
 
    const TdTwo = doc.struct('TD');
    tableBodyRow.add(TdTwo);
    const TdTwoContent = doc.markStructureContent('TD');
    TdTwo.add(TdTwoContent)
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 125, yPos - 15, 145, cellHeight, sfAddress);
    TdTwo.end();
    
    const TdThree = doc.struct('TD');
    tableBodyRow.add(TdThree);
    const TdThreeContent = doc.markStructureContent('TD');
    TdThree.add(TdThreeContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 270, yPos - 15, 110, cellHeight, data.facilityApprovalNumber);
    TdThree.end();
 
    const TdFourSubOne = doc.struct('TD');
    tableBodyRow.add(TdFourSubOne);
    const TdFourSubOneContent = doc.markStructureContent('TD');
    TdFourSubOne.add(TdFourSubOneContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 380, yPos, 50, cellHeight - 15, data.facilityStorage === "Chilled" ? "Chilled" : "");
    TdFourSubOne.end();
 
    const TdFourSubTwo = doc.struct('TD');
    tableBodyRow.add(TdFourSubTwo);
    const TdFourSubTwoContent = doc.markStructureContent('TD');
    TdFourSubTwo.add(TdFourSubTwoContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 430, yPos, 50, cellHeight - 15, data.facilityStorage === "Frozen" ? "Frozen" : "");
    TdFourSubTwo.end();
 
    const TdFourSubThree = doc.struct('TD');
    tableBodyRow.add(TdFourSubThree);
    const TdFourSubThreeContent = doc.markStructureContent('TD');
    TdFourSubThree.add(TdFourSubThreeContent);
    PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 480, yPos, 50, cellHeight - 15, data.facilityStorage === "Other" ? "Other" : "");
    TdFourSubThree.end();
 
    tableBodyRow.end();
    doc.endMarkedContent();
    tableBody.end();
    myTable.end();
 
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.separator(doc, yPos + (PdfStyle.ROW.HEIGHT * 2) + 8);
    }));
}

const getNestedValue = (obj, path) => {  
    const result = path
        .split('.')
        .reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : ''), obj);
    
    return Array.isArray(result) ? result.join(', ') : result;
};
 
const isVehicleTransportKey = (key) => 
    key === 'arrivalTransport.vehicle' || key === 'transport.vehicle';

const isContainerNumberKey = (key) =>
    key === 'arrivalTransport.containerNumbers' || key === 'transport.containerNumbers';

const shouldUseExpandedHeight = (key) =>
    isVehicleTransportKey(key) || isContainerNumberKey(key);

const getTransportType = (transport) => 
    (transport.vehicle || '').toLowerCase();

const formatTransportValue = (rowKey, data, isArrival = true) => {
    if (!isVehicleTransportKey(rowKey)) {
        return getNestedValue(data, rowKey);
    }
    
    const transport = isArrival ? (data.arrivalTransport || {}) : (data.transport || {});
    const type = getTransportType(transport);
 
    switch (type) {
        case 'containervessel':
            return `Vessel: ${transport.vesselName || ''} - ${transport.flagState || ''}`;
        case 'truck':
            return `Truck: ${transport.registrationNumber || ''} - ${transport.freightBillNumber || ''}`;
        case 'train':
            return `Train: ${transport.railwayBillNumber || ''} - ${transport.freightBillNumber || ''}`;
        case 'plane':
            return `Plane: ${transport.flightNumber || ''} - ${transport.airwayBillNumber || ''} - ${transport.freightBillNumber || ''}`;
        default:
            return '';
    }
};

const renderTransportDetailsTable = (doc, startY, rows, data, isArrival) => {
    let yPos = startY;
    const col1Width = 220;
    const col2Width = 295;

    const myTable = doc.struct('Table');
    doc.addStructure(myTable);

    const tableBody = doc.struct('TBody');
    myTable.add(tableBody);

    rows.forEach(row => {
        const heightMultiplier = isArrival ? 6 : 3.5;
        const height = shouldUseExpandedHeight(row.key) ? PdfStyle.ROW.HEIGHT * heightMultiplier : PdfStyle.ROW.HEIGHT * 2;
        const value = formatTransportValue(row.key, data, isArrival);

        const tableRow = doc.struct('TR');
        tableBody.add(tableRow);

        const headerCell = doc.struct('TH');
        tableRow.add(headerCell);
        const headerCellContent = doc.markStructureContent('TH');
        headerCell.add(headerCellContent);
        PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT + 15, yPos, col1Width, height + 10, row.label);
        headerCell.end();

        const dataCell = doc.struct('TD');
        tableRow.add(dataCell);
        const dataCellContent = doc.markStructureContent('TD');
        dataCell.add(dataCellContent);
        
        if (shouldUseExpandedHeight(row.key)) {
            PdfUtils.wrappedFieldNoEllipsis(doc, PdfStyle.MARGIN.LEFT + 235, yPos, col2Width, height + 10, value);
        } else {
            PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 235, yPos, col2Width, height + 10, value);
        }
        dataCell.end();

        tableRow.end();

        yPos += height + 10;
    });

    doc.endMarkedContent();
    tableBody.end();
    myTable.end();

    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        PdfUtils.separator(doc, yPos + 8);
    }));
};
 
const section2 = (doc, data, startY) => {
    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '2.  Arrival to the place of storage - details');
    }));
    
    const rows = [
        { label: 'Place of departure of the product', key: 'arrivalTransport.departureCountry' },
        { label: 'Date of departure:', key: 'arrivalTransport.departureDate' },
        { label: 'Last port, airport or other point of departure before arrival to the country of storage', key: 'arrivalTransport.departurePort' },
        { label: 'Details of transport (Vessel name and flag / flight number - airway bill / railway bill / freight bill - truck registration number)', key: 'arrivalTransport.vehicle' },
        { label: 'Container number(s) (where applicable)', key: 'arrivalTransport.containerNumbers' },
        { label: 'Date of arrival to the place of storage (unloading)', key: 'facilityArrivalDate' },
        { label: 'Place of storage', key: 'arrivalTransport.placeOfUnloading' }
    ];
    
    renderTransportDetailsTable(doc, startY + 12, rows, data, true);
}
 
const section1 = (doc, data, isSample, startY) => {
    let documentNumber = '';
    if (isSample) {
        documentNumber = '###-####-##-#########';
    } else {
        documentNumber = data.documentNumber;
    }
 
    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        doc.lineWidth(2);
        doc.moveTo(PdfStyle.MARGIN.LEFT, startY + 4).lineTo(560, startY + 4).stroke();
    }));
 
    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT, startY + 17, 'Document Number');
    }));
    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 95, startY + 15, 160, PdfStyle.ROW.HEIGHT, documentNumber);
    }));

    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.label(doc, 300, startY + 17, 'Declaring Authority');
    }));
    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 380, startY + 15, 150, PdfStyle.ROW.HEIGHT, 'Marine Management Organisation');
    }));    doc.addStructure(doc.struct('H3', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + 40, '1.    Name');
    }));
    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 65, startY + 38, 465, PdfStyle.ROW.HEIGHT, 'Illegal Unreported and Unregulated (IUU) Fishing Team');
    }));

    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 15, startY + 60, 'Address');
    }));
    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 65, startY + 58, 465, PdfStyle.ROW.HEIGHT * 2 + 5, 'Tyneside House, Skinnerburn Rd, Newcastle upon Tyne, United Kingdom. NE4 7AR');
    }));
 
    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 65, startY + 100, 'Tel.');
    }));
    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 90, startY + 98, 200, PdfStyle.ROW.HEIGHT, '0300 123 1032');
    }));

    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 300, startY + 100, 'Email');
    }));
    doc.addStructure(doc.struct('Span', () => {
        PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 330, startY + 98, 200, PdfStyle.ROW.HEIGHT, 'ukiuuslo@marinemanagement.org.uk');
    }));    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        doc.lineWidth(0.75);
        doc.moveTo(0, startY + 120).lineTo(600, startY + 120).dash(2, {space: 2}).stroke();
    }));
};
 
module.exports = renderStorageNote;
module.exports.getSectionContinuedTitle = getSectionContinuedTitle;
