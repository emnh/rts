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
    [bidi.bidi :as bidi]
    )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  (:refer-clojure :exclude [remove])
  (:import goog.History))

(defn get-page-element-id
  [page]
  (str "page-" (name page)))

(defn get-page-selector
  [page]
  (str "#" (get-page-element-id page)))

(def page-list
  {
   :lobby true
   :game true
   :game-lobby true
   :not-found true
   })

(def routes
  ["" {
       "lobby" :lobby
       "game" :game
       "game-lobby/"
       {
        [:id "/"] :game-lobby
        }
       }])

(rum/defc
  page < rum/static
  [pagekey]
  [:div
   {:id (get-page-element-id pagekey)
    :class "top-page"}])

(rum/defc pages
  []
  [:div
     (for [pagekey (keys page-list)]
        (rum/with-key (page pagekey) (name pagekey)))
   ]
  )

(defn
  init-page
  "Centers the page horizontally"
  [$page]
  (let
    [page-width (-> $page (.find ".container") .width)
     left (max 0 (/ (- (-> js/window .-innerWidth) page-width) 2))]
    (-> $page (.css #js { :left left } ))))

(defn
  handle-url
  [component url]
  (doseq
    [pagekey (keys page-list)]
    (-> ($ (get-page-selector pagekey)) (.addClass "invisible")))
  (let
    [route-match (:route-match component)
     match (bidi/match-route routes url)
     handler (if match (:handler match) :not-found)]
    (reset! route-match match)
    (println "handler" handler)
    (if
      (handler page-list)
      (do
        (let
          [$page ($ (get-page-selector handler))
           ]
          (-> $page (.removeClass "invisible"))
          )
        )
      ))
  (println "url" url))

(defn
  change-page
  [new-page]
  (-> js/window .-location .-hash (set! new-page)))

(defn
  start-router
  [component]
  (let
    [component (assoc component :route-match (atom {}))
     history
      (or
        (:history component)
        (do
          (let
            [history (History.)]
            (goog.events/listen history EventType/NAVIGATE #(handle-url component (.-token %)))
            (doto history (.setEnabled true))
            )))]
    (rum/mount (pages) js/document.body)
    (handle-url component (string/replace-first window.location.hash "#" ""))
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
  [listen-key route-match]
  start-router
  stop-router
  )

(defn game-active
  []
  (= window.location.hash "#game"))
