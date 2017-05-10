(ns ^:figwheel-always game.client.engine2_graphics
  (:require
    [cljs.pprint :as pprint]
    [com.stuartsierra.component :as component]
    [promesa.core :as p]
    [cats.core :as m]
    [game.client.common :as common :refer [new-jsobj list-item data unique-id]]
    [game.client.ground-local :as ground]
    [game.client.config :as config]
    [game.client.math :as math]
    [game.client.gamma_ext :as ge :refer [get-name]]
    [game.client.scene :as scene]
    [game.client.engine2 :as engine2]
    [gamma.api :as g]
    [gamma.program :as gprogram]
    [clojure.string :as string]
    [gamma.compiler.core :as gamma_compiler_core :refer [transform]])

  (:require-macros [game.shared.macros :as macros :refer [defcom]]))

(defn update-textures
  [init-renderer component]
  (let
    [
     graphics (:engine2-graphics component)
     renderer (data (:renderer init-renderer))
     meshes (:model-meshes graphics)
     outline-meshes (:model-outlines graphics)
     pedestal (:pedestal graphics)
     render-target (:render-target graphics)
     model-scene (:model-scene graphics)
     model-camera (:model-camera graphics)
     model-lights (:model-lights graphics)
     ;light1 (data (:light1 component))
     camera (data (:camera component))
     _ (-> camera .updateMatrixWorld)
     focus (scene/get-camera-focus camera 0 0)
     factor 4
     engine (:engine2 component)
     update-mesh (:mesh engine)
     texture-resolution (:texture-resolution graphics)
     width texture-resolution
     height texture-resolution
     time (/ (common/game-time) 1000.0)]
    (aset
      (-> update-mesh .-material .-uniforms)
      (get-name engine2/t-model-sprite)
      #js {:value (-> render-target .-texture)})
    (doseq
      [[index [mesh outline-mesh]] (map-indexed vector (map vector @meshes @outline-meshes))]
      (let
        [scale (* factor (-> mesh .-geometry .-boundingSphere .-radius))
         scale-x
           (* factor
             (-
              (-> mesh .-geometry .-boundingBox .-max .-x)
              (-> mesh .-geometry .-boundingBox .-min .-x)))
         scale-z
           (* factor
             (-
              (-> mesh .-geometry .-boundingBox .-max .-z)
              (-> mesh .-geometry .-boundingBox .-min .-z)))
         ;outline-mesh (nth @outline-meshes index)
         position (-> camera .-position .clone)]
        (-> position
          (.sub focus))
        (-> position .normalize)
        (if
          (< (-> position .-y) 0.5)
          (-> position .-y (set! 0))
          (-> position .-y (set! 1.0)))
        (-> position .-x
          (set! (math/cos time)))
        (-> position .-z
          (set! (math/sin time)))
        (-> position (.multiplyScalar scale))
        ; Clear scene
        (doseq
          [child (-> model-scene .-children)]
          (->
            model-scene
            (.remove child)))
        ; Add pedestal
        (-> pedestal .-scale
          (.set (/ scale factor) (* 0.01 scale) (/ scale factor)))
        (-> pedestal .-position .-y
          (set!
            (+
              (-> mesh .-geometry .-boundingBox .-min .-y)
              (- (* 0.02 scale)))))
        ; (-> model-scene
        ;   (.add pedestal))
        ; Add model
        ; (-> model-scene
        ;   (.add outline-mesh))
        (-> model-scene
          (.add mesh))

        ; Add lights
        ; (-> model-light
        ;   .-position
        ;   (.set 1 0 0))
          ; (.set
          ;   (-> position .-x)
          ;   (-> position .-y)
          ;   (-> position .-z)))
        (doseq
          [model-light model-lights]
          (-> model-scene
            (.add model-light)))
        ; Set camera
        (-> model-camera .-position
          (.set
            (-> position .-x)
            (-> position .-y)
            (-> position .-z)))
        (-> model-camera
          (.lookAt
            (new js/THREE.Vector3 0 0 0)))
        (-> render-target .-viewport (.set (* index texture-resolution) 0 width height))
        (-> render-target .-scissor (.set (* index texture-resolution) 0 width height))
        (-> render-target .-scissorTest (set! true))
        (-> renderer (.setClearColor (new js/THREE.Color 0xFFFFFF) 0.0))
        ;(-> renderer (.render model-scene model-camera))
        (-> renderer (.render model-scene model-camera render-target true))))))

(defn on-render
  [init-renderer component]
  (let
    [render-count (:render-count component)
     camera (data (:camera component))
     camera-matrix (js->clj (-> camera .-matrix .toArray))
     last-camera-matrix (:last-camera-matrix component)]
    (if
      (or
        (= @render-count 0)
        (not= camera-matrix @last-camera-matrix)
        ; TODO: remove
        true)
      (do
        (update-textures init-renderer component)
        (reset! last-camera-matrix camera-matrix)))
    (swap! render-count inc)))

