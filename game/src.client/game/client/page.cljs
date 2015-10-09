(ns ^:figwheel-always game.client.page
  (:require 
    [cljs.pprint :as pprint]
    [com.stuartsierra.component :as component]
    [jayq.core :as jayq :refer [$]]
    [promesa.core :as p]
    [cats.core :as m]
    [rum.core :as rum]
    )
  (:require-macros [game.client.macros :as macros :refer [defcom]])
  )

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
  (rum/mount (lobby) js/document.body)
  component)

(defn stop [component] component)

;(pprint/pprint (macroexpand '(defcom new-lobby [config] [state] start stop)))
(defcom new-lobby [config] [state] start stop)
