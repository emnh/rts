(ns ^:figwheel-always game.worker.core
  (:require
    [com.stuartsierra.component :as component]
    [game.client.math :as math]
    [game.worker.message :as message]
    [game.shared.state :as state
     :refer [s-add-component s-readd-component with-simple-cause]])

  (:require-macros [game.shared.macros :as macros :refer [defcom]]))

(enable-console-print!)

(defn hello
  []
  (println "hello world"))

(defonce system (atom {}))

(s-add-component system :core (message/new-core))

(defn worker-main
  []
  (hello)
  (with-simple-cause #(swap! system component/start-system)))

(if
  (this-as
    self
    (undefined? (-> self .-document)))
  (worker-main))
