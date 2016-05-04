(ns ^:figwheel-always game.client.routing
  (:require
    [cljs.pprint :as pprint]
    [clojure.string :as string]
    [jayq.core :as jayq :refer [$]]
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

(defn get-page-$element
  [page]
  ($ (get-page-selector page)))

(defn get-page-element
  [page]
  (aget ($ (get-page-selector page)) 0))

(def routes
  ["" {
       "lobby" :lobby
       "game" :game
       "game-test" :game-test
       "load-test" :load-test
       "sente-test" :sente-test
       "game-lobby/"
       {
        [:id "/"] :game-lobby
        }
       "404" :not-found
       }])

(def page-list (set (map :handler (bidi/route-seq routes))))
(defn get-pages [] page-list)

(rum/defc
  page < rum/static
  [pagekey]
  [:div
   {:id (get-page-element-id pagekey)
    :class "top-page"}])

(rum/defc
  pages
  []
  ; (println "mounting pages")
  [:div
     (for [pagekey (get-pages)]
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
    [pagekey (get-pages)]
    (-> ($ (get-page-selector pagekey)) (.addClass "invisible")))
  (let
    [route-match (:route-match component)
     match (bidi/match-route routes url)
     handler (if match (:handler match) :not-found)
     old-match @route-match]
    (reset! route-match match)
    ;(println "handler" handler)
    (if
      (handler page-list)
      (do
        (let
          [$page ($ (get-page-selector handler))
           ]
          (-> $page (.removeClass "invisible")))
        ;(println "cmp" handler (:handler old-match))
        (if 
          (not= handler (:handler old-match))
          (do
            ;(println "routing-callback")
            (js/setTimeout
              #((:data (:routing-callback component)) handler)
              0)))))))

(defn
  change-page
  [new-page]
  (-> js/window .-location .-hash (set! new-page)))

(defn
  start-router
  [component]
  (let
    [route-match (or (:route-match component) (atom {}))
     component (assoc component :route-match route-match)
     handlers (or (:handlers component) (atom {}))
     history
      (or
        (:history component)
        (do
          (let
            [history (History.)]
            (goog.events/listen history EventType/NAVIGATE #(handle-url component (.-token %)))
            (doto history (.setEnabled true))
            )))
     ]
    (rum/mount (pages) (aget ($ "#pages") 0))
    ;(handle-url component (string/replace-first window.location.hash "#" ""))
    (->
      component
      (assoc :history history)
      (assoc :handlers handlers)
      )))

(defn stop-router
  [component]
    component)

(defcom
  new-router
  [routing-callback]
  [history route-match handlers]
  start-router
  stop-router
  )

; TODO: replace with game component state
(defn game-active
  []
  (= window.location.hash "#game"))
