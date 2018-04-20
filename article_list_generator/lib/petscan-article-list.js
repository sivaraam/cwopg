/**
 * This program generates the article list using PetScan (a tool hosted at
 * Wikimedia tool forge).
 */

/**
 * The library required for manipulating HTTP GET requests
 * and it's response.
 */
const request = require('request');
const e = require('../../lib/error');

/**
* Get the PetScan parameters that don't change often.
*/
const petscanParams = require('../config/petscan-config');
const petscanUrl = 'https://petscan.wmflabs.org/';
const articles = [];

/**
 * Generates the article list from the PetScan's response which is given in as
 * a JSON string and writes one article per line in the given artile list file.
 */
const appendArticleListFromPetscanRes = function (petscanJsonResponse) {
    const petscanResponse = JSON.parse(petscanJsonResponse);
    const articlesObject = petscanResponse['*'][0].a['*'];

    if (articlesObject === null) {
        e.fatalError('Failed to fetch article list from PetScan response');
    }

    articlesObject.forEach(
        function articleListGen (articleObj) {
            articles.push(articleObj.title);
        }
    );
};

/**
 * Generate the list of articles corresponding to the categories in the current
 * category split and append it to total article list.
 *
 * Calls the callback after the articles for all the splits have been generated.
 */
const generateArticleListForCategorySplit =
    function (categorySplits, index, callback) {
        petscanParams.categories = categorySplits[index].join('\n');

        console.log(`Requesting the article list for the split: ${index+1}`);

        /*
         * Do the HTTP request to PetScan to get the list of articles for
         * the current category split.
         */
        request.get(
            {
                url: petscanUrl,
                qs: petscanParams
            },
            function (error, response, body) {
                if (error != null) {
                    e.fatalError(`error: ${error}`);
                }
                if (response && response.statusCode === 200) {
                    appendArticleListFromPetscanRes(body);

                    index++;
                    if (index === categorySplits.length) {
                        callback(articles);
                    }
                    else {
                        generateArticleListForCategorySplit(
                            categorySplits,
                            index,
                            callback
                        );
                    }
                } else if (!response) {
                    e.fatalError('No response received from PetScan!');
                } else {
                    e.fatalError(
                     `PetScan request failed with status code: ` +
                     `${res.statusCode}\n${response.body}`
                    );
                }
            }
        );
    };

/**
 *  Generate the article list file by identifying the set of articles in the
 * categories or its children and invoke the callback after
 * successful completion.
 */
const generateArticleList = function (categories, callback) {
    const heuristicPerRequestCats = 120;
    const totalCategorySplits =
                        Math.ceil(categories.length / heuristicPerRequestCats);
    const categorySplits = [];

    for (let split=0; split<totalCategorySplits; split++) {
        categorySplits.push(
            categories.slice(
                split * heuristicPerRequestCats,
                (split + 1) * heuristicPerRequestCats
            )
        );
    }

    generateArticleListForCategorySplit(categorySplits, 0, callback);
};

exports.generateArticleList = generateArticleList;
// generateArticleList(['Sudoku', 'Bullfighting'], function (articles) {
//     console.log(`Successfully got ${articles.length} articles.`);
// });
