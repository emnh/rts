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
  (let
    [displayName (-> socket .-handshake .-session .-user .-displayName)]
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

