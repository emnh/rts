(ns ^:figwheel-always game.client.renderer
  (:require
    [cljs.pprint :as pprint]
    [jayq.core :as jayq :refer [$]]
    [game.client.common :as common :refer [data]]
    [game.client.config :as config]
    [com.stuartsierra.component :as component]
    )
  )

(defn render-loop
  [init-renderer]
  (let
   [camera (data (:camera init-renderer))
    scene (data (:scene init-renderer))
    renderer (data (:renderer init-renderer))
    render-stats (data (:render-stats init-renderer))
    ]
    ; TODO: generic component render
    (-> render-stats .update)
    (-> renderer (.render scene camera))
    (if @(:running init-renderer)
      (js/requestAnimationFrame (partial render-loop init-renderer)))))

(defrecord InitRenderer
  [running renderer camera scene render-stats]
  component/Lifecycle
  (start [component]
    (let
      [component (assoc component :running (atom true))]
      (render-loop component)
      component))
  (stop [component]
    (if
      (not= running nil)
      (reset! running false))
    component))

(defn new-init-renderer
  []
  (component/using
    (map->InitRenderer {})
    [:renderer :camera :scene :render-stats]
    ))


