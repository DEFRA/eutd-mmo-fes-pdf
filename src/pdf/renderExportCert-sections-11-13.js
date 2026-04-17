const PdfStyle = require('./mmoPdfStyles');
const PdfUtils = require('./mmoPdfUtils');

const renderSection11ImporterTables = (doc, yPos, headerHeight, rowHeight) => {
    const COL1_OFFSET = 15;
    const COL1_WIDTH = 250;
    const COL2_OFFSET = 265;
    const COL2_WIDTH = 95;
    const COL3_OFFSET = 360;
    const COL3_WIDTH = 95;
    const COL4_OFFSET = 455;
    const COL4_WIDTH = 80;

    const importerRowsStructure = [
        { leftMargin: COL1_OFFSET, width: COL1_WIDTH },
        { leftMargin: COL2_OFFSET, width: COL2_WIDTH },
        { leftMargin: COL3_OFFSET, width: COL3_WIDTH },
        { leftMargin: COL4_OFFSET, width: COL4_WIDTH }
    ];

    const importerHeadersfirst = [
        { leftMargin: COL1_OFFSET, width: COL1_WIDTH, text: ['Company, name, address, EORI number and contact details of importer (specify details)'] },
        { leftMargin: COL2_OFFSET, width: COL2_WIDTH, text: 'Signature' },
        { leftMargin: COL3_OFFSET, width: COL3_WIDTH, text: 'Date' },
        { leftMargin: COL4_OFFSET, width: COL4_WIDTH, text: 'Seal' }
    ];
    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', importerHeadersfirst.map(h =>
                doc.struct('TH', () => PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + h.leftMargin, yPos, h.width, headerHeight, h.text))
            ))
        ]),
        doc.struct('TBody', [
            doc.struct('TR', importerRowsStructure.map(r =>
                doc.struct('TD', () => PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + r.leftMargin, yPos + headerHeight, r.width, rowHeight))
            ))
        ])
    ]));

    yPos += headerHeight + rowHeight;

    const importerHeaders = [
        { leftMargin: COL1_OFFSET, width: COL1_WIDTH, text: ['Company, name, address, EORI number and contact details of representative of the importer (specify details)'] },
        { leftMargin: COL2_OFFSET, width: COL2_WIDTH, text: 'Signature' },
        { leftMargin: COL3_OFFSET, width: COL3_WIDTH, text: 'Date' },
        { leftMargin: COL4_OFFSET, width: COL4_WIDTH, text: 'Seal' }
    ];
    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', importerHeaders.map(h =>
                doc.struct('TH', () => PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + h.leftMargin, yPos, h.width, headerHeight, h.text))
            ))
        ]),
        doc.struct('TBody', [
            doc.struct('TR', importerRowsStructure.map(r =>
                doc.struct('TD', () => PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + r.leftMargin, yPos + headerHeight, r.width, rowHeight))
            ))
        ])
    ]));

    return yPos + headerHeight + rowHeight;
};

const renderSection11ProductTable = (doc, yPos, headerHeight, rowHeight) => {
    const COL1_OFFSET = 15;
    const COL1_WIDTH = 250;
    const COL2_OFFSET = 265;
    const COL2_WIDTH = 95;
    const COL3_OFFSET = 360;
    const COL3_WIDTH = 95;
    const COL4_OFFSET = 455;
    const COL4_WIDTH = 80;

    const productHeaders = [
        { leftMargin: COL1_OFFSET, width: COL1_WIDTH, text: 'Product Description' },
        { leftMargin: COL2_OFFSET, width: COL2_WIDTH, text: 'CN code' },
        { leftMargin: COL3_OFFSET, width: COL3_WIDTH, text: 'Net weight in kg' },
        { leftMargin: COL4_OFFSET, width: COL4_WIDTH, text: 'Net fishery product weight in kg' }
    ];
    const productRows = [
        { leftMargin: COL1_OFFSET, width: COL1_WIDTH },
        { leftMargin: COL2_OFFSET, width: COL2_WIDTH },
        { leftMargin: COL3_OFFSET, width: COL3_WIDTH },
        { leftMargin: COL4_OFFSET, width: COL4_WIDTH }
    ];
    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', productHeaders.map(h =>
                doc.struct('TH', () => PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + h.leftMargin, yPos, h.width, headerHeight, h.text))
            ))
        ]),
        doc.struct('TBody', [
            doc.struct('TR', productRows.map(r =>
                doc.struct('TD', () => PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + r.leftMargin, yPos + headerHeight, r.width, rowHeight))
            ))
        ])
    ]));

    return yPos + headerHeight + rowHeight;
};

