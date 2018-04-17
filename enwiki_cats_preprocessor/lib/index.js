'use strict';

/**
 * Preprocess a file containing a list of enwiki categories to make it suitable for
 * searching.
 */

const fs = require('fs');
const preprocess = require('../../preprocess');
const e = require('../../lib/error');

const read_enwiki_cats_file = function (enwiki_cats_file, callback) {
    const read_options = { encoding: 'utf-8' };

    fs.readFile(enwiki_cats_file, read_options, function enwiki_cats_read_callback (err, data) {
        if (err) {
            if (err.code == 'ENOENT') {
                e.fatal_error(`enwiki category list file ${enwiki_cats_file} missing.`);
            }
            else {
                e.fatal_error(err);
            }
        }
        else {
            const enwiki_cats = data.split('\n')
                                    .filter(Boolean);  // to ignore empty lines

            /* sanity check */
            if (enwiki_cats == null) {
                return null;
            }

            console.log(`Successfully read ${enwiki_cats.length} categories.`);

            callback(enwiki_cats);
        }
    });
};

const preprocess_enwiki_cats_file = function (enwiki_cats_file, preprocessed_enwiki_cats_file) {
    read_enwiki_cats_file(enwiki_cats_file, function read_complete_callback (enwiki_cats_arr) {
        const enwiki_cats_preprocessed = [];
        const write_options = { encoding: 'utf-8' };
        var enwiki_cats_write_stream = null;

        if (enwiki_cats_arr === null) {
            e.fatal_error(`enwiki category list file ${enwiki_cats_file} does not exist`);
        }

        if (enwiki_cats_arr.length === 0) {
            e.fatal_error('No categories found in enwiki category list file!');
        }

        /*
         * Preprocess the categories
         */
        enwiki_cats_arr.forEach (function (cat) {
            enwiki_cats_preprocessed.push(preprocess (cat).join(" "));
        });

        /*
         * Write back the preprocessed output to destination
         */
        enwiki_cats_write_stream = fs.createWriteStream(preprocessed_enwiki_cats_file, write_options);
        for (var i=0; i<enwiki_cats_arr.length; i++) {
            enwiki_cats_write_stream.write(enwiki_cats_arr[i]+';'+enwiki_cats_preprocessed[i]+'\n');
        }

        console.log ('Successfully preprocessed the enwiki category list file.');
    });
};

preprocess_enwiki_cats_file('../enwiki-cats-bigger', '../enwiki-cats-bigger-preprocessed');
