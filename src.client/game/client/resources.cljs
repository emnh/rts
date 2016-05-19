(ns ^:figwheel-always game.client.resources
    (:require
              [cljs.pprint :as pprint]
              [clojure.string :as string :refer [replace]]
              [jayq.core :as jayq :refer [$]]
              [rum.core :as rum]
              [com.stuartsierra.component :as component]
              [promesa.core :as p]
              [game.client.math :as math :refer [pi]]
              [game.client.config :as config]
              [game.client.voxelize :as voxelize]
              [game.client.progress-manager
               :as progress-manager
               :refer [update-progress-item]]
              )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  )

(def
  models
  [
   {
    :name "tank-m1a1"
    :path "models/3d/tank-m1a1.json"
    :scale 0.05
    :texture-path "models/images/camouflage.jpg"
    :texture-repeat [0.2 0.2]
    }
   {
     :name "dragon"
     :path "models/3d/dragon.json"
     :scale 1
     :texture-path "models/images/dragon.jpg"
     :type :unit-type/air
   }
   {
     :name "house"
     :path "models/3d/house.json"
     :scale 0.03
     :texture-path "models/images/house.jpg"
     :type :unit-type/building
     :can-attack false
     :can-move false
   }
   {
     :name "ant"
     :path "models/3d/ant.json"
     :scale 10
     :rotation [0 (/ (- pi) 2) 0]
     :texture-path "models/images/ant.jpg"
   }
   {
     :name "tank-apc"
     :path "models/3d/tank-apc.json"
     :scale 0.2
     :rotation [0 (/ pi 2) 0]
   }
   {
     :name "horse"
     :path "models/3d/horse.json"
     :scale 1.5
     :texture-path "models/images/horse.jpg"
   }
   {
     :name "fighter"
     :path "models/3d/fighter.json"
     :scale 3
     :rotation [0 (/ pi 2) 0]
     :texture-path "models/images/fighter.jpg"
     :type :unit-type/air
   }
   {
     :name "thor"
     :path "models/3d/thor.json"
     :scale 5
     :texture-path "models/images/thor.jpg"
   }
   {
     :name "biplane"
     :path "models/3d/biplane.json"
     :scale 1
     :rotation [0 (/ pi 2) 0]
     :texture-path "models/images/biplane.jpg"
     :type :unit-type/air
   }
   {
     :name "mushroom"
     :path "models/3d/mushroom.json"
     :scale 0.2
     :texture-path "models/images/mushroom.jpg"
     :type :unit-type/building
     :can-attack false
     :can-move false
   }
   {
     :name "farm"
     :path "models/3d/farm.json"
     :scale 500
     :texture-path "models/images/farm.jpg"
     :type :unit-type/building
     :can-attack false
     :can-move false
   }
   {
     :name "missile"
     :path "models/3d/missile.json"
     :scale 3
     :texture-path "models/images/missile.jpg"
     :type :unit-type/missile
   }
   {
     :name "crystal"
     :path "models/3d/crystal.json"
     :scale 2
     :texture-path "models/images/crystal.jpg"
     :type :unit-type/resource
     :opacity 1.0
     :can-attack false
     :can-move false
   }
   {
     :name "headquarters"
     :path "models/3d/moonbase.json"
     :scale 3
     :type :unit-type/building
     :opacity 1.0
     :can-attack false
     :can-move false
     :max-health 2000
   }
   ]
  )

(def defaults
  {
    :scale 1
    :rotation [0 0 0]
    :texture-path "models/images/camouflage.jpg"
    :texture-repeat [1 1]
    :opacity 1
    :type :unit-type/ground
    :move-speed 1
    :can-attack true
    :can-move true
    :max-health 100
    })

(defn
  load-resource
  [path on-success on-progress on-error]
  (let
    [xhr (new js/XMLHttpRequest)]
    (doto
      xhr
      (.open "GET" path true)
      (aset "responseType" "arraybuffer")
      (aset "onerror" on-error)
      (aset "onload" on-success)
      (aset "onprogress" on-progress)
      (.send))))

