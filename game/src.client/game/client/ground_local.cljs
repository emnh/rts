(ns ^:figwheel-always game.client.ground-local
    (:require
      [cljs.pprint :as pprint]
      [jayq.core :as jayq :refer [$]]
      [com.stuartsierra.component :as component]
      [promesa.core :as p]
      [cats.core :as m]
      [game.client.common :as common :refer [data]]
      [game.client.config :as config]
      [game.client.scene :as scene]
      ))


(defn get-map
  [component config scene mesh simplex]
  (let
    [
     grass (-> js/THREE .-ImageUtils (.loadTexture "models/images/grass.jpg"))
     m-opts #js { :map grass }
     material (new js/THREE.MeshLambertMaterial m-opts)
     width (config/get-terrain-width config)
     height (config/get-terrain-height config)
     x-faces (get-in config [:terrain :x-faces])
     y-faces (get-in config [:terrain :y-faces])
     max-elevation (get-in config [:terrain :max-elevation])
     min-elevation (get-in config [:terrain :min-elevation])
     wrapping (-> js/THREE .-RepeatWrapping)
     map-repeat-width (/ width 100)
     map-repeat-height (/ height 100)
     geometry (new js/THREE.PlaneBufferGeometry width height x-faces y-faces)
     rotation (-> (new js/THREE.Matrix4) (.makeRotationX (/ (-> js/Math .-PI) -2)))
     position (-> geometry .-attributes .-position)
     length (-> position .-count)
     ]
      ;(-> geometry .-position .-array
      (-> material .-map .-wrapS (set! wrapping))
      (-> material .-map .-wrapT (set! wrapping))
      (-> material .-map .-repeat (.set map-repeat-width map-repeat-height))
      (-> geometry (.applyMatrix rotation))
      (doseq
         [i (range length)]
         (let
           [x (-> position (.getX i))
            y (-> position (.getY i))
            z (-> position (.getZ i))
            y (-> simplex (.noise (/ x 100) (/ z 100)))
            y (/ (+ y 1) 2)
            y (+ (* y max-elevation) min-elevation)
            ]
           (-> position (.setY i y))
           ))
      (-> geometry .computeFaceNormals)
      (-> geometry .computeVertexNormals)
      (let
        [mesh (new THREE.Mesh geometry material)]
        (scene/add scene mesh)
        (assoc component :mesh mesh))))

(defrecord InitGroundLocal
  [config scene mesh params]
  component/Lifecycle
  (start [component]
    (if-not
      mesh
      (get-map component config scene mesh (:simplex params))
      component))
  (stop [component]
    (if
      mesh
      (scene/remove scene mesh))
    component
    ))

(defn new-init-ground
  []
  (component/using
    (map->InitGroundLocal {})
    [:config :scene :params]))
