(ns ^:figwheel-always game.client.engine2_selection
  (:require
    [cljs.pprint :as pprint]
    [com.stuartsierra.component :as component]
    [promesa.core :as p]
    [cats.core :as m]
    [jayq.core :as jayq :refer [$]]
    [game.client.common :as common :refer [new-jsobj list-item data unique-id]]
    [game.client.ground-local :as ground]
    [game.client.config :as config]
    [game.client.controls :as controls]
    [game.client.math :as math :refer [pi]]
    [game.client.gamma_ext :as ge :refer [get-name]]
    [game.client.scene :as scene]
    [game.client.compute_shader :as compute_shader
      :refer
        [preamble
         projection-matrix
         model-view-matrix
         vertex-position
         v-uv
         vertex-uv
         vertex-normal
         t-copy-rt
         u-copy-rt-scale]]
    [game.client.engine2 :as engine2
      :refer
        [
         get-unit-position
         get-unit-position-index
         a-unit-index
         u-map-size
         u-max-units
         u-max-units-res
         units-shader-hack
         discard-magic
         t-units-position
         get-ground-height
         encode-model
         decode-model
         t-unit-attributes]]
    [gamma.api :as g]
    [gamma.program :as gprogram]
    [clojure.string :as string])

  (:require-macros
    [infix.macros :refer [infix]]
    [game.shared.macros :as macros :refer [defcom]]))

(def u-selection-rectangle (g/uniform "uSelectionRectangle" :vec4))
(def u-selecting? (g/uniform "uSelecting" :float))

; BEGIN SHADERS