(defcom
  new-update-textures
  [camera engine2 engine2-graphics]
  [render-count
   last-camera-matrix]
  (fn [component]
    (->
      component
      (assoc :render-count (atom 0))
      (assoc :last-camera-matrix (atom nil))))
  (fn [component]
    component))

(defn init-textures
  [component]
  (let
    [
     resources (:resources component)
     resource-list (:resource-list resources)
     placeholder-geo (new js/THREE.BoxGeometry 1 1 1)
     _ (-> placeholder-geo .computeBoundingBox)
     _ (-> placeholder-geo .computeBoundingSphere)
     material
     (new js/THREE.MeshStandardMaterial
       #js
       {
         :color 0xFFFFFF})
     outline-material
     (new js/THREE.MeshBasicMaterial
       #js
       {
         :color 0x0000FF
         :side js/THREE.BackSide
         :depthWrite false})
     meshes
     (atom
       (into []
         (for
           [model resource-list]
           (new js/THREE.Mesh placeholder-geo material))))
     mesh-outlines
     (atom
       (into []
         (for
           [model resource-list]
           (new js/THREE.Mesh placeholder-geo outline-material))))
     pars
     #js
       {
         :wrapS js/THREE.RepeatWrapping
         :wrapT js/THREE.RepeatWrapping
         :minFilter js/THREE.LinearMipMapLinearFilter
         :magFilter js/THREE.LinearFilter
         :format js/THREE.RGBAFormat}
         ;:stencilBuffer false}
     ; TODO: config
     texture-resolution 256
     model-count (count resource-list)
     texture-resolution-x (* texture-resolution model-count)
     texture-resolution-y texture-resolution
     ;_ (-> js/console (.log texture-resolution-x))
     render-target (new js/THREE.WebGLRenderTarget texture-resolution-x texture-resolution-y pars)
     model-scene (new js/THREE.Scene)
     camera (data (:camera component))
     model-camera (-> camera .clone)
     _ (-> model-camera .-aspect (set! 1))
     ;model-light (new js/THREE.AmbientLight #js {:color 0x111111})
     intensity 0.2
     model-light1 (new js/THREE.DirectionalLight #js {:color 0xFFFFFF :intensity intensity})
     model-light2 (new js/THREE.DirectionalLight #js {:color 0xFFFFFF :intensity intensity})
     model-light3 (new js/THREE.DirectionalLight #js {:color 0xFFFFFF :intensity intensity})
     model-light4 (new js/THREE.DirectionalLight #js {:color 0xFFFFFF :intensity intensity})
     light1 (data (:light1 component))
     model-light5 (-> light1 .clone)
     ;model-lights [model-light1 model-light2 model-light3 model-light4]
     pedestal-geo (new js/THREE.BoxGeometry 1.5 1 1.5)
     pedestal-material (new js/THREE.MeshLambertMaterial #js {:color 0x0000FF})
     pedestal (new js/THREE.Mesh pedestal-geo pedestal-material)
     model-lights [model-light1 model-light2 model-light3 model-light4 model-light5]]
    (-> model-light1 .-position (.set 1 0 1))
    (-> model-light2 .-position (.set -1 0 -1))
    (-> model-light3 .-position (.set -1 0 1))
    (-> model-light4 .-position (.set 1 0 -1))
    (-> model-light5 .-intensity (set! intensity))
    (doseq
      [[index model] (map-indexed vector resource-list)]
      (m/mlet
        [geometry (:load-promise model)
         texture (:texture-load-promise model)]
        (let
          [
           material (new js/THREE.MeshLambertMaterial #js { :map texture})
           mesh (new js/THREE.Mesh geometry material)
           outline-mesh (new js/THREE.Mesh geometry outline-material)
           scale 1.1]
          (-> outline-mesh .-scale (.set scale scale scale))
          (-> mesh (.add outline-mesh))
          (swap! meshes assoc index mesh)
          (swap! mesh-outlines assoc index outline-mesh))))
    (->
      component
      (assoc :model-meshes meshes)
      (assoc :model-scene model-scene)
      (assoc :model-camera model-camera)
      (assoc :model-lights model-lights)
      (assoc :render-target render-target)
      (assoc :pedestal pedestal)
      (assoc :model-outlines mesh-outlines)
      (assoc :texture-resolution texture-resolution))))

(defcom
  new-engine-graphics
  [engine2 resources camera init-scene light1 init-light]
  [model-meshes
   model-scene
   model-camera
   model-lights
   render-target
   pedestal
   model-outlines
   texture-resolution]
  (fn [component]
    (init-textures component))
  (fn [component]
    component))
