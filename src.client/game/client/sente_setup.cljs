(ns ^:figwheel-always game.client.sente-setup
  (:require
    [cats.core :as m]
    [cljs.pprint :as pprint]
    [clojure.string :as string :refer [join]]
    [com.stuartsierra.component :as component]
    [game.client.common :as common :refer [list-item header promise-obj]]
    [game.client.routing :as routing]
    [game.client.socket :as socket]
    [jayq.core :as jayq :refer [$]]
    [promesa.core :as p]
    [rum.core :as rum]
    [sablono.core :as sablono :refer-macros [html]]
    [taoensso.encore :as encore]
    [taoensso.sente  :as sente  :refer (cb-success?)]
    )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  )

(enable-console-print!)

(defn
  ->output!
  [fmt & args]
  (let [msg (apply encore/format fmt args)]
    (println msg)))

;;;; Sente event handlers

(defmulti -event-msg-handler
  "Multimethod to handle Sente `event-msg`s"
  (fn [component ev-msg]
    (:id ev-msg))) ; Dispatch on event-id

(defn event-msg-handler
  "Wraps `-event-msg-handler` with logging, error catching, etc."
  [component {:as ev-msg :keys [id ?data event]}]
  (println "event-msg-handler")
  (-event-msg-handler component ev-msg))

(defmethod -event-msg-handler
  :default ; Default/fallback case (no other matching handler)
  [component {:as ev-msg :keys [event]}]
  (if-let
    [handler (event (:event-handlers component))]
    (handler ev-msg)
    (->output! "Unhandled event: %s" event)))

(defmethod -event-msg-handler :chsk/state
  [component {:as ev-msg :keys [?data]}]
  (if
    (:first-open? ?data)
    (do
      (->output! "Channel socket successfully established!: %s" ?data)
      (.resolve (:connected-promise component) component))
    (->output! "Channel socket state change: %s" ?data)))

(defmethod -event-msg-handler :chsk/recv
  [component {:as ev-msg :keys [?data]}]
  (->output! "Push event from server: %s" ?data)
  (let
    [event (first ?data)
     data (second ?data)]
    (if-let
      [handler (event @(:event-handlers component))]
      (handler data))))

(defmethod -event-msg-handler :chsk/handshake
  [component {:as ev-msg :keys [?data]}]
  (let [[?uid ?csrf-token ?handshake-data] ?data]
    (->output! "Handshake: %s" ?data)))

(defn
  register-handler
  [component event handler]
  (swap! (:event-handlers component) #(assoc % event handler))
  (p/then
    (:connected-promise component)
    #((:send-fn component) [:rts/subscribe event])))

(defn
  send
  [component event ?data]
  (p/then
    (:connected-promise component)
    #((:send-fn component) [event ?data])))

(defn
  send-cb
  ([component event data]
    (let
      [timeout (get-in component [:config :sente :request-timeout])]
      (send-cb component event data timeout)))
  ([component event data timeout]
   (->
     (:connected-promise component)
     (p/then
       #(p/promise
         (fn [resolve reject]
           (let
             [callback
              (fn [event]
                (if
                  (= event :chsk/timeout)
                  (reject (new js/Error event))
                  (resolve event)))]
             ((:send-fn component) [event data] timeout callback))))))))

(defcom
  new-sente-setup
  [config]
  [chsk ch-recv send-fn state router event-handlers connected-promise]
  (fn [component]
    (let
      [{:keys [chsk ch-recv send-fn state]}
       (if
         (= start-count 0)
         (sente/make-channel-socket-client! "/chsk" { :type :auto :packer :edn })
         component)
       event-handlers (or event-handlers (atom {}))
       router (if (= router nil) (atom nil) router)
       connected-promise
       (or
         connected-promise
         (let
           [p (promise-obj)]
           (p/then
             (p/delay (get-in config [:sente :connection-timeout]))
             #(do
                (if-not
                  (p/resolved? p)
                  (.reject p (new js/Error "Sente connection timeout")))))
           p))
       component
       (->
        component
         (assoc :connected-promise connected-promise)
         (assoc :event-handlers event-handlers)
         (assoc :router router)
         (assoc :chsk chsk)
         (assoc :ch-recv ch-recv)
         (assoc :send-fn send-fn)
         (assoc :state state))
       stop-router! #(when-let [stop-f @router] (stop-f))
       start-router!
       #(do
         (stop-router!)
         (reset! router
                 (sente/start-client-chsk-router!
                  ch-recv (partial event-msg-handler component))))
       ]
      (start-router!)
      component))
  (fn [component] component))
