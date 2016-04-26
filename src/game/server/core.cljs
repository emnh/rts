(ns ^:figwheel-always game.server.core
  (:require-macros [hiccups.core :as hiccups :refer [html]])
  (:require
    [cljs.nodejs :as nodejs]
    [cljs.pprint :as pprint]
    [hiccups.runtime :as hiccupsrt]
    [com.stuartsierra.component :as component]
    [game.server.app :as app]
    [game.server.config :as config]
    [game.server.db :as db]
    [game.server.games :as games]
    [game.server.map :as map]
    [game.server.passport :as passport]
    [game.server.server :as server]
    [game.server.session :as session]
    [game.server.socket :as socket]
    [game.shared.state
     :as state
     :refer [add-component readd-component system with-simple-cause]]
    ))

;(defonce origlog (-> js/console .-log))

;(defonce logger (.colorConsole 
;                  (nodejs/require "tracer")
;                  #js
;                  {
;                   :transport #(origlog (.-output %))
;                   }
;                  ))

;(set! js/console.log (-> logger .-log))

(nodejs/enable-util-print!)
(println "")

(readd-component
  :config
  config/config)

(add-component
  :app
  (app/new-app))

(add-component
  :passport
  (passport/new-passport))

(add-component
  :server 
  (server/new-server))

(add-component
  :noise
  (map/new-noise))

(readd-component
  :map
  (map/new-map))

(add-component
  :socket
  (socket/new-socket))

(add-component
  :db
  (db/new-db))

(add-component
  :session
  (session/new-session))

(readd-component
  :games
  (games/new-games))

(defn debug
  []
  (let 
    [app (app/new-app)
     passport (passport/new-passport)
     passport
      (->
        passport
        (assoc :config config/config)
        component/start)
     ]
    (->
      app
      (assoc :config config/config)
      (assoc :passport passport)
      component/start)))

(defn -main 
  []
  (println "Main")
  (with-simple-cause #(swap! system component/stop-system))
  (with-simple-cause #(swap! system component/start-system)))

(-main)
(set! *main-cli-fn* -main)
