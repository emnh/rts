(ns ^:figwheel-always game.client.voxelize
  (:require
    [cljs.pprint :as pprint]
    [com.stuartsierra.component :as component]
    [promesa.core :as p]
    [cats.core :as m]
    [game.client.math :as math]
    )
  (:require-macros
    [infix.macros :refer [infix]]
    [game.shared.macros :as macros :refer [defcom]])
  )

(def int32-size-bytes 4)
(def int32-size-bits 32)
(def all-bits-set -1)
(def box-vertices 12)
(def v3-size 3)
(def triangle-size 3)
(def billboard-corners 4)

; Based on http://drububu.com/miscellaneous/voxelizer/index.html

(defn
  voxelize-output
  "Returns geometry of cubes representing voxels"
  [voxel-dict]
  (let
    [new-geometry (new js/THREE.Geometry)
     bgeo (new js/THREE.BufferGeometry)
     voxel-count (:voxel-count voxel-dict)
     voxel-width (:voxel-width voxel-dict)
     voxel-height (:voxel-height voxel-dict)
     voxel-depth (:voxel-depth voxel-dict)
     box (new js/THREE.BoxGeometry voxel-width voxel-height voxel-depth)
     min-offset-x (:offset-x voxel-dict)
     min-offset-y (:offset-y voxel-dict)
     min-offset-z (:offset-z voxel-dict)
     voxels (:voxels voxel-dict)
     total-voxels (* voxel-count voxel-count voxel-count)
     box-indices #js []
     box-translations #js []
     billboard-coords #js []
     ]
    (doseq
      [index (range total-voxels)]
      (let
        [
         index-main (quot index int32-size-bits)
         index-bit (mod index int32-size-bits)
         int32 (aget voxels index-main)
         bit (bit-and int32 (bit-shift-left 1 index-bit))
         voxel-set? (not= 0 bit)]
        (if voxel-set?
          (let
            [x-index (mod index voxel-count)
             yz-index (quot index voxel-count)
             y-index (mod yz-index voxel-count)
             z-index (quot yz-index voxel-count)
             x-offset-centre (infix min-offset-x + (x-index + 0.5) * voxel-width)
             y-offset-centre (infix min-offset-y + (y-index + 0.5) * voxel-height)
             z-offset-centre (infix min-offset-z + (z-index + 0.5) * voxel-depth)
             x-offset (infix min-offset-x + (x-index + 0.0) * voxel-width)
             y-offset (infix min-offset-y + (y-index + 0.0) * voxel-height)
             z-offset (infix min-offset-z + (z-index + 0.0) * voxel-depth)
             box-clone (-> box .clone)
             mat (new js/THREE.Matrix4)
             ]
            ; TODO: use instanced attributes
            (doseq
              [i (range (* box-vertices triangle-size))]
              (-> box-translations (.push x-offset-centre))
              (-> box-translations (.push y-offset-centre))
              (-> box-translations (.push z-offset-centre))
              (-> box-indices (.push index)))
            (doseq
              [i (range (* (/ box-vertices billboard-corners) triangle-size))]
              (-> billboard-coords (.push -0.5))
              (-> billboard-coords (.push -0.5))
              (-> billboard-coords (.push 0.0))
              (-> billboard-coords (.push 0.5))
              (-> billboard-coords (.push -0.5))
              (-> billboard-coords (.push 0.0))
              (-> billboard-coords (.push -0.5))
              (-> billboard-coords (.push 0.5))
              (-> billboard-coords (.push 0.0))
              (-> billboard-coords (.push 0.5))
              (-> billboard-coords (.push 0.5))
              (-> billboard-coords (.push 0.0)))
            (-> mat (.makeTranslation x-offset y-offset z-offset))
            (-> new-geometry (.merge box-clone mat))
            ))))
    (-> bgeo (.fromGeometry new-geometry))
    (let
      [box-indices (new js/Float32Array box-indices)
       box-indices-attr (new js/THREE.BufferAttribute box-indices 1)
       box-translations (new js/Float32Array box-translations)
       box-translations-attr (new js/THREE.BufferAttribute box-translations 3)
       billboard-coords (new js/Float32Array billboard-coords)
       billboard-coords-attr (new js/THREE.BufferAttribute billboard-coords 3)
       ]
      (-> bgeo (.addAttribute "boxIndex" box-indices-attr))
      (-> bgeo (.addAttribute "boxTranslation" box-translations-attr))
      (-> bgeo (.addAttribute "billboardCoord" billboard-coords-attr)))
    bgeo))

(defn
  is-set?
  [voxels voxel-count x y z]
  (let
    [index (infix (x + voxel-count * (y + voxel-count * z)))
     index-main (quot index int32-size-bits)
     index-bit (mod index int32-size-bits)
     int32 (aget voxels index-main)
     bit (bit-and int32 (bit-shift-left 1 index-bit))
     ]
    (not= 0 bit)))

(defn
  set-unset-voxel
  [voxels voxel-count x y z f]
  (let
    [index (infix (x + voxel-count * (y + voxel-count * z)))
     index-main (quot index int32-size-bits)
     index-bit (mod index int32-size-bits)
     int32 (aget voxels index-main)
     new-value (f int32 index-bit)
     ]
    (aset voxels index-main new-value)))

(defn
  set-voxel
  [voxels voxel-count x y z]
  (set-unset-voxel voxels voxel-count x y z bit-set))

(defn
  unset-voxel
  [voxels voxel-count x y z]
  (set-unset-voxel voxels voxel-count x y z bit-clear))

