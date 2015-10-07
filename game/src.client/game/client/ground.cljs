(ns ^:figwheel-always game.client.ground
    (:require 
              [cljs.pprint :as pprint]
              [jayq.core :as jayq :refer [$]]
              [game.client.common :as common :refer [data]]
              [game.client.config :as config]
              [game.client.scene :as scene]
              [com.stuartsierra.component :as component]
              ))

(defrecord InitGround
  [config scene mesh]
  component/Lifecycle
  (start [component] 
    (let
      [grass (-> js/THREE .-ImageUtils (.loadTexture "models/images/grass.jpg"))
       m-opts #js { :map grass }
       material (new js/THREE.MeshLambertMaterial m-opts)
       width (config/get-terrain-width config)
       height (config/get-terrain-height config)
       x-faces (get-in config [:terrain :x-faces])
       y-faces (get-in config [:terrain :y-faces])
       wrapping (-> js/THREE .-RepeatWrapping)
       map-repeat-width (/ width 100)
       map-repeat-height (/ height 100)
       geometry (new js/THREE.PlaneBufferGeometry width height x-faces y-faces)
       rotation (-> (new js/THREE.Matrix4) (.makeRotationX (/ (-> js/Math .-PI) -2)))
       ]
      (-> material .-map .-wrapS (set! wrapping))
      (-> material .-map .-wrapT (set! wrapping))
      (-> material .-map .-repeat (.set map-repeat-width map-repeat-height))
      (-> geometry (.applyMatrix rotation))
      (-> geometry .computeFaceNormals)
      (-> geometry .computeVertexNormals)
      (let
        [mesh (new THREE.Mesh geometry material)]
        (scene/add scene mesh)
        (assoc component :mesh mesh))))
  (stop [component]
    (if 
      (and (data scene) mesh)
      (scene/remove scene mesh))
    component
    ))

(defn new-init-ground
  []
  (component/using
    (map->InitGround {})
    [:config :scene]))
