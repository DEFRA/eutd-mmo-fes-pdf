const muhammara = require('muhammara');
const _ = require('lodash');
const extractPlacements = require('./placements-extraction');
const transformations = require('./transformations');
const CollectionState = require('./collection-state');
const FontDecoding = require('./font-decoding');

// unique id provider for font decoding
let uniqueId = 0;

function readResources(resourcesDicts,pdfReader,result) {
    const extGStates = {};
    const fonts = {};

    if(resourcesDicts.exists('ExtGState')) {
        const extGStatesEntry = resourcesDicts.queryDictionaryObject('ExtGState',pdfReader);
        if(!!extGStatesEntry) {
            const extGStatesJS = extGStatesEntry.toPDFDictionary().toJSObject();
            _.forOwn(extGStatesJS,(extGState,extGStateName)=>{
                if(extGState.getType() === muhammara.ePDFObjectIndirectObjectReference) {
                    extGState = pdfReader.parseNewObject(extGState.toPDFIndirectObjectReference().getObjectID()).toPDFDictionary();
                }
                else {
                    extGState = extGState.toPDFDictionary();
                }

                if(!!extGState) {
                    const item = {
                        theObject: extGState
                    };
                    // all i care about are font entries, so store it so i dont have to parse later (will cause trouble with interpretation)
                    if(extGState.exists('Font')) {
                        const fontEntry = pdfReader.queryDictionaryObject(extGState.toPDFDictionary(),'Font');
                        item.font = {
                            reference:fontEntry.queryObject[0].toPDFIndirectObjectReference().getObjectID(),
                            size:fontEntry.queryObject[1].value
                        };
                    }

                    extGStates[extGStateName] = item;
                }
            });
        }
    } 

    if(resourcesDicts.exists('Font')) {
        const fontsEntry = resourcesDicts.queryDictionaryObject('Font',pdfReader);
        if(!!fontsEntry) {
            const fontsJS = fontsEntry.toPDFDictionary().toJSObject();
            _.forOwn(fontsJS,(fontReference,fontName)=>{
                let font;
                if(fontReference.getType() === muhammara.ePDFObjectIndirectObjectReference) {
                    font = {objectId:fontReference.toPDFIndirectObjectReference().getObjectID()};
                }
                else {
                    font = {embeddedObjectId :'embeddedId_'+uniqueId, embeddedObject:fontReference.toPDFDictionary()};
                    ++uniqueId;
                }
                fonts[fontName] = font;
            });
        }
    }    

    result.extGStates = extGStates;
    result.fonts = fonts;
}

function Tc(charSpace,state) {
    state.currentTextState().charSpace = charSpace;
}

function Tw(wordSpace,state) {
    state.currentTextState().wordSpace = wordSpace;
}


function setTm(newM,state) {
    const currentTextEnv = state.currentTextState();
    currentTextEnv.tlm = newM.slice();
    currentTextEnv.tm = newM.slice();
    currentTextEnv.tmDirty = true;
    currentTextEnv.tlmDirty = true;
}

function Td(tx,ty,state) {
    setTm(transformations.multiplyMatrix([1,0,0,1,tx,ty],state.currentTextState().tlm),state);
}

function TL(leading,state) {
    state.currentTextState().leading = leading;
}

function TStar(state) {
    // there's an error in the book explanation
    // but we know better. leading goes below,
    // not up. this is further explicated by
    // the TD explanation
    Td(0,-state.currentTextState().leading,state);
}

function Quote(text,state,placements) {
    TStar(state);
    textPlacement({asEncodedText:text.value,asBytes:text.toBytesArray()},state,placements);
}

function textPlacement(input,state,placements) {
    const item = {
            text:input,
            ctm:state.currentGraphicState().ctm.slice(),
            textState:state.cloneCurrentTextState()
        };
        state.currentTextState().tmDirty = false;
        state.currentTextState().tlmDirty = false;
    state.texts.push(item);
}

