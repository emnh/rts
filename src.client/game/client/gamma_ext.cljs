(ns ^:figwheel-always game.client.gamma_ext
  (:require
    [gamma.api :as g]
    [gamma.ast :as ast]))

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
