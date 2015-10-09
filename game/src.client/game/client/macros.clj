(ns ^:figwheel-always game.client.macros
  (:require 
    [cljs.pprint :as pprint]
    [clojure.pprint :as pprint2]
    [clojure.walk :as walk]
    [com.stuartsierra.component :as component]
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


(defmacro defcom
  [constructor-name dep-values state-values start stop]
  (let
    [record-name (symbol (str constructor-name "-Record"))
     new-record (symbol (str "map->" record-name))
     component (gensym)]
    `(do
       (defrecord
         ~record-name
         ~(vec (concat dep-values state-values))
         component/Lifecycle
         (~'start [~component] (~start ~component))
         (~'stop [~component] (~stop ~component))
         )
       (defn
         ~constructor-name
         []
         (component/using
           (~new-record {})
           ~(vec (map keyword dep-values)))))))
