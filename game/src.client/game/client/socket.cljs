(ns ^:figwheel-always game.client.socket
  (:require-macros [cljs.core.async.macros :refer [go]])
  (:require 
              [cljs.pprint :as pprint]
              [jayq.core :as jayq :refer [$]]
              [cljs.pprint :as pprint]
              [game.client.config :as config]
              [game.client.common :as common :refer [get-idempotent]]
              [cljs.core.async :refer [<! put! chan]]
              [clojure.string :refer [join]]
              [com.stuartsierra.component :as component]
              ))
 
(defrecord InitSocket
  [socket]
  component/Lifecycle
  (start [component]
      (if
        (= socket nil)
        (let
          [
           socket-io-URL (-> js/window .-location)
           socket (-> js/io (.connect socket-io-URL))]
          (println (str "Created socket on " socket-io-URL))
          (assoc component :socket socket))
        component))
  (stop [component] component))

(defn new-init-socket
  []
  (component/using
    (map->InitSocket {})
    []))
