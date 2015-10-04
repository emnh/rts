(ns ^:figwheel-always game.socket
  (:require-macros [cljs.core.async.macros :refer [go]])
  (:require 
              [cljs.pprint :as pprint]
              [jayq.core :as jayq :refer [$]]
              [cljs.pprint :as pprint]
              [game.config :as config]
              [game.common :as common :refer [get-idempotent]]
              [cljs.core.async :refer [<! put! chan]]
              [clojure.string :refer [join]]
              ))
 

(defn initSocket
  [mstate mstate-chan]
  (pprint/pprint ["mstate :socket" (:socket mstate)])
  (let
    [script-chan (chan)
     path [:socket :loaded]
     ; TODO: read from configuration file
     socket-io-URL "http://localhost:3451/"
     socket-io-script (str socket-io-URL "socket.io/socket.io.js")
     onScriptSuccess 
       #(do
         (put! script-chan true)
         (put! mstate-chan {:path path :value true}))
     _
       (if-let 
         [oldVal (get-in mstate path)]
         (put! script-chan oldVal)
         (->
           (.getScript js/$ socket-io-script onScriptSuccess)
           (.fail #(println (str "Failed to get socket.io from: " socket-io-script)))))
     socket-path [:socket :socket]
     _
     (go 
        (if-let
          [oldVal (get-in mstate socket-path)]
          oldVal
          (do
            (<! script-chan)
            (println "Creating socket")
            (let
              [socket (-> js/io (.connect socket-io-URL))]
              (put! mstate-chan {:path socket-path :value socket}))
            )))
     ]
    ))
