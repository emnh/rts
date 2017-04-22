(ns ^:figwheel-always game.client.game
  (:require
    [cljs.pprint :as pprint]
    [com.stuartsierra.component :as component]
    [jayq.core :as jayq :refer [$]]
    [promesa.core :as p]
    [cats.core :as m]
    [rum.core :as rum]
    [game.client.common :as common :refer [new-jsobj list-item data]]
    [game.client.config :as config]
    [game.client.controls :as controls]
    [game.client.renderer :as renderer]
    [game.client.routing :as routing]
    [game.client.scene :as scene]
    [game.client.overlay :as overlay]
    [game.client.engine :as engine]
    [game.client.selection :as selection]
    [game.client.ground-local :as ground-local]
    [game.client.magic :as magic]
    [game.client.explosion :as explosion]
    [game.client.water :as water]
    [game.client.minimap :as minimap]
    [sablono.core :as sablono :refer-macros [html]]
    [clojure.string :as string :refer [join]]
    [game.shared.state :as state :refer [with-simple-cause]])

  (:require-macros [game.shared.macros :as macros :refer [defcom]]))


; TODO: validate params
(defn new-system
  [params]
  (let
    [system
     {
      :params params
      :config config/config
      :renderer (new-jsobj #(new js/THREE.WebGLRenderer #js { :antialias true}))
      :scene (new-jsobj #(new js/THREE.Scene))
      :scene-properties (scene/new-scene-properties)
      :$overlay (new-jsobj #($ "<canvas/>"))
      :three-overlay (overlay/new-xp-overlay)
      :pixi-overlay (overlay/new-overlay)
      :raycaster (new-jsobj #(new js/THREE.Raycaster))
      :camera (new-jsobj scene/get-camera)
      :light1 (new-jsobj #(new js/THREE.DirectionalLight))
      ;:light1 (new-jsobj #(new js/THREE.SpotLight))
      :light2 (new-jsobj #(new js/THREE.PointLight))
      :light3 (new-jsobj #(new js/THREE.AmbientLight))
      :light4 (new-jsobj #(new js/THREE.DirectionalLight))
      :ground (ground-local/new-init-ground)
      :render-stats (new-jsobj #(new js/Stats))
      :engine-stats (new-jsobj #(new js/Stats))
      :init-scene (scene/new-init-scene)
      :init-light (scene/new-init-light)
      :init-stats (scene/new-init-stats)
      :init-renderer (renderer/new-init-renderer)
      :resize (scene/new-on-resize)
      :controls (controls/new-controls)
      :selector (selection/new-selector)
      :engine (engine/new-engine)
      :units (engine/new-test-units)
      :magic (magic/new-magic)
      :update-magic (magic/new-update-magic)
      :explosion (explosion/new-explosion)
      :update-explosion (explosion/new-update-explosion)
      :compute-shader (water/new-compute-shader)
      :water (water/new-init-water)
      :update-water (water/new-update-water)
      :minimap (minimap/new-minimap)}]

    system))
