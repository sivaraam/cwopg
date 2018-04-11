'use strict';

/**
 * This program generates a list of articles that belong to a given set of
 * categories or it's children.
 */

(function () {
	const fs = require('fs');
	const article_list_generator = require('./mwapi-article-list');

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

	const generate_article_list = function (categories, article_list_file, callback) {
		if (categories === null) {
			e.fatal_error('Invalid categories');
		}

		if (categories.length === 0) {
			e.fatal_error('No categories found.');
		}

		article_list_generator.generate_article_list(categories,
		function articles_generated (articles) {
			if (articles.length === 0) {
				e.fatal_error('No articles found for the given category.');
			}

			console.log(`Successfully got ${articles.length} articles for the given set of categories.`);

			/*
			 * Remove the duplicate articles from the list
			 */
			const deduped_articles =  articles.filter(
				function onlyUnique (value, index, self) {
					return self.indexOf(value) === index;
				});

			console.log(`Removed ${articles.length-deduped_articles.length} duplicates.`);

			generate_article_list_file(deduped_articles, article_list_file, callback);
		});
	};

	module.exports.generate_article_list = generate_article_list;
/*	generate_article_list(['Sudoku', 'Bullfighting'], '../articleList', function () {
		console.log("Successfully generated article list.");
	})*/
})();
