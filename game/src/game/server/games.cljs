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
         _id (:_id game)
         id (db/get-id _id)
         game (assoc game :id id)
         game (assoc game :name id)
         ]
        (let 
          [update-promise
            (db/update 
              (:db games)
              "games" 
              #js {:_id _id}
              (clj->js (dissoc game :_id)))]
          ;(p/then update-promise (fn [success] (println "success updating game" success)))
          ;(p/catch update-promise (fn [error] (println "error updating game: " error))))
          )
        (swap! (:games games) #(assoc % id game))
        ;(pprint/pprint @(:games games))
        (-> broadcast-socket 
          (.emit "game-list" (clj->js @(:games games))))))))
