'use strict';

/**
 * Generates a category tree rooted at 'Category:Main_topic_classifications'
 * to a depth of 2.
 */

/**
 * The library required to interface with the MediaWiki web service API provided
 * by the Wikimedia Foundation.
 *
 * The API is used to acquire the information required for the working of this module.
 * The information required includes:
 *
 *	- list of categories
 */
const mw_api = require('mwapi')

/**
 * The library required to parse the HTML output. HTML is currently the format
 * in which the categorytree response is available currently.
 */
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const fs = require('fs')
const e = require('../../lib/error.js')

/**
 * The file contains all the categories currently present in the category tree
 * rooted at 'Main_topic_classifications' with a depth of 2.
 */
const cats_file = '../wiki-cats'
const cats_writer = fs.createWriteStream(cats_file)

/**
 * New instance used to access the MW API
 */
const mw_api_client = new mw_api (
	'Category tree generator (kaartic.sivaraam+mwapi@gmail.com, User:Kaartic)',
	'https://en.wikipedia.org/w/api.php'
)

/**
 * Dumps the names of the categories present in the category tree response
 * obtained from the API to a file.
 *
 * The response is currently in the HTML format with each name identified by a
 * specific class.
 */
function mw_api_client_cat_tree_callback (response) {
	if (response.html === null)
		e.fatal_error ('Output not in expected format!')

	const category_label_selector = '.CategoryTreeLabel'
	const { document } = (new JSDOM(response.categorytree.html)).window;
	const nodes = document.querySelectorAll (category_label_selector)
	var cats_str = ''

	// sanity check
	if (nodes.length === 0) {
		e.fatal_error('Fetching categories failed!')
	}
	else {
		console.log(`Successfully got ${nodes.length} categories.`)
	}

	nodes.forEach (function (node) {
		cats_str += node.textContent + '\n'
	})
	cats_writer.write (cats_str)
}

/**
 * The API request parameters
 */
const api_request_params = {
	action: 'categorytree',
	category: 'Main_topic_classifications',
	options: '{ "depth": 2 }'
}

function generate_category_list_files () {
	mw_api_client
		.execute(api_request_params)
		.then(function (api_res) {
			mw_api_client_cat_tree_callback (api_res)
		})
}

module.exports = generate_category_list_files
