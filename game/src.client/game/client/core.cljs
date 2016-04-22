(ns ^:figwheel-always game.client.core
  (:require 
    [cljs.core.async :refer [<! put! chan]]
    [com.stuartsierra.component :as component]
    [jayq.core :as jayq :refer [$]]
    [promesa.core :as p]
    [cats.core :as m]
    [game.client.common :as common :refer [new-jsobj]]
    [game.client.config :as config]
    [game.client.controls :as controls]
    [game.client.ground :as ground]
    [game.client.page-lobby :as page-lobby]
    [game.client.page-game-lobby :as page-game-lobby]
    [game.client.page-not-found :as page-not-found]
    [game.client.renderer :as renderer]
    [game.client.routing :as routing]
    [game.client.scene :as scene]
    [game.client.socket :as socket]
    [game.shared.state :as state :refer [system s-add-component s-readd-component system system]]
    )
  )

(enable-console-print!)

(println "Reloaded client core")

(s-readd-component system :config config/config)

(s-add-component system :renderer (new-jsobj #(new js/THREE.WebGLRenderer #js { :antialias true })))
(s-add-component system :scene (new-jsobj #(new js/THREE.Scene)))
(s-add-component system :$overlay (new-jsobj #($ "<canvas/>")))
(s-add-component system :raycaster (new-jsobj #(new js/THREE.Raycaster)))
(s-add-component system :camera (new-jsobj scene/get-camera))
(s-add-component system :light1 (new-jsobj #(new js/THREE.DirectionalLight)))
(s-add-component system :light2 (new-jsobj #(new js/THREE.DirectionalLight)))
(s-add-component system :light3 (new-jsobj #(new js/THREE.DirectionalLight)))
(s-add-component system :light4 (new-jsobj #(new js/THREE.DirectionalLight)))
(s-add-component system :render-stats (new-jsobj #(new js/Stats)))
(s-add-component system :physics-stats (new-jsobj #(new js/Stats)))
(s-add-component system :init-scene (scene/new-init-scene))
(s-add-component system :init-light (scene/new-init-light))
(s-add-component system :init-stats (scene/new-init-stats))
(s-add-component system :init-renderer (renderer/new-init-renderer))
(s-add-component system :on-resize (scene/new-on-resize))

(s-add-component system :socket (socket/new-init-socket))
(s-add-component system :simplex (new-jsobj #(new js/SimplexNoise)))
(s-add-component system :ground (ground/new-init-ground))
(s-readd-component system :controls (controls/new-controls))
(s-add-component system :routing (routing/new-router))
(s-add-component system :page-lobby (page-lobby/new-lobby))
(s-add-component system :page-game-lobby (page-game-lobby/new-game-lobby))
(s-add-component system :page-not-found (page-not-found/new-page-not-found))

(def ran (atom false))

(defn debug
  []
  (m/mlet
    [mapdata (socket/rpc (:socket @system) "get-map" :data 2)]
    (println "get-map" mapdata))
  )

(defn main
  []
  (reset! ran true)
  (println "main")
  (swap! system component/stop-system)
  (try
    (swap! system component/start-system)
    (catch js/Object e
      (let
        [simple-e (component/ex-without-components e)]
        (.log js/console simple-e)
        (.log js/console (aget simple-e "cause"))
        (throw (aget simple-e "cause"))
        ))))

(if @ran (main) (js/$ (main)))
