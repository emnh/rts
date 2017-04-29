(ns ^:figwheel-always game.server.security
  (:require
    [cljs.nodejs :as nodejs]
    [cljs.pprint :as pprint]))


(nodejs/enable-util-print!)

(defn ensureAuthenticated
  [req res next baseurl]
  (if
    (or
      (-> req .isAuthenticated)
      (= (-> req .-path) "/login")
      (= (-> req .-path) "/bundle-deps.js")
      (re-matches #"/auth/.*" (-> req .-path))
      (re-matches #"/css/.*" (-> req .-path))
      (re-matches #"/csscache/.*" (-> req .-path))
      (re-matches #"/js/.*" (-> req .-path))
      (re-matches #"/jscache/.*" (-> req .-path))
      (re-matches #"/fonts/.*" (-> req .-path))
      (re-matches #"/index.html.*" (-> req .-path))
      (re-matches #"/game.js.*" (-> req .-path))
      (re-matches #"/goog/.*" (-> req .-path))
      (re-matches #"/.*\.js" (-> req .-path))
      (re-matches #"/.*\.map" (-> req .-path))
      (re-matches #"/models/.*" (-> req .-path)))
    (do
      (set! (-> req .-session .-user) (-> req .-user))
      (next))
    (do
      ;(-> js/console (.log (-> req .-path)))
      (-> res (.redirect (str baseurl "login"))))))
