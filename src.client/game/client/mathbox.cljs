(ns ^:figwheel-always game.client.mathbox
  (:require
    [cljs.pprint :as pprint]
    [com.stuartsierra.component :as component]
    [game.client.math :as math :refer [floor isNaN]]
    [game.client.common :as common :refer [data]]
    [game.client.config :as config])
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
  [config params renderer scene init-scene camera]
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
         scaleY (get-in config [:terrain :max-elevation])
         scaleZ (/ (get-in config [:terrain :height]) 2.0)
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
                :position #js [0 300 0]
                :rotation #js [(/ math/pi -2.0) 0 0]
                ;:scale #js [ 256 256 256]}))]
                :scale #js [ scaleX scaleZ scaleY]}))]
        ;(-> scene (.add mesh))
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
        (-> view
          (.grid
            #js
            {
              :divideX 30
              :width scaleX
              :opacity 1.0
              :zBias -5
              :zOrder -5
              :zTest false}))
        (-> component
          (assoc :context context)
          (assoc :view view)))
      component))
  (fn [component]
    component))
