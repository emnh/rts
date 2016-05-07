(ns ^:figwheel-always game.client.engine
  (:require
    [cljs.pprint :as pprint]
    [com.stuartsierra.component :as component]
    [jayq.core :as jayq :refer [$]]
    [promesa.core :as p]
    [cats.core :as m]
    [rum.core :as rum]
    [game.client.common :as common :refer [new-jsobj list-item data unique-id]]
    [game.client.ground-local :as ground]
    [sablono.core :as sablono :refer-macros [html]]
    [clojure.string :as string :refer [join]]
    [game.shared.state :as state :refer [with-simple-cause]]
    )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  )

(defn
  get-unit-for-mesh
  [component mesh]
  (let
    [mesh-to-unit-map @(:mesh-to-unit-map component)]
    (mesh-to-unit-map mesh)))

(defn
  get-unit-meshes
  [units]
  @(:unit-meshes units))

(defn
  align-to-ground
  [ground mesh xpos zpos]
  (let
    [
     bbox (-> mesh .-geometry .-boundingBox)
     ; get height of centre and four courners of box
     x1 (+ xpos (-> bbox .-min .-x))
     x2 (+ xpos (-> bbox .-max .-x))
     z1 (+ zpos (-> bbox .-min .-z))
     z2 (+ zpos (-> bbox .-max .-z))
     hc (ground/get-height ground xpos zpos)
     h11 (ground/get-height ground x1 z1)
     h12 (ground/get-height ground x1 z2)
     h21 (ground/get-height ground x2 z1)
     h22 (ground/get-height ground x2 z2)
     y (- (max hc h11 h12 h21 h22)(-> bbox .-min .-y))
     ]
    y))
