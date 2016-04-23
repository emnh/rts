(ns ^:figwheel-always game.client.math)

(defn square [x] (* x x))
(def sqrt #(-> js/Math (.sqrt %)))
(def sin #(-> js/Math (.sin %)))
(def cos #(-> js/Math (.cos %)))
(def atan2 #(-> js/Math (.atan2 %1 %2)))
(def pi (-> js/Math .-PI))
