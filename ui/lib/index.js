'use strict'

const express = require ('express');
const body_parser = require('body-parser');
const cookieParser = require('cookie-parser');
const package_generator_orchestrator = require('../..');
const path = require ('path');
const app = express();
const port = 3000;
const file_path_cookie_id = 'cwopgZimFilePath';

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

app.use(cookieParser());

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

app.post ('/generate-package', function (request, response) {
	const params = {
		user_query: request.body.keywords,
		nopic: request.body.nopic !== undefined,
		novid: request.body.novid !== undefined
	}

	const package_callback = function (output_file) {
		response.cookie(file_path_cookie_id, output_file, { httpOnly: true });
		response.set('Cache-Control', 'max-age=60, must-revalidate');
		response.set('Content-Type', 'text/plain');
		response.status(200).send('Success!');
	};

	/* Generate the offline package for the obtained keywords */
	package_generator_orchestrator.generate_package (params,
	                                                 package_callback);
});

app.get ('/download-package', function (request, response) {
	const download_options = {
		dotfiles: 'deny',
		headers: {
			'x-timestamp': Date.now(),
			'x-sent': true
		}
	};
	const file_name = 'custom-enwiki-package.zim';

	if (request.cookies[file_path_cookie_id])
	{
		const file_path = request.cookies[file_path_cookie_id];

		response.cookie(file_path_cookie_id, '');
		response.download (file_path, file_name, download_options, function (err) {
			if (err) {
				console.log (err);
			} else {
				console.log ('Sent:', file_name);
			}
		});
	}
});

app.listen (port, function (err) {
	if (err) {
		return console.error("Something bad happened!", err);
	}

	console.log (`Server is listening on port ${port}`);
});
