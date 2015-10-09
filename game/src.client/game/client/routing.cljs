(ns ^:figwheel-always game.client.routing
  (:require 
    [cljs.pprint :as pprint]
    [clojure.string :as string]
    [jayq.core :as jayq :refer [$]]
    [game.client.config :as config]
    [game.client.common :as common :refer [data]]
    [com.stuartsierra.component :as component]
    [goog.events :as events]
    [goog.history.EventType :as EventType]
    [rum.core :as rum]
    )
  (:require-macros [game.client.macros :as macros :refer [defcom]])
  (:refer-clojure :exclude [remove])
  (:import goog.History))

(defn get-page-element-id
  [page]
  (str "page-" (name page)))

(defn get-page-selector
  [page]
  (str "#" (get-page-element-id page)))

(def routing-table
  {
   :lobby true
   :game true
   })

(rum/defc
  page < rum/static
  [pagekey]
  [:div {:id (get-page-element-id pagekey) :key (name pagekey)}]
  )

(rum/defc pages
  []
  [:div 
     (for [pagekey (keys routing-table)]
        (page pagekey))
   ]
  )

(defn
  handle-url
  [url]
  (doseq
    [pagekey (keys routing-table)]
    (-> ($ (get-page-selector pagekey)) (.addClass "invisible")))
  (let
    [kwurl (keyword url)]
    (if 
      (kwurl routing-table)
      (do
        (-> ($ (get-page-selector kwurl)) (.removeClass "invisible"))
        )
      ))
  (println "url" url))

(defn
  start-router
  [component]
  (let
    [history 
      (or
        (:history component) 
        (do
          (let 
            [history (History.)]
            (goog.events/listen history EventType/NAVIGATE #(handle-url (.-token %)))
            (doto history (.setEnabled true))
            )))]
    (rum/mount (pages) js/document.body)
    (handle-url (string/replace-first window.location.hash "#" ""))
    (->
      component
      (assoc :history history)
      )))

(defn stop-router
  [component]
    component)

(defcom
  new-router
  [config]
  [listen-key]
  start-router
  stop-router
  )

