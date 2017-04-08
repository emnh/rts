(ns ^:figwheel-always game.shared.state
  (:require
    [com.stuartsierra.component :as component]))



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
    (component/stop k))

  (swap! local-system #(assoc % k v)))

(defn with-simple-cause
  [f]
  (try
    (f)
    (catch js/Object e
      (let
        [simple-e (component/ex-without-components e)]
        (if
          (boolean (re-find #"Missing dependency" (aget simple-e "message")))
          (throw simple-e)
          (do
            (.log js/console simple-e)
            (.log js/console (aget simple-e "cause"))
            (throw (aget simple-e "cause"))))))))
