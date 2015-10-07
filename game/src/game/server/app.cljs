(ns ^:figwheel-always game.server.app
  (:require-macros [hiccups.core :as hiccups :refer [html]])
  (:require
    [cljs.nodejs :as nodejs]
    [hiccups.runtime :as hiccupsrt]
    [com.stuartsierra.component :as component]
    [game.server.config :as config]
    [game.server.security :as security]
    ))

(defonce express (nodejs/require "express"))
(defonce session (nodejs/require "express-session"))
(defonce cookie-parser (nodejs/require "cookie-parser"))
(defonce serve-static (nodejs/require "serve-static"))

(defn init-session
  [app config passport]
  (let
    [session-secret (get-in config [:session :secret])]
    (-> app (.use (cookie-parser session-secret)))
    (-> app (.use (session #js 
                           { 
                            :secret session-secret 
                            :resave false
                            :saveUninitialized false
                            }))))
  (-> app (.use (-> passport .initialize)))
  (-> app (.use (-> passport .session)))
  )

(defn init-static
  [app config]
  (. app (use (serve-static "resources/public" #js {:index "index.html"})))
  (. app (use (serve-static "..")))
  (. app (use (serve-static (get-in config [:paths :src]))))
  )

(defn init-routes
  [app config]

  (. app (get "/hello" 
    (fn [req res] (. res (send "Hello world")))))

  (. app (get "/account" security/ensureAuthenticated
    (fn [req res] (. res (send (clj->js req.user))))))
  )

(defn init-auth-routes
  [app config passport]

  (. app 
     (get
       "/login"
       (fn [req res]
         (. res
            (send 
              (html [:a 
                {:href "/auth/facebook"}
                [:img {:src "http://i.stack.imgur.com/pZzc4.png"}]]))))))

  (. app 
    (get
      "/auth/facebook"
      (-> passport (.authenticate "facebook"))
      (fn [req res]
    ;    // The request will be redirected to Facebook for authentication, so this
    ;    // function will not be called.
        nil)))

  (. app
     (get
       "/auth/facebook/callback" 
       (-> passport (.authenticate "facebook" #js { :failureRedirect "/login" }))
       (fn [req res]
         (-> res (.redirect "/account")))))

  (. app
     (get
       "/logout"
       (fn [req res]
         (-> req .logout)
         (-> res (.redirect "/")))))


  )

(defn init-app
  [app config passport]

  (init-session app config passport)
  (init-static app config)
  (init-routes app config)
  (init-auth-routes app config passport)
  )
  
(defrecord App
  [app config passport]
  component/Lifecycle
  (start [component] 
    (let
      [app (express)]
      (init-app app config (:passport passport))
      (assoc component :app app)))
  (stop [component] 
    component)
  )

(defn new-app
  []
  (component/using
    (map->App {})
    [:config :passport]))
