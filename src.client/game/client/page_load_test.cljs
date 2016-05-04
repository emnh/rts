(ns ^:figwheel-always game.client.page-load-test
    (:require
              [cljs.pprint :as pprint]
              [jayq.core :as jayq :refer [$]]
              [rum.core :as rum]
              [com.stuartsierra.component :as component]
              [promesa.core :as p]
              [game.client.common :as common :refer [list-item header]]
              [game.client.config :as config]
              [game.client.routing :as routing]
              [sablono.core :as sablono :refer-macros [html]]
              )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  )

(rum/defc
  load-test < rum/static
  [component]
  (let
    [h (header "Load Test")]
    (html [:div { :class "container" } h])))

(defn start
  [component]
  (rum/mount (load-test component) (aget (:$page component) 0))
  (routing/init-page (:$page component))
  component)

(defn stop [component] 
  ;(println "unmounting lobby")
  (if-let
    [page (aget (:$page component) 0)]
    (rum/unmount page))
  component)

(defcom new-load-test [progress-manager] [] start stop)
