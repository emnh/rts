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
    "/.rts/facebook"
    "/.rts/facebook-test.json"))

(def facebook-data (-> fs (.readFileSync (str home facebook-path))))

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
   :paths
   {
    :home home
    :src (if (production?) "out.prod.client" "out.dev.client")
    }
   :server 
   {
    :port 3451
    }
   :db 
   {
    :url "mongodb://localhost:27017/rts"
    }
   }
  )
