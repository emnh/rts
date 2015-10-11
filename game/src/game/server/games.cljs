(ns ^:figwheel-always game.server.games
  (:require
    [cljs.nodejs :as nodejs]
    [cljs.pprint :as pprint]
    [hiccups.runtime :as hiccupsrt]
    [promesa.core :as p]
    [cats.core :as m]
    [com.stuartsierra.component :as component]
    [game.server.db :as db]
    )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  )

(defonce three (nodejs/require "three.js-node"))

(defcom
  new-games
  [config db]
  [games]
  (fn [component]
    (assoc component :games (atom {})))
  (fn [component]
    component))

(defn
  new-game
  [games user broadcast-socket]
  (let
    [userid (-> user .-id)
     game
     {
      :host userid
      :started false
      :active true
      :max-player-count 2
      :players [userid]
      :display-names
      {
       userid (-> user .-displayName)
       }
      }]
    (println "new-game" game)
    (m/mlet
      [docs (db/insert (:db games) "games" (clj->js game))
       ]
      (let
        [docs (js->clj docs :keywordize-keys true)
         game (get (:ops docs) 0)
         id (-> (:_id game) db/get-id)
         game (assoc game :id id)
         game (assoc game :name id)
         ]
        (swap! (:games games) #(assoc % id game))
        (pprint/pprint @(:games games))
        (-> broadcast-socket 
          (.emit "game-list" (clj->js @(:games games))))))))
