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

(defn
  dekeywordize-keys
  [dict]
  (reduce
    #(assoc %1 (name (key %2)) (val %2))
    {}
    dict))

(defn
  games-from-db-convert
  [lobby games]
  (reduce
    (fn [m [k v]] (assoc m k (first v)))
    {}
    (group-by
      :id
      (map
        (fn [game]
          (->
            game
            (dissoc :_id)
            (update :players dekeywordize-keys)
            (assoc :id (db/get-id (:_id game)))))
        games))))

(defn update-players
  [by-uid players]
  (reduce
    (fn
     [m [k v]]
     (assoc
       m
       k
       (do
         (merge
           v
           {
            :display-name
            (:displayName (first (by-uid (name k))))
            }))))
    {}
    players))

(defn
  games-from-db
  [lobby games]
  (let
    [players (map #(:players %) games)
     uids (map name (flatten (map #(keys %) players)))
;     _ (println "uids" uids)
     query { :_id { :$in (map db/get-object-id uids) } }]
    (->
      (db/find (:db lobby) "users" query)
      (p/then
        (fn [users]
;          (println "users" users)
          (let
            [by-uid (group-by #(db/get-id (:_id %)) users)]
;            (println "by-uid" by-uid)
            (for
              [game games]
              (update game :players (partial update-players by-uid))))))
      (p/then (partial games-from-db-convert lobby)))))

(defn
  message-from-db
  [doc]
  (->
    doc
    (dissoc :_id)
    (assoc :date (.getTimestamp (:_id doc)))))

(defn recv-chat-message
  [lobby sente {:as ev-msg :keys [event id ?data uid ring-req ?reply-fn send-fn]}]
;  (println "recv-chat-message")
  (let
    [display-name (-> ring-req :body .-session .-user .-displayName)
     doc 
     {
      :uid uid
      :user display-name
      :message ?data
      :date (db/timestamp)
      }
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

(defn subscribe-chat-messages
  [lobby sente {:as ev-msg :keys [event id ?data uid ring-req ?reply-fn send-fn]}]
  (->
    (db/find-messages (:db lobby))
    (p/then
      (fn [docs]
        (doseq
         [doc docs]
          ; TODO: optimize by sending batch
          (sente/send
            sente
            uid
            :rts/chat-message
            (message-from-db doc)))))))

(defn new-game
  [lobby sente {:as ev-msg :keys [event id ?data uid ring-req ?reply-fn send-fn]}]
;  (println "lobby/new-game")
  (->
    (games/new-game (:db lobby) uid)
    (p/then
      (fn [docs]
        (when ?reply-fn
          (?reply-fn [:rts/new-game-resolve]))
        (->
          (db/find-joinable-games (:db lobby))
          (p/then (partial games-from-db lobby))
          (p/then
            (fn
              [games]
              (sente/send-to-subscribers
                sente
                :rts/game-list
                games))))))
    (p/catch
      (fn [err]
        (when ?reply-fn
          (?reply-fn [:rts/new-game-reject (str err)]))))))

(defn join-game
  [lobby sente {:as ev-msg :keys [event id ?data uid ring-req ?reply-fn send-fn]}]
  (let
    [p (games/join-game (:db lobby) (:game-id ?data) uid)]
    (-> p
      (p/then
        (fn [doc]
;          (println "join-game" doc)
;          (println "join-game" (:nModified doc))
          (if 
            (= (:n doc) 1)
            (when ?reply-fn
              (?reply-fn [:rts/join-game-resolve]))
            (when ?reply-fn
              (?reply-fn [:rts/join-game-reject "Game not found"])))))
      (p/catch
        (fn [err]
          (when ?reply-fn
            (print "replying")
            (?reply-fn [:rts/join-game-reject (str err)])))))))



(defn subscribe-game-list
  [lobby sente {:as ev-msg :keys [event id ?data uid ring-req ?reply-fn send-fn]}]
;  (println "subscribe game list")
  (->
    (db/find-joinable-games (:db lobby))
    (p/then (partial games-from-db lobby))
    (p/then
      (fn [docs]
;        (println "docs" docs)
        (sente/send
          sente
          uid
          :rts/game-list
          docs)))))

(defcom 
  new-lobby
  [config db sente-setup]
  []
  (fn [component]
    (sente/register-handler
      sente-setup
      :rts/chat-message
      (partial recv-chat-message component))
    (sente/register-subscription-handler
      sente-setup
      :rts/chat-message
      (partial subscribe-chat-messages component))
    (sente/register-subscription-handler
      sente-setup
      :rts/game-list
      (partial subscribe-game-list component))
    (sente/register-handler
      sente-setup
      :rts/new-game
      (partial new-game component))
    (sente/register-handler
      sente-setup
      :rts/join-game
      (partial join-game component))
    component)
  (fn [component] component))
