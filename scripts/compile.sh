#!/bin/bash
./scripts/getModelSizes.py > json/modelSizes.json
# node node_modules/jade/bin/jade.js -P index.jade
if [ js/deps.js -nt resources/public/bundle-deps.js ]; then
  node \
    ./node_modules/browserify/bin/cmd.js \
    js/deps.js --ig --fast --outfile \
    resources/public/bundle-deps.js
fi
