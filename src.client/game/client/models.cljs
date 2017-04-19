(ns ^:figwheel-always game.client.models
  (:require
    [game.client.math :as math :refer [pi]]))

(def
  models
  [
   {
     :name "headquarters"
     :path "models/3d/moonbase.json"
     ;:texture-path "models/images/camouflage.jpg"
     :texture-path "models/images/castle.jpg"
     :scale 3
     :type :unit-type/building
     :opacity 1.0
     :can-attack false
     :can-move false
     :max-health 2000}

   {
     :name "castle"
     :path "models/3d/castle.json"
     :texture-path "models/images/castle.jpg"
     :scale 5
     :type :unit-type/building
     :opacity 1.0
     :can-attack false
     :can-move false
     :max-health 2000}

   {
    :name "tank-m1a1"
    :path "models/3d/tank-m1a1.json"
    :scale 0.05
    :texture-path "models/images/uv2.jpg"}
    ;:texture-path "models/images/camouflage.jpg"
    ;:texture-repeat [0.2 0.2]

   {
     :name "dragon"
     :path "models/3d/dragon.json"
     :scale 1
     :texture-path "models/images/dragon.jpg"
     :type :unit-type/air}

   {
     :name "house"
     :path "models/3d/house.json"
     :scale 0.03
     :texture-path "models/images/house.jpg"
     :type :unit-type/building
     :can-attack false
     :can-move false}

   {
     :name "ant"
     :path "models/3d/ant.json"
     :scale 10
     :rotation [0 (/ (- pi) 2) 0]
     :texture-path "models/images/ant.jpg"}

   {
     :name "tank-apc"
     :path "models/3d/tank-apc.json"
     :texture-path "models/images/camouflage.jpg"
     :scale 0.2
     :rotation [0 (/ pi 2) 0]}

   {
     :name "horse"
     :path "models/3d/horse.json"
     :scale 1.5
     :texture-path "models/images/horse.jpg"}

   {
     :name "fighter"
     :path "models/3d/fighter.json"
     :scale 3
     :rotation [0 (/ pi 2) 0]
     :texture-path "models/images/fighter.jpg"
     :type :unit-type/air}

   {
     :name "thor"
     :path "models/3d/thor.json"
     :scale 5
     :texture-path "models/images/thor.jpg"}

   {
     :name "biplane"
     :path "models/3d/biplane.json"
     :scale 1
     :rotation [0 (/ pi 2) 0]
     :texture-path "models/images/biplane.jpg"
     :type :unit-type/air}

   {
     :name "mushroom"
     :path "models/3d/mushroom.json"
     :scale 0.2
     :texture-path "models/images/mushroom.jpg"
     :type :unit-type/building
     :can-attack false
     :can-move false}

   {
     :name "farm"
     :path "models/3d/farm.json"
     :scale 500
     :texture-path "models/images/farm.jpg"
     :type :unit-type/building
     :can-attack false
     :can-move false}

   {
     :name "missile"
     :path "models/3d/missile.json"
     :scale 3
     :texture-path "models/images/missile.jpg"
     :type :unit-type/missile}

   {
     :name "crystal"
     :path "models/3d/crystal.json"
     :scale 2
     :texture-path "models/images/crystal.jpg"
     :type :unit-type/resource
     :opacity 1.0
     :can-attack false
     :can-move false}])




