(ns ^:figwheel-always game.server.session
  (:require
    [cljs.nodejs :as nodejs]
    [com.stuartsierra.component :as component]
    )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  )

(defonce session (nodejs/require "express-session"))
(defonce MongoDBStore ((nodejs/require "connect-mongodb-session") session))
(defonce assert (nodejs/require "assert"))

(defn start
  [component]
  (let
    [config (:config component)
     session-secret (get-in config [:session :secret])
     url (get-in config [:db :url])
     store
      (new MongoDBStore #js { 
         ; TODO: reuse db connection?
         :uri url 
         :collection "mySessions"
         })
     _ (-> store (.on "error" 
                      (fn [error]
                        (-> assert (.ifError error)))))
     session
       (session
          #js { 
              :secret session-secret 
              :key "express.sid"
              :resave false
              :saveUninitialized false
              :store store
              })]
    (assoc component :session session)))

(defn stop
  [component]
  component
  )

(defcom
  new-session
  [config]
  [session]
  start
  stop
  )
