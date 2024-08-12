const muhammara = require('muhammara');
const FontDecoding = require("../../src/utils/pdf-text-extraction/font-decoding")

const { beToNum, besToUnicodes, getStandardEncodingMap, parseToUnicode, parseSimpleFontEncoding, setupDifferencesEncodingMap } = FontDecoding;

let toPDFStreamResult;

let pdfReaderMock = {};

let fontMock = {};

let encodingMock = {};

const standardEncodingMap = {
       "100": "d",
       "101": "e",
       "102": "f",
       "103": "g",
       "104": "h",
       "105": "i",
       "106": "j",
       "107": "k",
       "108": "l",
       "109": "m",
       "110": "n",
       "111": "o",
       "112": "p",
       "113": "q",
       "114": "r",
       "115": "s",
       "116": "t",
       "117": "u",
       "118": "v",
       "119": "w",
       "120": "x",
       "121": "y",
       "122": "z",
       "123": "braceleft",
       "124": "bar",
       "125": "braceright",
       "126": "asciitilde",
       "161": "exclamdown",
       "162": "cent",
       "163": "sterling",
       "164": "fraction",
       "165": "yen",
       "166": "florin",
       "167": "section",
       "168": "currency",
       "169": "quotesingle",
       "170": "quotedblleft",
       "171": "guillemotleft",
       "172": "guilsinglleft",
       "173": "guilsinglright",
       "174": "fi",
       "175": "fl",
       "177": "endash",
       "178": "dagger",
       "179": "daggerdbl",
       "180": "periodcentered",
       "182": "paragraph",
       "183": "bullet",
       "184": "quotesinglbase",
       "185": "quotedblbase",
       "186": "quotedblright",
       "187": "guillemotright",
       "188": "ellipsis",
       "189": "perthousand",
       "191": "questiondown",
       "193": "grave",
       "194": "acute",
       "195": "circumflex",
       "196": "tilde",
       "197": "macron",
       "198": "breve",
       "199": "dotaccent",
       "200": "dieresis",
       "202": "ring",
       "203": "cedilla",
       "205": "hungarumlaut",
       "206": "ogonek",
       "207": "caron",
       "208": "emdash",
       "225": "AE",
       "227": "ordfeminine",
       "232": "Lslash",
       "233": "Oslash",
       "234": "OE",
       "235": "ordmasculine",
       "241": "ae",
       "245": "dotlessi",
       "248": "lslash",
       "249": "oslash",
       "250": "oe",
       "251": "germandbls",
       "32": "space",
       "33": "exclam",
       "34": "quotedbl",
       "35": "numbersign",
       "36": "dollar",
       "37": "percent",
       "38": "ampersand",
       "39": "quoteright",
       "40": "parenleft",
       "41": "parenright",
       "42": "asterisk",
       "43": "plus",
       "44": "comma",
       "45": "hyphen",
       "46": "period",
       "47": "slash",
       "48": "zero",
       "49": "one",
       "50": "two",
       "51": "three",
       "52": "four",
       "53": "five",
       "54": "six",
       "55": "seven",
       "56": "eight",
       "57": "nine",
       "58": "colon",
       "59": "semicolon",
       "60": "less",
       "61": "equal",
       "62": "greater",
       "63": "question",
       "64": "at",
       "65": "A",
       "66": "B",
       "67": "C",
       "68": "D",
       "69": "E",
       "70": "F",
       "71": "G",
       "72": "H",
       "73": "I",
       "74": "J",
       "75": "K",
       "76": "L",
       "77": "M",
       "78": "N",
       "79": "O",
       "80": "P",
       "81": "Q",
       "82": "R",
       "83": "S",
       "84": "T",
       "85": "U",
       "86": "V",
       "87": "W",
       "88": "X",
       "89": "Y",
       "90": "Z",
       "91": "bracketleft",
       "92": "backslash",
       "93": "bracketright",
       "94": "asciicircum",
       "95": "underscore",
       "96": "quoteleft",
       "97": "a",
       "98": "b",
       "99": "c",
};

