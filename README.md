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

# Run `npm install` inside the `ui/web` folder
# This is needed for the styles.
cd ui/web && npm install

# Generate the CSS files
npm run deploy:sass

# Start the server
cd .. && node lib/index.js

# Continue accessing the application
# in the browser at http://localhost:3000
```

### Dependencies

#### Redis server
One of the dependencies of the application (`mwoffliner`) depends on
redis-server. So, it has to be installed. Kidnly refer to the
documentation about installing Redis server from [their website](https://redis.io/topics/quickstart).
By default, redis server is assumed to be running at
'redis://127.0.0.1:6379'. In case there is any change update the
configuration file found at [package_generator/config/mwoffliner-config.json]().

#### Category list file
Currently a file required for the application to run is tracked via
[Git LFS](https://git-lfs.github.com/) due to its large size. So, you
would need Git LFS installed for the file to be fetched correctly.
Visit the [Git LFS website](https://git-lfs.github.com) for instructions
on installing Git LFS.

In case you have already cloned the repository without installing
Git LFS, run the following command **after installing** Git LFS
to fix the invalid state in which Git leaves the repo:

```
git checkout -f HEAD
```

In case you're wondering, the file contains the list of Wikipedia
categories one per line.

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
