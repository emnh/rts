(ns ^:figwheel-always game.server.security)

(defn ensureAuthenticated
  [req res next]
  (if
    (or 
      (-> req .isAuthenticated)
      (= (-> req .-path) "/login")
      (= (-> req .-path) "/bundle-deps.js")
      )
    (next)
    (-> res (.redirect "/login"))))