const createSection11Table = (doc, headerDefs, columnDefs, tableYPos, headerHeight, rowHeight) => {
    const headerCells = headerDefs.map(h =>
        doc.struct('TH', () => PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + h.leftMargin, tableYPos, h.width, headerHeight, h.text))
    );
    const bodyCells = columnDefs.map(c =>
        doc.struct('TD', () => PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + c.leftMargin, tableYPos + headerHeight, c.width, rowHeight))
    );
    return doc.struct('Table', [
        doc.struct('THead', [doc.struct('TR', headerCells)]),
        doc.struct('TBody', [doc.struct('TR', bodyCells)])
    ]);
};

const addSection11Table = (doc, headers, cols, yPos, headerHeight, rowHeight) => {
    doc.addStructure(createSection11Table(doc, headers, cols, yPos, headerHeight, rowHeight));
    return yPos + headerHeight + rowHeight;
};

const getSection11TableDefinitions = () => {
    const COL1_OFFSET = 15, COL1_WIDTH = 250;
    const COL2_OFFSET = 265, COL2_WIDTH = 95;
    const COL3_OFFSET = 360, COL_REFERENCES_WIDTH = 175;
    const MEMBER_STATE_WIDTH = 520, CUSTOMS_COL1_WIDTH = 300;
    const CUSTOMS_COL2_OFFSET = 315, CUSTOMS_COL2_WIDTH = 220;

    return {
        article14_1: {
            headers: [
                { leftMargin: COL1_OFFSET, width: COL1_WIDTH, text: ['Document under Article 14(1) of Regulation (EC) No 1005/2008'] },
                { leftMargin: COL2_OFFSET, width: COL2_WIDTH, text: 'Yes/No (as appropriate)' },
                { leftMargin: COL3_OFFSET, width: COL_REFERENCES_WIDTH, text: 'References' }
            ],
            cols: [
                { leftMargin: COL1_OFFSET, width: COL1_WIDTH },
                { leftMargin: COL2_OFFSET, width: COL2_WIDTH },
                { leftMargin: COL3_OFFSET, width: COL_REFERENCES_WIDTH }
            ]
        },
        article14_2: {
            headers: [
                { leftMargin: COL1_OFFSET, width: COL1_WIDTH, text: ['Document under Article 14(2) of Regulation (EC) No 1005/2008'] },
                { leftMargin: COL2_OFFSET, width: COL2_WIDTH, text: 'Yes/No (as appropriate)' },
                { leftMargin: COL3_OFFSET, width: COL_REFERENCES_WIDTH, text: 'References (processing statement document number(s))' }
            ],
            cols: [
                { leftMargin: COL1_OFFSET, width: COL1_WIDTH },
                { leftMargin: COL2_OFFSET, width: COL2_WIDTH },
                { leftMargin: COL3_OFFSET, width: COL_REFERENCES_WIDTH }
            ]
        },
        memberState: {
            headers: [{ leftMargin: COL1_OFFSET, width: MEMBER_STATE_WIDTH, text: 'Member State and office of import' }],
            cols: [{ leftMargin: COL1_OFFSET, width: MEMBER_STATE_WIDTH }]
        },
        transport: {
            headers: [
                { leftMargin: COL1_OFFSET, width: COL1_WIDTH, text: 'Means of transport upon arrival (airplane,vehicle, ship, train)' },
                { leftMargin: COL2_OFFSET, width: COL2_WIDTH, text: 'Transport document reference' },
                { leftMargin: COL3_OFFSET, width: COL_REFERENCES_WIDTH, text: 'Estimated time of arrival (if submission under Article 12(1) of Regulation (EC) No 1005/2008' }
            ],
            cols: [
                { leftMargin: COL1_OFFSET, width: COL1_WIDTH },
                { leftMargin: COL2_OFFSET, width: COL2_WIDTH },
                { leftMargin: COL3_OFFSET, width: COL_REFERENCES_WIDTH }
            ]
        },
        customs: {
            headers: [
                { leftMargin: COL1_OFFSET, width: CUSTOMS_COL1_WIDTH, text: 'Customs declaration number (if issued)' },
                { leftMargin: CUSTOMS_COL2_OFFSET, width: CUSTOMS_COL2_WIDTH, text: 'CHED number (if available)' }
            ],
            cols: [
                { leftMargin: COL1_OFFSET, width: CUSTOMS_COL1_WIDTH },
                { leftMargin: CUSTOMS_COL2_OFFSET, width: CUSTOMS_COL2_WIDTH }
            ]
        }
    };
};

