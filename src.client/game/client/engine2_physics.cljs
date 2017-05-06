(ns ^:figwheel-always game.client.engine2_physics
  (:require
    [cljs.pprint :as pprint]
    [com.stuartsierra.component :as component]
    [game.client.common :as common :refer [new-jsobj list-item data unique-id]]
    [game.client.ground-local :as ground]
    [game.client.config :as config]
    [game.client.math :as math]
    [game.client.gamma_ext :as ge]
    [game.client.scene :as scene]
    [game.client.engine2 :as engine2
      :refer
        [preamble
         projection-matrix
         model-view-matrix
         vertex-position
         v-uv
         vertex-uv
         get-unit-position
         vertex-normal
         get-name
         a-unit-index
         u-map-size
         u-max-units
         units-shader-hack]]
    [gamma.api :as g]
    [gamma.program :as gprogram]
    [clojure.string :as string])

  (:require-macros [game.shared.macros :as macros :refer [defcom]]))

(def u-collision-res (g/uniform "uCollisionResolution" :vec2))
(def v-unit-index (g/varying "vUnitIndex" :float :highp))

; UNIT COLLISIONS SHADER

(def unit-collisions-vertex-shader
  {
    (g/variable "blah" :vec3) vertex-normal
    (g/variable "test" :vec2) vertex-uv
    (g/variable "nuff" :float) a-unit-index
    v-uv vertex-uv
    v-unit-index a-unit-index
    (g/gl-position)
    (let
      [unit-pos (get-unit-position a-unit-index)
       x (ge/x unit-pos)
       y (ge/y unit-pos)
       z (ge/z unit-pos)
       xn (g/* 2.0 (g/div x (ge/x u-map-size)))
       yn (g/* 2.0 (g/div z (ge/z u-map-size)))
       zn (g/div a-unit-index u-max-units)
       unit-center (g/vec3 xn yn zn)
       vertex-pos-scaled
         (g/* 10.0
          (g/div vertex-position
            (g/vec3 (ge/x u-collision-res) (ge/y u-collision-res) 1.0)))
       unit-pos (g/+ unit-center vertex-pos-scaled)]
      (g/vec4 (g/swizzle unit-pos :xy) zn 1.0))})

(def unit-collisions-fragment-shader
  {
    (g/gl-frag-color)
    (let
      [d (g/length (g/* 2.0 (g/- v-uv (g/vec2 0.5))))
       r (g/div v-unit-index u-max-units)]
      (g/if
        (g/<= d 1.0)
        (g/vec4 r r r r)
        (g/vec4 0 1 2 3)))})

(def unit-collisions-shader
  (gprogram/program
    {
      :vertex-shader unit-collisions-vertex-shader
      :fragment-shader unit-collisions-fragment-shader}))

; END SHADERS

(defn on-render
  [init-renderer component]
  (let
    [
     compute-shader (:compute-shader component)
     ; camera will be irrelevant
     quad (:quad compute-shader)
     renderer (data (:renderer init-renderer))
     engine (:engine2 component)
     physics (:physics component)
     scene (:collisions-scene physics)
     camera (:collisions-camera physics)
     collisions-rt (:collisions-rt physics)
     collisions-rt nil
     gl (-> renderer .-context)
     state (-> renderer .-state)
     mesh (:mesh physics)
     material (-> mesh .-material)]
    ;(-> quad .-material (set! init-material))

    ; Prepare
    (-> renderer (.setClearColor (new js/THREE.Color 0x000000) 1.0))
    (-> renderer (.clearTarget collisions-rt true true true))
    (-> renderer .-autoClear (set! false))
    (-> renderer .-autoClearColor (set! false))
    (-> renderer .-autoClearStencil (set! false))
    (-> renderer .-autoClearDepth (set! false))

    (-> state .-buffers .-stencil (.setTest false))

    ; Pass 1: Red
    (-> gl (.colorMask true false false false))
    (-> material .-depthFunc (set! js/THREE.LessDepth))
    (-> renderer (.render scene camera collisions-rt false))

    (-> state .-buffers .-stencil (.setTest true))
    (-> material .-depthFunc (set! js/THREE.GreaterDepth))
    ;(-> state .-buffers .-stencil (.setMask 0xFF))
    (-> state .-buffers .-stencil
      (.setFunc
        (-> gl .-EQUAL)
        (-> 0)
        (-> 0xFF)))
    (-> state .-buffers .-stencil
      (.setOp
        (-> gl .-KEEP)
        (-> gl .-KEEP)
        (-> gl .-INCR)))

    ; Pass 2: Green
    (-> renderer (.clearTarget collisions-rt false false true))
    (-> gl (.colorMask false true false false))
    (-> renderer (.render scene camera collisions-rt false))

    ; Pass 3: Blue
    (-> renderer (.clearTarget collisions-rt false false true))
    (-> gl (.colorMask false false true false))
    (-> renderer (.render scene camera collisions-rt false))

    ; Pass 4: Alpha
    (-> renderer (.clearTarget collisions-rt false false true))
    (-> gl (.colorMask false false false true))
    (-> renderer (.render scene camera collisions-rt false))

    ; Restore state
    (-> state .-buffers .-stencil (.setTest false))
    (-> gl (.colorMask true true true true))
    (-> renderer .-autoClear (set! true))
    (-> renderer .-autoClearColor (set! true))
    (-> renderer .-autoClearStencil (set! true))
    (-> renderer .-autoClearDepth (set! true))))

(defcom
  new-update-physics
  [compute-shader engine2 physics]
  []
  (fn [component]
    component)
  (fn [component]
    component))

(defn get-physics
  [component]
  (let
    [
     engine (:engine2 component)
     config (:config component)
     collision-res-x (get-in config [:physics :collision-res-x])
     collision-res-y (get-in config [:physics :collision-res-y])
     collisions-rt (new js/THREE.WebGLRenderTarget collision-res-x collision-res-y)
     collisions-scene (new js/THREE.Scene)
     mesh (:mesh engine)
     geo (-> mesh .-geometry)
     uniforms #js {}
     set-uniforms (:set-uniforms engine)
     set-uniforms2 (:set-uniforms2 engine)
     set-uniforms3
      (fn [uniforms]
        (aset uniforms
          (get-name u-collision-res)
          #js { :value (new js/THREE.Vector2 collision-res-x collision-res-y)}))
     _ (set-uniforms uniforms)
     _ (set-uniforms2 uniforms)
     _ (set-uniforms3 uniforms)
     material
      (new js/THREE.RawShaderMaterial
        #js
        {
          :uniforms uniforms
          :vertexShader (str preamble (:glsl (:vertex-shader unit-collisions-shader)))
          :fragmentShader
            (str preamble
              (units-shader-hack
                (:glsl (:fragment-shader unit-collisions-shader))))})
     mesh (new js/THREE.Mesh geo material)
     ; camera is irrelevant
     collisions-camera
      (new js/THREE.OrthographicCamera
        (/ collision-res-x -2)
        (/ collision-res-x 2)
        (/ collision-res-y 2)
        (/ collision-res-y -2)
        -10000
        10000)]
    (-> collisions-scene
      (.add mesh))
    (->
      component
      (assoc :collisions-scene collisions-scene)
      (assoc :collisions-rt collisions-rt)
      (assoc :collisions-camera collisions-camera)
      (assoc :mesh mesh))))

(defcom
  new-physics
  [config ground engine2]
  [collisions-rt
   collisions-scene
   collisions-camera
   mesh]
  (fn [component]
    (get-physics component))
  (fn [component]
    component))
