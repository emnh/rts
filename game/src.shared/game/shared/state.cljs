(ns ^:figwheel-always game.shared.state
  (:require
    [com.stuartsierra.component :as component]
    )
  )

(defonce system (atom {}))

; deprecated
(defn add-component
  [k v]
  (if 
    (not (k @system))
    (swap! system #(assoc % k v))))

; deprecated
(defn readd-component
  [k v]
  (if 
    (k @system)
    (println "stopping component" k)
    (component/stop k)
    )
  (swap! system #(assoc % k v)))

(defn s-add-component
  [local-system k v]
  (if 
    (not (k @local-system))
    (swap! local-system #(assoc % k v))))

(defn s-readd-component
  [local-system k v]
  (if 
    (k @local-system)
    (println "stopping component" k)
    (component/stop k)
    )
  (swap! local-system #(assoc % k v)))
