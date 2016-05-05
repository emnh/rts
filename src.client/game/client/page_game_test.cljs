(ns ^:figwheel-always game.client.page-game-test
    (:require
              [cljs.pprint :as pprint]
              [jayq.core :as jayq :refer [$]]
              [rum.core :as rum]
              [com.stuartsierra.component :as component]
              [promesa.core :as p]
              [game.client.common :as common :refer [list-item header data]]
              [game.client.config :as config]
              [game.client.game :as game]
              [game.client.ground-local :as ground]
              [game.client.scene :as scene]
              [game.client.math :as math :refer [round]]
              [game.client.progress-manager
               :as progress-manager
               :refer [get-progress-map]]
              [game.client.routing :as routing]
              [game.shared.state :as state :refer [with-simple-cause]]
              [sablono.core :as sablono :refer-macros [html]]
              )
  (:require-macros 
    [infix.macros :refer [infix]]
    [game.shared.macros :as macros :refer [defcom]])
  )

(rum/defc
  game-test < rum/static
  [component]
  (let
    [h (header "Game Test")]
    (html [:div { :class "container" } h
           [:div
            {
             :id "game"
             }]
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
       geometry (new THREE.SphereGeometry 1 4 4)
       material (new THREE.MeshBasicMaterial #js { :color 0xFF0000 })]
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
  subsystem
;    (update :ground-balls #(or % (new-ground-balls)))
  )

(defn start
  [component]
  (rum/mount (game-test component) (aget (:$page component) 0))
  (routing/init-page (:$page component))
  (let
    [params
     {
      :$page ($ "#game")
      :simplex (data (:simplex component))
      }
     subsystem
      (with-simple-cause
        #(component/start-system
          (if-let
            [s (:subsystem component)]
            (-> s
              (assoc :params params)
              (new-test-system))
            (game/new-system params))))
     component (assoc component :subsystem subsystem)
     ]
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
