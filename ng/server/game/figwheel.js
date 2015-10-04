try {
    require("source-map-support").install();
} catch(err) {
}
require("./out.dev/goog/bootstrap/nodejs.js");
require("./out.dev/game.js");
goog.require("game.dev");
goog.require("cljs.nodejscli");
