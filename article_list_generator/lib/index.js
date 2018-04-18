'use strict';

/**
 * This program generates a list of articles that belong to a given set of
 * categories or it's children.
 */

const fs = require('fs');
const articleListGenerator = require('./petscan-article-list');

const generateArticleListFile = function (articles, articleListFile, callback) {
    const writeOptions = { encoding: 'utf-8' };

    console.log(`About to generate the article list file (${articleListFile}).`);

    fs.writeFile(articleListFile, articles.join('\n'), writeOptions, function(err) {
        if(err) {
            throw err;
        }
        else {
            console.log('Generated the article list file.');
            callback();
        }
    });
};

const generateArticleList = function (categories, articleListFile, callback) {
    if (categories === null) {
        e.fatalError('Invalid categories');
    }

    if (categories.length === 0) {
        e.fatalError('No categories found.');
    }

    /*** DEBUG ***/
    fs.writeFileSync('./category-list-debug', categories.join('\n'));
    console.log('Successfully wrote the list of categories for debug.');

    articleListGenerator.generateArticleList(categories,
    function articlesGenerated (articles) {
        if (articles.length === 0) {
            e.fatalError('No articles found for the given category.');
        }

        console.log(`Successfully got ${articles.length} articles for the given set of categories.`);

        /*
         * Remove the duplicate articles from the list
         */
        const dedupedArticles =  articles.filter(
            function onlyUnique (value, index, self) {
                return self.indexOf(value) === index;
            });

        console.log(`Removed ${articles.length - dedupedArticles.length} duplicates.`);

        generateArticleListFile(dedupedArticles, articleListFile, callback);
    });
};

module.exports.generateArticleList = generateArticleList;
/*generateArticleList(['Sudoku', 'Bullfighting'], '../articleList', function () {
    console.log("Successfully generated article list.");
});*/
