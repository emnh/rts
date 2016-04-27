(ns ^:figwheel-always game.server.sente-setup
  (:require
    [cats.core :as m]
    [cats.builtin]
    [cljs.nodejs :as nodejs]
    [com.stuartsierra.component :as component]
    [game.server.db :as db]
    [promesa.core :as p]
    [taoensso.sente :as sente]
    [taoensso.sente.server-adapters.express :as sente-express]
    )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  )

(enable-console-print!)

(defonce express-ws (nodejs/require "express-ws"))

;;;; Sente event handlers

(defmulti -event-msg-handler
  "Multimethod to handle Sente `event-msg`s"
  (fn [component ev-msg] 
;    (println "component" component)
;    (println "ev-msg" ev-msg)
    (:id ev-msg)) ; Dispatch on event-id
  )

(defn event-msg-handler
  "Wraps `-event-msg-handler` with logging, error catching, etc."
  [component {:as ev-msg :keys [id ?data event]}]
  (-event-msg-handler component ev-msg))

(defmethod -event-msg-handler
  :rts/subscribe
  [component {:as ev-msg :keys [event id ?data uid ring-req ?reply-fn send-fn]}]
  ;(.log js/console "user" (-> ring-req :body .-user .-displayName))
  (let
    [subscription-event ?data]
    (swap!
      (:subscriptions component)
      #(assoc-in % [uid subscription-event] true))))
    ;(send-fn uid [subscription-event [:success uid]])))

(defmethod -event-msg-handler
  :chsk/uidport-open
  [component {:as ev-msg :keys [event id ?data uid ring-req ?reply-fn send-fn]}]
  (println "uidport-open" uid)
  (send-fn uid [:sente-test/uidport [:hello uid]]))

(defmethod -event-msg-handler
  :sente-test/ping
  [component {:as ev-msg :keys [event id ?data ring-req ?reply-fn send-fn]}]
  (let [session (:session ring-req)
        uid     (:uid     session)]
    ;(println "ping")
    (when ?reply-fn
      (?reply-fn [ :sente-test/pong (:test component) ?data ]))))

; catch it so it's not logged (too many of them)
(defmethod -event-msg-handler
  :chsk/ws-ping
  [component {:as ev-msg :keys [event id ?data ring-req ?reply-fn send-fn]}]
  nil)

(defmethod -event-msg-handler
  :default ; Default/fallback case (no other matching handler)
  [component {:as ev-msg :keys [event id ?data ring-req ?reply-fn send-fn]}]
  (let [session (:session ring-req)
        uid     (:uid     session)]
    (if-let
      [handler (id @(:event-handlers component))]
      (handler component ev-msg)
      (do
        (println "Unhandled event:" event)
        (when ?reply-fn
          (?reply-fn {:umatched-event-as-echoed-from-from-server event}))))))

(defn register-handler
  [component event handler]
  (swap! (:event-handlers component) #(assoc % event handler)))

(defn user-id-fn
  [req]
  (let
    [uid (db/get-id (-> req :body .-session .-user .-_id))]
    uid))

(defn watch-connected-uids
  [component key atom old-state new-state]
  (let
    [uids (:any new-state)
     ;query { :_id (db/get-object-id (first uids)) }
     query { :_id { :$in (map db/get-object-id uids) } }
     ]
    (println "connected-uids" uids)
    (println "query" query)
    ;(.log js/console "query js" (clj->js query))
    (p/then
      (db/find (:db component) "users" query)
      (fn
        [docs]
        (let 
          [docs (js->clj docs :keywordize-keys true)
           display-names (map #(:displayName %) docs)
           send-fn (:send-fn component)
           ]
          (println "display names" display-names)
          (doseq
            [uid uids]
            ; TODO: only send if subscribed. also send when subscribing.
            (send-fn uid [:rts/user-list (into [] display-names)])))))))

(defcom
  new-sente-setup
  [app server db]
  [router ajax-post-fn ajax-get-or-ws-handshake-fn ch-recv send-fn connected-uids
   subscriptions event-handlers uid-properties]
  (fn [component]
		(let 
      [packer :edn ; Default packer, a good choice in most cases
       _ 
       (if
         (= start-count 0)
         (express-ws (:app app) (:server server)))
       {:keys [ch-recv send-fn ajax-post-fn ajax-get-or-ws-handshake-fn
               connected-uids]}
       (if
         (= start-count 0)
         (sente-express/make-express-channel-socket-server! 
           { :packer packer :user-id-fn user-id-fn })
         component)
       _
       (do
         (remove-watch connected-uids :uid-broadcaster)
         (add-watch connected-uids :uid-broadcaster (partial watch-connected-uids component)))
       router (if (= router nil) (atom nil) router)
       subscriptions (or subscriptions (atom {}))
       event-handlers (or event-handlers (atom {}))
       uid-properties (or uid-properties (atom {}))
       component
       (->
         component
         (assoc :event-handlers event-handlers)
         (assoc :subscriptions subscriptions)
         (assoc :test { :component-start-time (-> (new js/Date) .toString) })
         (assoc :router router)
         (assoc :ajax-post-fn                ajax-post-fn)
         (assoc :ajax-get-or-ws-handshake-fn ajax-get-or-ws-handshake-fn)
         (assoc :ch-recv                     ch-recv) ; ChannelSocket's receive channel
         (assoc :send-fn                     send-fn) ; ChannelSocket's send API fn
         (assoc :connected-uids              connected-uids) ; Watchable, read-only atom
         )
       stop-router! #(when-let [stop-f @router] (stop-f))
       start-router!
         #(do
           (stop-router!)
           (reset! router
                   (sente/start-server-chsk-router!
                    ch-recv (partial event-msg-handler component))))
       ]
       (doto
         (:app app)
         (.ws "/chsk"
              (fn [ws req next]
                 ;(swap! uid-properties #(assoc % (-> req
;                (println "ws chsk" req)
                (ajax-get-or-ws-handshake-fn req nil nil
                                          {:websocket? true
                                           :websocket  ws})))
         (.get "/chsk" ajax-get-or-ws-handshake-fn)
         (.post "/chsk" ajax-post-fn))
       (start-router!)
       component))
  (fn [component] component))
