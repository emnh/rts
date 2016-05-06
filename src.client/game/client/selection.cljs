(ns ^:figwheel-always game.client.selection
  (:require
    [cljs.pprint :as pprint]
    [com.stuartsierra.component :as component]
    [jayq.core :as jayq :refer [$]]
    [promesa.core :as p]
    [cats.core :as m]
    [rum.core :as rum]
    [game.client.common :as common :refer [new-jsobj list-item data unique-id]]
    [game.client.config :as config]
    [game.client.controls :as controls]
    [game.client.engine :as engine]
    [game.client.renderer :as renderer]
    [game.client.routing :as routing]
    [game.client.scene :as scene]
    [game.client.ground-local :as ground-local]
    [sablono.core :as sablono :refer-macros [html]]
    [clojure.string :as string :refer [join]]
    [game.shared.state :as state :refer [with-simple-cause]]
    )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  )

(def LEFT_MOUSE_BUTTON 1)
(def MIDDLE_MOUSE_BUTTON 2)
(def RIGHT_MOUSE_BUTTON 3)

(defn get-bounding-box-geometry
  [mesh]
  (let
    ; TODO: generate bbox mesh elsewhere
    [bbox (-> mesh .-geometry .-boundingBox)
     geometry (new THREE.BoxGeometry 
                   (- (-> bbox .-max .-x) (-> bbox .-min .-x))
                   (- (-> bbox .-max .-y) (-> bbox .-min .-y))
                   (- (-> bbox .-max .-z) (-> bbox .-min .-z)))
     geo-translation (-> (new THREE.Vector3)
                       (.add (-> bbox .-min))
                       (.add (-> bbox .-max))
                       (.divideScalar 2))
     rotation-matrix (-> (new THREE.Matrix4)
                       (.makeRotationFromQuaternion 
                         (-> mesh .-quaternion)))
     scale-matrix (-> (new THREE.Matrix4) 
                    (.makeScale
                      (-> mesh .-scale .-x)
                      (-> mesh .-scale .-y)
                      (-> mesh .-scale .-z)))
     translation-matrix (-> (new THREE.Matrix4)
                          (.makeTranslation
                            (-> mesh .-position .-x)
                            (-> mesh .-position .-y)
                            (-> mesh .-position .-z)))
     ]
    (-> geometry (.translate
                   (-> geo-translation .-x)
                   (-> geo-translation .-y)
                   (-> geo-translation .-z)))
    (-> geometry (.applyMatrix rotation-matrix))
    (-> geometry (.applyMatrix scale-matrix))
    (-> geometry (.applyMatrix translation-matrix))
    geometry))

; http://stackoverflow.com/questions/17624021/determine-if-a-mesh-is-visible-on-the-viewport-according-to-current
(defn get-screen-boxes
  [component]
  (let
    [frustum (new THREE.Frustum)
     camera-view-projection-matrix (new THREE.Matrix4)
     camera (data (:camera component))
     screen-boxes #js []
     ]
    (-> camera .updateMatrixWorld)
    (-> camera .-matrixWorldInverse (.getInverse (-> camera .-matrixWorld)))
    (-> camera-view-projection-matrix
      (.multiplyMatrices (-> camera .-projectionMatrix) (-> camera .-matrixWorldInverse)))
    (-> frustum (.setFromMatrix camera-view-projection-matrix))
    (doseq
      [mesh (engine/get-unit-meshes (:units component))]
      (if
        (-> frustum (.intersectsObject mesh))
        (let
          [screen-box (new THREE.Box2)]
          (doseq [vertex (-> (get-bounding-box-geometry mesh) .-vertices)]
            (-> screen-box 
              (.expandByPoint
                (scene/world-to-screen (:renderer component) (:camera component) vertex))))
          (let
            [box #js [
                      (-> screen-box .-min .-x)
                      (-> screen-box .-min .-y)
                      (-> screen-box .-max .-x)
                      (-> screen-box .-max .-y)
                      ]]
            (-> screen-boxes (.push box))))))
      screen-boxes))

