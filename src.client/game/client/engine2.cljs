(ns ^:figwheel-always game.client.engine2
  (:require
    [cljs.pprint :as pprint]
    [com.stuartsierra.component :as component]
    [game.client.common :as common :refer [new-jsobj list-item data unique-id]]
    [game.client.ground-local :as ground]
    [game.client.config :as config]
    [game.client.math :as math]
    [game.client.gamma_ext :as ge]
    [game.client.scene :as scene]
    [gamma.api :as g]
    [gamma.program :as gprogram])

  (:require-macros [game.shared.macros :as macros :refer [defcom]]))

(def precision "precision mediump float;\n")

(def preamble precision)

(def vertex-position (g/attribute "position" :vec3))
(def vertex-normal (g/attribute "normal" :vec3))
(def vertex-uv (g/attribute "uv" :vec2))
(def a-unit-index (g/attribute "unitIndex" :float))

(def projection-matrix (g/uniform "projectionMatrix" :mat4))
(def model-view-matrix (g/uniform "modelViewMatrix" :mat4))

(def u-map-size (g/uniform "uMapSize" :vec3))
(def u-max-units (g/uniform "uMaxUnits" :float))
(def u-max-units-res (g/uniform "uMaxUnitsResolution" :vec2))
(def t-units-position (g/uniform "tUnitsPosition" :sampler2D))

(defn get-name [x] (:name x))

