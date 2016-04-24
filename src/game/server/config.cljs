(ns ^:figwheel-always game.server.config
  (:require
    [cljs.nodejs :as nodejs]
    )
  )

(nodejs/enable-util-print!)

(defonce process (js/require "process"))
(defonce fs (js/require "fs"))

(def home
    (-> process .-env .-HOME))

(def jsconfig
  (let
    [config-data (-> js/global .-rtsconfig)]
    (-> config-data (js->clj :keywordize-keys true))))

(println "config2" jsconfig)

(defn production?
  []
  (:production jsconfig))

(def facebook-path 
  (if
    (production?)
    "/.rts/facebook.json"
    "/.rts/facebook-test.json"))

(def twitter-path
  (if
    (production?)
    "/.rts/twitter.json"
    "/.rts/twitter-test.json"))

(def google-path
  (if
    (production?)
    "/.rts/google.json"
    "/.rts/google-test.json"))

(def github-path
  (if
    (production?)
    "/.rts/github.json"
    "/.rts/github-test.json"))

(def facebook-data (-> fs (.readFileSync (str home facebook-path))))
(def twitter-data (-> fs (.readFileSync (str home twitter-path))))
(def google-data (-> fs (.readFileSync (str home google-path))))
(def github-data (-> fs (.readFileSync (str home github-path))))

(def urlpath
  (if
    (production?)
    "rts/"
    ""))

(def url
  (if
    (production?)
    (str "https://emh.lart.no/" urlpath)
    (str "http://localhost:3451/" urlpath)))

(def config
  { 
   :default-map
   {
    :min-elevation 10
    :max-elevation 48
    ;:x-faces 2
    ;:y-faces 2
    :x-faces 200
    :y-faces 200
    :width 4000
    :height 4000
    }
   :production (production?)
   :session
   {
    :secret (-> fs (.readFileSync (str home "/.rts/session-secret") "utf8"))
    }
   :facebook
   {
    :data facebook-data
    }
   :twitter
   {
    :data twitter-data
    }
   :google
   {
    :data google-data
    }
   :github
   {
    :data github-data
    }
   :paths
   {
    :home home
    :src (if (production?) "out.prod.client" "out.dev.client")
    }
   :server 
   {
    :port (if (production?) 3551 3451)
    :url url
    ;:socket-path (str "/" urlpath "socket.io/")
    :socket-ns (str "/" urlpath)
    :socket-path "/socket.io/"
    }
   :db 
   {
    :url (if 
           (production?)
           "mongodb://mongodb:27017/rts"
           "mongodb://localhost:27017/rts")
    }
   }
  )
