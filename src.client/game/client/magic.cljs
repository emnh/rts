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

(def simple-vertex-shader
"
varying vec2 vUV;
varying vec3 vPosition;
varying vec3 vLightFront;

void main() {
  vUV = uv;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  if (gl_Position.x > 100.0) {
    gl_PointSize = 1.0;
  }
}
"
)

(def simple-fragment-shader
"
varying vec2 vUV;
uniform sampler2D map;

void main() {
  gl_FragColor = texture2D(map, vUV);
}
")

(def shared-vertex-shader
"
#define PI 3.141592653589793238462643383
#define saturate(a) clamp(a, 0.0, 1.0)

varying vec2 vUV;
varying vec3 vLightFront;
varying vec3 vPosition;
varying float vVisible;
varying float vParticleLifeTime;

uniform float time;
uniform float buildTime;
uniform float isCloud;
uniform vec4 offsetRepeat;
uniform vec3 lightDirection;
uniform vec3 boundingBoxMin;
uniform vec3 boundingBoxMax;

// Simple random function
float random(float co)
{
		return fract(sin(co*12.989) * 43758.545);
}

float getMaxY() {
  float interval = buildTime;
  float timePart = mod(time, interval) / interval;
  float maxY = timePart * (boundingBoxMax.y - boundingBoxMin.y) + boundingBoxMin.y;
  return maxY;
}
"
)

(def magic-vertex-shader
  (str shared-vertex-shader
"
void main() {
  vPosition = position;

  float width = boundingBoxMax.x - boundingBoxMin.x;
  float height = boundingBoxMax.y - boundingBoxMin.y;
  float depth = boundingBoxMax.z - boundingBoxMin.z;
  float upperBound = 30.0;
  float maxSize = min(max(width, max(height, depth)) / 2.0, upperBound);
  gl_PointSize = maxSize;

  const float interval = PARTICLE_LIFE_TIME;
  float timePart = mod(time + interval * random(position.x + position.y + position.z), interval) / interval;
  vParticleLifeTime = timePart;
  vec4 mvPosition = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  const float factor = 1.0;
  vec4 startPos = vec4(vec3(0.0, factor * (boundingBoxMax.y - boundingBoxMin.y), 0.0), 1.0);
  startPos = projectionMatrix * modelViewMatrix * startPos;
  startPos /= startPos.w;
  vec4 endPos = mvPosition;
  endPos /= endPos.w;

  mvPosition = mix(startPos, endPos, timePart);
  mvPosition /= mvPosition.w;
  mvPosition.z = -1.0;
  gl_Position = mvPosition;

  vec3 currentPosition = (modelMatrix * vec4(vec3(0.0), 1.0)).xyz;
  gl_PointSize *= 500.0 / length(cameraPosition - currentPosition);
  gl_PointSize = min(gl_PointSize, upperBound);

  float maxY = getMaxY();
  if (position.y <= maxY) {
    vVisible = 1.0;
  } else {
    vVisible = 1.0;
  }
}
"))


(def standard-vertex-shader
  (str shared-vertex-shader
"
void main() {

  //vUV = uv * offsetRepeat.zw + offsetRepeat.xy;
  vUV = uv; // * offsetRepeat.zw + offsetRepeat.xy;
	vPosition = position;

  const vec3 directLightColor = vec3(1.0);

  vec3 geometryNormal = normalize(normal);
  float dotNL = dot(geometryNormal, normalize(lightDirection));
  vec3 directLightColor_diffuse = PI * directLightColor;
  vLightFront = saturate(dotNL) * directLightColor_diffuse;

  float maxY = getMaxY();
  //float newY = min(maxY, position.y);
  float newY = position.y;
  vec3 newPosition = vec3(position.x, newY, position.z);
  vec4 mvPosition = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  mvPosition /= mvPosition.w;
  gl_Position = mvPosition;
}
"))

(def standard-fragment-shader
"
#define RECIPROCAL_PI 0.31830988618
#define TWOPI 6.28319

varying vec2 vUV;
varying vec3 vLightFront;
varying vec3 vPosition;
varying float vVisible;
varying float vParticleLifeTime;

uniform sampler2D map;
uniform float time;
uniform float isCloud;
uniform float buildTime;

const float hue_time_factor = 0.035;                          // Time-based hue shift
const float mp_hue = 0.5;                                     // Hue (shift) of the main particle
const float mp_saturation = 0.18;                             // Saturation (delta) of the main particle

// Particle time constants
const float time_factor = 1.0;                                // Time in s factor, <1. for slow motion, >1. for faster movement
const float start_time = 2.5;                                  // Time in s needed until all the nb_particles are launched
const float grow_time_factor = 0.15;                          // Time in s particles need to reach their max intensity after they are launched

// Particle intensity constants
const float part_int_div = 40000.;                            // Divisor of the particle intensity. Tweak this value to make the particles more or less bright
const float part_int_factor_min = 0.1;                        // Minimum initial intensity of a particle
const float part_int_factor_max = 3.2;                        // Maximum initial intensity of a particle
const float part_spark_min_int = 0.25;                        // Minimum sparkling intensity (factor of initial intensity) of a particle
const float part_spark_max_int = 0.88;                        // Minimum sparkling intensity (factor of initial intensity) of a particle
const float part_spark_min_freq = 2.5;                        // Minimum sparkling frequence in Hz of a particle
const float part_spark_max_freq = 6.0;                        // Maximum sparkling frequence in Hz of a particle
const float part_spark_time_freq_fact = 0.35;                 // Sparkling frequency factor at the end of the life of the particle
const float mp_int = 12.;                                     // Initial intensity of the main particle
const float dist_factor = 3.;                                 // Distance factor applied before calculating the intensity
const float ppow = 2.3;                                      // Exponent of the intensity in function of the distance

// Particle star constants
const vec2 part_starhv_dfac = vec2(9., 0.32);                 // x-y transformation vector of the distance to get the horizontal and vertical star branches
const float part_starhv_ifac = 0.25;                          // Intensity factor of the horizontal and vertical star branches
const vec2 part_stardiag_dfac = vec2(13., 0.61);              // x-y transformation vector of the distance to get the diagonal star branches
const float part_stardiag_ifac = 0.19;                        // Intensity factor of the diagonal star branches

// Variables
float time2 = 0.0;

// Simple random function
float random(float co)
{
    return fract(sin(co*12.989) * 43758.545);
}

// From https://www.shadertoy.com/view/ldtGDn
vec3 hsv2rgb (vec3 hsv) { // from HSV to RGB color vector
	hsv.yz = clamp (hsv.yz, 0.0, 1.0);
	return hsv.z*(0.63*hsv.y*(cos(TWOPI*(hsv.x + vec3(0.0, 2.0/3.0, 1.0/3.0))) - 1.0) + 1.0);
}

// Gets the rgb color the main particle in function of its intensity
vec3 getParticleColor_mp( float pint)
{
   float hue;
   float saturation;

   saturation = 0.75/pow(abs(pint), 2.5) + mp_saturation;
   hue = hue_time_factor*time2 + mp_hue;

   return hsv2rgb(vec3(hue, saturation, pint));
}

// https://www.shadertoy.com/view/Xs33R2
float getStar(vec2 uv, float sizeFactor) {
	// Main particle
	vec2 ppos = vec2(0.5, 0.275);
	float factor = sizeFactor;
	float dist = distance(uv, ppos) / factor;
	// Draws the eight-branched star
	// Horizontal and vertical branches
	vec2 uvppos = (uv - ppos) / factor;
	float distv = distance(uvppos*part_starhv_dfac + ppos, ppos);
	float disth = distance(uvppos*part_starhv_dfac.yx + ppos, ppos);
	// Diagonal branches
	vec2 uvpposd = 0.7071*vec2(dot(uvppos, vec2(1., 1.)), dot(uvppos, vec2(1., -1.)));
	float distd1 = distance(uvpposd*part_stardiag_dfac + ppos, ppos);
	float distd2 = distance(uvpposd*part_stardiag_dfac.yx + ppos, ppos);
	// Middle point intensity star inensity
	float pint1 = 1./(dist*dist_factor + 0.015) + part_starhv_ifac/(disth*dist_factor + 0.01) + part_starhv_ifac/(distv*dist_factor + 0.01) + part_stardiag_ifac/(distd1*dist_factor + 0.01) + part_stardiag_ifac/(distd2*dist_factor + 0.01);

	float pint = 0.0;
	if (part_int_factor_max*pint1>6.)
	{
			pint = part_int_factor_max*(pow(abs(pint1), ppow)/part_int_div)*mp_int;
	}

	return pint;
}

void main() {
  const float eps = 1.0e-7;

  float interval = buildTime;
  float buildLifeTime = mod(time, interval) / interval;

  if (abs(isCloud - 1.0) <= eps) {
    if (vVisible == 1.0) {
      vec2 pos = (gl_PointCoord.xy - 0.5) * 2.0;
      float a = 1.0;
      float length = length(pos);
      if (length >= 1.0) {
        a = 0.0;
      }
      gl_FragColor = vec4(vec3(1.0 - length), a);

      float starSize = STAR_SIZE * (1.0 - vParticleLifeTime + 0.5);
      // starSize *= (1.0 - buildLifeTime);
      float intensity = getStar(gl_PointCoord, starSize);
      if (intensity < STAR_OPACITY) {
        a = 0.0;
      } else {
        a = (intensity - STAR_OPACITY) * (1.0 - vParticleLifeTime);
      }
      time2 = 20.0 * random(vPosition.x + vPosition.y + vPosition.z);
      vec3 pcol = getParticleColor_mp(intensity);
      gl_FragColor = vec4(pcol, a);
    } else {
      gl_FragColor = vec4(0.0);
    }
  } else {
    vec4 diffuseColor = texture2D(map, vUV);
    vec3 directDiffuse = vLightFront * RECIPROCAL_PI * diffuseColor.rgb;
    vec3 emissive = diffuseColor.rgb / 3.0;
    vec3 outgoingLight = directDiffuse + emissive;

    diffuseColor.a = 0.25 + buildLifeTime;
    vec3 color = mix(outgoingLight + vec3(0.0, 1.0, 0.0), outgoingLight, buildLifeTime);
    //vec3 color = mix(vec3(0.0, 1.0, 0.0), outgoingLight, buildLifeTime);

    gl_FragColor = vec4(color, diffuseColor.a);
  }
}
")

(defn on-render
  [init-renderer component]
  (let
    [unit-meshes (engine/get-unit-meshes (:units component))
     unit-clouds (engine/get-unit-clouds (:units component))
     divisor 1000.0
     t (- (common/game-time) (:start-time (:magic component)))
     ]
    (doseq
      [mesh unit-meshes]
      (let
        [material (-> mesh .-material)
         uniforms (-> material .-uniforms)]
        (-> uniforms .-time .-value (set! t))))
    (doseq
      [cloud unit-clouds]
      (let
        [material (-> cloud .-material)
         uniforms (-> material .-uniforms)]
        (-> uniforms .-time .-value (set! t))))
      ))

(defcom
  new-update-magic
  [units scene magic]
  []
  (fn [component]
    component)
  (fn [component]
    component)
  )

(defn get-materials
  [component]
  (let
    [light1 (data (:light1 component))
     light-direction (-> light1 .-position .clone)
     _ (-> light-direction (.sub (-> light1 .-target .-position)))
     defines
     #js
     {
      :STAR_OPACITY 0.5
      :STAR_SIZE 10.1
      :PARTICLE_LIFE_TIME 1500.1
      }
     uniforms
     #js
     {
      :buildTime #js { :value 10000.0 }
      :map #js { :value nil }
      :isCloud #js { :value 0.0 }
      :time #js { :value 0.0 }
      :offsetRepeat #js { :value (new THREE.Vector4 0 0 1 1) }
      :lightDirection #js { :value light-direction }
      :boundingBoxMin # js { :value (new js/THREE.Vector3) }
      :boundingBoxMax # js { :value (new js/THREE.Vector3) }
      }]
    {:standard-material
     (new js/THREE.ShaderMaterial
         #js
         {
          :defines defines
          :uniforms uniforms
          :vertexShader standard-vertex-shader
          :fragmentShader standard-fragment-shader
          :transparent true
          })
     :magic-material
     (new js/THREE.ShaderMaterial
         #js
         {
          :defines defines
          :uniforms uniforms
          :vertexShader magic-vertex-shader
          :fragmentShader standard-fragment-shader
          :transparent true
          })}))

(defcom
  new-magic
  [light1 init-light]
  [standard-material]
  (fn [component]
    (let
      [{:keys [standard-material magic-material]} (get-materials component)]
      (-> component
        (assoc :start-time (common/game-time))
        (assoc :standard-material standard-material)
        (assoc :magic-material magic-material))))
  (fn [component]
    component))
