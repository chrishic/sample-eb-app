/*!
 * Sample Elastic Beanstalk App with MySQL
 * ---------------------------------------
 * Utility functions.
 */

'use strict';


/////////////////////////////////////////////
//  Public functions
/////////////////////////////////////////////

function getCollectionValue(collection, keyName) {

    let keyValue = null;

    if (typeof keyName !== 'string') {
        keyName = '';
    }

    keyName = keyName.trim().toLowerCase();

    if (keyName && collection && typeof collection === 'object') {
        var keys = Object.keys(collection);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i].trim().toLowerCase();
            if (key === keyName) {
                keyValue = collection[keys[i]];
                if (keyValue && typeof keyValue === 'string') {
                    keyValue = keyValue.trim();
                }
                break;
            }
        }
    }

    return keyValue;

}

function instanceOf(err, constructor) {

    if (!err || !constructor) {
        return false;
    }

    return Object.getPrototypeOf(err).name === constructor.prototype.name;

}

function getRandomInt(min, max) {

    //  Generate n-digit random integer (min <= n < max)

    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min)) + min;

}


/////////////////////////////////////////////
//  Exports
/////////////////////////////////////////////

module.exports = {
    getCollectionValue,
    instanceOf,
    getRandomInt
};
