(ns ^:figwheel-always game.client.models
  (:require
    [game.client.math :as math :refer [pi]]))

(def
  models
  [
   {
     :name "headquarters"
     :path "models/3d/moonbase.json"
     :scale 3
     :type :unit-type/building
     :opacity 1.0
     :can-attack false
     :can-move false
     :max-health 2000
   }
   {
     :name "castle"
     :path "models/3d/castle.json"
     :texture-path "models/images/castle.jpg"
     :scale 5
     :type :unit-type/building
     :opacity 1.0
     :can-attack false
     :can-move false
     :max-health 2000
   }
   {
    :name "tank-m1a1"
    :path "models/3d/tank-m1a1.json"
    :scale 0.05
    :texture-path "models/images/camouflage.jpg"
    :texture-repeat [0.2 0.2]
    }
   {
     :name "dragon"
     :path "models/3d/dragon.json"
     :scale 1
     :texture-path "models/images/dragon.jpg"
     :type :unit-type/air
   }
   {
     :name "house"
     :path "models/3d/house.json"
     :scale 0.03
     :texture-path "models/images/house.jpg"
     :type :unit-type/building
     :can-attack false
     :can-move false
   }
   {
     :name "ant"
     :path "models/3d/ant.json"
     :scale 10
     :rotation [0 (/ (- pi) 2) 0]
     :texture-path "models/images/ant.jpg"
   }
   {
     :name "tank-apc"
     :path "models/3d/tank-apc.json"
     :scale 0.2
     :rotation [0 (/ pi 2) 0]
   }
   {
     :name "horse"
     :path "models/3d/horse.json"
     :scale 1.5
     :texture-path "models/images/horse.jpg"
   }
   {
     :name "fighter"
     :path "models/3d/fighter.json"
     :scale 3
     :rotation [0 (/ pi 2) 0]
     :texture-path "models/images/fighter.jpg"
     :type :unit-type/air
   }
   {
     :name "thor"
     :path "models/3d/thor.json"
     :scale 5
     :texture-path "models/images/thor.jpg"
   }
   {
     :name "biplane"
     :path "models/3d/biplane.json"
     :scale 1
     :rotation [0 (/ pi 2) 0]
     :texture-path "models/images/biplane.jpg"
     :type :unit-type/air
   }
   {
     :name "mushroom"
     :path "models/3d/mushroom.json"
     :scale 0.2
     :texture-path "models/images/mushroom.jpg"
     :type :unit-type/building
     :can-attack false
     :can-move false
   }
   {
     :name "farm"
     :path "models/3d/farm.json"
     :scale 500
     :texture-path "models/images/farm.jpg"
     :type :unit-type/building
     :can-attack false
     :can-move false
   }
   {
     :name "missile"
     :path "models/3d/missile.json"
     :scale 3
     :texture-path "models/images/missile.jpg"
     :type :unit-type/missile
   }
   {
     :name "crystal"
     :path "models/3d/crystal.json"
     :scale 2
     :texture-path "models/images/crystal.jpg"
     :type :unit-type/resource
     :opacity 1.0
     :can-attack false
     :can-move false
   }
   ]
  )

(def defaults
  {
    :scale 1
    :rotation [0 0 0]
    :texture-path "models/images/camouflage.jpg"
    :texture-repeat [1 1]
    :opacity 1
    :type :unit-type/ground
    :move-speed 1
    :can-attack true
    :can-move true
    :max-health 100
    })

(defn get-models
  []
  (map #(merge defaults %) models))

(defn transform-geometry
  [model geo]
  (let
    [mat (new js/THREE.Matrix4)
     scale (:scale model)]
    (-> mat (.makeRotationX (nth (:rotation model) 0)))
    (-> geo (.applyMatrix mat))
    (-> mat (.makeRotationY (nth (:rotation model) 1)))
    (-> geo (.applyMatrix mat))
    (-> mat (.makeRotationZ (nth (:rotation model) 2)))
    (-> geo (.applyMatrix mat))
    (-> mat (.makeScale scale scale scale))
    (-> geo (.applyMatrix mat))
    ;(-> geo (.computeBoundingBox))
    (-> geo (.center))
    (-> geo (.computeBoundingBox))
    (-> geo (.computeBoundingSphere))
    (-> geo (.computeFaceNormals))
    (-> geo (.computeVertexNormals))
    geo))
