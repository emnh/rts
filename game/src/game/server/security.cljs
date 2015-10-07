(ns ^:figwheel-always game.server.security)

(defn ensureAuthenticated
  [req res next]
  (if
    (-> req .isAuthenticated)
    (next)
    (-> res (.redirect "/login"))))
