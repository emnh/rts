try {
    require("source-map-support").install();
} catch(err) {
}
global.rtsconfig = {
  production: true,
}
require("./out.prod/goog/bootstrap/nodejs.js");
require("./out.prod/game.js");
goog.require("game.server.core");
goog.require("cljs.nodejscli");
