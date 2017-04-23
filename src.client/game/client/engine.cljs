(ns ^:figwheel-always game.client.engine
  (:require
    [cljs.pprint :as pprint]
    [com.stuartsierra.component :as component]
    [promesa.core :as p]
    [cats.core :as m]
    [game.client.common :as common :refer [new-jsobj list-item data unique-id]]
    [game.client.ground-local :as ground]
    [game.client.math :as math]
    [game.client.scene :as scene]
    [game.client.voxelize :as voxelize]
    [game.worker.state :as worker-state])

  (:require-macros [game.shared.macros :as macros :refer [defcom]]))

(defn
  get-screenbox-for-mesh
  [component mesh]
  (let
    [mesh-to-screenbox-map @(:mesh-to-screenbox-map component)]
    (mesh-to-screenbox-map mesh)))

(defn
  get-unit-for-mesh
  [component mesh]
  (let
    [mesh-to-unit-map @(:mesh-to-unit-map component)]
    (mesh-to-unit-map mesh)))

(defn
  get-unit-explosion
  [unit]
  (:explosion-mesh (:scene unit)))

(defn
  get-unit-mesh
  [unit]
  (:display-mesh (:scene unit)))

(defn
  get-unit-regular-mesh
  [unit]
  (:regular-mesh (:scene unit)))

(defn
  get-unit-build-mesh
  [unit]
  (:build-mesh (:scene unit)))

(defn
  get-unit-star
  [unit]
  (:stars-mesh (:scene unit)))

(defn
  get-unit-group
  [unit]
  (:group (:scene unit)))

(defn
  get-unit-position
  [unit]
  (-> (:group (:scene unit)) .-position))

(defn
  get-units
  [units]
  @(:units units))

(defn for-each-unit
  [units-component f]
  (let
    [units (get-units units-component)
     unit-count (count units)]
    ; not using seq because of speed
    (loop
      [i 0]
      (if
        (< i unit-count)
        (do
          (f i (nth units i))
          (recur (inc i)))))))

; slower
(defn map-units
  [units-component f]
  (let
    [units (get-units units-component)
     unit-count (count units)]
    (loop
      [i 0 v []]
      (if
        (< i unit-count)
        (recur (inc i) (conj v (f i (nth units i))))
        v))))

(defn
  get-current-state
  [component]
  (let
    [unit-count (count (get-units (:units component)))
     new-state
     (worker-state/init-state
       {
        :unit-count unit-count
        :buffer nil})]


    (for-each-unit
      (:units component)
      (fn [index unit]
        (let
          [group (get-unit-group unit)
           mesh (get-unit-mesh unit)
           position (get-unit-position unit)
           bbox (-> mesh .-geometry .-boundingBox)]
          (worker-state/set-position new-state index position)
          (worker-state/set-bbox new-state index bbox))))
    new-state))

(defmulti -on-worker-message
  (fn [component data]
    (keyword (first data))))


(defmethod -on-worker-message
  :default
  [component [event data]]
  (println "unhandled worker message" event data))

