(ns ^:figwheel-always game.dev
  (:require [figwheel.client :as fw]
            [figwheel.client.utils :as utils]
            [game.core]))

(defn on-js-reload
  []
  (game.core/reload))

(defn -main []
  (figwheel.client/start
    {
     :websocket-url (str "ws://"
                      (if (utils/html-env?) js/location.host "localhost:3450")
                      "/figwheel-ws")
     :on-jsload on-js-reload
     })
  (game.core/-main))

(set! *main-cli-fn* -main)
