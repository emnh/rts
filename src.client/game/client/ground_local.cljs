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

(defn xy-index-to-index
  [x-faces y-faces x y]
  (infix y * y-faces + x))

(deftype
  xy-to-index-return
  [xd yd xi yi idx])

(defn xy-to-index
  [width height x-faces y-faces x y]
  (let
    [xd (infix ((x + width / 2) * x-faces / width))
     yd (infix ((y + height / 2) * y-faces / height))
     xi (floor xd)
     yi (floor yd)
     idx (xy-index-to-index x-faces y-faces xi yi)]

    (xy-to-index-return. xd yd xi yi idx)))

(defn get-height
  [component x y]
  (let
    [height-field (.-height-field component)
     width (.-width component)
     height (.-height component)
     x-faces (.-x-faces component)
     y-faces (.-y-faces component)
     ret (xy-to-index width height x-faces y-faces x y)
     xd (-> ret .-xd)
     yd (-> ret .-yd)
     xi (-> ret .-xi)
     yi (-> ret .-yi)
     idx (-> ret .-idx)
     x1 (infix x - (xd % 1) * width / x-faces)
     x2 (infix x1 + 1 * width / x-faces)
     y1 (infix y - (yd % 1) * height / y-faces)
     y2 (infix y1 + 1 * height / y-faces)]

    ;(if (or (isNaN xi) (isNaN yi)) (throw (new js/Error "NaN")))
    (if
      (or
        (infix xi < 0)
        (infix yi < 0)
        (infix inc(xi) > x-faces)
        (infix inc(yi) > y-faces))
      0
      (let
        [fQ11 (aget height-field (xy-index-to-index x-faces y-faces xi yi))
         fQ21 (aget height-field (xy-index-to-index x-faces y-faces (inc xi) yi))
         fQ12 (aget height-field (xy-index-to-index x-faces y-faces xi (inc yi)))
         fQ22 (aget height-field (xy-index-to-index x-faces y-faces (inc xi) (inc yi)))
         fxy1 (infix ((x2 - x) / (x2 - x1)) * fQ11 + ((x - x1) / (x2 - x1)) * fQ21)
         fxy2 (infix ((x2 - x) / (x2 - x1)) * fQ12 + ((x - x1) / (x2 - x1)) * fQ22)
         fyy (infix ((y2 - y) / (y2 - y1)) * fxy1 + ((y - y1) / (y2 - y1)) * fxy2)]

        fyy))))

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
     ;y (- (max hc h11 h12 h21 h22) (-> bbox .-min .-y))
     y (- (math/max hc (math/max h11 (math/max h12 (math/max h21 h22)))) (-> bbox .-min .-y))]

    y))

(defn get-map
  [component config mesh simplex]
  (let
    [
     texture-loader (new THREE.TextureLoader)
     material (new js/THREE.MeshLambertMaterial)
     wrapping (-> js/THREE .-RepeatWrapping)
     width (config/get-terrain-width config)
     height (config/get-terrain-height config)
     map-repeat-width (/ width 100)
     map-repeat-height (/ height 100)
     on-load (fn [texture]
               (-> texture .-wrapS (set! wrapping))
               (-> texture .-wrapT (set! wrapping))
               (-> texture .-repeat (.set map-repeat-width map-repeat-height))
               (-> material .-map (set! texture))
               (-> material .-needsUpdate (set! true)))
     grass (-> texture-loader (.load "models/images/grass.jpg" on-load))
     m-opts #js { :map grass}
     x-faces (get-in config [:terrain :x-faces])
     y-faces (get-in config [:terrain :y-faces])
     max-elevation (get-in config [:terrain :max-elevation])
     min-elevation (get-in config [:terrain :min-elevation])
     geometry (new js/THREE.PlaneBufferGeometry width height (dec x-faces) (dec y-faces))
     rotation (-> (new js/THREE.Matrix4) (.makeRotationX (/ (-> js/Math .-PI) -2)))
     position (-> geometry .-attributes .-position)
     length (-> position .-count)
     height-field (new js/Float32Array length)
     data-texture-buffer (new js/Float32Array (* length rgba-size))
     ; make maximum value of 1.0
     float-texture-divisor 256.0]

    (-> geometry (.applyMatrix rotation))
    (doseq
       [i (range length)]
       (let
         [x (-> position (.getX i))
          y (-> position (.getY i))
          z (-> position (.getZ i))
          y (-> simplex (.noise (/ x 100) (/ z 100)))
          y (/ (+ y 1) 2)
          y (+ (* y max-elevation) min-elevation)
          idx (-> (xy-to-index width height x-faces y-faces x z) .-idx)]

         (-> position (.setY i y))
         (aset height-field idx y)
         (doseq [j (range rgba-size)]
           (aset data-texture-buffer (+ j (* idx rgba-size)) (/ y float-texture-divisor)))))

    (-> geometry .computeFaceNormals)
    (-> geometry .computeVertexNormals)
    (let
      [mesh (new THREE.Mesh geometry material)
       data-texture
       (new js/THREE.DataTexture
            data-texture-buffer
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
        (assoc :height-field height-field)
        (assoc :mesh mesh)
        (assoc :data-texture data-texture)
        (assoc :float-texture-divisor float-texture-divisor)))))

(defcom
  new-init-ground
  [config params]
  [mesh height-field width height x-faces y-faces data-texture float-texture-divisor]
  (fn [component]
    (if-not
      mesh
      (get-map component config mesh (:simplex params))
      component))
  (fn [component]
    component))
