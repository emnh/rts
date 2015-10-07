(ns ^:figwheel-always game.server.socket
  (:require-macros [hiccups.core :as hiccups :refer [html]])
  (:require
    [cljs.nodejs :as nodejs]
    [hiccups.runtime :as hiccupsrt]
    [com.stuartsierra.component :as component]
    ))

(defn io-connection
  [socket]
  (println "io-connection")
  (.emit socket "news" #js { :hello "world" })
  (.on socket "my other event"
       (fn [data]
         (println data)))
  (.on socket "get-map"
       (fn [data]
         (println ["get-map" data])
         (.emit socket "get-map" (clj->js { :mapdata 2 } )))))

(defrecord InitSocket
  [server]
  component/Lifecycle
  (start [component]
    (let
      [io (:io server)]
      (-> io (.on "connection" #(io-connection %)))))
  (stop [component] component)
  )

(defn new-socket
  []
  (component/using
    (map->InitSocket {})
    [:server]))
