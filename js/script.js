try {
    require("source-map-support").install();
} catch(err) {
}
global.rtsconfig = {
  production: false,
}
global.THREE = require("three");
var process = require("process");
var script = process.argv[2];
console.log("running:", script);
require("../out.scripts/goog/bootstrap/nodejs.js");
require("../out.scripts/game.js");
goog.require("game.scripts." + script);
goog.require("cljs.nodejscli");
