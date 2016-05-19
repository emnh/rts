try {
    require("source-map-support").install();
} catch(err) {
}
global.rtsconfig = {
  production: false,
}
global.THREE = require("three");
require("../out.scripts/goog/bootstrap/nodejs.js");
require("../out.scripts/game.js");
goog.require("game.scripts.voxelize");
goog.require("cljs.nodejscli");
