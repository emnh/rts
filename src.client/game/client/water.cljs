(ns ^:figwheel-always game.client.water
  (:require
    [cljs.pprint :as pprint]
    [com.stuartsierra.component :as component]
    [game.client.math :as math :refer [floor isNaN]]
    [game.client.common :as common :refer [data]]
    [game.client.config :as config])

  (:require-macros
    [infix.macros :refer [infix]]
    [game.shared.macros :as macros :refer [defcom]]))

(defn get-compute-shader
  [component config]
  component)

(defcom
  new-compute-shader
  [config]
  []
  (fn [component]
    (if-not
      (:started component)
      (get-compute-shader component config)
      component))
  (fn [component]
    component))

(defn get-water
  [component config simplex]
  component)

(defcom
  new-init-water
  [config params compute-shader]
  ;[mesh height-field width height x-faces y-faces x-vertices y-vertices data-texture float-texture-divisor]
  [mesh]
  (fn [component]
    (if-not
      mesh
      (get-water component config (:simplex params))
      component))
  (fn [component]
    component))
