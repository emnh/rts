(ns ^:figwheel-always game.scene
    (:require [om.core :as om :include-macros true]
              [om.dom :as dom :include-macros true]
              [cljs.pprint :as pprint]
              [jayq.core :as jayq :refer [$]]))

(defn onResize
  [mstate]
  (println "Resize called")
  (let
    [width (.-innerWidth js/window)
     height (.-innerHeight js/window)]
    (-> mstate
      (assoc-in [:scene :width] width)
      (assoc-in [:scene :height] height))))

(defn get-idempotent
  [mstate path f]
  (let
    [newVal
     (if-let
      [oldVal (get-in mstate path)]
      oldVal
      (f))
     mstate (assoc-in mstate path newVal)
     ]
    [newVal mstate]))

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
      height (-> mstate :scene :height)]
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
    mstate))
