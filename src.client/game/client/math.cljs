(ns ^:figwheel-always game.client.math
  (:refer-clojure :exclude [max min]))

(defn square [x] (* x x))
(def sqrt #(-> js/Math (.sqrt %)))
(def sin #(-> js/Math (.sin %)))
(def cos #(-> js/Math (.cos %)))
(def tan #(-> js/Math (.tan %)))
(def atan2 #(-> js/Math (.atan2 %1 %2)))
(def pi (-> js/Math .-PI))
(def floor #(-> js/Math (.floor %)))
(def ceil #(-> js/Math (.ceil %)))
(def round #(-> js/Math (.round %)))
(def random #(-> js/Math (.random)))
(def isNaN #(js/isNaN %))
(def max #(-> js/Math (.max %1 %2)))
(def min #(-> js/Math (.min %1 %2)))
(def log2 #(-> js/Math (.log2 %)))
(def pow2 #(-> js/Math (.pow 2.0 %)))
(defn round-pow2
  [x]
  (let
    [xr (log2 x)
     xr (ceil xr)
     xr (pow2 xr)]
    xr))
(defn round-square [x]
  (let
    [xr (sqrt x)
     xr (ceil xr)
     xr (square xr)]
    xr))
