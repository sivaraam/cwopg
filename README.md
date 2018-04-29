## Customized Wikipedia offline package generator

An ongoing Node.js application that would allow users to download
custom offline packages of Wikipedia articles.

It currently has a few issues which make it require a round-about
way to make it up and running. Documenting it just for the sake of
reference. Note that the build process would be made easier.

#### Build:

```
# Clone the repository
git clone https://github.com/sivaraam/cwopg

# Run `npm install` in the project root.
cd cwopg && npm install

# Run `npm install` inside the `ui/web` folder
# This is a little absurd
cd ui/web && npm install

# Generate the CSS files
npm run deploy:sass

# Start the server
cd .. && node lib/index.js
```
