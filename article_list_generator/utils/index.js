'use strict';

/**
* A utility to analyze and find a typical maximum number of categories
* per PetScan request.
*/

/*
 * The library required for manipulating HTTP GET requests
 * and it's response.
 */
const request = require('request');
const e = require('../../lib/error.js');

const petscan_url = 'https://petscan.wmflabs.org/';

/*
 * Get the PetScan parameters that don't change often.
 */
const petscan_params = require('../config/article_list_generator.json');

const find_typcial_categories_per_request = function () {
	const test_category = 'National_members_of_the_Confederation_of_Chess_for_America';
	var known_good = 125;
	var known_bad = 140;

	const request_petscan = function () {
		var mid = Math.floor((known_bad+known_good)/2);
		const cats = new Array(mid);
		cats.fill(test_category);
		petscan_params.categories=cats.join('\n');

		console.log(`Requesting the article list for ${mid} categories.`);

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
				console.log ('log: PetScan request succeeded');
				if (known_bad!=known_good) {
					known_good=mid+1;
					request_petscan();
				}
			} else if (!response) {
				e.fatal_error('No response received from PetScan!');
			} else {
				if (response.statusCode === 414) {
					console.log ('log: PetScan request failed');
					if (known_bad!=known_good) {
						known_bad=mid-1;
						request_petscan();
					}
				}
				else {
					e.fatal_error(`PetScan request failed with status code: ${response.statusCode}\n${response.body}`);
				}
			}
		});
	}

	request_petscan();
};

find_typcial_categories_per_request();
