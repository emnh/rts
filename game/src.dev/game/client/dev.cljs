(ns ^:figwheel-always game.client.dev
  (:require [figwheel.client :as fw]
            [figwheel.client.utils :as utils]
            [game.client.core :as core]))

(defn on-js-reload
  []
  (core/js-reload))

(defn main []
  (figwheel.client/start
    {
     :websocket-url (str "ws://" "localhost:3450" "/figwheel-ws")
     :on-jsload on-js-reload
     })
  (core/main))

(if 
  (exists? js/jQuery)
  (js/jQuery main))
