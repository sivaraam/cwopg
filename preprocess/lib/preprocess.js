'use strict';

/**
 * The program that does some preprocessing on a string and returns
 * the elements which could are searchable. Used to give some flexibility to
 * the user.
 */

/**
 * The library used to obtain the stem words for a given string.
 */
const stemmer = require ('stemmer');

/**
 * Preprocess the string to generate a set of elements
 * that could that represent searchable elements of the string.
 */
const preprocess = function (string) {
    const separator_re =  /[\s;,\.\(\)_]+/;
    const searchable_elems = string.trim()
                       .toLowerCase()
                       .split(separator_re);

    searchable_elems.forEach(function (elem) {
        elem = stemmer (elem);
    });

    return searchable_elems;
};

module.exports = preprocess;
