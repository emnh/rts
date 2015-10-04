(ns game.dev
  (:require [figwheel.client]
            [figwheel.client.utils :as utils]
            [game.core]))

(defn -main []
  (figwheel.client/start
    {
     :websocket-url (str "ws://"
                      (if (utils/html-env?) js/location.host "localhost:3450")
                      "/figwheel-ws")
     })
  (game.core/-main))

(set! *main-cli-fn* -main)
