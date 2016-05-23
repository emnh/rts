(ns ^:figwheel-always game.scripts.voxelize
  (:require
    [cljs.pprint :as pprint]
    [clojure.string :as string :refer [replace]]
    [com.stuartsierra.component :as component]
    [promesa.core :as p]
    [cats.core :as m]
    [game.client.models :as models]
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
  (println "voxelize main")
  (doseq [model (models/get-models)]
    (if (= (:name model) "headquarters")
      (let
        [_ (println "processing" (:name model))
         args (js->clj (.-argv nodejs/process))
         path (str "resources/public/" (:path model))
         out-fname (replace (replace path #"/3d/" "/voxels/") #"\.json$" ".msgpack")
         _ (println "reading" path)
         geo-json (-> fs (.readFileSync path))
         geo-loader (new js/THREE.BufferGeometryLoader)
         json (-> js/JSON (.parse geo-json))
         geo (-> geo-loader (.parse json))
         geo (models/transform-geometry model geo)
         _ (-> geo .computeBoundingBox)
         _ (-> geo .computeBoundingSphere)
         voxel-count 20
         voxel-dict (voxelize/voxelize-geometry geo voxel-count)
         voxel-dict (voxelize/fill-inside voxel-dict)
         voxel-dict-js (clj->js voxel-dict)
         voxel-dict-msgpack (-> msgpack (.encode voxel-dict-js))
         ]
        (println "writing" out-fname)
        (-> fs (.writeFileSync out-fname voxel-dict-msgpack))))))

(set! *main-cli-fn* main)
