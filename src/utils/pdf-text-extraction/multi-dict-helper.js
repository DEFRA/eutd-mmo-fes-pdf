const _ = require('lodash');

function MultiDictHelper(dicts) {
    this.dicts = dicts;
}

MultiDictHelper.prototype.exists = function(name) {
    return _.some(this.dicts,(dict)=> {
        return dict.exists(name);
    });
}

MultiDictHelper.prototype.queryDictionaryObject = function(name,pdfReader) {
    const dict = _.find(this.dicts,(d)=> {
        return d.exists(name);
    });

    if(!!dict) {
        return pdfReader.queryDictionaryObject(dict,name);
    }
    else 
        return null;
}

module.exports = MultiDictHelper