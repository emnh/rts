(ns ^:figwheel-always game.client.selection
  (:require
    [cljs.pprint :as pprint]
    [com.stuartsierra.component :as component]
    [jayq.core :as jayq :refer [$]]
    [promesa.core :as p]
    [cats.core :as m]
    [rum.core :as rum]
    [game.client.common :as common :refer [new-jsobj list-item data unique-id]]
    [game.client.controls :as controls]
    [game.client.engine :as engine]
    [game.client.scene :as scene]
    [game.client.math :as math :refer [pi]]
    [sablono.core :as sablono :refer-macros [html]]
    [clojure.string :as string :refer [join]]
    [game.shared.state :as state :refer [with-simple-cause]])

  (:require-macros
    [infix.macros :refer [infix]]
    [game.shared.macros :as macros :refer [defcom]]))


(def LEFT_MOUSE_BUTTON 1)
(def MIDDLE_MOUSE_BUTTON 2)
(def RIGHT_MOUSE_BUTTON 3)

(defn mark
  [component mesh]
  (if-let
    [circle (aget mesh "mark")]
    (do
      (-> circle .-visible (set! true))
      circle)
    (let
      [radius (-> mesh .-geometry .-boundingSphere .-radius)
       geometry (new THREE.CircleGeometry radius 32)
       mat (-> (new THREE.Matrix4) (.makeRotationX (/ pi -2)))
       _ (-> geometry (.applyMatrix mat))
       material (new THREE.MeshLambertMaterial #js { :color 0x00FF00 :opacity 0.5 :transparent true})
       circle (new THREE.Mesh geometry material)]
      (-> mesh (.add circle))
      (aset mesh "mark" circle)
      circle)))

(defn unmark-all
  [component]
  (doseq
    [selected @(:selected component)]
    (let
      [mesh (:mesh selected)
       mark (:mark selected)]
      (-> mark .-visible (set! false))))
  (reset! (:selected component) []))

; function belongs to alternative METHOD 1
(defn get-bounding-box-geometry
  ([mesh]
   (get-bounding-box-geometry mesh true))
  ([mesh clone?]
   (let
     [clone #(if clone? (.clone %) %)
      geometry
      (if
        (and
          (-> mesh (.hasOwnProperty "rts-bbox-geometry"))
          (not (undefined? (aget mesh "rts-bbox-geometry"))))
        (-> (aget mesh "rts-bbox-geometry") clone)
        (let
          [bbox (-> mesh .-geometry .-boundingBox)
           bbox-geometry (new THREE.BoxGeometry
                          (- (-> bbox .-max .-x) (-> bbox .-min .-x))
                          (- (-> bbox .-max .-y) (-> bbox .-min .-y))
                          (- (-> bbox .-max .-z) (-> bbox .-min .-z)))
           geo-translation (-> (new THREE.Vector3)
                             (.add (-> bbox .-min))
                             (.add (-> bbox .-max))
                             (.divideScalar 2))]

          (-> bbox-geometry (.translate
                             (-> geo-translation .-x)
                             (-> geo-translation .-y)
                             (-> geo-translation .-z)))
          (aset mesh "rts-bbox-geometry" bbox-geometry)
          (-> bbox-geometry clone)))]

     (if clone?
       (-> geometry (.applyMatrix (-> mesh .-matrixWorld))))
     geometry)))

; function belongs to alternative METHOD 1
; http://stackoverflow.com/questions/17624021/determine-if-a-mesh-is-visible-on-the-viewport-according-to-current
(defn get-screen-boxes
  [component]
  (let
    [frustum (new THREE.Frustum)
     camera-view-projection-matrix (new THREE.Matrix4)
     camera (data (:camera component))
     width @(get-in component [:scene-properties :width])
     height @(get-in component [:scene-properties :height])
     screen-boxes #js []]

    (-> camera .updateMatrixWorld)
    (-> camera .-matrixWorldInverse (.getInverse (-> camera .-matrixWorld)))
    (-> camera-view-projection-matrix
      (.multiplyMatrices (-> camera .-projectionMatrix) (-> camera .-matrixWorldInverse)))
    (-> frustum (.setFromMatrix camera-view-projection-matrix))
    (engine/for-each-unit
      (:units component)
      (fn [_ unit]
        (let
          [mesh (engine/get-unit-mesh unit)]
          (if
            (-> frustum (.intersectsObject mesh))
            (let
              [screen-box (new THREE.Box2)]
              (doseq [vertex (-> (get-bounding-box-geometry mesh) .-vertices)]
                (-> screen-box
                  (.expandByPoint
                    (scene/world-to-screen-fast width height camera-view-projection-matrix vertex))))
              (let
                [box #js [
                          (-> screen-box .-min .-x)
                          (-> screen-box .-min .-y)
                          (-> screen-box .-max .-x)
                          (-> screen-box .-max .-y)]]

                (aset box "mesh" mesh)
                (-> screen-boxes (.push box))))))))
    screen-boxes))

; function belongs to alternative METHOD 3
; http://stackoverflow.com/questions/21648630/radius-of-projected-sphere-in-screen-space
(defn get-screen-radius
  "get screen radius of 3d sphere"
  [height camera position r3]
  (let
    [fovy (-> camera .-fov)
     fov (infix (fovy / 2) * (π / 180.0))
     v (-> camera .-position .clone)
     _ (-> v (.sub position))
     d (-> v .length)
     r2 (infix (height / (2 * tan(fov))) * r3 / √(d * d - r3 * r3))]

    r2))

; function belongs to alternative METHOD 3
(defn get-screen-circles
  [component]
  (let
    [frustum (new THREE.Frustum)
     camera-view-projection-matrix (new THREE.Matrix4)
     camera (data (:camera component))
     width @(get-in component [:scene-properties :width])
     height @(get-in component [:scene-properties :height])]

    (-> camera .updateMatrixWorld)
    (-> camera .-matrixWorldInverse (.getInverse (-> camera .-matrixWorld)))
    (-> camera-view-projection-matrix
      (.multiplyMatrices (-> camera .-projectionMatrix) (-> camera .-matrixWorldInverse)))
    (-> frustum (.setFromMatrix camera-view-projection-matrix))
    (into
      []
      (remove
        nil?
        (engine/map-units
          (:units component)
          (fn [_ unit]
            (let
              [group (engine/get-unit-group unit)
               mesh (engine/get-unit-mesh unit)]
              (if
                (-> frustum (.intersectsObject mesh))
                (let
                  [screen-position
                   (scene/world-to-screen-fast width height camera-view-projection-matrix (-> group .-position))
                   r3 (-> mesh .-geometry .-boundingSphere .-radius)
                   screen-radius (get-screen-radius height camera (-> group .-position) r3)]

                  {
                   :x (-> screen-position .-x)
                   :y (-> screen-position .-y)
                   :r screen-radius
                   :mesh mesh})

                nil))))))))


; function belongs to alternative METHOD 1, as replacement for
; get-screen-boxes, but depends on pixi overlay rendering having called
; get-screen-boxes and stored the result
(defn get-screen-boxes-from-last-overlay-render
  [component]
  (let
    [units (:units component)
     boxes #js []]
    (doseq
      [box (vals @(:mesh-to-screenbox-map units))]
      (-> boxes (.push box)))
    boxes))

; function belongs to alternative METHOD 2
(defn
  frustum-check
  [component x1 y1 x2 y2]
  (let
    [camera (data (:camera component))
     z (-> camera .-near)
     screen-width @(:width (:scene-properties component))
     screen-height @(:height (:scene-properties component))
     x1 (- (* (/ x1 screen-width) 2) 1)
     x2 (- (* (/ x2 screen-width) 2) 1)
     y1 (+ (* (/ y1 screen-height) -2) 1)
     y2 (+ (* (/ y2 screen-height) -2) 1)
     proj-mat (new THREE.Matrix4)
     view-proj-mat (new THREE.Matrix4)
     frustum (new THREE.Frustum)]

    (-> camera .updateMatrixWorld)
    (-> camera .-matrixWorldInverse (.getInverse (-> camera .-matrixWorld)))
    (-> proj-mat
      (.makeFrustum x1 x2 y1 y2 (-> camera .-near) (-> camera .-far)))
    (-> view-proj-mat
      (.multiplyMatrices proj-mat (-> camera .-matrixWorldInverse)))
    (-> frustum
      (.setFromMatrix view-proj-mat))
    (unmark-all component)
    (reset!
      (:selected component)
      (into
        []
        (remove nil?
          (engine/map-units
            (:units component)
            (fn
              [_ unit]
              (let
                [mesh (engine/get-unit-mesh unit)]
                (if
                  (-> frustum (.intersectsObject mesh))
                  (let
                    [circle (mark component mesh)]
                    {
                     :unit (engine/get-unit-for-mesh (:units component) mesh)
                     :mesh mesh
                     :mark circle})

                  nil)))))))))

; function belongs to alternative METHOD 1
(defn
  check-intersect-screen
  [component x1 y1 x2 y2]
  (let
    [screen-boxes (get-screen-boxes component)
     flat-selection-box #js [ #js [x1 y1 x2 y2]]
     selected-indices (js/boxIntersect screen-boxes flat-selection-box)]
    (unmark-all component)
    (reset!
      (:selected component)
      (into
        []
        (for
          [[i j] selected-indices]
          (let
            [mesh (aget (nth screen-boxes i) "mesh")
             circle (mark component mesh)]
            {
             :unit (engine/get-unit-for-mesh (:units component) mesh)
             :mesh mesh
             :mark circle}))))))


; function belongs to alternative METHOD 3
; http://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection
(defn
  circle-rectangle-intersects?
  [circle rect-x1 rect-y1 rect-x2 rect-y2]
  (let
    [circle-x (:x circle)
     circle-y (:y circle)
     circle-r (:r circle)
     rect-width (infix rect-x2 - rect-x1)
     rect-height (infix rect-y2 - rect-y1)
     circle-distance-x (infix abs(circle-x - rect-x1 + rect-width / 2))
     circle-distance-y (infix abs(circle-y - rect-y1 + rect-height / 2))
     check1 #(infix circle-distance-x > (rect-width / 2 + circle-r))
     check2 #(infix circle-distance-y > (rect-height / 2 + circle-r))
     check3 #(infix circle-distance-x <= (rect-width / 2))
     check4 #(infix circle-distance-y <= (rect-height / 2))
     corner-distance-sq #(infix (circle-distance-x - rect-width / 2) ** 2 + (circle-distance-y - rect-height / 2) ** 2)
     check5 #(infix corner-distance-sq() <= circle-r ** 2)]

    (if
     (infix check1() || check2())
     false
     (if
       (infix check3() || check4())
       true
       (check5)))))

; function belongs to alternative METHOD 3
(defn
  check-intersect-screen-circles
  [component x1 y1 x2 y2]
  (let
    [screen-circles (get-screen-circles component)
     map-fn
     (fn [i circle]
       (if
         (circle-rectangle-intersects? circle x1 y1 x2 y2)
         i
         nil))
     selected-indices (remove nil? (map-indexed map-fn screen-circles))]
    (unmark-all component)
    (reset!
      (:selected component)
      (into
        []
        (for
          [i selected-indices]
          (let
            [mesh (:mesh (nth screen-circles i))
             circle (mark component mesh)]
            {
             :unit (engine/get-unit-for-mesh (:units component) mesh)
             :mesh mesh
             :mark circle}))))))


; METHOD 1 slow and accurate
; (def check-intersect check-intersect-screen)
; METHOD 2 fast and innacurate
;(def check-intersect frustum-check)
; METHOD 3 fast and accurate
(def check-intersect check-intersect-screen-circles)

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
      (reset! (:selecting? component) true)
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
  (reset! (:selecting? component) false)
  (-> (:$selection-div component)
    (.addClass "invisible")))

(defcom
  new-selector
  [scene init-scene params $overlay renderer camera units scene-properties]
  [$selection-layer $selection-div start-pos end-pos selecting? selected frame-queued?]
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
       component
       (->
         component
         (assoc :frame-queued? frame-queued?)
         (assoc :selected selected)
         (assoc :selecting? selecting?)
         (assoc :start-pos start-pos)
         (assoc :end-pos end-pos)
         (assoc :$selection-layer $selection-layer)
         (assoc :$selection-div $selection-div))]

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
