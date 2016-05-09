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
    [unit-count @(:unit-count component)
     new-state
     (state/init-state
       {
        :unit-count unit-count
        :buffer nil
        })
     state (:state component)
     buffer (if @state (:buffer @state) nil)
     get-old-position (get-in @state [:functions :positions :get])
     set-position (get-in new-state [:functions :positions :set])
     ]
    (doseq
      [unit-index (range unit-count)]
      (let
        [position (get-old-position unit-index)
         x (+ (-> position .-x) (math/random) -0.5)
         y (+ (-> position .-y) (math/random) -0.5)
         z (+ (-> position .-z) (math/random) -0.5)]
        (set-position unit-index (new js/THREE.Vector3 x y z))))
    (reset! state new-state)
    (if buffer
      (if @(:poll-state component)
        (let
          [data
           #js
           {
            :unit-count unit-count
            :buffer buffer
            }]
          (reset! (:poll-state component) false)
          (-> js/self (.postMessage #js ["update" data] #js [buffer])))
        (do
          (-> js/self (.postMessage #js ["update" nil] #js [buffer]))))))
  (js/setTimeout #(process component) 0))
