'use strict';

/**
 * The library used to obtain the stem words for a given string.
 */
const stemmer = require ('stemmer');

/**
 * Preprocess the string to generate a set of elements
 * that could that represent searchable elements of the string.
 */
const preprocess = function (string) {
    const separatorRE =  /[\s;,\.\(\)_]+/;
    const searchableElems = string.trim()
                                  .toLowerCase()
                                  .split(separatorRE);

    searchableElems.forEach(function (elem) {
        elem = stemmer (elem);
    });

    return searchableElems;
};

module.exports = preprocess;
