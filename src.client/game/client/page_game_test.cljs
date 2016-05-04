(ns ^:figwheel-always game.client.page-game-test
    (:require
              [cljs.pprint :as pprint]
              [jayq.core :as jayq :refer [$]]
              [rum.core :as rum]
              [com.stuartsierra.component :as component]
              [promesa.core :as p]
              [game.client.common :as common :refer [list-item header data]]
              [game.client.config :as config]
              [game.client.game :as game]
              [game.client.math :as math :refer [round]]
              [game.client.progress-manager
               :as progress-manager
               :refer [get-progress-map]]
              [game.client.routing :as routing]
              [game.shared.state :as state :refer [with-simple-cause]]
              [sablono.core :as sablono :refer-macros [html]]
              )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  )

(rum/defc
  game-test < rum/static
  [component]
  (let
    [h (header "Game Test")]
    (html [:div { :class "container" } h
           [:div 
            {
             :id "game" 
             }]
           ])))

(defn start
  [component]
  (rum/mount (game-test component) (aget (:$page component) 0))
  (routing/init-page (:$page component))
  (let
    [params
     {
      :$page ($ "#game")
      :simplex (data (:simplex component))
      }
     subsystem
      (with-simple-cause
        #(component/start-system
          (if-let
            [s (:subsystem component)]
            (assoc s :params params)
            (game/new-system params))))
     component (assoc component :subsystem subsystem)
     ]
    component))

(defn stop [component]
  (if-let
    [page (aget (:$page component) 0)]
    (rum/unmount page))
  (let
    [subsystem
      (if-let
        [s (:subsystem component)]
        (with-simple-cause
          #(component/stop-system s)))
     component (assoc component :subsystem subsystem)]
    component))

(defcom
  new-game-test
  [resources simplex]
  [subsystem]
  start
  stop)
