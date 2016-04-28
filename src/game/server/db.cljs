(ns ^:figwheel-always game.server.db
  (:refer-clojure :exclude [update find])
  (:require
    [cljs.nodejs :as nodejs]
    [com.stuartsierra.component :as component]
    [cats.core :as m]
    [cats.builtin]
    [promesa.core :as p]
    [promesa.monad]
    ))

(defonce mongo-client (nodejs/require "mongodb"))

(def Timestamp (-> mongo-client .-Timestamp))
(defn timestamp
  []
  (new Timestamp))

(defn get-id
  [objectid]
  ; see http://docs.mongodb.org/manual/reference/object-id/
  (-> objectid .toString))

(def ObjectId (-> mongo-client .-ObjectId))

(defn get-object-id
  [id]
  (new ObjectId id))

;(extend-type ObjectId
;  IEncodeClojure
;  (-js->clj [x options]
;    (println "hello" x)
;    { 
;     :id (get-id x)
;     :date (.getTimestamp x)
;     }))

(defn
  transform
  [value]
  (js->clj value :keywordize-keys true))

(defn find
  [db coll query]
  (m/mlet
    [db (:dbp db)
     coll (p/promise (.collection db coll))
     ]
    (p/promise
      (fn [resolve reject]
        (-> coll
          (.find (clj->js query))
          (.toArray 
            (fn [err docs]
              (if err
                (reject err)
                (resolve (reverse (transform docs)))))))))))

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
              (resolve (reverse (transform docs)))))))))))

(defn find-joinable-games
  [db]
  (m/mlet
    [db (:dbp db)
     coll (p/promise "games")
     coll (p/promise (.collection db coll))
     ]
    (p/promise
      (fn [resolve reject]
        (-> coll
          (.find #js {:active true :started false})
          (.sort #js { :_id -1 })
          (.toArray (fn [err docs]
            (if err
              (reject err)
              (resolve (reverse (transform docs)))))))))))


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
       (or
         (:dbp component)
         (p/promise
           (fn [resolve reject]
             (-> 
               mongo-client 
               (.connect url
                 (fn [err db]
                   (if err 
                     (reject err)
                     (resolve db))))))))
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
      (create-index
        component
        "users"
        #js { :id 1 :provider 1 }
        #js {
             :unique true
             :background true
             :w 1
             :dropDups true
             })
      ;(p/then (find-messages component) #(println %))
      component))
  (stop [component] 
;    (if
;      (:dbp component)
;      (p/then
;        (:dbp component)
;        (fn [db]
;          (.close db))))
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
          (clj->js doc)
          (fn [err docs]
            (if err
              (reject err)
              (resolve (transform docs)))))))))

(defn update
  [db coll query ops]
  (m/mlet
    [db (:dbp db)
     coll (p/promise (.collection db coll))
     ]
    (p/promise
      (fn [resolve reject]
        (.update
          coll
          (clj->js query)
          (clj->js ops)
          (fn [err docs]
            (if err
              (reject err)
              (resolve docs))))))))

(defn upsert
  [db coll query ops]
  (m/mlet
    [db (:dbp db)
     coll (p/promise (.collection db coll))
     ]
    (p/promise
      (fn [resolve reject]
        (.update
          coll
          query 
          (clj->js ops)
          #js { :upsert true }
          (fn [err docs]
            (if err
              (reject err)
              (resolve docs))))))))

