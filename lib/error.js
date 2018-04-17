/**
 * Program to easily throw an error with a custom message.
 */

module.exports.fatal_error = function(msg) {
    console.error('ERROR:', msg);
    throw new Error('Something went badly wrong!');
};
