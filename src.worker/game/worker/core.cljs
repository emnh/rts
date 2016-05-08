(ns ^:figwheel-always game.worker.core
  (:require
    [com.stuartsierra.component :as component]
    [game.client.math :as math]
    [game.worker.engine :as engine]
    [game.shared.state :as state
     :refer [s-add-component s-readd-component with-simple-cause]]
    )
  (:require-macros [game.shared.macros :as macros :refer [defcom]]))

(enable-console-print!)

(def state (atom nil))

(defn hello
  []
  (println "hello world"))

(defmulti
  -on-message
  (fn [data] (keyword (first data))))

(defmethod -on-message
  :initialize
  [data]
  )

(defmethod -on-message
  :default
  [data]
  (println "unhandled message" data))

(defn on-message
  [message]
  (let
    [data (-> message .-data)]
    (-on-message data)))

(defn process
  []
  (let
    [unit-count 100
     new-state
     (engine/init-state 
       { 
        :unit-count unit-count
        :buffer nil
        })
     buffer (if @state (:buffer @state) nil)
     get-position (get-in new-state [:functions :positions :get])
     set-position (get-in new-state [:functions :positions :set])
     ]
    (doseq
      [unit-index (range unit-count)]
      (let
        [x (* 100 (math/random))
         y (* 100 (math/random))
         z (* 100 (math/random))]
        (set-position unit-index (new js/THREE.Vector3 x y z))))
    (reset! state new-state)
    (if buffer
      (let
        [data
         #js
         {
          :unit-count unit-count
          :buffer buffer
          }]
        (-> js/self (.postMessage #js ["update" data] #js [buffer]))))))

(defonce system (atom {}))

(defn worker-main
  []
  (hello)
  (-> js/self (.addEventListener "message" on-message))
  (-> js/self (.postMessage #js ["loaded" nil]))
  (js/setInterval process 1000))

(if
  (this-as 
    self
    (undefined? (-> self .-document)))
  (worker-main))
