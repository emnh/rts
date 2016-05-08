#!/bin/bash
./scripts/getModelSizes.py > json/modelSizes.json
# node node_modules/jade/bin/jade.js -P index.jade
if [ js/deps.js -nt resources/public/bundle-deps.js ]; then
  node \
    ./node_modules/browserify/bin/cmd.js \
    js/deps.js --ig --fast --outfile \
    resources/public/bundle-deps.js
fi
if [ js/deps-worker.js -nt resources/public/bundle-deps-worker.js ]; then
  node \
    ./node_modules/browserify/bin/cmd.js \
    js/deps-worker.js --ig --fast --outfile \
    resources/public/bundle-deps-worker.js
fi
