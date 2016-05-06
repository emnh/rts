(ns ^:figwheel-always game.client.overlay
  (:require
    [cljs.pprint :as pprint]
    [com.stuartsierra.component :as component]
    [jayq.core :as jayq :refer [$]]
    [promesa.core :as p]
    [cats.core :as m]
    [rum.core :as rum]
    [game.client.common :as common :refer [new-jsobj list-item data unique-id]]
    [game.client.math :as math]
    [game.client.selection :as selection]
    [sablono.core :as sablono :refer-macros [html]]
    [clojure.string :as string :refer [join]]
    [game.shared.state :as state :refer [with-simple-cause]]
    )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  )

(defn on-render
  [component]
  (let
    [health-bars (:health-bars component)
     t (common/game-time)
     screen-boxes (selection/get-screen-boxes component)
     units @(get-in component [:units :units])]
    (-> health-bars .clear)
    (-> health-bars (.lineStyle 1 0x000000 1))
    (doseq
      [[i unit box] (map vector (range (count units)) units screen-boxes)]
      (let
        [[x1 y1 x2 y2] box
         width (- x2 x1)
         height (- y2 y1)
         health (/ i (count units))
         bar-height 8
         health-width (* health width)
         bar-width width
         y1 (- y1 bar-height)
         color
         (cond
           (< health 0.25)
           0xFF0000
           (< health 0.5)
           0xFFA500
           (< health 0.75)
           0xFFFF00
           :else
           0x00FF00)
         ]
        (-> health-bars (.beginFill color 1))
        (-> health-bars
          (.drawRect x1 y1 health-width bar-height))
        (-> health-bars .endFill)
        (-> health-bars
          (.drawRect x1 y1 width bar-height))))))

(defcom
  new-overlay
  [$overlay params units camera renderer]
  [pixi-renderer stage health-bars]
  (fn [component]
    (let
      [$container (:$page params)
       $overlay (data $overlay)
       running (atom true)
       view (aget $overlay 0)
       width (-> $overlay .width)
       height (-> $overlay .height)
       pixi-renderer 
       (or pixi-renderer
        (new js/PIXI.WebGLRenderer
             width
             height
             #js
             {
              :view view
              :antialias true
              :transparent true
              :autoResize true
              }))
       stage (new js/PIXI.Container)
       health-bars (new js/PIXI.Graphics)
       component
       (-> component
         (assoc :health-bars health-bars)
         (assoc :stage stage)
         (assoc :pixi-renderer pixi-renderer))]
      (-> stage (.addChild health-bars))
      component))
  (fn [component] component))
