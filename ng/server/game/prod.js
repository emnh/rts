try {
    require("source-map-support").install();
} catch(err) {
}
require("./out.prod/goog/bootstrap/nodejs.js");
require("./out.prod/game.js");
goog.require("game.core");
goog.require("cljs.nodejscli");
