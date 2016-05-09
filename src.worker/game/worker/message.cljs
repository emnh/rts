(ns ^:figwheel-always game.worker.message
  (:require
    [com.stuartsierra.component :as component]
    [game.client.math :as math]
    [game.worker.engine :as engine]
    [game.worker.state :as state]
    )
  (:require-macros [game.shared.macros :as macros :refer [defcom]]))

(defmulti
  -on-message
  (fn [component data] (keyword (first data))))

(defmethod -on-message
  :initialize
  [component data]
  )

(defmethod -on-message
  :default
  [component data]
  (println "unhandled message" data))

(defn on-message
  [component message]
  (let
    [data (-> message .-data)]
    (-on-message data)))

(defcom
  new-core
  []
  [state]
  (fn [component]
    (let
      [state (atom nil)
       component
       (-> component
         (assoc :state state))
       ]
      (-> js/self (.addEventListener "message" (partial component on-message)))
      (-> js/self (.postMessage #js ["loaded" nil]))
      (engine/process component)
      component))
  (fn [component]
    component))
