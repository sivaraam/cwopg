'use strict';

/**
 * Preprocess a file containing a list of enwiki categories to make it suitable for
 * searching.
 */

(function () {
	const fs = require('fs');
	const preprocess = require('../../preprocess/lib/preprocess');
	const e = require('../../lib/error');

	const read_enwiki_cats_file = function (enwiki_cats_file) {
		var enwiki_cats = null;

		/*
		 * Ensure that the enwiki category list file exists
		 */
		try {
			fs.statSync(enwiki_cats_file);
		} catch(error) {
			if(error.code === 'ENOENT') {
				return null;
			}

			throw error;
		}

		/*
		 * Read the file into an array
		 */
		enwiki_cats = fs.readFileSync(enwiki_cats_file, 'utf-8')
		                .split('\n')
		                .filter(Boolean);  // to ignore empty lines

		/* sanity check */
		if (enwiki_cats == null) {
			return null;
		}

		console.log(`Successfully read ${enwiki_cats.length} categories.`);

		return enwiki_cats;
	};

	const preprocess_enwiki_cats_file = function (enwiki_cats_file, preprocessed_enwiki_cats_file) {
		const enwiki_cats_arr = read_enwiki_cats_file(enwiki_cats_file);
		const enwiki_cats_preprocessed = [];

		if (enwiki_cats_arr === null) {
			e.fatal_error(`enwiki category list file ${enwiki_cats_file} does not exist`);
		}

		if (enwiki_cats_arr.length === 0) {
			e.fatal_error('No categories found in enwiki category list file!');
		}

		/*
		 * Preprocess the categories
		 */
		enwiki_cats_arr.forEach (function (cat) {
			enwiki_cats_preprocessed.push(preprocess (cat).join(" "));
		});

		/*
		 * Write back the preprocessed output to destination
		 */
		const enwiki_cats_write_stream = fs.createWriteStream(preprocessed_enwiki_cats_file);
		for (var i=0; i<enwiki_cats_arr.length; i++) {
			enwiki_cats_write_stream.write(enwiki_cats_arr[i]+';'+enwiki_cats_preprocessed[i]+'\n');
		}

		console.log ('Successfully preprocessed the enwiki category list file.');
	};

	preprocess_enwiki_cats_file('../enwiki-cats-bigger', '../enwiki-cats-bigger-preprocessed');
})();
