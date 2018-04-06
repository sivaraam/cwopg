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
	const fs = require('fs');
	const path = require('path');
	const e = require('../../lib/error');

	/**
	 * Generate the ZIM file package for the list of articles present in the given
	 * article list file.
	 *
	 * Each line of the file is expected to represent a valid article title.
	 */
	const generate_zim_package = function (article_list_file, zim_output_dir, callback) {
		const file_name = 'wikipedia_en_articlelist_2018-04.zim';
		var parameters = null;

		/* Generate the ZIM file only if the article list file exists and is readable */
		fs.access(article_list_file, fs.constants.R_OK, function (err) {
			if (err) {
				if (err.code == 'ENOENT') {
					e.fatal_error(`Article list file '${article_list_file}' missing.`);
				}
				else {
					console.log(err);
					e.fatal_error(`Unable to read the article list file '${article_list_file}'`);
				}
			}
			else {
				/**
				 * Get the required 'mwoffliner' configuration that doesn't change often.
				 */
				parameters = require('../config/package_generator_dev.json');
				parameters.articleList = article_list_file;
				parameters.outputDirectory = zim_output_dir;

				mwoffliner.execute(parameters);
				callback (path.join(zim_output_dir, file_name));
			}
		});
	};

	module.exports.generate_zim_package = generate_zim_package;
})();
