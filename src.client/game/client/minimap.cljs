(ns ^:figwheel-always game.client.minimap
  (:require
    [cljs.pprint :as pprint]
    [com.stuartsierra.component :as component]
    [jayq.core :as jayq :refer [$]]
    [game.client.math :as math :refer [floor isNaN]]
    [game.client.common :as common :refer [data]]
    [game.client.config :as config]
    [game.client.scene :as scene])
  (:require-macros
    [infix.macros :refer [infix]]
    [game.shared.macros :as macros :refer [defcom]]))

(defn on-render
  [init-renderer component]
  (let
    [
      renderer (:minimap-renderer component)
      scene (data (:scene init-renderer))
      minimap-camera (:minimap-camera component)
      units (:units component)
      units-container (:units-container units)
      units-minimap-container (:units-minimap-container units)
      left 0
      bottom 0
      width (:width component)
      height (:height component)]
    (-> renderer (.setViewport left bottom width height))
    (-> renderer (.setScissor left bottom width height))
    (-> renderer (.setScissorTest true))
    (-> renderer (.setClearColor 0x000000))
    (-> units-container .-visible (set! false))
    (-> units-minimap-container .-visible (set! true))
    (-> renderer (.render scene minimap-camera))
    (-> units-container .-visible (set! true))
    (-> units-minimap-container .-visible (set! false))))

(defcom
  new-minimap
  [config params camera scene init-scene units renderer]
  [minimap-camera minimap-renderer width height]
  (fn [component]
    (if-not
      (:started component)
      (do
        (let
          [minimap-camera (-> (data camera) .clone)
           ;minimap-renderer (new js/THREE.WebGLRenderer #js { :antialias true})
           minimap-renderer (data renderer)
           width 200
           height 200
           fov (-> (data camera) .-fov)
           terrain-width (get-in config [:terrain :width])
           terrain-width-plus-border (* terrain-width 1.05)
           ydist
            (/
              terrain-width-plus-border
              (* 2.0 (math/tan (/ (* fov math/pi) 360.0))))]
          (-> minimap-camera .-position (.set 0 ydist 0))
          (-> minimap-camera .-rotation (.set (/ math/pi -2.0) 0.0 0.0))
          (-> minimap-camera .-aspect (set! (/ width height)))
          (-> minimap-camera .updateProjectionMatrix)
          (scene/add scene minimap-camera)
          ;(-> minimap-renderer (.setSize width height))
          ;(.append (:$page params) (-> minimap-renderer .-domElement))
          ;(doto
          ;  ($ (-> minimap-renderer .-domElement))
          ;  (.width 200)
          ;  (.height 200)
          ;  (.addClass scene/page-class)
          ;  (.addClass "minimap"))
          (-> component
            (assoc :minimap-camera minimap-camera)
            (assoc :minimap-renderer minimap-renderer)
            (assoc :width width)
            (assoc :height height))))
      (do
        (.append (:$page params) (-> minimap-renderer .-domElement))
        component)))
  (fn [component]
    component))
