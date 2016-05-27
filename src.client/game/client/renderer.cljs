(ns ^:figwheel-always game.client.renderer
  (:require
    [cljs.pprint :as pprint]
    [jayq.core :as jayq :refer [$]]
    [game.client.common :as common :refer [data]]
    [game.client.config :as config]
    [game.client.overlay :as overlay]
    [game.client.magic :as magic]
    [game.client.explosion :as explosion]
    [com.stuartsierra.component :as component]
    )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  )

(defn render-loop
  [component]
  (if @(:running component)
    (let
     [start-time @(:last-frame-time component)
      end-time (common/game-time)
      elapsed-time (- end-time start-time)
      camera (data (:camera component))
      scene (data (:scene component))
      renderer (data (:renderer component))
      three-overlay (:three-overlay component)
      overlay-renderer (:overlay-renderer three-overlay)
      render-stats (data (:render-stats component))
      pixi-renderer (get-in component [:pixi-overlay :pixi-renderer])
      pixi-stage (get-in component [:pixi-overlay :stage])
      ]
      (reset! (:last-frame-elapsed component) elapsed-time)
      (reset! (:last-frame-time component) end-time)
      ; TODO: generic component render
      (-> render-stats .update)
      (magic/on-render component (:update-magic component))
      (explosion/on-render component (:update-explosion component))
      (-> renderer (.render scene camera))
      (overlay/on-xp-render component three-overlay)
      (js/requestAnimationFrame (partial render-loop component)))))

(defcom
  new-init-renderer
  [renderer three-overlay camera
   scene render-stats pixi-overlay
   update-magic update-explosion]
  [running last-frame-time last-frame-elapsed]
  (fn [component]
    (let
      [component
       (-> component
         (assoc :last-frame-time (atom (common/game-time)))
         (assoc :last-frame-elapsed (atom 0))
         (assoc :running (atom true)))]
      (render-loop component)
      component))
  (fn [component]
    (if
      (not= running nil)
      (reset! running false))
    component))
