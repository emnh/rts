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
  @(:unit-voxels units))

(defn
  get-unit-meshes
  [units]
  @(:unit-meshes units))

(defn
  get-unit-clouds
  [units]
  @(:unit-clouds units))

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
     ]
    (doseq
      [[index mesh] (map-indexed vector (get-unit-meshes (:units component)))]
      (let
        [position (-> mesh .-position)
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
         unit-meshes @(get-in component [:units :unit-meshes])]
        (doseq
          [[unit-index mesh] (map vector (range unit-count) unit-meshes)]
          (let
            [position (get-position unit-index)]
            (-> mesh .-position (.copy position))))))))

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
  [starting units unit-meshes unit-clouds unit-voxels
   mesh-to-screenbox-map mesh-to-unit-map]
  (fn [component]
    (let
      [starting (atom true)
       units (atom [])
       unit-meshes (atom [])
       unit-clouds (atom [])
       unit-voxels (atom [])
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
              [i (range 1)]
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
                 cloud (new js/THREE.Points (:geometry voxel-dict) cloud-material)
                 _ (-> cloud .-renderOrder (set! 1))
                 voxel-mesh
                 (let
                   [voxel-geometry (:geometry voxel-dict)
                    voxel-material (:material explosion)
                    voxel-mesh (new js/THREE.Mesh voxel-geometry voxel-material)
                    ]
                   voxel-mesh)
                 bbox (-> mesh .-geometry .-boundingBox)
                 ypos (ground/align-to-ground ground bbox xpos zpos)
                 unit
                 {
                  :index index
                  :model model
                  :health (* (math/random) (:max-health model))
                  }
                 ]
                (swap! unit-clouds conj cloud)
                (swap! unit-meshes conj mesh)
                (swap! unit-voxels conj voxel-mesh)
                (swap! units conj unit)
                (swap! mesh-to-unit-map assoc mesh unit)
                (-> mesh (.add cloud))
                (do
                  ;(-> voxel-mesh .-position .-y (set! 100))
                  (-> mesh (.add voxel-mesh)))
                (scene/add scene mesh)
                (doto (-> mesh .-position)
                  (aset "x" xpos)
                  (aset "y" ypos)
                  (aset "z" zpos)))))))
      (-> component
        (assoc :mesh-to-unit-map mesh-to-unit-map)
        (assoc :mesh-to-screenbox-map mesh-to-screenbox-map)
        (assoc :units units)
        (assoc :unit-meshes unit-meshes)
        (assoc :unit-clouds unit-clouds)
        (assoc :unit-voxels unit-voxels)
        (assoc :starting starting))))
  (fn [component]
    (println "stopping units")
    (if starting
      (reset! starting false))
    (if unit-meshes
      (doseq [unit @unit-meshes]
        (scene/remove scene unit)))
    (->
      component
      (assoc :starting nil)
      (assoc :units nil)
      (assoc :unit-meshes nil))))

