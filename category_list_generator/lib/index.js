'use strict';

/**
 * This program is expected to generate a list of relevant categories based on
 * the given user input.
 *
 * The output of this program is the 'categoryList' file.
 */

/**
 * The library used to obtain the stem words for a given string.
 */
const stemmer = require ('stemmer')
const fs = require('fs')
const e = require('../../lib/error.js')

/**
 * The file that contains the list of (possibly partial) wikipedia categories
 * one in each line.
 *
 * The list specifies the list of categories to search.
 */
const enwiki_cats_file = '../enwiki-cats-bigger'

/**
  * The file contains the list of categories using which the list of articles
  * that belong to that category or one of it's children has to be generated.
  *
  * This file is the output of this module.
  */
const category_list_file = '../categoryList'

/**
 * Preprocess the string to generate a set of elements
 * that could that represent searchable elements of the string.
 */
function preprocess (string) {
	const separator_re =  /[\s;,\._]/
	const searchable_elems = string.trim()
				       .toLowerCase()
				       .split(separator_re)

	searchable_elems.forEach(function (elem) {
		elem = stemmer (elem)
	})

	return searchable_elems
}

function read_enwiki_cats (enwiki_cats_file) {
	console.log(`About to read the enwiki category list file (${enwiki_cats_file}).`)

	const enwiki_cats = fs.readFileSync(enwiki_cats_file, 'utf-8')
			      .split('\n')
			      .filter(Boolean)  // to ignore empty lines

	// sanity check
	if (enwiki_cats == null) {
		e.fatal_error('Categories could not be read!')
	}

	console.log(`Successfully read ${enwiki_cats.length} categories.`)

	return enwiki_cats
}

// ensure that the enwiki category list file exists
try {
	fs.statSync(enwiki_cats_file)
} catch(error) {
	if(error.code === 'ENOENT') {
		console.error(error)
		e.fatal_error(`Category file '${enwiki_cats_file}' does not exist.`)
	}
}

/**
 * The array corresponding to the category list in the file.
 */
const enwiki_cats_arr = read_enwiki_cats(enwiki_cats_file)

/**
 * Returns true if the category given as a string is relevant to the given
 * user query string.
 *
 * For now, a category is relevant if the there is a sub-word taht matches with
 * the given user query string.
 */
function is_cat_relevant (cat, user_query_elems) {
	var relevant = false

	cat.forEach (function (cat_elem) {
		if (user_query_elems.includes (cat_elem))
			relevant = true
	})

	return relevant
}

/**
 * Finds a list of relevant categories for the given user query string.
 */
function get_relevant_cats (user_query) {
	const relevant_cats = []
	const user_query_elems = preprocess (user_query)
	const enwiki_cats_elems = []

	// preprocess the Categories
	enwiki_cats_arr.forEach (function (cat) {
		enwiki_cats_elems.push(preprocess (cat))
	})

	for (var i=0; i < enwiki_cats_arr.length; i++) {
		if (is_cat_relevant (enwiki_cats_elems[i], user_query_elems)) {
			relevant_cats.push (enwiki_cats_arr[i])
		}
	}

	console.log (`Found ${relevant_cats.length} categories for the user query '${user_query}'`)
	return relevant_cats
}

/**
 * Generate the category list file consisting of relevant categories for a
 * given user query string.
 */
function generate_category_list (user_query) {
	const relevant_cats = get_relevant_cats (user_query)

	console.log(`About to generate the category list file (${category_list_file}).`)

	const relevant_cat_write_stream = fs.createWriteStream(category_list_file)

	relevant_cats.forEach (function (relevant_cat) {
		relevant_cat_write_stream.write(relevant_cat+'\n')
	})

	console.log('Generated the category list file.')
}

module.exports = generate_category_list

// generate_category_list ('Sudoku')
