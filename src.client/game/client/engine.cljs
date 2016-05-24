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
    [game.worker.state :as worker-state]
    )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  )

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
  get-unit-voxels
  [units]
  (map #(get-in % [:scene :voxels]) @(:units units)))

(defn
  get-unit-meshes
  [units]
  (map #(get-in % [:scene :mesh]) @(:units units)))

(defn
  get-unit-groups
  [units]
  (map #(get-in % [:scene :group]) @(:units units)))

(defn
  get-unit-clouds
  [units]
  (map #(get-in % [:scene :cloud]) @(:units units)))

(defn
  get-units
  [units]
  @(:units units))

(defn
  get-current-state
  [component]
  (let
    [unit-count (count (get-units (:units component)))
     new-state
     (worker-state/init-state
       {
        :unit-count unit-count
        :buffer nil
        })
     set-position (get-in new-state [:functions :positions :set])
     set-bbox (get-in new-state [:functions :bbox :set])
     groups-and-meshes (map vector
                            (get-unit-groups (:units component))
                            (get-unit-meshes (:units component)))
     groups-and-meshes-indexed (map-indexed vector groups-and-meshes)
     ]
    (doseq
      [[index [group mesh]] groups-and-meshes-indexed]
      (let
        [position (-> group .-position)
         bbox (-> mesh .-geometry .-boundingBox)]
        (set-position index position)
        (set-bbox index bbox)))
    new-state))

(defmulti -on-worker-message
  (fn [component data]
    (keyword (first data))
    ))

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
      }
     camera-dict
     {
      :matrix (-> camera .-matrix .toArray)
      :fov (-> camera .-fov)
      :aspect (-> camera .-aspect)
      :near (-> camera .-near)
      :far (-> camera .-far)
      }
     init-data
     (clj->js
       {
        :state-buffer (:buffer state)
        :camera camera-dict
        :unit-count unit-count
        :scene-properties
        {
         :width @(:width scene-properties)
         :height @(:height scene-properties)
         }
        :map-dict map-dict
        })]
    (-> worker (.postMessage #js ["initialize" init-data] #js [(:buffer state)]))
    (println "sent initialize")
    (-> worker (.postMessage #js ["start-engine" nil]))
    (println "sent start-engine")
    ))

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
                  :buffer (:buffer data)
                  })
         get-position (get-in new-state [:functions :positions :get])
         set-position (get-in new-state [:functions :positions :set])
         unit-groups (get-unit-groups (:units component))]
        (doseq
          [[unit-index group] (map vector (range unit-count) unit-groups)]
          (let
            [position (get-position unit-index)]
            (-> group .-position (.copy position))))))))

(defn on-worker-message
  [component message]
  (let
    [data (-> message .-data)
     data (js->clj data :keywordize-keys true)
     ]
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
                  :buffer nil
                  }))
       component
       (-> component
         (assoc :polling (atom true))
         (assoc :state state)
         (assoc :worker worker))
       ]
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
  [starting units mesh-to-screenbox-map mesh-to-unit-map]
  (fn [component]
    (let
      [starting (atom true)
       units (atom [])
       mesh-to-screenbox-map (atom {})
       mesh-to-unit-map (atom {})]
      (doseq
        [[index model] (map-indexed vector (:resource-list resources))]
        (m/mlet
          [geometry (:load-promise model)
           texture (:texture-load-promise model)
           voxel-dict (:voxels-load-promise model)]
          (if @starting
            (doseq
              [i (range 5)]
              (let
                [spread 150.0
                 xpos (- (* (math/random) 2.0 spread) spread)
                 zpos (- (* (math/random) 2.0 spread) spread)
                 material (-> (:standard-material magic) .clone)
                 _ (-> material .-uniforms .-map .-value (set! texture))
                 rep (new js/THREE.Vector4
                          (-> texture .-offset .-x)
                          (-> texture .-offset .-y)
                          (-> texture .-repeat .-x)
                          (-> texture .-repeat .-y))
                 _ (-> material .-uniforms .-offsetRepeat .-value (set! rep))
                 bounding-box-min (-> geometry .-boundingBox .-min)
                 bounding-box-max (-> geometry .-boundingBox .-max)
                 _ (-> material .-uniforms .-boundingBoxMin .-value (set! bounding-box-min))
                 _ (-> material .-uniforms .-boundingBoxMax .-value (set! bounding-box-max))
                 mesh (new js/THREE.Mesh geometry material)
                 cloud-material (-> (:magic-material magic) .clone)
                 _ (-> cloud-material .-uniforms .-isCloud .-value (set! 1.0))
                 _ (-> cloud-material .-uniforms .-boundingBoxMin .-value (set! bounding-box-min))
                 _ (-> cloud-material .-uniforms .-boundingBoxMax .-value (set! bounding-box-max))
                 cloud (new js/THREE.Mesh (:geometry voxel-dict) cloud-material)
                 _ (-> cloud .-renderOrder (set! 1))
                 [voxel-mesh voxel-lambert-mesh]
                 (let
                   [voxel-geometry (:geometry voxel-dict)
                    voxel-material (-> (:material explosion) .clone)
                    _ (-> voxel-material .-uniforms .-map .-value (set! texture))
                    voxel-lambert (new js/THREE.MeshLambertMaterial
                                       #js
                                       {
                                        :map texture
                                        :emissive 0x808080
                                        :emissiveMap texture
                                        :emissiveIntensity 0.5
                                        })
                    _ (-> texture .-needsUpdate (set! true))
                    start-time (+ (common/game-time) (* 1000.0 (math/random)))
                    _ (-> voxel-material .-uniforms .-groundTexture .-value .-needsUpdate (set! true))
                    _ (-> voxel-material .-uniforms .-time .-value (set! start-time))
                    voxel-mesh (new js/THREE.Mesh voxel-geometry voxel-material)
                    voxel-lambert-mesh (new js/THREE.Mesh voxel-geometry voxel-lambert)
                    ]
                   [voxel-mesh voxel-lambert-mesh])
                 bbox (-> mesh .-geometry .-boundingBox)
                 ypos (ground/align-to-ground ground bbox xpos zpos)
                 group (new js/THREE.Object3D)
                 unit
                 {
                  :index index
                  :model model
                  :health (* (math/random) (:max-health model))
                  :scene
                  {
                   :group group
                   :mesh mesh
                   :cloud cloud
                   :voxels voxel-mesh
                   }
                  }
                 ]
                (swap! units conj unit)
                (swap! mesh-to-unit-map assoc mesh unit)
                (-> group (.add mesh))
;                (-> group (.add cloud))
                (-> group (.add voxel-mesh))
;                (-> group (.add voxel-lambert-mesh))
                (scene/add scene group)
                (doto (-> group .-position)
                  (aset "x" xpos)
                  (aset "y" ypos)
                  (aset "z" zpos)))))))
      (-> component
        (assoc :mesh-to-unit-map mesh-to-unit-map)
        (assoc :mesh-to-screenbox-map mesh-to-screenbox-map)
        (assoc :units units)
        (assoc :starting starting))))
  (fn [component]
    (println "stopping units")
    (if starting
      (reset! starting false))
    (if units
      (doseq [group (get-unit-groups component)]
        (scene/remove scene group)))
    (->
      component
      (assoc :starting nil)
      (assoc :units nil))))

