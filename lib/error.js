(function () {
	module.exports.fatal_error = function(msg) {
		console.error(msg);
		throw new Error('Something went badly wrong!');
	};
})();
