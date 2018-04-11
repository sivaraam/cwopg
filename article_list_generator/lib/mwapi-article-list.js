/**
 * Program to get the article list using the MediaWiki API.
 *
 * This is to be used as a fallack when PetScan fails.
 */

(function () {
	const bot = require('nodemw');
	const e = require('../../lib/error.js');
	const articles = [];

	// pass configuration object
	const client = new bot({
		protocol: 'https',           // Wikipedia now enforces HTTPS
		server: 'en.wikipedia.org',  // host name of MediaWiki-powered site
		path: '/w',                  // path to api.php script
		debug: false                 // is more verbose when set to true
	});

	const get_articles_for_category_index = function (categories, index, callback) {
		client.getPagesInCategory(categories[index], function(err, response) {
			// error handling
			if (err) {
				e.fatal_error(err);
			}

			response.forEach(function (response_item) {
				if (response_item.ns === 0) {
					articles.push(response_item.title);
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
		get_articles_for_category_index(categories, 0, function articles_generated () {
			callback (articles);
		});
	}

	module.exports.generate_article_list = generate_article_list;
	//get_article_list();
})();
