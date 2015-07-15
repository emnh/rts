#!/bin/bash
node node_modules/jade/bin/jade.js -P index.jade
node ./node_modules/browserify/bin/cmd.js index.js -t babelify --outfile bundle.js
