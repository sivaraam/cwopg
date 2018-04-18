'use strict'

const express = require ('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const packageGeneratorOrchestrator = require('../..');
const path = require ('path');
const app = express();
const port = 3000;
const filePathCookieId = 'cwopg-zim-file-path';

app.use( express.static( path.join(__dirname, '../static') ) );

/** bodyParser.urlencoded(options)
 * Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST)
 * and exposes the resulting object (containing the keys and values) on req.body
 */
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json());

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
        userQuery: request.body.keywords,
        nopic: request.body.nopic !== undefined,
        novid: request.body.novid !== undefined
    }

    const packageCallback = function (outputFile) {
        response.cookie(filePathCookieId, outputFile, { httpOnly: true });
        response.set('CacheControl', 'max-age=60, must-revalidate');
        response.set('ContentType', 'text/plain');
        response.status(200).send('Success!');
    };

    /* Generate the offline package for the obtained keywords */
    packageGeneratorOrchestrator.generatePackage (params,
                                                 packageCallback);
});

app.get ('/download-package', function (request, response) {
    const downloadOptions = {
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };
    const fileName = 'custom-enwiki-package.zim';

    if (request.cookies[filePathCookieId])
    {
        const filePath = request.cookies[filePathCookieId];

        response.cookie(filePathCookieId, '');
        response.download (filePath, fileName, downloadOptions, function (err) {
            if (err) {
                console.log (err);
            } else {
                console.log ('Sent:', fileName);
            }
        });
    }
});

const server = app.listen (port, function (err) {
    if (err) {
        return console.error("Something bad happened!", err);
    }

    console.log (`Server is listening on port ${port}`);
});

/*
 * FIXME: Make the clients poll for completion of package generation thus
 * avoiding connection timeouts.
 *
 * Unfortuntaely, the requests take a long time to complete due to the initial
 * implementation without awareness of the fact that the response for each
 * request shouldn't be delayed for too long. This resulted in the connections
 * getting closed after a default timeout which in turn resulted in HTTP clients
 * (typically browsers) sending retries for the requests which received no
 * response. Thus the application reeived another request before the previous
 * was completed.
 *
 * Temporarily stopGap the issue by turning off timeouts in the incoming
 * connections.
 */
server.setTimeout(0);
