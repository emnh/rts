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
   [camera (data (:camera component))
    scene (data (:scene component))
    renderer (data (:renderer component))
    render-stats (data (:render-stats component))
    pixi-renderer (get-in component [:pixi-overlay :pixi-renderer])
    pixi-stage (get-in component [:pixi-overlay :stage])
    ]
    ; TODO: generic component render
    (-> render-stats .update)
    (-> renderer (.render scene camera))
    (overlay/on-render (:pixi-overlay component))
    (-> pixi-renderer (.render pixi-stage))
    (if @(:running component)
      (js/requestAnimationFrame (partial render-loop component)))))

(defcom
  new-init-renderer
  [renderer camera scene render-stats pixi-overlay]
  [running]
  (fn [component]
    (let
      [component (assoc component :running (atom true))]
      (render-loop component)
      component))
  (fn [component]
    (if
      (not= running nil)
      (reset! running false))
    component))
