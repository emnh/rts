#!/bin/bash
./scripts/getModelSizes.py > json/modelSizes.json
node node_modules/jade/bin/jade.js -P index.jade
node ./node_modules/browserify/bin/cmd.js index.js -t babelify --outfile bundle.js
# for debugging es6 for..of in firefox, gives better errors than babel translation
# node ./node_modules/browserify/bin/cmd.js index.js -t [ babelify --whitelist es6.modules,es6.constants ] --outfile bundle2.js
