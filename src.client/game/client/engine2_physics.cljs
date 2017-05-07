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
         get-unit-position-index
         vertex-normal
         get-name
         a-unit-index
         u-map-size
         u-max-units
         u-max-units-res
         units-shader-hack]]
    [gamma.api :as g]
    [gamma.program :as gprogram]
    [clojure.string :as string])

  (:require-macros [game.shared.macros :as macros :refer [defcom]]))

(def u-collision-res (g/uniform "uCollisionResolution" :vec2))
(def v-unit-index (g/varying "vUnitIndex" :float :highp))
(def v-collision-value (g/varying "vCollisionValue" :vec3 :highp))

(def a-fragment-index (g/attribute "aFragmentIndex" :float))

(def t-units-collisions (g/uniform "tUnitsCollisions" :sampler2D))

; TODO: get bounding sphere radius
(def bounding-sphere-radius 10.0)

; UNIT COLLISIONS SHADER

(def unit-collisions-vertex-shader
  {
    ; decoy variables to declare attributes
    (g/variable "pos" :vec3) vertex-position
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
         (g/* bounding-sphere-radius
          (g/div vertex-position
            (g/vec3 (ge/x u-collision-res) (ge/y u-collision-res) 1.0)))
       unit-pos (g/+ unit-center vertex-pos-scaled)]
      (g/vec4 (g/swizzle unit-pos :xy) zn 1.0))})

; we want zero to indicate that no unit is there
(defn encode-unit-index
  [unit-index]
  (g/div (g/+ 1.0 unit-index) u-max-units))

(defn decode-unit-index
  [unit-index]
  (g/- (g/* unit-index u-max-units) 1.0))

(def unit-collisions-fragment-shader
  {
    (g/gl-frag-color)
    (let
      [d (g/length (g/* 2.0 (g/- v-uv (g/vec2 0.5))))
       r (encode-unit-index v-unit-index)]
      (g/if
        (g/<= d 1.0)
        (g/vec4 r r r r)
        (g/vec4 0 1 2 3)))})

(def unit-collisions-shader
  (gprogram/program
    {
      :vertex-shader unit-collisions-vertex-shader
      :fragment-shader unit-collisions-fragment-shader}))

; UNIT COLLISIONS SUMMATION

(defn get-collision-fragment-2d-index
  [index]
  (let
    [x (g/mod index (ge/x u-collision-res))
     x (g/div x (ge/x u-collision-res))
     y (g/floor (g/div index (ge/x u-collision-res)))
     y (g/div y (ge/y u-collision-res))]
    (g/vec2 x y)))

(defn get-collision-fragment
  [index]
  (g/texture2D t-units-collisions (get-collision-fragment-2d-index index)))

(def unit-collision-pairs
  (into
    []
    (for
      [a [:x :y :z :w]
       b [:x :y :z :w]
       :when (not= a b)]
      [a b])))

; 12
(def collisions-per-fragment
  (count unit-collision-pairs))

(def units-per-fragment 4)

;(println ["unit-collisions-potentials" unit-collision-potentials])
(defn swizzle-by-index-2
  [vector4 index]
  (g/if
    (g/== index 0)
    (ge/x vector4)
    (g/if
      (g/== index 1)
      (ge/y vector4)
      (g/if
        (g/== index 2)
        (ge/z vector4)
        (ge/w vector4)))))

(defn swizzle-by-index
  [vector4 index]
  (g/if
    (g/== index 0)
    (ge/x vector4)
    (g/if
      (g/== index 1)
      (ge/y vector4)
      (ge/z vector4))))

(def coll-vs-extra-vars (atom {}))

(def unit-collisions-summation-vertex-shader
  (let
    [collision-per-fragment-index (g/mod a-fragment-index collisions-per-fragment)
     unit-per-fragment-index (g/mod collision-per-fragment-index units-per-fragment)
     fragment-index (g/div (g/- a-fragment-index collision-per-fragment-index) units-per-fragment)
     fragment (get-collision-fragment fragment-index)

     unit-a-val (swizzle-by-index fragment unit-per-fragment-index)
     unit-a (g/variable "unit_a" :float)
     _ (swap! coll-vs-extra-vars assoc unit-a unit-a-val)

     ;unit-a (swizzle-by-index fragment unit-per-fragment-index)

     unit-a-index (decode-unit-index unit-a)
     unit-a-pos (get-unit-position unit-a-index)

     uv (get-unit-position-index unit-a-index)
     uv (g/vec2 (g/+ (ge/x uv) unit-per-fragment-index) (ge/y uv))
     vpos (g/div (g/+ (g/swizzle vertex-position :xy) (g/vec2 0.5)) u-max-units-res)
     uv (g/+ uv vpos)
     collisions
       (for
        [unit-per-fragment-index2 [0 1 2 3]]
        (let
          [unit-b-val (swizzle-by-index fragment unit-per-fragment-index2)
           unit-b (g/variable (str "unit_b_" unit-per-fragment-index2) :float)
           _ (swap! coll-vs-extra-vars assoc unit-b unit-b-val)
           unit-b-index (decode-unit-index unit-b)
           unit-b-pos (get-unit-position unit-b-index)
           dv (g/- unit-a-pos unit-b-pos)
           pos-delta (g/variable (str "unit_ab_" unit-per-fragment-index2) :vec3)
           pos-delta-value
            (g/if
              (g/== unit-per-fragment-index unit-per-fragment-index2)
              (g/vec3 0.0)
              (g/if
                (g/and
                  (g/> unit-a 0)
                  (g/> unit-b 0))
                dv
                (g/vec3 0.0)))
           _ (swap! coll-vs-extra-vars assoc pos-delta pos-delta-value)]
          pos-delta))
      value (reduce g/+ collisions)]
    (merge
      @coll-vs-extra-vars
      {
        v-collision-value value
        (g/variable "pos" :vec3) vertex-position
        (g/variable "blah" :vec3) vertex-normal
        (g/variable "test" :vec2) vertex-uv
        (g/gl-position) (g/vec4 uv 1.0 1.0)})))

; (println ["ast" unit-collisions-summation-vertex-shader])
(ge/test-shader unit-collisions-summation-vertex-shader)

(def unit-collisions-summation-fragment-shader
  {
    (g/gl-frag-color) (g/vec4 1 1 1 1)})

(def unit-collisions-summation-shader
  (gprogram/program
    {
      :vertex-shader unit-collisions-summation-vertex-shader
      :fragment-shader unit-collisions-summation-fragment-shader}))

(defn reverse-subst-vars
  [glsl vars]
  (let
    [new-mappings
      (reduce-kv
        (fn [d k v]
          (assoc d k
            (nth
              (re-find (re-pattern (str (get-name k) " = (v[0-9]+)")) glsl)
              1)))
        {}
        vars)]
    ;(println ["new-mappings" new-mappings])
    (reduce-kv
      (fn [glsl k v]
        (string/replace
          glsl
          (str (get new-mappings k) " = ")
          (str (get-name k) " = ")))
      glsl
      vars)))

(def unit-collisions-summation-shader-vs
  (->
    (:glsl (:vertex-shader unit-collisions-summation-shader))
    (reverse-subst-vars @coll-vs-extra-vars)))

; (println
;   ["unit-collisions-summation-vertex-shader"
;     unit-collisions-summation-shader-vs])

  ;  (:glsl (:vertex-shader unit-collisions-summation-shader))])

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
     ;collisions-rt nil
     gl (-> renderer .-context)
     state (-> renderer .-state)
     mesh (:mesh physics)
     material (-> mesh .-material)
     summation-scene (:summation-scene physics)
     summation-target (:summation-target physics)]
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
    (-> renderer .-autoClearDepth (set! true))

    ;(-> renderer (.render summation-scene camera summation-target true))
    (-> renderer (.render summation-scene camera))))

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
     pars
     #js
       {
         :wrapS js/THREE.ClampToEdgeWrapping
         :wrapT js/THREE.ClampToEdgeWrapping
         :minFilter js/THREE.NearestFilter
         :magFilter js/THREE.NearestFilter
         :format js/THREE.RGBAFormat
         :type js/THREE.FloatType
         :stencilBuffer true}
     collisions-rt (new js/THREE.WebGLRenderTarget collision-res-x collision-res-y pars)
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
     set-uniforms4
      (fn [uniforms]
        (aset uniforms
          (get-name t-units-collisions)
          #js { :value (-> collisions-rt .-texture)}))
     _ (set-uniforms uniforms)
     _ (set-uniforms2 uniforms)
     _ (set-uniforms3 uniforms)
     material
      (new js/THREE.RawShaderMaterial
        #js
        {
          :uniforms uniforms
          :vertexShader
            (str preamble
              (:glsl (:vertex-shader unit-collisions-shader)))
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
        10000)
     proto-geo (new js/THREE.PlaneBufferGeometry 1 1 1 1)
     summation-geo (new js/THREE.InstancedBufferGeometry)
     _
      (do
        (-> summation-geo (.addAttribute "position" (-> proto-geo (.getAttribute "position"))))
        (-> summation-geo (.addAttribute "normal" (-> proto-geo (.getAttribute "normal"))))
        (-> summation-geo (.addAttribute "uv" (-> proto-geo (.getAttribute "uv"))))
        (-> summation-geo (.setIndex (-> proto-geo .-index))))
     max-collision-fragments
      (*
        (* collision-res-x collision-res-y)
        collisions-per-fragment)
     ;fragment-index-array (new js/Float32Array max-collision-fragments)
     fragment-index-array (new js/Float32Array 10)
     _
      (do
         (doseq
           [i (range max-collision-fragments)]
           (aset fragment-index-array i i))
         (-> summation-geo
           (.addAttribute
             (get-name a-fragment-index)
             (new js/THREE.InstancedBufferAttribute fragment-index-array 1))))
     summation-uniforms #js {}
     _ (set-uniforms summation-uniforms)
     _ (set-uniforms2 summation-uniforms)
     _ (set-uniforms3 summation-uniforms)
     _ (set-uniforms4 summation-uniforms)
     rx (:rx engine)
     ry (:ry engine)
     pars2
     #js
       {
         :wrapS js/THREE.ClampToEdgeWrapping
         :wrapT js/THREE.ClampToEdgeWrapping
         :minFilter js/THREE.NearestFilter
         :magFilter js/THREE.NearestFilter
         :format js/THREE.RGBAFormat
         :type js/THREE.FloatType
         :stencilBuffer false}
     summation-target (new js/THREE.WebGLRenderTarget rx ry pars2)
     summation-material
      (new js/THREE.RawShaderMaterial
        #js
        {
          :uniforms summation-uniforms
          :vertexShader
            (str preamble
              unit-collisions-summation-shader-vs)
              ;(:glsl (:vertex-shader unit-collisions-summation-shader)))
          :fragmentShader
            (str preamble
              (:glsl (:fragment-shader unit-collisions-summation-shader)))})
     summation-scene (new js/THREE.Scene)
     summation-mesh (new js/THREE.Mesh summation-geo summation-material)]
    (-> collisions-scene
      (.add mesh))
    (-> summation-scene
      (.add summation-mesh))
    (->
      component
      (assoc :collisions-scene collisions-scene)
      (assoc :collisions-rt collisions-rt)
      (assoc :collisions-camera collisions-camera)
      (assoc :mesh mesh)
      (assoc :summation-target summation-target)
      (assoc :summation-mesh summation-mesh)
      (assoc :summation-scene summation-scene))))

(defcom
  new-physics
  [config ground engine2]
  [collisions-rt
   collisions-scene
   collisions-camera
   mesh
   summation-target
   summation-scene
   summation-mesh]
  (fn [component]
    (get-physics component))
  (fn [component]
    component))
