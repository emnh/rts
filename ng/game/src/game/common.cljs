(ns ^:figwheel-always game.common
    (:require 
              [cljs.pprint :as pprint]
              [jayq.core :as jayq :refer [$]]
              [game.config :as config]
              ))

(defn get-idempotent
  [mstate path f]
  (let
    [newVal
     (if-let
      [oldVal (get-in mstate path)]
      oldVal
      (f))
     mstate (assoc-in mstate path newVal)
     ]
    [newVal mstate]))


