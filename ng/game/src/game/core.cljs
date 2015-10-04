(ns ^:figwheel-always game.core
  (:require-macros [cljs.core.async.macros :refer [go]])
  (:require [om.core :as om :include-macros true]
            [om.dom :as dom :include-macros true]
            [game.scene :as scene]
            [game.ground :as ground]
            [game.socket :as socket]
            [cljs.core.async :refer [<! put! chan]]
            [jayq.core :as jayq :refer [$]]))

(enable-console-print!)

(println "Edits to this text should show up in your developer console: test.")

;; define your app data so that it doesn't get over-written on reload

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

;(om/root
;  (fn [data owner]
;    (reify om/IRender
;      (render [_]
;        (apply dom/ul #js {:className "units"}
;               (map #(dom/li nil (:index %)) (:units data))
;                     ))))
;  app-state
;  {:target (. js/document (getElementById "app"))})

(defn main
  []
  (-> ($ js/window)
    (.unbind "resize.gameResize")
    (.bind "resize.gameResize" #(swap! mstate scene/onResize)))
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
    (swap! mstate scene/onResize)
    (println "mstate" @mstate)
    (swap! mstate scene/initStats)
    (swap! mstate scene/initScene)
    (swap! mstate scene/initLight)
    (ground/initGround @mstate mstate-chan)
    (socket/initSocket @mstate mstate-chan)
    ))

(js/$ main)

(defn on-js-reload []
  ;; optionally touch your app-state to force rerendering depending on
  ;; your application
  ; (swap! app-state update-in [:__figwheel_counter] inc)
  (main))
