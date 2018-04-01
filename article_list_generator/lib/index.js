'use strict';

/**
  * This program generates a list of articles that belong to a given set of
  * categories or it's children.
  */

/**
  * The library required for manipulating HTTP GET requests
  * and it's response.
  */
const request = require('request')
const path = require('path')
const fs = require('fs')
const e = require('../../lib/error.js')

const petscan_url = 'https://petscan.wmflabs.org/'

/**
  * Get the PetScan parameters that don't change often.
  */
const petscan_params = require('../config/article_list_generator.json')

/**
  * Reads the category list file and returns the list of categories in it.
  *
  * Returns an array in which each element represents a category. Returns null
  * in case the file doesn't exist.
  */
function read_category_list_file(category_list_file) {
	// ensure that the category list file exists
	try {
		fs.statSync(category_list_file)
	} catch(error) {
		if(error.code === 'ENOENT') {
			return null
		}

		throw error
	}

	console.log(`About to read the category list file (${category_list_file}).`)

	const categories = fs.readFileSync(category_list_file, 'utf-8')
			     .split('\n')
			     .filter(Boolean)  // to ignore empty lines

	// sanity check
	if (categories == null) {
		return null
	}

	console.log(`Successfully read ${categories.length} categories.`)

	return categories
}

/**
  * Writes the given set of articles to the given article list file.
  */
function write_article_list_file(articles, article_list_file) {
	console.log(`About to generate the article list file (${article_list_file}).`)

	fs.writeFileSync(article_list_file, articles.join('\n'),  function(err) {
		if(err) {
			throw err
		}

		console.log('Generated the article list file.')
	})
}

/**
  * Generates the article list from the PetScan's response which is given in as
  * a JSON string and writes one article per line in the given artile list file.
  */
function generate_article_list_file_from_petscan_res(petscan_json_response, article_list_file) {
	const petscan_response = JSON.parse(petscan_json_response)
	const articles_object = petscan_response['*'][0].a['*']

	if (articles_object === null) {
		e.fatal_error('Failed to fetch article list from PetScan response')
	}

	const articles = new Array()

	for (var curr=0; curr<articles_object.length; curr++) {
		articles.push(articles_object[curr].title)
	}

	if (articles.length === 0) {
		e.fatal_error('No articles found for the given category.')
	}

	console.log(`Successfully got ${articles.length} articles for the given set of categories.`)

	write_article_list_file(articles, article_list_file)
}

function generate_article_list (category_list_file_name, article_list_file_name) {

	/* Resolve the name of the files to their corresponding relative path */
	const project_root = path.dirname(require.main.filename)
	const category_list_file = path.resolve(project_root, category_list_file_name)
	const article_list_file = path.resolve(project_root, article_list_file_name)

	const categories = read_category_list_file(category_list_file)

	if (categories === null) {
		e.fatal_error(`Category list file ${category_list_file} does not exist`)
	}

	if (categories.length === 0) {
		e.fatal_error('No categories found.')
	}

	petscan_params.categories = categories.join('\n')

	console.log('Requesting the article list for the given set of categories.')

	// Do the HTTP request to PetScan to get the list of articles for the given
	// set of categories.
	request.get({
		url: petscan_url,
		qs: petscan_params
	}, function (error, response, body) {
		if (error != null) {
			e.fatal_error(`error: ${error}`)
		}
		if (response && response.statusCode === 200) {
			generate_article_list_file_from_petscan_res(body, article_list_file)
		} else if (!response) {
			e.fatal_error('No response received from PetScan!')
		} else {
			e.fatal_error(`PetScan request failed with status code: ${response.statusCode}\n${response.body}`)
		}
	})
}

module.exports.generate_article_list = generate_article_list
