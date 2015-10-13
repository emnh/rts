(ns ^:figwheel-always game.server.passport
  (:require
    [cljs.nodejs :as nodejs]
    [cljs.pprint :as pprint]
    [hiccups.runtime :as hiccupsrt]
    [com.stuartsierra.component :as component]
    [promesa.core :as p]
    [cats.core :as m]
    [game.server.config :as config]
    [game.server.db :as db]
    )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  )

(defonce gpassport (nodejs/require "passport"))
(defonce FacebookStrategy (.-Strategy (nodejs/require "passport-facebook")))
(defonce TwitterStrategy (.-Strategy (nodejs/require "passport-twitter")))

(defn init-passport
  [config db]
  (-> gpassport 
    (.serializeUser 
      (fn [user done] 
        (let
          [id-pair 
           {
            :id (aget user "id")
            :provider (aget user "provider")
            }
           user-promise 
           (db/upsert
              db 
              "users"
              id-pair
              user)]
          (p/then user-promise #(done nil (clj->js id-pair)))
          (p/catch user-promise #(done % nil))
        ))))
  (-> gpassport
    (.deserializeUser 
      (fn [id-pair done] 
;        (done nil id-pair)))))
        (let
          [user-promise (db/find db "users" (js->clj id-pair :keywordize-keys true))]
          ;(println "deserialize user" id-pair)
          (p/then user-promise #(done nil (first %)))
          (p/catch user-promise #(done % nil))
                  )))))

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

(defn
  init-twitter
  [passport config]
  (let
    [twitter-data
     (get-in config [:twitter :data])
     { :keys [ :TWITTER_CONSUMER_KEY :TWITTER_CONSUMER_SECRET ] }
      (-> js/JSON (.parse twitter-data) (js->clj :keywordize-keys true))
     _ (println "TWC" TWITTER_CONSUMER_KEY)
     _ (println "TWS" TWITTER_CONSUMER_SECRET)
     twitter-fn
      (fn
        [token tokenSecret profile done]
        (done nil profile)
        )
     twitter-strategy
      (new 
        TwitterStrategy
        #js 
        {
         :consumerKey TWITTER_CONSUMER_KEY
         :consumerSecret TWITTER_CONSUMER_SECRET
         :callbackURL "http://localhost:3451/auth/twitter/callback"
         }
        twitter-fn)
     ]
    (-> passport (.use twitter-strategy))
    )
  )

(defcom
  new-passport
  [config db]
  [passport]
  (fn [component]
    (init-passport config db)
    (init-facebook gpassport config)
    (init-twitter gpassport config)
    (-> component
      (assoc :passport gpassport)))
  (fn [component] component))
