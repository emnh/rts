(ns ^:figwheel-always game.worker.engine
  (:require
    [com.stuartsierra.component :as component]
    [game.client.math :as math]
    [game.worker.state :as state]
    )
  (:require-macros [game.shared.macros :as macros :refer [defcom]]))

(defn process
  [component]
  (let
    [unit-count 100
     new-state
     (state/init-state
       {
        :unit-count unit-count
        :buffer nil
        })
     state (:state component)
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
        (-> js/self (.postMessage #js ["update" data] #js [buffer])))))
  (js/setTimeout #(process component) 10))
