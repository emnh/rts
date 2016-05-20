(ns ^:figwheel-always game.client.progress-manager
    (:require
              [cljs.pprint :as pprint]
              [com.stuartsierra.component :as component]
              [promesa.core :as p]
              [game.client.config :as config]
              )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  )

(defn update-progress-item
  [component resource completed size]
  (swap!
    (:progress-map component)
    #(-> %
       (assoc-in [resource :completed] completed)
       (assoc-in [resource :total] size))))
;  (println "progress-map" @(:progress-map component)))

(defn get-progress-map
  [component]
  (:progress-map component))

(defcom
  new-progress-manager
  []
  [progress-map]
  (fn [component]
    (let
      [progress-map (or progress-map (atom {}))]
      (-> component
        (assoc :progress-map progress-map))))
  (fn [component] component))
