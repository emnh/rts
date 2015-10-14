(ns ^:figwheel-always game.server.socket
  (:require
    [cljs.nodejs :as nodejs]
    [hiccups.runtime :as hiccupsrt]
    [com.stuartsierra.component :as component]
    [promesa.core :as p]
    [cats.core :as m]
    [game.server.db :as db]
    [game.server.games :as games]
    )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  )

(defonce iosession (nodejs/require "socket.io-express-session"))

(defn
  user-list
  [sockets]
  (vec (map #(-> % .-handshake .-session .-user .-displayName) sockets)))

(defn
  user-list-c
  [component]
  (clj->js (user-list @(:sockets component))))

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
      socket "get-map"
       (fn [data]
         (println ["get-map" data])
         (.emit socket "get-map" (clj->js (:map map)))))
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
            (-> (get-in component [:server :io]))))))
    (.on
      socket "disconnect"
      (fn []
        (swap! (:sockets component) (fn [sockets] (remove #(= socket %) sockets)))
        (-> (get-in component [:server :io]) (.emit "user-list" (user-list-c component)))))))

(defn handler
  [component socket]
  (let
    [io (get-in component [:server :io])]
      (swap! (:sockets component) #(conj % socket))
      (-> io (.emit "user-list" (user-list-c component)))
      (io-connection component socket (:config component) (:map component))))

(defcom 
  new-socket
  [server config map session db games]
  [sockets done]
  (fn [component]
    (if
      done
      component
      (let
        [io (:io server)
         sockets (or sockets (atom []))
         session (:session session)
         component
          (->
            component
            (assoc :sockets sockets)
            (assoc :done true))
         handler #(handler component %)
         ]
        (-> io (.use (iosession session)))
        (-> io (.on "connection" handler))
        component)))
  (fn [component] component))
