(ns ^:figwheel-always game.core
    (:require [om.core :as om :include-macros true]
              [om.dom :as dom :include-macros true]
              [game.scene :as scene]
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
      {:scene {}}))

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
  (swap! mstate scene/onResize)
  (println "mstate" @mstate)
  (swap! mstate scene/initScene)
  (swap! mstate scene/initStats)
  )

(defn on-js-reload []
  ;; optionally touch your app-state to force rerendering depending on
  ;; your application
  ; (swap! app-state update-in [:__figwheel_counter] inc)
  (main))

