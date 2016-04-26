try {
  require("source-map-support").install();
} catch(err) {
  println("couldn't install source-map-support");
}
global.rtsconfig = {
  production: false,
};
require("../out.dev/goog/bootstrap/nodejs.js");
require("../out.dev/game.js");
goog.require("game.server.dev");
goog.require("cljs.nodejscli");
