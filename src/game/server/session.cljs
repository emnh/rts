(ns ^:figwheel-always game.server.session
  (:refer-clojure :exclude [assert])
  (:require
    [cljs.nodejs :as nodejs]
    [com.stuartsierra.component :as component])

  (:require-macros [game.shared.macros :as macros :refer [defcom]]))


(defonce session (nodejs/require "express-session"))
(defonce MongoDBStore ((nodejs/require "connect-mongodb-session") session))
(defonce assert (nodejs/require "assert"))

(defn create-session
  [session-secret store]
  (session
    #js {
         :secret session-secret
         :key "express.sid"
         :resave false
         :saveUninitialized false
         :store store}))

(defn start
  [component]
  (if
    (= (:start-count component) 0)
    (let
      [config (:config component)
       url (get-in config [:db :url])
       session-secret (get-in config [:session :secret])
       store
        (new MongoDBStore #js {
           ; TODO: reuse db connection?
                               :uri url
                               :collection "mySessions"})

       _ (-> store (.on "error"
                        (fn [error]
                          (-> assert (.ifError error)))))]

      (->
        component
        (assoc :store store)
        (assoc :session (create-session session-secret store))))
   (let
      [config (:config component)
       session-secret (get-in config [:session :secret])
       store (:store component)]

      (->
        component
        (assoc :session (create-session session-secret store))))))

(defn stop
  [component]
  component)


(defcom
  new-session
  [config]
  [store session]
  start
  stop)
