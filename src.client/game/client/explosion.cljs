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
    [
     divisor 1000.0
     current-time (common/game-time)
     ]
    (engine/for-each-unit
      (:units component)
      (fn
        [_ unit]
        (let
          [mesh (engine/get-unit-mesh unit)
           voxels (engine/get-unit-explosion unit)
           material (-> voxels .-material)
           uniforms (-> material .-uniforms)
           old-time (:add-time unit)
           new-time (- current-time old-time)
           duration (-> uniforms .-duration .-value)
           alive-duration (* 1.0 divisor) ;duration
           total-duration (+ duration alive-duration)
           mod-new-time (mod new-time total-duration)
           sub-new-time (- mod-new-time alive-duration)
           mesh-visible (< sub-new-time 0)]
          (if-not mesh-visible
            (-> uniforms .-time .-value (set! sub-new-time))
            (-> uniforms .-time .-value (set! 0))))))))

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
uniform float duration;
uniform vec3 lightDirection;
uniform sampler2D groundTexture;
uniform float terrainWidth;
uniform float terrainHeight;
uniform float floatTextureDivisor;

attribute float boxIndex;
attribute vec3 boxTranslation;

varying vec3 vLightFront;
varying float vBoxIndex;
varying vec2 vUV;
varying float vTimePart;

// http://www.neilmendoza.com/glsl-rotation-about-an-arbitrary-axis/
mat4 rotationMatrix(vec3 axis, float angle)
{
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

// Simple random function
float random(float co)
{
		return fract(sin(co*12.989) * 43758.545);
}

float getGroundHeight(vec2 xy) {
  const float boxHeight = 2.0;
  xy.x = (xy.x + terrainWidth / 2.0) / terrainWidth;
  xy.y = (xy.y + terrainHeight / 2.0) / terrainHeight;
  float groundLevel = texture2D(groundTexture, xy.xy).r * floatTextureDivisor + boxHeight;
  return groundLevel;
}

void doLighting(vec3 geometryNormal) {
  const vec3 directLightColor = vec3(1.0);
  float dotNL = dot(geometryNormal, normalize(lightDirection));
  vec3 directLightColor_diffuse = PI * directLightColor;
  vLightFront = saturate(dotNL) * directLightColor_diffuse;
}

void main() {
  vBoxIndex = boxIndex;
  vUV = uv;

  if (time == 0.0) {
    doLighting(normalize(normal));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    return;
  }

	vec3 normalizedBoxTranslation = normalize(boxTranslation);
  vec3 offset = (boxTranslation - position);
  float interval = duration; // * (random(boxIndex) + 0.001);
  float factor = 4.0; // give time to finish falling
  float timePart = factor * mod(time, interval) / interval;
  vTimePart = timePart / factor;
	//float rnd = random(boxTranslation.x + boxTranslation.y + boxTranslation.z) - 0.5;
	float rnd = random(boxIndex) - 0.5;

	// https://en.wikipedia.org/wiki/Equations_of_motion
	float v0abs = 30.0 * (1.0 + rnd);
  vec3 v0base = normalizedBoxTranslation;
  //v0base.y = 0.0;
  //v0base = normalize(v0base);
	vec3 v0 = v0base * v0abs + vec3(0.0, 20.0, 0.0);
	vec3 a = vec3(0.0, -100.0, 0.0);
	vec3 r = boxTranslation + v0 * timePart + a * timePart * timePart / 2.0;

  vec4 worldPosition = modelMatrix * vec4(vec3(0.0), 1.0);
  worldPosition /= worldPosition.w;
  float groundLevel = -worldPosition.y; //getGroundHeight(worldPosition.xz + r.xz) - worldPosition.y;

  float Xa = a.y / 2.0;
  float Xb = v0.y;
  float Xc = boxTranslation.y - groundLevel;
  // Quadratic equation
  float impactTime1 = (-Xb - sqrt(abs(Xb*Xb - 4.0*Xa*Xc))) / (2.0 * Xa);
  float impactTime2 = (-Xb + sqrt(abs(Xb*Xb - 4.0*Xa*Xc))) / (2.0 * Xa);
  float impactTime = max(impactTime1, impactTime2);
  float afterImpact = max(0.0, timePart - impactTime);
  timePart = min(timePart, impactTime);

  vec3 rImpact = boxTranslation + v0 * timePart + a * timePart * timePart / 2.0;
  r.x = sign(r.x) * min(abs(r.x), abs(rImpact.x));
  r.z = sign(r.z) * min(abs(r.z), abs(rImpact.z));
  groundLevel = getGroundHeight(worldPosition.xz + r.xz) - worldPosition.y;
  r.y = max(r.y, groundLevel);

	mat4 mat = rotationMatrix(normalizedBoxTranslation, -timePart * 4.0 * PI * rnd);
	vec4 rotatedOffset = mat * vec4(offset, 1.0);
	rotatedOffset /= rotatedOffset.w;

  vec4 transformedNormal = vec4(normal, 1.0);
	transformedNormal = mat * transformedNormal;
	transformedNormal /= transformedNormal.w;
	vec3 geometryNormal = normalize(transformedNormal.xyz);
  doLighting(geometryNormal);

  float maxValueOfAfterImpact = factor - impactTime;
  vec3 newPosition = r + rotatedOffset.xyz * (1.0 - afterImpact / maxValueOfAfterImpact);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
"
  )

(def fragment-shader
"
#define RECIPROCAL_PI 0.31830988618

uniform sampler2D map;

// Simple random function
float random(float co)
{
		return fract(sin(co*12.989) * 43758.545);
}

varying vec3 vLightFront;
varying float vBoxIndex;
varying vec2 vUV;
varying float vTimePart;

void main() {
  float rnd = random(vBoxIndex);
  //vec4 diffuseColor = vec4(vUV, 0.0, 1.0);
  vec4 diffuseColor1 = texture2D(map, vUV);
  vec4 diffuseColor2 = vec4(rnd, 0.0, 0.0, 1.0);
  vec4 diffuseColor = mix(diffuseColor1, diffuseColor2, vTimePart);
  vec3 directDiffuse = vLightFront * RECIPROCAL_PI * diffuseColor.rgb;
  vec3 emissive = diffuseColor.rgb / 3.0;
  vec3 outgoingLight = directDiffuse + emissive;

  gl_FragColor = vec4(outgoingLight, diffuseColor.a);
}
"
  )

(defcom
  new-explosion
  [light1 ground]
  [start-time material]
  (fn [component]
    (let
      [light1 (data (:light1 component))
       light-direction (-> light1 .-position .clone)
       _ (-> light-direction (.sub (-> light1 .-target .-position)))
       ground-texture (:data-texture ground)
       uniforms
       #js
       {
        :map #js { :value nil }
        :time #js { :value 0.0 }
        :duration #js { :value 2000.0 }
        :lightDirection #js { :value light-direction }
        :groundTexture #js { :value ground-texture :needsUpdate true }
        :terrainWidth # js { :value (:width ground) }
        :terrainHeight #js { :value (:height ground) }
        :floatTextureDivisor #js { :value (:float-texture-divisor ground) }
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