const renderSection11RegulatoryTables = (doc, yPos, headerHeight, rowHeight) => {
    const ARTIFACT_LINE_WIDTH = 1.5;
    const ARTIFACT_LINE_X_OFFSET = 225;
    const ARTIFACT_LINE_Y_ADJUSTMENT = 0.5;
    const SEPARATOR_Y_OFFSET = 5;

    const tables = getSection11TableDefinitions();

    yPos = addSection11Table(doc, tables.article14_1.headers, tables.article14_1.cols, yPos, headerHeight, rowHeight);
    yPos = addSection11Table(doc, tables.article14_2.headers, tables.article14_2.cols, yPos, headerHeight, rowHeight);
    yPos = addSection11Table(doc, tables.memberState.headers, tables.memberState.cols, yPos, headerHeight, rowHeight);
    yPos = addSection11Table(doc, tables.transport.headers, tables.transport.cols, yPos, headerHeight, rowHeight);
    yPos = addSection11Table(doc, tables.customs.headers, tables.customs.cols, yPos, headerHeight, rowHeight);

    doc.addStructure(doc.struct('Artifact', { type: 'Layout' }, () => {
        doc.lineWidth(ARTIFACT_LINE_WIDTH);
        doc.undash();
        doc.moveTo(PdfStyle.MARGIN.LEFT + ARTIFACT_LINE_X_OFFSET, yPos + ARTIFACT_LINE_Y_ADJUSTMENT).lineTo(PdfStyle.MARGIN.LEFT + ARTIFACT_LINE_X_OFFSET, yPos + headerHeight - ARTIFACT_LINE_Y_ADJUSTMENT).stroke('#ffffff');
    }));
    PdfUtils.separator(doc, yPos + SEPARATOR_Y_OFFSET);
};

const generateSection11 = (doc, startY) => {
    const LABEL_YPOS_MULTIPLIER = 2;
    const INITIAL_YPOS_MULTIPLIER = 3;
    const HEADER_HEIGHT_MULTIPLIER = 3;
    const HEADER_HEIGHT_ADJUSTMENT = 4;
    const ROW_HEIGHT_MULTIPLIER = 3;

    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, startY + PdfStyle.ROW.HEIGHT * LABEL_YPOS_MULTIPLIER, '11    Importer Declaration:');
    }));

    let yPos = startY + PdfStyle.ROW.HEIGHT * INITIAL_YPOS_MULTIPLIER;
    const headerHeight = PdfStyle.ROW.HEIGHT * HEADER_HEIGHT_MULTIPLIER - HEADER_HEIGHT_ADJUSTMENT;
    const rowHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER;

    yPos = renderSection11ImporterTables(doc, yPos, headerHeight, rowHeight);
    yPos = renderSection11ProductTable(doc, yPos, headerHeight, rowHeight);
    renderSection11RegulatoryTables(doc, yPos, headerHeight, rowHeight);
};

