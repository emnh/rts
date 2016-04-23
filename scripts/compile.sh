#!/bin/bash
./scripts/getModelSizes.py > json/modelSizes.json
# node node_modules/jade/bin/jade.js -P index.jade
if [ deps.js -nt bundle-deps.js ]; then
  node ./node_modules/browserify/bin/cmd.js deps.js --ig --fast --outfile bundle-deps.js
fi
