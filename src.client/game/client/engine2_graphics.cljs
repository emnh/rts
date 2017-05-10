(ns ^:figwheel-always game.client.engine2_graphics
  (:require
    [cljs.pprint :as pprint]
    [com.stuartsierra.component :as component]
    [game.client.common :as common :refer [new-jsobj list-item data unique-id]]
    [game.client.ground-local :as ground]
    [game.client.config :as config]
    [game.client.math :as math]
    [game.client.gamma_ext :as ge :refer [get-name]]
    [game.client.scene :as scene]
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
     renderer (:renderer init-renderer)
     meshes (:model-meshes graphics)
     model-scene (:model-scene graphics)
     model-camera (:model-camera graphics)]))
  

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
        (not= camera-matrix @last-camera-matrix))
      (do
        (update-textures init-renderer component)
        (reset! last-camera-matrix camera-matrix)))
    (swap! render-count inc)))

(defcom
  new-update-textures
  [camera engine2-graphics]
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
     material (new js/THREE.MeshStandardMaterial)
     meshes
     (into []
       (for
         [[index model] (map-indexed vector resource-list)]
         (new js/THREE.Mesh placeholder-geo material)))
     model-scene (new js/THREE.Scene)
     camera (data (:camera component))
     model-camera (-> camera .clone)]
    (->
      component
      (assoc :model-meshes meshes)
      (assoc :model-scene model-scene)
      (assoc :model-camera model-camera))))

(defcom
  new-engine-graphics
  [engine2 resources camera]
  [model-meshes
   model-scene
   model-camera]
  (fn [component]
    (init-textures component))
  (fn [component]
    component))
