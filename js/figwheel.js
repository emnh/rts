try {
    require("source-map-support").install();
} catch(err) {
}
global.rtsconfig = {
  production: false,
};
require("../out.dev/goog/bootstrap/nodejs.js");
require("../out.dev/game.js");
goog.require("game.server.dev");
goog.require("cljs.nodejscli");
