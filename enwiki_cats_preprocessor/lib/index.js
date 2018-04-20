'use strict';

/**
 * Preprocess a file containing a list of enwiki categories to make it
 * suitable for searching.
 */

const fs = require('fs');
const preprocess = require('../../preprocess');
const e = require('../../lib/error');

const readEnwikiCatsFile = function (enwikiCatsFile, callback) {
    const readOptions = { encoding: 'utf-8' };

    fs.readFile(
        enwikiCatsFile,
        readOptions,
        function enwikiCatsReadCallback (err, data) {
            if (err) {
                if (err.code == 'ENOENT') {
                    e.fatalError(
                        `Missing file to preprocess: ${enwikiCatsFile}`
                    );
                }
                else {
                    e.fatalError(err);
                }
            }
            else {
                /* Ignore empty lines in data for sanity. */
                const enwikiCats = data.split('\n')
                                       .filter(Boolean);

                /* sanity check */
                if (enwikiCats == null) {
                    return null;
                }

                console.log(
                    `Successfully read ${enwikiCats.length} categories.`
                );

                callback(enwikiCats);
            }
        }
    );
};

const preprocessEnwikiCatsFile =
    function (enwikiCatsFile, preprocessedEnwikiCatsFile) {
        readEnwikiCatsFile(
            enwikiCatsFile,
            function readCompleteCallback (enwikiCatsArr) {
                const writeOptions = { encoding: 'utf-8' };
                const enwikiCatsPreprocessed = [];

                /*
                 * Write stream to write back the preprocessed output
                 * to the destination
                 */
                let enwikiCatsWriteStream = fs.createWriteStream(
                    preprocessedEnwikiCatsFile,
                    writeOptions
                );

                if (enwikiCatsArr === null) {
                    e.fatalError('Invalid parameter for enwiki cats file');
                }

                if (enwikiCatsArr.length === 0) {
                    e.fatalError(`No categories found in ${enwikiCatsFile}`);
                }

                /*
                 * Preprocess the categories
                 */
                enwikiCatsArr.forEach(
                    function (cat) {
                        enwikiCatsPreprocessed.push(
                            preprocess(cat).join(' ')
                        );
                    }
                );

                for (let i=0; i<enwikiCatsArr.length; i++) {
                    enwikiCatsWriteStream.write(
                        enwikiCatsArr[i] + ';' +
                        enwikiCatsPreprocessed[i] + '\n'
                    );
                }

                console.log(
                    'Successfully preprocessed the category list file.'
                );
            }
        );
    };

preprocessEnwikiCatsFile(
    '../enwiki-cats-bigger',
    '../enwiki-cats-bigger-preprocessed'
);
