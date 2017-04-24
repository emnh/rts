(ns ^:figwheel-always game.client.ground-local
  (:require
    [cljs.pprint :as pprint]
    [com.stuartsierra.component :as component]
    [promesa.core :as p]
    [cats.core :as m]
    [game.client.math :as math :refer [floor isNaN]]
    [game.client.common :as common :refer [data]]
    [game.client.config :as config])
  (:require-macros
    [infix.macros :refer [infix]]
    [game.shared.macros :as macros :refer [defcom]]))

(def rgba-size 4)
(def upvector (new js/THREE.Vector3 0.0 1.0 0.0))

(defn xy-index-to-index
  [x-vertices y-vertices x y]
  (infix (y * y-vertices) + x))

(deftype
  xy-to-index-return
  [xd yd xi yi idx])

(defn xy-to-index
  [width height x-faces y-faces x-vertices y-vertices x y]
  (let
    [xd (infix ((x + (width / 2.0)) * x-faces / width))
     yd (infix ((y + (height / 2.0)) * y-faces / height))
     xi (floor xd)
     yi (floor yd)
     idx (xy-index-to-index x-vertices y-vertices xi yi)]

    (xy-to-index-return. xd yd xi yi idx)))

(defn get-height
  [component x y]
  (let
    [height-field (.-height-field component)
     width (.-width component)
     height (.-height component)
     x-faces (.-x-faces component)
     y-faces (.-y-faces component)
     x-vertices (.-x-vertices component)
     y-vertices (.-y-vertices component)
     ret (xy-to-index width height x-faces y-faces x-vertices y-vertices x y)
     xd (-> ret .-xd)
     yd (-> ret .-yd)
     xi (-> ret .-xi)
     yi (-> ret .-yi)
     idx (-> ret .-idx)
     ;x1 (infix x - ((xd % 1.0) * width / x-faces))
     ;y1 (infix y - ((yd % 1.0) * height / y-faces))
     x1 (infix (xi * width / x-faces) - (width / 2.0))
     y1 (infix (yi * height / y-faces) - (height / 2.0))
     ;x2 (infix x1 + (1.0 * width / x-faces))
     ;y2 (infix y1 + (1.0 * height / y-faces))
     x2 (infix ((inc xi) * width / x-faces) - (width / 2.0))
     y2 (infix ((inc yi) * height / y-faces) - (height / 2.0))]

    ;(if (or (isNaN xi) (isNaN yi)) (throw (new js/Error "NaN")))
    (if
      (or
        (infix xi < 0)
        (infix yi < 0)
        (infix inc(xi) > x-faces)
        (infix inc(yi) > y-faces))
      0
      (let
        [fQ11 (aget height-field (xy-index-to-index x-vertices y-vertices xi yi))
         fQ21 (aget height-field (xy-index-to-index x-vertices y-vertices (inc xi) yi))
         fQ12 (aget height-field (xy-index-to-index x-vertices y-vertices xi (inc yi)))
         fQ22 (aget height-field (xy-index-to-index x-vertices y-vertices (inc xi) (inc yi)))
         v1 (new js/THREE.Vector3 x1 fQ11 y1)
         v2 (new js/THREE.Vector3 x2 fQ21 y1)
         v3 (new js/THREE.Vector3 x1 fQ12 y2)
         v4 (new js/THREE.Vector3 x2 fQ22 y2)
         ray (new THREE.Ray (new js/THREE.Vector3 x -1.0 y) upvector)
         where1 (-> ray (.intersectTriangle v1 v3 v2))
         where2 (-> ray (.intersectTriangle v3 v4 v2))
         yw1 (if where1 (.-y where1) 0.0)
         yw2 (if where2 (.-y where2) 0.0)
         ywhere (math/max yw1 yw2)
         water-threshold @(:water-threshold component)
         water-level (* water-threshold (:max-elevation component))
         ywhere-water (math/max ywhere water-level)]
         ;fxy1 (infix ((x2 - x) / (x2 - x1)) * fQ11 + ((x - x1) / (x2 - x1)) * fQ21)
         ;fxy2 (infix ((x2 - x) / (x2 - x1)) * fQ12 + ((x - x1) / (x2 - x1)) * fQ22)
         ;fyy (infix ((y2 - y) / (y2 - y1)) * fxy1 + ((y - y1) / (y2 - y1)) * fxy2)]
        ywhere-water))))
        ;fyy))))

(defn
  align-to-ground
  [ground bbox xpos zpos]
  (let
    [
     ; get height of centre and four courners of box
     x1 (+ xpos (-> bbox .-min .-x))
     x2 (+ xpos (-> bbox .-max .-x))
     z1 (+ zpos (-> bbox .-min .-z))
     z2 (+ zpos (-> bbox .-max .-z))
     hc (get-height ground xpos zpos)
     h11 (get-height ground x1 z1)
     h12 (get-height ground x1 z2)
     h21 (get-height ground x2 z1)
     h22 (get-height ground x2 z2)
     ;_ (console.log x1 x2 z1 z2 hc h11 h12 h21 h22)
     ;y (- (max hc h11 h12 h21 h22) (-> bbox .-min .-y))
     y (- (math/max hc (math/max h11 (math/max h12 (math/max h21 h22)))) (-> bbox .-min .-y))]
     ;y (- (math/min hc (math/min h11 (math/min h12 (math/min h21 h22)))) (-> bbox .-min .-y))]

    y))

