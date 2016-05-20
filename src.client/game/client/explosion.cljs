(ns ^:figwheel-always game.client.explosion
  (:require
    [cljs.pprint :as pprint]
    [com.stuartsierra.component :as component]
    [promesa.core :as p]
    [cats.core :as m]
    [game.client.math :as math]
    [game.client.common :as common :refer [data]]
    [game.client.engine :as engine]
    )
  (:require-macros
    [infix.macros :refer [infix]]
    [game.shared.macros :as macros :refer [defcom]])
  )

(defn on-render
  [init-renderer component]
  (let
    [unit-voxels (engine/get-unit-voxels (:units component))
     divisor 1000.0
     t (- (common/game-time) (:start-time (:explosion component)))
     ]
    (doseq
      [mesh unit-voxels]
      (let
        [material (-> mesh .-material)
         uniforms (-> material .-uniforms)]
        (-> uniforms .-time .-value (set! t))))))

(defcom
  new-update-explosion
  [units explosion]
  []
  (fn [component]
    component)
  (fn [component]
    component))

(def vertex-shader
"
#define PI 3.141592653589793238462643383
#define saturate(a) clamp(a, 0.0, 1.0)

uniform float time;
uniform vec3 lightDirection;

attribute float boxIndex;
attribute vec3 boxTranslation;

varying vec3 vLightFront;

void main() {
  const vec3 directLightColor = vec3(1.0);

  // TODO: recompute normal necessary?
  vec3 geometryNormal = normalize(normal);
  float dotNL = dot(geometryNormal, normalize(lightDirection));
  vec3 directLightColor_diffuse = PI * directLightColor;
  vLightFront = saturate(dotNL) * directLightColor_diffuse;

  float interval = 1000.0;
  vec3 offset = (boxTranslation - position);
  float timePart = mod(time, interval) / interval;
  vec3 newPosition = boxTranslation * 5.0 * timePart + offset;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
"
  )

(def fragment-shader
"
#define RECIPROCAL_PI 0.31830988618

varying vec3 vLightFront;

void main() {
  vec4 diffuseColor = vec4(1.0);
  vec3 directDiffuse = vLightFront * RECIPROCAL_PI * diffuseColor.rgb;
  gl_FragColor = vec4(directDiffuse, diffuseColor.a);
}
"
  )

(defcom
  new-explosion
  [light1]
  [start-time material]
  (fn [component]
    (let
      [light1 (data (:light1 component))
       light-direction (-> light1 .-position .clone)
       _ (-> light-direction (.sub (-> light1 .-target .-position)))
       uniforms
       #js
       {
        :time #js { :value 0.0 }
        :lightDirection #js { :value light-direction }
        }
       material
       (new js/THREE.ShaderMaterial
            #js
            {
             :uniforms uniforms
             :vertexShader vertex-shader
             :fragmentShader fragment-shader
             })
       component
       (-> component
         (assoc :material material)
         (assoc :start-time (common/game-time)))]
      component))
  (fn [component]
    component))
