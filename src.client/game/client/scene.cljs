(ns ^:figwheel-always game.client.scene
  (:require
    [cljs.pprint :as pprint]
    [jayq.core :as jayq :refer [$]]
    [game.client.config :as config]
    [game.client.common :as common :refer [data]]
    [com.stuartsierra.component :as component]
    )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  (:refer-clojure :exclude [remove]))

(enable-console-print!)

(def page-class "game-content")

(defn on-resize
  [onresize event]
  ; (println "Resize called")
  (let
    [
     fullscreen? 
     (<= 
       (or
        (-> js/screen .-availHeight) 
        (- (-> js/screen .-height) 30))
       (-> js/window .-innerHeight))
     config (:config onresize)
     $container (get-in onresize [:params :$page])
     width
     (if fullscreen?
       (.-innerWidth js/window)
       (.width $container))
     height
     (if fullscreen?
       (.-innerHeight js/window)
       (.height $container))
     scene (data (:renderer onresize))
     scene (data (:scene onresize))
     camera (data (:camera onresize))
     renderer (data (:renderer onresize))
     $overlay (data (:$overlay onresize))
     ]
    (-> renderer (.setSize width height))
    (-> ($ (-> renderer .-domElement)) (.width width))
    (-> ($ (-> renderer .-domElement)) (.height height))
    (if
      fullscreen?
      (do
        (-> ($ (str "." page-class))
          (.addClass "fullscreen"))
        (-> ($ "body")
          (.addClass "fullscreen")))
      (do
        (-> ($ (str "." page-class))
          (.removeClass "fullscreen"))
        (-> ($ "body")
          (.removeClass "fullscreen"))))
    (-> camera .-aspect (set! (/ width height)))
    (-> camera .updateProjectionMatrix)
    (-> $overlay (.width width))
    (-> $overlay (.height height))
    ))

(defcom
  new-on-resize
  [config scene camera renderer params $overlay init-scene]
  []
  (fn [component]
    (on-resize component nil)
    (-> ($ js/window)
      (.unbind "resize.gameResize")
      (.bind "resize.gameResize" (partial on-resize component)))
    component)
  (fn [component]
    (-> ($ js/window)
      (.unbind "resize.gameResize"))
    component))

(defcom
  new-init-stats
  [params render-stats physics-stats]
  []
  (fn [component]
    (let
      [
       render-stats (data render-stats)
       physics-stats (data physics-stats)
       $render-stats ($ (-> render-stats .-domElement))
       $physics-stats ($ (-> physics-stats .-domElement))
       $container (:$page params)
       ]
      (-> $container (.append $render-stats))
      (-> $render-stats (.addClass page-class))
      (-> $render-stats (.addClass "render-stats"))
      (jayq/css
        $render-stats
        {
         :top 0
         :z-index 100
         })
      (-> $container (.append $physics-stats))
      (-> $physics-stats (.addClass page-class))
      (-> $physics-stats (.addClass "physics-stats"))
      (jayq/css
        $physics-stats
        {
         :top "50px"
         :z-index 100
         })
      component))
  (fn [component]
    (-> ($ (str "." page-class)) .remove)
    component))

(defn add
  [scene item]
  (.add (data scene) item))

(defn remove
  [scene item]
  (.remove (data scene) item))

(defn stop-scene
  [component]
  (-> ($ (str "." page-class)) .remove)
  (assoc component :done false)
  )

(defcom
  new-init-scene
  ; depends on init-stats because stats elements must be appended first
  [params renderer $overlay camera scene config ground physics-stats init-stats]
  [done]
  (fn [component]
    (.append (:$page params) (-> (data renderer) .-domElement))
    (.append (:$page params) (data $overlay))
    (if-not done
      (let
        [$physics-stats ($ (-> (data physics-stats) .-domElement))
         margin-top (+
                      (-> $physics-stats .position .-top)
                      (-> $physics-stats .height))
         margin-top (str (- margin-top) "px")]

        (doto
          (data renderer)
          (-> .-shadowMap .-enabled (set! true))
          (-> .-shadowMap .-soft (set! true))
          (#(-> ($ (-> % .-domElement)) (.addClass page-class)))
          (#(jayq/css
            ($ (-> % .-domElement))
            {
             :top 0
             :z-index 0
             })))
        (doto
          (data $overlay)
          (.addClass page-class)
          (jayq/css
            {
             :top 0
             :left 0
             :z-index 1
             }))
        (add scene (data camera))
        (-> (data camera) .-position (.copy (get-in config [:controls :origin])))
        (let
          [x (-> (data scene) .-position .-x)
           y (-> (data scene) .-position .-y)
           z (-> (data scene) .-position .-z)
           pos (new THREE.Vector3 x y z)]
          (-> (data camera) (.lookAt pos)))
        (let
          [mesh (:mesh ground)
           newmesh (new THREE.Mesh (.-geometry mesh) (.-material mesh))
           ]
          (add scene newmesh))
        (assoc component :done true))
      component))
  (fn [component]
    (-> ($ (str "." page-class)) .remove)
    (assoc component :done false)))

