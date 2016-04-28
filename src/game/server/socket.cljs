(ns ^:figwheel-always game.server.socket
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

(defonce iosession (nodejs/require "socket.io-express-session"))

(defn io-connection
  [component socket config map]
  (println "io-connection with session: " (-> socket .-handshake .-session))
  (println "io-connection from user: " (-> socket .-handshake .-session .-user .-displayName))
  (let
    [displayName (-> socket .-handshake .-session .-user .-displayName)]
    (.emit socket "news" #js { :hello "world" })
    ; Initially send n last chat messages
    (p/then
      (db/find-messages (:db component))
      (fn [docs]
        (doseq [d docs]
          (.emit socket "chat-message" d))))
    ; Initially send active games
    (p/then
      (get-in component [:games :db-read])
      (fn [games]
        (-> socket (.emit "game-list" (clj->js  @games)))))
    (.on
      socket "chat-message"
      (fn [data]
        (let
          [doc (clj->js 
                 {
                  :user displayName
                  :message (js->clj data) 
                  :date (db/timestamp)
                  })]
          (->
            (get-in component [:server :io]) 
            (.emit "chat-message" doc))
          (db/insert (:db component) "messages" doc))))
    (.on
      socket "new-game"
      (fn [data]
        (games/new-game
          (:games component)
          (-> socket .-handshake .-session .-user)
          (-> (get-in component [:server :io])))))
    (.on
      socket "join-game"
      (fn [data]
        (let
          [data (js->clj data :keywordize-keys true)
           game-id (:game-id data)
           games (:games component)
           user (-> socket .-handshake .-session .-user)]
          (games/join-game
            games
            game-id
            user
            (-> (get-in component [:server :io]))))))))

