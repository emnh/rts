(ns ^:figwheel-always game.server.passport
  (:require-macros [hiccups.core :as hiccups :refer [html]])
  (:require
    [cljs.nodejs :as nodejs]
    [hiccups.runtime :as hiccupsrt]
    [com.stuartsierra.component :as component]
    [game.server.config :as config]
    ))

(defonce gpassport (nodejs/require "passport"))
(defonce FacebookStrategy (.-Strategy (nodejs/require "passport-facebook")))

(defn init-passport
  [passport config]
  (-> passport (.serializeUser (fn [user done] (done nil user))))
  (-> passport (.deserializeUser (fn [obj done] (done nil obj))))
  )

(defn
  init-facebook
  [passport config]
  (let
    [
     facebook-data
      (get-in config [:facebook :data])
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
    (-> passport (.use facebook-strategy))))

(defrecord InitPassport
  [passport config]
  component/Lifecycle
  (start [component]
    (init-passport gpassport config)
    (init-facebook gpassport config)
    (-> component
      (assoc :passport gpassport)))
  (stop [component]
    component
    )
  )

(defn new-passport
  []
  (component/using
    (map->InitPassport {})
    [:config]))
