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
     buffer (if @state (:buffer @state) nil)
     new-state
     (state/init-state
       {
        :unit-count unit-count
        :buffer (-> buffer (.slice 0))
        })
     get-position (get-in new-state [:functions :positions :get])
     set-position (get-in new-state [:functions :positions :set])
     get-bbox (get-in new-state [:functions :bbox :get])
     ]
    (doseq
      [unit-index (range unit-count)]
      (let
        [position (get-position unit-index)
         bbox (get-bbox unit-index)
         ;_ (if (= unit-index 0) (.log js/console "bbox" bbox))
         spread 5.0
         x (+ (-> position .-x) (* spread (+ (math/random) -0.5)))
         z (+ (-> position .-z) (* spread (+ (math/random) -0.5)))
;         y (+ (-> position .-y) (* spread (+ (math/random) -0.5)))
;         _ (if (= unit-index 0)
;             (.log js/console "ghei"
;               (ground/get-height (:map-dict component) x z)))
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
