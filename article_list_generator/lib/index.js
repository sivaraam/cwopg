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
	const append_article_list_from_petscan_res =
	function (petscan_json_response, article_list) {

		const petscan_response = JSON.parse(petscan_json_response);
		const articles_object = petscan_response['*'][0].a['*'];

		if (articles_object === null) {
			e.fatal_error('Failed to fetch article list from PetScan response');
		}

		for (var curr=0; curr<articles_object.length; curr++) {
			article_list.push(articles_object[curr].title);
		}

		console.log(`Successfully got ${article_list.length} articles for the given set of categories.`);
	};

	const generate_article_list_file = function (articles, article_list_file, callback) {
		const write_options = { encoding: 'utf-8' };

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
		const heuristic_per_request_cats = 120;
		const total_category_splits = Math.ceil(categories.length/heuristic_per_request_cats);
		const category_splits = [];
		const articles = [];
		var curr_category_split = 0;

		if (categories === null) {
			e.fatal_error('Invalid categories');
		}

		if (categories.length === 0) {
			e.fatal_error('No categories found.');
		}

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
						if (articles.length === 0) {
							e.fatal_error('No articles found for the given category.');
						}

						/*
						 * Remove the duplicate articles from the list
						 */
						const deduped_articles =  articles.filter(
							function onlyUnique (value, index, self) {
								return self.indexOf(value) === index;
							}
						);

						console.log(`Removed ${articles.length-deduped_articles.length} duplicates.`);

						generate_article_list_file(deduped_articles, article_list_file, callback);
					}
				} else if (!response) {
					e.fatal_error('No response received from PetScan!');
				} else {
					e.fatal_error(`PetScan request failed with status code: ${response.statusCode}\n${response.body}`);
				}
			});
		}
	};

	module.exports.generate_article_list = generate_article_list;
})();
