/**
 * Program to easily throw an error with a custom message.
 */
exports.fatalError = function(msg) {
    console.error('ERROR:', msg);
    throw new Error('Something went badly wrong!');
};
