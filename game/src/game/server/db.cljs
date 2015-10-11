(ns ^:figwheel-always game.server.db
  (:require
    [cljs.nodejs :as nodejs]
    [com.stuartsierra.component :as component]
    [promesa.core :as p]
    [cats.core :as m]
    ))

(defonce mongo-client (nodejs/require "mongodb"))

(defn find-messages
  [db]
  (m/mlet
    [db (:dbp db)
     coll (p/promise "messages")
     coll (p/promise (.collection db coll))
     ]
    (p/promise
      (fn [resolve reject]
        (-> coll
          (.find #js {})
          (.sort #js { :date -1 })
          (.limit 20)
          (.toArray (fn [err docs]
            (if err
              (reject err)
              (resolve (reverse docs))))))))))

(defn create-index
  [db coll spec options]
  (m/mlet
    [db (:dbp db)
     coll (p/promise (.collection db coll))]
    (p/promise
      (fn [resolve reject]
        (.createIndex
          coll
          spec
          options
          (fn [err index-name]
            (if err
              (do
                (println "error creating index")
                (reject err))
              (resolve index-name))))))))

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
                    (resolve db)))))))
       component (assoc component :dbp dbp)]
      (create-index
        component
        "messages"
        #js { :date 1 }
        #js {
             :unique true
             :background true
             :w 1
             :dropDups true
             })
      ;(p/then (find-messages component) #(println %))
      component))
  (stop [component] 
    component))

(defn new-db
  []
  (component/using
   (map->InitDB {}) 
    [:config]))

(defn insert
  [db coll doc]
  (m/mlet
    [db (:dbp db)
     coll (p/promise (.collection db coll))
     ]
    (p/promise
      (fn [resolve reject]
        (.insert
          coll
          doc 
          (fn [err docs]
            (if err
              (reject err)
              (resolve docs))))))))

(def Timestamp (-> mongo-client .-Timestamp))
(defn timestamp
  []
  (new Timestamp))

(defn get-id
  [objectid]
  ; TODO: After version 2.2 this needs to be changed to .-str instead of .toString
  ; see http://docs.mongodb.org/manual/reference/object-id/
  (-> objectid .toString))