describe('font encoder', () => {

  beforeEach(() => {
    toPDFStreamResult = undefined;

    pdfReaderMock = {
      value: 'value',
      jsArray: [],
      parseNewObject: () => encodingMock,
      queryDictionaryObject: () => pdfReaderMock,
      toPDFDictionary: () => {},
      toPDFArray: () => pdfReaderMock,
      toJSArray: () => pdfReaderMock.jsArray,
    };

    fontMock = {
      existsResult: false,
      exists: () => fontMock.existsResult,
    };

    encodingMock = {
      existsResult: true,
      exists: () => encodingMock.existsResult,
      toPDFIndirectObjectReference: () => encodingMock,
      getObjectID: () => [],
      getType: () => muhammara.ePDFObjectIndirectObjectReference,
      toPDFStream: () => toPDFStreamResult
    };

  });

  test('should provide beToNum results', async () => {
    const result = beToNum([1, 2, 3, 4], 0, 2);

    expect(result).toEqual(258)
  })

  test('should return besToUnicodes', async () => {
    const results = besToUnicodes([1, 2, 3, 4]);

    expect(results).toEqual([258, 772]);
  })

  test('should trigger parseToUnicode() guard clause if stream returns false', async () => {
    const results = parseToUnicode(pdfReaderMock, {});

    expect(results).toEqual(null)
  })

  test('should provide setupDifferencesEncodingMap() result', async () => {
    let result = setupDifferencesEncodingMap(pdfReaderMock, fontMock, encodingMock);

    encodingMock.existsResult = true;

    expect(result).toEqual(standardEncodingMap);

    encodingMock.existsResult = false;

    result = setupDifferencesEncodingMap(pdfReaderMock, fontMock, encodingMock);

    expect(result).toEqual(standardEncodingMap);

    pdfReaderMock.value = false;

    result = setupDifferencesEncodingMap(pdfReaderMock, fontMock, encodingMock);

    expect(result).toEqual(standardEncodingMap);

    pdfReaderMock.value = 'MacRomanEncoding';

    result = setupDifferencesEncodingMap(pdfReaderMock, fontMock, encodingMock);

    expect(result).toEqual(standardEncodingMap);

    //mock some results 
    encodingMock.existsResult = true;
    pdfReaderMock.jsArray = [{value: '32', getType: () => muhammara.ePDFObjectName}];//replace the space

    result = setupDifferencesEncodingMap(pdfReaderMock, fontMock, encodingMock);

    const nonStandardEncodingMap = {
      "100": "d",
      "101": "e",
      "102": "f",
      "103": "g",
      "104": "h",
      "105": "i",
      "106": "j",
      "107": "k",
      "108": "l",
      "109": "m",
      "110": "n",
      "111": "o",
      "112": "p",
      "113": "q",
      "114": "r",
      "115": "s",
      "116": "t",
      "117": "u",
      "118": "v",
      "119": "w",
      "120": "x",
      "121": "y",
      "122": "z",
      "123": "braceleft",
      "124": "bar",
      "125": "braceright",
      "126": "asciitilde",
      "128": "Adieresis",
      "129": "Aring",
      "130": "Ccedilla",
      "131": "Eacute",
      "132": "Ntilde",
      "133": "Odieresis",
      "134": "Udieresis",
      "135": "aacute",
      "136": "agrave",
      "137": "acircumflex",
      "138": "adieresis",
      "139": "atilde",
      "140": "aring",
      "141": "ccedilla",
      "142": "eacute",
      "143": "egrave",
      "144": "ecircumflex",
      "145": "edieresis",
      "146": "iacute",
      "147": "igrave",
      "148": "icircumflex",
      "149": "idieresis",
      "150": "ntilde",
      "151": "oacute",
      "152": "ograve",
      "153": "ocircumflex",
      "154": "odieresis",
      "155": "otilde",
      "156": "uacute",
      "157": "ugrave",
      "158": "ucircumflex",
      "159": "udieresis",
      "160": "dagger",
      "161": "degree",
      "162": "cent",
      "163": "sterling",
      "164": "section",
      "165": "bullet",
      "166": "paragraph",
      "167": "germandbls",
      "168": "registered",
      "169": "copyright",
      "170": "trademark",
      "171": "acute",
      "172": "dieresis",
      "174": "AE",
      "175": "Oslash",
      "177": "plusminus",
      "180": "yen",
      "181": "mu",
      "187": "ordfeminine",
      "188": "ordmasculine",
      "190": "ae",
      "191": "oslash",
      "192": "questiondown",
      "193": "exclamdown",
      "194": "logicalnot",
      "196": "florin",
      "199": "guillemotleft",
      "200": "guillemotright",
      "201": "ellipsis",
      "202": "space",
      "203": "Agrave",
      "204": "Atilde",
      "205": "Otilde",
      "206": "OE",
      "207": "oe",
      "208": "endash",
      "209": "emdash",
      "210": "quotedblleft",
      "211": "quotedblright",
      "212": "quoteleft",
      "213": "quoteright",
      "214": "divide",
      "216": "ydieresis",
      "217": "Ydieresis",
      "218": "fraction",
      "219": "currency",
      "220": "guilsinglleft",
      "221": "guilsinglright",
      "222": "fi",
      "223": "fl",
      "224": "daggerdbl",
      "225": "periodcentered",
      "226": "quotesinglbase",
      "227": "quotedblbase",
      "228": "perthousand",
      "229": "Acircumflex",
      "230": "Ecircumflex",
      "231": "Aacute",
      "232": "Edieresis",
      "233": "Egrave",
      "234": "Iacute",
      "235": "Icircumflex",
      "236": "Idieresis",
      "237": "Igrave",
      "238": "Oacute",
      "239": "Ocircumflex",
      "241": "Ograve",
      "242": "Uacute",
      "243": "Ucircumflex",
      "244": "Ugrave",
      "245": "dotlessi",
      "246": "circumflex",
      "247": "tilde",
      "248": "macron",
      "249": "breve",
      "250": "dotaccent",
      "251": "ring",
      "252": "cedilla",
      "253": "hungarumlaut",
      "254": "ogonek",
      "255": "caron",
      "32": "space",
      "33": "exclam",
      "34": "quotedbl",
      "35": "numbersign",
      "36": "dollar",
      "37": "percent",
      "38": "ampersand",
      "39": "quotesingle",
      "40": "parenleft",
      "41": "parenright",
      "42": "asterisk",
      "43": "plus",
      "44": "comma",
      "45": "hyphen",
      "46": "period",
      "47": "slash",
      "48": "zero",
      "49": "one",
      "50": "two",
      "51": "three",
      "52": "four",
      "53": "five",
      "54": "six",
      "55": "seven",
      "56": "eight",
      "57": "nine",
      "58": "colon",
      "59": "semicolon",
      "60": "less",
      "61": "equal",
      "62": "greater",
      "63": "question",
      "64": "at",
      "65": "A",
      "66": "B",
      "67": "C",
      "68": "D",
      "69": "E",
      "70": "F",
      "71": "G",
      "72": "H",
      "73": "I",
      "74": "J",
      "75": "K",
      "76": "L",
      "77": "M",
      "78": "N",
      "79": "O",
      "80": "P",
      "81": "Q",
      "82": "R",
      "83": "S",
      "84": "T",
      "85": "U",
      "86": "V",
      "87": "W",
      "88": "X",
      "89": "Y",
      "90": "Z",
      "91": "bracketleft",
      "92": "backslash",
      "93": "bracketright",
      "94": "asciicircum",
      "95": "underscore",
      "96": "grave",
      "97": "a",
      "98": "b",
      "99": "c",
    }

    expect(result).toEqual(nonStandardEncodingMap);
  })

  test('should return mac related encodings', async () => {
    let result = getStandardEncodingMap('MacExpertEncoding');
    const macExpertExpectation = {"100": "Dsmall", "101": "Esmall", "102": "Fsmall", "103": "Gsmall", "104": "Hsmall", "105": "Ismall", "106": "Jsmall", "107": "Ksmall", "108": "Lsmall", "109": "Msmall", "110": "Nsmall", "111": "Osmall", "112": "Psmall", "113": "Qsmall", "114": "Rsmall", "115": "Ssmall", "116": "Tsmall", "117": "Usmall", "118": "Vsmall", "119": "Wsmall", "120": "Xsmall", "121": "Ysmall", "122": "Zsmall", "123": "colonmonetary", "124": "onefitted", "125": "rupiah", "126": "Tildesmall", "129": "asuperior", "130": "centsuperior", "135": "Aacutesmall", "136": "Agravesmall", "137": "Acircumflexsmall", "138": "Adieresissmall", "139": "Atildesmall", "140": "Aringsmall", "141": "Ccedillasmall", "142": "Eacutesmall", "143": "Egravesmall", "144": "Ecircumflexsmall", "145": "Edieresissmall", "146": "Iacutesmall", "147": "Igravesmall", "148": "Icircumflexsmall", "149": "Idieresissmall", "150": "Ntildesmall", "151": "Oacutesmall", "152": "Ogravesmall", "153": "Ocircumflexsmall", "154": "Odieresissmall", "155": "Otildesmall", "156": "Uacutesmall", "157": "Ugravesmall", "158": "Ucircumflexsmall", "159": "Udieresissmall", "161": "eightsuperior", "162": "fourinferior", "163": "threeinferior", "164": "sixinferior", "165": "eightinferior", "166": "seveninferior", "167": "Scaronsmall", "169": "centinferior", "170": "twoinferior", "172": "Dieresissmall", "174": "Caronsmall", "175": "osuperior", "176": "fiveinferior", "178": "commainferior", "179": "periodinferior", "180": "Yacutesmall", "182": "dollarinferior", "185": "Thornsmall", "187": "nineinferior", "188": "zeroinferior", "189": "Zcaronsmall", "190": "AEsmall", "191": "Oslashsmall", "192": "questiondownsmall", "193": "oneinferior", "194": "Lslashsmall", "201": "Cedillasmall", "207": "OEsmall", "208": "figuredash", "209": "hyphensuperior", "214": "exclamdownsmall", "216": "Ydieresissmall", "218": "onesuperior", "219": "twosuperior", "220": "threesuperior", "221": "foursuperior", "222": "fivesuperior", "223": "sixsuperior", "224": "sevensuperior", "225": "ninesuperior", "226": "zerosuperior", "228": "esuperior", "229": "rsuperior", "230": "tsuperior", "233": "isuperior", "234": "ssuperior", "235": "dsuperior", "241": "lsuperior", "242": "Ogoneksmall", "243": "Brevesmall", "244": "Macronsmall", "245": "bsuperior", "246": "nsuperior", "247": "msuperior", "248": "commasuperior", "249": "periodsuperior", "250": "Dotaccentsmall", "251": "Ringsmall", "32": "space", "33": "exclamsmall", "34": "Hungarumlautsmall", "35": "centoldstyle", "36": "dollaroldstyle", "37": "dollarsuperior", "38": "ampersandsmall", "39": "Acutesmall", "40": "parenleftsuperior", "41": "parenrightsuperior", "42": "twodotenleader", "43": "onedotenleader", "44": "comma", "45": "hyphen", "46": "period", "47": "fraction", "48": "zerooldstyle", "49": "oneoldstyle", "50": "twooldstyle", "51": "threeoldstyle", "52": "fouroldstyle", "53": "fiveoldstyle", "54": "sixoldstyle", "55": "sevenoldstyle", "56": "eightoldstyle", "57": "nineoldstyle", "58": "colon", "59": "semicolon", "61": "threequartersemdash", "63": "questionsmall", "68": "Ethsmall", "71": "onequarter", "72": "onehalf", "73": "threequarters", "74": "oneeighth", "75": "threeeighths", "76": "fiveeighths", "77": "seveneighths", "78": "onethird", "79": "twothirds", "86": "ff", "87": "fi", "88": "fl", "89": "ffi", "90": "ffl", "91": "parenleftinferior", "93": "parenrightinferior", "94": "Circumflexsmall", "95": "hypheninferior", "96": "Gravesmall", "97": "Asmall", "98": "Bsmall", "99": "Csmall"}
    
    expect(result).toEqual(macExpertExpectation);

    result = getStandardEncodingMap('MacRomanEncoding');
    const macRomanEncodingExpectation = {"100": "d", "101": "e", "102": "f", "103": "g", "104": "h", "105": "i", "106": "j", "107": "k", "108": "l", "109": "m", "110": "n", "111": "o", "112": "p", "113": "q", "114": "r", "115": "s", "116": "t", "117": "u", "118": "v", "119": "w", "120": "x", "121": "y", "122": "z", "123": "braceleft", "124": "bar", "125": "braceright", "126": "asciitilde", "128": "Adieresis", "129": "Aring", "130": "Ccedilla", "131": "Eacute", "132": "Ntilde", "133": "Odieresis", "134": "Udieresis", "135": "aacute", "136": "agrave", "137": "acircumflex", "138": "adieresis", "139": "atilde", "140": "aring", "141": "ccedilla", "142": "eacute", "143": "egrave", "144": "ecircumflex", "145": "edieresis", "146": "iacute", "147": "igrave", "148": "icircumflex", "149": "idieresis", "150": "ntilde", "151": "oacute", "152": "ograve", "153": "ocircumflex", "154": "odieresis", "155": "otilde", "156": "uacute", "157": "ugrave", "158": "ucircumflex", "159": "udieresis", "160": "dagger", "161": "degree", "162": "cent", "163": "sterling", "164": "section", "165": "bullet", "166": "paragraph", "167": "germandbls", "168": "registered", "169": "copyright", "170": "trademark", "171": "acute", "172": "dieresis", "174": "AE", "175": "Oslash", "177": "plusminus", "180": "yen", "181": "mu", "187": "ordfeminine", "188": "ordmasculine", "190": "ae", "191": "oslash", "192": "questiondown", "193": "exclamdown", "194": "logicalnot", "196": "florin", "199": "guillemotleft", "200": "guillemotright", "201": "ellipsis", "202": "space", "203": "Agrave", "204": "Atilde", "205": "Otilde", "206": "OE", "207": "oe", "208": "endash", "209": "emdash", "210": "quotedblleft", "211": "quotedblright", "212": "quoteleft", "213": "quoteright", "214": "divide", "216": "ydieresis", "217": "Ydieresis", "218": "fraction", "219": "currency", "220": "guilsinglleft", "221": "guilsinglright", "222": "fi", "223": "fl", "224": "daggerdbl", "225": "periodcentered", "226": "quotesinglbase", "227": "quotedblbase", "228": "perthousand", "229": "Acircumflex", "230": "Ecircumflex", "231": "Aacute", "232": "Edieresis", "233": "Egrave", "234": "Iacute", "235": "Icircumflex", "236": "Idieresis", "237": "Igrave", "238": "Oacute", "239": "Ocircumflex", "241": "Ograve", "242": "Uacute", "243": "Ucircumflex", "244": "Ugrave", "245": "dotlessi", "246": "circumflex", "247": "tilde", "248": "macron", "249": "breve", "250": "dotaccent", "251": "ring", "252": "cedilla", "253": "hungarumlaut", "254": "ogonek", "255": "caron", "32": "space", "33": "exclam", "34": "quotedbl", "35": "numbersign", "36": "dollar", "37": "percent", "38": "ampersand", "39": "quotesingle", "40": "parenleft", "41": "parenright", "42": "asterisk", "43": "plus", "44": "comma", "45": "hyphen", "46": "period", "47": "slash", "48": "zero", "49": "one", "50": "two", "51": "three", "52": "four", "53": "five", "54": "six", "55": "seven", "56": "eight", "57": "nine", "58": "colon", "59": "semicolon", "60": "less", "61": "equal", "62": "greater", "63": "question", "64": "at", "65": "A", "66": "B", "67": "C", "68": "D", "69": "E", "70": "F", "71": "G", "72": "H", "73": "I", "74": "J", "75": "K", "76": "L", "77": "M", "78": "N", "79": "O", "80": "P", "81": "Q", "82": "R", "83": "S", "84": "T", "85": "U", "86": "V", "87": "W", "88": "X", "89": "Y", "90": "Z", "91": "bracketleft", "92": "backslash", "93": "bracketright", "94": "asciicircum", "95": "underscore", "96": "grave", "97": "a", "98": "b", "99": "c"};
    
    expect(result).not.toEqual(macExpertExpectation);
    expect(result).toEqual(macRomanEncodingExpectation);

    result = getStandardEncodingMap('nonesense');

    expect(result).toEqual(null);
    expect(result).not.toEqual(macExpertExpectation);
    expect(result).not.toEqual(macRomanEncodingExpectation);

  })

  test('should parse simple font encodings', async () => {
    const fakeSelf = {};    

    parseSimpleFontEncoding(fakeSelf, pdfReaderMock, fontMock, encodingMock);
    
    expect(fakeSelf.fromSimpleEncodingMap).toEqual(standardEncodingMap);
    expect(fakeSelf.hasSimpleEncoding).toEqual(true);
  })

});