function collectPlacements(resources,placements,formsUsed) {
    const state = new CollectionState();
    let param, param1, param2 ;

    return (operatorName,operands)=> {
        switch(operatorName) {
            // Graphic State Operators
            case 'q': {
                state.pushGraphicState();
                break;
            }

            case 'Q': {
                state.popGraphicState();
                break;
            }

            case 'cm': {
                const newMatrix = _.map(operands,item => item.value);
                state.currentGraphicState().ctm = transformations.multiplyMatrix(newMatrix,state.currentGraphicState().ctm);
                break;
            }

            case 'gs': {
                const gstateName = operands.pop();
                if(resources.extGStates[gstateName.value]) {
                    if(resources.extGStates[gstateName.value].font)
                        state.currentTextState().text.font = _.extend({},resources.extGStates[gstateName.value].font);
                }
                break;
            }

            // XObject placement
            case 'Do': {
                // add placement, if form, and mark for later inspection
                const formName = operands.pop();
                if(resources.forms[formName.value]) {
                    const form = resources.forms[formName.value];
                    placements.push({
                        type:'xobject',
                        objectId:form.id,
                        matrix: form.matrix ? form.matrix.slice():null,
                        ctm:state.currentGraphicState().ctm.slice()
                    });
                    // add for later inspection (helping the extraction method a bit..[can i factor out? interesting enough?])
                    formsUsed[resources.forms[formName.value].id] = resources.forms[formName.value].xobject;
                }
                break;
            }

            // Text State Operators
            case 'Tc': {
                param = operands.pop();
                Tc(param.value,state);
                break;
            }
            case 'Tw': {
                param = operands.pop();
                Tw(param.value,state);
                break;
            }
            case 'Tz': {
                param = operands.pop();
                state.currentTextState().scale = param.value;
                break;
            }
            case 'TL': {
                param = operands.pop();
                TL(param.value,state);
                break;
            }     
            case 'Ts': {
                param = operands.pop();
                state.currentTextState().rise = param.value;
                break;
            }     
            case 'Tf': {
                const size = operands.pop();
                const fontName = operands.pop();
                if(resources.fonts[fontName.value]) {
                    state.currentTextState().font = {
                        reference:resources.fonts[fontName.value],
                        size: size.value
                    }
                }
                break;
            }   

            // Text elements operators
            case 'BT': {
                state.startTextElement();
                break;
            }

            case 'ET': {
                state.endTextElement(placements);
                break;
            }

            // Text positioining operators
            case 'Td': {
                param2 = operands.pop();
                param1 = operands.pop();
                Td(param1.value,param2.value,state);
                break;
            }
            case 'TD': {
                param2 = operands.pop();
                param1 = operands.pop();
                TL(-param2.value,state);
                Td(param1.value,param2.value,state);
                break;
            }
            case 'Tm': {
                setTm(_.map(operands,item => item.value),state);
                break;
            }
            case 'T*': {
                TStar(state);
                break;
            }

            // Text placement operators
            case 'Tj': {
                param = operands.pop();
                textPlacement({asEncodedText:param.value,asBytes:param.toBytesArray()},state,placements);
                break;
            }
            case '\'': {
                param = operands.pop();
                Quote(param,state,placements);
                break;
            }
            case '"': {
                const param3 = operands.pop();
                param2 = operands.pop();
                param1 = operands.pop();
                 Tw(param1.value,state);
                 Tc(param2.value,state);
                 Quote(param3,state,placements);
                break;
            }
            case 'TJ': {
                const params = operands.pop().toPDFArray().toJSArray();
                textPlacement(_.map(params,(item)=>{
                    if(item.getType() === muhammara.ePDFObjectLiteralString || item.getType() === muhammara.ePDFObjectHexString) 
                        return {asEncodedText:item.value,asBytes:item.toBytesArray()};
                    else
                        return item.value;
                }),state,placements);
                break;
            }
        }
    };
}

function fetchFontDecoder(item,pdfReader,state) {
    const fontReference = item.textState.font.reference.embeddedObjectId || item.textState.font.reference.objectId;
    if(!state.fontDecoders[fontReference]) {
        const fontObject = item.textState.font.reference.objectId ? 
                pdfReader.parseNewObject(item.textState.font.reference.objectId).toPDFDictionary() :
                item.textState.font.reference.embeddedObject;

        state.fontDecoders[fontReference] = new FontDecoding(pdfReader,fontObject);
    }
    return state.fontDecoders[fontReference];
}

function translateText(pdfReader,textItem,state,item) {
    const decoder = fetchFontDecoder(item, pdfReader, state);
    const translation = decoder.translate(textItem.asBytes);
    textItem.asText = translation.result;
    textItem.translationMethod = translation.method;
}

function translatePlacements(state,pdfReader,placements) {
    // iterate the placements, getting the texts and translating them
    placements.forEach((placement,index)=> {
        if(placement.type === 'text') {
            placement.text.forEach((item,indexItem)=> {
                if(_.isArray(item.text)) {
                    // TJ case
                    
                    // translated parts
                    item.text.forEach((textItem)=> {
                        if(textItem.asBytes) {
                            // in case it's text and not position change
                            translateText(pdfReader,textItem,state,item);
                        }
                    });

                    // save all text (concating to bring to attention undefineds as single cases and not have barings on all the string)
                    item.allText = _.reduce(item.text,(result,textItem)=> {
                        if(textItem.asBytes) {
                            return {
                                asBytes: result.asBytes.concat(textItem.asBytes),
                                asText: result.asText.concat(textItem.asText.length == 0 ? ' ':textItem.asText),
                                translationMethod: textItem.translationMethod
                            }
                        }
                        else
                            return result;
                    },{asBytes:[],asText:'',translationMethod:null});
                }
                else {
                    // Tj case
                    translateText(pdfReader,item.text,state,item);
                }
            });
        }
    });
}


