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
         ;_ (println ["renderer" renderer])
         ;_ (println ["scene" scene])
         ;_ (println ["camera" camera])
         context (-> (new js/MathBox.Context renderer scene camera) .init)
         width (-> renderer .-domElement .-width)
         height (-> renderer .-domElement .-height)
         _ (-> context (.resize #js { :viewWidth width :viewHeight height}))
         mathbox (-> context .-api)
         sphere (new js/THREE.SphereBufferGeometry 0.3 32 32)
         material (new js/THREE.MeshLambertMaterial #js { :color 0x0000FF})
         mesh (new js/THREE.Mesh sphere material)
         ;_ (-> camera .-position (.set 0 3 0))
         ;_ (-> camera (.lookAt (new js/THREE.Vector3 0 0 0)))
         fov (-> camera .-fov)
         scaleX (/ (get-in config [:terrain :width]) 2.0)
         scaleY (* (get-in config [:terrain :max-elevation]) 2.0)
         scaleZ (/ (get-in config [:terrain :height]) 2.0)
         ;units-units (engine/get-units units)
         ;unit-count (count units-units)
         xyz-size 3
         item-size 2
         ;data-size (* unit-count xyz-size item-size)
         data #js []
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
                ;:scale #js [ 256 256 256]}))]
                :scale #js [ scaleX scaleZ scaleY]}))]
        ;(-> scene (.add mesh))
        (-> js/DEBUG .-data (set! data))
        (-> view
          (.axis #js { :detail 30}))
        (-> view
          (.axis #js { :axis 2}))
        (-> view
          (.scale #js { :divide 10}))
        (-> view
          (.ticks
            #js
            { :classes #js [ "foo" "bar"]
              :width 2}))
        ; (-> view
        ;   (.grid
        ;     #js
        ;     {
        ;       :divideX 30
        ;       :width scaleX
        ;       :opacity 1.0
        ;       :zBias -5
        ;       :zOrder -5
        ;       :zTest false}))
        (-> view
          (.interval
            #js
            {
              :id "sampler"
              :width 64
              :channels 2
              :expr
                (fn
                  [emit x i time delta]
                  (let
                    [z 1]
                    (emit x (- z))
                    (emit x z)))}))
        (-> view
          (.area
            #js
            {
              :id "sampler2"
              :height 16
              :width 16
              :channels 3
              :items 3
              :expr
                (fn
                  [emit x y i j time delta]
                  (let
                    [z 1]
                    (emit x y 0)
                    (emit x y z)
                    (emit (+ x 0.05) y z)))}))
        (-> view
          (.array
            #js
            {
              :id "sampler3"
              ;:width (/ (-> data .-length) 2.0)
              :width 0
              :data data
              :items 2
              :channels 3}))
        (->
          (:all-units-promise units)
          (.then
            (fn
              []
              (println "units loaded")
              (engine/for-each-unit
                units
                (fn [i unit]
                  (let
                    [idx (* i item-size)
                     group (engine/get-unit-group unit)
                     pos (engine/get-unit-position unit)
                     xpos (/ (-> pos .-x) (/ scaleX 1.0))
                     ypos (/ (-> pos .-z) (/ scaleZ -1.0))
                     ;zpos (/ (-> group .-position .-y) scaleY)
                     zpos (/ (engine/get-unit-top unit) scaleY)
                     zpos2 (+ zpos 0.1)]
                    (-> data (.push #js [xpos ypos zpos]))
                    (-> data (.push #js [xpos ypos zpos2])))))
              (->
                (-> mathbox (.select "#sampler3"))
                (.set "data" data)))))
        (-> view
          (.vector
            #js
            {
              :points "#sampler3"
              :color 0x3090FF
              ;:depth scaleX
              :width (/ scaleX 2.0)
              ;:width 1
              :end true}))
        (-> js/DEBUG .-mathbox (set! mathbox))
        (-> js/DEBUG .-mathbox-view (set! view))
        (-> component
          (assoc :context context)
          (assoc :view view)))
      component))
  (fn [component]
    component))
