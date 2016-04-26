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
    [game.server.sente-setup :as sente-setup]
    [game.shared.state
     :as state
     :refer [add-component
             readd-component
             s-add-component
             s-readd-component
             system
             with-simple-cause]]
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

(s-readd-component system :config config/config)
(s-add-component system :app (app/new-app))
(s-add-component system :passport (passport/new-passport))
(s-add-component system :server (server/new-server))
(s-add-component system :noise (map/new-noise))
(s-add-component system :map (map/new-map))
(s-add-component system :socket (socket/new-socket))
(s-add-component system :db (db/new-db))
(s-add-component system :session (session/new-session))
(s-add-component system :games (games/new-games))
(s-add-component system :sente-setup (sente-setup/new-sente-setup))

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
