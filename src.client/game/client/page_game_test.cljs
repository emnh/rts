(ns ^:figwheel-always game.client.page-game-test
    (:require
              [cljs.pprint :as pprint]
              [jayq.core :as jayq :refer [$]]
              [rum.core :as rum]
              [com.stuartsierra.component :as component]
              [cats.core :as m]
              [promesa.core :as p]
              [promesa.monad]
              [game.client.common :as common :refer [list-item header data]]
              [game.client.game :as game]
              [game.client.overlay :as overlay]
              [game.client.engine :as engine]
              [game.client.ground-local :as ground]
              [game.client.scene :as scene]
              [game.client.math :as math :refer [round]]
              [game.shared.state :as state :refer [with-simple-cause]]
              [sablono.core :as sablono :refer-macros [html]]
              )
  (:require-macros
    [infix.macros :refer [infix]]
    [game.shared.macros :as macros :refer [defcom]])
  )

(defn
  on-click-three-js
  [component event]
  (let
    [camera (data (get-in component [:subsystem :camera]))
     renderer (data (get-in component [:subsystem :renderer]))
     scene (data (get-in component [:subsystem :scene]))
     ]
    (-> renderer (.render scene camera))))

(defn
  on-click-pixi-js
  [component event]
  (println "pixi js")
  (let
    [pixi-renderer (get-in component [:subsystem :pixi-overlay :pixi-renderer])
     pixi-stage (get-in component [:subsystem :pixi-overlay :stage])
     pixi-overlay (get-in component [:subsystem :pixi-overlay])
     init-renderer (get-in component [:subsystem :init-renderer])]
    (overlay/on-render init-renderer pixi-overlay)
    (-> pixi-renderer (.render pixi-stage))))


(rum/defc
  test-buttons < rum/static
  [component]
  [:ul
   [:li [:button {
            :type "button"
            :class "btn btn-primary"
            :on-click (partial on-click-three-js component)
            } "Render Three.js"]]
   [:li [:button {
            :type "button"
            :class "btn btn-primary"
            :on-click (partial on-click-pixi-js component)
            } "Render Pixi.js"]]
   ])

(rum/defc
  game-test < rum/static
  [component]
  (let
    [h (header "Game Test")]
    (html [:div { :class "container" }
           h
           [:div
            {
             :id "game"
             }
            ]
          (test-buttons component)
           ])))

(defcom
  new-ground-balls
  [ground scene init-scene]
  []
  (fn [component]
    (let
      [x-faces (:x-faces ground)
       y-faces (:y-faces ground)
       width (:width ground)
       height (:height ground)
       geometry (new js/THREE.SphereGeometry 1 4 4)
       material (new js/THREE.MeshBasicMaterial #js { :color 0xFF0000 })]
      (doseq
        [x (range x-faces)
         y (range y-faces)]
        (let
          [xpos (infix x * width / x-faces - width / 2)
           zpos (infix y * height / y-faces - height / 2)
           ypos (ground/get-height ground xpos zpos)
           mesh (new js/THREE.Mesh geometry material)
           ]
          (scene/add scene mesh)
          (doto
            (-> mesh .-position)
            (aset "x" xpos)
            (aset "y" ypos)
            (aset "z" zpos)
            ))))
    component)
  (fn [component]
    component))

(defn new-test-system
  [subsystem]
  subsystem)
;    (update :ground-balls #(or % (new-ground-balls)))

(defn start
  [component]
  ; we mount rum twice, first to get #game element which subsystem will use,
  ; then with component containing started subsystem for rum event handlers to
  ; use
  (rum/mount (game-test component) (aget (:$page component) 0))
  (let
    [params
     {
      :$page ($ "#game")
      :simplex (data (:simplex component))
      }
     subsystem
     (->
       (if-let
         [s (:subsystem component)]
         (-> s (assoc :params params))
         (game/new-system params))
       (new-test-system)
       (assoc :resources (merge {} (:resources component))))
     subsystem (with-simple-cause #(component/start-system subsystem))
     component (assoc component :subsystem subsystem)]
    (rum/mount (game-test component) (aget (:$page component) 0))
    component))

(defn stop [component]
  (if-let
    [page (aget (:$page component) 0)]
    (rum/unmount page))
  (let
    [subsystem
      (if-let
        [s (:subsystem component)]
        (with-simple-cause
          #(component/stop-system s)))
     component (assoc component :subsystem subsystem)]
    component))

(defcom
  new-game-test
  [resources simplex]
  [subsystem]
  start
  stop)
