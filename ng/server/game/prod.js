try {
    require("source-map-support").install();
} catch(err) {
}
require("./out.prod/goog/bootstrap/nodejs.js");
require("./out.prod/game.js");
goog.require("game.server.core");
goog.require("cljs.nodejscli");
