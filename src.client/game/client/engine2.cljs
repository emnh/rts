(ns ^:figwheel-always game.client.engine2
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
    [game.client.compute_shader :as compute_shader
      :refer
        [preamble
         projection-matrix
         model-view-matrix
         vertex-position
         v-uv
         v-uv-normalized
         vertex-uv
         vertex-normal
         t-copy-rt
         u-copy-rt-scale]]
    [game.client.engine2_explosion :as engine2_explosion]
    [gamma.api :as g]
    [gamma.program :as gprogram]
    [clojure.string :as string])

  (:require-macros [game.shared.macros :as macros :refer [defcom]]))

(def a-unit-index (g/attribute "unitIndex" :float))

(def u-time (g/uniform "uTime" :float))

(def u-map-size (g/uniform "uMapSize" :vec3))
(def u-max-units (g/uniform "uMaxUnits" :float))
(def u-max-units-res (g/uniform "uMaxUnitsResolution" :vec2))

; x is model-count, y model-count-pow2
(def u-model-count (g/uniform "uModelCount" :vec2))
; TODO: rename to t-unit-positions
(def t-units-position (g/uniform "tUnitsPosition" :sampler2D))
(def t-unit-attributes (g/uniform "tUnitAttributes" :sampler2D))

(def u-ground-texture-divisor (g/uniform "uGroundTextureDivisor" :float))
(def u-water-texture-divisor (g/uniform "uWaterTextureDivisor" :float))
(def u-water-threshold (g/uniform "uWaterThreshold" :float))
(def u-ground-resolution (g/uniform "tGroundResolution" :vec2))
(def t-ground-height (g/uniform "tGroundHeight" :sampler2D))
(def t-water-height (g/uniform "tWaterHeight" :sampler2D))

(def t-model-sprite (g/uniform "tModelSprite" :sampler2D))
;(def t-model-explosion (g/uniform "tModelExplosion" :sampler2D))
(def t-model-attributes (g/uniform "tModelAttributes" :sampler2D))

; boolean
(def v-selected (g/varying "vSelected" :float :lowp))

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

; model 0 indicates inactive unit

(defn encode-model
  [model]
  (g/+ 1 model))

(defn decode-model
  [model]
  (g/- model 1))

(defn get-bounding-box-size-and-sphere
  [model]
  (g/texture2D
    t-model-attributes
    (g/vec2
      0
      (g/div
        model
        (ge/y u-model-count)))))

