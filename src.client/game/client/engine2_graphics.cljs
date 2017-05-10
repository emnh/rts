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
     mesh (nth @meshes 0)
     render-targets (:render-targets graphics)
     render-target (nth render-targets 0)
     model-scene (:model-scene graphics)
     model-camera (:model-camera graphics)
     model-light (:model-light graphics)
     model-light2 (:model-light2 graphics)
     ;light1 (data (:light1 component))
     camera (data (:camera component))
     _ (-> camera .updateMatrixWorld)
     focus (scene/get-camera-focus camera 0 0)
     position (-> camera .-position .clone)
     scale (* 4 (-> mesh .-geometry .-boundingSphere .-radius))
     engine (:engine2 component)
     update-mesh (:mesh engine)]
    (-> position
      (.sub focus))
    (-> position .normalize)
    (-> position (.multiplyScalar scale))
    ; Clear scene
    (doseq
      [child (-> model-scene .-children)]
      (->
        model-scene
        (.remove child)))
    ; Add model
    (-> model-scene
      (.add mesh))
    ; Add lights
    (-> model-light
      .-position
      (.set
        (-> position .-x)
        (-> position .-y)
        (-> position .-z)))
    (-> model-scene
      (.add model-light))
    (-> model-scene
      (.add model-light2))
    ; Set camera
    (-> model-camera .-position
      (.set
        (-> position .-x)
        (-> position .-y)
        (-> position .-z)))
    (-> model-camera
      (.lookAt
        (new js/THREE.Vector3 0 0 0)))
    (-> renderer (.setClearColor (new js/THREE.Color 0xFFFFFF) 0.0))
    ;(-> renderer (.render model-scene model-camera))
    (-> renderer (.render model-scene model-camera render-target true))

    (aset
      (-> update-mesh .-material .-uniforms)
      (get-name engine2/t-model-sprite)
      #js {:value (-> render-target .-texture)})))


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
     _ (-> placeholder-geo .computeBoundingSphere)
     material (new js/THREE.MeshStandardMaterial #js {:color 0xFFFFFF})
     meshes
     (atom
       (into []
         (for
           [model resource-list]
           (new js/THREE.Mesh placeholder-geo material))))
     pars
     #js
       {
         :wrapS js/THREE.ClampToEdgeWrapping
         :wrapT js/THREE.ClampToEdgeWrapping
         :minFilter js/THREE.LinearMipMapLinearFilter
         :magFilter js/THREE.LinearFilter
         :format js/THREE.RGBAFormat}
         ;:stencilBuffer false}
     ; TODO: config
     res 256
     texture-resolution-x res
     texture-resolution-y res
     render-targets
       (into []
         (for
           [model resource-list]
           (new js/THREE.WebGLRenderTarget texture-resolution-x texture-resolution-y pars)))
     model-scene (new js/THREE.Scene)
     camera (data (:camera component))
     model-camera (-> camera .clone)
     ;model-light (new js/THREE.AmbientLight #js {:color 0x111111})
     model-light (new js/THREE.DirectionalLight #js {:color 0xFFFFFF :intensity 0.8})
     light1 (data (:light1 component))
     model-light2 (-> light1 .clone)]
    (-> model-light2 .-intensity (set! 0.8))
    (doseq
      [[index model] (map-indexed vector resource-list)]
      (m/mlet
        [geometry (:load-promise model)
         texture (:texture-load-promise model)]
        (let
          [
           material (new js/THREE.MeshStandardMaterial #js { :map texture})
           mesh (new js/THREE.Mesh geometry material)]
          (swap! meshes assoc index mesh))))
    (->
      component
      (assoc :model-meshes meshes)
      (assoc :model-scene model-scene)
      (assoc :model-camera model-camera)
      (assoc :model-light model-light)
      (assoc :model-light2 model-light2)
      (assoc :render-targets render-targets))))

(defcom
  new-engine-graphics
  [engine2 resources camera init-scene light1 init-light]
  [model-meshes
   model-scene
   model-camera
   model-light
   model-light2
   render-targets]
  (fn [component]
    (init-textures component))
  (fn [component]
    component))
