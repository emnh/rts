(ns ^:figwheel-always game.server.game
  (:require
    [cljs.nodejs :as nodejs]
    [hiccups.runtime :as hiccupsrt]
    [com.stuartsierra.component :as component]
    ))

(defonce three (nodejs/require "three.js-node"))

(defrecord
  InitGame
  [config]
  component/Lifecycle
  (start [component] component)
  (stop [component] component)
  )

(defn
  new-game
  []
  (component/using
    (map->InitMap {})
    [:config]
    )
  )
