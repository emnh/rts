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
     width (-> mstate :scene :width)
     height (-> mstate :scene :height)]
    (.setSize renderer width height)
    (-> renderer .-shadowMap .-enabled (set! true))
    (-> renderer .-shadowMap .-soft (set! true))
    (.append ($ "body") (-> renderer .-domElement))
    mstate))
