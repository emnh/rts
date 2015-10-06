(ns ^:figwheel-always game.server.core
  (:require-macros [hiccups.core :as hiccups :refer [html]])
  (:require
    [cljs.nodejs :as nodejs]
    [hiccups.runtime :as hiccupsrt]
    [game.server.db :as db]
    ))

(nodejs/enable-util-print!)

(defonce express (nodejs/require "express"))
(defonce session (nodejs/require "express-session"))
(defonce serve-static (nodejs/require "serve-static"))
(defonce http (nodejs/require "http"))
(defonce io-lib (nodejs/require "socket.io"))
(defonce passport (nodejs/require "passport"))
(defonce FacebookStrategy (.-Strategy (nodejs/require "passport-facebook")))
(defonce cookie-parser (nodejs/require "cookie-parser"))
(defonce fs (js/require "fs"))
(defonce process (js/require "process"))

(def home
    (-> process .-env .-HOME))

(def config
  (let
    [config-data (-> js/global .-rtsconfig)]
    (-> config-data (js->clj :keywordize-keys true))))

(println "config2" config)

(defn production?
  []
  (:production config))

(-> passport (.serializeUser (fn [user done] (done nil user))))
(-> passport (.deserializeUser (fn [obj done] (done nil obj))))

(let
  [facebook-path 
     (if 
       (production?)
       "/.rts/facebook"
       "/.rts/facebook-test.json")
   facebook-data
     (-> fs (.readFileSync (str home facebook-path)))
   { :keys [ :FACEBOOK_APP_ID :FACEBOOK_APP_SECRET ]}
     (-> js/JSON (.parse facebook-data) (js->clj :keywordize-keys true))
   facebook-function
    (fn
      [accessToken refreshToken profile done]
      (done nil profile))
   facebook-strategy
    (new FacebookStrategy #js {
      :clientID FACEBOOK_APP_ID,
      :clientSecret FACEBOOK_APP_SECRET,
      :callbackURL "http://localhost:3451/auth/facebook/callback",
      :enableProof false
    } facebook-function)
   ]
  (-> passport (.use facebook-strategy)))

(defn ensureAuthenticated
  [req res next]
  (if
    (-> req .isAuthenticated)
    (next)
    (-> res (.redirect "/login"))))

;; app gets redefined on reload
(def app (express))

(def session-secret (-> fs (.readFileSync (str home "/.rts/session-secret") "utf8")))
(-> app (.use (cookie-parser session-secret)))
(-> app (.use (session #js 
                       { 
                        :secret session-secret 
                        :resave false
                        :saveUninitialized false
                        })))
(-> app (.use (-> passport .initialize)))
(-> app (.use (-> passport .session)))

;; routes get redefined on each reload
(. app (get "/hello" 
  (fn [req res] (. res (send "Hello world")))))

(. app (get "/account" ensureAuthenticated
  (fn [req res] (. res (send (clj->js req.user))))))

(. app (use (serve-static "resources/public" #js {:index "index.html"})))

(if
  (production?)
  (. app (use (serve-static "out.prod.client")))
  (. app (use (serve-static "out.dev.client"))))

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

; pure data state
(defonce state
  (atom 
    {:games []
     :players []
    }))

; modifiable state like DB connection etc
(defonce mstate
  (atom
    {
     :db {}
     }))

(defn new-player
  [state]
  state
  )

(defn io-connection
  [socket]
  (println "io-connection")
  (swap! app-state new-player)
  (.emit socket "news" #js { :hello "world" })
  (.on socket "my other event" 
    (fn [data]
      (println data))))

(def -main 
  (fn []
    ;; This is the secret sauce. you want to capture a reference to 
    ;; the app function (don't use it directly) this allows it to be redefined on each reload
    ;; this allows you to change routes and have them hot loaded as you
    ;; code.
    (println "Hello world!")
    (let 
      [server (.createServer http #(app %1 %2))
       io (io-lib server)
       ]
      (-> server (.listen 3451))
      (-> io (.on "connection" #(io-connection %)))
      )))

(defn reload
  []
  (println "reload"))

(set! *main-cli-fn* -main)
