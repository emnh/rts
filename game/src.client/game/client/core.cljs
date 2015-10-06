(ns ^:figwheel-always game.client.core
  (:require-macros [cljs.core.async.macros :refer [go]])
  (:require [om.core :as om :include-macros true]
            [om.dom :as dom :include-macros true]
            [game.client.scene :as scene]
            [game.client.ground :as ground]
            [game.client.socket :as socket]
            [cljs.core.async :refer [<! put! chan]]
            [jayq.core :as jayq :refer [$]]))

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

(defn main
  []
  (-> ($ js/window)
    (.unbind "resize.gameResize")
    (.bind "resize.gameResize" #(swap! mstate scene/on-resize)))
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
    (scene/initScene)
    (swap! mstate scene/initLight)
    (ground/initGround @mstate mstate-chan)
    (socket/initSocket @mstate mstate-chan)
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
