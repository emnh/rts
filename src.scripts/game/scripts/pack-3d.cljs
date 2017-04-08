(ns ^:figwheel-always game.scripts.pack_3d
  (:require
    [cljs.pprint :as pprint]
    [clojure.string :as string :refer [replace]]
    [com.stuartsierra.component :as component]
    [promesa.core :as p]
    [cats.core :as m]
    [game.client.models :as models]
    [cljs.nodejs :as nodejs])

  (:require-macros [game.shared.macros :as macros :refer [defcom]]))


(enable-console-print!)

(defonce fs (nodejs/require "fs"))
(defonce msgpack (nodejs/require "msgpack-lite"))

(defn main
  []
  (println "pack-3d main")
  (doseq [model (models/get-models)]
    (let
      [_ (println "processing" (:name model))
       args (js->clj (.-argv nodejs/process))
       path (str "resources/public/" (:path model))
       out-fname (replace path #"\.json$" ".msgpack")
       _ (println "reading" path)
       geo-json (-> fs (.readFileSync path))
       geo-loader (new js/THREE.BufferGeometryLoader)
       json (-> js/JSON (.parse geo-json))
       geo (-> geo-loader (.parse json))
       geo (models/transform-geometry model geo)
       _ (-> geo .computeBoundingBox)
       _ (-> geo .computeBoundingSphere)
       ; normals will be computed on load
       _ (js-delete (-> json .-data .-attributes) "normal")
       _ (-> json .-data .-attributes .-position .-array (set! (-> geo .-attributes .-position .-array)))
       _ (-> json .-data .-attributes .-uv .-array (set! (-> geo .-attributes .-uv .-array)))
       geo-msgpack (-> msgpack (.encode json))]

      (println "writing" out-fname)
      (-> fs (.writeFileSync out-fname geo-msgpack)))))

(set! *main-cli-fn* main)
