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

const petscan_url = 'https://petscan.wmflabs.org/';

/**
 * Get the PetScan parameters that don't change often.
 */
const petscan_params = require('../config/petscan-config.json');

/**
 * Generates the article list from the PetScan's response which is given in as
 * a JSON string and writes one article per line in the given artile list file.
 *
 * Calls the callback after completion of the process.
 */
const append_article_list_from_petscan_res =
function (petscan_json_response, article_list) {
    const petscan_response = JSON.parse(petscan_json_response);
    const articles_object = petscan_response['*'][0].a['*'];

    if (articles_object === null) {
        e.fatal_error('Failed to fetch article list from PetScan response');
    }

    articles_object.forEach (function article_list_gen (article_obj) {
        article_list.push(article_obj.title);
    });
};

/**
* Generate the article list file by identifying the set of articles in the categories
* or its children and invoke the callback after successful completion.
*/
const generate_article_list = function (categories, callback) {
    const heuristic_per_request_cats = 120;
    const total_category_splits = Math.ceil(categories.length/heuristic_per_request_cats);
    const category_splits = [];
    const articles = [];
    var curr_category_split = 0;

    for (var split=0; split<total_category_splits; split++) {
        category_splits.push(categories.slice(split*heuristic_per_request_cats, (split+1)*heuristic_per_request_cats));
    }

    for (var split=0; split<category_splits.length; split++) {
        petscan_params.categories = category_splits[split].join('\n');

        console.log(`Requesting the article list for the split: ${split+1}`);

        /*
         * Do the HTTP request to PetScan to get the list of articles for the given
         * set of categories.
         */
        request.get({
            url: petscan_url,
            qs: petscan_params
        }, function (error, response, body) {
            if (error != null) {
                e.fatal_error(`error: ${error}`);
            }
            if (response && response.statusCode === 200) {
                append_article_list_from_petscan_res(body, articles);

                curr_category_split++;
                if (curr_category_split === total_category_splits) {
                    callback (articles);
                }
            } else if (!response) {
                e.fatal_error('No response received from PetScan!');
            } else {
                e.fatal_error(`PetScan request failed with status code: ${response.statusCode}\n${response.body}`);
            }
        });
    }
};

exports.generate_article_list = generate_article_list;
// generate_article_list(['Sudoku', 'Bullfighting'], function (articles) {
//     console.log(`Successfully got ${articles.length} articles.`);
// });
