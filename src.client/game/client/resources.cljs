(ns ^:figwheel-always game.client.resources
    (:require
              [cljs.pprint :as pprint]
              [clojure.string :as string :refer [replace]]
              [com.stuartsierra.component :as component]
              [promesa.core :as p]
              [game.client.math :as math :refer [pi]]
              [game.client.config :as config]
              [game.client.models :as models :refer [transform-geometry]]
              [game.client.voxelize :as voxelize]
              [game.client.progress-manager
               :as progress-manager
               :refer [update-progress-item]]
              )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  )

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
                voxel-dict (js->clj decoded :keywordize-keys true)
                voxel-geometry (voxelize/voxelize-output voxel-dict)
                ;voxel-geometry (transform-geometry model voxel-geometry)
                voxel-dict (assoc voxel-dict :geometry voxel-geometry)]
               (resolve voxel-dict))))]
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
           [model (models/get-models)]
           (let
             [path (:path model)
              texture-path (:texture-path model)
              voxels-path (replace (replace path #"/3d/" "/voxels/") #"\.json$" ".msgpack")
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
