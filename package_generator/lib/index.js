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

/**
 * Generate the ZIM file package for the list of articles present in the given
 * article list file.
 *
 * Each line of the file is expected to represent a valid article title.
 */
const generateZimPackage =
function (articleListFile, zimOutputDir, packageOptions, callback) {
    const getMwofflinerFormat = function (packageOptions) {
        var options = '';

        options += (packageOptions.nopic) ? 'nopic,' : '';
        options += (packageOptions.novid) ? 'novid' : '';

        return options;
    };

    /* Generate the ZIM file only if the article list file exists and is readable */
    fs.access(articleListFile, fs.constants.ROK, function (err) {
        if (err) {
            if (err.code == 'ENOENT') {
                e.fatalError(`Article list file '${articleListFile}' missing.`);
            }
            else {
                console.log(err);
                e.fatalError(`Unable to read the article list file '${articleListFile}'`);
            }
        }
        else {
            const filePrefix = 'enwiki'
            const execaOptions = { localDir: __dirname };
            const npmMwofflinerCmdParams = [];
            var npmMwoffliner = null;
            var outputFilePath = '';

            /**
             * Get the required 'mwoffliner' configuration that doesn't change often.
             */
            const parameters = require('../config/package_generator.json');
            parameters.articleList = articleListFile;
            parameters.outputDirectory = zimOutputDir;
            parameters.filenamePrefix = filePrefix;
            parameters.format = getMwofflinerFormat(packageOptions);
            /*parameters.customZimTitle = ; // TODO: add title */

            Object.keys(parameters).forEach(function cmdParamGen (key, index){
                npmMwofflinerCmdParams.push(`--${key}`);
                npmMwofflinerCmdParams.push(parameters[key]);
            });

            /**
             * The JS API of mwoffliner is not usable as the 'mwoffliner.execute()',
             * which is used to generate the ZIM package, does a lot of things
             * asynchronously and thus returns before the corresponding ZIM file is
             * actually generated. Further, there is no API exposed to actually know
             * when the file generation gets completed.
             *
             * So, temporarily work around this by using the command line binary of
             * mwoffliner which gets installed into the '$(npm bin)' folder.
             */
            npmMwoffliner = execa('mwoffliner', npmMwofflinerCmdParams, execaOptions);

            npmMwoffliner.stdout.pipe(process.stdout);
            npmMwoffliner.stderr.pipe(process.stderr);
            npmMwoffliner.then(result => {
                /*
                 * Regex to extract the filename from the 'verbose' output
                 * of mwoffliner.
                 *
                 * FIXME: This is highly dependant on the output which might change at
                 * anytime but there's no better way for now.
                 */
                const outputFilePathExtractRegex = /ZIM file built at (.*\.zim)/;

                if (result.stdout) {
                    /*
                     * The output file path is at index 1 of the array
                     * returned by exec().
                     */
                    outputFilePath = outputFilePathExtractRegex.exec(result.stdout)[1];
                }
                else {
                    const currDate = new Date();
                    const currYear = currDate.getFullYear();
                    const currMonth = currDate.getMonth()+1;
                    const currMonthStr = (currMonth<10) ?
                                         `0${currMonth}` :
                                         `${currMonth}`;

                    /*
                     * We turned off stdout so fall back to generating
                     * heuristic output file path.
                     *
                     * The file name is expected to be in the following format:
                     *
                     * <filePrefix>_articlelist_<year>-<month>.zim
                     */
                    const outputFileName = filePrefix + '_' + 'articlelist' + '_' +
                                           currYear + '-' + currMonthStr + '.zim';
                    outputFilePath = path.join(zimOutputDir, outputFileName);
                }

                callback(outputFilePath);
            });
        }
    });
};

module.exports.generateZimPackage = generateZimPackage;
/*generateZimPackage('../articleList', '../public/out', {}, function zimOpFile(file){
    console.log(file);
});*/
