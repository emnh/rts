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
              [game.client.page-load-test :as page-load-test]
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

(defn
  on-change-healthbars
  [component event]
  (let
    [checked (-> event .-target .-checked)
     subsystem (:subsystem component)
     three-overlay (:three-overlay subsystem)
     healthbar-mesh-parent (:mesh-parent three-overlay)]
    (-> healthbar-mesh-parent .-visible (set! checked))))

(defn
  on-change-magicstars
  [component event]
  (let
    [checked (-> event .-target .-checked)
     subsystem (:subsystem component)
     units (:units subsystem)]
    (engine/for-each-unit
      units
      (fn [i unit]
        (-> (engine/get-unit-star unit) .-visible (set! checked))))))

(defn
  on-change-geometry
  [component event]
  (let
    [checked (-> event .-target .-checked)
     subsystem (:subsystem component)
     units (:units subsystem)]
    (engine/for-each-unit
      units
      (fn [i unit]
        (-> (engine/get-unit-regular-mesh unit) .-visible (set! checked))))))

(defn
  on-change-explosions
  [component event]
  (let
    [checked (-> event .-target .-checked)
     subsystem (:subsystem component)
     units (:units subsystem)]
    (engine/for-each-unit
      units
      (fn [i unit]
        (-> (engine/get-unit-explosion unit) .-visible (set! checked))))))

(rum/defc
  test-buttons < rum/static
  [component]
  [:ul { :class "vertical-list" }
   [:li [:a { :href "https://github.com/emnh/rts" } "Project On GitHub"] ]
   [:li
    [:input
     {
      :type "checkbox"
      :class ""
      :on-change (partial on-change-healthbars component)
      :value ""
      }]
    [:label "Health bars"]]
   [:li
    [:input
     {
      :type "checkbox"
      :class ""
      :on-change (partial on-change-magicstars component)
      :value ""
      }]
    [:label "Magic stars"]]
   [:li
    [:input
     {
      :type "checkbox"
      :class ""
      :on-change (partial on-change-geometry component)
      :value ""
      }]
    [:label "Unvoxelized geometry (some models only)"]]
   [:li
    [:input
     {
      :type "checkbox"
      :class ""
      :on-change (partial on-change-explosions component)
      :value ""
      :defaultChecked true
      }]
    [:label "Explosions"]]
   [:li
    "Control keys"
     [:ul
      [:li "Using browser full screen should maximize game canvas (F11 in Chrome)"]
      [:li "Arrow keys to move camera"]
      [:li "Ctrl+arrow keys to rotate camera"]
      [:li "PgUp/PgDn to zoom"]
      [:li "Home to reset view"]
      [:li "Drag mouse to select units"]
      ]]
   [:li [:div "Page load progress" ] (page-load-test/progress-list component)]
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
  [resources simplex progress-manager]
  [subsystem]
  start
  stop)
