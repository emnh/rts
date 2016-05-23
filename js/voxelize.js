try {
    require("source-map-support").install();
} catch(err) {
}
global.rtsconfig = {
  production: false,
}
global.THREE = require("three");
global.kdtree = require("static-kdtree");
require("../out.scripts/goog/bootstrap/nodejs.js");
require("../out.scripts/game.js");
goog.require("game.scripts.voxelize");
goog.require("cljs.nodejscli");
