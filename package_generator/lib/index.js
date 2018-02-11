'use strict';

/**
  * This program is expected to generate a ZIM file consisting
  * of a set of pages from Wikipedia.
  */

const mwoffliner =  require('mwoffliner')
const article_list_file = '../articleList' //should be present in the project root directory

/**
  * Get the required configuration that doesn't change often.
  */
const parameters = require('../config/package_generator_dev.json')

// TODO: give a better error message if articleList is missing
parameters.articleList = article_list_file
mwoffliner.execute(parameters)
