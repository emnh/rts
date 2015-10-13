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
(defonce GoogleStrategy (.-OAuth2Strategy (nodejs/require "passport-google-oauth")))
(defonce GitHubStrategy (.-Strategy (nodejs/require "passport-github")))

(defn init-passport
  [config db]
  (-> gpassport 
    (.serializeUser 
;      #(%2 nil %1)))
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
;      #(%2 nil %1))))
      (fn [id-pair done] 
        (let
          [user-promise (db/find db "users" (js->clj id-pair :keywordize-keys true))]
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
     baseurl (get-in config [:server :url])
     facebook-function
      (fn
        [accessToken refreshToken profile done]
        (done nil profile))
     facebook-strategy
      (new FacebookStrategy #js {
        :clientID FACEBOOK_APP_ID,
        :clientSecret FACEBOOK_APP_SECRET,
        :callbackURL (str baseurl "auth/facebook/callback"),
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
     baseurl (get-in config [:server :url])
     { :keys [ :TWITTER_CONSUMER_KEY :TWITTER_CONSUMER_SECRET ] }
      (-> js/JSON (.parse twitter-data) (js->clj :keywordize-keys true))
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
         :callbackURL (str baseurl "auth/twitter/callback")
         }
        twitter-fn)
     ]
    (-> passport (.use twitter-strategy))
    )
  )

(defn
  init-google
  [passport config]
  (let
    [google-data
      (get-in config [:google :data])
     { :keys [ :GOOGLE_CONSUMER_KEY :GOOGLE_CONSUMER_SECRET ] }
      (-> js/JSON (.parse google-data) (js->clj :keywordize-keys true))
     google-fn
      (fn
        [accessToken refreshToken profile done]
        (done nil profile))
     baseurl (get-in config [:server :url])
     google-strategy
      (new
        GoogleStrategy
        #js
        {
         :clientID GOOGLE_CONSUMER_KEY
         :clientSecret GOOGLE_CONSUMER_SECRET
         :callbackURL (str baseurl "auth/google/callback")
         }
        google-fn)]
    (-> passport (.use google-strategy)))
  )

(defn
  init-github
  [passport config]
  (let
    [github-data
      (get-in config [:github :data])
     { :keys [ :GITHUB_CONSUMER_KEY :GITHUB_CONSUMER_SECRET ] }
      (-> js/JSON (.parse github-data) (js->clj :keywordize-keys true))
     github-fn
      (fn
        [accessToken refreshToken profile done]
        (done nil profile))
     baseurl (get-in config [:server :url])
     github-strategy
      (new
        GitHubStrategy
        #js
        {
         :clientID GITHUB_CONSUMER_KEY
         :clientSecret GITHUB_CONSUMER_SECRET
         :callbackURL (str baseurl "auth/github/callback")
         }
        github-fn)]
    (-> passport (.use github-strategy)))
  )


(defcom
  new-passport
  [config db]
  [passport]
  (fn [component]
    (init-passport config db)
    (init-facebook gpassport config)
    (init-twitter gpassport config)
    (init-google gpassport config)
    (init-github gpassport config)
    (-> component
      (assoc :passport gpassport)))
  (fn [component] component))
