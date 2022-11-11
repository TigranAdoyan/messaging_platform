const _ = require('lodash');

Array.prototype.unique = function () {
    let arrCopy = _.cloneDeep(this);

    for (let i = 0; i < arrCopy.length; ++i) {
        for (let j = i + 1; j < arrCopy.length; ++j) {
            if (_.isEqual(arrCopy[i],arrCopy[j]))
                arrCopy.splice(j--, 1);
        }
    }

    return arrCopy;
};