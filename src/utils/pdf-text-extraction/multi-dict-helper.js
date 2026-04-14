const _ = require('lodash');

// eslint-disable-next-line no-use-before-define
class MultiDictHelper {
    constructor(dicts) {
        this.dicts = dicts;
    }

    exists(name) {
        return _.some(this.dicts, (dict) => {
            return dict.exists(name);
        });
    }

    queryDictionaryObject(name, pdfReader) {
        const dict = _.find(this.dicts, (d) => {
            return d.exists(name);
        });

        if(dict) {
            return pdfReader.queryDictionaryObject(dict, name);
        }
        
        return null;
    }
}

module.exports = MultiDictHelper