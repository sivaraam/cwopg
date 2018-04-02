'use strict';

/**
 * This program is expected to generate a ZIM file consisting
 * of the set of Wikipedia articles specified in the 'articleList' file.
 *
 * The output of this program is expected to be a ZIM file.
 */

(function () {
	/**
	 * The library required to generate ZIM files.
	 */
	const mwoffliner =  require('mwoffliner');
	const path = require('path');
	const e = require('../../lib/error');

	/**
	 * Generate the ZIM file package for the list of articles present in the given
	 * article list file.
	 *
	 * Each line of the file is expected to represent a valid article title.
	 */
	const generate_zim_package = function (article_list_file_name, zim_output_dir_name) {

		/* Resolve the name of the files to their corresponding relative path */
		const project_root = path.dirname(require.main.filename);
		const article_list_file = path.resolve(project_root, article_list_file_name);
		const zim_output_dir = path.resolve(project_root, zim_output_dir_name);
		var parameters = null;

		try {
			require('fs').statSync(article_list_file);
		} catch(error) {
			if(error.code === 'ENOENT') {
				console.error(error);
				e.fatal_error(`Article list file '${article_list_file}' missing.`);
			}

			throw error;
		}

		/**
		 * Get the required 'mwoffliner' configuration that doesn't change often.
		 */
		parameters = require('../config/package_generator_dev.json');
		parameters.articleList = article_list_file;
		parameters.outputDirectory = zim_output_dir;

		/* Generate the ZIM file */
		mwoffliner.execute(parameters);
	};

	module.exports.generate_zim_package = generate_zim_package;
})();
