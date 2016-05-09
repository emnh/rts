(ns ^:figwheel-always game.worker.state)

(def float32-size 4)
(def int32-size 4)
(def xyz-size 3)

(defn
  -get-position
  [int32-buffer float32-buffer float32-offset index]
  (let
    [x-offset (+ float32-offset (* index xyz-size))
     y-offset (inc x-offset)
     z-offset (inc y-offset)]
    (new
      js/THREE.Vector3
      (aget float32-buffer x-offset)
      (aget float32-buffer y-offset)
      (aget float32-buffer z-offset))))

(defn
  -set-position
  [int32-buffer float32-buffer float32-offset index vector3]
  (let
    [x-offset (+ float32-offset (* index xyz-size))
     y-offset (inc x-offset)
     z-offset (inc y-offset)]
    (aset float32-buffer x-offset (-> vector3 .-x))
    (aset float32-buffer y-offset (-> vector3 .-y))
    (aset float32-buffer z-offset (-> vector3 .-z))))

(defn
  init-state
  [{:keys [unit-count buffer]}]
  (let
    [
     state-format
     [
      {
       :name :positions
       :length (* unit-count xyz-size float32-size)
       :get -get-position
       :set -set-position
       }
      {
       :name :move-targets
       :length (* unit-count xyz-size float32-size)
       :get -get-position 
       :set -set-position
       }
      ]
     reduce-length (fn [offset {:keys [length]}] (+ offset length))
     length (reduce reduce-length 0 state-format)
     buffer (or buffer (new js/ArrayBuffer length))
     int32-buffer (new js/Int32Array buffer)
     float32-buffer (new js/Float32Array buffer)
     reduce-fn
     (fn
       [[dict offset] {:keys [name length get set]}]
       [
        (assoc dict name {
                          :get (partial get int32-buffer float32-buffer (/ offset float32-size))
                          :set (partial set int32-buffer float32-buffer (/ offset float32-size))
                          })
        (+ offset length)
        ])
     [functions offset] (reduce reduce-fn [{} 0] state-format)
     ]
    {
     :buffer buffer
     :functions functions
     }))
