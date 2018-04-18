/**
 * Program to get the article list using the MediaWiki API.
 *
 * This is to be used as a fallack when PetScan fails.
 */

const bot = require('nodemw');
const e = require('../../lib/error.js');
const nodemwConfig = require('../config/nodemw-config.json')
const client = new bot(nodemwConfig);
const articles = [];

const getArticlesForCategoryIndex = function (categories, index, callback) {
    const mainNsId = 0, categoryNsId = 14;
    const currCat = categories[index];
    const maxDepth = 250;

    client.getPagesInCategory(currCat.title, function(err, response) {
        if (err) {
            e.fatalError(err);
        }

        response.forEach(function (responseItem) {
            if (responseItem.ns === mainNsId) {
                articles.push(responseItem.title);
            }
            else if (responseItem.ns === categoryNsId &&
                     currCat.depth !== maxDepth) {
                         categories.push({
                             /* Strip the 'Category:' prefix */
                             title: responseItem.title.slice(9),
                             depth: currCat.depth+1
                         });
                }
        })

        index++;
        if (index !== categories.length) {
            getArticlesForCategoryIndex(categories, index, callback);
        }
        else {
            callback();
        }
    });
}

const generateArticleList = function (categories, callback) {
    const categoryObjects = [];

    /*
     * Generate the array of custom category objects from the
     * category list.
     *
     * The objects have the properties 'title' and 'depth'
     */
    categories.forEach(function categoryObjectGenerator(category) {
        categoryObjects.push({
            title: category,
            depth: 0
        });
    })

    getArticlesForCategoryIndex(categoryObjects, 0,
    function articlesGenerated () {
        callback (articles);
    });
}

module.exports.generateArticleList = generateArticleList;
