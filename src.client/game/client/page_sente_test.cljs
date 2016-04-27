(ns ^:figwheel-always game.client.page-sente-test
  (:require
    [cats.core :as m]
    [cljs.pprint :as pprint]
    [clojure.string :as string :refer [join]]
    [com.stuartsierra.component :as component]
    [game.client.common :as common :refer [list-item header]]
    [game.client.routing :as routing]
    [game.client.sente-setup :as sente-setup]
    [jayq.core :as jayq :refer [$]]
    [promesa.core :as p]
    [rum.core :as rum]
    [sablono.core :as sablono :refer-macros [html]]
    [taoensso.sente  :as sente  :refer (cb-success?)]
    )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  )

(enable-console-print!)

(rum/defc
  sente-view
  [component]
  (let
    [h (header "Sente Test")]
    (html [:div { :class "container" } h])))

(defn send-loop
  [component]
  (if
    @(:send-loop-enabled component)
    (if
      (:open? @(:state (:sente-setup component)))
      (do
        (println "send-fn" )
        ((:send-fn (:sente-setup component))
           [:sente-test/ping {:had-a-callback? "yes"}]
           5000
           (fn [cb-reply] (println "cb-reply" cb-reply)))
        (js/setTimeout (partial send-loop component) 60000))
      (do
        (println "not-send-fn" )
        (js/setTimeout (partial send-loop component) 1000)))))

(defn
  handle-init
  [component ev-msg]
  )

(defcom 
  new-sente-test
  [sente-setup]
  [$page send-loop-enabled]
  (fn [component]
    (let
      [component (assoc component :send-loop-enabled (atom true))]
      (sente-setup/register-handler sente-setup :sente-test/init (partial handle-init component))
      (p/then
        (:connected-promise sente-setup)
        #(send-loop component))
      (rum/mount (sente-view component) (aget $page 0))
      (routing/init-page $page)
      component))
  (fn [component]
    (if
      (not= send-loop-enabled nil)
      (reset! send-loop-enabled false))
    (if
      (not= (aget $page 0) nil)
      (rum/unmount (aget $page 0)))
    component))
