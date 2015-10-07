(ns ^:figwheel-always game.client.macros
  (:require 
    [cljs.pprint :as pprint]
    [clojure.pprint :as pprint2]
    [clojure.walk :as walk]
            ))

(defn with-memoized-def-fn
  [expr]
  (walk/postwalk-replace
    '{clojure.core/def game.client.macros/defm
      def game.client.macros/defm}
    expr))

(defmacro with-memoized-def
  [expr]
  (with-memoized-def-fn expr))

;(defmacro memoize-once
(defmacro defm
  [name expr]
  (let 
    [iname (symbol (str name "-internal"))]
    `(do
      (def ~iname ~expr)
      (defonce ~name (memoize #(~iname))))))


