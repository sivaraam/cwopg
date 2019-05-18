## Customized Wikipedia offline package generator

A Node.js application that would allow users to download
custom offline packages of Wikipedia articles.

It currently has a few issues which make it require a round-about
way to make it up and running. Documenting it just for the sake of
reference. Note that the build process would be made easier.

### Build

```
# Clone the repository
git clone https://github.com/sivaraam/cwopg

# Run `npm install` in the project root.
cd cwopg && npm install

cd ui/web

# Generate the CSS files
npm run deploy:sass

# Start the server
cd .. && node lib/index.js
```

### Dependencies

#### Category list file
Currently a file required for the application to run isn't present
in the repository due to it's huge size. A script to automatically
generate the file would be introduced in the upcoming days.

In case you're wondering the file contains the list of Wikipedia
categories one per line. If you create that and place it in the
project's root directory with the name specified in
`enwiki-cats-bigger` file then you could possibly make the project
work. Note that you would have to pre-process the file using the
`enwiki_cats_preprocessor` module.

```
# Somehow create the enwiki-cats-bigger file which contains a list
# of valid Wikipedia category titles
# Note: without the 'Categories:' prefix

# Preprocess the file
cd enwiki_cats_preprocessor && node lib/index.js
```

#### Unhandled promise
Due to an issue in one of the dependencies (`mwoffliner`), the
application might not work correctly in newer versions of node.
There's a fix in the source but it doesn't seems to be published yet.
See [this issue](https://github.com/openzim/mwoffliner/issues/281)
for more details and a work-around.

### Warning
Currently, the project has only been developed for the English
Wikipedia. It doesn't support other languages (even if you use a
category list containing categories of another language Wikipedia
project). It has to be modified to support other language projects.
