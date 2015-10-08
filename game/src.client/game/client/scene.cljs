(ns ^:figwheel-always game.client.scene
  (:require 
    [cljs.pprint :as pprint]
    [jayq.core :as jayq :refer [$]]
    [game.client.config :as config]
    [game.client.common :as common :refer [data]]
    [com.stuartsierra.component :as component]
    )
  (:require-macros [game.client.macros :as macros :refer [defm]])
  (:refer-clojure :exclude [remove]))

(enable-console-print!)

(defn on-resize
  [onresize event]
  (println "Resize called")
  (let
    [
     config (:config onresize)
     width (.-innerWidth js/window)
     height (- (.-innerHeight js/window) (get-in config [:dom :controls-height]))
     scene (data (:renderer onresize))
     scene (data (:scene onresize))
     camera (data (:camera onresize))
     renderer (data (:renderer onresize))
     $overlay (data (:$overlay onresize))
     ]
    (-> ($ (-> renderer .-domElement)) (.width width))
    (-> ($ (-> renderer .-domElement)) (.height height))
    (-> camera .-aspect (set! (/ width height)))
    (-> camera .updateProjectionMatrix)
    (-> renderer (.setSize width height))
    (-> $overlay .-width (set! width))
    (-> $overlay .-height (set! height))
    ))

(defrecord OnResize
  [config scene camera renderer]
  component/Lifecycle
  (start [component]
    (on-resize component nil)
    (-> ($ js/window)
      (.unbind "resize.gameResize")
      (.bind "resize.gameResize" (partial on-resize component)))
    component)
  (stop [component]
    (-> ($ js/window)
      (.unbind "resize.gameResize"))
    component))

(defn new-on-resize
  []
  (component/using
    (map->OnResize {})
    [:config :scene :camera :renderer :$overlay]))

(defrecord InitStats [render-stats physics-stats]
  component/Lifecycle
  (start [component]
    (let
      [
       render-stats (data render-stats)
       physics-stats (data physics-stats)
       $render-stats ($ (-> render-stats .-domElement))
       $physics-stats ($ (-> physics-stats .-domElement))
       ]
      (.append ($ "body") $render-stats)
      (jayq/css
        $render-stats
        {
         :position "absolute"
         :top 0
         :z-index 100
         })
      (.append ($ "body") $physics-stats)
      (jayq/css
        $physics-stats
        {
         :position "absolute"
         :top 50
         :z-index 100
         })
      component))
  (stop [component] component))

(defn new-init-stats
  []
  (component/using
    (map->InitStats {})
    [:render-stats :physics-stats]))

(defn get-width
  []
  (.-innerWidth js/window))
(defn get-height
  []
  (.-innerHeight js/window))

(defn add
  [scene item]
  (.add (data scene) item))

(defn remove
  [scene item]
  (.remove (data scene) item))

