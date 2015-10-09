(ns ^:figwheel-always game.client.page
  (:require 
    [com.stuartsierra.component :as component]
    [jayq.core :as jayq :refer [$]]
    [promesa.core :as p]
    [cats.core :as m]
    [rum.core :as rum]
  ))

(rum/defc label < rum/static [n text]
            (do
              (println "label" text)
              [:.label (repeat n text)]))

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
  []
  (rum/mount (label 1 "abc") js/document.body)
  (rum/mount (label 1 "abc") js/document.body)
  (rum/mount (label 1 "xyz") js/document.body)
  (rum/mount (lobby) js/document.body))
