'use strict';

/**
 * This program generates a list of articles that belong to a given set of
 * categories or it's children.
 */

(function () {
	/**
	 * The library required for manipulating HTTP GET requests
	 * and it's response.
	 */
	const request = require('request');
	const fs = require('fs');
	const e = require('../../lib/error.js');

	const petscan_url = 'https://petscan.wmflabs.org/';

	/**
	 * Get the PetScan parameters that don't change often.
	 */
	const petscan_params = require('../config/article_list_generator.json');

	/**
	 * Generates the article list from the PetScan's response which is given in as
	 * a JSON string and writes one article per line in the given artile list file.
	 *
	 * Calls the callback after completion of the process.
	 */
	const generate_article_list_file_from_petscan_res =
			function (petscan_json_response, article_list_file, callback) {

		const write_options = { encoding: 'utf-8' };
		const petscan_response = JSON.parse(petscan_json_response);
		const articles_object = petscan_response['*'][0].a['*'];
		const articles = [];

		if (articles_object === null) {
			e.fatal_error('Failed to fetch article list from PetScan response');
		}

		for (var curr=0; curr<articles_object.length; curr++) {
			articles.push(articles_object[curr].title);
		}

		if (articles.length === 0) {
			e.fatal_error('No articles found for the given category.');
		}

		console.log(`Successfully got ${articles.length} articles for the given set of categories.`);

		console.log(`About to generate the article list file (${article_list_file}).`);

		fs.writeFile(article_list_file, articles.join('\n'), write_options, function(err) {
			if(err) {
				throw err;
			}
			else {
				console.log('Generated the article list file.');
				callback();
			}
		});
	};

/**
 * Generate the article list file by identifying the set of articles in the categories
 * or its children and invoke the callback after successful completion.
 */
	const generate_article_list = function (categories, article_list_file, callback) {
		if (categories === null) {
			e.fatal_error('Invalid categories');
		}

		if (categories.length === 0) {
			e.fatal_error('No categories found.');
		}

		petscan_params.categories = categories.join('\n');

		console.log('Requesting the article list for the given set of categories.');

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
				generate_article_list_file_from_petscan_res(body, article_list_file, callback);
			} else if (!response) {
				e.fatal_error('No response received from PetScan!');
			} else {
				e.fatal_error(`PetScan request failed with status code: ${response.statusCode}\n${response.body}`);
			}
		});
	};

	module.exports.generate_article_list = generate_article_list;
})();