const section11 = (doc, startY) => {
    generateSection11(doc, startY);
};

const section12 = (doc, startY) => {
    const YPOS_MULTIPLIER = 3;
    const HEADER_HEIGHT_MULTIPLIER = 2;
    const HEADER_HEIGHT_ADJUSTMENT = 3;
    const ROW_HEIGHT_MULTIPLIER = 3;
    const AUTHORITY_COL_OFFSET = 15;
    const AUTHORITY_COL_WIDTH = 150;
    const PLACE_COL_OFFSET = 165;
    const PLACE_COL_WIDTH = 105;
    const AUTHORISED_COL_OFFSET = 270;
    const AUTHORISED_COL_WIDTH = 80;
    const SUSPENDED_COL_OFFSET = 350;
    const SUSPENDED_COL_WIDTH = 80;
    const VERIFICATION_COL_OFFSET = 430;
    const VERIFICATION_COL_WIDTH = 100;
    const YPOS_INCREMENT = 5;
    const TEXT_OFFSET_X = 15;

    let yPos = startY + PdfStyle.ROW.HEIGHT * YPOS_MULTIPLIER;
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '12');
    }));

    const headerHeight =  PdfStyle.ROW.HEIGHT * HEADER_HEIGHT_MULTIPLIER - HEADER_HEIGHT_ADJUSTMENT;
    const rowHeight = PdfStyle.ROW.HEIGHT * ROW_HEIGHT_MULTIPLIER;

    doc.addStructure(doc.struct('Table', [
        doc.struct('THead', [
            doc.struct('TR', [
                doc.struct('TH', ()=> PdfUtils.tableHeaderCellBold(doc, PdfStyle.MARGIN.LEFT + AUTHORITY_COL_OFFSET, yPos, AUTHORITY_COL_WIDTH, headerHeight, 'Import Control Authority')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + PLACE_COL_OFFSET, yPos, PLACE_COL_WIDTH, headerHeight, 'Place')),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + AUTHORISED_COL_OFFSET, yPos, AUTHORISED_COL_WIDTH, headerHeight, ['Importation', 'authorised*'])),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + SUSPENDED_COL_OFFSET, yPos, SUSPENDED_COL_WIDTH, headerHeight, ['Importation', 'suspended*'])),
                doc.struct('TH', ()=> PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + VERIFICATION_COL_OFFSET, yPos, VERIFICATION_COL_WIDTH, headerHeight, ['Verification requested', '– date']))
            ])
        ]),
        doc.struct('TBody', [
            doc.struct('TR', [
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + AUTHORITY_COL_OFFSET, yPos + headerHeight, AUTHORITY_COL_WIDTH, rowHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + PLACE_COL_OFFSET, yPos + headerHeight, PLACE_COL_WIDTH, rowHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + AUTHORISED_COL_OFFSET, yPos + headerHeight, AUTHORISED_COL_WIDTH, rowHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + SUSPENDED_COL_OFFSET, yPos + headerHeight, SUSPENDED_COL_WIDTH, rowHeight)),
                doc.struct('TD', ()=> PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + VERIFICATION_COL_OFFSET, yPos + headerHeight, VERIFICATION_COL_WIDTH, rowHeight))
            ])
        ])
    ]));
    yPos += headerHeight + rowHeight + YPOS_INCREMENT;
    doc.addStructure(doc.struct('P', () => {
        doc.text('* Tick as appropriate', PdfStyle.MARGIN.LEFT + TEXT_OFFSET_X, yPos);
    }));
};