(defn get-camera
  []
  (let
     [
      width 100  ; will be set correctly later by resize
      height 100 ; will be set correctly later by resize
      FOV 35
      frustumFar 1000000
      frustumNear 1
      ]
      (new js/THREE.PerspectiveCamera FOV (/ width height) frustumNear frustumFar)))

(defrecord InitLight [config scene light1 light2 light3 light4]
  component/Lifecycle
  (start [component]
    (let
      [
       light1 (data light1)
       light2 (data light2)
       light3 (data light3)
       light4 (data light4)
       origin (-> (data scene) .-position)
       ]
;      (-> light1 .-color (set! (new js/THREE.Color 0xAAAAAA)))
      (-> light1 .-color (set! (new js/THREE.Color 0xFFFFFF)))
      (-> light2 .-color (set! (new js/THREE.Color 0x00FF00)))
      (-> light3 .-color (set! (new js/THREE.Color 0x0000FF)))
      (-> light4 .-color (set! (new js/THREE.Color 0x220000)))
      (-> light1 .-position (.set 5 10 -4))
      (-> light2 .-position (.set 5 0 -4))
      (-> light3 .-position (.set -10 10 10))
      (-> light4 .-position (.set 0 10 0))
      (-> light1 .-target .-position (.copy origin))
      (-> light2 .-target .-position (.copy origin))
      (-> light3 .-target .-position (.copy origin))
      (-> light4 .-target .-position (.copy origin))
      (-> light1 .-castShadow (set! true))
      (-> light2 .-castShadow (set! true))
      (-> light3 .-castShadow (set! true))
      (-> light4 .-castShadow (set! true))
      (-> light1 .-shadow .-camera .-left (set! (- (config/get-terrain-width config))))
      (-> light1 .-shadow .-camera .-top (set! (- (config/get-terrain-height config))))
      (-> light1 .-shadow .-camera .-right (set! (+ (config/get-terrain-width config))))
      (-> light1 .-shadow .-camera .-bottom (set! (+ (config/get-terrain-height config))))
      (-> light1 .-shadow .-camera .-near (set! (-> (get-camera) .-near)))
      (-> light1 .-shadow .-camera .-far (set! (-> (get-camera) .-far)))
      (-> light1 .-shadow .-bias (set! -0.0001))
      (-> light1 .-shadow .-mapSize .-width (set! 2048))
      (-> light1 .-shadow .-mapSize .-height (set! 2048))
      (add scene light1)
;      (add scene light2)
;      (add scene light3)
;      (add scene light4)
      (-> light1 (.lookAt origin))
      (-> light2 (.lookAt origin))
      (-> light3 (.lookAt origin))
      (-> light4 (.lookAt origin))
      )
    component)
  (stop [component]
    (if
      (not= (data scene) nil)
      (do
        (remove scene light1)
        (remove scene light2)
        (remove scene light3)
        (remove scene light4)))
    component))

(defn new-init-light
  []
  (component/using
    (map->InitLight {})
    [:config :scene :light1 :light2 :light3 :light4]))

(defn get-view-element
  [renderer]
  (-> (data renderer) .-domElement)
  )

(defn get-camera-focus
  [camera x y]
  (let
    [v (new js/THREE.Vector3 x y (-> camera .-near))
     _ (-> v (.unproject camera))
     dir (-> v (.sub (-> camera .-position)) .normalize)
     distance (/ (- (-> camera .-position .-y)) (-> dir .-y))
     pos (-> (-> camera .-position .clone) (.add (-> dir (.multiplyScalar distance))))
     ]
    pos))
