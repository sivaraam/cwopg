'use strict';

/**
 * Preprocess a file containing a list of enwiki categories to make it suitable for
 * searching.
 */

const fs = require('fs');
const preprocess = require('../../preprocess');
const e = require('../../lib/error');

const readEnwikiCatsFile = function (enwikiCatsFile, callback) {
    const readOptions = { encoding: 'utf8' };

    fs.readFile(enwikiCatsFile, readOptions, function enwikiCatsReadCallback (err, data) {
        if (err) {
            if (err.code == 'ENOENT') {
                e.fatalError(`enwiki category list file ${enwikiCatsFile} missing.`);
            }
            else {
                e.fatalError(err);
            }
        }
        else {
            const enwikiCats = data.split('\n')
                                   .filter(Boolean);  // to ignore empty lines

            /* sanity check */
            if (enwikiCats == null) {
                return null;
            }

            console.log(`Successfully read ${enwikiCats.length} categories.`);

            callback(enwikiCats);
        }
    });
};

const preprocessEnwikiCatsFile = function (enwikiCatsFile, preprocessedEnwikiCatsFile) {
    readEnwikiCatsFile(enwikiCatsFile, function readCompleteCallback (enwikiCatsArr) {
        const enwikiCatsPreprocessed = [];
        const writeOptions = { encoding: 'utf-8' };
        var enwikiCatsWriteStream = null;

        if (enwikiCatsArr === null) {
            e.fatalError(`enwiki category list file ${enwikiCatsFile} does not exist`);
        }

        if (enwikiCatsArr.length === 0) {
            e.fatalError('No categories found in enwiki category list file!');
        }

        /*
         * Preprocess the categories
         */
        enwikiCatsArr.forEach (function (cat) {
            enwikiCatsPreprocessed.push(preprocess (cat).join(" "));
        });

        /*
         * Write back the preprocessed output to destination
         */
        enwikiCatsWriteStream = fs.createWriteStream(preprocessedEnwikiCatsFile, writeOptions);
        for (var i=0; i<enwikiCatsArr.length; i++) {
            enwikiCatsWriteStream.write(enwikiCatsArr[i]+';'+enwikiCatsPreprocessed[i]+'\n');
        }

        console.log ('Successfully preprocessed the enwiki category list file.');
    });
};

preprocessEnwikiCatsFile('../enwiki-cats-bigger', '../enwiki-cats-bigger-preprocessed');
