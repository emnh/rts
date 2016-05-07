(ns ^:figwheel-always game.client.renderer
  (:require
    [cljs.pprint :as pprint]
    [jayq.core :as jayq :refer [$]]
    [game.client.common :as common :refer [data]]
    [game.client.config :as config]
    [game.client.overlay :as overlay]
    [com.stuartsierra.component :as component]
    )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  )

(defn render-loop
  [component]
  (let
   [start-time (common/game-time)
    camera (data (:camera component))
    scene (data (:scene component))
    renderer (data (:renderer component))
    render-stats (data (:render-stats component))
    pixi-renderer (get-in component [:pixi-overlay :pixi-renderer])
    pixi-stage (get-in component [:pixi-overlay :stage])
    ]
    ; TODO: generic component render
    (-> render-stats .update)
    (-> renderer (.render scene camera))
    (overlay/on-render component (:pixi-overlay component))
    (-> pixi-renderer (.render pixi-stage))
    (let
      [end-time (common/game-time)
       elapsed (- end-time start-time)]
      (reset! (:last-frame-time component) elapsed)
      (swap! (:last-60-frame-times component) #(conj (take 59 %) elapsed))
      (reset! (:last-60-average component)
             (/
               (reduce + @(:last-60-frame-times component))
               (count @(:last-60-frame-times component)))))
    (if @(:running component)
      (js/requestAnimationFrame (partial render-loop component)))))

(defcom
  new-init-renderer
  [renderer camera scene render-stats pixi-overlay]
  [running last-frame-time last-60-frame-times last-60-average]
  (fn [component]
    (let
      [component
       (-> component
         (assoc :last-frame-time (atom 0))
         (assoc :last-60-frame-times (atom []))
         (assoc :last-60-average (atom 0))
         (assoc :running (atom true)))]
      (render-loop component)
      component))
  (fn [component]
    (if
      (not= running nil)
      (reset! running false))
    component))
