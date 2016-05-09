(ns ^:figwheel-always game.client.engine
  (:require
    [cljs.pprint :as pprint]
    [com.stuartsierra.component :as component]
    [jayq.core :as jayq :refer [$]]
    [promesa.core :as p]
    [cats.core :as m]
    [rum.core :as rum]
    [game.client.common :as common :refer [new-jsobj list-item data unique-id]]
    [game.client.ground-local :as ground]
    [game.client.math :as math]
    [game.client.scene :as scene]
    [game.worker.state :as worker-state]
    [sablono.core :as sablono :refer-macros [html]]
    [clojure.string :as string :refer [join]]
    [game.shared.state :as state :refer [with-simple-cause]]
    )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  )

(defn
  get-unit-for-mesh
  [component mesh]
  (let
    [mesh-to-unit-map @(:mesh-to-unit-map component)]
    (mesh-to-unit-map mesh)))

(defn
  get-unit-meshes
  [units]
  @(:unit-meshes units))

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
     get-position (get-in new-state [:functions :positions :get])
     set-position (get-in new-state [:functions :positions :set])
     ]
    (doseq
      [[index mesh] (map-indexed vector (get-unit-meshes (:units component)))]
      (let
        [position (-> mesh .-position)]
        (set-position index position)))
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
     init-data
     #js
     {
      :state-buffer (:buffer state)
      :camera
      #js
      {
       :matrix (-> camera .-matrix .toArray)
       :fov (-> camera .-fov)
       :aspect (-> camera .-aspect)
       :near (-> camera .-near)
       :far (-> camera .-far)
       }
      :unit-count unit-count
      :scene-properties
      #js
      {
       :width @(:width scene-properties)
       :height @(:height scene-properties)
       }
      }]
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
  [scene-properties camera units engine-stats]
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

(defn
  align-to-ground
  [ground mesh xpos zpos]
  (let
    [
     bbox (-> mesh .-geometry .-boundingBox)
     ; get height of centre and four courners of box
     x1 (+ xpos (-> bbox .-min .-x))
     x2 (+ xpos (-> bbox .-max .-x))
     z1 (+ zpos (-> bbox .-min .-z))
     z2 (+ zpos (-> bbox .-max .-z))
     hc (ground/get-height ground xpos zpos)
     h11 (ground/get-height ground x1 z1)
     h12 (ground/get-height ground x1 z2)
     h21 (ground/get-height ground x2 z1)
     h22 (ground/get-height ground x2 z2)
     y (- (max hc h11 h12 h21 h22)(-> bbox .-min .-y))
     ]
    y))

(defcom
  new-test-units
  [ground scene init-scene resources]
  [starting units unit-meshes mesh-to-unit-map]
  (fn [component]
    (let
      [starting (atom true)
       units (atom [])
       unit-meshes (atom [])
       mesh-to-unit-map (atom {})]
      (doseq
        [[index model] (map-indexed vector (:resource-list resources))]
        (let
          [texture-loader (new THREE.TextureLoader)
           material (new js/THREE.MeshLambertMaterial)
           wrapping (-> js/THREE .-RepeatWrapping)
           on-load (fn [texture]
                     (-> texture .-wrapS (set! wrapping))
                     (-> texture .-wrapT (set! wrapping))
                     (-> texture .-repeat (.set 1 1))
                     (-> material .-map (set! texture))
                     (-> material .-needsUpdate (set! true)))
           grass (-> texture-loader (.load "models/images/grass.jpg" on-load))
           ]
          (m/mlet
            [geometry (:load-promise model)
             texture (:texture-load-promise model)]
            (if @starting
              (doseq
                [i (range 10)]
                (let
                  [spread 100.0
                   xpos (- (* (math/random) 2.0 spread) spread)
                   zpos (- (* (math/random) 2.0 spread) spread)
                   material (new js/THREE.MeshLambertMaterial #js { :map texture })
                   ;_ (-> material .-needsUpdate (set! true))
                   mesh (new js/THREE.Mesh geometry material)
                   ypos (align-to-ground ground mesh xpos zpos)
                   unit
                   {
                    :index index
                    :model model
                    :health (* (math/random) (:max-health model))
                    }
                   ]
  ;                (println "model add" (:name model) mesh)
                  (swap! unit-meshes conj mesh)
                  (swap! units conj unit)
                  (swap! mesh-to-unit-map assoc mesh unit)
                  (scene/add scene mesh)
                  (doto (-> mesh .-position)
                    (aset "x" xpos)
                    (aset "y" ypos)
                    (aset "z" zpos))))))))
      (-> component
        (assoc :mesh-to-unit-map mesh-to-unit-map)
        (assoc :units units)
        (assoc :unit-meshes unit-meshes)
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

