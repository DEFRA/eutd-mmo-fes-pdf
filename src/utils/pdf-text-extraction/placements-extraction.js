const muhammara = require('muhammara');
const _ = require('lodash');
const PDFInterpreter = require('./pdf-interpreter');
const MultiDictHelper = require('./multi-dict-helper');

function collectXObjectForm(forms, xobjectName, xobjectObjectId, xobject, pdfReader) {
    if(xobject.getType() !== muhammara.ePDFObjectStream) {
        return;
    }
    const xobjectStream = xobject.toPDFStream();
    const xobjectDict = xobjectStream.getDictionary();
    if(xobjectDict.queryObject('Subtype').value === 'Form') {
        forms[xobjectName] = {
            id: xobjectObjectId,
            xobject: xobjectStream,
            matrix: xobjectDict.exists('Matrix') ? _.map(pdfReader.queryDictionaryObject(xobjectDict,'Matrix').toPDFArray().toJSArray(),item=>item.value):null
        };
    }
}

function collectXObjects(forms, xobjects, pdfReader) {
    const xobjectsJS = xobjects.toJSObject();
    _.forOwn(xobjectsJS,(xobjectReference,xobjectName)=>{
        const xobjectObjectId = xobjectReference.toPDFIndirectObjectReference().getObjectID();
        const xobject = pdfReader.parseNewObject(xobjectObjectId);
        collectXObjectForm(forms, xobjectName, xobjectObjectId, xobject, pdfReader);
    });
}

function parseInterestingResources(resourcesDicts,pdfReader,readResources) {
    const forms = {};
    const result = {forms};

    if(resourcesDicts) {
        if(resourcesDicts.exists('XObject')) {
            const xobjects = resourcesDicts.queryDictionaryObject('XObject',pdfReader);
            if(xobjects) {
                collectXObjects(forms, xobjects, pdfReader);
            }
        }

        if(readResources) {
            readResources(resourcesDicts,pdfReader,result);
        }
    }

    return result;
}

function getResourcesDictionary(anObject,pdfReader) {
    return anObject.exists('Resources') ? pdfReader.queryDictionaryObject(anObject,'Resources').toPDFDictionary():null;
}

function getResourcesDictionaries(anObject,pdfReader) {
    // gets an array of resources dictionaries, going up parents. should
    // grab 1 for forms, and 1 or more for pages
    const resourcesDicts = [];
    while(anObject) {
        const dict = getResourcesDictionary(anObject,pdfReader);
        if(dict) {
            resourcesDicts.push(dict);
        }

        if(anObject.exists('Parent')) {
            const parentDict = pdfReader.queryDictionaryObject(anObject,'Parent');
            if(parentDict.getType() === muhammara.ePDFObjectDictionary) {
                anObject = parentDict.toPDFDictionary();
            } else {
                anObject = null;
            }
        }
        else {
            anObject = null;
        }
    }
    return new MultiDictHelper(resourcesDicts);
}

function inspectPages(pdfReader,collectPlacements,readResources) {
    const formsUsed = {};
    const pagesPlacements = [];
    // iterate pages, fetch placements, and mark forms for later additional inspection
    for(let i=0;i<pdfReader.getPagesCount();++i) {
        const pageDictionary = pdfReader.parsePageDictionary(i);

        const placements = [];
        pagesPlacements.push(placements);

        const interpreter = new PDFInterpreter();
        interpreter.interpretPageContents(pdfReader,pageDictionary,collectPlacements(
            parseInterestingResources(getResourcesDictionaries(pageDictionary,pdfReader),pdfReader,readResources),
            placements,
            formsUsed
        ));
    }

    return {
        pagesPlacements,
        formsUsed
    };
}

function inspectForms(formsToProcess,pdfReader,formsBacklog,collectPlacements,readResources) {
    if(Object.keys(formsToProcess).length === 0) {
        return formsBacklog;
    }
    // add fresh entries to backlog for the sake of registering the forms as discovered,
    // and to provide structs for filling with placement data
    formsBacklog = _.extend(formsBacklog,_.mapValues(formsToProcess,()=>{return []}));
    const formsUsed = {};
    _.forOwn(formsToProcess,(form,formId)=> {
        const interpreter = new PDFInterpreter();
        interpreter.interpretXObjectContents(pdfReader,form,collectPlacements(
            parseInterestingResources(getResourcesDictionaries(form.getDictionary(),pdfReader),pdfReader,readResources),
            formsBacklog[formId],
            formsUsed
        ));
    });

    const newUsedForms = _.pickBy(formsUsed,(_form,formId)=> {
        return !formsBacklog[formId];
    });
    // recurse to new forms
    inspectForms(newUsedForms,pdfReader,formsBacklog,collectPlacements,readResources);

    // return final result
    return formsBacklog;
}


function extractPlacements(pdfReader,collectPlacements,readResources) {
    const {pagesPlacements,formsUsed} = inspectPages(pdfReader,collectPlacements,readResources);

    const formsPlacements = inspectForms(formsUsed,pdfReader,null,collectPlacements,readResources);
    return {
        pagesPlacements,
        formsPlacements
    };
}

module.exports = extractPlacements;