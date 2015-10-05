(ns ^:figwheel-always game.server.dev
  (:require [figwheel.client :as fw]
            [figwheel.client.utils :as utils]
            [game.server.core :as core]))

(defn on-js-reload
  []
  (core/reload))

(defn -main []
  (figwheel.client/start
    {
     :websocket-url (str "ws://"
                      (if (utils/html-env?) js/location.host "localhost:3450")
                      "/figwheel-ws")
     :on-jsload on-js-reload
     })
  (core/-main))

(set! *main-cli-fn* -main)
