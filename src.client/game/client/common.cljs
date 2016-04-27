(ns ^:figwheel-always game.client.common
    (:require
              [cljs.pprint :as pprint]
              [jayq.core :as jayq :refer [$]]
              [rum.core :as rum]
              [com.stuartsierra.component :as component]
              [game.client.config :as config]
              )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  )

(defrecord JSObj [initializer data]
  component/Lifecycle
  (start [component]
    (if
      (= data nil)
      (do
        ;(println "Allocating JSObj")
        (assoc component :data (initializer)))
      component))
  ;(stop [component] (assoc component :data nil)))
  (stop [component] component))

(defn new-jsobj [initializer]
  (map->JSObj {:initializer initializer}))

(defrecord LCObj [data]
  component/Lifecycle
  (start [component] component)
  (stop [component] component))

(defn new-lc [data]
  (map->LCObj {:data data}))

(defn data [component]
  (:data component))

(rum/defc
  list-item
  [content & [attrs] ]
  (if
    attrs
    [:li attrs content]
    [:li content]))

(rum/defc
  header < rum/static
  [h]
  [:div [:h1 { :class "page-header" } h]])
