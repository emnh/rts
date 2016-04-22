(ns ^:figwheel-always game.client.ground
    (:require
      [cljs.pprint :as pprint]
      [jayq.core :as jayq :refer [$]]
      [com.stuartsierra.component :as component]
      [promesa.core :as p]
      [cats.core :as m]
      [game.client.common :as common :refer [data]]
      [game.client.config :as config]
      [game.client.scene :as scene]
      [game.client.socket :as socket]
      ))


(defn get-map
  [component config socket scene mesh]
  (m/mlet
    [mapdata (socket/rpc socket "get-map" :name "default")]
    (let
      [
       grass (-> js/THREE .-ImageUtils (.loadTexture "models/images/grass.jpg"))
       m-opts #js { :map grass }
       material (new js/THREE.MeshLambertMaterial m-opts)
       width (:width mapdata) ;(config/get-terrain-width config)
       height (:height mapdata) ;(config/get-terrain-height config)
       x-faces (:x-faces mapdata) ;(get-in config [:terrain :x-faces])
       y-faces (:y-faces mapdata) ;(get-in config [:terrain :y-faces])
       data (new js/Float32Array (:data mapdata)) ;(aget mapdata "data")
       wrapping (-> js/THREE .-RepeatWrapping)
       map-repeat-width (/ width 100)
       map-repeat-height (/ height 100)
       geometry (new js/THREE.PlaneBufferGeometry width height x-faces y-faces)
       rotation (-> (new js/THREE.Matrix4) (.makeRotationX (/ (-> js/Math .-PI) -2)))
       ]
        ;(-> geometry .-position .-array
        (-> material .-map .-wrapS (set! wrapping))
        (-> material .-map .-wrapT (set! wrapping))
        (-> material .-map .-repeat (.set map-repeat-width map-repeat-height))
        (-> geometry .-attributes .-position .-array (.set data))
        ;(-> geometry (.applyMatrix rotation))
        (-> geometry .computeFaceNormals)
        (-> geometry .computeVertexNormals)
        (let
          [mesh (new THREE.Mesh geometry material)]
          (scene/add scene mesh)
          (assoc component :mesh mesh)))))

(defrecord InitGround
  [config socket scene mesh]
  component/Lifecycle
  (start [component]
    (if-not
      (and (data scene) mesh)
      (get-map component config socket scene mesh)
      component))
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
    [:config :socket :scene]))