function translate(state,pdfReader,pagesPlacements,formsPlacements) {
    pagesPlacements.forEach(
        (placements,index)=>{
            translatePlacements(state,pdfReader,placements)
        }
    );
    _.forOwn(formsPlacements,
        (placements,objectId)=>{
            translatePlacements(state,pdfReader,placements)
        }
    );

    return {
        pagesPlacements,
        formsPlacements
    };
}

function computePlacementsDimensions(state, pdfReader, placements) {
    // iterate the placements computing bounding boxes
    placements.forEach((placement)=> {
        if(placement.type === 'text') {
            // this is a BT..ET sequance 
            let nextPlacementDefaultTm = null;
            placement.text.forEach((item)=> {
                // if matrix is not dirty (no matrix changing operators were running betwee items), replace with computed matrix of the previous round.
                if(!item.textState.tmDirty && nextPlacementDefaultTm)
                    item.textState.tm = nextPlacementDefaultTm.slice();

                // Compute matrix and placement after this text
                const decoder = fetchFontDecoder(item, pdfReader, state);

                const { accumulatedDisplacement, minPlacement, maxPlacement, nextPlacementDefaultTmUp } = getPlacementData(item, decoder);
                nextPlacementDefaultTm = nextPlacementDefaultTmUp;
                item.textState.tmAtEnd = nextPlacementDefaultTm.slice();
                item.displacement = accumulatedDisplacement;
                const descentPlacement = ((decoder.descent || 0) + item.textState.rise)*item.textState.font.size/1000;
                const ascentPlacement = ((decoder.ascent) || 0 + item.textState.rise)*item.textState.font.size/1000;
                item.localBBox = [minPlacement,descentPlacement,maxPlacement,ascentPlacement];
            });
        }
    });
}

function computeDimensions(state,pdfReader,pagesPlacements,formsPlacements) {
    pagesPlacements.forEach((placements)=>{computePlacementsDimensions(state,pdfReader,placements)});
    _.forOwn(formsPlacements,(placements,objectId)=>{computePlacementsDimensions(state,pdfReader,placements)});

    return {
        pagesPlacements,
        formsPlacements
    };
}

function resolveForm(formObjectId,formsPlacements,resolvedForms) {
    if(!resolvedForms[formObjectId]) {
        resolvedForms[formObjectId] = true;
        formsPlacements[formObjectId] = resolveFormPlacements(formsPlacements[formObjectId],formsPlacements,resolvedForms);
    }
    return formsPlacements[formObjectId];
}

function resolveFormPlacements(objectPlacements,formsPlacements,resolvedForms) {
    for(let i=objectPlacements.length-1;i>=0;--i) {
        const placement = objectPlacements[i];
        if(placement.type === 'xobject') {
            // make sure form is resolved in itself
            const resolvedFormPlacements = resolveForm(placement.objectId,formsPlacements,resolvedForms);
            // grab its placements and make them our own
            const newPlacements = [i,1];
            resolvedFormPlacements.forEach((formTextPlacement)=> {
                // all of them have to be text placements now, cause it's resolved
                const clonedPlacemet = _.cloneDeep(formTextPlacement);
                // multiply with this placement CTM, and insert at this point
                clonedPlacemet.text.forEach((tp)=> {
                    const formMatrix = placement.matrix ? transformations.multiplyMatrix(placement.matrix,placement.ctm):placement.ctm;
                    tp.ctm = tp.ctm ? transformations.multiplyMatrix(tp.ctm,formMatrix):formMatrix;
                });
                newPlacements.push(clonedPlacemet);
            });
            // replace xobject placement with new text placements
            objectPlacements.splice.apply(objectPlacements,newPlacements);
        }
    }
    return objectPlacements;
}

function mergeForms(pagesPlacements,formsPlacements) {
    const state = {};

    // replace forms placements with their text placements
    return _.map(pagesPlacements,(pagePlacements)=> {return resolveFormPlacements(pagePlacements,formsPlacements,state);});
}

