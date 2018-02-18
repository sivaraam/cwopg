'use strict';

/**
  * This program is expected to generate a list of articles that belong to a
  * given category or it's children.
  *
  * The output of this program is the 'articleList' file.
  */

/**
  * The library required for manipulating HTTP GET requests
  * and it's response.
  */
const request = require('request')
const fs = require('fs');
const e = require('../../lib/error.js')

const petscan_url = 'https://petscan.wmflabs.org/'

  /**
    * The file contains the list of categories using which the list of articles
    * that belong to that category or one of it's children has to be generated.
    *
    * This file is generated by an external module (TBD). This file is required for the
    * program to run successfully.
    */
const category_list_file = '../categoryList' // should be present in the project's root directory

/**
  * The list of articles is stored in this file. This is expected to be used by
  * other modules.
  *
  * This file contains the output of this module.
  */
const article_list_file = '../articleList'

/**
  * Get the PetScan parameters that don't change often.
  */
const petscan_params = require('../config/article_list_generator.json')

/**
  * Reads the category list file and returns the list of categories in it.
  *
  * Assumes that the file exists.
  *
  * Returns an array in which each element represents a category.
  */
function read_category_list(category_list_file) {
	console.log(`About to read the category list file (${category_list_file}).`)

	const categories = fs.readFileSync(category_list_file, 'utf-8')
			     .split('\n')
			     .filter(Boolean)  // to ignore empty lines

	// sanity check
	if (categories == null) {
		e.fatal_error('Categories could not be read!')
	}

	console.log(`Successfully read ${categories.length} categories.`)

	return categories
}

/**
  * Generates the article list from the PetScan's response which is given in as
  * a JSON string.
  *
  * Returns an array with each element representing an article.
  */
function generate_article_list(petscan_json_response) {
	const petscan_response = JSON.parse(petscan_json_response)
	const articles_object = petscan_response['*'][0].a['*']

	if (articles_object == null) {
		e.fatal_error('PetScan response not in expected format.')
	}

	const articles = new Array()

	for (var curr=0; curr<articles_object.length; curr++) {
		articles.push(articles_object[curr].title)
	}

	console.log(`Successfully got ${articles.length} articles for the given set of categories.`)

	return articles
}

/**
  * Writes the given set of articles to the given article list file.
  */
function write_article_list(articles, article_list_file) {
	console.log(`About to generate the article list file (${article_list_file}).`)

	const article_write_stream = fs.createWriteStream(article_list_file)

	for (var article_index=0; article_index<articles.length; article_index++) {
		article_write_stream.write(articles[article_index]+'\n')
	}

	console.log('Generated the article list file.')
}

// ensure that the category list file exists
try {
	fs.statSync(category_list_file)
} catch(error) {
	if(error.code === 'ENOENT') {
		e.fatal_error(`Category file '${category_list_file}' does not exist.`)
	}

	throw err
}

const categories = read_category_list(category_list_file)

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
		e.fatal_error(`error: ${error}`) // Print the error if one occurred
	}
	if (response && response.statusCode === 200) {
		const articles = generate_article_list(body)
		write_article_list(articles, article_list_file)
	} else if (!response) {
		e.fatal_error('No response received from PetScan!')
	} else {
		e.fatal_error(`PetScan request failed with status code: ${response.statusCode}\n${response.body}`)
	}
});
