(ns ^:figwheel-always game.client.core
  (:require-macros [cljs.core.async.macros :refer [go]])
  (:require [om.core :as om :include-macros true]
            [om.dom :as dom :include-macros true]
            [game.client.common :as common]
            [game.client.scene :as scene]
            [game.client.ground :as ground]
            [game.client.socket :as socket]
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
  (common/new-jsobj 
    #(new js/THREE.WebGLRenderer #js { :antialias true })))

(add-component
  :scene (common/new-jsobj #(new js/THREE.Scene)))

(add-component
  :$overlay (common/new-jsobj #($ "<canvas/>")))

(add-component
  :raycaster (common/new-jsobj #(new js/THREE.Raycaster)))

(add-component
  :camera (common/new-jsobj scene/get-camera))

(add-component
  :add-to-scene
    (scene/new-add-to-scene))

(add-component
  :init-scene
    (scene/new-init-scene))

(add-component
  :light1
    (common/new-jsobj #(new js/THREE.DirectionalLight)))

(add-component
  :light2
    (common/new-jsobj #(new js/THREE.DirectionalLight)))

(add-component
  :light3
    (common/new-jsobj #(new js/THREE.DirectionalLight)))

(add-component
  :light4
    (common/new-jsobj #(new js/THREE.DirectionalLight)))

(add-component
  :init-light
    (scene/new-init-light))

(add-component
  :socket
    (socket/new-init-socket))

(defn main
  []
  (-> ($ js/window)
    (.unbind "resize.gameResize")
    (.bind "resize.gameResize" #(swap! mstate scene/on-resize)))
  ;(try
  (swap! system component/start-system)
  ;  (catch js/Object e
  ;    (println (:message e))
  ;    (throw (:cause e))))
  (let
    [mstate-chan (chan)]
    ; TODO: close/reestablish channel on reload
    (go
      (while true
        (let
          [{:keys [path value]} (<! mstate-chan)
           swapit #(assoc-in % path value)
           ]
          (println ["mstate change" path value])
          (swap! mstate swapit)
        )))
    (swap! mstate scene/on-resize)
    (println "mstate" @mstate)
    (swap! mstate scene/initStats)
    (ground/initGround @mstate mstate-chan)
    ))

;(defonce initial-call-to-main 
;  (if (exists? js/$) (js/$ main)))
(main)

(defn js-reload []
  ;; optionally touch your app-state to force rerendering depending on
  ;; your application
  ; (swap! app-state update-in [:__figwheel_counter] inc)
  (println "js-reload")
  (main))
