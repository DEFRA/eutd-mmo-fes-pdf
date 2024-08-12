const PDFStreamForImageBuffer = require("../../src/pdf/PDFStreamForImageBuffer");

describe('PDFStreamForImageBuffer', () => {
  let testStream;

  beforeEach(()=>{
     testStream = new PDFStreamForImageBuffer({ 
      0: 'testValue1',
      1: 'testValue2',
      2: 'testValue3',
    });
  })

  test('should construct with correct properties', async () => {
    expect(testStream.arr).toEqual(['testValue1', 'testValue2', 'testValue3']);
    expect(testStream.position).toEqual(0);
  });

  test('should have a read method', async () => {
    const result = testStream.read(1);

    expect(result).toEqual(['testValue1']);

    testStream.setPosition(0);

    const result2 = testStream.read(100);

    expect(result2).toEqual(['testValue1', 'testValue2']);
  });

  test('should have a notEnded method', async () => {
    expect(testStream.notEnded()).toEqual(true);

    testStream.setPosition(3);

    expect(testStream.notEnded()).toEqual(false);
  });

  test('should have a skip method', async () => {
    testStream.skip(1);

    expect(testStream.getCurrentPosition()).toEqual(1);
  });

  test('should set and get current posision', async () => {
    testStream.setPosition(1);

    expect(testStream.getCurrentPosition()).toEqual(1);
  });

  test('should set position from end of array', async () => {
    testStream.setPositionFromEnd(1);

    expect(testStream.getCurrentPosition()).toEqual(1);
  });

});