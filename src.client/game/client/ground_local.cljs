(ns ^:figwheel-always game.client.ground-local
    (:require
      [cljs.pprint :as pprint]
      [jayq.core :as jayq :refer [$]]
      [com.stuartsierra.component :as component]
      [promesa.core :as p]
      [cats.core :as m]
      [game.client.common :as common :refer [data]]
      [game.client.config :as config]
      ))


(defn get-map
  [component config mesh simplex]
  (let
    [
     texture-loader (new THREE.TextureLoader)
     material (new js/THREE.MeshLambertMaterial)
     wrapping (-> js/THREE .-RepeatWrapping)
     width (config/get-terrain-width config)
     height (config/get-terrain-height config)
     map-repeat-width (/ width 100)
     map-repeat-height (/ height 100)
     on-load (fn [texture]
               (-> texture .-wrapS (set! wrapping))
               (-> texture .-wrapT (set! wrapping))
               (-> texture .-repeat (.set map-repeat-width map-repeat-height))
               (-> material .-map (set! texture))
               (-> material .-needsUpdate (set! true)))
     grass (-> texture-loader (.load "models/images/grass.jpg" on-load))
     m-opts #js { :map grass }
     x-faces (get-in config [:terrain :x-faces])
     y-faces (get-in config [:terrain :y-faces])
     max-elevation (get-in config [:terrain :max-elevation])
     min-elevation (get-in config [:terrain :min-elevation])
     geometry (new js/THREE.PlaneBufferGeometry width height x-faces y-faces)
     rotation (-> (new js/THREE.Matrix4) (.makeRotationX (/ (-> js/Math .-PI) -2)))
     position (-> geometry .-attributes .-position)
     length (-> position .-count)
     ]
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
        (assoc component :mesh mesh))))

(defrecord InitGroundLocal
  [config mesh params]
  component/Lifecycle
  (start [component]
    (if-not
      mesh
      (get-map component config mesh (:simplex params))
      component))
  (stop [component]
    component
    ))

(defn new-init-ground
  []
  (component/using
    (map->InitGroundLocal {})
    [:config :params]))
