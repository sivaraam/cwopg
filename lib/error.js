(function () {
	module.exports.fatal_error = function(msg) {
		console.error('ERROR:', msg);
		throw new Error('Something went badly wrong!');
	};
})();
