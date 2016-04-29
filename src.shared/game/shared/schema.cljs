(ns ^:figwheel-always game.shared.schema
	(:require [schema.core :as s
						 :include-macros true ;; cljs only
							 ]))

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
      :display-name s/Str
      }
     }
    }
   }
  )

(def ChatMessage
  {
   :date js/Date
   :uid Id
   :user s/Str
   :message s/Str
   }
  )

(defn validate-game-list
  [game-list]
  (s/validate GameList game-list))

(defn validate-chat-message
  [chat-message]
  (s/validate ChatMessage chat-message))