const section13 = (doc, startY) => {

    const ROW_MULTIPLIER_FOR_YPOS = 3;
    const HEADER_HEIGHT_MULTIPLIER = 2;
    const ROW_HEIGHT_ADDITION = 20;
    const CELL_HEIGHT_MULTIPLIER = 2;
    const REFUSAL_COL_OFFSET = 15;
    const REFUSAL_COL_WIDTH = 85;
    const PROVISION_COL_OFFSET = 100;
    const PROVISION_COL_WIDTH = 350;
    const TICK_COL_OFFSET = 450;
    const TICK_COL_WIDTH = 80;

    const yPos = startY + PdfStyle.ROW.HEIGHT * ROW_MULTIPLIER_FOR_YPOS;
    doc.addStructure(doc.struct('P', () => {
        PdfUtils.labelBold(doc, PdfStyle.MARGIN.LEFT, yPos, '13');
    }));
    const headerHeight = PdfStyle.ROW.HEIGHT * HEADER_HEIGHT_MULTIPLIER - ROW_MULTIPLIER_FOR_YPOS;
    const rowHeight = PdfStyle.ROW.HEIGHT + ROW_HEIGHT_ADDITION;
    const cellHeight = PdfStyle.ROW.HEIGHT * CELL_HEIGHT_MULTIPLIER - ROW_MULTIPLIER_FOR_YPOS;

    const provisionTexts = [
        'Article 18(1), point (a)',
        'Article 18(1), point (b)',
        'Article 18(1), point (c)',
        'Article 18(1), point (d)',
        'Article 18(1), point (e)',
        'Article 18(1), point (f)',
        'Article 18(1), point (g)',
        'Article 18(2), point (a)',
        'Article 18(2), point (b)',
        'Article 18(2), point (c)',
        'Article 18(2), point (d)'
    ];

    const myTable = doc.struct('Table');
    doc.addStructure(myTable);

    const tableHead = doc.struct('THead');
    myTable.add(tableHead);

    const tableHeadRow = doc.struct('TR');
    tableHead.add(tableHeadRow);

    const th1 = doc.struct('TH', () => PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + REFUSAL_COL_OFFSET, yPos, REFUSAL_COL_WIDTH, headerHeight, 'Refusal of catch certificate'));
    const th2 = doc.struct('TH', () => PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + PROVISION_COL_OFFSET, yPos, PROVISION_COL_WIDTH, headerHeight, 'Catch certificate refused on the basis of the following provision of Regulation (EC) No 1005/2008:'));
    const th3 = doc.struct('TH', () => PdfUtils.tableHeaderCell(doc, PdfStyle.MARGIN.LEFT + TICK_COL_OFFSET, yPos, TICK_COL_WIDTH, headerHeight, 'Tick as appropriate'));

    tableHeadRow.add(th1);
    tableHeadRow.add(th2);
    tableHeadRow.add(th3);
    tableHeadRow.end();
    tableHead.end();

    const tableBody = doc.struct('TBody');
    myTable.add(tableBody);

    provisionTexts.forEach((text, idx) => {
        const rowY = yPos + headerHeight + (rowHeight * idx);
        const tableBodyRow = doc.struct('TR');
        tableBody.add(tableBodyRow);

        if (idx === 0) {
            const totalRowsHeight = rowHeight * provisionTexts.length;
            const td1 = doc.struct('TD', () => PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + REFUSAL_COL_OFFSET, yPos + cellHeight, REFUSAL_COL_WIDTH, totalRowsHeight));
            tableBodyRow.add(td1);
        }

        const td2 = doc.struct('TD', () => PdfUtils.fieldBgWhite(doc, PdfStyle.MARGIN.LEFT + PROVISION_COL_OFFSET, rowY, PROVISION_COL_WIDTH, rowHeight, text));
        const td3 = doc.struct('TD', () => PdfUtils.field(doc, PdfStyle.MARGIN.LEFT + TICK_COL_OFFSET, rowY, TICK_COL_WIDTH, rowHeight));

        tableBodyRow.add(td2);
        tableBodyRow.add(td3);
        tableBodyRow.end();
    });

    tableBody.end();
    myTable.end();
};

module.exports = {
    section11,
    section12,
    section13,
};
