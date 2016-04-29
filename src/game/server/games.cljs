(ns ^:figwheel-always game.server.games
  (:require
    [cljs.nodejs :as nodejs]
    [cljs.pprint :as pprint]
    [hiccups.runtime :as hiccupsrt]
    [cats.core :as m]
    [cats.builtin]
    [promesa.core :as p]
    [promesa.monad]
    [com.stuartsierra.component :as component]
    [game.server.db :as db]
    )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  )

(defn
  join-game
  [db game-id uid]
  (let
    [query
     {
      :_id (db/get-object-id game-id)
      }
     ops
     {
      :$set
      {
       (str "players." uid) {}
       }
      }
     ]
    ;(println "update db" query ops)
    (db/updateOne db "games" query ops)))

(defn
  new-game
  [db uid]
  (let
    [userid uid
     game
     {
      :host userid
      :name "Unnamed"
      :started false
      :active true
      :max-player-count 2
      :players
      {
       userid {}
       }
      }]
    ;(println "games/new-game" game)
    (db/insert db "games" (clj->js game))))
