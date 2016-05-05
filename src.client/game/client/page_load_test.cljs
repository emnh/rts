(ns ^:figwheel-always game.client.page-load-test
    (:require
              [cljs.pprint :as pprint]
              [jayq.core :as jayq :refer [$]]
              [rum.core :as rum]
              [com.stuartsierra.component :as component]
              [promesa.core :as p]
              [game.client.common :as common :refer [list-item header]]
              [game.client.config :as config]
              [game.client.math :as math :refer [round]]
              [game.client.routing :as routing]
              [game.client.progress-manager
               :as progress-manager
               :refer [get-progress-map]]
              [sablono.core :as sablono :refer-macros [html]]
              )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  )

(rum/defc
  progress-bar < rum/static
  "complete is a number from 0 to 100"
  [text complete]
  [:div { :id "units" :class "progress" }
   [:div {
          :role "progressbar"
          :aria-valuenow complete
          :aria-valuemin 0
          :aria-valuemax 100
          :class
          (str "progress-bar progress-bar-striped active"
               (if (= (round complete) 100) " progress-bar-success" ""))
          :style
          {
            :width (str (round complete) "%")
           }
          }
    [:span { :class "" } text]
    ]
   ]
  )

(defn
  format-progress
  [progress-map]
  (into
    []
    (for
      [resource (keys progress-map)]
      (let
        [{:keys [completed total]}
         (progress-map resource)
         progress (* 100 (if (> total 0) (/ completed total) 1))
         progress-text (str resource ": " progress "%")]
        (rum/with-key
          (list-item (progress-bar progress-text progress))
          resource)))))

(rum/defc
  progress-list < rum/reactive
  [component]
  (let
    [progress-map (rum/react (get-progress-map (:progress-manager component)))]
    [:ul { :class "progress-list" } (format-progress progress-map)]
    ))

(rum/defc
  load-test < rum/static
  [component]
  (let
    [h (header "Load Test")]
    (html [:div { :class "container" } h (progress-list component)])))

(defn start
  [component]
  (rum/mount (load-test component) (aget (:$page component) 0))
  component)

(defn stop [component]
  (if-let
    [page (aget (:$page component) 0)]
    (rum/unmount page))
  component)

(defcom new-load-test [progress-manager] [] start stop)
