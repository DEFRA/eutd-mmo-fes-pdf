/* eslint-disable no-magic-numbers */
const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');
const { generateSection11 } = require('./renderExportCert-sections-a');

const IMO_IDENTIFIER_LABEL = 'IMO number or other unique vessel identifier (if applicable)';

const section17 = (doc, _data, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '4    Re-export control');
    let yPos = startY + 12;
    const cellHeight = PdfStyle.ROW.HEIGHT * 2 - 3;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 155, cellHeight, 'Place')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 170, yPos, 110, cellHeight, 'Re-export authorised (*)')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 280, yPos, 110, cellHeight, 'Verification requested (*)')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 390, yPos, 140, cellHeight, ['Re-export declaration', 'number and date']))
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos + cellHeight, 155, PdfStyle.ROW.HEIGHT * 6)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 170, yPos + cellHeight, 110, PdfStyle.ROW.HEIGHT * 6)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 280, yPos + cellHeight, 110, PdfStyle.ROW.HEIGHT * 6)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 390, yPos + cellHeight, 140, PdfStyle.ROW.HEIGHT * 6))
            ])
        ])
    ]));

    yPos += cellHeight + PdfStyle.ROW.HEIGHT * 6 + 5;
    doc.text('* Tick as appropriate', PdfStyle.MARGIN.LEFT + 15, yPos);

    PdfUtils.separator(doc, yPos + 15);
};

const section16 = (doc, _data, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '3    Authority');
    const yPos = startY + 12;
    const cellHeight = PdfStyle.ROW.HEIGHT * 6;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 210, PdfStyle.ROW.HEIGHT, 'Name / title')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 225, yPos, 110, PdfStyle.ROW.HEIGHT, 'Signature')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 335, yPos, 95, PdfStyle.ROW.HEIGHT, 'Date')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 430, yPos, 100, PdfStyle.ROW.HEIGHT, 'Seal'))
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos + PdfStyle.ROW.HEIGHT, 210, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 225, yPos + PdfStyle.ROW.HEIGHT, 110, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 335, yPos + PdfStyle.ROW.HEIGHT, 95, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 430, yPos + PdfStyle.ROW.HEIGHT, 100, cellHeight))
            ])
        ])
    ]));

    PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT + cellHeight + 8);
};

const section15 = (doc, _data, startY) => {

    const yPos = startY;
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '2');

    const cellHeight = PdfStyle.ROW.HEIGHT * 6;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 140, PdfStyle.ROW.HEIGHT, 'Name of re-exporter')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 155, yPos, 215, PdfStyle.ROW.HEIGHT, 'Address')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 370, yPos, 90, PdfStyle.ROW.HEIGHT, 'Signature')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 460, yPos, 70, PdfStyle.ROW.HEIGHT, 'Date'))
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos + PdfStyle.ROW.HEIGHT, 140, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 155, yPos + PdfStyle.ROW.HEIGHT, 215, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 370, yPos + PdfStyle.ROW.HEIGHT, 90, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 460, yPos + PdfStyle.ROW.HEIGHT, 70, cellHeight))
            ])
        ])
    ]));

    PdfUtils.separator(doc, yPos + PdfStyle.ROW.HEIGHT + cellHeight + 8);
};

const section14 = (doc, _data, startY) => {

    const yPos = startY;
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '1    Description of re-exported product');
    const cellHeight = PdfStyle.ROW.HEIGHT * 2 - 3;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 205, cellHeight, 'Species')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 220, yPos, 150, cellHeight, 'Product code')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 370, yPos, 160, cellHeight, ['Balance from total quantity declared', 'in the catch certificate'])),
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos + cellHeight, 205, PdfStyle.ROW.HEIGHT * 10)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 220, yPos + cellHeight, 150, PdfStyle.ROW.HEIGHT * 10)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 370, yPos + cellHeight, 160, PdfStyle.ROW.HEIGHT * 10)),
            ])
        ])
    ]));

    PdfUtils.separator(doc, (yPos + cellHeight) + (PdfStyle.ROW.HEIGHT * 10) + 8);
};

