'use strict';

/**
 * This program is expected to generate a ZIM file consisting
 * of the set of Wikipedia articles specified in the 'articleList' file.
 *
 * The output of this program is expected to be a ZIM file.
 */

const fs = require('fs');
const path = require('path');
const execa = require('execa');
const e = require('../../lib/error');

const parameters = require('../config/mwoffliner-config');

/**
 * Generate the ZIM file package for the list of articles present in the given
 * article list file.
 *
 * Each line of the file is expected to represent a valid article title.
 */
const generateZimPackage =
    function (articleListFile, zimOutputDir, packageOptions, callback) {
        const getMwofflinerFormat = function (packageOptions) {
            let options = '';

            options += (packageOptions.nopic) ? 'nopic,' : '';
            options += (packageOptions.novid) ? 'novid' : '';

            return options;
        };

        /*
         * Generate the ZIM file only if the article list file
         * exists and is readable
         */
        fs.access(
            articleListFile,
            fs.constants.ROK,
            function (err) {
                if (err) {
                    if (err.code == 'ENOENT') {
                        e.fatalError(`
                            Missing article list file: ${articleListFile}`
                        );
                    }
                    else {
                        console.log(err);
                        e.fatalError(
                            `Could not read the article list file: ` +
                            `${articleListFile}`
                        );
                    }
                }
                else {
                    const filePrefix = 'enwiki';
                    const execaOptions = { localDir: __dirname };
                    const npmMwofflinerCmdParams = [];
                    let npmMwoffliner = null;

                    /**
                     * Get the required 'mwoffliner' configuration that
                     * doesn't change often.
                     */
                    parameters.articleList = articleListFile;

                    /*
                     * It seems that newer mwoffliner versions don't
                     * respect absolute paths for the output directories.
                     * Ignore it for now as we can live with it for now.
                     *
                     * Anyways, see the following PR that tries to fix this:
                     *
                     * https://github.com/openzim/mwoffliner/pull/753
                     */
                    parameters.outputDirectory = zimOutputDir;
                    parameters.filenamePrefix = filePrefix;
                    parameters.format = getMwofflinerFormat(packageOptions);
                    /*parameters.customZimTitle = ; // TODO: add title */

                    Object.keys(parameters).forEach(
                        function cmdParamGen (key, index) {
                            /*
                             * Ignore the comment which we have added.
                             */
                            if (key == '__comment') return;

                            npmMwofflinerCmdParams.push(`--${key}`);
                            npmMwofflinerCmdParams.push(parameters[key]);
                        }
                    );

                    /**
                     * FIXME: Help change `mwoffliner.execute()` so that the
                     * caller could know when the file generation gets
                     * completed.
                     *
                     * The JS API of mwoffliner is not usable as the
                     * 'mwoffliner.execute()', which is used to generate
                     * the ZIM package, does a lot of things asynchronously
                     * and thus returns before the corresponding ZIM file is
                     * actually generated.
                     * Further, there is no API exposed to actually know when
                     * the file generation gets completed.
                     *
                     * So, temporarily work around this by using the command
                     * line binary of mwoffliner which gets installed into the
                     * '$(npm bin)' folder.
                     */
                    npmMwoffliner = execa(
                        'mwoffliner',
                        npmMwofflinerCmdParams,
                        execaOptions
                    );

                    npmMwoffliner.stdout.pipe(process.stdout);
                    npmMwoffliner.stderr.pipe(process.stderr);
                    npmMwoffliner.then(
                        function (result) {
                            /*
                             * Regex to extract the filename from the 'verbose'
                             * output of mwoffliner.
                             *
                             * FIXME: This is highly dependant on the output
                             * which might change at anytime but there's no
                             * better way for now.
                             */
                            const outFilePathExtractRE =
                                            /Writing zim to \[(.*\.zim)\]/;

                            const extractedPaths = outFilePathExtractRE.exec(result.stdout);

                            if (extractedPaths) {
                                /*
                                 * The output file path is at index 1 of the array
                                 * returned by exec().
                                 */
                                const outFilePath =
                                        outFilePathExtractRE.exec(result.stdout)[1];

                                callback(outFilePath);
                            }
                            else {
                                e.fatalError(
                                    "We couldn't find the output path to the ZIM file. " +
                                    "Has the verbose output of mwoffliner changed?"
                                );
                            }
                        }
                    );
                }
            }
        );
    };

exports.generateZimPackage = generateZimPackage;
// generateZimPackage(
//     '../article-list',
//     '../public/output',
//     {},
//     function zimOpFile(file){
//         console.log(file);
//     }
// );