(def selection-vertex-shader
  {
    (g/gl-position)
    (->
      (g/* projection-matrix model-view-matrix)
      (g/* (g/vec4 vertex-position 1)))})

(def selection-fragment-shader
  (let
    [
     uv (g/div (g/swizzle (g/gl-frag-coord) :xy) u-max-units-res)
     position-and-model (g/texture2D t-units-position uv)
     position (g/swizzle position-and-model :xyz)
     attr
     (ge/fake_if
       (g/> u-selecting? 0)
       (g/vec4 1)
       (g/vec4 0))]
    {
      (g/gl-frag-color) attr}))

(let
  [
   selection-program
   (gprogram/program
     {
       :vertex-shader selection-vertex-shader
       :fragment-shader selection-fragment-shader})]
  (def selection-shader-vs
    (str
      preamble
      (->
        (:glsl (:vertex-shader selection-program)))))
  (def selection-shader-fs
    (str
      preamble
      (->
        (:glsl (:fragment-shader selection-program))))))

; END SHADERS

(defn on-render
  [init-renderer component]
  (let
    [compute-shader (:compute-shader component)
     renderer (data (:renderer init-renderer))
     compute-camera (:camera compute-shader)
     compute-scene (:scene compute-shader)
     quad (:quad compute-shader)
     selector (:selector2 component)
     selection-material (:selection-material selector)
     engine (:engine2 component)
     unit-attrs1 (:unit-attrs1 engine)
     unit-attrs2 (:unit-attrs2 engine)
     copy-material (:copy-material compute-shader)]

    ; Update unit-attrs2
    (-> quad .-material (set! selection-material))
    (-> renderer (.render compute-scene compute-camera unit-attrs2 true))

    ; Copy unit-attrs2 to unit-attrs1
    ; TODO: make a function for this
    (-> quad .-material (set! copy-material))
    (aset
      (-> copy-material .-uniforms)
      (get-name t-copy-rt)
      #js { :value (-> unit-attrs2 .-texture)})
    (aset
      (-> copy-material .-uniforms)
      (get-name u-copy-rt-scale)
      #js { :value (new js/THREE.Vector4 1 1 1 1)})
    (-> renderer (.render compute-scene compute-camera unit-attrs1 true))))

(defcom new-update-selection
  [compute-shader engine2 selector2]
  []
  (fn [component]
    component)
  (fn [component]
    component))

(def LEFT_MOUSE_BUTTON 1)
(def MIDDLE_MOUSE_BUTTON 2)
(def RIGHT_MOUSE_BUTTON 3)

(defn check-intersect
  [component x1 y1 x2 y2]
  (reset! (:selection-rectangle component) [x1 y1 x2 y2])
  (aset
    (-> component :selection-material .-uniforms)
    (get-name u-selection-rectangle)
    #js {:value (new js/THREE.Vector4 x1 y1 x2 y2)}))

(defn set-selecting
  [component value]
  (reset! (:selecting? component) value)
  (aset
    (-> component :selection-material .-uniforms)
    (get-name u-selecting?)
    #js {:value (if value 1 0)}))

(defn
  rectangle-select
  [component x2 y2 update]
  (reset! (:frame-queued? component) false)
  (if
    @(:selecting? component)
    (let
      [start-pos @(:start-pos component)
       x1 (:x start-pos)
       y1 (:y start-pos)]
      (if update
        (reset! (:end-pos component) { :x x2 :y y2}))
      (let
        [[x1 x2] (if (< x1 x2) [x1 x2] [x2 x1])
         [y1 y2] (if (< y1 y2) [y1 y2] [y2 y1])]

        (if update
          (jayq/css
            (:$selection-div component)
            {
             :left x1
             :top y1
             :width (- x2 x1)
             :height (- y2 y1)}))

        (check-intersect component x1 y1 x2 y2)))))

(defn
  on-mouse-down
  [component event-data]
  ;(-> event-data .preventDefault)
  (cond
    (= (-> event-data .-which) LEFT_MOUSE_BUTTON)
    (let
      [eps 1
       x (-> event-data .-offsetX)
       y (-> event-data .-offsetY)]
      (reset! (:start-pos component) { :x (- x eps) :y (- y eps)})
      (reset! (:end-pos component) { :x (+ x eps) :y (+ y eps)})
      ;(reset! (:selecting? component) true)
      (set-selecting component true)
      (->
        (:$selection-div component)
        (.removeClass "invisible")
        (jayq/css
          {
           :left x
           :top y
           :width eps
           :height eps}))

      (check-intersect component (- x eps) (- y eps) (+ x eps) (+ y eps)))
    (= (-> event-data .-which) RIGHT_MOUSE_BUTTON)
    (do
      (println "TODO")
      (-> event-data .preventDefault))))

(defn
  on-mouse-move
  [component event-data]
  (let
    [x2 (-> event-data .-offsetX)
     y2 (-> event-data .-offsetY)]
    (if-not @(:frame-queued? component)
      (reset! (:frame-queued? component) true)
      (js/requestAnimationFrame #(rectangle-select component x2 y2 true)))))

(defn on-mouse-up
  [component event-data]
  ;(reset! (:selecting? component) false)
  (set-selecting component false)
  (-> (:$selection-div component)
    (.addClass "invisible")))

(defcom
  new-selector
  [scene init-scene params $overlay renderer camera scene-properties
   engine2]
  [$selection-layer $selection-div start-pos end-pos selecting? selected frame-queued?
   selection-rectangle]
  (fn [component]
    (let
      [$selection-div (or $selection-div ($ "<div/>"))
       $selection-layer (or $selection-layer ($ "<canvas/>"))
       start-pos (or start-pos (atom nil))
       selecting? (or selecting? (atom false))
       selected (or selected (atom []))
       end-pos (or end-pos (atom nil))
       frame-queued? (or frame-queued? (atom false))
       bindns (str "selector" (unique-id (aget (data $overlay) 0)))
       mousedownevt (str "mousedown." bindns)
       mousemoveevt (str "mousemove." bindns)
       mouseupevt (str "mouseup." bindns)
       mousedblclickevt (str "dblclick." bindns)
       contextevt (str "contextmenu." bindns)
       selection-element (scene/get-view-element renderer)
       $page (:$page params)
       unit-attrs1 (:unit-attrs1 engine2)
       selection-uniforms #js {}
       _
       (do
         (aset selection-uniforms
           (get-name u-selection-rectangle)
           #js {:value (new js/THREE.Vector4 0 0 0 0)})
         (aset selection-uniforms
           (get-name u-selecting?)
           #js {:value 0})
         (aset selection-uniforms
           (get-name t-unit-attributes)
           #js {:value (-> unit-attrs1 .-texture)}))
       selection-material
       (new js/THREE.RawShaderMaterial
         #js
         {
           :uniforms selection-uniforms
           :vertexShader selection-shader-vs
           :fragmentShader selection-shader-fs})
       component
       (->
         component
         (assoc :frame-queued? frame-queued?)
         (assoc :selected selected)
         (assoc :selecting? selecting?)
         (assoc :start-pos start-pos)
         (assoc :end-pos end-pos)
         (assoc :$selection-layer $selection-layer)
         (assoc :$selection-div $selection-div)
         (assoc :selection-rectangle (atom [0 0 0 0]))
         (assoc :selection-material selection-material))]

      (-> (data $overlay) (.after $selection-layer))
      (-> $selection-layer (.addClass scene/page-class))
      (-> $selection-layer (.addClass "autoresize"))
      (-> $selection-layer (.addClass "selection-layer"))
      (controls/rebind $selection-layer mousedownevt (partial on-mouse-down component))
      (controls/rebind $selection-layer mousemoveevt (partial on-mouse-move component))
      (controls/rebind $selection-layer mouseupevt (partial on-mouse-up component))
      (controls/rebind $selection-layer contextevt controls/prevent-default)
      (controls/rebind $selection-layer mousedblclickevt controls/prevent-default)
      (-> $page (.append $selection-div))
      (-> $selection-div (.addClass scene/page-class))
      (-> $selection-div (.addClass "invisible"))
      (-> $selection-div (.addClass "selection-rect"))
      component))
  (fn [component] component))
