(ns ^:figwheel-always game.client.ground-local
    (:require
      [cljs.pprint :as pprint]
      [jayq.core :as jayq :refer [$]]
      [com.stuartsierra.component :as component]
      [promesa.core :as p]
      [cats.core :as m]
      [game.client.math :as math :refer [floor isNaN]]
      [game.client.common :as common :refer [data]]
      [game.client.config :as config]
      )
  (:require-macros
    [infix.macros :refer [infix]]
    [game.shared.macros :as macros :refer [defcom]]
    ))

(defn xy-index-to-index
  [x-faces y-faces x y]
  (infix y * y-faces + x))

(defn xy-to-index
  [width height x-faces y-faces x y]
  (let
    [xd (infix ((x + width / 2) * x-faces / width))
     yd (infix ((y + height / 2) * y-faces / height))
     xi (floor xd)
     yi (floor yd)]
    {
     :xd xd
     :yd yd
     :xi xi
     :yi yi
     :idx (xy-index-to-index x-faces y-faces xi yi)
     }))

(defn get-height
  [component x y]
  (let
    [height-field (:height-field component)
     width (:width component)
     height (:height component)
     x-faces (:x-faces component)
     y-faces (:y-faces component)
     { :keys [xd yd xi yi idx] }
     (xy-to-index width height x-faces y-faces x y)
     x1 (infix x - (xd % 1) * width / x-faces)
     x2 (infix x1 + 1 * width / x-faces)
     y1 (infix y - (yd % 1) * height / y-faces)
     y2 (infix y1 + 1 * height / y-faces)
     ]
    (if
      (infix
        xi < 0 ||
        yi < 0 ||
        isNaN(xi) ||
        isNaN(yi) ||
        xi > x-faces ||
        inc(xi) > x-faces ||
        yi > y-faces ||
        inc(yi) > y-faces)
      0
      (let
        [lookup (partial xy-index-to-index x-faces y-faces)
         fQ11 (aget height-field (lookup xi yi))
         fQ21 (aget height-field (lookup (inc xi) yi))
         fQ12 (aget height-field (lookup xi (inc yi)))
         fQ22 (aget height-field (lookup (inc xi) (inc yi)))
         fxy1 (infix ((x2 - x) / (x2 - x1)) * fQ11 + ((x - x1) / (x2 - x1)) * fQ21)
         fxy2 (infix ((x2 - x) / (x2 - x1)) * fQ12 + ((x - x1) / (x2 - x1)) * fQ22)
         fyy (infix ((y2 - y) / (y2 - y1)) * fxy1 + ((y - y1) / (y2 - y1)) * fxy2)
         ]
        fyy))))

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
     m-opts #js { :map grass }
     x-faces (get-in config [:terrain :x-faces])
     y-faces (get-in config [:terrain :y-faces])
     max-elevation (get-in config [:terrain :max-elevation])
     min-elevation (get-in config [:terrain :min-elevation])
     geometry (new js/THREE.PlaneBufferGeometry width height x-faces y-faces)
     rotation (-> (new js/THREE.Matrix4) (.makeRotationX (/ (-> js/Math .-PI) -2)))
     position (-> geometry .-attributes .-position)
     length (-> position .-count)
     height-field (new js/Float32Array length)
     ]
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
            idx (:idx (xy-to-index width height x-faces y-faces x z))
            ]
           (-> position (.setY i y))
           (aset height-field idx y)
           ))
      (-> geometry .computeFaceNormals)
      (-> geometry .computeVertexNormals)
      (let
        [mesh (new THREE.Mesh geometry material)]
        (-> component
          (assoc :width width)
          (assoc :height height)
          (assoc :x-faces x-faces)
          (assoc :y-faces y-faces)
          (assoc :height-field height-field)
          (assoc :mesh mesh)))))

(defcom
  new-init-ground
  [config params]
  [mesh height-field width height x-faces y-faces]
  (fn [component]
    (if-not
      mesh
      (get-map component config mesh (:simplex params))
      component))
  (fn [component]
    component))
