(ns ^:figwheel-always game.client.core
  (:require-macros 
    [cljs.core.async.macros :refer [go]]
    )
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
    [game.client.page :as page]
    [game.client.renderer :as renderer]
    [game.client.scene :as scene]
    [game.client.socket :as socket]
    [game.shared.state :as state :refer [add-component readd-component system]]
    )
  )

(enable-console-print!)

(println "Reloaded client core")

(add-component 
  :renderer 
  (new-jsobj 
    #(new js/THREE.WebGLRenderer #js { :antialias true })))

(add-component
  :scene (new-jsobj #(new js/THREE.Scene)))

(add-component
  :$overlay (new-jsobj #($ "<canvas/>")))

(add-component
  :raycaster (new-jsobj #(new js/THREE.Raycaster)))

(add-component
  :camera (new-jsobj scene/get-camera))

(add-component
  :init-scene
    (scene/new-init-scene))

(add-component
  :light1
    (new-jsobj #(new js/THREE.DirectionalLight)))

(add-component
  :light2
    (new-jsobj #(new js/THREE.DirectionalLight)))

(add-component
  :light3
    (new-jsobj #(new js/THREE.DirectionalLight)))

(add-component
  :light4
    (new-jsobj #(new js/THREE.DirectionalLight)))

(add-component
  :init-light
    (scene/new-init-light))

(add-component
  :socket
    (socket/new-init-socket))

(add-component
  :render-stats
    (new-jsobj #(new js/Stats)))

(add-component
  :physics-stats
    (new-jsobj #(new js/Stats)))

(add-component
  :init-stats
    (scene/new-init-stats))

(readd-component
  :config
    config/config)

(add-component
  :on-resize
    (scene/new-on-resize))

(add-component
  :simplex
    (new-jsobj #(new js/SimplexNoise)))

(add-component
  :ground
  (ground/new-init-ground))

(readd-component
  :controls
  (controls/new-controls))

(add-component 
  :init-renderer
  (renderer/new-init-renderer))

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