(defn get-ground-height
  [x z]
  (let
    [tw (ge/x u-map-size)
     th (ge/z u-map-size)
     x (g/div (g/+ x (g/div tw 2)) tw)
     z (g/div (g/+ z (g/div th 2)) th)
     v (g/vec2 x z)
     ground (ge/x (g/texture2D t-ground-height v))
     ground (g/* ground u-ground-texture-divisor)
     water (ge/x (g/texture2D t-water-height v))
     water
      ; (ge/fake_if
      ;   (g/> water u-water-threshold)
      (g/+
        (g/* water u-water-texture-divisor)
        (g/* u-ground-texture-divisor u-water-threshold))]
        ; 0.0]
    (g/vec2 (g/max ground water) (ge/fake_if (g/> ground water) 1.0 0.0))))

(defn get-ground-alignment
  [x z unit-index-vec2]
  (let
    [unit-pos-and-model (g/texture2D t-units-position unit-index-vec2)
     model (decode-model (ge/w unit-pos-and-model))
     ground-height-and-is-ground (get-ground-height x z)
     ground-height (ge/x ground-height-and-is-ground)
     is-ground (ge/y ground-height-and-is-ground)
     bbox-and-radius (get-bounding-box-size-and-sphere model)
     ; radius (ge/w bbox-and-radius)
     radius (g/* (g/* (ge/y bbox-and-radius) 0.5) is-ground)
     y (g/+ ground-height (g/* 1 radius))]
    y))

(defn get-unit-position-index
  [index]
  (let
    [x (g/mod index (ge/x u-max-units-res))
     x (g/div x (ge/x u-max-units-res))
     y (g/floor (g/div index (ge/x u-max-units-res)))
     y (g/div y (ge/y u-max-units-res))]
    (g/vec2 x y)))

(defn get-unit-position
  [index]
  (g/swizzle
    (g/texture2D t-units-position (get-unit-position-index index))
    :xyz))

(defn get-unit-position-and-model
  [index]
  (g/texture2D t-units-position (get-unit-position-index index)))

(defn get-unit-selected
  [index]
  (ge/x
    (g/texture2D t-unit-attributes (get-unit-position-index index))))

(def units-vertex-shader
  (let
    [unit-pos-and-model (get-unit-position-and-model a-unit-index)
     unit-pos (g/swizzle unit-pos-and-model :xyz)
     model (decode-model (ge/w unit-pos-and-model))
     selected (get-unit-selected a-unit-index)
     x (ge/x unit-pos)
     y (ge/y unit-pos)
     z (ge/z unit-pos)
     unit-pos (g/vec3 x y z)
     v (g/mat4 model-view-matrix)
     camera-right-worldspace
      (g/vec3
        (ge/aget (ge/aget v 0) 0)
        (ge/aget (ge/aget v 1) 0)
        (ge/aget (ge/aget v 2) 0))
     camera-up-worldspace
      (g/vec3
        (ge/aget (ge/aget v 0) 1)
        (ge/aget (ge/aget v 1) 1)
        (ge/aget (ge/aget v 2) 1))
     v-pos unit-pos
     ;plane-position (g/+ vertex-position (g/vec3 0.0 0.5 0.0))
     plane-position (g/+ vertex-position (g/vec3 0.0 0.0 0.0))
     bbox-and-radius (get-bounding-box-size-and-sphere model)
     bbox (g/swizzle bbox-and-radius :xyz)
     radius (ge/w bbox-and-radius)
     size-x (ge/x bbox)
     size-y (ge/y bbox)
     size-z (ge/z bbox)
     ;size-xz (g/div (g/+ size-x size-z) 2.0)
     size-xz size-x
     size radius
     ;offset (g/div (g/- size size-y) size)
     ;plane-position (g/+ plane-position (g/vec3 0 offset 0))
     ;plane-position (g/* plane-position (g/vec3 size-xz size-y 0.0))
     plane-position (g/* plane-position (g/vec3 size))
     v-pos
      (g/+
        v-pos
        (g/*
          (g/* camera-right-worldspace (ge/x plane-position))
          1))
     v-pos
      (g/+
        v-pos
        (g/*
          (g/* camera-up-worldspace (ge/y plane-position))
          1))
     glpos
      (->
      ;  (g/* projection-matrix model-view-matrix)
       (g/* projection-matrix model-view-matrix)
       (g/* (g/vec4 v-pos 1)))
     uv vertex-uv
     uvx
     (g/div
       (g/+ model (ge/x uv))
       (ge/y u-model-count))
     uvy (ge/y uv)
     uv (g/vec2 uvx uvy)]
     ;glpos (g/div glpos (g/vec4 (ge/w glpos)))]

     ;xy (g/swizzle glpos :xy)
     ;xy (g/+ xy (g/* (g/swizzle vertex-position :xy) (g/vec2 0.01 0.01)))
     ;glpos (g/vec4 xy (ge/z glpos) (ge/w glpos))]
   {
     ; decoy variables to declare attributes
     (g/variable "blah" :vec3) vertex-normal
     (g/variable "test" :vec2) vertex-uv
     (g/variable "nuff" :float) a-unit-index
     v-uv uv
     v-uv-normalized vertex-uv
     v-selected selected
     (g/gl-position) glpos}))

(def discard-magic
  ; magic number, will be replaced by discard
  (g/vec4 0 1 2 3))

(defn units-shader-hack
  [glsl]
  (string/replace glsl #"\n.*vec4\(0.0, 1.0, 2.0, 3.0\)\);" "\ndiscard;"))

(def circle-width 0.05)
(def circle-min (- 1.0 (* 2 circle-width)))
(def circle-mid (- 1.0 (* 1 circle-width)))

(def units-fragment-shader
  (let
    [tex (g/texture2D t-model-sprite v-uv)
     d (g/length (g/* 2.0 (g/- v-uv-normalized (g/vec2 0.5))))
     a
     (g/div
       (g/- 1.0 (g/div (g/abs (g/- d circle-mid)) circle-width))
       1.5)]
    {
      ;(g/variable "time" :float) u-time
      (g/gl-frag-color)
      ;(ge/gfunc :explosionMainImage :vec4 v-uv-normalized)}))
      (g/if
        (g/and
          (g/> v-selected 0)
          (g/and
            (g/>= d circle-min)
            (g/<= d 1.0)))
        (g/vec4 0 1 0 a)
        (g/if
          (g/> (ge/w tex) 0.1)
          (g/* tex (g/vec4 1.0))
          discard-magic))}))

(let
  [
   units-program
   (gprogram/program
     {
       :vertex-shader units-vertex-shader
       :fragment-shader units-fragment-shader})]
  (def units-shader-vs
    (str preamble (:glsl (:vertex-shader units-program))))
  (def units-shader-fs
    (str
      preamble
      ;engine2_explosion/fragment-shader
      (units-shader-hack (:glsl (:fragment-shader units-program))))))

; POSITION INITIALIZE SHADER

(def unit-positions-init-vertex-shader simple-vertex-shader)

(def unit-positions-init-fragment-shader
  (let
    [
      uv (g/div (g/swizzle (g/gl-frag-coord) :xy) u-max-units-res)
      ir1
        (g/+
          (g/*
            (ge/x uv)
            (ge/x u-max-units-res))
          (ge/y uv))
      ir2 (g/* 137 ir1)
        ; (g/*
        ;   (g/*
        ;     (ge/y uv)
        ;     (ge/y u-max-units-res))
        ;   (ge/x uv))
      rnd-f #(g/- (ge/random %) 0.5)
      x (g/* (rnd-f ir1) (ge/x u-map-size))
      ;y (ge/y u-map-size)
      z (g/* (rnd-f ir2) (ge/z u-map-size))
      ; w is model index
      w
      (g/mod
        (g/+
          (g/*
            (ge/x (g/gl-frag-coord))
            (ge/y u-max-units-res))
          (ge/y (g/gl-frag-coord)))
        (ge/x u-model-count))
      w (g/floor w)
      w (encode-model w)
      ; x (rnd-f ir1)
      ; z (rnd-f ir2)
      ; x 0
      ; z 0
      ; x (g/* (ge/x u-map-size) (g/- (ge/x uv) 0.5))
      ; z (g/* (ge/z u-map-size) (g/- (ge/y uv) 0.5))
      ;x (g/* (g/- (ge/x uv) 0.5) (ge/x u-map-size))
      ;z (g/* (g/- (ge/y uv) 0.5) (ge/z u-map-size))
      y (get-ground-alignment x z uv)]
    {
      (g/gl-frag-color) (g/vec4 x y z w)}))

(def unit-positions-init-shader
  (gprogram/program
    {
      :vertex-shader unit-positions-init-vertex-shader
      :fragment-shader unit-positions-init-fragment-shader}))

; (println
;   ["unit-vertex-shader"
;    (:glsl (:vertex-shader units-shader))])

; (println
;   ["unit-fragment-shader"
;    (:glsl (:fragment-shader units-shader))])
;
; (println
;   ["unit-fragment-shader"
;    (units-shader-hack (:glsl (:fragment-shader units-shader)))])
;
;(println (:glsl (:vertex-shader unit-positions-init-shader)))
;(println (:glsl (:fragment-shader unit-positions-init-shader)))

; END OF SHADERS. BEGIN ENGINE.

(defn on-render
  [init-renderer component]
  (let
    [
     compute-shader (:compute-shader component)
     render-count (:render-count component)
     scene (:scene compute-shader)
     compute-camera (:camera compute-shader)
     quad (:quad compute-shader)
     renderer (data (:renderer init-renderer))
     engine (:engine2 component)
     render-target1 (:units-rt1 engine)
     init-material (:init-material engine)
     mesh (:mesh engine)
     material (-> mesh .-material)
     camera (data (:camera component))
     position (-> camera .-position .clone)
     focus (scene/get-camera-focus camera 0 0)]
    (if
      (= @render-count 0)
      (do
        (-> quad .-material (set! init-material))
        (-> renderer (.render scene compute-camera render-target1 true))))
    (-> position (.sub focus))
    (-> position .normalize)
    ; XXX: quick hack to avoid z-fighting with ground when
    ; billboards are viewed from the top.
    ; Seems fixed now, so disabled.
    ; (if
    ;   (> (-> position .-y) 1.0)
    ;   (-> material .-depthTest (set! false))
    ;   (-> material .-depthTest (set! true)))
    (->
      (aget
        (-> material .-uniforms)
        (get-name u-time))
      .-value
      (set! (common/game-time)))
    (swap! render-count inc)))

(defcom
  new-update-units
  [compute-shader engine2 camera]
  [render-count]
  (fn [component]
    (->
      component
      (assoc :render-count (atom 0))))
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
         :minFilter js/THREE.NearestFilter
         :magFilter js/THREE.NearestFilter
         :format js/THREE.RGBAFormat
         ; TODO: check for support
         :type js/THREE.FloatType
         :depthBuffer false
         :stencilBuffer false}
     width (config/get-terrain-width config)
     height (config/get-terrain-height config)
     elevation (get-in config [:terrain :max-elevation])
     map-size (new js/THREE.Vector3 width elevation height)
     units-rt1 (new js/THREE.WebGLRenderTarget rx ry pars)
     units-rt2 (new js/THREE.WebGLRenderTarget rx ry pars)
     ; TODO: reuse the same target texture when they are same size
     unit-attrs1 (new js/THREE.WebGLRenderTarget rx ry pars)
     unit-attrs2 (new js/THREE.WebGLRenderTarget rx ry pars)
     proto-geo (new js/THREE.PlaneBufferGeometry 1 1 1 1)
     ;proto-geo (new js/THREE.SphereBufferGeometry 500 32 32)
     ;proto-geo (new js/THREE.BoxBufferGeometry 5 5 5)
     geo (new js/THREE.InstancedBufferGeometry)
     index-array (new js/Float32Array max-units)
     ground (:ground component)
     water (:water component)
     ground-resolution
      (new js/THREE.Vector2
        (:x-faces ground)
        (:y-faces ground))
     uniforms #js {}
     resource-list (get-in component [:resources :resource-list])
     model-count (count resource-list)
     model-count-pow2 (math/round-pow2 model-count)
     rgba-size 4
     attribute-count 1
     total-attributes (* model-count-pow2 attribute-count rgba-size)
     model-attributes-array (new js/Float32Array total-attributes)
    ;  _
    ;  (doseq
    ;    [i (range total-attributes)]
    ;    (aset
    ;      model-attributes-array
    ;      i
    ;      0.0))
     create-model-attributes
     (fn []
       (new js/THREE.DataTexture
         model-attributes-array
         attribute-count
         model-count-pow2
         js/THREE.RGBAFormat
         js/THREE.FloatType))
     ;_ (-> model-attributes .-needsUpdate (set! true))
     model-attributes (create-model-attributes)
     water-texture-multiplier
     (-> (:mesh water) .-material .-uniforms .-uWaterElevation .-value)
     ; (/
     ;   (-> (:mesh water) .-material .-uniforms .-uWaterElevation .-value)
     ;   (-> (:mesh water) .-material .-uniforms .-uWaterMultiplier .-value)))
     set-uniforms
      (fn [base-uniforms]
         (aset base-uniforms (get-name u-time) #js { :value 0})
         (aset base-uniforms (get-name u-map-size) #js { :value map-size})
         (aset base-uniforms (get-name u-model-count) #js { :value (new js/THREE.Vector2 model-count model-count-pow2)})
         (aset base-uniforms (get-name u-max-units) #js { :value max-units})
         (aset base-uniforms (get-name u-max-units-res) #js { :value (new js/THREE.Vector2 rx ry)})
         (aset base-uniforms (get-name u-ground-texture-divisor) #js { :value (:float-texture-divisor ground)})
         ; TODO: get water divisor value from water.cljs
         (aset base-uniforms (get-name u-water-texture-divisor) #js { :value water-texture-multiplier})
         (aset base-uniforms (get-name u-water-threshold) #js { :value (-> (:mesh water) .-material .-uniforms .-uWaterThreshold .-value)})
         (aset base-uniforms (get-name u-ground-resolution) #js { :value ground-resolution})
         (aset base-uniforms (get-name t-ground-height) #js { :value (:data-texture ground) :needsUpdate true})
         (aset base-uniforms (get-name t-water-height) #js { :value (-> (:mesh water) .-material .-uniforms .-tWaterHeight .-value) :needsUpdate true}))
     set-uniforms2
      (fn [uniforms]
        (aset uniforms (get-name t-units-position) #js { :value (-> units-rt1 .-texture)})
        (aset uniforms (get-name t-unit-attributes) #js { :value (-> unit-attrs1 .-texture)})
        (aset uniforms (get-name t-model-sprite) #js { :value nil})
        (aset uniforms (get-name t-model-attributes) #js { :value model-attributes}))
     _ (set-uniforms uniforms)
     _ (set-uniforms2 uniforms)
     material
      (new js/THREE.RawShaderMaterial
        #js
        {
          :uniforms uniforms
          :vertexShader units-shader-vs
          :fragmentShader units-shader-fs
          :transparent true})
          ;:depthTest false})
          ;:depthWrite false})
     update-model-attributes
     (fn
      []
      (let
        []
        (->
         (aget
           (-> material .-uniforms)
           (get-name t-model-attributes))
         .-value
         (set! model-attributes))
        (->
         (aget
           (-> material .-uniforms)
           (get-name t-model-attributes))
         .-needsUpdate
         (set! true))
        (-> model-attributes .-needsUpdate (set! true))
        (-> material .-needsUpdate (set! true))))
     wrapping (-> js/THREE .-ClampToEdgeWrapping)
     texture-loader (new THREE.TextureLoader)
     on-load
      (fn [texture]
        (-> texture .-wrapS (set! wrapping))
        (-> texture .-wrapT (set! wrapping))
        (-> material
          .-uniforms
          (aget (get-name t-model-sprite))
          .-value (set! texture))
        (-> material .-needsUpdate (set! true)))
     _ (-> texture-loader (.load "models/images/tree.png" on-load))
     init-uniforms #js {}
     _ (set-uniforms init-uniforms)
     init-material
      (new js/THREE.RawShaderMaterial
        #js
        {
          :uniforms init-uniforms
          :vertexShader (str preamble (:glsl (:vertex-shader unit-positions-init-shader)))
          :fragmentShader (str preamble (:glsl (:fragment-shader unit-positions-init-shader)))})]
   ; Update model attributes: Bounding sphere
   (doseq
     [[index model] (map-indexed vector resource-list)]
     (m/mlet
       [geometry (:load-promise model)]
       (let
         [
          ; x (-> geometry .-boundingSphere .-center .-x)
          ; y (-> geometry .-boundingSphere .-center .-y)
          ; z (-> geometry .-boundingSphere .-center .-z)
          x
          (-
            (-> geometry .-boundingBox .-max .-x)
            (-> geometry .-boundingBox .-min .-x))
          y
          (-
            (-> geometry .-boundingBox .-max .-y)
            (-> geometry .-boundingBox .-min .-y))
          z
          (-
            (-> geometry .-boundingBox .-max .-z)
            (-> geometry .-boundingBox .-min .-z))
          w (-> geometry .-boundingSphere .-radius)
          bounding-sphere [x y z w]]
         (doseq
           [i (range rgba-size)]
           (aset
             model-attributes-array
             (+ i (* index (* attribute-count rgba-size)))
             (nth bounding-sphere i))))
       (update-model-attributes)))
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
    (assoc :unit-attrs1 unit-attrs1)
    (assoc :unit-attrs2 unit-attrs2)
    (assoc :mesh (new js/THREE.Mesh geo material))
    (assoc :init-material init-material)
    (assoc :set-uniforms set-uniforms)
    (assoc :set-uniforms2 set-uniforms2)
    (assoc :rx rx)
    (assoc :ry ry))))

(defcom
  new-engine
  [config ground resources water]
  [units-rt1 units-rt2
   unit-attrs1 unit-attrs2
   mesh
   init-material
   set-uniforms
   set-uniforms2
   rx ry]
  (fn [component]
    (get-engine component))
  (fn [component]
    component))
