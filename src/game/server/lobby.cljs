(ns ^:figwheel-always game.server.lobby
  (:require
    [cljs.nodejs :as nodejs]
    [hiccups.runtime :as hiccupsrt]
    [com.stuartsierra.component :as component]
    [promesa.core :as p]
    [cats.core :as m]
    [cats.builtin]
    [game.server.db :as db]
    [game.server.games :as games]
    [game.server.sente-setup :as sente]
    )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  )

(defn recv-chat-message
  [lobby sente {:as ev-msg :keys [event id ?data uid ring-req ?reply-fn send-fn]}]
  (println "recv-chat-message")
  (let
    [display-name (-> ring-req :body .-session .-user .-displayName)
     doc 
     {
      :uid uid
      :user display-name
      :message ?data
      :date (db/timestamp)
      }
     ;msgdata (assoc doc :date #(.toString %))
     ]
    (->
      (db/insert (:db lobby) "messages" doc)
      (p/then
        (fn [val]
;          (println "doc" val)
;          (println "doc" (nth (:ops val) 0))
;          (println "doc" (.getTimestamp (:_id (nth (:ops val) 0))))
          (let
            [timestamp (.getTimestamp (:_id (nth (:ops val) 0)))
             doc (assoc doc :date timestamp)]
            (when ?reply-fn
              (?reply-fn :rts/chat-message-resolve))
            (sente/send-to-subscribers
              sente
              :rts/chat-message
              doc))))
      (p/catch
        (fn [err]
          (when ?reply-fn
            (?reply-fn :rts/chat-message-reject err)))))))

(defcom 
  new-lobby
  [config db games sente-setup]
  []
  (fn [component]
    (sente/register-handler
      sente-setup
      :rts/chat-message
      (partial recv-chat-message component))
    component)
  (fn [component] component))
