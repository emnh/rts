(ns ^:figwheel-always game.scene
  (:require [om.core :as om :include-macros true]
              [om.dom :as dom :include-macros true]
              [cljs.pprint :as pprint]
              [jayq.core :as jayq :refer [$]]
              [game.config :as config]
              [game.common :as common]
              )
  (:use
    [game.common :only (get-idempotent)]))

(defn onResize
  [mstate]
  (println "Resize called")
  (let
    [width (.-innerWidth js/window)
     height (.-innerHeight js/window)]
    (-> mstate
      (assoc-in [:scene :width] width)
      (assoc-in [:scene :height] height))))

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
    addToScene (-> mstate :scene :addToScene)
    origin (-> mstate :scene :scene3 .-position)
     ]
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
    (-> light1 .-shadowCameraNear (set! (-> mstate :scene :camera .-near)))
    (-> light1 .-shadowCameraFar (set! (-> mstate :scene :camera .-far)))
    (-> light1 .-shadowBias (set! -0.0001))
    (-> light1 .-shadowMapWidth (set! 2048))
    (-> light1 .-shadowMapHeight (set! 2048))
    (-> light1 .-shadowDarkness (set! 1.0))
    (addToScene light1)
    (addToScene light2)
    (addToScene light3)
    (addToScene light4)
    (-> light1 (.lookAt origin))
    (-> light2 (.lookAt origin))
    (-> light3 (.lookAt origin))
    (-> light4 (.lookAt origin))
    mstate
    ))

(defn initScene
  [mstate]
  (pprint/pprint ["mstate" mstate])
  (let
     [
      [renderer mstate]
        (get-idempotent mstate [:scene :renderer]
          #(new js/THREE.WebGLRenderer #js { :antialias true }))
      [scene mstate]
        (get-idempotent mstate [:scene :scene3]
          #(new js/THREE.Scene))
      [$overlay mstate]
        (get-idempotent mstate [:scene :$overlay]
          #($ "<canvas/>"))
      [raycaster mstate]
        (get-idempotent mstate [:scene :raycaster]
          #(new js/THREE.Raycaster))
      width (-> mstate :scene :width)
      height (-> mstate :scene :height)
      FOV 35
      frustumFar 1000000
      frustumNear 1
      [camera mstate]
        (get-idempotent mstate [:scene :camera]
          #(new js/THREE.PerspectiveCamera FOV width / height frustumNear frustumFar))
      addToScene #(.add scene %)
      mstate (assoc-in mstate [:scene :addToScene] addToScene)
      ]
    (.setSize renderer width height)
    (-> renderer .-shadowMap .-enabled (set! true))
    (-> renderer .-shadowMap .-soft (set! true))
    (.append ($ "body") (-> renderer .-domElement))
    (jayq/css
      ($ (-> renderer .-domElement))
      {:position "absolute"
       :top 0
       :left 0
       :z-index 0
       })
    (.append ($ "body") $overlay)
    (jayq/css
      $overlay
      {
       :position "absolute"
       :top 0
       :left 0
       :z-index 1
       })
    (addToScene camera)
    mstate))
