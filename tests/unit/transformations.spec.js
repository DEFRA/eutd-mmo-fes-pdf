const MultiDictHelper = require("../../src/utils/pdf-text-extraction/multi-dict-helper");
const transformations = require("../../src/utils/pdf-text-extraction/transformations");

describe('transformation operations', () => {
  
  test('should transformVector', async () => {
    expect(transformations.transformVector()).toEqual(undefined);
  })

  test('should inverseMatrix', async () => {
    const emptyMatrix = false;
    expect(transformations.inverseMatrix(emptyMatrix)).toEqual(emptyMatrix)

    const regularMatrix = [1,2,3,4,5,6];

    expect(transformations.inverseMatrix(regularMatrix)).toEqual([-2, 1, 1.5, -0.5, 1, -2])
  })

  test('should determinante', async () => {
    expect(transformations.determinante()).toEqual(1);
    expect(transformations.determinante([1,2,3,4])).toEqual(-2);
  });

  test('should have guard clauses in multiplyMatrix()', async () => {
    const matrixA = [1, 2, 3];
    const matrixB = [4, 5, 6]
    expect(transformations.multiplyMatrix(false, matrixB)).toEqual(matrixB);
    expect(transformations.multiplyMatrix(matrixA, false)).toEqual(matrixA);
  });

  test('should box transform a matrix', async () => {
    //Test the guard clause
    expect(transformations.transformBox(false)).toEqual(false)

    const matrixInput = [1, 2, 3, 4, 5, 6];

    const boxInput = [1, 2, 3, 4];

    expect(transformations.transformBox(boxInput, matrixInput)).toEqual([12, 16, 20, 28]);
    
    //test minX maxX minY and maxY values

    const matrixInputMinMaxTest = [100, 2, 3, 4, 5, 6];

    const boxInputMinMaxTest = [100, 2, 3, 4];

    expect(transformations.transformBox(boxInputMinMaxTest, matrixInputMinMaxTest)).toEqual([311, 20, 10017, 222]);

  })
});