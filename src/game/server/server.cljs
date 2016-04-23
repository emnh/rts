(ns ^:figwheel-always game.server.server
  (:require-macros [hiccups.core :as hiccups :refer [html]])
  (:require
    [cljs.nodejs :as nodejs]
    [hiccups.runtime :as hiccupsrt]
    [com.stuartsierra.component :as component]
    ))

(defonce http (nodejs/require "http"))
(defonce io-lib (nodejs/require "socket.io"))

(defrecord InitServer
  [app config server io]
  component/Lifecycle
  (start [component]
    (if
      server
      component
      (let
        [server (.createServer http #((:app app) %1 %2))
         io (io-lib server)
         port (get-in config [:server :port])
         ]
        (-> server (.listen port))
        (-> component
          (assoc :server server)
          (assoc :io io)))))
  (stop [component] component))

(defn new-server
  []
  (component/using
    (map->InitServer {})
    [:app :config]))
