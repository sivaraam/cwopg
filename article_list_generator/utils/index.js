'use strict';

/**
* A utility to analyze and find a typical maximum number of categories
* per PetScan request.
*/

/*
 * The library required for manipulating HTTP GET requests
 * and it's response.
 */
const request = require('request');
const e = require('../../lib/error');

const petscanUrl = 'https://petscan.wmflabs.org/';

/*
 * Get the PetScan parameters that don't change often.
 */
const petscanParams = require('../config/petscan-config');

const findTypcialCategoriesPerRequest = function () {
    const testCategory =
                'National_members_of_the_Confederation_of_Chess_for_America';
    let knownGood = 125;
    let knownBad = 140;

    const requestPetscan = function () {
        let mid = Math.floor( (knownBad + knownGood) / 2 );
        const cats = new Array(mid);
        cats.fill(testCategory);
        petscanParams.categories=cats.join('\n');

        console.log(`Requesting the article list for ${mid} categories.`);

        /*
         * Do the HTTP request to PetScan to get the list of articles for
         * the given set of categories.
         */
        request.get(
            {
                url: petscanUrl,
                qs: petscanParams
            },
            function (error, response, body) {
                if (error != null) {
                    e.fatalError(`error: ${error}`);
                }
                if (response && response.statusCode === 200) {
                    console.log('log: PetScan request succeeded');
                    if (knownBad != knownGood) {
                        knownGood = mid+1;
                        requestPetscan();
                    }
                } else if (!response) {
                    e.fatalError('No response received from PetScan!');
                } else {
                    if (response.statusCode === 414) {
                        console.log('log: PetScan request failed');
                        if (knownBad != knownGood) {
                            knownBad = mid;
                            requestPetscan();
                        }
                    }
                    else {
                        e.fatalError(
                            `PetScan request failed with status code: ` +
                            `${res.statusCode}\n${response.body}`
                        );
                    }
                }
            }
        );
    };

    requestPetscan();
};

findTypcialCategoriesPerRequest();
