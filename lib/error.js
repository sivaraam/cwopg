module.exports.fatalError = function(msg) {
    console.error('ERROR:', msg);
    throw new Error('Something went badly wrong!');
};
