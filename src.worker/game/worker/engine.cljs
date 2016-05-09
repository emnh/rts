(ns ^:figwheel-always game.worker.engine
  (:require
    [com.stuartsierra.component :as component]
    [game.client.ground-local :as ground]
    [game.client.math :as math]
    [game.worker.state :as state]
    )
  (:require-macros [game.shared.macros :as macros :refer [defcom]]))

(defn process
  [component]
  (let
    [start-time (-> (new js/Date) .getTime)
     unit-count @(:unit-count component)
     state (:state component)
     buffer (:buffer @state)
     new-state
     (state/init-state
       {
        :unit-count unit-count
        :buffer (-> buffer (.slice 0))
        })
     get-position (get-in new-state [:functions :positions :get])
     set-position (get-in new-state [:functions :positions :set])
     get-bbox (get-in new-state [:functions :bbox :get])
     get-move-target (get-in new-state [:functions :move-targets :get])
     ]
    (doseq
      [unit-index (range unit-count)]
      (let
        [position (get-position unit-index)
         bbox (get-bbox unit-index)
         spread 0.0
         move-target (get-move-target unit-index)
         x (+ (-> position .-x) (* spread (+ (math/random) -0.5)))
         z (+ (-> position .-z) (* spread (+ (math/random) -0.5)))
         y (ground/align-to-ground @(:map-dict component) bbox x z)
         ]
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
          (-> js/self (.postMessage #js ["update" nil] #js [buffer])))))
    (let
      [end-time (-> (new js/Date) .getTime)
       elapsed (- end-time start-time)
       timeout (max 0 (- 10 elapsed))
       ]
      (js/setTimeout #(process component) timeout))))
