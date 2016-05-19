(ns ^:figwheel-always game.scripts.voxelize
  (:require
    [cljs.pprint :as pprint]
    [com.stuartsierra.component :as component]
    [promesa.core :as p]
    [cats.core :as m]
    [game.client.voxelize :as voxelize]
    [cljs.nodejs :as nodejs]
    )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  )

(enable-console-print!)

(defonce fs (nodejs/require "fs"))
(defonce msgpack (nodejs/require "msgpack-lite"))

(defn main
  []
  (let
    [args (js->clj (.-argv nodejs/process))
     geo-json-fname (nth args 2)
     out-fname (nth args 3)
     geo-json (-> fs (.readFileSync geo-json-fname))
     geo-loader (new js/THREE.BufferGeometryLoader)
     json (-> js/JSON (.parse geo-json))
     geo (-> geo-loader (.parse json))
     _ (-> geo .computeBoundingBox)
     _ (-> geo .computeBoundingSphere)
     voxel-count 20
     voxel-dict (voxelize/voxelize-geometry geo voxel-count)
     voxel-dict (voxelize/fill-inside voxel-dict)
     voxel-dict-js (clj->js voxel-dict)
     voxel-dict-msgpack (-> msgpack (.encode voxel-dict-js))
     ]
    (println "processing" geo-json-fname)
    (println "vdx-js" voxel-dict-js)
    (-> fs (.writeFileSync out-fname voxel-dict-msgpack))))

(set! *main-cli-fn* main)