(defn fill-inside
  [voxel-dict]
  (let
    [
     voxel-count (:voxel-count voxel-dict)
     voxel-width (:voxel-width voxel-dict)
     voxel-height (:voxel-height voxel-dict)
     voxel-depth (:voxel-depth voxel-dict)
     min-offset-x (:offset-x voxel-dict)
     min-offset-y (:offset-y voxel-dict)
     min-offset-z (:offset-z voxel-dict)
     voxels (:voxels voxel-dict)
     voxels-size (-> voxels .-length)
     new-voxels (new js/Int32Array voxels-size)
     _ (-> new-voxels (.fill all-bits-set))
     flood-fill
     (fn
       flood-fill
       [x y z]
       (if
         (and
           (not (is-set? voxels voxel-count x y z))
           (is-set? new-voxels voxel-count x y z))
         (let
           [neighbours
            [
             ; 6-neighbours, sharing a voxel face
             (if (< (inc x) voxel-count) [(inc x) y z])
             (if (>= (dec x) 0) [(dec x) y z])
             (if (< (inc y) voxel-count) [x (inc y) z])
             (if (>= (dec y) 0) [x (dec y) z])
             (if (< (inc z) voxel-count) [x y (inc z)])
             (if (>= (dec z) 0) [x y (dec z)])
             ]
            neighbours (remove nil? neighbours)]
           (unset-voxel new-voxels voxel-count x y z)
           (doseq
             [[x y z] neighbours]
             (flood-fill x y z)))))
     ]
    ; do flood fill starting from all 6 faces
    ; just in case the voxels are touching the faces
    (doseq
      [x (range voxel-count)
       y (range voxel-count)
       border [0 (dec voxel-count)]]
      (flood-fill x y border)
      (flood-fill x border y)
      (flood-fill border x y))
    (assoc voxel-dict :voxels new-voxels)))

(defn
  voxelize-geometry
  "Returns bit-array of voxels of size voxel-count^3 containing voxelized
  geometry"
  [geometry voxel-count]
  (let
    [position (-> geometry (.getAttribute "position"))
     array (-> position .-array)
     attr-size (* v3-size triangle-size)
     triangle-count (/ (-> position .-count) triangle-size)
     _ (println "triangle-count" triangle-count)
     bbox (-> geometry .-boundingBox)
     width (- (-> bbox .-max .-x) (-> bbox .-min .-x))
     height (- (-> bbox .-max .-y) (-> bbox .-min .-y))
     depth (- (-> bbox .-max .-z) (-> bbox .-min .-z))
     voxel-width (/ width voxel-count)
     voxel-height (/ height voxel-count)
     voxel-depth (/ depth voxel-count)
     voxel-min-dimension (min voxel-width voxel-height voxel-depth)
     voxels-size (math/ceil (/ (* voxel-count voxel-count voxel-count) int32-size-bits))
     voxels (new js/Int32Array voxels-size)
     touch-voxel
     (fn
       [v]
       (let
         [x-offset (- (-> v .-x) (-> bbox .-min .-x))
          y-offset (- (-> v .-y) (-> bbox .-min .-y))
          z-offset (- (-> v .-z) (-> bbox .-min .-z))
          x-index (infix (math/floor (x-offset / voxel-width)))
          x-index (if (= x-index voxel-count) (dec x-index) x-index)
          y-index (infix (math/floor (y-offset / voxel-height)))
          y-index (if (= y-index voxel-count) (dec y-index) y-index)
          z-index (infix (math/floor (z-offset / voxel-depth)))
          z-index (if (= z-index voxel-count) (dec z-index) z-index)
          ]
         (set-voxel voxels voxel-count x-index y-index z-index)))
     voxelize-triangle
     (fn
       voxelize-triangle
       [v1 v2 v3]
       (let
         [v12 (-> v2 .clone (.sub v1))
          v23 (-> v3 .clone (.sub v2)) 
          v13 (-> v3 .clone (.sub v1))
          v12-length (-> v12 .length)
          v23-length (-> v23 .length)
          v13-length (-> v13 .length)
          limit (/ voxel-min-dimension 10.0)
          ]
         (if
           (infix (v12-length >= limit) ||
                  (v23-length >= limit) ||
                  (v13-length >= limit))
           (let
             [v12-mid (-> v12 (.divideScalar 2.0) (.add v1))
              v23-mid (-> v23 (.divideScalar 2.0) (.add v2))
              v13-mid (-> v13 (.divideScalar 2.0) (.add v1))]
             (voxelize-triangle v1 v12-mid v13-mid)
             (voxelize-triangle v2 v12-mid v23-mid)
             (voxelize-triangle v3 v13-mid v23-mid)
             (voxelize-triangle v12-mid v23-mid v13-mid))
           (do
             (touch-voxel v1)
             (touch-voxel v2)
             (touch-voxel v3)))))
     ]
    (doseq [i (range triangle-count)]
      (if (= 0 (mod i (max 1 (quot triangle-count 100))))
        (println "%:" (* 100 (/ i triangle-count))))
      (let
        [index (* i attr-size)
         v1 (new js/THREE.Vector3
                 (aget array (+ index 0))
                 (aget array (+ index 1))
                 (aget array (+ index 2)))
         v2 (new js/THREE.Vector3
                 (aget array (+ index 3))
                 (aget array (+ index 4))
                 (aget array (+ index 5)))
         v3 (new js/THREE.Vector3
                 (aget array (+ index 6))
                 (aget array (+ index 7))
                 (aget array (+ index 8)))
         ]
        (voxelize-triangle v1 v2 v3)))
    {
     :voxels voxels
     :offset-x (-> bbox .-min .-x)
     :offset-y (-> bbox .-min .-y)
     :offset-z (-> bbox .-min .-z)
     :voxel-count voxel-count
     :voxel-width voxel-width
     :voxel-height voxel-height
     :voxel-depth voxel-depth
     }))
