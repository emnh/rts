(ns ^:figwheel-always game.client.magic
  (:require
    [cljs.pprint :as pprint]
    [com.stuartsierra.component :as component]
    [promesa.core :as p]
    [cats.core :as m]
    [rum.core :as rum]
    [game.client.common :as common :refer [new-jsobj list-item data unique-id]]
    [game.client.ground-local :as ground]
    [game.client.math :as math]
    [game.client.scene :as scene]
    [game.client.engine :as engine]
    [game.worker.state :as worker-state]
    )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  )

(def standard-vertex-shader
"
#define PI 3.141592653589793238462643383
#define saturate(a) clamp(a, 0.0, 1.0)

uniform float time;
uniform vec4 offsetRepeat;
uniform vec3 lightDirection;
uniform vec3 boundingBoxSize;

varying vec2 vUV;
varying vec3 vLightFront;

void main() {

  vUV = uv * offsetRepeat.zw + offsetRepeat.xy;

  const vec3 directLightColor = vec3(1.0);

  //vec3 geometryNormal = normalize(normalMatrix * normal);
  vec3 geometryNormal = normalize(normal);
  float dotNL = dot(geometryNormal, normalize(lightDirection));
  vec3 directLightColor_diffuse = PI * directLightColor;
  vLightFront = saturate(dotNL) * directLightColor_diffuse;

  //vec4 center = modelMatrix * vec4(vec3(0.0), 1.0);
  const float interval = 5000.0;
  float maxY = (mod(time, interval) / interval) * boundingBoxSize.y;
  float newY = min(maxY, position.y);
  newY = sin(time / 1000.0) * position.y;
  vec3 newPosition = vec3(position.x, newY, position.z);
  vec4 mvPosition = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  gl_Position = mvPosition;
}
")

(def standard-fragment-shader
"
#define RECIPROCAL_PI 0.31830988618

varying vec2 vUV;
varying vec3 vLightFront;
uniform sampler2D map;
uniform float time;

void main() {
  vec4 diffuseColor = texture2D(map, vUV);
  vec3 directDiffuse = vLightFront * RECIPROCAL_PI * diffuseColor.rgb;
  vec3 emissive = diffuseColor.rgb / 3.0;
  vec3 outgoingLight = directDiffuse + emissive * sin(time);

  gl_FragColor = vec4(outgoingLight, diffuseColor.a);
}
")

(defn on-render
  [init-renderer component]
  (let
    [unit-meshes (engine/get-unit-meshes (:units component))
     divisor 1000.0
     t (/ (common/game-time) divisor)]
    (doseq
      [mesh unit-meshes]
      (let
        [material (-> mesh .-material)
         uniforms (-> material .-uniforms)]
        (-> uniforms .-time .-value (set! t))
        (-> uniforms .-time .-needsUpdate (set! true))
        (-> uniforms .-needsUpdate (set! true))
        (-> material .-needsUpdate (set! true))
        (-> mesh .-needsUpdate (set! true))
        (println "value" (-> uniforms .-time .-value))
      ))))

(defcom
  new-update-magic
  [units scene]
  []
  (fn [component]
    component)
  (fn [component]
    component)
  )

(defn get-standard-material
  [component]
  (let
    [light1 (data (:light1 component))
     light-direction (-> light1 .-position .clone)
     _ (-> light-direction (.sub (-> light1 .-target .-position)))
     uniforms
     #js
     {
      :time #js { :value 0.0 }
      :map #js { :value nil }
      :offsetRepeat #js { :value (new THREE.Vector4 0 0 1 1) }
      :lightDirection #js { :value light-direction }
      :boundingBoxSize # js { :value (new js/THREE.Vector3) }
      }]
    (new js/THREE.ShaderMaterial
         #js
         {
          :uniforms uniforms
          :vertexShader standard-vertex-shader
          :fragmentShader standard-fragment-shader
          })))

(defcom
  new-magic
  [light1 init-light]
  [standard-material]
  (fn [component]
    (-> component
      ;(assoc :standard-material (or standard-material (get-standard-material)))))
      (assoc :standard-material (get-standard-material component))))
  (fn [component]
    component)
  )
