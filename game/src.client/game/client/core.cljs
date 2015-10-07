(ns ^:figwheel-always game.client.core
  (:require-macros [cljs.core.async.macros :refer [go]])
  (:require [om.core :as om :include-macros true]
            [om.dom :as dom :include-macros true]
            [game.client.common :as common :refer [new-jsobj]]
            [game.client.scene :as scene]
            [game.client.ground :as ground]
            [game.client.socket :as socket]
            [game.client.config :as config]
            [game.client.renderer :as renderer]
            [cljs.core.async :refer [<! put! chan]]
            [jayq.core :as jayq :refer [$]]
            [com.stuartsierra.component :as component]
            ))

(enable-console-print!)

(println "Reloaded client core")

(defrecord unit 
  [index matrix]
  )

(defn new-clj-matrix
  []
  (let [
        mat (js-obj (. Matrix4 js/THREE))
        ]
    (js->clj (.-elements mat))))

(defn init-units []
  [
   (unit. 0 (new-clj-matrix))
   (unit. 1 (new-clj-matrix))
   (unit. 2 (new-clj-matrix))
          ])

(defonce
  app-state
    (atom 
      {
       :units (init-units)
       }))

(defonce
  mstate
    (atom
      {
       :socket {}
       :scene {}
       :units {}
       }))

(defonce system (atom {}))

(defn add-component
  [k v]
  (if 
    (not (k @system))
    (swap! system #(assoc % k v))))

(defn readd-component
  [k v]
  (swap! system #(assoc % k v)))

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

(add-component
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

(add-component 
  :init-renderer
  (renderer/new-init-renderer))

(def ran (atom false))

(defn main
  []
  (reset! ran true)
  (println "main")
  (swap! system component/stop-system)
  (swap! system component/start-system)
  )

(if @ran (main) (js/$ (main)))
