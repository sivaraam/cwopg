'use strict';

/**
 * This program generates a list of relevant categories based on the given user
 * input.
 */

const fs = require('fs');
const path = require('path');
const e = require('../../lib/error.js');
const preprocess = require('../../preprocess/lib/preprocess');

/**
 * Generates an array representation of the list of enwiki categories in the file.
 * Each line is expected to represent a valid category in enwiki.
 *
 * Returns the array of categoreis on success. Returns null in case of an error.
 */
function read_enwiki_cats (enwiki_cats_file) {
	// ensure that the enwiki category list file exists
	try {
		fs.statSync(enwiki_cats_file);
	} catch(error) {
		if(error.code === 'ENOENT') {
			console.error(error);
			return null;
		}

		throw error;
	}

	console.log(`About to read the enwiki category list file (${enwiki_cats_file}).`);

	const enwiki_cats = fs.readFileSync(enwiki_cats_file, 'utf-8')
			      .split('\n')
			      .filter(Boolean);  // to ignore empty lines

	// sanity check
	if (enwiki_cats == null) {
		return null;
	}

	console.log(`Successfully read ${enwiki_cats.length} categories.`);

	return enwiki_cats;
}

/**
 * Returns true if the category given as a string is relevant to the given
 * user query string.
 *
 * For now, a category is relevant if the there is a sub-word taht matches with
 * the given user query string.
 */
const is_cat_relevant = function (cat, user_query_elems) {
	var relevant = false;

	cat.forEach (function (cat_elem) {
		if (user_query_elems.includes (cat_elem))
			relevant = true;
	});

	return relevant;
}

/**
 * Finds a list of relevant categories from the given set of enwiki categories
 * for the given user query string.
 */
function get_relevant_cats (user_query, enwiki_cats_arr) {
	const relevant_cats = [];
	const user_query_elems = preprocess (user_query);
	const enwiki_cats_elems = [];

	// preprocess the Categories
	enwiki_cats_arr.forEach (function (cat) {
		enwiki_cats_elems.push(preprocess (cat));
	});

	for (var i=0; i < enwiki_cats_arr.length; i++) {
		if (is_cat_relevant (enwiki_cats_elems[i], user_query_elems)) {
			relevant_cats.push (enwiki_cats_arr[i]);
		}
	}

	console.log (`Found ${relevant_cats.length} categories for the user query '${user_query}'`);
	return relevant_cats;
}

/**
 * Generate the category list file consisting of relevant categories for a
 * given user query string.
 */
function generate_category_list (user_query, enwiki_cats_file_name, category_list_file_name) {

	/* Resolve the name of the files to their corresponding relative path */
	const project_root = path.dirname(require.main.filename);
	const enwiki_cats_file = path.resolve(project_root, enwiki_cats_file_name);
	const category_list_file = path.resolve(project_root, category_list_file_name);

	/**
	 * The array corresponding to the category list in the file.
	 */
	const enwiki_cats_arr = read_enwiki_cats(enwiki_cats_file);

	if (enwiki_cats_arr === null) {
		e.fatal_error (`Error while reading enwiki categories file '${enwiki_cats_file}`);
	}

	if (enwiki_cats_arr.length === 0) {
		e.fatal_error (`Could not get any categories from the enwiki categories file '${enwiki_cats_file}'`);
	}

	const relevant_cats = get_relevant_cats (user_query, enwiki_cats_arr);

	if (relevant_cats.length === 0) {
		e.fatal_error ('Could not find any relevant categories for the given query');
	}

	console.log(`About to generate the category list file (${category_list_file}).`);

	fs.writeFileSync(category_list_file, relevant_cats.join('\n'), function(err) {
		if(err) {
			throw err;
		}

		console.log('Generated the category list file.');
	});
}

module.exports.generate_category_list = generate_category_list;
