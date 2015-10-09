(ns ^:figwheel-always game.client.lobby
  (:require 
    [cljs.pprint :as pprint]
    [com.stuartsierra.component :as component]
    [jayq.core :as jayq :refer [$]]
    [promesa.core :as p]
    [cats.core :as m]
    [rum.core :as rum]
    [game.client.routing :as routing]
    [game.client.socket :as socket]
    )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  )

(def page-id (routing/get-page-selector :lobby))

(rum/defc 
  user-list < rum/reactive
  [state]
  (println "rum-list" (get (:user-list (rum/react state)) 0))
  [:ul (for 
          [user (:user-list (rum/react state))]
          [:li user])])
  ;[:ul (str (:user-list (rum/react state)))])

(rum/defc 
  lobby < rum/static 
  [state]
  (let 
    [
     div-user-list [:div (user-list state)]
     content [:div [:h1 "Lobby Chat"] div-user-list]
     ]
    content))

(defn
  update-user-list
  [state message]
  (println "user-list" message)
  (swap! state #(assoc-in % [:user-list] message)))

(defn start
  [component]
  (let
    [state 
      (or
        (:state component)
        (atom {
               :user-list []
               }))
     done (:done component)
     socket (:socket component)
     ]
    (if-not 
      done 
      (-> 
        (socket/on socket "user-list")
        (p/then (partial update-user-list state))))
    (rum/mount (lobby state) (aget ($ page-id) 0))
    (->
      component
      (assoc :state state)
      (assoc :done true)
      )))

(defn stop [component] component)

(defcom 
  new-lobby
  [config socket]
  [state done]
  start
  stop)
