(ns ^:figwheel-always game.shared.schema
  (:require [schema.core :as s
             :include-macros true])) ;; cljs only


; TODO: id regex
(def Id s/Str)

(def GameList
  {Id
   {
    :started s/Bool
    :max-player-count s/Int
    :name s/Str
    :host Id
    :active s/Bool
    :id Id
    :players
    {
     Id
     {
      :display-name s/Str}}}})





(def ChatMessage
  {
   :date js/Date
   :uid Id
   :user s/Str
   :message s/Str})


(def UserList
  [{
    :uid Id
    :display-name s/Str}])


(defn validate-game-list
  [game-list]
  (s/validate GameList game-list))

(defn validate-chat-message
  [chat-message]
  (s/validate ChatMessage chat-message))

(defn validate-user-list
  [user-list]
  (s/validate UserList user-list))
