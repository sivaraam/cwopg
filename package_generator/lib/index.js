'use strict';

/**
 * This program is expected to generate a ZIM file consisting
 * of the set of Wikipedia articles specified in the 'articleList' file.
 *
 * The output of this program is expected to be a ZIM file.
 */

(function () {
	const fs = require('fs');
	const path = require('path');
	const execa = require('execa');
	const e = require('../../lib/error');

	/**
	 * Generate the ZIM file package for the list of articles present in the given
	 * article list file.
	 *
	 * Each line of the file is expected to represent a valid article title.
	 */
	const generate_zim_package = function (article_list_file, zim_output_dir, callback) {
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
				const file_name = 'wikipedia_en_articlelist_2018-04.zim';
				const execa_options = { localDir: __dirname };
				const npm_mwoffliner_cmd_params = [];
				var npm_mwoffliner = null;

				/**
				 * Get the required 'mwoffliner' configuration that doesn't change often.
				 */
				const parameters = require('../config/package_generator_dev.json');
				parameters.articleList = article_list_file;
				parameters.outputDirectory = zim_output_dir;
				parameters.filenamePrefix = 'zim-file';

				Object.keys(parameters).forEach(function cmd_param_gen (key, index){
					npm_mwoffliner_cmd_params.push(`--${key}`);
					npm_mwoffliner_cmd_params.push(parameters[key]);
				});

				/**
				 * The JS API of mwoffliner is not usable as the 'mwoffliner.execute()',
				 * which is used to generate the ZIM package, does a lot of things
				 * asynchronously and thus returns before the corresponding ZIM file is
				 * actually generated. Further, there is no API exposed to actually know
				 * when the file generation gets completed.
				 *
				 * So, temporarily work around this by using the command line binary of
				 * mwoffliner which gets installed into the '$(npm bin)' folder.
				 */
				npm_mwoffliner = execa('mwoffliner', npm_mwoffliner_cmd_params, execa_options);

				npm_mwoffliner.stdout.pipe(process.stdout);
				npm_mwoffliner.stderr.pipe(process.stderr);
				npm_mwoffliner.then(result => {
					// ZIM file built at /mnt/Source/Wiki/customized_offline_package_generator/out/zim-file_articlelist_2018-04.zim
					callback(path.join(zim_output_dir, file_name));
				});
			}
		});
	};

	module.exports.generate_zim_package = generate_zim_package;
	/*generate_zim_package('../articleList', '../out', function zim_op_file(file){
		console.log(file);
	});*/
})();
