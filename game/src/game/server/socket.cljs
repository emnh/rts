(ns ^:figwheel-always game.server.socket
  (:require-macros [hiccups.core :as hiccups :refer [html]])
  (:require
    [cljs.nodejs :as nodejs]
    [hiccups.runtime :as hiccupsrt]
    [com.stuartsierra.component :as component]
    ;[game.server.map :as map_]
    ))

(defonce iosession (nodejs/require "socket.io-express-session"))

(defn
  user-list
  [sockets]
  (vec (map #(-> % .-handshake .-session .-user .-displayName) sockets)))

(defn io-connection
  [component socket config map]
  (println "io-connection with session: " (-> socket .-handshake .-session))
  (println "io-connection from user: " (-> socket .-handshake .-session .-user .-displayName))
  (.emit socket "news" #js { :hello "world" })
  (.emit socket "user-list" (clj->js (user-list @(:sockets component))))
  (.on 
    socket "my other event"
     (fn [data]
       (println data)))
  (.on 
    socket "get-map"
     (fn [data]
       (println ["get-map" data])
       (.emit socket "get-map" (clj->js (:map map)))))
  (.on
    socket "disconnect"
    (fn []
      (swap! (:sockets component) (fn [sockets] (remove #(= socket %) sockets))))))

(defn handler
  [component socket]
  (let
    [io (get-in component [:server :io])]
      (swap! (:sockets component) #(conj % socket))
      (-> io (.emit "user-list" (clj->js (user-list @(:sockets component)))))
      (io-connection component socket (:config component) (:map component))))

(defrecord InitSocket
  [server config map sockets session done]
  component/Lifecycle
  (start [component]
    (if
      done
      component
      (let
        [io (:io server)
         sockets (or sockets (atom []))
         session (:session session)
         component
          (->
            component
            (assoc :sockets sockets)
            (assoc :done true))
         handler (partial handler component)
         ]
        (-> io (.use (iosession session)))
        (-> io (.on "connection" handler))
        component)))
  (stop [component] component)
  )

(defn new-socket
  []
  (component/using
    (map->InitSocket {})
    [:server :config :map :session]))
