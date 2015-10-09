(ns ^:figwheel-always game.client.lobby
  (:require 
    [cljs.pprint :as pprint]
    [com.stuartsierra.component :as component]
    [jayq.core :as jayq :refer [$]]
    [promesa.core :as p]
    [cats.core :as m]
    [rum.core :as rum]
    [game.client.routing :as routing]
    )
  (:require-macros [game.client.macros :as macros :refer [defcom]])
  )

(def page-id (routing/get-page-selector :lobby))

(rum/defc 
  user-list < rum/static
  []
  [:ul [:li "user1"] [:li "user2"]])

(rum/defc 
  lobby < rum/static 
  []
  (let 
    [
     div-user-list [:div (user-list)]
     content [:div [:h1 "Lobby Chat"] div-user-list]
     ]
    content))

(defn start
  [component]
  (println "page-id" (aget ($ page-id) 0))
  (rum/mount (lobby) (aget ($ page-id) 0))
  component)

(defn stop [component] component)

(defcom new-lobby [config] [state] start stop)
