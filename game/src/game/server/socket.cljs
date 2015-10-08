(ns ^:figwheel-always game.server.socket
  (:require-macros [hiccups.core :as hiccups :refer [html]])
  (:require
    [cljs.nodejs :as nodejs]
    [hiccups.runtime :as hiccupsrt]
    [com.stuartsierra.component :as component]
    ;[game.server.map :as map_]
    ))

(defn io-connection
  [socket config map]
  (println "io-connection")
  (.emit socket "news" #js { :hello "world" })
  (.on socket "my other event"
       (fn [data]
         (println data)))
  (.on socket "get-map"
       (fn [data]
         (println ["get-map" data])
         (.emit socket "get-map" (clj->js (:map map) config)))))

(defrecord InitSocket
  [server config map]
  component/Lifecycle
  (start [component]
    (let
      [io (:io server)]
      (-> io (.on "connection" #(io-connection % config map)))))
  (stop [component] component)
  )

(defn new-socket
  []
  (component/using
    (map->InitSocket {})
    [:server :config :map]))
