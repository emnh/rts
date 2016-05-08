console.log("from worker");

CLOSURE_BASE_PATH = "../goog/"
/**
 * Imports a script using the Web Worker importScript API.
 *
 * @param {string} src The script source.
 * @return {boolean} True if the script was imported, false otherwise.
 */
this.CLOSURE_IMPORT_SCRIPT = (function(global) {
  return function(src) {
    global['importScripts'](src);
    return true;
  };
})(this);

BASE_PATH = "../";
importScripts(CLOSURE_BASE_PATH + "base.js");
importScripts("../game.js");
importScripts(
    BASE_PATH + "jscache/simplex-noise.js",
    BASE_PATH + "jscache/three.js",
    BASE_PATH + "bundle-deps-worker.js");
goog.require('game.worker.core');
