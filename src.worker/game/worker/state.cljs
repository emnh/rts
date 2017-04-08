(ns ^:figwheel-always game.worker.state)

(def float32-size 4)
(def int32-size 4)
(def xyz-size 3)

(defrecord
  Ground
  [height-field
   width
   height
   x-faces
   y-faces])

(defrecord
  State
  [buffer
   int32-buffer
   float32-buffer
   positions-offset
   bboxes-offset
   move-targets-offset])


(defn -get-vector3
  [float32-buffer float32-offset index]
  (let
    [x-offset (+ float32-offset (* index xyz-size))
     y-offset (inc x-offset)
     z-offset (inc y-offset)]
    (new
      js/THREE.Vector3
      (aget float32-buffer x-offset)
      (aget float32-buffer y-offset)
      (aget float32-buffer z-offset))))

(defn -set-vector3
  [float32-buffer float32-offset index vector3]
  (let
    [x-offset (+ float32-offset (* index xyz-size))
     y-offset (inc x-offset)
     z-offset (inc y-offset)]
    (aset float32-buffer x-offset (-> vector3 .-x))
    (aset float32-buffer y-offset (-> vector3 .-y))
    (aset float32-buffer z-offset (-> vector3 .-z))))

(defn -set-bbox
  [float32-buffer float32-offset index bbox]
  (-set-vector3 float32-buffer float32-offset (* index 2) (-> bbox .-min))
  (-set-vector3 float32-buffer float32-offset (inc (* index 2)) (-> bbox .-max)))

(defn -get-bbox
  [float32-buffer float32-offset index]
  (new
    js/THREE.Box3
    (-get-vector3 float32-buffer float32-offset (* index 2))
    (-get-vector3 float32-buffer float32-offset (inc (* index 2)))))

(defn get-state-format
  [unit-count]
  [
   {
    :name :positions
    :length (* unit-count xyz-size float32-size)}

   {
    :name :bboxes
    :length (* unit-count 2 xyz-size float32-size)}

   {
    :name :move-targets
    :length (* unit-count xyz-size float32-size)}])



(defn get-position
  [state index]
  (let
    [float32-buffer (-> state .-float32-buffer)
     positions-offset (-> state .-positions-offset)]
    (-get-vector3 float32-buffer positions-offset index)))

(defn set-position
  [state index vector3]
  (let
    [float32-buffer (-> state .-float32-buffer)
     positions-offset (-> state .-positions-offset)]
    (-set-vector3 float32-buffer positions-offset index vector3)))

(defn get-bbox
  [state index]
  (let
    [float32-buffer (-> state .-float32-buffer)
     bbox-offset (-> state .-bboxes-offset)]
    (-get-bbox float32-buffer bbox-offset index)))

(defn set-bbox
  [state index bbox]
  (let
    [float32-buffer (-> state .-float32-buffer)
     bbox-offset (-> state .-bboxes-offset)]
    (-set-bbox float32-buffer bbox-offset index bbox)))

(defn get-move-target
  [state index]
  (let
    [float32-buffer (-> state .-float32-buffer)
     move-targets-offset (-> state .-move-targets-offset)]
    (-get-vector3 float32-buffer move-targets-offset index)))

(defn set-move-target
  [state index vector3]
  (let
    [float32-buffer (-> state .-float32-buffer)
     move-targets-offset (-> state .-move-targets-offset)]
    (-set-vector3 float32-buffer move-targets-offset index vector3)))

(defn
  init-state
  [{:keys [unit-count buffer]}]
  (let
    [
     state-format (get-state-format unit-count)
     reduce-length (fn [offset {:keys [length]}] (+ offset length))
     length (reduce reduce-length 0 state-format)
     buffer (or buffer (new js/ArrayBuffer length))
     int32-buffer (new js/Int32Array buffer)
     float32-buffer (new js/Float32Array buffer)
     ; the following shadows name
     name-fn name
     reduce-fn
     (fn
       [[dict offset] {:keys [name length get set]}]
       [
        (assoc dict (keyword (str (name-fn name) "-offset")) (/ offset float32-size))
        (+ offset length)])

     [offsets offset] (reduce reduce-fn [{} 0] state-format)
     state
     (map->State
       (merge
         {
          :buffer buffer
          :int32-buffer int32-buffer
          :float32-buffer float32-buffer}
         offsets))]

    state))
