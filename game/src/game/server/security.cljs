(ns ^:figwheel-always game.server.security
  (:require
    [cljs.nodejs :as nodejs]
    [cljs.pprint :as pprint])
  )

(nodejs/enable-util-print!)

(defn ensureAuthenticated
  [req res next baseurl]
  (if
    (or 
      (-> req .isAuthenticated)
      (= (-> req .-path) "/login")
      (= (-> req .-path) "/bundle-deps.js")
      (re-matches #"/auth/.*" (-> req .-path)))
    (do
      (set! (-> req .-session .-user) (-> req .-user))
      (next))
    (-> res (.redirect (str baseurl "login")))))
