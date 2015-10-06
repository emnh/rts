(ns ^:figwheel-always game.client.scene
  (:require [om.core :as om :include-macros true]
              [om.dom :as dom :include-macros true]
              [cljs.pprint :as pprint]
              [jayq.core :as jayq :refer [$]]
              [game.client.config :as config]
              [game.client.common :as common :refer [get-idempotent]]
              )
  (:require-macros [game.client.macros :as macros]))

(defn on-resize
  [mstate]
  (println "Resize called")
  (let
    [width (.-innerWidth js/window)
     height (.-innerHeight js/window)]
    ))

(defn initStats
  [mstate]
  (let
    [
     [renderStats mstate]
       (get-idempotent mstate [:scene :renderStats]
         #(new js/Stats))
     $renderStats ($ (-> renderStats .-domElement))
     [physicsStats mstate]
       (get-idempotent mstate [:scene :physicsStats]
         #(new js/Stats))
     $physicsStats ($ (-> physicsStats .-domElement))
     ]
    (.append ($ "body") $renderStats)
    (jayq/css
      $renderStats
      {
       :position "absolute"
       :top 0
       :z-index 100
       })
    (.append ($ "body") $physicsStats)
    (jayq/css
      $physicsStats
      {
       :position "absolute"
       :top 50
       :z-index 100
       })
    mstate))

(defn get-width
  []
  (.-innerWidth js/window))
(defn get-height
  []
  (.-innerHeight js/window))

(defn-
  get-camera-internal2
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

(macros/with-memoized-def (do
  (def get-renderer 
    #(new js/THREE.WebGLRenderer #js { :antialias true }))
  (def get-scene
    #(new js/THREE.Scene))
  (def get-$overlay
    #($ "<canvas/>"))
  (def get-raycaster
    #(new js/THREE.Raycaster))
  (def get-camera
    #(get-camera-internal2))
    ))

(println (macroexpand '(macros/with-memoized-def (do
  (def get-renderer 
    #(new js/THREE.WebGLRenderer #js { :antialias true }))
  (def get-scene
    #(new js/THREE.Scene))
  (def get-$overlay
    #($ "<canvas/>"))
  (def get-raycaster
    #(new js/THREE.Raycaster))
  (def get-camera
    #(get-camera-internal2))
    ))))

(defn add-to-scene
  [item]
  (.add (get-scene) item))

(defn initScene
  []
  (println "initscene")
  (doto
    (get-renderer)
    (#(println "renderer" %))
    (.setSize (get-width) (get-height))
    (-> .-shadowMap .-enabled (set! true))
    (-> .-shadowMap .-soft (set! true))
    (#(.append ($ "body") (-> % .-domElement)))
    (#(jayq/css
      ($ (-> % .-domElement))
      {:position "absolute"
       :top 0
       :left 0
       :z-index 0
       })))
  (doto
    (get-$overlay)
    (#(.append ($ "body") %))
    (jayq/css
      {
       :position "absolute"
       :top 0
       :left 0
       :z-index 1
       })))

(defn initLight
  [mstate]
  (let
    [
     [light1 mstate]
       (get-idempotent mstate [:scene :light1]
         #(new js/THREE.DirectionalLight))
     [light2 mstate]
       (get-idempotent mstate [:scene :light2]
         #(new js/THREE.DirectionalLight))
     [light3 mstate]
       (get-idempotent mstate [:scene :light3]
         #(new js/THREE.DirectionalLight))
     [light4 mstate]
       (get-idempotent mstate [:scene :light4]
         #(new js/THREE.DirectionalLight))
     origin (-> mstate (get-scene) .-position)
     blah nil
     ]
    ;(blah)
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
    (-> light1 .-shadowCameraLeft (set! (- (config/getTerrainWidth))))
    (-> light1 .-shadowCameraTop (set! (- (config/getTerrainHeight))))
    (-> light1 .-shadowCameraRight (set! (+ (config/getTerrainWidth))))
    (-> light1 .-shadowCameraBottom (set! (+ (config/getTerrainHeight))))
    (-> light1 .-shadowCameraNear (set! (-> (get-camera) .-near)))
    (-> light1 .-shadowCameraFar (set! (-> (get-camera) .-far)))
    (-> light1 .-shadowBias (set! -0.0001))
    (-> light1 .-shadowMapWidth (set! 2048))
    (-> light1 .-shadowMapHeight (set! 2048))
    (-> light1 .-shadowDarkness (set! 1.0))
    (add-to-scene light1)
    (add-to-scene light2)
    (add-to-scene light3)
    (add-to-scene light4)
    (-> light1 (.lookAt origin))
    (-> light2 (.lookAt origin))
    (-> light3 (.lookAt origin))
    (-> light4 (.lookAt origin))
    mstate
    ))


