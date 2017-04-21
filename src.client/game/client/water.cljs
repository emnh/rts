(ns ^:figwheel-always game.client.water
  (:require
    [cljs.pprint :as pprint]
    [com.stuartsierra.component :as component]
    [game.client.math :as math :refer [floor isNaN]]
    [game.client.common :as common :refer [data]]
    [game.client.config :as config])

  (:require-macros
    [infix.macros :refer [infix]]
    [game.shared.macros :as macros :refer [defcom]]))

(def simple-vertex-shader
 "
precision highp float;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
")

(def compute-init-fragment-shader
 "
precision highp float;

#define PI 3.14
uniform vec2 uResolution;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float height = ((sin(2.0 * PI * uv.x * 20.0) + 1.0) / 2.0 +
                  (sin(2.0 * PI * uv.y * 20.0) + 1.0) / 2.0) /
                  2.0;
  gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
}
")

(def compute-fragment-shader
 "
precision highp float;

#define PI 3.14
uniform vec2 uResolution;
uniform float uWaterThreshold;
uniform float uTime;
uniform sampler2D tWaterHeight;
uniform sampler2D tGroundHeight;

#define HEIGHT 2.5

bool hitTest(vec2 uvn) {
    float h = texture2D(tGroundHeight, uvn).x;
    if (h > HEIGHT) {
        return true;
    }
    return false;
}

float getContribution(vec2 uv, float u, float uTotal) {
  float terrainHeight = texture2D(tGroundHeight, uv).x;
  float waterHeight = texture2D(tWaterHeight, uv).x;
  float totalHeight = waterHeight + terrainHeight;
  float ux = 0.0;
  if (totalHeight >= uTotal) {
      ux = min(totalHeight - uTotal, waterHeight);
  } else {
      //ux = max(totalHeight - uTotal, -u);
      ux = max(totalHeight - uTotal, -u);
  }
  // ux = totalHeight - uTotal;
  bool ht = hitTest(uv);
  if (ht) {
  	ux = 0.0;
  }
  return ux;
}

// Simple random function
float random(float co)
{
		return fract(sin(co*12.989) * 43758.545);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  float dx = 1.0 / uResolution.x;
  float dy = 1.0 / uResolution.y;

  vec2 udu = texture2D(tWaterHeight, uv).xy;

  // old elevation
  float u = udu.x;
  float terrainHeight = texture2D(tGroundHeight, uv).x;
  float uTotal = u + terrainHeight;

  // old velociy
  float du = udu.y;

  // Finite differences
  vec2 uv1 = vec2(uv.x+dx, uv.y);
  float ux = getContribution(uv1, u, uTotal);

  vec2 uv2 = vec2(uv.x-dx, uv.y);
  float umx = getContribution(uv2, u, uTotal);

  vec2 uv3 = vec2(uv.x, uv.y+dy);
  float uy = getContribution(uv3, u, uTotal);

  vec2 uv4 = vec2(uv.x, uv.y-dy);
  float umy = getContribution(uv4, u, uTotal);

  bool onlyRain = terrainHeight > uWaterThreshold;

  // new elevation
  float nu = u + du + 0.1*(umx+ux+umy+uy);
  if (onlyRain) {
      nu = u + 0.5 * (umx+ux+umy+uy);
  }

  // wave decay
  nu = 0.999999*nu;

  // new velocity
  float v = nu - u;

  if (onlyRain) {
    v = 0.0;
  }

  // rain
  if (onlyRain) {
    nu += 0.00001;
    /*
    float rnd = random(uv.x + uv.y);
    nu = sin(rnd * uTime * 5.0 / 1000.0 + rnd);
    */
  }

  if (nu < 0.0 || hitTest(uv)) {
      nu = 0.0;
      v = 0.0;
  }
  if (nu > 1.5) {
      nu = 1.5;
      v /= 1.1;
  }

  gl_FragColor = vec4(nu, v, 1.0, 1.0);
}
")

(def water-vertex-shader
 "
precision highp float;

uniform float uWaterThreshold;
uniform float uWaterElevation;
uniform float uGroundElevation;
uniform vec2 uWaterSize;
uniform vec2 uResolution;
uniform sampler2D tGroundHeight;
uniform sampler2D tWaterHeight;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {

  vec3 newPosition = position;

  vec2 puv = vec2(position.xz / uWaterSize) + vec2(0.5, 0.5);

  float ground = texture2D(tGroundHeight, puv).x;
  float groundHeight = ground * uGroundElevation;
  vec4 water = texture2D(tWaterHeight, puv);

  const float heightDivisor = 25.0;

  float height = water.x / heightDivisor;

  if (ground < uWaterThreshold) {
    newPosition.y = groundHeight + height * uWaterElevation;
    // newPosition.y = uWaterThreshold * uGroundElevation + height * uWaterElevation;
    // newPosition.y = uWaterThreshold * uGroundElevation;
  }

  float val = texture2D( tWaterHeight, puv ).x / heightDivisor;
  float valU = texture2D( tWaterHeight, puv + vec2( 1.0 / uResolution.x, 0.0 ) ).x / heightDivisor;
  float valV = texture2D( tWaterHeight, puv + vec2( 0.0, 1.0 / uResolution.y ) ).x / heightDivisor;
  vNormal = 0.5 * normalize( vec3( val - valU, 0.05, val - valV ) ) + 0.5;

  /*
  vec2 delta = 1.0 / uResolution.xy;
  vec2 coord = puv;
  vec3 dx = vec3(delta.x, texture2D(tWaterHeight, vec2(coord.x + delta.x, coord.y)).r / heightDivisor - height, 0.0);
  vec3 dy = vec3(0.0, texture2D(tWaterHeight, vec2(coord.x, coord.y + delta.y)).r / heightDivisor - height, delta.y);
  vNormal.xz = normalize(cross(dy, dx)).xz;
  vNormal.y = sqrt(1.0 - dot(vNormal.xz, vNormal.xz));
  */

  vPosition =
    vec3(newPosition.x * 2.0 / uWaterSize.x,
         height,
         newPosition.z * 2.0 / uWaterSize.y);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
")

(def water-fragment-shader
 "
precision highp float;

uniform vec3 uEye;
uniform vec3 uLight;
uniform vec2 uResolution;
uniform sampler2D tWater;
uniform sampler2D tTiles;
uniform sampler2D tWaterHeight;
uniform sampler2D tCausticTex;

varying vec3 vNormal;
varying vec3 vPosition;

const float IOR_AIR = 1.0;
const float IOR_WATER = 1.333;
const vec3 abovewaterColor = vec3(0.25, 1.0, 1.25);
const vec3 underwaterColor = vec3(0.4, 0.9, 1.0);
const float poolHeight = 1.0;
// XXX: hack. make big cube so that rim is not visible
const vec3 cubeMul = vec3(5.0, 1.0, 5.0);

struct Intersection{
	float t;
	float hit;
	vec3 hitPoint;
	vec3 normal;
	vec3 color;
};

struct Plane{
	vec3 position;
	vec3 normal;
};

vec2 intersectCube(vec3 origin, vec3 ray, vec3 cubeMin, vec3 cubeMax) {
  vec3 tMin = (cubeMin * cubeMul - origin) / ray;
  vec3 tMax = (cubeMax * cubeMul - origin) / ray;
  vec3 t1 = min(tMin, tMax);
  vec3 t2 = max(tMin, tMax);
  float tNear = max(max(t1.x, t1.y), t1.z);
  float tFar = min(min(t2.x, t2.y), t2.z);
  return vec2(tNear, tFar);
}

vec3 lookupTile(vec2 uv) {
  const float repeat = 6.0;
  vec3 rgb = texture2D(tTiles, uv * repeat).rgb;
  return rgb;
}

vec3 getWallColor(vec3 origin, vec3 point) {
  float scale = 0.5;

  vec3 wallColor;
  vec3 normal;

  if (abs(point.x) > 0.999) {
    //wallColor = texture2D(tTiles, point.yz * 0.5 + vec2(1.0, 0.5)).rgb;
    wallColor = lookupTile(point.yz * 0.5 + vec2(1.0, 0.5));
    normal = vec3(-point.x, 0.0, 0.0);
  } else if (abs(point.z) > 0.999) {
    //wallColor = texture2D(tTiles, point.yx * 0.5 + vec2(1.0, 0.5)).rgb;
    wallColor = lookupTile(point.yx * 0.5 + vec2(1.0, 0.5));
    normal = vec3(0.0, 0.0, -point.z);
  } else {
    //wallColor = texture2D(tTiles, point.xz * 0.5 + 0.5).rgb;
    wallColor = lookupTile(point.xz * 0.5 + 0.5);
    normal = vec3(0.0, 1.0, 0.0);
  }

  wallColor = lookupTile(point.xz * 0.5 + 0.5);
  normal = vec3(0.0, 1.0, 0.0);

  // scale *= 2.0;
  // scale /= length(point); /* pool ambient occlusion */
  // scale /= clamp(length(point), 0.2, 1.0); /* pool ambient occlusion */
  scale /= distance(origin, point) * 5.0; /* pool ambient occlusion */
  // scale *= 1.0 - 0.9 / pow(length(point - sphereCenter) / sphereRadius, 4.0); /* sphere ambient occlusion */

  /* caustics */
  vec3 refractedLight = -refract(-uLight, vec3(0.0, 1.0, 0.0), IOR_AIR / IOR_WATER);
  float diffuse = max(0.0, dot(refractedLight, normal));
  vec4 info = texture2D(tWaterHeight, point.xz * 0.5 + 0.5);
  if (true && point.y < info.r) {
    vec4 caustic = texture2D(tCausticTex, 0.75 * (point.xz - point.y * refractedLight.xz / refractedLight.y) * 0.5 + 0.5);
    // TODO: caustics
    caustic = vec4(0.0);
    scale += diffuse * caustic.r * 2.0 * caustic.g;
  } else {
    /* shadow for the rim of the pool */
    vec2 t = intersectCube(point, refractedLight, vec3(-1.0, -poolHeight, -1.0), vec3(1.0, 2.0, 1.0));
    diffuse *= 1.0 / (1.0 + exp(-200.0 / (1.0 + 10.0 * (t.y - t.x)) * (point.y + refractedLight.y * t.y - 2.0 / 12.0)));

    scale += diffuse * 0.5;
  }

  return wallColor * scale;
}

void intersectPlane(vec3 cPos, vec3 ray, Plane p, inout Intersection i){
	float d = -dot(p.position, p.normal);
	float v = dot(ray, p.normal);
	float t = -(dot(cPos, p.normal) + d) / v;
	if(t > 0.0 && t < i.t){
		i.t = t;
		i.hit = 1.0;
		i.hitPoint = vec3(
			cPos.x + t * ray.x,
			cPos.y + t * ray.y,
			cPos.z + t * ray.z
		);
		i.normal = p.normal;
    /*
		float diff = clamp(dot(i.normal, lightDirection), 0.1, 1.0);
		float m = mod(i.hitPoint.x, 2.0);
		float n = mod(i.hitPoint.z, 2.0);
		if((m > 1.0 && n > 1.0) || (m < 1.0 && n < 1.0)){
			diff -= 0.5;
		}

		t = min(i.hitPoint.z, 100.0) * 0.01;
		i.color = vec3(diff + t);
    */
	}
}

float intersectFloor(vec3 origin, vec3 ray) {
  Intersection i;
	i.t = 1.0e+30;
	i.hit = 0.0;
	i.hitPoint = vec3(0.0);
	i.normal = vec3(0.0);
	i.color = vec3(0.0);
  Plane plane;
  plane.position = vec3(0.0, 0.0, 0.0);
	plane.normal = vec3(0.0, 1.0, 0.0);
  intersectPlane(origin, ray, plane, i);
  return i.t;
}

vec3 getSurfaceRayColor(vec3 origin, vec3 ray, vec3 waterColor) {
  vec3 color;
  if (ray.y < 0.0) {
    vec2 t = intersectCube(origin, ray, vec3(-1.0, -poolHeight, -1.0), vec3(1.0, 2.0, 1.0));
    t.y = intersectFloor(origin, ray);
    vec3 hit = origin + ray * t.y;
    color = getWallColor(origin, hit);
  } else {
    vec2 t = intersectCube(origin, ray, vec3(-1.0, -poolHeight, -1.0), vec3(1.0, 2.0, 1.0));
    t.y = intersectFloor(origin, ray);
    vec3 hit = origin + ray * t.y;
    if (hit.y < 2.0 / 12.0) {
      color = getWallColor(origin, hit);
    } else {
      // TODO: sky cube
      // color = textureCube(sky, ray).rgb;
      color = vec3(1.0);
      color += vec3(pow(max(0.0, dot(uLight, ray)), 5000.0)) * vec3(10.0, 8.0, 6.0);
    }
  }
  if (ray.y < 0.0) {
    float gray = (color.r + color.g + color.b) / 3.0;
    color = gray * waterColor;
  }
  return color;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  // directional lights
  vec3 dirDiffuse = normalize(uLight);
  //vec3 dirDiffuse = vec3(0.0, 1.0, 0.0);

  vec3 normal = normalize(vNormal);
  // normal = vec3(0.0, -1.0, 0.0);

  vec3 totalDiffuseLight = vec3(0.0);

  vec3 dirVector = dirDiffuse;
  vec3 dirLightColor = vec3(1.0);
  float dirDiffuseWeight = max( dot( normal, dirVector ), 0.0 );
  totalDiffuseLight += dirLightColor * dirDiffuseWeight;

  vec4 color = texture2D(tWater, uv * 4.0);
  gl_FragColor = vec4(color.rgb * totalDiffuseLight, 1.0);

  // START Wallace water

  vec3 incomingRay = normalize(vPosition - uEye);

  vec3 reflectedRay = reflect(incomingRay, normal);
  vec3 refractedRay = refract(incomingRay, normal, IOR_AIR / IOR_WATER);
  float fresnel = mix(0.25, 1.0, pow(1.0 - dot(normal, -incomingRay), 3.0));

  vec3 reflectedColor = getSurfaceRayColor(vPosition, reflectedRay, abovewaterColor);
  vec3 refractedColor = getSurfaceRayColor(vPosition, refractedRay, abovewaterColor);

  gl_FragColor = vec4(mix(refractedColor, reflectedColor, fresnel), 1.0);
}
")

(defn get-compute-shader
  [component config]
  (let
    [
      screen-width (-> js/window .-innerWidth)
      screen-height (-> js/window .-innerHeight)
      plane (new js/THREE.PlaneBufferGeometry screen-width screen-height)
      placeholder-material (new js/THREE.MeshBasicMaterial)
      quad-target (new js/THREE.Mesh plane placeholder-material)
      _ (-> quad-target .-position .-z (set! -500))
      scene-render-target (new js/THREE.Scene)
      camera-ortho (new js/THREE.OrthographicCamera (/ screen-width -2) (/ screen-width 2) (/ screen-height 2) (/ screen-height -2) -10000 10000)
      _ (-> camera-ortho .-position .-z (set! 100))
      _ (-> scene-render-target (.add camera-ortho))
      _ (-> scene-render-target (.add quad-target))]
    (-> component
      (assoc :quad quad-target)
      (assoc :scene scene-render-target)
      (assoc :camera camera-ortho))))

(defcom
  new-compute-shader
  [config]
  [quad scene camera]
  (fn [component]
    (if-not
      (:started component)
      (get-compute-shader component config)
      component))
  (fn [component]
    component))


(defn on-render
  [init-renderer component]
  (let
    [compute-shader (:compute-shader component)
     scene (:scene compute-shader)
     camera (:camera compute-shader)
     quad (:quad compute-shader)
     renderer (data (:renderer init-renderer))
     water (:water component)
     render-target-index (:render-target-index component)
     [render-target1 render-target2]
     (if
      (= (rem @render-target-index 2) 0)
      [(:render-target1 water) (:render-target2 water)]
      [(:render-target2 water) (:render-target1 water)])
     compute-material (:compute-material water)
     init-material (:init-material water)
     water-material (-> (:mesh water) .-material)
     time (common/game-time)]
    (if
      (= @render-target-index 0)
      (do
        (-> quad .-material (set! init-material))
        (-> renderer (.render scene camera render-target2 true))))
    (->
      compute-material .-uniforms .-tWaterHeight .-value
      (set! (-> render-target2 .-texture)))
    (->
      compute-material .-uniforms .-uTime .-value
      (set! time))
    (-> quad .-material (set! compute-material))
    (-> renderer (.render scene camera render-target1 true))
    ;(->
    ;  compute-material .-uniforms .-tWaterHeight .-value
    ;  (set! (-> render-target1 .-texture)))
    ;(->
    ;  water-material .-uniforms .-tWaterHeight .-value
    ;  (set! (-> render-target1 .-texture)))
    (swap! render-target-index inc)))

(defcom
  new-update-water
  [compute-shader water]
  [render-target-index]
  (fn [component]
    (-> component
      (assoc :render-target-index (atom 0))))
  (fn [component]
    component))

(defn get-water
  [component config simplex]
  (let
    [
      ;compute-shader (:compute-shader component)
      pars
      #js
        {
          :wrapS js/THREE.ClampToEdgeWrapping
          :wrapT js/THREE.ClampToEdgeWrapping
          :minFilter js/THREE.LinearFilter
          :magFilter js/THREE.LinearFilter
          :format js/THREE.RGBAFormat
          ; TODO: check for support
          :type js/THREE.FloatType
          :stencilBuffer false}
      width (config/get-terrain-width config)
      height (config/get-terrain-height config)
      x-faces (get-in config [:terrain :x-faces])
      y-faces (get-in config [:terrain :y-faces])
      rx x-faces
      ry y-faces
      render-target1 (new js/THREE.WebGLRenderTarget rx ry pars)
      render-target2 (new js/THREE.WebGLRenderTarget rx ry pars)
      ground (:ground component)
      ; TODO: replace with lake map
      water-threshold 0.5
      compute-uniforms
        #js
        {
          :uTime #js { :value nil}
          :uWaterThreshold #js { :value water-threshold}
          :uResolution #js { :value (new js/THREE.Vector2 rx ry)}
          :tWaterHeight #js { :value (-> render-target1 .-texture)}
          :tGroundHeight #js { :value (:data-texture ground)}}
      compute-material
        (new
          js/THREE.ShaderMaterial
          #js
          {
            :uniforms compute-uniforms
            :vertexShader simple-vertex-shader
            :fragmentShader compute-fragment-shader})
      init-material
        (new
          js/THREE.ShaderMaterial
          #js
          {
            :uniforms compute-uniforms
            :vertexShader simple-vertex-shader
            :fragmentShader compute-init-fragment-shader})
      geometry (new js/THREE.PlaneBufferGeometry width height rx ry)
      rotation (-> (new js/THREE.Matrix4) (.makeRotationX (/ (-> js/Math .-PI) -2)))
      _ (-> geometry (.applyMatrix rotation))
      max-water-elevation (get-in config [:terrain :water-elevation])
      max-elevation (get-in config [:terrain :max-elevation])
      camera (data (:camera component))
      light1 (data (:light1 component))
      uLight (-> light1 .-position .clone)
      _ (-> uLight .normalize)
      uniforms
        #js
        {
          :uWaterThreshold #js { :value water-threshold}
          :uGroundElevation #js { :value max-elevation}
          :uWaterElevation #js { :value max-water-elevation}
          :uWaterSize #js { :value (new js/THREE.Vector2 width height)}
          :tWater #js { :value nil}
          :tTiles #js { :value nil}
          :tCausticTex #js { :value nil}
          :tWaterHeight #js { :value (-> render-target1 .-texture)}
          :tGroundHeight #js { :value (:data-texture ground)}
          :uResolution #js { :value (new js/THREE.Vector2 rx ry)}
          ;:uEye #js { :value (-> camera .-position)}
          ; fixed eye at this position experimentally found to look better
          :uEye #js { :value (new js/THREE.Vector3 -1526.0 800.0 973.0)}
          :uLight #js { :value uLight}}
      material
        (new
          js/THREE.ShaderMaterial
          #js
          {
            :uniforms uniforms
            :vertexShader water-vertex-shader
            :fragmentShader water-fragment-shader})
      wrapping (-> js/THREE .-RepeatWrapping)
      texture-loader (new THREE.TextureLoader)
      on-load
        (fn [texture]
          (-> texture .-wrapS (set! wrapping))
          (-> texture .-wrapT (set! wrapping))
          (-> texture .-repeat (.set 10.0 10.0))
          (-> material .-uniforms .-tWater .-value (set! texture))
          (-> material .-needsUpdate (set! true)))
      _ (-> texture-loader (.load "models/images/water.jpg" on-load))
      on-load-tiles
        (fn [texture]
          (-> texture .-wrapS (set! wrapping))
          (-> texture .-wrapT (set! wrapping))
          (-> texture .-repeat (.set 1.0 1.0))
          (-> material .-uniforms .-tTiles .-value (set! texture))
          (-> material .-needsUpdate (set! true)))
      ;_ (-> texture-loader (.load "models/images/tiles.jpg" on-load-tiles))
      _ (-> texture-loader (.load "models/images/grasslight-big.jpg" on-load-tiles))
      mesh (new js/THREE.Mesh geometry material)]
    (-> component
      (assoc :render-target1 render-target1)
      (assoc :render-target2 render-target2)
      (assoc :compute-material compute-material)
      (assoc :init-material init-material)
      (assoc :mesh mesh))))

(defcom
  new-init-water
  [config params compute-shader ground camera light1]
  ;[mesh height-field width height x-faces y-faces x-vertices y-vertices data-texture float-texture-divisor]
  [mesh render-target1 render-target2
   compute-material init-material]
  (fn [component]
    (if-not
      mesh
      (get-water component config (:simplex params))
      component))
  (fn [component]
    component))