const section13 = (doc, _data, startY) => {

    doc.fontSize(PdfStyle.FONT_SIZE.MEDIUM);
    doc.addStructure(doc.struct('H3', {}, () => {
        doc.text('(ii) RE-EXPORT CERTIFICATE', PdfStyle.MARGIN.LEFT, startY);
    }));
    doc.lineWidth(2);
    doc.moveTo(180, startY + 4).lineTo(560, startY + 4).stroke();

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT, startY + 20, 'Certificate Number');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 95, startY + 18, 125, PdfStyle.ROW.HEIGHT);

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 235, startY + 20, 'Date');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 265, startY + 18, 70, PdfStyle.ROW.HEIGHT);

    PdfUtils.label(doc, PdfStyle.MARGIN.LEFT + 350, startY + 20, 'Member State');
    PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 420, startY + 18, 110, PdfStyle.ROW.HEIGHT);

    PdfUtils.separator(doc, startY + 40);
};

const section12 = (doc, _data, startY) => {
    let yPos = startY + PdfStyle.ROW.HEIGHT * 3;
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '12');

    const headerHeight =  PdfStyle.ROW.HEIGHT * 2 - 3;
    const rowHeight = PdfStyle.ROW.HEIGHT * 7;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 150, headerHeight, 'Import Control Authority')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 165, yPos, 105, headerHeight, 'Place')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 270, yPos, 80, headerHeight, ['Importation', 'authorised*'])),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 350, yPos, 80, headerHeight, ['Importation', 'suspended*'])),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 430, yPos, 100, headerHeight, ['Verification requested', '– date']))
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos + headerHeight, 150, rowHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 165, yPos + headerHeight, 105, rowHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 270, yPos + headerHeight, 80, rowHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 350, yPos + headerHeight, 80, rowHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 430, yPos + headerHeight, 100, rowHeight))
            ])
        ])
    ]));

    yPos += headerHeight + rowHeight;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 150, headerHeight, 'Customs declaration (if issued)')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 165, yPos, 185, headerHeight, 'Number')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 350, yPos, 80, headerHeight, 'Date')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 430, yPos, 100, headerHeight, 'Place')),
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos + headerHeight, 150,  rowHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 165, yPos + headerHeight, 185,  rowHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 350, yPos + headerHeight, 80,  rowHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 430, yPos + headerHeight, 100,  rowHeight)),
            ])
        ])
    ]));

    yPos += headerHeight + rowHeight + 5;

    doc.text('* Tick as appropriate', PdfStyle.MARGIN.LEFT + 15, yPos);
};

const section11 = (doc, data, startY) => {
    generateSection11(doc, data, startY);
};

const section10 = (doc, _data, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + 12, '10    Transport details: See Appendix I');
    PdfUtils.separator(doc, startY + 36);
};

const section9 = (doc, data, isSample, buff, startY) => {
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '9    Flag State Authority Validation:');
    const yPos = startY + 12;
    const cellHeight = PdfStyle.ROW.HEIGHT * 2 - 3;

    let dateIssued = PdfUtils.todaysDate();
    if (data.isBlankTemplate) {
        dateIssued = '';
    }

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 250, PdfStyle.ROW.HEIGHT, 'Date Issued')),
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=>  PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos + PdfStyle.ROW.HEIGHT, 250, cellHeight, dateIssued)),
            ])
        ])
    ]));

    // QR code positioned to the right of Date Issued field (80px right of field end)
    const qrXPosition = PdfStyle.MARGIN.LEFT + 15 + 250 + 80; // Date Issued field left + width + 80px
    
    if (!data.isBlankTemplate && !isSample) {
        PdfUtils.qrCode(doc, buff, qrXPosition, startY);
    }

    PdfUtils.separator(doc, startY + 66);
};