(def models-dinosaurs
  [
   {
     :name "tyrannosaurus"
     :path "models-dinosaurs/3d/tyrannosaurus.json"
     ;:texture-path "models/images/uv2.jpg"
     ;:texture-path "models/images/castle.jpg"
     :texture-path "models/images/fighter.jpg"
     :rotation [(/ pi -2) 0 (/ pi 2)]}

   {
     :name "triceratops"
     :path "models-dinosaurs/3d/triceratops.json"
     ;:texture-path "models/images/colormap.jpg"
     :texture-path "models/images/ant.jpg"
     :rotation [(/ pi -2) 0 (/ pi 2)]}

   {
     :name "tusk"
     :path "models-dinosaurs/3d/tusk.json"
     :texture-path "models/images/fighter.jpg"
     :rotation [(/ pi -2) 0 (/ pi 2)]}

   {
     :name "otter"
     :path "models-dinosaurs/3d/otter.json"
     ;:texture-path "models/images/colormap.jpg"
     :texture-path "models/images/biplane.jpg"
     :rotation [(/ pi -2) 0 (/ pi 2)]}

   {
     :name "pachycephalosaurus"
     :path "models-dinosaurs/3d/pachycephalosaurus.json"
     :texture-path "models/images/blue.jpg"
     :rotation [(/ pi -2) 0 (/ pi 2)]}

   {
     :name "bahamas"
     :path "models-dinosaurs/3d/bahamas.json"
     :texture-path "models/images/uv.png"
     :rotation [(/ pi -2) 0 (/ pi 2)]}

   {
     :name "dentist"
     :path "models-dinosaurs/3d/dentist.json"
     :texture-path "models/images/colormap.jpg"
     :rotation [(/ pi -2) 0 (/ pi 2)]}

   {
     :name "waterhead"
     :path "models-dinosaurs/3d/waterhead.json"
     :texture-path "models/images/dragon.jpg"
     :rotation [(/ pi -2) 0 (/ pi 2)]}

   {
     :name "undead"
     :path "models-dinosaurs/3d/undead.json"
     :texture-path "models/images/uv2.jpg"
     :rotation [(/ pi -2) 0 (/ pi 2)]}

   {
     :name "colomb"
     :path "models-dinosaurs/3d/colomb.json"
     :texture-path "models/images/colormap.jpg"
     :rotation [(/ pi -2) 0 (/ pi 2)]}

   {
     :name "earthling"
     :path "models-dinosaurs/3d/earthling.json"
     :texture-path "models/images/ant.jpg"
     :rotation [(/ pi -2) 0 (/ pi 2)]}

   {
     :name "rocker"
     :path "models-dinosaurs/3d/rocker.json"
     :texture-path "models/images/blue.jpg"
     :rotation [(/ pi -2) 0 (/ pi 2)]}

   {
     :name "ballista"
     :path "models-dinosaurs/3d/ballista.json"
     :texture-path "models/images/starsky.jpg"
     :rotation [(/ pi -2) 0 (/ pi 2)]}

   {
     :name "spyglass"
     :path "models-dinosaurs/3d/spyglass.json"
     :texture-path "models/images/mushroom.jpg"
     :rotation [(/ pi -2) 0 (/ pi 2)]}

   {
     :name "cancer"
     :path "models-dinosaurs/3d/cancer.json"
     :texture-path "models/images/horse.jpg"
     :rotation [(/ pi -2) 0 (/ pi 2)]}

   {
     :name "swordsman"
     :path "models-dinosaurs/3d/swordsman.json"
     :texture-path "models/images/biplane.jpg"
     :rotation [(/ pi -2) 0 (/ pi 2)]}

   {
     :name "bug"
     :path "models-dinosaurs/3d/bug.json"
     :texture-path "models/images/uv2.jpg"
     :rotation [(/ pi -2) 0 (/ pi 2)]}])



(def defaults
  {
   :scale 1
   :rotation [0 0 0]
   ; TODO: post-rotation and post-scale are just temporary hacks
   :post-rotation [0 0 0]
   :post-scale 1
   ;:texture-path "models/images/colormap.jpg"
   :texture-path "models/images/grayscale.png"
   :texture-repeat [1 1]
   :opacity 1
   :type :unit-type/ground
   :move-speed 1
   :can-attack true
   :can-move true
   :max-health 100})


(defn get-models
  []
  ;(map #(merge defaults %) (concat models models-dinosaurs))
  (map #(merge defaults %) (list (nth models-dinosaurs 3))))

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

(defn post-transform-geometry
  [model geo]
  (let
    [mat (new js/THREE.Matrix4)
     scale (:post-scale model)]
    (-> mat (.makeRotationX (nth (:post-rotation model) 0)))
    (-> geo (.applyMatrix mat))
    (-> mat (.makeRotationY (nth (:post-rotation model) 1)))
    (-> geo (.applyMatrix mat))
    (-> mat (.makeRotationZ (nth (:post-rotation model) 2)))
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