(defn load-texture
  [model path on-progress]
  (p/promise
    (fn [resolve reject]
      (let
        [repeat-x (first (:texture-repeat model))
         repeat-y (second (:texture-repeat model))
         on-success
         (fn []
           (this-as
             this
             (let
               [img (new js/Image)
                blob (new js/Blob #js [(.-response this)])]
               (aset img "onload"
                     (fn []
;                       (println "resolve image" path)
                       (let
                         [texture (new js/THREE.Texture img)]
                         (-> texture .-wrapS (set! js/THREE.RepeatWrapping))
                         (-> texture .-wrapT (set! js/THREE.RepeatWrapping))
                         (-> texture .-repeat (.set repeat-x repeat-y))
                         (-> texture .-needsUpdate (set! true))
                         (resolve texture))))
               (aset img "onerror" #(reject (str "image load error: " path)))
               (aset img "src" (-> js/window .-URL (.createObjectURL blob)))
               )))]
        (load-resource path on-success on-progress reject)))))

(defn transform-geometry
  [model geo]
  (let
    [mat (new js/THREE.Matrix4)
     scale (:scale model)]
    (-> mat (.makeRotationX (nth (:rotation model) 0)))
    (-> geo (.applyMatrix mat))
    (-> mat (.makeRotationY (nth (:rotation model) 1)))
    (-> geo (.applyMatrix mat))
    (-> mat (.makeRotationZ (nth (:rotation model) 2)))
    (-> geo (.applyMatrix mat))
    (-> mat (.makeScale scale scale scale))
    (-> geo (.applyMatrix mat))
    ;(-> geo (.computeBoundingBox))
    (-> geo (.center))
    (-> geo (.computeBoundingBox))
    (-> geo (.computeBoundingSphere))
    (-> geo (.computeFaceNormals))
    (-> geo (.computeVertexNormals))
    geo))

(defn load-voxels
  [model path on-progress]
  (p/promise
    (fn [resolve reject]
      (let
        [on-success
         (fn []
           (this-as
             this
             (let
               [buffer (.-response this)
                uint8array (new js/Uint8Array buffer)
                decoded (-> js/msgpack (.decode uint8array))
                clj (js->clj decoded :keywordize-keys true)
                voxel-geometry (voxelize/voxelize-output clj)
                voxel-geometry (transform-geometry model voxel-geometry)
                clj (assoc clj :geometry voxel-geometry)]
               (resolve clj))))]
        (load-resource path on-success on-progress reject)))))


(defn load-geometry
  [model path on-progress]
  (p/promise
    (fn [resolve reject]
      (let
        [on-success #(resolve (transform-geometry model %))
         on-error reject
         geo-loader (new js/THREE.BufferGeometryLoader)]
        (-> geo-loader
          (.load path on-success on-progress on-error))))))

(defn on-progress
  [progress-manager resource xhr]
  (update-progress-item
    progress-manager
    resource
    (-> xhr .-loaded)
    (-> xhr .-total)))

(defcom
  new-resources
  [progress-manager]
  [resource-list all-promise]
  (fn [component]
    (let
      [resource-list
       (into
         []
         (for
           [model (map #(merge defaults %) models)]
           (let
             [path (:path model)
              texture-path (:texture-path model)
              voxels-path (replace (replace (:path model) #"/3d/" "/voxels/") #"\.json$" ".msgpack")
              on-geo-progress (partial on-progress progress-manager path)
              on-texture-progress (partial on-progress progress-manager texture-path)
              on-voxels-progress (partial on-progress progress-manager voxels-path)
              load-promise (load-geometry model path on-geo-progress)
              texture-load-promise (load-texture model texture-path on-texture-progress)
              voxels-load-promise (load-voxels model voxels-path on-voxels-progress)]
             (merge
               model
               {
                :load-promise load-promise
                :texture-load-promise texture-load-promise
                :voxels-load-promise voxels-load-promise
                }))))]
         (-> component
           (assoc
             :all-promise
             (p/all
               (into
                 []
                 (concat
                   (map
                     #(vector
                        (:load-promise %)
                        (:texture-load-promise %)
                        (:voxels-load-promise %)) resource-list)))))
           (assoc :resource-list resource-list))))
  (fn [component] component))