function flattenPlacements(pagesPlacements) {
    return _.map(pagesPlacements,(pagePlacements)=> {
        return _.reduce(pagePlacements,(result,pagePlacement)=> {
            const textPlacements = _.map(pagePlacement.text,(tp)=> {
                const matrix = transformations.multiplyMatrix(tp.textState.tm,tp.ctm);
                const newPlacement = {
                    text: tp.allText ? tp.allText.asText : tp.text.asText,
                    matrix:matrix,
                    localBBox: tp.localBBox.slice(),
                    globalBBox: transformations.transformBox(tp.localBBox,matrix)
                }
                return newPlacement;
            });
            return result.concat(textPlacements);
        },[]);
    });
}

const getMinPlacement = (accumulatedDisplacement, minPlacement) => {return accumulatedDisplacement < minPlacement ? accumulatedDisplacement : minPlacement;}

const getMaxPlacement = (accumulatedDisplacement, maxPlacement) => {return accumulatedDisplacement > maxPlacement ? accumulatedDisplacement : maxPlacement;}

const getPlacementData = (item, decoder) => {
    let accumulatedDisplacement = 0;
    let minPlacement = 0;
    let maxPlacement = 0;
    let tx;
    let nextPlacementDefaultTmUp = item.textState.tm;

    if (_.isArray(item.text)) {
        // TJ
        item.text.forEach((textItem)=> {
            if(textItem.asBytes) {
                 // marks a string
                decoder.iterateTextDisplacements(textItem.asBytes,(displacement,charCode)=> {
                    const wordSpace = charCode === 32 ? item.textState.wordSpace : 0;
                    tx = (displacement*item.textState.font.size + item.textState.charSpace + wordSpace)*item.textState.scale/100;
                    accumulatedDisplacement+=tx;
                    minPlacement = getMinPlacement(accumulatedDisplacement, minPlacement);
                    maxPlacement = getMaxPlacement(accumulatedDisplacement, maxPlacement);
                    nextPlacementDefaultTmUp = transformations.multiplyMatrix([1,0,0,1,tx,0],nextPlacementDefaultTmUp);
                });
            }
            else {
                tx = ((-textItem/1000)*item.textState.font.size)*item.textState.scale/100;
                accumulatedDisplacement+=tx;
                minPlacement = getMinPlacement(accumulatedDisplacement, minPlacement);
                maxPlacement = getMaxPlacement(accumulatedDisplacement, maxPlacement);
                nextPlacementDefaultTmUp = transformations.multiplyMatrix([1,0,0,1,tx,0],nextPlacementDefaultTmUp);
            }
        });
    }
    else {
        // Tj case
        decoder.iterateTextDisplacements(item.text.asBytes,(displacement,charCode)=> {
            const wordSpace = charCode === 32 ? item.textState.wordSpace : 0;
            tx = (displacement*item.textState.font.size + item.textState.charSpace + wordSpace)*item.textState.scale/100;

            accumulatedDisplacement+=tx;
            minPlacement = getMinPlacement(accumulatedDisplacement, minPlacement);
            maxPlacement = getMaxPlacement(accumulatedDisplacement, maxPlacement);
            nextPlacementDefaultTmUp = transformations.multiplyMatrix([1,0,0,1,tx,0],nextPlacementDefaultTmUp);
        });
    }
    return { accumulatedDisplacement, minPlacement, maxPlacement, tx, nextPlacementDefaultTmUp }
}

/**
 * Extracts text from all pages of the pdf.
 * end result is an array matching the pages of the pdf.
 * each item has an array of text placements.
 * each text placement is of the form:
 * {
 *      text: the text
 *      matrix: 6 numbers pdf matrix describing how the text is transformed in relation to the page (this includes position - translation)
 *      localBBox: 4 numbers box describing the text bounding box, before being transformed by matrix.
 *      globalBBox: 4 numbers box describing the text bounding box after transoformation, making it the bbox in relation to the page.
 *      
 * }
 */
function extractText(pdfReader) {
    // 1st phase - extract placements
    const {pagesPlacements,formsPlacements} = extractPlacements(pdfReader,collectPlacements,readResources);
    // 2nd phase - translate encoded bytes to text strings.
    const state = {fontDecoders:{}};
    translate(state,pdfReader,pagesPlacements,formsPlacements);
    // 3rd phase - compute dimensions
    computeDimensions(state,pdfReader,pagesPlacements,formsPlacements);
    // 4th phase - merge xobject forms
    const pagesPlacementsCombined =  mergeForms(pagesPlacements,formsPlacements);
    // 5th phase - flatten page placments, and simplify constructs
    return flattenPlacements(pagesPlacementsCombined);
}

module.exports = extractText;
