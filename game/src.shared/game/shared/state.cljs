(ns ^:figwheel-always game.shared.state
  (:require
    [com.stuartsierra.component :as component]
    )
  )

(defonce system (atom {}))

(defn add-component
  [k v]
  (if 
    (not (k @system))
    (swap! system #(assoc % k v))))

(defn readd-component
  [k v]
  (swap! system #(assoc % k v)))