; TEST SHADER
(def simple-vertex-shader
  {
    (g/gl-position)
    (->
      (g/* projection-matrix model-view-matrix)
      (g/* (g/vec4 vertex-position 1)))})

(def simple-fragment-shader
  {
    (g/gl-frag-color) (g/vec4 1 1 1 1)})

(def test-gamma
  (gprogram/program
    {
      :vertex-shader simple-vertex-shader
      :fragment-shader simple-fragment-shader}))

; UNITS SHADER

(defn get-unit-position
  [index]
  (let
    [x (g/mod index (ge/x u-max-units-res))
     x (g/div x (ge/x u-max-units-res))
     y (g/div index (ge/x u-max-units-res))
     y (g/div y (ge/y u-max-units-res))]
    (g/swizzle
      (g/texture2D t-units-position (g/vec2 x y))
      :xyz)))

(def units-vertex-shader
  {
    (g/variable "blah" :vec3) vertex-normal
    (g/variable "test" :vec2) vertex-uv
    (g/variable "nuff" :float) a-unit-index
    (g/gl-position)
    (let
      [unit-pos (get-unit-position a-unit-index)]
      (->
        (g/* projection-matrix model-view-matrix)
        (g/* (g/vec4 (g/+ unit-pos vertex-position) 1))))})

(def units-fragment-shader
  {
    (g/gl-frag-color) (g/vec4 1 0 0 1)})

(def units-shader
  (gprogram/program
    {
      :vertex-shader units-vertex-shader
      :fragment-shader units-fragment-shader}))

; POSITION INITIALIZE SHADER

(def unit-positions-init-vertex-shader simple-vertex-shader)

(defn random
  [co]
  (g/fract
    (g/*
      (g/sin (g/* co 12.989))
      43758.545)));

(def unit-positions-init-fragment-shader
  (let
    [
      uv (g/div (g/swizzle (g/gl-frag-coord) :xy) u-max-units-res)
      ir1
        (g/*
          (g/*
            (ge/x uv)
            (ge/x u-max-units-res))
          (ge/y uv))
      ir2
        (g/*
          (g/*
            (ge/y uv)
            (ge/y u-max-units-res))
          (ge/x uv))
      rnd-f #(g/- (random %) 0.5)
      x (g/* (rnd-f ir1) (ge/x u-map-size))
      y (ge/y u-map-size)
      z (g/* (rnd-f ir2) (ge/z u-map-size))]
    {
      (g/gl-frag-color) (g/vec4 x y z 1)}))

(def unit-positions-init-shader
  (gprogram/program
    {
      :vertex-shader unit-positions-init-vertex-shader
      :fragment-shader unit-positions-init-fragment-shader}))

(println
  ["unit-vertex-shader"
   (:glsl (:vertex-shader units-shader))])
(println
 ["unit-fragment-shader"
  (:glsl (:fragment-shader units-shader))])

(println (:glsl (:vertex-shader unit-positions-init-shader)))
(println (:glsl (:fragment-shader unit-positions-init-shader)))

; END OF SHADERS. BEGIN ENGINE.

(defn on-render
  [init-renderer component]
  (let
    [
     compute-shader (:compute-shader component)
     scene (:scene compute-shader)
     camera (:camera compute-shader)
     quad (:quad compute-shader)
     renderer (data (:renderer init-renderer))
     engine (:engine2 component)
     render-target1 (:units-rt1 engine)
     init-material (:init-material engine)]
    (-> quad .-material (set! init-material))
    (-> renderer (.render scene camera render-target1 true))))

(defcom
  new-update-units
  [compute-shader engine2]
  []
  (fn [component]
    component)
  (fn [component]
    component))

(defn get-engine
  [component]
  (let
    [config (:config component)
     max-units-base (get-in config [:units :max-units-base])
     rx (math/pow2 max-units-base)
     ry rx
     max-units (* rx ry)
     pars
     #js
       {
         :wrapS js/THREE.ClampToEdgeWrapping
         :wrapT js/THREE.ClampToEdgeWrapping
         :minFilter js/THREE.LinearFilter
         :magFilter js/THREE.LinearFilter
         :format js/THREE.RGBAFormat
         ; TODO: check for support
         :type js/THREE.FloatType
         :stencilBuffer false}
     width (config/get-terrain-width config)
     height (config/get-terrain-height config)
     elevation (get-in config [:terrain :max-elevation])
     map-size (new js/THREE.Vector3 width elevation height)
     units-rt1 (new js/THREE.WebGLRenderTarget rx ry pars)
     units-rt2 (new js/THREE.WebGLRenderTarget rx ry pars)
     proto-geo (new js/THREE.PlaneBufferGeometry 1000 1000 1 1)
     ;proto-geo (new js/THREE.SphereBufferGeometry 500 32 32)
     proto-geo (new js/THREE.BoxBufferGeometry 30 30 30)
     geo (new js/THREE.InstancedBufferGeometry)
     index-array (new js/Float32Array max-units)
     uniforms #js {}
     _ (aset uniforms (get-name u-map-size) #js { :value map-size})
     _ (aset uniforms (get-name u-max-units) #js { :value max-units})
     _ (aset uniforms (get-name u-max-units-res) #js { :value (new js/THREE.Vector2 rx ry)})
     _ (aset uniforms (get-name t-units-position) #js { :value (-> units-rt1 .-texture)})
     material
      (new js/THREE.RawShaderMaterial
        #js
        {
          :uniforms uniforms
          :vertexShader (+ preamble (:glsl (:vertex-shader units-shader)))
          :fragmentShader (+ preamble (:glsl (:fragment-shader units-shader)))})
     init-uniforms #js {}
     ; TODO: keep base uniforms and clone them
     _ (aset init-uniforms (get-name u-map-size) #js { :value map-size})
     _ (aset init-uniforms (get-name u-max-units) #js { :value max-units})
     _ (aset init-uniforms (get-name u-max-units-res) #js { :value (new js/THREE.Vector2 rx ry)})
     init-material
      (new js/THREE.RawShaderMaterial
        #js
        {
          :uniforms init-uniforms
          :vertexShader (+ preamble (:glsl (:vertex-shader unit-positions-init-shader)))
          :fragmentShader (+ preamble (:glsl (:fragment-shader unit-positions-init-shader)))})]
     ;material
     ;(new js/THREE.MeshLambertMaterial #js {:color 0xFF0000})]
   (doseq
     [i (range max-units)]
     (aset index-array i i))
   (-> geo (.addAttribute "position" (-> proto-geo (.getAttribute "position"))))
   (-> geo (.addAttribute "normal" (-> proto-geo (.getAttribute "normal"))))
   (-> geo (.addAttribute "uv" (-> proto-geo (.getAttribute "uv"))))
   (-> geo (.setIndex (-> proto-geo .-index)))
   (-> geo (.addAttribute (get-name a-unit-index) (new js/THREE.InstancedBufferAttribute index-array 1)))
   (-> component
    (assoc :units-rt1 units-rt1)
    (assoc :units-rt2 units-rt2)
    (assoc :mesh (new js/THREE.Mesh geo material))
    (assoc :init-material init-material))))

(defcom
  new-engine
  [config]
  [units-rt1 units-rt2 mesh
   init-material]
  (fn [component]
    (get-engine component))
  (fn [component]
    component))
