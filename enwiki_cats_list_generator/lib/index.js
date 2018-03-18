'use strict';

/**
 * This program is expected to generate a list of related categories
 * for a given user input.
 *
 * The output of this program is the 'categoryList' file.
 */

const category_list_generator = require ('./category_tree')

/**
 * The file contains all the categories currently present in the category tree
 * rooted at 'Main_topic_classifications' with a depth of 2.
 */
const cats_file = '../enwiki-cats'

category_list_generator(cats_file)