const section8 = (doc, data, _isSample, _buff, startY) => {

    let yPos = startY;
    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '8');

    const cellHeight = PdfStyle.ROW.HEIGHT * 7 + 2;

    const exporterAddress = PdfUtils.constructAddress([
        data.exporter?.addressOne, 
        data.exporter?.addressTwo,
        data.exporter?.townCity, 
        data.exporter?.postcode
    ]) ?? '';
    const exporterFullName = data.exporter?.exporterFullName ?? '';
    const exporterCompanyName = data.exporter?.exporterCompanyName ?? '';

    let dateOfAcceptance = PdfUtils.todaysDate();
    if (data.isBlankTemplate) {
        dateOfAcceptance = '';
    }

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 230, PdfStyle.ROW.HEIGHT, 'Name and address of Exporter')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 245, yPos, 115, PdfStyle.ROW.HEIGHT, 'Signature')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 360, yPos, 95, PdfStyle.ROW.HEIGHT, 'Date of acceptance(*)')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 455, yPos, 75, PdfStyle.ROW.HEIGHT, 'Seal'))
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 15, yPos + PdfStyle.ROW.HEIGHT, 230, cellHeight,
                    [exporterFullName, exporterCompanyName, exporterAddress])),
                doc.struct('TD', ()=> PdfUtils.wrappedField(doc, PdfStyle.MARGIN.LEFT + 245, yPos + PdfStyle.ROW.HEIGHT, 115, cellHeight, exporterFullName)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 360, yPos + PdfStyle.ROW.HEIGHT, 95, cellHeight, dateOfAcceptance)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 455, yPos + PdfStyle.ROW.HEIGHT, 75, cellHeight))
            ])
        ])
    ]));

    yPos += cellHeight + 5 + PdfStyle.ROW.HEIGHT;
    doc.text('* Date of acceptance by exporter of the veracity of the contents of this document', PdfStyle.MARGIN.LEFT + 15, yPos);

    PdfUtils.separator(doc, startY + 137);
};

const section7 = (doc, _data, startY) => {

    PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY, '7    Transhipment and/or landing authorisation within a port area:');
    let yPos = startY + 12;
    let cellHeight = PdfStyle.ROW.HEIGHT  * 2.5 - 6;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 65, cellHeight, 'Name')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 80, yPos, 60, cellHeight, 'Authority')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 140, yPos, 60, cellHeight, 'Signature')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 200, yPos, 65, cellHeight, 'Address')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 265, yPos, 60, cellHeight, 'Tel.')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 325, yPos, 75, cellHeight, 'Port of landing (as appropriate)')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 400, yPos, 130, cellHeight, 'Date of landing (as appropriate)')),
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos + cellHeight, 65, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 80, yPos + cellHeight, 60, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 140, yPos + cellHeight, 60, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 200, yPos + cellHeight, 65, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 265, yPos + cellHeight, 60, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 325, yPos + cellHeight, 75, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 400, yPos + cellHeight, 130, cellHeight)),
            ])
        ])
    ]));
    yPos += cellHeight + 32;
    cellHeight = PdfStyle.ROW.HEIGHT  * 4.5 - 6;
    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 15, yPos, 185, cellHeight, IMO_IDENTIFIER_LABEL)),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 200, yPos, 125, cellHeight, 'Port of transhipment (as appropriate)')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 325, yPos, 75, cellHeight, 'Date of transhipment (as appropriate)')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 400, yPos, 50, cellHeight, 'Name and registration number of receiving vessel')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 450, yPos, 40, cellHeight, 'Seal (Stamp)')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + 490, yPos, 40, cellHeight, 'Seal (Stamp)'))
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 15, yPos + cellHeight, 185, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 200, yPos + cellHeight, 125, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 325, yPos + cellHeight, 75, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 400, yPos + cellHeight, 50, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 450, yPos + cellHeight, 40, cellHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + 490, yPos + cellHeight, 40, cellHeight))
            ])
        ])
    ]));
     PdfUtils.separator(doc, startY + 209);
};


module.exports = {
    section7, section8, section9, section10, section11,
    section12, section13, section14, section15, section16, section17,
};