(defn get-map
  [component config simplex]
  (let
    [
     texture-loader (new THREE.TextureLoader)
     ;material (new js/THREE.MeshStandardMaterial)
     material (new js/THREE.MeshLambertMaterial)
     ;material (new js/THREE.MeshPhongMaterial)
     wrapping (-> js/THREE .-RepeatWrapping)
     width (config/get-terrain-width config)
     height (config/get-terrain-height config)
     ;map-repeat-width (/ width 100)
     ;map-repeat-height (/ height 100)
     map-repeat-width 6
     map-repeat-height 6
     on-load (fn [texture]
               (-> texture .-wrapS (set! wrapping))
               (-> texture .-wrapT (set! wrapping))
               (-> texture .-repeat (.set map-repeat-width map-repeat-height))
               (-> material .-map (set! texture))
               ;(-> material .-envMap (set! texture))
               (-> material .-needsUpdate (set! true)))
     ;grass (-> texture-loader (.load "models/images/grass.jpg" on-load))
     grass (-> texture-loader (.load "models/images/grasslight-big.jpg" on-load))
     on-load-normal
      (fn [texture]
        (-> texture .-wrapS (set! wrapping))
        (-> texture .-wrapT (set! wrapping))
        (-> texture .-repeat (.set map-repeat-width map-repeat-height))
        (-> material .-normalMap (set! texture))
        ;(-> material .-envMap (set! texture))
        (-> material .-needsUpdate (set! true)))
     grass (-> texture-loader (.load "models/images/grasslight-big-nm.jpg" on-load-normal))
     ;m-opts #js { :map grass}
     x-faces (get-in config [:terrain :x-faces])
     y-faces (get-in config [:terrain :y-faces])
     x-vertices x-faces
     y-vertices y-faces
     max-elevation (get-in config [:terrain :max-elevation])
     min-elevation (get-in config [:terrain :min-elevation])
     ;geometry (new js/THREE.PlaneBufferGeometry width height (dec x-faces) (dec y-faces))
     geometry (new js/THREE.PlaneBufferGeometry width height x-faces y-faces)
     rotation (-> (new js/THREE.Matrix4) (.makeRotationX (/ (-> js/Math .-PI) -2)))
     position (-> geometry .-attributes .-position)
     uv (-> geometry .-attributes .-uv)
     length (-> position .-count)
     height-field (new js/Float32Array length)
     data-texture-buffer (new js/Float32Array (* length rgba-size))
     ; make maximum value of 1.0
     float-texture-divisor 256.0
     water-threshold (get-in config [:terrain :water-threshold])]
    (-> material .-roughness (set! 0.5))
    (-> geometry (.applyMatrix rotation))
    (-> js/THREE.BufferGeometryUtils (.computeTangents geometry))
    (doseq
       [i (range length)]
       (let
         [x (-> position (.getX i))
          y (-> position (.getY i))
          z (-> position (.getZ i))
          uvx (infix (x + (width / 2.0)) / width)
          uvy (infix (z + (height / 2.0)) / height)
          scale 1000.0
          y (+
              (* 1.0 (-> simplex (.noise (/ x (* 1.0 scale)) (/ z (* 1.0 scale)))))
              (* 0.5 (-> simplex (.noise (/ x (* 0.5 scale)) (/ z (* 0.5 scale)))))
              (* 0.25 (-> simplex (.noise (/ x (* 0.25 scale)) (/ z (* 0.25 scale)))))
              (* 0.125 (-> simplex (.noise (/ x (* 0.125 scale)) (/ z (* 0.125 scale))))))
              ;(-> simplex (.noise (/ x scale) (/ z scale))))
          ;y (/ y (+ 1.0 0.5 0.25 0.125))
          y (/ (+ y 1.0) 2.0)
          y (if (> y 1.0) 1.0 y)
          y (+ (* y max-elevation) min-elevation)
          idx (-> (xy-to-index width height x-faces y-faces x-vertices y-vertices x z) .-idx)
          idx2 (-> (xy-to-index width height x-faces y-faces (inc x-faces) (inc y-faces) x z) .-idx)]

         ;(-> position (.setY i y))
         (-> uv (.setX i uvx))
         (-> uv (.setY i uvy))
         (aset height-field idx y)
         (doseq [j (range rgba-size)]
           (aset data-texture-buffer (+ j (* idx rgba-size)) (/ y float-texture-divisor)))
         (aset data-texture-buffer (+ 3 (* idx rgba-size)) 1.0)))

    (-> geometry .computeFaceNormals)
    (-> geometry .computeVertexNormals)
    (let
      [mesh (new THREE.Mesh geometry material)
       data-texture
       (new js/THREE.DataTexture
            data-texture-buffer
            ;(inc x-faces)
            ;(inc y-faces)
            x-faces
            y-faces
            js/THREE.RGBAFormat
            js/THREE.FloatType)]
      (-> data-texture .-minFilter (set! js/THREE.LinearFilter))
      (-> data-texture .-magFilter (set! js/THREE.LinearFilter))
      (-> data-texture .-needsUpdate (set! true))
      (-> component
        (assoc :width width)
        (assoc :height height)
        (assoc :x-faces x-faces)
        (assoc :y-faces y-faces)
        (assoc :x-vertices x-vertices)
        (assoc :y-vertices y-vertices)
        (assoc :height-field height-field)
        (assoc :mesh mesh)
        (assoc :data-texture data-texture)
        (assoc :float-texture-divisor float-texture-divisor)
        (assoc :water-threshold (atom water-threshold))
        (assoc :max-elevation max-elevation)))))

(defcom
  new-init-ground
  [config params]
  [mesh height-field width height
   max-elevation
   x-faces y-faces x-vertices y-vertices
   data-texture float-texture-divisor
   water-threshold]
  (fn [component]
    (if-not
      mesh
      (get-map component config (:simplex params))
      component))
  (fn [component]
    component))
