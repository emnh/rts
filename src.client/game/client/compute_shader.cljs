(ns ^:figwheel-always game.client.compute_shader
  (:require
    [cljs.pprint :as pprint]
    [com.stuartsierra.component :as component]
    [promesa.core :as p]
    [cats.core :as m]
    [game.client.common :as common :refer [new-jsobj list-item data unique-id]]
    [game.client.ground-local :as ground]
    [game.client.config :as config]
    [game.client.math :as math]
    [game.client.gamma_ext :as ge :refer [get-name]]
    [game.client.scene :as scene]
    [game.client.engine2_explosion :as engine2_explosion]
    [gamma.api :as g]
    [gamma.program :as gprogram]
    [clojure.string :as string])

  (:require-macros [game.shared.macros :as macros :refer [defcom]]))

(def precision "precision mediump float;\n")

(def fake-if-template "
TYPE fake_if(bool test, TYPE arg1, TYPE arg2) {
return test ? arg1 : arg2;
}
")

(def swizzle-by-index "
float swizzle_by_index(vec4 arg, float index) {
  if (index == 0.0) {
    return arg.x;
  } else {
    if (index == 1.0) {
      return arg.y;
    } else {
      if (index == 2.0) {
        return arg.z;
      } else {
        return arg.w;
      }
    }
  }
}
")

(def fake-if
  (apply str
    (map #(string/replace fake-if-template "TYPE" (name %)) [:float :vec2 :vec3 :vec4])))

(def preamble
  (str
    precision
    swizzle-by-index
    fake-if))

(def vertex-position (g/attribute "position" :vec3))
(def vertex-normal (g/attribute "normal" :vec3))
(def vertex-uv (g/attribute "uv" :vec2))

(def projection-matrix (g/uniform "projectionMatrix" :mat4))
(def model-view-matrix (g/uniform "modelViewMatrix" :mat4))

; v-uv.x subrange of 0 to 1 according to texture index
(def v-uv (g/varying "vUV" :vec2 :mediump))
; v-uv-normalized from 0 to 1
(def v-uv-normalized (g/varying "vUVNormalized" :vec2 :mediump))

(def u-copy-rt-scale (g/uniform "uCopyRTScale" :vec4))
(def t-copy-rt (g/uniform "tCopyRT" :sampler2D))

; COPY SHADER
; copy render target for debugging to screen

(def copy-vertex-shader
  {
    v-uv vertex-uv
    (g/gl-position)
    (->
      (g/* projection-matrix model-view-matrix)
      (g/* (g/vec4 vertex-position 1)))})

(def copy-fragment-shader
  {
    (g/gl-frag-color)
    (g/div
      (g/texture2D t-copy-rt v-uv)
      u-copy-rt-scale)})
    ; (g/gl-frag-color) (g/abs (g/texture2D t-copy-rt v-uv))})

(def copy-shader
  (gprogram/program
    {
      :vertex-shader copy-vertex-shader
      :fragment-shader copy-fragment-shader}))

(def copy-shader-vs
  (str preamble (:glsl (:vertex-shader copy-shader))))

(def copy-shader-fs
  (str preamble (:glsl (:fragment-shader copy-shader))))

(defn get-compute-shader
  [component config]
  (let
    [
      screen-width (-> js/window .-innerWidth)
      screen-height (-> js/window .-innerHeight)
      plane (new js/THREE.PlaneBufferGeometry screen-width screen-height)
      placeholder-material (new js/THREE.MeshBasicMaterial)
      quad-target (new js/THREE.Mesh plane placeholder-material)
      _ (-> quad-target .-position .-z (set! -500))
      scene-render-target (new js/THREE.Scene)
      camera-ortho (new js/THREE.OrthographicCamera (/ screen-width -2) (/ screen-width 2) (/ screen-height 2) (/ screen-height -2) -10000 10000)
      _ (-> camera-ortho .-position .-z (set! 100))
      _ (-> scene-render-target (.add camera-ortho))
      _ (-> scene-render-target (.add quad-target))
      copy-uniforms #js {}
      _
       (doto copy-uniforms
         (aset
           (get-name u-copy-rt-scale)
           #js { :value (new js/THREE.Vector4 1 1 1 1)})
         (aset
           (get-name t-copy-rt)
           #js { :value nil}))
      copy-material
        (new js/THREE.RawShaderMaterial
          #js
          {
            :uniforms copy-uniforms
            :vertexShader copy-shader-vs
            :fragmentShader copy-shader-fs})]
    (-> component
      (assoc :quad quad-target)
      (assoc :scene scene-render-target)
      (assoc :camera camera-ortho)
      (assoc :copy-material copy-material))))

(defcom
  new-compute-shader
  [config]
  [quad scene camera copy-material]
  (fn [component]
    (if
      (= (:start-count component) 0)
      (get-compute-shader component config)
      component))
  (fn [component]
    component))
