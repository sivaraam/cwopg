'use strict';

/**
 * This program generates a list of articles that belong to a given set of
 * categories or it's children.
 */

const fs = require('fs');
const articleListGenerator = require('./petscan-article-list');

const generateArticleListFile = function (articles, articleListFile, callback) {
    const writeOptions = { encoding: 'utf-8' };

    console.log('About to generate article list file:', articleListFile);

    fs.writeFile(
        articleListFile,
        articles.join('\n'),
        writeOptions,
        function (err) {
            if(err) {
                throw err;
            }
            else {
                console.log('Generated the article list file.');
                callback();
            }
        }
    );
};

const generateArticleList = function (categories, articleListFile, callback) {
    if (categories === null) {
        e.fatalError('Invalid categories');
    }

    if (categories.length === 0) {
        e.fatalError('No categories found.');
    }

    /*** DEBUG ***/
     const categoryListDebugFile = './category-list-debug';
     fs.writeFileSync(categoryListDebugFile, categories.join('\n'));
     console.log(
    	 'Successfully wrote the list of categories for debug:',
    	 categoryListDebugFile
     );


    articleListGenerator.generateArticleList(categories,
    function articlesGenerated (articles) {
        if (articles.length === 0) {
            e.fatalError('No articles found for the given category.');
        }

        console.log(`Successfully got ${articles.length} articles.`);

        /*
         * Remove the duplicate articles from the list
         */
        const dedupedArticles =  articles.filter(
            function onlyUnique (value, index, self) {
                return self.indexOf(value) === index;
            });

        const duplicates = articles.length - dedupedArticles.length;
        console.log(`Removed ${duplicates} duplicates.`);

        generateArticleListFile(dedupedArticles, articleListFile, callback);
    });
};

exports.generateArticleList = generateArticleList;
// generateArticleList(
//     ['Sudoku', 'Bullfighting'],
//     '../article-list',
//     function () {
//         console.log("Successfully generated article list.");
//     }
// );
