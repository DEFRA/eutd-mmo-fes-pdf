const mmoPdfUtils = require("../../src/pdf/mmoPdfUtils");
const PdfStyle = require('../../src/pdf/mmoPdfStyles');



const doc = {
  widthOfString: jest.fn(input => input.length),
  lineWidth: jest.fn(value => doc),
  moveTo: jest.fn(value => doc),
  lineTo: jest.fn(value => doc),
  dash: jest.fn(value => doc),
  stroke: jest.fn(value => doc),
  font: jest.fn(value => doc),
  image: jest.fn(value => doc),
  fontSize: jest.fn(value => doc),
  fillColor: jest.fn(value => doc),
  text: jest.fn(value => doc),
  undash: jest.fn(value => doc),
  rect: jest.fn(value => doc),
  moveDown: jest.fn(value => doc),
  fillAndStroke: jest.fn(value => doc),
  page: {
    dictionary: {
      data: []
    }
  },
  struct: jest.fn((element, options, child) => child ? child() : options()),
  addStructure: jest.fn(value => value)
};

describe('dom pdf utils', () => {

  test('should generate an address from 4 parts', async () => {

    const address = ['a', 'b', 'c', 'd'];

    const formattedAddress = mmoPdfUtils.constructAddress(address);

    expect(formattedAddress).toEqual('a, b, c. d');

  });

  test('should not generate an address if array lenght is not 4', async () => {

    const address1 = ['a'];

    const formattedAddress1 = mmoPdfUtils.constructAddress(address1);

    expect(formattedAddress1).toEqual('');

    const address2 = ['a', 'b', 'c', 'd', 'e'];

    const formattedAddress2 = mmoPdfUtils.constructAddress(address2);

    expect(formattedAddress2).toEqual('');

    const address3 = [null, null, null, null];

    const formattedAddress3 = mmoPdfUtils.constructAddress(address3);

    expect(formattedAddress3).toEqual('');

  });

  test('should give us a correctly formatted date', async () => {

    let realDate = Date;

    let ourdate;

    let todaysDate

    // mock the global date opbject
    global.Date = class extends Date {
      constructor(date) {
        if (date) {
          return super(date);
        }

        return ourdate;
      }
    };

    // test for leading 0s on month numbers

    ourdate = new Date('2023-06-15');

    todaysDate = mmoPdfUtils.todaysDate();

    expect(todaysDate).toEqual('15/06/2023');

    // test for leading 1s e.g. 10 

    ourdate = new Date('2023-10-15');

    todaysDate = mmoPdfUtils.todaysDate();

    expect(todaysDate).toEqual('15/10/2023');

    // test for leading 0s on single-digit day

    ourdate = new Date('2023-12-05');

    todaysDate = mmoPdfUtils.todaysDate();

    expect(todaysDate).toEqual('05/12/2023');

    // test for leading 0s on single-digit month and day

    ourdate = new Date('2023-01-05');

    todaysDate = mmoPdfUtils.todaysDate();

    expect(todaysDate).toEqual('05/01/2023');

    // restore the global date object
    global.Date = realDate;

  });

  test('should constrain text width', async () => {

    const text = 'lorem ipsum dolor lorem ipsum dolor';

    let result;

    result = mmoPdfUtils.constrainWidth(doc, text, 6, 1);

    expect(result).toEqual('...');

    result = mmoPdfUtils.constrainWidth(doc, 't', 10, 10);

    expect(result).toEqual('t');

  });

  test('should draw a line seperator', async () => {
    const startY = 1;
    mmoPdfUtils.separator(doc, startY);

    expect(doc.lineWidth).toBeCalledWith(0.75);
    expect(doc.moveTo).toHaveBeenCalledWith(0, startY);
    expect(doc.lineTo).toHaveBeenCalledWith(600, startY);
    expect(doc.dash).toHaveBeenCalledWith(2, { space: 2 });
    expect(doc.stroke).toHaveBeenCalledWith('#767676');
  });

  test('should draw a qr code', async () => {
    const buff = 'A string pretending to be a buffer';
    const startX = 1;
    const startY = 1;

    mmoPdfUtils.qrCode(doc, buff, startX, startY);

    expect(doc.image).toBeCalledWith(buff, startX, startY, { fit: [55, 55] });
    expect(doc.fontSize).toBeCalledWith(PdfStyle.FONT_SIZE.MEDIUM);

  });

  test('should render a sub heading', async () => {
    const text = 'lorem ipsum';
    const x = 1;
    const y = 1;

    mmoPdfUtils.subHeading(doc, x, y, text)

    expect(doc.fillColor).toBeCalledWith('#353535');
    expect(doc.fontSize).toBeCalledWith(PdfStyle.FONT_SIZE.MEDIUM);
    expect(doc.text).toBeCalledWith(text, x, y, { align: 'center' });
  });

  test('should generate QR code', async () => {
    const uri = 'lorem ipsum';

    const expectedResult = [
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 145, 0, 0, 0, 145, 8, 0, 0, 0, 0, 230, 179, 5, 255, 0, 0, 1, 31, 73, 68, 65, 84, 120, 218, 237, 218, 65, 14, 195, 32, 12, 4, 192, 252, 255, 211, 237, 189, 42, 116, 33, 196, 33, 213, 112, 138, 84, 1, 115, 113, 141, 13, 199, 107, 183, 113, 16, 17, 17, 17, 17, 17, 17, 17, 17, 17, 253, 167, 232, 248, 61, 190, 205, 56, 189, 10, 17, 81, 129, 168, 29, 12, 221, 95, 79, 175, 66, 68, 84, 32, 250, 22, 27, 205, 175, 143, 77, 210, 85, 136, 136, 182, 20, 53, 55, 33, 34, 122, 180, 168, 63, 151, 136, 104, 75, 209, 144, 183, 25, 107, 117, 39, 54, 34, 162, 21, 53, 109, 122, 102, 170, 171, 178, 137, 136, 86, 244, 33, 131, 156, 80, 220, 25, 37, 34, 154, 58, 31, 5, 165, 107, 16, 177, 68, 68, 119, 138, 154, 235, 167, 21, 66, 58, 151, 136, 168, 74, 20, 84, 168, 193, 215, 100, 202, 33, 34, 186, 76, 116, 58, 79, 164, 1, 71, 68, 84, 42, 234, 55, 25, 131, 254, 98, 80, 10, 79, 100, 17, 34, 162, 21, 162, 180, 166, 237, 159, 123, 134, 186, 243, 68, 68, 215, 138, 38, 223, 104, 197, 209, 52, 121, 62, 34, 34, 90, 33, 26, 191, 59, 26, 186, 26, 45, 185, 205, 34, 34, 26, 216, 51, 125, 211, 50, 25, 112, 68, 68, 123, 136, 250, 9, 228, 234, 158, 63, 17, 209, 85, 162, 32, 234, 86, 246, 143, 136, 136, 150, 245, 33, 227, 255, 255, 178, 206, 40, 17, 209, 201, 219, 245, 244, 141, 214, 120, 99, 158, 136, 168, 94, 116, 235, 32, 34, 34, 34, 34, 34, 34, 34, 34, 34, 122, 190, 232, 13, 51, 198, 164, 153, 32, 237, 246, 0, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130
    ];

    const qrResult = await mmoPdfUtils.generateQRCode(uri);

    expect(Object.values(qrResult)).toEqual(expectedResult);
  });


  test('should reject with an error if an error occurs during QR code generation', async () => {
    const uri = {};

    // Expect the generateQRCode function to reject with an error
    await expect(mmoPdfUtils.generateQRCode(uri)).rejects.toThrow('Bad data');
  });



  test('should draw a end of page', async () => {
    const buff = 'A string pretending to be a buffer';
    const page = 2;

    mmoPdfUtils.endOfPage(doc, 2);

    expect(doc.undash).toBeCalledWith();
    expect(doc.lineWidth).toBeCalledWith(2);
    expect(doc.fontSize).toBeCalledWith(PdfStyle.FONT_SIZE.SMALL);
    expect(doc.moveTo).toBeCalledWith(PdfStyle.MARGIN.LEFT, 795);
    expect(doc.font).toBeCalledWith(PdfStyle.FONT.REGULAR);
    expect(doc.fillColor).toBeCalledWith('#353535');
    expect(doc.text).toBeCalledWith(page, 0, 800, {
      align: 'center'
    });
  });

  test('should format label', async () => {
    const text = 'A string pretending to be a buffer';
    const textArr = [];
    const x = 1;
    const y = 1;
    mmoPdfUtils.label(doc, x, y, text);
    mmoPdfUtils.labelBold(doc, x, y, text);
    mmoPdfUtils.labelBoldItalic(doc, x, y, text);

    expect(doc.fontSize).toBeCalledWith(PdfStyle.FONT_SIZE.SMALL);
    expect(doc.font).toBeCalledWith(PdfStyle.FONT.REGULAR);
    expect(doc.fillColor).toBeCalledWith('#353535');
    expect(doc.text).toBeCalledWith(text, x, y);
  });

  test('it should create a table header cell with text', () => {
    const x = 50;
    const y = 50;
    const width = 100;
    const height = 30;
    const text = 'Header Text';

    mmoPdfUtils.tableHeaderCell(doc, x, y, width, height, text);
    expect(doc.undash).toBeCalledWith();

    // Test assertions
    expect(doc.text).toHaveBeenCalledWith(text, x + 4, y + 4, {
      width: width - 4,
      lineBreak: true,
      ellipsis: true,
    });
    expect(doc.rect).toHaveBeenCalledWith(x, y, width, height);
  });

  test('it should create a table header cell with an array of text', () => {
    const x = 50;
    const y = 50;
    const width = 100;
    const height = 30;
    const text = ['Header Text 1', 'Header Text 2'];

    mmoPdfUtils.tableHeaderCell(doc, x, y, width, height, text);
  });

  test('it should create a table header cell with default colors if no text is provided', () => {
    const x = 50;
    const y = 50;
    const width = 100;
    const height = 30;


    mmoPdfUtils.tableHeaderCell(doc, x, y, width, height, 'lorem ipsum');

    // Test assertions
    expect(doc.fillColor).toHaveBeenCalledWith('#353535');
    //expect(doc.strokeColor).toHaveBeenCalledWith('#353535');
    expect(doc.rect).toHaveBeenCalledWith(x, y, width, height);
  });

  test('it should create a table header cell with bold text', () => {
    const x = 50;
    const y = 50;
    const width = 100;
    const height = 30;
    const text = 'Header Text';

    mmoPdfUtils.tableHeaderCellBold(doc, x, y, width, height, text);

    expect(doc.text).toHaveBeenCalledWith(text, x + 4, y + 4, {
      width: width - 4,
      lineBreak: true,
      ellipsis: true,
    });
    expect(doc.rect).toHaveBeenCalledWith(x, y, width, height);
  });

  test('it should create a table header cell with an array of bold text', () => {
    const x = 50;
    const y = 50;
    const width = 100;
    const height = 30;
    const text = ['Header Text 1', 'Header Text 2'];

    mmoPdfUtils.tableHeaderCellBold(doc, x, y, width, height, text);


  });

  test('it should create a table header cell with default colors if no text is provided', () => {
    const x = 50;
    const y = 50;
    const width = 100;
    const height = 30;

    mmoPdfUtils.tableHeaderCellBold(doc, x, y, width, height, null);

    // Test assertions
    expect(doc.fillColor).toHaveBeenCalledWith('#353535');
    expect(doc.rect).toHaveBeenCalledWith(x, y, width, height);
  });

  test('it should create a field cell with text', () => {
    const x = 50;
    const y = 50;
    const width = 100;
    const height = 30;
    const text = 'Field Text';

    mmoPdfUtils.field(doc, x, y, width, height, text);

    // Test assertions
    expect(doc.text).toHaveBeenCalledWith(text, x + 4, y + 4, {
      width: width - 4,
      lineBreak: true,
      ellipsis: true,
    });
    expect(doc.rect).toHaveBeenCalledWith(x, y, width, height);
  });

  test('it should create a field cell with an array of text', () => {
    const x = 50;
    const y = 50;
    const width = 100;
    const height = 30;
    const text = ['Field Text 1', 'Field Text 2'];

    mmoPdfUtils.field(doc, x, y, width, height, text);
  });

  test('it should create a field cell with default colors if no text is provided', () => {
    const x = 50;
    const y = 50;
    const width = 100;
    const height = 30;

    mmoPdfUtils.field(doc, x, y, width, height, null);

    // Test assertions
    expect(doc.fillColor).toHaveBeenCalledWith('#353535');
    expect(doc.rect).toHaveBeenCalledWith(x, y, width, height);
  });

  test('it should create a field cell with specified number of lines', () => {
    const x = 50;
    const y = 50;
    const width = 100;
    const height = 60; // Increased height for multiple lines
    const text = 'Field Text';
    const numberOfLines = 2;

    mmoPdfUtils.field(doc, x, y, width, height, text, numberOfLines);

    // Test assertions
    expect(doc.text).toHaveBeenCalledWith(text, x + 4, y + 4, {
      width: width - 4,
      lineBreak: true,
      ellipsis: true,
    });
    expect(doc.rect).toHaveBeenCalledWith(x, y, width, height);
  });

  test('it should create a wrapped field cell with text', () => {
    const x = 50;
    const y = 50;
    const width = 100;
    const height = 30;
    const text = 'Wrapped Field Text';

    mmoPdfUtils.wrappedField(doc, x, y, width, height, text);

    // Test assertions
    expect(doc.text).toHaveBeenCalledWith(text, x + 4, y + 4, {
      width: width - 4,
      lineBreak: true,
      ellipsis: true,
    });
    expect(doc.rect).toHaveBeenCalledWith(x, y, width, height);
  });

  test('it should create a wrapped field cell with an array of text', () => {
    const x = 50;
    const y = 50;
    const width = 100;
    const height = 60; // Increased height for multiple lines
    const text = ['Wrapped Field Text 1', 'Wrapped Field Text 2'];

    mmoPdfUtils.wrappedField(doc, x, y, width, height, text);
  });

  test('it should create a wrapped field cell with default colors if no text is provided', () => {
    const x = 50;
    const y = 50;
    const width = 100;
    const height = 30;

    mmoPdfUtils.wrappedField(doc, x, y, width, height, null);

    // Test assertions
    expect(doc.fillColor).toHaveBeenCalledWith('#353535');
    expect(doc.rect).toHaveBeenCalledWith(x, y, width, height);
  });

  test('it should create a heading with text', () => {
    const text = 'Heading Text';

    mmoPdfUtils.heading(doc, text);

    // Test assertions
    expect(doc.image).toHaveBeenCalledWith(expect.any(String), { height: 60 });
    expect(doc.fillColor).toHaveBeenCalledWith('#353535');
    expect(doc.fontSize).toHaveBeenCalledWith(expect.any(Number));
    expect(doc.font).toHaveBeenCalledWith(expect.any(String));
    expect(doc.text).toHaveBeenCalledWith('UNITED KINGDOM', 450, expect.any(Number));
    expect(doc.fontSize).toHaveBeenCalledWith(expect.any(Number));
    expect(doc.text).toHaveBeenCalledWith(text, expect.any(Number), 75, { align: 'center' });
  });

  test('it should create a cell with text array and default options', () => {
    const x = 50;
    const y = 50;
    const width = 100;
    const height = 30;
    const textArr = ['Text Line 1', 'Text Line 2'];

    mmoPdfUtils.cell({doc, x, y, width, height, textArr, numberOfLines: 1});

    // Test assertions
    expect(doc.lineWidth).toBeCalledWith(0.75);
    expect(doc.rect).toHaveBeenCalledWith(x, y, width, height);
    expect(doc.stroke).toHaveBeenCalled();
    expect(doc.fillColor).toHaveBeenCalled();
    expect(doc.font).toHaveBeenCalledWith(PdfStyle.FONT.REGULAR);
    expect(doc.fontSize).toHaveBeenCalledWith(PdfStyle.FONT_SIZE.SMALL);
    expect(doc.text).toHaveBeenCalledWith(textArr[0], x + 4, y + 4, {
      width: width - 4,
      lineBreak: true,
      ellipsis: true
    });
  });

  test('it should create a cell with text array and custom options', () => {
    const x = 50;
    const y = 50;
    const width = 100;
    const height = 30;
    const textArr = ['Text Line 1', 'Text Line 2'];
    const trimWidth = true;
    const isBold = true;
    const lineColor = '#000000';
    const textColor = '#FFFFFF';
    const bgColour = '#CCCCCC';
    const numberOfLines = 2;

    mmoPdfUtils.cell({doc, x, y, width, height, textArr, trimWidth, isBold, lineColor, textColor, bgColour, numberOfLines});

    // Test assertions
    expect(doc.rect).toHaveBeenCalledWith(x, y, width, height);
    expect(doc.fillAndStroke).toHaveBeenCalledWith(bgColour, lineColor);
    expect(doc.fillColor).toHaveBeenCalledWith(textColor);
    expect(doc.font).toHaveBeenCalledWith(PdfStyle.FONT.BOLD);
    expect(doc.fontSize).toHaveBeenCalledWith(PdfStyle.FONT_SIZE.SMALL);
    expect(doc.text).toHaveBeenCalledWith(textArr[0], x + 4, y + 4, {
      width: width - 4,
      lineBreak: true,
      ellipsis: true
    });
  });

  test('it should create a cell with no text array', () => {
    const x = 50;
    const y = 50;
    const width = 100;
    const height = 30;
    const textArr = null;

    mmoPdfUtils.cell({doc, x, y, width, height, textArr, numberOfLines: 1});

    // Test assertions
    expect(doc.rect).toHaveBeenCalledWith(x, y, width, height);
    expect(doc.stroke).toHaveBeenCalled();
    expect(doc.fillColor).toHaveBeenCalled();
    expect(doc.font).toHaveBeenCalledWith(PdfStyle.FONT.REGULAR);
    expect(doc.fontSize).toHaveBeenCalledWith(PdfStyle.FONT_SIZE.SMALL);
  });

  test('it should create a cellNoEllipsis with text array and ellipsis set to false', () => {
    const x = 50;
    const y = 50;
    const width = 100;
    const height = 30;
    const textArr = ['Long text that should not be truncated with ellipsis'];
    const trimWidth = false;
    const isBold = false;
    const lineColor = '#767676';
    const textColor = '#6B6B6B';
    const bgColour = '#f1f4ff';
    const numberOfLines = 1;

    mmoPdfUtils.cellNoEllipsis({doc, x, y, width, height, textArr, trimWidth, isBold, lineColor, textColor, bgColour, numberOfLines});

    // Test assertions
    expect(doc.rect).toHaveBeenCalledWith(x, y, width, height);
    expect(doc.fillAndStroke).toHaveBeenCalledWith(bgColour, lineColor);
    expect(doc.fillColor).toHaveBeenCalledWith(textColor);
    expect(doc.font).toHaveBeenCalledWith(PdfStyle.FONT.REGULAR);
    expect(doc.fontSize).toHaveBeenCalledWith(PdfStyle.FONT_SIZE.SMALL);
    expect(doc.text).toHaveBeenCalledWith(textArr[0], x + 4, y + 4, {
      width: width - 4,
      lineBreak: true,
      ellipsis: false
    });
  });

  test('it should create a cellNoEllipsis with multiple lines of text', () => {
    const x = 50;
    const y = 50;
    const width = 100;
    const height = 60;
    const textArr = ['First line of text', 'Second line of text', 'Third line of text'];
    const trimWidth = false;
    const isBold = true;
    const lineColor = '#767676';
    const textColor = '#6B6B6B';
    const bgColour = '#f1f4ff';
    const numberOfLines = 3;

    mmoPdfUtils.cellNoEllipsis({doc, x, y, width, height, textArr, trimWidth, isBold, lineColor, textColor, bgColour, numberOfLines});

    // Test assertions
    expect(doc.rect).toHaveBeenCalledWith(x, y, width, height);
    expect(doc.fillAndStroke).toHaveBeenCalledWith(bgColour, lineColor);
    expect(doc.fillColor).toHaveBeenCalledWith(textColor);
    expect(doc.font).toHaveBeenCalledWith(PdfStyle.FONT.BOLD);
    expect(doc.fontSize).toHaveBeenCalledWith(PdfStyle.FONT_SIZE.SMALL);
    
    // Check first line
    expect(doc.text).toHaveBeenCalledWith(textArr[0], x + 4, y + 4, {
      width: width - 4,
      lineBreak: true,
      ellipsis: false
    });
    
    // Check subsequent lines also have ellipsis: false
    const textCalls = doc.text.mock.calls;
    textCalls.forEach(call => {
      if (call[2] && typeof call[2] === 'object' && 'ellipsis' in call[2]) {
        expect(call[2].ellipsis).toBe(false);
      }
    });
  });

  test('it should use wrappedFieldNoEllipsis wrapper function', () => {
    const x = 50;
    const y = 50;
    const width = 200;
    const height = 90;
    const text = 'Vehicle: MV Long Ship Name - Flag State';

    mmoPdfUtils.wrappedFieldNoEllipsis(doc, x, y, width, height, text);

    // Test assertions
    expect(doc.rect).toHaveBeenCalledWith(x, y, width, height);
    expect(doc.fillColor).toHaveBeenCalledWith('#6B6B6B');
    expect(doc.font).toHaveBeenCalledWith(PdfStyle.FONT.REGULAR);
    expect(doc.fontSize).toHaveBeenCalledWith(PdfStyle.FONT_SIZE.SMALL);
    expect(doc.text).toHaveBeenCalledWith(text, x + 4, y + 4, {
      width: width - 4,
      lineBreak: true,
      ellipsis: false
    });
  });

  test('it should use wrappedFieldNoEllipsis with array of text', () => {
    const x = 50;
    const y = 50;
    const width = 200;
    const height = 90;
    const textArr = ['Container: CONT1234567', 'CONT7654321', 'CONT9999999'];

    mmoPdfUtils.wrappedFieldNoEllipsis(doc, x, y, width, height, textArr);

    // Test assertions
    expect(doc.rect).toHaveBeenCalledWith(x, y, width, height);
    expect(doc.fillColor).toHaveBeenCalledWith('#6B6B6B');
    
    // Verify ellipsis is false for all text calls
    const textCalls = doc.text.mock.calls;
    textCalls.forEach(call => {
      if (call[2] && typeof call[2] === 'object' && 'ellipsis' in call[2]) {
        expect(call[2].ellipsis).toBe(false);
      }
    });
  });

  test('it should create cellImpl with ellipsis parameter defaulting to true', () => {
    const x = 50;
    const y = 50;
    const width = 100;
    const height = 30;
    const textArr = ['Test text'];
    const trimWidth = false;
    const isBold = false;
    const lineColor = '#767676';
    const textColor = '#6B6B6B';
    const bgColour = '#f1f4ff';
    const numberOfLines = 1;
    const ellipsis = true;

    mmoPdfUtils.cellImpl({doc, x, y, width, height, textArr, trimWidth, isBold, lineColor, textColor, bgColour, numberOfLines, ellipsis});

    // Test assertions
    expect(doc.text).toHaveBeenCalledWith(textArr[0], x + 4, y + 4, {
      width: width - 4,
      lineBreak: true,
      ellipsis: true
    });
  });

  test('it should create cellImpl with ellipsis set to false', () => {
    const x = 50;
    const y = 50;
    const width = 100;
    const height = 30;
    const textArr = ['Test text without ellipsis'];
    const trimWidth = false;
    const isBold = false;
    const lineColor = '#767676';
    const textColor = '#6B6B6B';
    const bgColour = '#f1f4ff';
    const numberOfLines = 1;
    const ellipsis = false;

    mmoPdfUtils.cellImpl({doc, x, y, width, height, textArr, trimWidth, isBold, lineColor, textColor, bgColour, numberOfLines, ellipsis});

    // Test assertions
    expect(doc.text).toHaveBeenCalledWith(textArr[0], x + 4, y + 4, {
      width: width - 4,
      lineBreak: true,
      ellipsis: false
    });
  });
});