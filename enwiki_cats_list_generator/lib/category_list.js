'use strict';

/**
 * Dumps all the categories available in enwiki to a file.
 *
 * WARNING: A better way to obtain the latest dump of all categories from
 * dumps.wikimedia.org and extract the category names from it using a substitution.
 *
 * For example, the following 'vim' substitution:
 *
 *	%s/([0-9][0-9]*,'\([a-zA-Z0-9_\.\,\&()-][a-zA-Z0-9_\.\,\&()-]*\)',[0-9][0-9]*,[0-9][0-9]*,[0-9][0-9]*),/\1\r/
 *
 * would extract most of the category names.
 *
 * Though the data might be a little out-of-date, it's much easier and
 * is less time & resource consuming.
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
const fs = require('fs')

/**
 * New instance used to access the MW API
 */
const mw_api_client = new mw_api (
	'Category list generator (kaartic.sivaraam+mwapi@gmail.com, User:Kaartic)',
	'https://en.wikipedia.org/w/api.php'
)

/**
 * The API request parameters
 */
const api_request_params = {
	action: 'query',
	list: 'allcategories'
}

function generate_category_list_files (cats_file) {
	const cats_writer = fs.createWriteStream(cats_file)

	function mw_api_client_cat_callback (response) {
		const curr_cats = response.query.allcategories
		var curr_cats_str = ''

		cats_writer.write (curr_cats_str)

		curr_cats.forEach (function (cat) {
			curr_cats_str += cat.category + '\n'
		})
		curr_cats_str = curr_cats_str.trim()

		cats_writer.write (curr_cats_str)

		// we need to continue the 'continuable' request
		// to get a list of all categories till the end
		return true
	}

	mw_api_client
		.iterate(api_request_params, null, mw_api_client_cat_callback)
		.then(function (api_res) {
			// ensure that the category list file exists
			try {
				fs.statSync(category_list_file)
			} catch(error) {
				if(error.code === 'ENOENT') {
					console.console.error(error);
					e.fatal_error(`Generation of complete category list file '${cats_file}' failed!`)
				}
			}

			console.log (`Generated complete category list file ${cats_file} successfully!`)
		})
}

module.exports = generate_category_list_files
