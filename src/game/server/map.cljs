(ns ^:figwheel-always game.server.map
  (:require
    [cljs.nodejs :as nodejs]
    [hiccups.runtime :as hiccupsrt]
    [com.stuartsierra.component :as component]))


;(nodejs/enable-util-print!)

(defonce simplex (nodejs/require "simplex-noise"))
(defonce three (nodejs/require "three"))

(defrecord Noise
  [noisegen]
  component/Lifecycle
  (start [component]
    (assoc component :noisegen (new simplex)))
  (stop [component]
    component))


(defn new-noise
  []
  (map->Noise {}))

(defn default-map
  [config noise]
  (let
    [
     width (get-in config [:default-map :width])
     height (get-in config [:default-map :height])
     x-faces (get-in config [:default-map :x-faces])
     y-faces (get-in config [:default-map :y-faces])
     max-elevation (get-in config [:default-map :max-elevation])
     min-elevation (get-in config [:default-map :min-elevation])
     geometry (new three.PlaneBufferGeometry width height x-faces y-faces)
     rotation (-> (new three.Matrix4) (.makeRotationX (/ (-> js/Math .-PI) -2)))
     position (-> geometry .-attributes .-position)
     length (-> position .-count)
     _ (-> geometry (.applyMatrix rotation))
     _ (doseq
         [i (range length)]
         (let
           [x (-> position (.getX i))
            y (-> position (.getY i))
            z (-> position (.getZ i))
            y (-> (:noisegen noise) (.noise2D (/ x 100) (/ z 100)))
            y (/ (+ y 1) 2)
            y (+ (* y max-elevation) min-elevation)]

           (-> position (.setY i y))))

     map_
     {
      :width width
      :height height
      :x-faces x-faces
      :y-faces y-faces
      :data (-> position .-array .-buffer)}]


    map_))



(defrecord
  InitMap
  [map config noise]
  component/Lifecycle
  (start [component]
    (assoc component :map (default-map config noise)))
  (stop [component] component))


(defn
  new-map
  []
  (component/using
    (map->InitMap {})
    [:config :noise]))
