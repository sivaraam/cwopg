'use strict';

/**
 * Orchestrator for the sub-modules which together generate a customized wikipedia
 * package.
 */

(function () {
	const path = require ('path')
	const category_list_generator = require ('category_list_generator');
	const article_list_generator = require ('article_list_generator');
	const package_generator = require ('package_generator');

	/**
	 * Intermediate files used and generated by different modules.
	 *
	 * All files are present relative to the project's root directory.
	 */

	/**
	 * The name of the file that would contain the list of (possibly partial)
	 * Wikipedia categories one in each line. The list specifies the list of
	 * categories to search.
	 *
	 * Typical generation method:
	 *
	 *     Obtain the latest dump of all categories from 'dumps.wikimedia.org' and
	 *     extract the category names from it using a substitution.
	 *
	 *     For example, the following 'vim' substitution:
	 *
	 *       %s/([0-9][0-9]*,'\([a-zA-Z0-9_\.\,\&()-][a-zA-Z0-9_\.\,\&()-]*\)',[0-9][0-9]*,[0-9][0-9]*,[0-9][0-9]*),/\1\r/
	 *
	 *     would extract most of the category names.
	 *
	 * Generated by: External source (Preprocessed Wikimedia dump)
	 * Used by:      Category list generator
	 */
	const enwiki_cats_file_name = 'enwiki-cats-bigger-preprocessed';

	/**
	 * The name of the file that would contain the list of articles to be present in
	 * the offline package.
	 *
	 * Generated by: Article list generator
	 * Used by:      Package generator
	 */
	const article_list_file_name = 'articleList';

	/**
	 * The name of the directory into which the ZIM file would be generated.
	 */
	const zim_output_dir_name ='public/output';

	const generate_package = function (user_query, package_callback) {
		const common_path = path.resolve (__dirname, '.');
		const enwiki_cats_file = path.resolve (common_path, enwiki_cats_file_name);
		const article_list_file = path.resolve (common_path, article_list_file_name);
		const zim_output_dir = path.resolve (common_path, zim_output_dir_name);

		const category_list_callback = function (categories) {
			article_list_generator.generate_article_list (categories,
			                                              article_list_file,
			                                              article_list_callback);
		};

		const article_list_callback = function () {
			package_generator.generate_zim_package (article_list_file,
			                                        zim_output_dir,
			                                        package_generator_callback);
		};

		const package_generator_callback = function (output_file) {
			package_callback (output_file);
		};

		try {
			category_list_generator.generate_category_list (user_query,
			                                                enwiki_cats_file,
			                                                category_list_callback);
		}
		catch (error) {
			throw error;
		}
	};

	module.exports.generate_package = generate_package;
	generate_package ('sudoku', function(output_file) {
		console.log('Package callback:', output_file);
	});
})();
