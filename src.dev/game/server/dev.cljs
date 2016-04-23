(ns ^:figwheel-always game.server.dev
  (:require 
    [cljs.nodejs :as nodejs]
    [figwheel.client :as fw]
    [figwheel.client.utils :as utils]
    [game.server.core :as core]))

(nodejs/enable-util-print!)

(defn on-js-reload
  []
  (println "reload"))

(defn -main []
  (figwheel.client/start
    {
     :websocket-url (str "ws://"
                      (if (utils/html-env?) js/location.host "localhost:3450")
                      "/figwheel-ws")
     :on-jsload on-js-reload
     })
  );(core/-main))

(set! *main-cli-fn* -main)
