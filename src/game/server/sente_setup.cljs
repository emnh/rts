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
  :sente-test/ping
  [component {:as ev-msg :keys [event id ?data ring-req ?reply-fn send-fn]}]
  (let [session (:session ring-req)
        uid     (:uid     session)]
    ;(println "ping")
    (when ?reply-fn
      (?reply-fn [ :sente-test/pong (:test component) ?data ]))))

(defmethod -event-msg-handler
  :default ; Default/fallback case (no other matching handler)
  [component {:as ev-msg :keys [event id ?data ring-req ?reply-fn send-fn]}]
  (let [session (:session ring-req)
        uid     (:uid     session)]
    (println "Unhandled event:" event)
    (when ?reply-fn
      (?reply-fn {:umatched-event-as-echoed-from-from-server event}))))

(defcom
  new-sente-setup
  [app server]
  [router ajax-post-fn ajax-get-or-ws-handshake-fn ch-recv send-fn connected-uids]
  (fn [component]
		(let [;; Serialization format, must use same val for client + server:
					packer :edn ; Default packer, a good choice in most cases
					;; (sente-transit/get-flexi-packer :edn) ; Experimental, needs Transit dep
          ws-server (express-ws (:app app) (:server server))
					{:keys [ch-recv send-fn ajax-post-fn ajax-get-or-ws-handshake-fn
									connected-uids]}
          (if
            (= start-count 0)
            (sente-express/make-express-channel-socket-server! 
              {
               :packer packer
               :user-id-fn (fn [req] 
                             (let
                               [uid (db/get-id (-> req :body .-session .-user .-_id))]
                               ;(println "uid" uid)
                               uid))
               })
            component)
					router (if (= router nil) (atom nil) router)
          component
          (->
            component
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
                  ;(println "ws chsk")
                  (ajax-get-or-ws-handshake-fn req nil nil
                                            {:websocket? true
                                             :websocket  ws})))
           (.get "/chsk" ajax-get-or-ws-handshake-fn)
           (.post "/chsk" ajax-post-fn))
         ;(if (= @router nil) (start-router!))
         (start-router!)
         component))
  (fn [component]
    component)
  )
