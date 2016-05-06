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

(defcom
  new-units
  [ground scene init-scene resources]
  [starting units unit-meshes]
  (fn [component]
    (let
      [starting (atom true)
       units (atom [])
       unit-meshes (atom [])]
      (doseq [model (:resource-list resources)]
        (let
          [texture-loader (new THREE.TextureLoader)
           material (new js/THREE.MeshLambertMaterial)
           wrapping (-> js/THREE .-RepeatWrapping)
           on-load (fn [texture]
                     (-> texture .-wrapS (set! wrapping))
                     (-> texture .-wrapT (set! wrapping))
                     (-> texture .-repeat (.set 1 1))
                     (-> material .-map (set! texture))
                     (-> material .-needsUpdate (set! true)))
           grass (-> texture-loader (.load "models/images/grass.jpg" on-load))
           ]
          (m/mlet
            [geometry (:load-promise model)
             texture (:texture-load-promise model)]
            (if @starting
              (let
                [spread 100.0
                 xpos (- (* (math/random) 2.0 spread) spread)
                 zpos (- (* (math/random) 2.0 spread) spread)
                 miny (- (-> geometry .-boundingBox .-min .-y))
                 ypos (+ miny (ground/get-height ground xpos zpos))
                 material (new js/THREE.MeshLambertMaterial #js { :map texture })
                 ;_ (-> material .-needsUpdate (set! true))
                 mesh (new js/THREE.Mesh geometry material)
                 ]
;                (println "model add" (:name model) mesh)
                (swap! unit-meshes conj mesh)
                (swap! units conj { :model model })
                (scene/add scene mesh)
                (doto (-> mesh .-position)
                  (aset "x" xpos)
                  (aset "y" ypos)
                  (aset "z" zpos)))))))
      (-> component
        (assoc :units units)
        (assoc :unit-meshes unit-meshes)
        (assoc :starting starting))))
  (fn [component]
    (println "stopping units")
    (if starting
      (reset! starting false))
    (if unit-meshes
      (doseq [unit @unit-meshes]
        (scene/remove scene unit)))
    (->
      component
      (assoc :starting nil)
      (assoc :units nil)
      (assoc :unit-meshes nil))))

(defn new-test-system
  [subsystem]
  (->
    subsystem
    (update :units (fn [units]
                     (if-not
                       (= units nil)
                       units
                       (new-units))))))
;    (update :ground-balls #(or % (new-ground-balls)))

(defn start
  [component]
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
