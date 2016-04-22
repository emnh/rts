(ns ^:figwheel-always game.client.socket
  (:require-macros [cljs.core.async.macros :refer [go]])
  (:require 
              [cljs.core.async :refer [<! put! chan]]
              [cljs.pprint :as pprint]
              [cljs.pprint :as pprint]
              [clojure.string :refer [join]]
              [com.stuartsierra.component :as component]
              [jayq.core :as jayq :refer [$]]
              [promesa.core :as p]
              [game.client.common :as common]
              [game.client.config :as config]
              ))
 
(defrecord InitSocket
  [socket listeners]
  component/Lifecycle
  (start [component]
      (if
        (= socket nil)
        (let
          [
           socket-io-URL (-> js/window .-location)
           socket (-> js/io (.connect socket-io-URL))]
          (println (str "Created socket on " socket-io-URL))
          (-> socket .-binaryType (set! "arraybuffer"))
          (-> component
            (assoc :socket socket)
            (assoc :listeners (atom {}))))
        component))
  (stop [component] component))

(defn new-init-socket
  []
  (component/using
    (map->InitSocket {})
    []))

; TODO: This rpc is no good. What happens with 2 simultaneous calls before return?
(defn 
  rpc
  [socket call & {:as args}]
  (if-let
    [[resolve reject] (get @(:listeners socket) call [identity identity])]
    (do
      (reject (str "new call: " call))
      (-> (:socket socket) (.removeListener call resolve))))
  (p/promise
    (fn [resolve reject]
      (let
        [resolve #(resolve (js->clj % :keywordize-keys true))]
        ;[resolve #(resolve %)]
        (swap! (:listeners socket) #(assoc % call [resolve reject]))
        (-> (:socket socket) (.on call resolve))
        (-> (:socket socket) (.emit call (clj->js args)))))))

(defn
  on
  [socket event f]
  (let
    [resolve #(f (js->clj % :keywordize-keys true))]
    (-> (:socket socket) (.on event resolve))))
