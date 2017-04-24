(ns ^:figwheel-always game.client.mathbox
  (:require
    [cljs.pprint :as pprint]
    [com.stuartsierra.component :as component]
    [game.client.math :as math :refer [floor isNaN]]
    [game.client.common :as common :refer [data]]
    [game.client.config :as config]
    [game.client.engine :as engine])
  (:require-macros
    [infix.macros :refer [infix]]
    [game.shared.macros :as macros :refer [defcom]]))

(def attack-shader
  "
vec4 getSample(vec4 xyz);

uniform float time;
uniform vec3 dataResolution;
uniform vec3 dataSize;

// Simple random function
float random(float co)
{
		return fract(sin(co*12.989) * 43758.545);
}

vec3 getFramesSample(vec4 index) {
  vec4 newIndex = index;
  newIndex.w = 0.0;
  vec4 a = getSample(newIndex);
  newIndex.w = 1.0;
  vec4 b = getSample(newIndex);

  float rnd = random(a.x + a.y + a.z);

  float t = fract(rnd + time); //(sin(time) + 1.0) / 2.0;
  float npos = clamp(index.w * 0.1 + t, 0.0, 1.0);
  vec4 c = mix(a, b, npos);

  float tn = (npos - 0.5) * 2.0;
  float yt = tn * tn;
  float height = 1.5 * distance(a, b);
  float zpos = height + c.z - yt * height;
  c.z = zpos;

  return c.xyz;
}
")

(defn on-render
  [init-renderer component]
  (let
    [
      mathbox (:mathbox component)
      context (:context mathbox)]
    (-> context .frame)))

(defcom
  new-update-mathbox
  [mathbox]
  []
  (fn [component]
    component)
  (fn [component]
    component))

(defcom
  new-mathbox
  [config params renderer scene init-scene camera units]
  [context view]
  (fn [component]
    (if-not
      (:started component)
      (let
        [renderer (data renderer)
         scene (data scene)
         camera (data camera)
         context (-> (new js/MathBox.Context renderer scene camera) .init)
         width (-> renderer .-domElement .-width)
         height (-> renderer .-domElement .-height)
         _ (-> context (.resize #js { :viewWidth width :viewHeight height}))
         mathbox (-> context .-api)
         sphere (new js/THREE.SphereBufferGeometry 0.3 32 32)
         material (new js/THREE.MeshLambertMaterial #js { :color 0x0000FF})
         mesh (new js/THREE.Mesh sphere material)
         fov (-> camera .-fov)
         scaleX (/ (get-in config [:terrain :width]) 2.0)
         scaleY (* (get-in config [:terrain :max-elevation]) 2.0)
         scaleZ (/ (get-in config [:terrain :height]) 2.0)
         xyz-size 3
         item-size 2
         curve-items 16
         data1 #js []
         data2 #js []
         view
          (-> mathbox
            (.set
              #js
              {
                :focus 3
                :fov fov})
            (.cartesian
              #js
              {
                :range
                  #js
                  [
                    #js [(- 1) 1]
                    #js [(- 1) 1]
                    #js [(- 1) 1]]
                :position #js [0 0 0]
                :rotation #js [(/ math/pi -2.0) 0 0]
                :scale #js [ scaleX scaleZ scaleY]}))
          num-arrows 10
          attack-arrows
            (fn
              [offset]
              (-> view
                (.shader
                  #js
                  {
                    :sources #js ["#sampler3"]
                    :code attack-shader}
                  #js
                  {
                    :time (fn [t] (+ (/ t 5.0) offset))})
                (.resample
                  #js
                  {
                    :items 2
                    :indices 4
                    :channels 3})
                (.vector
                  #js
                  {
                    ;:color 0x3090FF
                    :colors "#vcolors"
                    :width (/ scaleX 2.0)
                    :end true})))]
        (-> js/DEBUG .-data (set! data))
        (-> view
          (.array
            #js
            {
              :id "sampler3"
              :width 0
              :data data1
              :items 2
              :channels 4}))
        (-> view
          (.array
            #js
            {
              :id "vcolors"
              :width 0
              :data data2
              :items 2
              :channels 4}))
        (doseq
          [i (range num-arrows)]
          (attack-arrows (/ i num-arrows)))
        (->
          (:all-units-promise units)
          (.then
            (fn
              []
              (println "units loaded")
              (engine/for-each-unit
                units
                (fn [i unit]
                  (engine/for-each-unit
                    units
                    (fn [i2 unit2]
                      (if
                        (> i i2)
                        (let
                          [
                           pos (engine/get-unit-position unit)
                           xpos (/ (-> pos .-x) (/ scaleX 1.0))
                           ypos (/ (-> pos .-z) (/ scaleZ -1.0))
                           zpos (/ (engine/get-unit-top unit) scaleY)
                           pos2 (engine/get-unit-position unit2)
                           xpos2 (/ (-> pos2 .-x) (/ scaleX 1.0))
                           ypos2 (/ (-> pos2 .-z) (/ scaleZ -1.0))
                           zpos2 (/ (engine/get-unit-top unit2) scaleY)
                           dist (-> pos (.distanceTo pos2))
                           start (new js/THREE.Vector3 xpos ypos zpos)
                           end (new js/THREE.Vector3 xpos2 ypos2 zpos2)
                           r (+ (math/random) 0.5)
                           g (+ (math/random) 0.5)
                           b (+ (math/random) 0.5)]
                          (if
                            (< dist 200.0)
                            (do
                              (-> data1 (.push #js [xpos ypos zpos 1]))
                              (-> data1 (.push #js [xpos2 ypos2 zpos2 1]))
                              (-> data2 (.push #js [r g b 1]))
                              (-> data2 (.push #js [r g b 1]))))))))))
              (->
                (-> mathbox (.select "#vcolors"))
                (.set "width" (-> data1 .-length))))))
        (-> js/DEBUG .-mathbox (set! mathbox))
        (-> js/DEBUG .-mathbox-view (set! view))
        (-> component
          (assoc :context context)
          (assoc :view view)))
      component))
  (fn [component]
    component))
