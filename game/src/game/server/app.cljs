(ns ^:figwheel-always game.server.app
  (:require-macros [hiccups.core :as hiccups :refer [html]])
  (:require
    [cljs.nodejs :as nodejs]
    [hiccups.runtime :as hiccupsrt]
    [com.stuartsierra.component :as component]
    [game.server.config :as config]
    [game.server.security :as security]
    [game.server.views :as views]
    ))

(defonce express (nodejs/require "express"))
(defonce cookie-parser (nodejs/require "cookie-parser"))
(defonce serve-static (nodejs/require "serve-static"))
(defonce morgan (nodejs/require "morgan"))

(defn init-logging
  [app config]
  (-> app (.use (morgan "combined"))))

(defn init-session
  [app config passport session]
  (let
    [session-secret (get-in config [:session :secret])]
    (-> app (.use (cookie-parser session-secret)))
    (-> app (.use session )))
  (-> app (.use (-> passport .initialize)))
  (-> app (.use (-> passport .session)))
  )

(defn init-static
  [app config]
  (let
    [baseurl (get-in config [:server :url])]
    (. app (use "/" (fn [req res next] (security/ensureAuthenticated req res next baseurl)))))
  (. app (use (serve-static "resources/public" #js {:index "index.html"})))
  (. app (use (serve-static "..")))
  (. app (use (serve-static (get-in config [:paths :src]))))
  )

(defn init-routes
  [app config]

  (. app (get "/hello" 
    (fn [req res] (. res (send "Hello world")))))

  (. app (get "/account"
    (fn [req res] (. res (send (clj->js req.user))))))
  )

(defn init-auth-routes
  [app config passport baseurl]

  (. app (get "/login" #(views/login-page baseurl %1 %2)))

  (. app (get "/auth/github"
              (-> passport
                (.authenticate
                  "github"))))

  (. app (get "/auth/github/callback"
              (-> passport
                (.authenticate
                  "github"
                  #js { 
                       :failureRedirect (str baseurl "login") 
                       :successRedirect baseurl
                       }))
              (fn [req res]
                (println "github callback request")
                (-> res (.redirect "/")))))

  (. app (get "/auth/google" 
              (-> passport
                (.authenticate
                  "google"
                  #js
                  {
                   :scope "openid profile email https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/plus.me"
                   }))
              (fn [req res]
                ; The request will be redirected to Google for authentication, so this
                ; function will not be called.
                nil)))

  (. app (get "/auth/google/callback"
              (-> passport
                (.authenticate
                  "google"
                  #js 
                  {
                   :failureRedirect (str baseurl "login")
                   :successRedirect baseurl
                   }))
              (fn [req res]
                (-> res (.redirect "/")))))

  (. app (get "/auth/twitter" (-> passport (.authenticate "twitter"))))

  (. app (get "/auth/twitter/callback" 
              (-> passport 
                (.authenticate "twitter"
                  #js {
                   :failureRedirect (str baseurl "login")
                   :successRedirect baseurl
                   }))))
       
  (. app 
    (get
      "/auth/facebook"
      (-> passport (.authenticate "facebook"))
      (fn [req res]
        ; The request will be redirected to Facebook for authentication, so this
        ; function will not be called.
        nil)))

  (. app
     (get
       "/auth/facebook/callback" 
       (-> passport (.authenticate 
                      "facebook"
                      #js { 
                           :failureRedirect (str baseurl "login")
                           :successRedirect baseurl
                           }))
       (fn [req res]
         (-> res (.redirect "/")))))

  (. app
     (get
       "/logout"
       (fn [req res]
         (-> req .logout)
         (-> res (.redirect "/")))))


  )

(defn init-app
  [app config passport session]

  (-> app .-locals .-pretty (set! true))
  ;(init-logging app config)
  (init-session app config passport session)
  (init-static app config)
  (init-routes app config)
  (let
    [baseurl (get-in config [:server :url])]
    (init-auth-routes app config passport baseurl))
  )
  
(defrecord App
  [app config passport session]
  component/Lifecycle
  (start [component] 
    (let
      [app (or app (express))]
      (init-app app config (:passport passport) (:session session))
      (assoc component :app app)))
  (stop [component] 
    component)
  )

(defn new-app
  []
  (component/using
    (map->App {})
    [:config :passport :session]))
