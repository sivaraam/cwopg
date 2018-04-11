'use strict'

const express = require ('express');
const body_parser = require('body-parser');
const package_generator_orchestrator = require('../..');
const path = require ('path');
const app = express();
const port = 3000;

app.use( express.static( path.join(__dirname, '../static') ) );

/** bodyParser.urlencoded(options)
 * Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST)
 * and exposes the resulting object (containing the keys and values) on req.body
 */
app.use(
  body_parser.urlencoded({
    extended: true
  })
);

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(body_parser.json());

app.get ('/', function (request, response) {
	console.log (request.url);

	response.render ('index.html', function (err, html) {
		if (err) {
			console.log (err);
		} else {
			response.send (html);
			console.log ('Successfully sent index.');
		}
	})
});

app.post ('/custom-enwiki-package.zim', function (request, response) {
	const download_options = {
		dotfiles: 'deny',
		headers: {
			'x-timestamp': Date.now(),
			'x-sent': true
		}
	};

	const package_callback = function (output_file) {
		const file_name = 'custom-enwiki-package.zim';

		response.download (output_file, file_name, download_options, function (err) {
			if (err) {
				console.log (err);
			} else {
				console.log ('Sent:', file_name);
			}
		});
	};

	/* Generate the offline package for the obtained keywords */
	package_generator_orchestrator.generate_package (request.body.keywords,
	                                                 package_callback);
});

app.listen (port, function (err) {
	if (err) {
		return console.error("Something bad happened!", err);
	}

	console.log (`Server is listening on port ${port}`);
});
