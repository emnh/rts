(ns ^:figwheel-always game.client.page-not-found
  (:require 
    [cljs.pprint :as pprint]
    [com.stuartsierra.component :as component]
    [jayq.core :as jayq :refer [$]]
    [promesa.core :as p]
    [cats.core :as m]
    [rum.core :as rum]
    [game.client.routing :as routing]
    [game.client.socket :as socket]
    [sablono.core :as sablono :refer-macros [html]]
    [clojure.string :as string :refer [join]]
    )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  )

(def page-id (routing/get-page-selector :not-found))

(rum/defc 
  content < rum/static
  []
  (html
    [:div
     { :class "container" } 
     [:h1 "Page not found"]
     [:a { :href "#lobby" } "Go to Lobby"]]))

(defn start
  [component]
  (rum/mount (content) (aget ($ page-id) 0))
  component)

(defn stop
  [component]
  component)

(defcom
  new-page-not-found
  [routing]
  []
  start
  stop
  )
