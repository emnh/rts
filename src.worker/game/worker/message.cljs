(ns ^:figwheel-always game.worker.message
  (:require
    [com.stuartsierra.component :as component]
    [game.client.math :as math]
    [game.worker.engine :as engine]
    [game.worker.state :as state]
    )
  (:require-macros [game.shared.macros :as macros :refer [defcom]]))

(enable-console-print!)

(defmulti
  -on-message
  (fn [component data] (keyword (first data))))

(defmethod -on-message
  :poll-state
  [component [event data]]
  (reset! (:poll-state component) true))

(defmethod -on-message
  :initialize
  [component [event data]]
  (let
    [{:keys [state-buffer camera unit-count scene-properties map-dict]} data
     {:keys [matrix fov near far aspect]} camera
     {:keys [width height]} scene-properties
     camera (new js/THREE.PerspectiveCamera fov aspect near far)
     state
     (state/init-state
       {
        :unit-count unit-count
        :buffer state-buffer
        })
     ]
    (-> camera .-matrix (.fromArray matrix))
    (-> camera .-matrix
      (.decompose
        (-> camera .-position)
        (-> camera .-quaternion)
        (-> camera .-scale)))
    (reset! (:map-dict component) map-dict)
    (reset! (:state component) state)
    (reset! (:camera component) camera)
    (reset! (:unit-count component) unit-count)
    (reset! (:width component) width)
    (reset! (:height component) height)
    )
  )

(defmethod -on-message
  :start-engine
  [component [event data]]
  (engine/process component))

(defmethod -on-message
  :default
  [component data]
  (println "unhandled message"))

(defn on-message
  [component message]
  (let
    [data (-> message .-data)
     data (js->clj data :keywordize-keys true)]
;    (println "worker on-message" data)
    (-on-message component data)))

(defcom
  new-core
  []
  [state camera unit-count width height poll-state map-dict]
  (fn [component]
    (let
      [state (atom nil)
       camera (atom nil)
       unit-count (atom 0)
       component
       (-> component
         (assoc :map-dict (atom nil))
         (assoc :poll-state (atom false))
         (assoc :width (atom nil))
         (assoc :height (atom nil))
         (assoc :unit-count unit-count)
         (assoc :camera camera)
         (assoc :state state))
       ]
      (-> js/self (.addEventListener "message" (partial on-message component)))
      (-> js/self (.postMessage #js ["loaded" nil]))
      component))
  (fn [component]
    component))
