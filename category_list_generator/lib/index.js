'use strict';

/**
 * This program generates a list of relevant categories based on the given user
 * input.
 */

const fs = require('fs');
const e = require('../../lib/error.js');
const preprocess = require('../../preprocess');

/**
 * Generates an array representation of the list of enwiki categories and their
 * corresponding searchable elements present in a preprocessed file. Each line
 * is expected to said to be in the following format:
 *
 *     <Catgory_ID><Property_sep><Category_searchable_elem><Elem_sep><Category_searchable_elem>...
 *
 * Returns an array of objects which contain the 'id' and 'elems' properties.
 * The 'id' property is a string which contains the unique identifier for the
 * category and the 'elems' property contains the searchable elements which
 * correspond to the specific category.
 *
 * Throws an error in case of any issues. Else calls the callback with
 * the enwiki category list array.
 */
const read_enwiki_cats = function (enwiki_cats_file, callback) {
    const read_options = { encoding: 'utf-8' };
    console.log(`About to read the enwiki category list file (${enwiki_cats_file}).`);

    fs.readFile(enwiki_cats_file, read_options, function enwiki_cats_pp_read_callback (err, data) {
        if (err) {
            if (err.code == 'ENOENT') {
                e.fatal_error(`enwiki category list file ${enwiki_cats_file} missing.`);
            }
            else {
                e.fatal_error(err);
            }
        }
        else {
            const enwiki_cats_property_separator = ';';
            const enwiki_cats_property_elems_separator = ' ';
            const enwiki_cats = [];
            const enwiki_cats_lines = data.split('\n')
                                          .filter(Boolean);  // to ignore empty lines

            if (enwiki_cats_lines === null) {
                e.fatal_error (`Error while reading enwiki categories file '${enwiki_cats_file}`);
            }

            if (enwiki_cats_lines.length === 0) {
                e.fatal_error (`Could not get any categories from the enwiki categories file '${enwiki_cats_file}'`);
            }

            enwiki_cats_lines.forEach(function enwiki_cats_generator (line) {
                const properties = line.split(enwiki_cats_property_separator);
                enwiki_cats.push({
                    id: properties[0],
                    elems: properties[1].split(enwiki_cats_property_elems_separator)
                });
            });

            console.log(`Successfully read ${enwiki_cats.length} categories.`);

            callback(enwiki_cats);
        }
    });
};

/**
 * Returns true if the category given as a string is relevant to the given
 * user query string.
 *
 * For now, a category is relevant if it contains every searchable element
 * a keyword.
 */
const is_cat_relevant = function (cat_elems, keyword_elems) {
    var relevant = true;

    keyword_elems.forEach (function (keyword_elem) {
        if (!cat_elems.includes(keyword_elem)) {
            relevant = false;
        }
    });

    return relevant;
}

/**
 * Finds a list of relevant categories from the given set of enwiki categories
 * for the given user query string.
 *
 * Returns an array containing the list of ids corresponding to the relevant
 * categories.
 */
const get_relevant_cats = function (user_query, enwiki_cats) {
    /**
     * Filter out all elements whose length is 0.
     */
    const empty_elems_remover = function (elem, index, array) {
        return array[index].length !== 0;
    };
    const relevant_cats_id = [];
    const keywords = user_query.trim()
                               .split(/\s*,\s*/)
                               .filter(empty_elems_remover);
    const keywords_elems = [];

    /**
     * Preprocess each keyword to generate a list of searchable elements
     * representing it.
     */
    keywords.forEach(function preproces_keyword(keyword) {
        keywords_elems.push(preprocess(keyword));
    });

    for (var i=0; i < enwiki_cats.length; i++) {
        keywords_elems.forEach(function is_keyword_relevant(keyword_elems){
            if (is_cat_relevant (enwiki_cats[i].elems, keyword_elems)) {
                relevant_cats_id.push (enwiki_cats[i].id);
            }
        });
    }

    console.log (`Found ${relevant_cats_id.length} categories for the user query '${user_query}'`);
    return relevant_cats_id;
}

/**
 * @user_query: Comma-separated list of keywords
 *
 * Generate the category list consisting of relevant categories for a
 * given user query string and call the concerned callback after succcessfully
 * generating the list.
 */
const generate_category_list = function (user_query, enwiki_cats_file, categories_callback) {
    read_enwiki_cats(enwiki_cats_file, function read_complete_callback (enwiki_cats) {
        const relevant_cats_id = get_relevant_cats (user_query, enwiki_cats);

        if (relevant_cats_id.length === 0) {
            e.fatal_error ('Could not find any relevant categories for the given query');
        }

        categories_callback (relevant_cats_id);
    });
};

exports.generate_category_list = generate_category_list;
// generate_category_list('abdul kalam', '../enwiki-cats-bigger-preprocessed', function (categories){
//     console.log(`Successfully got ${categories.length} relevant categories`);
//     console.log(categories);
// });
