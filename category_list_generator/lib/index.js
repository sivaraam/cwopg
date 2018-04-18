'use strict';

/**
 * This program generates a list of relevant categories based on the given user
 * input.
 */

const fs = require('fs');
const e = require('../../lib/error.js');
const preprocess = require('../../preprocess');

/**
 * Generates an array representation of the list of enwiki categories and their
 * corresponding searchable elements present in a preprocessed file. Each line
 * is expected to said to be in the following format:
 *
 *     <CatgoryID><PropertySep><CategorySearchableElem><ElemSep><CategorySearchableElem>...
 *
 * Returns an array of objects which contain the 'id' and 'elems' properties.
 * The 'id' property is a string which contains the unique identifier for the
 * category and the 'elems' property contains the searchable elements which
 * correspond to the specific category.
 *
 * Throws an error in case of any issues. Else calls the callback with
 * the enwiki category list array.
 */
const readEnwikiCats = function (enwikiCatsFile, callback) {
    const readOptions = { encoding: 'utf-8' };
    console.log(`About to read the enwiki category list file (${enwikiCatsFile}).`);

    fs.readFile(enwikiCatsFile, readOptions, function enwikiCatsPpReadCallback (err, data) {
        if (err) {
            if (err.code == 'ENOENT') {
                e.fatalError(`enwiki category list file ${enwikiCatsFile} missing.`);
            }
            else {
                e.fatalError(err);
            }
        }
        else {
            const enwikiCatsPropertySeparator = ';';
            const enwikiCatsPropertyElemsSeparator = ' ';
            const enwikiCats = [];
            const enwikiCatsLines = data.split('\n')
                                        .filter(Boolean);  // to ignore empty lines

            if (enwikiCatsLines === null) {
                e.fatalError (`Error while reading enwiki categories file '${enwikiCatsFile}`);
            }

            if (enwikiCatsLines.length === 0) {
                e.fatalError (`Could not get any categories from the enwiki categories file '${enwikiCatsFile}'`);
            }

            enwikiCatsLines.forEach(function enwikiCatsGenerator (line) {
                const properties = line.split(enwikiCatsPropertySeparator);
                enwikiCats.push({
                    id: properties[0],
                    elems: properties[1].split(enwikiCatsPropertyElemsSeparator)
                });
            });

            console.log(`Successfully read ${enwikiCats.length} categories.`);

            callback(enwikiCats);
        }
    });
};

/**
 * Returns true if the category given as a string is relevant to the given
 * user query string.
 *
 * For now, a category is relevant if it contains every searchable element
 * a keyword.
 */
const isCatRelevant = function (catElems, keywordElems) {
    var relevant = true;

    keywordElems.forEach (function (keywordElem) {
        if (!catElems.includes(keywordElem)) {
            relevant = false;
        }
    });

    return relevant;
}

/**
 * Finds a list of relevant categories from the given set of enwiki categories
 * for the given user query string.
 *
 * Returns an array containing the list of ids corresponding to the relevant
 * categories.
 */
const getRelevantCats = function (userQuery, enwikiCats) {
    /**
     * Filter out all elements whose length is 0.
     */
    const emptyElemsRemover = function (elem, index, array) {
        return array[index].length !== 0;
    };
    const relevantCatsId = [];
    const keywords = userQuery.trim()
                               .split(/\s*,\s*/)
                               .filter(emptyElemsRemover);
    const keywordsElems = [];

    /**
     * Preprocess each keyword to generate a list of searchable elements
     * representing it.
     */
    keywords.forEach(function preprocesKeyword(keyword) {
        keywordsElems.push(preprocess(keyword));
    });

    for (var i=0; i < enwikiCats.length; i++) {
        keywordsElems.forEach(function isKeywordRelevant(keywordElems){
            if (isCatRelevant (enwikiCats[i].elems, keywordElems)) {
                relevantCatsId.push (enwikiCats[i].id);
            }
        });
    }

    console.log (`Found ${relevantCatsId.length} categories for the user query '${userQuery}'`);
    return relevantCatsId;
}

/**
 * @userQuery: CommaSeparated list of keywords
 *
 * Generate the category list consisting of relevant categories for a
 * given user query string and call the concerned callback after succcessfully
 * generating the list.
 */
const generateCategoryList = function (userQuery, enwikiCatsFile, categoriesCallback) {
    readEnwikiCats(enwikiCatsFile, function readCompleteCallback (enwikiCats) {
        const relevantCatsId = getRelevantCats (userQuery, enwikiCats);

        if (relevantCatsId.length === 0) {
            e.fatalError ('Could not find any relevant categories for the given query');
        }

        categoriesCallback (relevantCatsId);
    });
};

module.exports.generateCategoryList = generateCategoryList;
