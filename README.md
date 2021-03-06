## Customized Wikipedia offline package generator

A Node.js application that would allow users to download
custom offline packages of Wikipedia articles.

It currently has a few issues which make it require a round-about
way to make it up and running. Documenting it just for the sake of
reference. Note that the build process would be made easier.

### Build

```
# Clone the repository
# In case you think of downloading the repository
# see the 'Note about downloading' section below.
git clone https://github.com/sivaraam/cwopg

# Run `npm install` in the project root.
cd cwopg && npm install

# This is needed else npm will complain about the
# dependency being a Git repository and would
# error out in hte upcoming install
rm -rf node_modules/mwoffliner/

# We have to install twice as some dependencies (e.g., stemmer)
# don't seem to be fetch properly during the first install.
# For now we work around by installing twice.
npm install

# Run `npm install` inside the `ui/web` folder
# This is needed for the styles.
cd ui/web && npm install

cd ..

# Start the server
node lib/index.js

# Continue accessing the application
# in the browser at http://localhost:3000
```

### Dependencies
#### Git LFS
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

#### Redis server
One of the dependencies of the application [(`mwoffliner`) depends on](https://github.com/openzim/mwoffliner#prerequisites)
redis-server. So, it has to be installed. Kidnly refer to the
documentation about installing Redis server from [their website](https://redis.io/topics/quickstart).
By default, redis server is assumed to be running at
'redis://127.0.0.1:6379'. In case there is any change update the
configuration file found at [mwoffliner-config.json](package_generator/config/mwoffliner-config.json).

### Issues
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

### Note about downloading
In case you think of just downloading an archive of this repository,
let me tell you before hand that a file which the project depends on
(`enwiki-cats-bigger-preprocessed`) is tracked using Git LFS (due to
it's large size). As of now, downloading an archive of the repository
doesn't seem to be including the actual file but instead it just seems
to be including the place holder file of Git LFS.

So, if you wish to download the archive you would also have to [manually
download the dependent file](https://github.com/sivaraam/cwopg/blob/master/enwiki-cats-bigger-preprocessed?raw=true).

Alternatively, you don't have to do anything special when cloning the project
other than having [Git LFS installed](#git-lfs). Git auto-magically takes care of fetching
the files tracked by Git LFS for you. :sparkles: :tada:
