/**
 * This program generates the article list using PetScan (a tool hosted at
 * Wikimedia tool forge).
 */

/**
 * The library required for manipulating HTTP GET requests
 * and it's response.
 */
const request = require('request');
const e = require('../../lib/error.js');

const petscanUrl = 'https://petscan.wmflabs.org/';

/**
 * Get the PetScan parameters that don't change often.
 */
const petscanParams = require('../config/petscan-config.json');

/**
 * Generates the article list from the PetScan's response which is given in as
 * a JSON string and writes one article per line in the given artile list file.
 *
 * Calls the callback after completion of the process.
 */
const appendArticleListFromPetscanRes =
function (petscanJsonResponse, articleList) {
    const petscanResponse = JSON.parse(petscanJsonResponse);
    const articlesObject = petscanResponse['*'][0].a['*'];

    if (articlesObject === null) {
        e.fatalError('Failed to fetch article list from PetScan response');
    }

    articlesObject.forEach (function articleListGen (articleObj) {
        articleList.push(articleObj.title);
    });
};

/**
 * Generate the article list file by identifying the set of articles in the
 * categories or its children and invoke the callback after
 * successful completion.
 */
const generateArticleList = function (categories, callback) {
    const heuristicPerRequestCats = 120;
    const totalCategorySplits =
                        Math.ceil(categories.length / heuristicPerRequestCats);
    const categorySplits = [];
    const articles = [];
    var currCategorySplit = 0;

    for (var split=0; split<totalCategorySplits; split++) {
        categorySplits.push(
            categories.slice(
                split * heuristicPerRequestCats,
                (split + 1) * heuristicPerRequestCats
            )
        );
    }

    for (var split=0; split<categorySplits.length; split++) {
        petscanParams.categories = categorySplits[split].join('\n');

        console.log(`Requesting the article list for the split: ${split+1}`);

        /*
         * Do the HTTP request to PetScan to get the list of articles
         * for the given set of categories.
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
                    appendArticleListFromPetscanRes(body, articles);

                    currCategorySplit++;
                    if (currCategorySplit === totalCategorySplits) {
                        callback (articles);
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
    }
};

module.exports.generateArticleList = generateArticleList;
