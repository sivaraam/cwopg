/**
 * Program to get the article list using the MediaWiki API.
 *
 * This is to be used as a fallack when PetScan fails.
 */

const bot = require('nodemw');
const e = require('../../lib/error');

const nodemwConfig = require('../config/nodemw-config')

const client = new bot(nodemwConfig);
const articles = [];

const getArticlesForCategoryIndex = function (categories, index, callback) {
    const mainNsId = 0, categoryNsId = 14;
    const maxDepth = 250;
    const currCat = categories[index];

    client.getPagesInCategory(
        currCat.title,
        function (err, response) {
            if (err) {
                e.fatalError(err);
            }

            response.forEach(
                function (page) {
                    if (page.ns === mainNsId) {
                        articles.push(page.title);
                    }
                    else if (page.ns === categoryNsId &&
                             currCat.depth !== maxDepth) {
                                 categories.push(
                                     {
                                         /* Strip the 'Category:' prefix */
                                         title: page.title.slice(9),
                                         depth: currCat.depth+1
                                     }
                                 );
                        }
                }
            );

            index++;
            if (index !== categories.length) {
                getArticlesForCategoryIndex(categories, index, callback);
            }
            else {
                callback();
            }
        }
    );
};

const generateArticleList = function (categories, callback) {
    const categoryObjects = [];

    /*
     * Generate the array of custom category objects from the
     * category list.
     *
     * The objects have the properties 'title' and 'depth'
     */
    categories.forEach(
        function categoryObjectGenerator(category) {
            categoryObjects.push(
                {
                    title: category,
                    depth: 0
                }
            );
        }
    );

    getArticlesForCategoryIndex(
        categoryObjects,
        0,
        function articlesGenerated () {
            callback (articles);
        }
    );
};

exports.generateArticleList = generateArticleList;
// generateArticleList(['Sudoku', 'Bullfighting'], function (articles) {
//     console.log(`Successfully got ${articles.length} articles.`);
// });
