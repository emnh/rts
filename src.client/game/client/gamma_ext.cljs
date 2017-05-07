(ns ^:figwheel-always game.client.gamma_ext
  (:refer-clojure
    :exclude [aget])
  (:require
    ;[gamma.ast :as ast]
    ;gamma.compiler.core
    [jayq.core :as jayq :refer [$]]
    [cljs.pprint :as pprint]
    ;[clojure.data :refer [diff]]
    fipp.engine
    [gamma.emit.emit :as emit]
    gamma.emit.fun
    gamma.emit.operator
    gamma.emit.statement
    gamma.emit.tag
    gamma.emit.construct
    [gamma.api :as g]
    [gamma.program :as program]
    ; TODO: remove after debug
    [gamma.compiler.core :as gamma_compiler_core :refer [transform]]
    [gamma.compiler.common :refer [get-element map-path location-conj]]
    [gamma.ast :as ast :refer [id? term]]
    [gamma.compiler.flatten-ast :refer [flatten-ast]]
    [gamma.compiler.bubble-term :refer [bubble-terms]]
    [gamma.compiler.insert-assignments :refer [insert-assignments]]
    [gamma.compiler.lift-assignments :refer [lift-assignments]]
    [gamma.compiler.separate-usages :refer [separate-usages]]
    [gamma.compiler.insert-variables :refer [insert-variables]]
    [gamma.compiler.move-assignments :refer [move-assignments]])
  (:require-macros [game.shared.macros :as macros :refer [console-time]]))


(defn part [v i]
  (g/aget v i))

(defn map-over-vec4 [f v]
  (apply g/vec4 (for [i (range 4)] (f (part v i)))))

(defn map-over-vec2 [f v]
  (apply g/vec2 (for [i (range 2)] (f (part v i)))))

(defn x [v]
  (g/swizzle v :x))

(defn y [v]
  (g/swizzle v :y))

(defn z [v]
  (g/swizzle v :z))

(defn w [v]
  (g/swizzle v :w))

; (defn collection-element-type [x]
;   ({:vec4 :float :vec3 :float :vec2 :float
;     :ivec4 :int :ivec3 :int :ivec2 :int
;     :bvec4 :bool :bvec3 :bool :bvec2 :bool} x))
;
; (defn aget [x i]
;   (let [t (ast/term :aget x i)]
;     (assoc
;      t
;      :type (collection-element-type (:type (first (:body t)))))))

(defn aget [x i]
  (g/aget x (g/int i)))

(defn if-statement [c a b]
  (assoc
    (ast/term :if c
             (ast/term :block a)
             (ast/term :block b))
    :type nil))

; TEST CODE

(def projection-matrix (g/uniform "projectionMatrix" :mat4))
(def model-view-matrix (g/uniform "modelViewMatrix" :mat4))
(def vertex-position (g/attribute "position" :vec3))

(def test-vertex-shader
  {
    (g/gl-position)
    (->
      (g/* projection-matrix model-view-matrix)
      (g/* (g/vec4 vertex-position 1)))})

(defn out
  [title x]
  ; (let
  ;   [ttag ($ (str "<h1>" title "</h1>"))
  ;    tag ($ (str "<div/>"))]
  ;   (-> ttag (.appendTo ".container"))
  ;   (-> tag (.appendTo ".container"))
  ;   (-> tag (.text (clj->js x)))))
  (-> js/console (.log title))
  (-> js/console (.log (-> js/JSON (.stringify (clj->js x))))))

(set! *print-fn*
  (fn [& args]
    (try
      (throw (new js/Error "err"))
      (catch js/Error e
          (.log js/console e)))
    (-> js/console (.log "hello"))
    (.apply (.-log js/console) js/console (into-array args))))

(println "test")

(defn test-shader
  [shader]
  (let
    [
      ast
        (console-time "To AST"
          (program/ast test-vertex-shader))
      db
        (console-time "Flatten AST"
          (flatten-ast ast))
      bt
        (console-time "Bubble Terms"
          (bubble-terms db))]
    shader))
    ;(out "ast" ast)
    ;(out "flatten-ast" db)))
