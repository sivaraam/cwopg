/**
 * Program to get the article list using the MediaWiki API.
 *
 * This is to be used as a fallack when PetScan fails.
 */

const bot = require('nodemw');
const e = require('../../lib/error.js');
const nodemw_config = require('../config/nodemw-config.json')
const client = new bot(nodemw_config);
const articles = [];

const get_articles_for_category_index = function (categories, index, callback) {
	const main_ns_id = 0, category_ns_id = 14;
	const curr_cat = categories[index];
	const max_depth = 250;

	client.getPagesInCategory(curr_cat.title, function(err, response) {
		if (err) {
			e.fatal_error(err);
		}

		response.forEach(function (response_item) {
			if (response_item.ns === main_ns_id) {
				articles.push(response_item.title);
			}
			else if (response_item.ns === category_ns_id &&
			         curr_cat.depth !== max_depth) {
				categories.push({
					/* Strip the 'Category:' prefix */
					title: response_item.title.slice(9),
					depth: curr_cat.depth+1
				});
			}
		})

		index++;
		if (index !== categories.length) {
			get_articles_for_category_index(categories, index, callback);
		}
		else {
			callback();
		}
	});
}

const generate_article_list = function (categories, callback) {
	const category_objects = [];

	/*
	 * Generate the array of custom category objects from the
	 * category list.
	 *
	 * The objects have the properties 'title' and 'depth'
	 */
	categories.forEach(function category_object_generator(category) {
		category_objects.push({
			title: category,
			depth: 0
		});
	})

	get_articles_for_category_index(category_objects, 0,
	function articles_generated () {
		callback (articles);
	});
}

module.exports.generate_article_list = generate_article_list;
