(ns ^:figwheel-always game.server.db
  (:require
    [cljs.nodejs :as nodejs]))

(defonce mongo-client (nodejs/require "mongodb"))

(def url "mongodb://localhost:27017/rts")

(defn connect
  [mstate]
  (-> mongo-client .connect url callback))
