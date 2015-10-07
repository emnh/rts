(ns ^:figwheel-always game.client.common
    (:require 
              [cljs.pprint :as pprint]
              [jayq.core :as jayq :refer [$]]
              [game.client.config :as config]
              [com.stuartsierra.component :as component]
              ))

(defn get-idempotent
  [mstate path f]
  (let
    [newVal
     (if-let
      [oldVal (get-in mstate path)]
      oldVal
      (f))
     mstate (assoc-in mstate path newVal)
     ]
    [newVal mstate]))

(defrecord JSObj [initializer data]
  component/Lifecycle
  (start [component] 
    (if 
      (= data nil)
      (do
        (println "Allocating JSObj")
        (assoc component :data (initializer)))
      component))
  (stop [component] (assoc component :data nil)))

(defn new-jsobj [initializer]
  (map->JSObj {:initializer initializer}))

(defn data [component]
  (:data component))
