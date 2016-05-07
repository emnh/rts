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
    [game.client.engine :as engine]
    [sablono.core :as sablono :refer-macros [html]]
    [clojure.string :as string :refer [join]]
    [game.shared.state :as state :refer [with-simple-cause]]
    )
  (:require-macros
    [infix.macros :refer [infix]]
    [game.shared.macros :as macros :refer [defcom]])
  )

(defn get-pixi-filter
  []
  (let
    [shader nil
     TestFilter
     (fn []
       (this-as
         this
         (-> js/PIXI.Filter
           (.call this nil shader #js { :gray #js { :type "1f" :value 1 } }))))
     ]
    (set!
      (-> TestFilter .-prototype)
      (-> js/Object (.create (-> js/PIXI.Filter .-prototype))))
    (set!
      (-> TestFilter .-prototype .-constructor)
      TestFilter)
    (new js/TestFilter)))

(defn
  get-texture
  [pixi-renderer width height color light-opacity shadow-opacity shadow-width shadow-height transparent]
  (let
    [
     line-width 1
     render-texture (-> js/PIXI .-RenderTexture
                      (.create (+ width (* 2 line-width)) (+ height (* 2 line-width))))
     graphics (new js/PIXI.Graphics)
     x1 line-width
     y1 line-width
     ]
    ; main block
    (-> graphics (.lineStyle 1 0x000000 1))
    (-> graphics (.beginFill color (if transparent 0 1)))
    (-> graphics
      (.drawRect x1 y1 (- width line-width) height))
    (-> graphics .endFill)
    ; top lighter
    (-> graphics (.lineStyle 0))
    (-> graphics (.beginFill 0xFFFFFF light-opacity))
    (-> graphics
      (.drawRect x1 y1 width shadow-height))
    (-> graphics .endFill)
    ; bottom darker
    (-> graphics (.lineStyle 0))
    (-> graphics (.beginFill 0x000000 shadow-opacity))
    (-> graphics
      (.drawRect x1 (+ height (- shadow-height) (+ 1)) width 1))
    (-> graphics .endFill)
    ; bottom darker level 2
    (-> graphics (.lineStyle 0))
    (-> graphics (.beginFill 0x000000 (/ shadow-opacity 2)))
    (-> graphics
      (.drawRect x1 (+ height (- shadow-height)) width 1))
    (-> graphics .endFill)
    ; left/right shadow
    (-> graphics (.lineStyle 0))
    (-> graphics (.beginFill 0x000000 shadow-opacity))
    (-> graphics
      (.drawRect x1 y1 shadow-width height))
    (-> graphics
      (.drawRect (+ width (- shadow-width) (- x1)) y1 shadow-width height))
    (-> graphics .endFill)

    (-> pixi-renderer (.render graphics render-texture))
    render-texture
    ))

(defn on-render
  [init-renderer component]
  (let
    [health-bars (:health-bars component)
     t (common/game-time)
     screen-boxes (selection/get-screen-boxes component)
     pixi-filter (get-pixi-filter)
     stage (:stage component)
     health-bars (new js/PIXI.Graphics)
     scene-width @(get-in component [:scene-properties :width])
     scene-height @(get-in component [:scene-properties :height])
     last-frame-time @(:last-60-average init-renderer)
     pixi-renderer (:pixi-renderer component)
     bar-block-width 12
     bar-height 8
     light-opacity 0.2
     shadow-opacity 0.4
     shadow-width 1
     shadow-height 2
     new-version true
     full-version false
     get-texture
     #(get-texture
         pixi-renderer
         bar-block-width
         bar-height
         %1
         light-opacity
         shadow-opacity
         shadow-width
         shadow-height
         %2)
     green-texture (or @(:green-texture component) (get-texture 0x00FF00 false))
     yellow-texture (or @(:yellow-texture component) (get-texture 0xFFFF00 false))
     orange-texture (or @(:orange-texture component) (get-texture 0xFFA500 false))
     red-texture (or @(:red-texture component) (get-texture 0xFF0000 false))
     transparent-texture (or @(:transparent-texture component) (get-texture 0x000000 true))
     ]
    (reset! (:green-texture component) green-texture)
    (reset! (:yellow-texture component) yellow-texture)
    (reset! (:orange-texture component) orange-texture)
    (reset! (:red-texture component) red-texture)
    (reset! (:transparent-texture component) transparent-texture)

    (-> stage .removeChildren)
    (-> stage (.addChild health-bars))
    ; draw invisible rectangle so filter works on whole screen
    (-> health-bars (.lineStyle 0))
    (-> health-bars
      (.drawRect 0 0 scene-width scene-height))
    (doseq
      [[i box] (map-indexed vector screen-boxes)]
      (let
        [mesh (aget box "mesh")
         unit (engine/get-unit-for-mesh (:units component) mesh)
         line-width 1
         min-blocks 4
         ; max-blocks is important for performance, because a screen-box can exceed canvas width
         max-blocks 20
         [x1 y1 x2 y2] box
         box-width (- x2 x1)
         bar-width (* bar-block-width (min (max (math/round (/ box-width bar-block-width)) min-blocks) max-blocks))
         ; center bar on box horizontally
         x1 (infix (box-width - bar-width) / 2 + x1)
;         x1 (- x1 (rem x1 bar-block-width))
         height (- y2 y1)
         health (/ (:health unit) (:max-health (:model unit)))
         health-width (* health bar-width)
         remainder (rem health-width bar-block-width)
         last-block-opacity (/ remainder bar-block-width)
         health-width (- health-width remainder)
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
         texture
         (cond
           (< health 0.25)
           red-texture
           (< health 0.5)
           orange-texture
           (< health 0.75)
           yellow-texture
           :else
           green-texture)
         ]
        (cond
          new-version
          (do
            ; full blocks
            (doseq
              [i (range 0 health-width bar-block-width)]
              (let
                [sprite (new js/PIXI.Sprite texture)]
                (-> stage (.addChild sprite))
                (-> sprite .-position .-x (set! (+ x1 i)))
                (-> sprite .-position .-y (set! y1))))
            ; last semi-transparent block
            (let
              [sprite (new js/PIXI.Sprite texture)]
              (-> stage (.addChild sprite))
              (-> sprite .-position .-x (set! (+ x1 health-width)))
              (-> sprite .-position .-y (set! y1))
              (-> sprite .-alpha (set! last-block-opacity)))
            ; transparent blocks
            (doseq
              [i (range health-width bar-width bar-block-width)]
              (let
                [sprite (new js/PIXI.Sprite transparent-texture)]
                (-> stage (.addChild sprite))
                (-> sprite .-position .-x (set! (+ x1 i)))
                (-> sprite .-position .-y (set! y1)))))
          full-version
          (do
            ; full blocks
            (-> health-bars (.lineStyle 0))
            (-> health-bars (.beginFill color 1))
            (-> health-bars
              (.drawRect x1 y1 health-width bar-height))
            (-> health-bars .endFill)
            ; last transparent block
            (-> health-bars (.lineStyle 0))
            (-> health-bars (.beginFill color last-block-opacity))
            (-> health-bars
              (.drawRect (+ x1 health-width) y1 bar-block-width bar-height))
            (-> health-bars .endFill)
            ; borders
            (-> health-bars (.lineStyle line-width 0x000000 1))
            (-> health-bars
              (.drawRect x1 y1 bar-width bar-height))
            ; top lighter
            (-> health-bars (.lineStyle 0))
            (-> health-bars (.beginFill 0xFFFFFF light-opacity))
            (-> health-bars
              (.drawRect x1 y1 bar-width shadow-height))
            (-> health-bars .endFill)
            ; bottom darker
            (-> health-bars (.lineStyle 0))
            (-> health-bars (.beginFill 0x000000 shadow-opacity))
            (-> health-bars
              (.drawRect x1 (+ y1 bar-height (- shadow-height)) bar-width shadow-height))
            (-> health-bars .endFill)
            (doseq
              [i (range bar-block-width (inc bar-width) bar-block-width)]
              ; left/right shadow
              (-> health-bars (.lineStyle 0))
              (-> health-bars (.beginFill 0x000000 shadow-opacity))
              (-> health-bars
                (.drawRect (+ x1 i (- bar-block-width)) y1 shadow-width bar-height))
              (-> health-bars
                (.drawRect (+ x1 i (- shadow-width)) y1 shadow-width bar-height))
              (-> health-bars .endFill)
              ; block borders
              (-> health-bars (.lineStyle line-width 0x000000 1))
              (-> health-bars
                (.drawRect x1 y1 i bar-height)))))))))

(defcom
  new-overlay
  [$overlay params units camera renderer scene-properties]
  [pixi-renderer stage
   green-texture orange-texture yellow-texture red-texture transparent-texture]
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
       component
       (-> component
         (assoc :green-texture (atom nil))
         (assoc :orange-texture (atom nil))
         (assoc :yellow-texture (atom nil))
         (assoc :red-texture (atom nil))
         (assoc :transparent-texture (atom nil))
         (assoc :stage stage)
         (assoc :pixi-renderer pixi-renderer))]
      component))
  (fn [component] component))