(defn
  check-intersect-screen
  [component x1 y1 x2 y2]
;  (println "check-intersect-screen" x1 y1 x2 y2)
  (let
    [screen-boxes (get-screen-boxes component)
     flat-selection-box #js [ #js [x1 y1 x2 y2]]
     selected-indices (js/boxIntersect screen-boxes flat-selection-box)
     units @(:units (:units component))]
    (doseq
      [[i j] selected-indices]
      (println "selected" (:name (:model (nth units i)))))))

(defn
  rectangle-select
  [component x2 y2 update]
  (if
    @(:selecting component)
    (let
      [start-pos @(:start-pos component)
       x1 (:x start-pos)
       y1 (:y start-pos)]
      (if update
        (reset! (:end-pos component) { :x x2 :y y2 }))
      (let
        [[x1 x2] (if (< x1 x2) [x1 x2] [x2 x1])
         [y1 y2] (if (< y1 y2) [y1 y2] [y2 y1])
         ]
        (if update
          (jayq/css
            (:$selection-div component)
            {
             :position "absolute"
             :left x1
             :top y1
             :width (- x2 x1)
             :height (- y2 y1)
             }
            ))
        (check-intersect-screen component x1 y1 x2 y2)))))

(defn
  on-mouse-down
  [component event-data]
  ;(-> event-data .preventDefault)
  (println "mouse-down")
  (cond
    (= (-> event-data .-which) LEFT_MOUSE_BUTTON)
    (let
      [eps 1
       x (-> event-data .-offsetX)
       y (-> event-data .-offsetY)]
      (reset! (:start-pos component) { :x (- x eps) :y (- y eps) })
      (reset! (:end-pos component) { :x (+ x eps) :y (+ y eps) })
      (reset! (:selecting component) true)
      (->
        (:$selection-div component)
        (.removeClass "invisible")
        (jayq/css
          {
           :position "absolute"
           :left x
           :top y
           :width eps
           :height eps
           }))
      (check-intersect-screen component (- x eps) (- y eps) (+ x eps) (+ y eps)))
    (= (-> event-data .-which RIGHT_MOUSE_BUTTON))
    (println "TODO")))

(defn
  on-mouse-move
  [component event-data]
  (let
    [x2 (-> event-data .-offsetX)
     y2 (-> event-data .-offsetY)]
    (rectangle-select component x2 y2 true)))

(defn on-mouse-up
  [component event-data]
  (reset! (:selecting component) false)
  (-> (:$selection-div component)
    (.addClass "invisible")))

(defcom
  new-selector
  [scene init-scene params $overlay renderer camera units]
  [$selection-div start-pos end-pos selecting]
  (fn [component]
    (let
      [$selection-div (or $selection-div ($ "<div/>"))
       start-pos (or start-pos (atom nil))
       selecting (or selecting (atom false))
       end-pos (or end-pos (atom nil))
       bindns (str "selector" (unique-id (aget (data $overlay) 0)))
       mousedownevt (str "mousedown." bindns)
       mousemoveevt (str "mousemove." bindns)
       mouseupevt (str "mouseup." bindns)
       selection-element (scene/get-view-element renderer)
       $page (:$page params)
       component
       (->
         component
         (assoc :selecting selecting)
         (assoc :start-pos start-pos)
         (assoc :end-pos end-pos)
         (assoc :$selection-div $selection-div))
       ]
      (controls/rebind (data $overlay) mousedownevt (partial on-mouse-down component))
      (controls/rebind (data $overlay) mousemoveevt (partial on-mouse-move component))
      (controls/rebind (data $overlay) mouseupevt (partial on-mouse-up component))
;      (controls/rebind ($ selection-element) mousedownevt (partial on-mouse-down component))
;      (controls/rebind ($ selection-element) mousemoveevt (partial on-mouse-move component))
      (-> $page (.append $selection-div))
      (-> $selection-div (.addClass "invisible"))
      (-> $selection-div (.addClass "selection-rect"))
      component))
  (fn [component] component))
