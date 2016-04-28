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

(defcom
  new-games
  [config db]
  [games dbread]
  (fn [component]
    (if 
      games
      component
      (let
        [games (atom {})
         component (assoc component :games games)
         component
           (assoc component
             :db-read
             (m/mlet
               [docs (db/find-joinable-games (:db component))]
               (let
                 [docs (js->clj docs :keywordize-keys true)
                  f #(assoc %1 (:id %2) %2)
                  docs (reduce 
                         f 
                         {}
                         (for [game docs]
                           (do
                             (-> game
                               (assoc :id (db/get-id (:_id game)))))))]
                  (swap! games #(merge % docs)))
               games))]
      component)))
  (fn [component]
    component))

(defn
  join-game
  [games game-id user broadcast-socket]
  (let
    [userid (db/get-id (-> user .-_id))]
    (swap!
      (:games games)
      (fn [games] 
        (->
          games
          (assoc-in 
            [game-id :players userid :display-name]
            (-> user .-displayName)))))
    (pprint/pprint ["join-game" @(:games games)])
    (-> broadcast-socket
      (.emit "game-list" (clj->js @(:games games))))))

(defn
  new-game
  [games uid]
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
    (println "games/new-game" game)
    (db/insert (:db games) "games" (clj->js game))))
