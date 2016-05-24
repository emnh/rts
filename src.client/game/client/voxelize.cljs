; vim: foldmethod=marker
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
(def box-faces 12)
(def v2-size 2)
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
     inc-voxel-count (inc voxel-count)
     voxel-width (:voxel-width voxel-dict)
     voxel-height (:voxel-height voxel-dict)
     voxel-depth (:voxel-depth voxel-dict)
     box (new js/THREE.BoxGeometry voxel-width voxel-height voxel-depth)
     one-box (new js/THREE.BoxGeometry 1 1 1)
     _ (-> one-box (.translate 0.5 0.5 0.5))
     min-offset-x (:offset-x voxel-dict)
     min-offset-y (:offset-y voxel-dict)
     min-offset-z (:offset-z voxel-dict)
     voxels (:voxels voxel-dict)
     total-voxels (* voxel-count voxel-count voxel-count)
     box-indices #js []
     box-translations #js []
     billboard-coords #js []
     uvs (:uvs voxel-dict)
;     _ (.log js/console "uvs" uvs)
     get-index (fn [x y z] (infix (x + voxel-count * (y + voxel-count * z))))
     inc-get-index (fn [x y z] (infix (x + inc-voxel-count * (y + inc-voxel-count * z))))
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
             face-vertex-uvs (aget (-> box-clone .-faceVertexUvs) 0)
             mat (new js/THREE.Matrix4)
             ]
            ; TODO: use instanced attributes
            (doseq
              [[i face] (map-indexed vector (-> one-box .-faces))]
              (let
                [a (-> face .-a)
                 b (-> face .-b)
                 c (-> face .-c)
                 av (aget (-> one-box .-vertices) a)
                 bv (aget (-> one-box .-vertices) b)
                 cv (aget (-> one-box .-vertices) c)
                 a-uv-index (inc-get-index 
                              (+ x-index (-> av .-x))
                              (+ y-index (-> av .-y))
                              (+ z-index (-> av .-z)))
                 b-uv-index (inc-get-index 
                              (+ x-index (-> bv .-x))
                              (+ y-index (-> bv .-y))
                              (+ z-index (-> bv .-z)))
                 c-uv-index (inc-get-index
                              (+ x-index (-> cv .-x))
                              (+ y-index (-> cv .-y))
                              (+ z-index (-> cv .-z)))
                 a-uv1 (aget uvs (infix a-uv-index * 2 + 0))
                 a-uv2 (aget uvs (infix a-uv-index * 2 + 1))
                 a-uv (new js/THREE.Vector2 a-uv1 a-uv2)
                 b-uv1 (aget uvs (infix b-uv-index * 2 + 0))
                 b-uv2 (aget uvs (infix b-uv-index * 2 + 1))
                 b-uv (new js/THREE.Vector2 b-uv1 b-uv2)
                 c-uv1 (aget uvs (infix c-uv-index * 2 + 0))
                 c-uv2 (aget uvs (infix c-uv-index * 2 + 1))
                 c-uv (new js/THREE.Vector2 c-uv1 c-uv2)
                 ]
;                (if (> 0.001 (math/random)) (println "uvs" (-> a-uv .-x) (-> a-uv .-y)))
;                (if (> (-> a-uv .-x) 0) (println "a-uv" (-> a-uv .-x) (-> a-uv .-y)))
                (aset (aget face-vertex-uvs i) 0 a-uv)
                (aset (aget face-vertex-uvs i) 1 b-uv)
                (aset (aget face-vertex-uvs i) 2 c-uv)
                ))
            (doseq
              [i (range (* box-faces triangle-size))]
              (-> box-translations (.push x-offset-centre))
              (-> box-translations (.push y-offset-centre))
              (-> box-translations (.push z-offset-centre))
              (-> box-indices (.push index)))
            (doseq
              [i (range (* (/ box-faces billboard-corners) triangle-size))]
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
    (-> bgeo (.computeBoundingBox))
    (-> bgeo (.computeBoundingSphere))
    (-> bgeo (.computeFaceNormals))
    (-> bgeo (.computeVertexNormals))
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
     uv (-> geometry (.getAttribute "uv"))
     uv-array (-> uv .-array)
     attr-size (* v3-size triangle-size)
     uv-attr-size (* v2-size triangle-size)
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
     total-voxels (* voxel-count voxel-count voxel-count)
     inc-voxel-count (inc voxel-count)
     inc-total-voxels (* inc-voxel-count inc-voxel-count inc-voxel-count)
     voxels-size (math/ceil (/ total-voxels int32-size-bits))
     voxels (new js/Int32Array voxels-size)
     min-offset-x (-> bbox .-min .-x)
     min-offset-y (-> bbox .-min .-y)
     min-offset-z (-> bbox .-min .-z)
     rasterized-point-uvs #js []
     seen-triangles #js []
     closest-triangles #js []
     _ (doseq [i (range inc-total-voxels)]
         (-> closest-triangles (.push nil))
         (-> seen-triangles (.push #js {})))
     uvs (new js/Float32Array (* 2 inc-total-voxels))
     ; touch-voxel {{{
     inc-get-index (fn [x y z] (infix (x + inc-voxel-count * (y + inc-voxel-count * z))))
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
     ; }}}
     set-closest-uv
     (fn
       [v triangle triangle-uvs]
       (let
         [x-offset (- (-> v .-x) (-> bbox .-min .-x))
          y-offset (- (-> v .-y) (-> bbox .-min .-y))
          z-offset (- (-> v .-z) (-> bbox .-min .-z))
          x1 (infix (math/floor (x-offset / voxel-width)))
          x1 (if (= x1 voxel-count) (dec x1) x1)
          y1 (infix (math/floor (y-offset / voxel-height)))
          y1 (if (= y1 voxel-count) (dec y1) y1)
          z1 (infix (math/floor (z-offset / voxel-depth)))
          z1 (if (= z1 voxel-count) (dec z1) z1)
          x2 (inc x1)
          y2 (inc y1)
          z2 (inc z1)
          [uv1 uv2 uv3] triangle-uvs]
         (doseq
           [x [x1 x2]
            y [y1 y2]
            z [z1 z2]]
           (let
             [index (inc-get-index x y z)
              seen-triangle (aget seen-triangles index)
              seen-current? (aget seen-triangle (-> triangle .-voxelize-index))]
             (if (nil? seen-current?)
               (let
                 [closest-triangle (aget closest-triangles index) 
                  x-offset (+ (* x voxel-width) (-> bbox .-min .-x))
                  y-offset (+ (* y voxel-height) (-> bbox .-min .-y))
                  z-offset (+ (* z voxel-depth) (-> bbox .-min .-z))
                  point (new js/THREE.Vector3 x-offset y-offset z-offset)
                  closest (-> triangle (.closestPointToPoint point))
                  distance (-> closest .clone (.sub point) .length)]
                 (if 
                   (or
                     (nil? closest-triangle)
                     (> closest-triangle distance))
                   (let
                     [barycoord (-> triangle (.barycoordFromPoint closest))
                      uv1x (-> uv1 .clone (.multiplyScalar (-> barycoord .-x)))
                      uv2y (-> uv2 .clone (.multiplyScalar (-> barycoord .-y)))
                      uv3z (-> uv3 .clone (.multiplyScalar (-> barycoord .-z)))
                      uv (-> uv1x (.add uv2y) (.add uv3z))
                      ]
                     (println "setting uv" x y z 
                              "distance" distance
                              "uv1" (-> uv1 .-x) (-> uv1 .-y)
                              "uv2" (-> uv2 .-x) (-> uv2 .-y)
                              "uv3" (-> uv3 .-x) (-> uv3 .-y)
                              "uv" (-> uv .-x) (-> uv .-y))
                     (aset closest-triangles index distance)
                     (aset seen-triangle (-> triangle .-voxelize-index) true)
                     (aset uvs (+ (* 2 index) 0) (-> uv .-x))
                     (aset uvs (+ (* 2 index) 1) (-> uv .-y))
                     ))))))))
     ; voxelize-triangle {{{
     voxelize-triangle
     (fn
       voxelize-triangle
       [triangle triangle-uvs v1 v2 v3]
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
              v13-mid (-> v13 (.divideScalar 2.0) (.add v1))
              ]
             (voxelize-triangle triangle triangle-uvs v1 v12-mid v13-mid)
             (voxelize-triangle triangle triangle-uvs v2 v12-mid v23-mid)
             (voxelize-triangle triangle triangle-uvs v3 v13-mid v23-mid)
             (voxelize-triangle triangle triangle-uvs v12-mid v23-mid v13-mid))
           (do
             (touch-voxel v1)
             (touch-voxel v2)
             (touch-voxel v3)
             (set-closest-uv v1 triangle triangle-uvs)
             (set-closest-uv v2 triangle triangle-uvs)
             (set-closest-uv v3 triangle triangle-uvs)
             ))))
     ; }}}
     ]
    ; rasterize triangles {{{
    (doseq [i (range triangle-count)]
      (if (= 0 (mod i (max 1 (quot triangle-count 100))))
        (println "%:" (* 100 (/ i triangle-count))))
      (let
        [index (* i attr-size)
         uv-index (* i uv-attr-size)
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
         uv1 (new js/THREE.Vector2
                 (aget uv-array (+ uv-index 0))
                 (aget uv-array (+ uv-index 1)))
         uv2 (new js/THREE.Vector2
                 (aget uv-array (+ uv-index 2))
                 (aget uv-array (+ uv-index 3)))
         uv3 (new js/THREE.Vector2
                 (aget uv-array (+ uv-index 4))
                 (aget uv-array (+ uv-index 5)))
         triangle (new js/THREE.Triangle v1 v2 v3)
         _ (-> triangle .-voxelize-index (set! i))
         triangle-uvs [uv1 uv2 uv3]
         ]
;        (println "triangle" index (-> v1 .-x) (-> v1 .-y) (-> v1 .-z))
;        (println "uv" (-> uv-array .-length) uv-index (-> uv1 .-x) (-> uv1 .-y) (-> uv2 .-x) (-> uv2 .-y) (-> uv3 .-x) (-> uv3 .-y))
        (voxelize-triangle triangle triangle-uvs v1 v2 v3)
        ))
    ; }}}
    {
     :voxels voxels
     :uvs uvs
     :offset-x min-offset-x
     :offset-y min-offset-y
     :offset-z min-offset-z
     :voxel-count voxel-count
     :voxel-width voxel-width
     :voxel-height voxel-height
     :voxel-depth voxel-depth
     }))
