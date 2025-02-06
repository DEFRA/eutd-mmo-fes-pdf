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

    // xtest for leading 0s on month numbers

    ourdate = new Date('2023-06-15');

    todaysDate = mmoPdfUtils.todaysDate();

    expect(todaysDate).toEqual('15/06/2023');

    // xtest for leading 1s e.g. 10 

    ourdate = new Date('2023-10-15');

    todaysDate = mmoPdfUtils.todaysDate();

    expect(todaysDate).toEqual('15/10/2023');

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
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 145, 0, 0, 0, 145, 8, 0, 0, 0, 0, 230, 179, 5, 255, 0, 0, 1, 33, 73, 68, 65, 84, 120, 218, 237, 218, 65, 14, 194, 32, 16, 5, 208, 222, 255, 210, 186, 55, 130, 31, 10, 211, 214, 188, 174, 154, 24, 224, 109, 70, 152, 95, 142, 215, 221, 158, 131, 136, 136, 136, 136, 136, 136, 136, 136, 136, 232, 63, 69, 199, 239, 231, 219, 136, 211, 179, 16, 17, 21, 136, 218, 197, 208, 253, 245, 244, 44, 68, 68, 5, 162, 111, 181, 209, 124, 251, 88, 36, 157, 133, 136, 232, 150, 162, 230, 34, 68, 68, 143, 22, 245, 199, 18, 17, 221, 82, 52, 228, 109, 214, 90, 221, 137, 141, 136, 104, 69, 79, 155, 158, 153, 234, 186, 108, 34, 162, 21, 57, 100, 176, 39, 20, 39, 163, 68, 68, 83, 231, 163, 160, 117, 13, 42, 150, 136, 232, 74, 81, 115, 254, 180, 67, 72, 199, 18, 17, 85, 137, 130, 14, 53, 120, 155, 220, 114, 136, 136, 182, 137, 78, 239, 19, 105, 193, 17, 17, 149, 138, 250, 33, 99, 144, 47, 6, 173, 240, 196, 46, 66, 68, 180, 66, 148, 246, 180, 253, 115, 207, 80, 58, 79, 68, 180, 87, 52, 121, 71, 43, 174, 166, 201, 243, 17, 17, 209, 10, 209, 248, 183, 163, 160, 97, 216, 125, 251, 144, 136, 104, 42, 135, 12, 150, 11, 194, 155, 217, 93, 132, 136, 168, 82, 212, 223, 64, 118, 103, 254, 68, 68, 187, 68, 65, 213, 173, 204, 143, 136, 136, 150, 229, 144, 241, 255, 127, 89, 50, 74, 68, 116, 242, 235, 122, 122, 71, 107, 60, 152, 39, 34, 170, 23, 93, 250, 16, 17, 17, 17, 17, 17, 17, 17, 17, 17, 61, 95, 244, 6, 51, 198, 164, 153, 162, 124, 7, 166, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130
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
    expect(doc.image).toHaveBeenCalledWith(expect.any(String), { width: 220 });
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

    mmoPdfUtils.cell(doc, x, y, width, height, textArr);

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

    mmoPdfUtils.cell(doc, x, y, width, height, textArr, trimWidth, isBold, lineColor, textColor, bgColour, numberOfLines);

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

    mmoPdfUtils.cell(doc, x, y, width, height, textArr);

    // Test assertions
    expect(doc.rect).toHaveBeenCalledWith(x, y, width, height);
    expect(doc.stroke).toHaveBeenCalled();
    expect(doc.fillColor).toHaveBeenCalled();
    expect(doc.font).toHaveBeenCalledWith(PdfStyle.FONT.REGULAR);
    expect(doc.fontSize).toHaveBeenCalledWith(PdfStyle.FONT_SIZE.SMALL);
  });
});