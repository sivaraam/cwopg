'use strict';

/**
  * This program is expected to generate a ZIM file consisting
  * of the set of Wikipedia articles specified in the 'articleList' file.
  *
  * The output of this program is expected to be a ZIM file.
  */

/**
  * The library required to generate ZIM files.
  */
const mwoffliner =  require('mwoffliner')

/**
  * This file contains the list of articles which should be present in the
  * generated offline package (ZIM file).
  *
  * This is generated by an external module (article_list_generator). It is
  * required for the program to run successfully.
  */
const article_list_file = '../articleList' //should be present in the project's root directory

/**
  * Get the required 'mwoffliner' configuration that doesn't change often.
  */
const parameters = require('../config/package_generator_dev.json')

// TODO: give a better error message if the 'articleList' file is missing
parameters.articleList = article_list_file

// generate the ZIM file
mwoffliner.execute(parameters)