(defmethod -on-worker-message
  :loaded
  [component [event data]]
  (println "loaded")
  (let
    [worker (:worker component)
     camera (common/data (:camera component))
     unit-count (count (get-units (:units component)))
     scene-properties (:scene-properties component)
     state (get-current-state component)
     ground (:ground component)
     map-dict
     {
      ;:height-field (-> (:height-field ground) .-buffer)
      :height-field (:height-field ground)
      :width (:width ground)
      :height (:height ground)
      :x-faces (:x-faces ground)
      :y-faces (:y-faces ground)
      :x-vertices (:x-vertices ground)
      :y-vertices (:y-vertices ground)}

     camera-dict
     {
      :matrix (-> camera .-matrix .toArray)
      :fov (-> camera .-fov)
      :aspect (-> camera .-aspect)
      :near (-> camera .-near)
      :far (-> camera .-far)}

     init-data
     (clj->js
       {
        :state-buffer (:buffer state)
        :camera camera-dict
        :unit-count unit-count
        :scene-properties
        {
         :width @(:width scene-properties)
         :height @(:height scene-properties)}

        :map-dict map-dict})]

    (-> worker (.postMessage #js ["initialize" init-data] #js [(:buffer state)]))
    (println "sent initialize")
    (-> worker (.postMessage #js ["start-engine" nil]))
    (println "sent start-engine")))


(defmethod -on-worker-message
  :update
  [component [event data]]
  (let
    [engine-stats (common/data (:engine-stats component))]
    (-> engine-stats .update)
    (if data
      (let
        [unit-count (:unit-count data)
         new-state (worker-state/init-state
                    {
                     :unit-count unit-count
                     :buffer (:buffer data)})]

        (for-each-unit
          (:units component)
          (fn [unit-index unit]
            (let
              [group (get-unit-group unit)]
              (let
                [position (worker-state/get-position new-state unit-index)]
                (-> group .-position (.copy position))))))))))

(defn on-worker-message
  [component message]
  (let
    [data (-> message .-data)
     data (js->clj data :keywordize-keys true)]

;    (println "on-worker-message" data)
    (-on-worker-message component data)))
;    (-on-worker-message component message)))

(defn poll-state
  [component]
  (if
    @(:polling component)
    (do
      (let
        [worker (:worker component)]
        (-> worker (.postMessage #js ["poll-state" nil])))
      (js/requestAnimationFrame (partial poll-state component)))))

(defcom
  new-engine
  [scene-properties camera units engine-stats ground]
  [state worker polling]
  (fn [component]
    (let
      [unit-count (count (get-units units))
       worker (new js/Worker "js/worker.js")
       state (atom
               (worker-state/init-state
                 {
                  :unit-count unit-count
                  :buffer nil}))

       component
       (-> component
         (assoc :polling (atom true))
         (assoc :state state)
         (assoc :worker worker))]

      (-> worker
        (.addEventListener "message" (partial on-worker-message component) false))
      (poll-state component)
      component))
  (fn [component]
    (if polling
      (reset! polling false))
    (if worker
      (do
        (-> worker .terminate)))
    component))

(defcom
  new-test-units
  [ground scene init-scene resources magic explosion]
  [starting units mesh-to-screenbox-map mesh-to-unit-map
   units-container units-minimap-container]
  (fn [component]
    (let
      [starting (atom true)
       units (atom [])
       mesh-to-screenbox-map (atom {})
       mesh-to-unit-map (atom {})
       debugBoxSize 10.0
       debugBoxHeight 3.0
       debugBox (new js/THREE.BoxGeometry debugBoxSize debugBoxHeight debugBoxSize)
       ;debugBox (new js/THREE.PlaneBufferGeometry debugBoxSize debugBoxSize 1.0 1.0)
       ;rotation (-> (new js/THREE.Matrix4) (.makeRotationX (/ (-> js/Math .-PI) -2)))
       ;_ (-> debugBox (.applyMatrix rotation))
       _ (-> debugBox .center)
       maxr 10
       units-container (new js/THREE.Object3D)
       units-minimap-container (new js/THREE.Object3D)]
      (scene/add scene units-container)
      (scene/add scene units-minimap-container)
      (doseq
        [[index model] (map-indexed vector (:resource-list resources))]
        (m/mlet
          [geometry (:load-promise model)
           texture (:texture-load-promise model)
           voxel-dict (:voxels-load-promise model)]
          (if @starting
            (doseq
              [i (range maxr)
               j (range maxr)]
              (let
                [scale (:post-scale model)
                 spread 1000.0
                 xpos (- (* (math/random) 2.0 spread) spread)
                 zpos (- (* (math/random) 2.0 spread) spread)
                 rotation (* (* 2.0 math/pi) (math/random))
                 ;xpos (* (- i (/ maxr 2.0)) 5.0)
                 ;zpos (* (- j (/ maxr 2.0)) 5.0)
                 yoff 1.0
                 material (-> (:standard-material magic) .clone)
                 _ (-> material .-uniforms .-map .-value (set! texture))
                 rep (new js/THREE.Vector4
                          (-> texture .-offset .-x)
                          (-> texture .-offset .-y)
                          (-> texture .-repeat .-x)
                          (-> texture .-repeat .-y))
                 _ (-> material .-uniforms .-offsetRepeat .-value (set! rep))
                 ;bounding-box-min (-> geometry .-boundingBox .-min)
                 ;bounding-box-max (-> geometry .-boundingBox .-max)
                 voxel-geometry (:geometry voxel-dict)
                 bbox (-> voxel-geometry .-boundingBox)
                 bounding-box-min (-> voxel-geometry .-boundingBox .-min)
                 bounding-box-max (-> voxel-geometry .-boundingBox .-max)
                 debugMaterial (new js/THREE.MeshStandardMaterial #js { :color 0x0000FF :fog false})
                 debugMesh1 (new js/THREE.Mesh debugBox debugMaterial)
                 debugMesh2 (new js/THREE.Mesh debugBox debugMaterial)
                 debugMesh3 (new js/THREE.Mesh debugBox debugMaterial)
                 debugMesh4 (new js/THREE.Mesh debugBox debugMaterial)
                 debugMesh5 (new js/THREE.Mesh debugBox debugMaterial)
                 minimap-material
                  (new js/THREE.MeshBasicMaterial #js { :color 0x0000FF :fog false})
                 minimap-material2
                  (new js/THREE.MeshBasicMaterial #js { :color 0x000000 :fog false :side js/THREE.BackSide})
                 ; TODO: could be plane instead of box
                 minimap-marker (new js/THREE.Mesh debugBox minimap-material)
                 minimap-marker-border (new js/THREE.Mesh debugBox minimap-material2)
                 minimap-border-scale 2.0
                 minimap-group (new js/THREE.Object3D)
                 ;_ (console.log bounding-box-min bounding-box-max)
                 _ (-> material .-uniforms .-boundingBoxMin .-value (set! bounding-box-min))
                 _ (-> material .-uniforms .-boundingBoxMax .-value (set! bounding-box-max))
                 mesh (new js/THREE.Mesh geometry material)
                 cloud-material (-> (:magic-material magic) .clone)
                 _ (-> cloud-material .-uniforms .-isCloud .-value (set! 1.0))
                 _ (-> cloud-material .-uniforms .-boundingBoxMin .-value (set! bounding-box-min))
                 _ (-> cloud-material .-uniforms .-boundingBoxMax .-value (set! bounding-box-max))
                 cloud (new js/THREE.Mesh voxel-geometry cloud-material)
                 _ (-> cloud .-renderOrder (set! 1))
                 explosion-mesh
                 (let
                   [voxel-material (-> (:material explosion) .clone)
                    _ (-> voxel-material .-uniforms .-map .-value (set! texture))
                    _ (-> texture .-needsUpdate (set! true))
                    _ (-> voxel-material .-uniforms .-groundTexture .-value .-needsUpdate (set! true))
                    _ (-> voxel-material .-uniforms .-time .-value (set! 0))
                    _ (-> voxel-material .-uniforms .-uScale .-value (set! (:post-scale model)))
                    ;_ (-> voxel-material .-uniforms .-duration .-value
                    ;    (set! (+ 500.0 (* (math/random) 30000.0))))
                    _ (-> voxel-material .-uniforms .-duration .-value
                        (set! 5000.0))
                    _ (->
                        voxel-material .-uniforms .-boxSize .-value
                        (set! (new js/THREE.Vector3 (:voxel-width voxel-dict) (:voxel-height voxel-dict) (:voxel-depth voxel-dict))))
                    depth-shader (-> js/THREE.ShaderLib .-depth)
                    uniforms (-> js/THREE.UniformsUtils (.clone (-> depth-shader .-uniforms)))
                    depth-material
                    (new
                      js/THREE.ShaderMaterial
                      #js
                      {
                        :uniforms (js/THREE.UniformsUtils.merge #js [uniforms (-> voxel-material .-uniforms)])
                        :vertexShader (-> voxel-material .-vertexShader)
                        :fragmentShader (-> depth-shader .-fragmentShader)})
                    _ (-> depth-material .-isMeshDepthMaterial (set! true))
                    _ (-> depth-material .-depthPacking (set! js/THREE.RGBADepthPacking))
                    _ (-> js/DEBUG .-depthshader (set! (-> depth-shader .-fragmentShader)))
                    explosion-mesh (new js/THREE.Mesh voxel-geometry voxel-material)]
                    ;_ (-> explosion-mesh .-renderOrder (set! index))
                   (-> explosion-mesh .-customDepthMaterial (set! depth-material))
                   (-> explosion-mesh .-position .-y (set! debugBoxHeight))
                   explosion-mesh)
                 ypos (+ yoff (ground/align-to-ground ground bbox xpos zpos))
                 group (new js/THREE.Object3D)
                 unit
                 {
                  :index index
                  :model model
                  :health (* (math/random) (:max-health model))
                  :add-time (+ (common/game-time) (* 1000.0 (math/random)))
                  :scene
                  {
                   :group group
                   :display-mesh explosion-mesh
                   ;:display-mesh mesh
                   :regular-mesh mesh
                   :build-mesh mesh
                   :stars-mesh cloud
                   :explosion-mesh explosion-mesh}}]
                (swap! units conj unit)
                (swap! mesh-to-unit-map assoc mesh unit)
                (swap! mesh-to-unit-map assoc explosion-mesh unit)
                (-> group (.add mesh))
                (-> mesh .-visible (set! false))
                (-> cloud .-visible (set! false))
                (-> group (.add cloud))
                (-> group (.add explosion-mesh))
                (-> group .-castShadow (set! true))
                (-> mesh .-castShadow (set! true))
                (-> explosion-mesh .-castShadow (set! true))
                (let
                  [x (+ xpos (-> bbox .-min .-x))
                   z (+ zpos (-> bbox .-min .-z))
                   y (+ yoff (ground/get-height ground x z))]
                  (doto (-> debugMesh1 .-position)
                    (aset "x" (- x xpos))
                    (aset "y" (- y ypos))
                    (aset "z" (- z zpos))))
                (let
                  [x (+ xpos (-> bbox .-max .-x))
                   z (+ zpos (-> bbox .-min .-z))
                   y (+ yoff (ground/get-height ground x z))]
                  (doto (-> debugMesh2 .-position)
                    (aset "x" (- x xpos))
                    (aset "y" (- y ypos))
                    (aset "z" (- z zpos))))
                (let
                  [x (+ xpos (-> bbox .-min .-x))
                   z (+ zpos (-> bbox .-max .-z))
                   y (+ yoff (ground/get-height ground x z))]
                  (doto (-> debugMesh3 .-position)
                    (aset "x" (- x xpos))
                    (aset "y" (- y ypos))
                    (aset "z" (- z zpos))))
                (let
                  [x (+ xpos (-> bbox .-max .-x))
                   z (+ zpos (-> bbox .-max .-z))
                   y (+ yoff (ground/get-height ground x z))]
                  (doto (-> debugMesh4 .-position)
                    (aset "x" (- x xpos))
                    (aset "y" (- y ypos))
                    (aset "z" (- z zpos))))
                (let
                  [x xpos
                   z zpos
                   y (+ yoff (ground/get-height ground x z))
                   ys (* 2.0 (ground/get-height ground x z))
                   y (-> bbox .-min .-y)]
                  ;(-> debugMesh5 .-scale .-y (set! ys))
                  (-> debugMesh5 .-scale (.set scale scale scale))
                  (doto (-> debugMesh5 .-position)
                    ;(aset "x" (- x xpos))
                    (aset "y" y)))
                    ;(aset "z" (- z zpos))))
                ;(-> group (.add debugMesh1))
                ;(-> group (.add debugMesh2))
                ;(-> group (.add debugMesh3))
                ;(-> group (.add debugMesh4))
                (-> group (.add debugMesh5))
                ;(scene/add scene group)
                (-> units-container (.add group))
                (->
                  minimap-marker-border .-scale
                  (.set minimap-border-scale minimap-border-scale minimap-border-scale))
                ;(-> minimap-marker-border .-renderOrder (set! 1))
                ;(-> minimap-marker .-renderOrder (set! 0))
                (doto
                  minimap-group
                  (.add minimap-marker)
                  (.add minimap-marker-border)
                  (-> .-position (.set xpos 300.0 zpos))
                  (-> .-scale (.set 7.0 7.0 7.0)))
                (-> units-minimap-container (.add minimap-group))
                (-> group .-position (.set xpos ypos zpos))
                ;(-> group .-scale (.set 5 5 5))
                (-> group (.rotateOnAxis (new js/THREE.Vector3 0.0 1.0 0.0) rotation)))))))
      (-> component
        (assoc :mesh-to-unit-map mesh-to-unit-map)
        (assoc :mesh-to-screenbox-map mesh-to-screenbox-map)
        (assoc :units units)
        (assoc :starting starting)
        (assoc :units-container units-container)
        (assoc :units-minimap-container units-minimap-container))))
  (fn [component]
    (println "stopping units")
    (if starting
      (reset! starting false))
    (if units
      (do
        (scene/remove scene units-container)
        (scene/remove scene units-minimap-container)
        (for-each-unit
          component
          (fn
            [_ unit]
            (-> units-container (.remove (get-unit-group unit)))))))
    (->
      component
      (assoc :starting nil)
      (assoc :units nil))))
