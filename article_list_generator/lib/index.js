'use strict';

/**
  * This program is expected to generate a list of articles that belong to a
  * given category or it's children.
  *
  * The output of this program is the 'articleList' file.
  */

/**
  * The file contains the list of categories using which the list of articles
  * that belong to that category or one of it's children has to be generated.
  *
  * This file is generated by an external module. This file is required for the
  * program to run successfully.
  */
const category_list_file = "../categoryList"
const article_list_file = "../articleList"

/**
  * The library required for manipulating HTTP GET requests
  * and it's response.
  */
const request = require('request')
const fs = require('fs');

const petscan_url = 'https://petscan.wmflabs.org/'

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
	const categories = fs.readFileSync(category_list_file, 'utf-8')
			     .split('\n')
			     .filter(Boolean)  // to ignore empty lines

	return categories
}

function generate_article_list(petscan_json_response) {
	const petscan_response = JSON.parse(petscan_json_response)
	const articles_object = petscan_response['*'][0].a['*']
	const articles = new Array()

	for (var curr=0; curr<articles_object.length; curr++) {
		articles.push(articles_object[curr].title)
	}

	return articles
}

function write_article_list(articles) {
	const article_write_stream = fs.createWriteStream(article_list_file)

	for (var article_index=0; article_index<articles.length; article_index++) {
		console.log('Writing', articles[article_index])
		article_write_stream.write(articles[article_index]+"\n")
	}
}

const categories = read_category_list(category_list_file)

petscan_params.categories = categories.join('\n')

request.get({
	url: petscan_url,
	qs: petscan_params
}, function (error, response, body) {
	if (error != null) {
		console.log('error:', error); // Print the error if one occurred
		throw new Error('Something went badly wrong!');
	}
	console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
	const articles = generate_article_list(body)
	write_article_list(articles)
});
