const MultiDictHelper = require("../../src/utils/pdf-text-extraction/multi-dict-helper");
describe('Multi dict', () => {
  
  test('should return null from queryDictionaryObject if there is not dictionary definitions', async () => {
    const dict = new MultiDictHelper(false);
    const result = dict.queryDictionaryObject('test', 'pdfReader')
    expect(result).toEqual(null)
  })
});