(defrecord InitScene
  [renderer $overlay camera scene config done]
  component/Lifecycle
  (start [component] 
    (if-not done
      (do
        (doto
          (data renderer)
          (.setSize (get-width) (get-height))
          (-> .-shadowMap .-enabled (set! true))
          (-> .-shadowMap .-soft (set! true))
          (#(.append ($ "body") (-> % .-domElement)))
          (#(-> ($ (-> % .-domElement)) (.addClass "page-game")))
          (#(jayq/css
            ($ (-> % .-domElement))
            {:position "absolute"
             :top 0
             :left 0
             :z-index 0
             })))
        (doto
          (data $overlay)
          (#(.append ($ "body") %))
          (.addClass "page-game")
          (jayq/css
            {
             :position "absolute"
             :top 0
             :left 0
             :z-index 1
             }))
        (add scene (data camera))
        (-> (data camera) .-position (.copy (get-in config [:controls :origin])))
        (let
          [x (-> (data scene) .-position .-x)
           y (-> (data scene) .-position .-y)
           z (-> (data scene) .-position .-z)
           pos (new THREE.Vector3 x y z)]
          (-> (data camera) (.lookAt pos)))
        (assoc component :done true))
      component))
  (stop [component]
    (-> ($ "body") (.remove ".page-game"))
    component)
  )

(defn new-init-scene []
  (component/using
    (map->InitScene {})
    [:renderer :$overlay :camera :scene :config]))

; TODO
;(defconstructor new-initscene map->InitScene)

(defn get-camera
  []
  (let
     [
      width (get-width)
      height (get-height)
      FOV 35
      frustumFar 1000000
      frustumNear 1
      ]
      (new js/THREE.PerspectiveCamera FOV (/ width height) frustumNear frustumFar)))

(defrecord InitLight [config scene light1 light2 light3 light4]
  component/Lifecycle
  (start [component]
    (let
      [
       light1 (data light1)
       light2 (data light2)
       light3 (data light3)
       light4 (data light4)
       origin (-> (data scene) .-position)
       ]
      (-> light1 .-color (set! (new js/THREE.Color 0xAAAAAA)))
      (-> light2 .-color (set! (new js/THREE.Color 0x00FF00)))
      (-> light3 .-color (set! (new js/THREE.Color 0x0000FF)))
      (-> light4 .-color (set! (new js/THREE.Color 0x220000)))
      (-> light1 .-position (.set 5 10 -4))
      (-> light2 .-position (.set 5 0 -4))
      (-> light3 .-position (.set -10 10 10))
      (-> light4 .-position (.set 0 10 0))
      (-> light1 .-target .-position (.copy origin))
      (-> light2 .-target .-position (.copy origin))
      (-> light3 .-target .-position (.copy origin))
      (-> light4 .-target .-position (.copy origin))
      (-> light1 .-castShadow (set! true))
      (-> light2 .-castShadow (set! true))
      (-> light3 .-castShadow (set! true))
      (-> light4 .-castShadow (set! true))
      (-> light1 .-shadowCameraLeft (set! (- (config/get-terrain-width config))))
      (-> light1 .-shadowCameraTop (set! (- (config/get-terrain-height config))))
      (-> light1 .-shadowCameraRight (set! (+ (config/get-terrain-width config))))
      (-> light1 .-shadowCameraBottom (set! (+ (config/get-terrain-height config))))
      (-> light1 .-shadowCameraNear (set! (-> (get-camera) .-near)))
      (-> light1 .-shadowCameraFar (set! (-> (get-camera) .-far)))
      (-> light1 .-shadowBias (set! -0.0001))
      (-> light1 .-shadowMapWidth (set! 2048))
      (-> light1 .-shadowMapHeight (set! 2048))
      (-> light1 .-shadowDarkness (set! 1.0))
      (add scene light1)
      (add scene light2)
      (add scene light3)
      (add scene light4)
      (-> light1 (.lookAt origin))
      (-> light2 (.lookAt origin))
      (-> light3 (.lookAt origin))
      (-> light4 (.lookAt origin))
      )
    component)
  (stop [component]
    (if
      (not= (data scene) nil)
      (do
        (remove scene light1)
        (remove scene light2)
        (remove scene light3)
        (remove scene light4)))
    component))

(defn new-init-light
  []
  (component/using
    (map->InitLight {})
    [:config :scene :light1 :light2 :light3 :light4]))

(defn get-view-element
  [renderer]
  (-> (data renderer) .-domElement)
  )

(defn get-camera-focus
  [camera x y]
  (let
    [v (new js/THREE.Vector3 x y (-> camera .-near))
     _ (-> v (.unproject camera))
     dir (-> v (.sub (-> camera .-position)) .normalize)
     distance (/ (- (-> camera .-position .-y)) (-> dir .-y))
     pos (-> (-> camera .-position .clone) (.add (-> dir (.multiplyScalar distance))))
     ]
    pos))
