(ns ^:figwheel-always game.server.db
  (:require
    [cljs.nodejs :as nodejs]
    [com.stuartsierra.component :as component]
    [promesa.core :as p]
    [cats.core :as m]
    ))

(defonce mongo-client (nodejs/require "mongodb"))

(defrecord InitDB
  [config dbp]
  component/Lifecycle
  (start [component]
    (let
      [url (get-in config [:db :url])
       dbp
        (p/promise
          (fn [resolve reject]
            (-> 
              mongo-client 
              (.connect url
                (fn [err db]
                  (if err 
                    (reject err)
                    (resolve db)))))))]
      (assoc component :dbp dbp)))
  (stop [component] 
    component))

(defn new-initdb
  []
  (component/using
   (map->InitDB {}) 
    [:config]))
