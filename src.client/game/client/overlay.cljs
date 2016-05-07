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

(def shader
"
precision mediump float;

varying vec2 vTextureCoord;
varying vec4 vColor;

uniform sampler2D uSampler;
uniform float gray;

void main(void)
{
  vec4 rgba = texture2D(uSampler, vTextureCoord);
  vec4 rgba_orig = rgba;
  const float block_width = 12.0;
  float width = gl_FragCoord.x / vTextureCoord.x;
  float height = gl_FragCoord.y / vTextureCoord.y;
  vec4 neighbourTop = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - 1.0 / height));
  vec4 neighbourTop2 = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - 2.0 / height));
  vec4 neighbourBottom = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + 1.0 / height));
  vec4 neighbourBottom2 = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + 2.0 / height));
  float x = vTextureCoord.x;
  float y = vTextureCoord.y;
  //float localX = gl_FragCoord.x - rgba.b * width;
  float localX = 0.0; // gl_FragCoord.x; // - rgba.b * 12.0;

  for (float i = 0.0; i < 20.0; i += 1.0) {
    float offset = i * block_width;
    vec4 left = texture2D(uSampler, vec2(vTextureCoord.x - offset / width, vTextureCoord.y));
    if (left.a == 0.0) {
      localX = offset;
      break;
    }
  }
  float maxX = 0.0;
  for (float i = 0.0; i < 20.0; i += 1.0) {
    float offset = i * block_width;
    vec4 left = texture2D(uSampler, vec2(vTextureCoord.x + offset / width, vTextureCoord.y));
    if (left != rgba_orig) {
      maxX = offset;
      break;
    }
  }
  float bar_width = maxX + localX;

  const float eps = 1.0e-7;
  float offsetX = localX / bar_width;
  float health = rgba_orig.b;
  float health_width = health * bar_width;
  float remainder = mod(health * bar_width, block_width);
  health_width -= remainder;
  float last_block_opacity = remainder / block_width;
  rgba.b = 0.0;
  vec3 color = rgba_orig.rgb;
  if (health < 0.25) {
    color = vec3(1.0, 0.0, 0.0);
  } else if (health < 0.5) {
    color = vec3(1.0, 165.0 / 255.0, 0.0);
  } else if (health < 0.75) {
    color = vec3(1.0, 1.0, 0.0);
  } else {
    color = vec3(0.0, 1.0, 0.0);
  }
  float blockX = gl_FragCoord.x;
  bool transparent = false;
  if (rgba.a > 0.0) {
    if (localX <= health_width) {
      rgba.rgb = color;
    } else if (localX - 12.0 <= health_width) {
      rgba.rgb = color;
      rgba.a = last_block_opacity;
    } else {
      rgba = vec4(0.0);
      transparent = true;
    }
    // block separator
    if (mod(blockX, 12.0) < 1.0) {
      rgba.rgba = vec4(vec3(0.0), 1.0);
    }
    // shadow left
    if (mod(blockX - 1.0, 12.0) < 1.0) {
      if (transparent) {
        rgba = vec4(vec3(0.0), 0.1);
      } else {
        rgba.rgb = mix(color, vec3(0.0), 0.1);
      }
    }
    //shadow right
    if (mod(blockX + 1.0, 12.0) < 1.0) {
      if (transparent) {
        rgba = vec4(vec3(0.0), 0.1);
      } else {
        rgba.rgb = mix(color, vec3(0.0), 0.1);
      }
    }
    // border top
    if (rgba_orig.a != neighbourTop.a) {
      rgba = vec4(vec3(0.0), 1.0);
    }
    // border bottom
    if (rgba_orig.a != neighbourBottom.a) {
      rgba = vec4(vec3(0.0), 1.0);
    }
    // light top
    if (neighbourTop.a != neighbourTop2.a) {
      if (transparent) {
        //rgba = vec4(vec3(1.0), 0.0);
      } else {
        rgba.rgb = mix(rgba.rgb, vec3(1.0), 0.2);
      }
    }
    // shadow bottom
    if (neighbourBottom.a != neighbourBottom2.a) {
      if (transparent) {
        rgba = vec4(vec3(0.0), 0.4);
      } else {
        rgba.rgb = mix(rgba.rgb, vec3(0.0), 0.4);
      }
    }
  }
  gl_FragColor = rgba;
}
")

(defn get-pixi-filter
  []
  (let
    [TestFilter
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
     fast-version false ;(> last-frame-time (* 16.67 2))
     ]
;    (-> health-bars .clear)
    (if fast-version
      (-> stage .-filters (set! #js [pixi-filter])))
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
         bar-height 8
         bar-block-width 12
         min-blocks 4
         ; max-blocks is important for performance, because a screen-box can exceed canvas width
         max-blocks 20
         shadow-width 2
         shadow-height 2
         light-opacity 0.2
         shadow-opacity 0.4
         [x1 y1 x2 y2] box
         box-width (- x2 x1)
         bar-width (* bar-block-width (min (max (math/round (/ box-width bar-block-width)) min-blocks) max-blocks))
         ; center bar on box horizontally
         x1 (infix (box-width - bar-width) / 2 + x1)
         x1 (- x1 (rem x1 bar-block-width))
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
         ;color (+ color (* (rem x1 bar-block-width) 255))
         ]
        (if fast-version
          (do
            ; full blocks
            (-> health-bars (.lineStyle 0))
            (-> health-bars (.beginFill (* health 255) 1))
            (-> health-bars
              (.drawRect x1 y1 bar-width bar-height))
            (-> health-bars .endFill)
            )
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
  [pixi-renderer stage]
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
         (assoc :stage stage)
         (assoc :pixi-renderer pixi-renderer))]
      component))
  (fn [component] component))
