(ns ^:figwheel-always game.client.page-sente-test
  (:require
    [cats.core :as m]
    [cljs.pprint :as pprint]
    [clojure.string :as string :refer [join]]
    [com.stuartsierra.component :as component]
    [game.client.common :as common :refer [list-item header]]
    [game.client.routing :as routing]
    [game.client.socket :as socket]
    [jayq.core :as jayq :refer [$]]
    [promesa.core :as p]
    [rum.core :as rum]
    [sablono.core :as sablono :refer-macros [html]]
    [taoensso.sente  :as sente  :refer (cb-success?)]
    )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  )

(enable-console-print!)

(def page-id (routing/get-page-selector :sente-test))

(defn 
  ->output!
  [fmt & args]
  ;(println fmt args)
  (.log js/console "output:" fmt args)
  )

;;;; Sente event handlers

(defmulti -event-msg-handler
  "Multimethod to handle Sente `event-msg`s"
  :id ; Dispatch on event-id
  )

(defn event-msg-handler
  "Wraps `-event-msg-handler` with logging, error catching, etc."
  [{:as ev-msg :keys [id ?data event]}]
  (println "event-msg-handler")
  (-event-msg-handler ev-msg))

(defmethod -event-msg-handler
  :default ; Default/fallback case (no other matching handler)
  [{:as ev-msg :keys [event]}]
  (->output! "Unhandled event: %s" event))

(defmethod -event-msg-handler :chsk/state
  [{:as ev-msg :keys [?data]}]
  (if (= ?data {:first-open? true})
    (->output! "Channel socket successfully established!")
    (->output! "Channel socket state change: %s" ?data)))

(defmethod -event-msg-handler :chsk/recv
  [{:as ev-msg :keys [?data]}]
  (->output! "Push event from server: %s" ?data))

(defmethod -event-msg-handler :chsk/handshake
  [{:as ev-msg :keys [?data]}]
  (let [[?uid ?csrf-token ?handshake-data] ?data]
    (->output! "Handshake: %s" ?data)))

(defcom
  new-sente-setup
  []
  [chsk ch-recv send-fn state router]
  (fn [component] 
    (let
      [{:keys [chsk ch-recv send-fn state]}
       (sente/make-channel-socket-client! "/chsk" { :type :auto :packer :edn })
       router (if (= router nil) (atom nil) router)
       stop-router! #(when-let [stop-f @router] (stop-f))
       start-router!
       (do
         (stop-router!)
         (reset! router
                 (sente/start-client-chsk-router!
                  chsk event-msg-handler)))
       ]
      (start-router!)
      (->
        component
        (assoc :router router)
        (assoc :chsk chsk)
        (assoc :ch-recv ch-recv)
        (assoc :send-fn send-fn)
        (assoc :state state))))
  (fn [component] component))

(rum/defc
  sente-view
  [component]
  (let
    [h (header "Sente Test")]
    (html [:div { :class "container" } h])))

(defcom 
  new-sente-test
  [sente-setup]
  []
  (fn [component]
    (js/setInterval
      #(do
         (if
           (:open? @(:state sente-setup))
           (do
            (println "send-fn" )
            ((:send-fn sente-setup)
               [:sente-test/ping {:had-a-callback? "yes"}]
               5000
               (fn [cb-reply] (println "cb-reply" cb-reply))))))
      1000)
    (rum/mount (sente-view component) (aget ($ page-id) 0))
    (routing/init-page ($ page-id))
    component)
  (fn [component]
    component))
