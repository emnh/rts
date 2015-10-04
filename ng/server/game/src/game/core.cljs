(ns ^:figwheel-always game.core
  (:require [cljs.nodejs :as nodejs]))

(nodejs/enable-util-print!)

(defn -main []
  (println "Hello world!"))

(set! *main-cli-fn* -main)
