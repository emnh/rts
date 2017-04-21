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

varying float vHeight;
varying vec3 vNormal;

void main() {

  vec3 newPosition = position;

  vec2 puv = vec2(position.xz / uWaterSize) + vec2(0.5, 0.5);

  float groundHeight = texture2D(tGroundHeight, puv).x;
  vec4 water = texture2D(tWaterHeight, puv);
  float height = water.x;

  if (groundHeight < uWaterThreshold) {
    // newPosition.y = groundHeight * uGroundElevation + height * uWaterElevation;
    newPosition.y = uWaterThreshold * uGroundElevation + height * uWaterElevation;
  }

  vHeight = height / 2.5;

  float val = texture2D( tWaterHeight, puv ).x;
  float valU = texture2D( tWaterHeight, puv + vec2( 1.0 / uResolution.x, 0.0 ) ).x;
  float valV = texture2D( tWaterHeight, puv + vec2( 0.0, 1.0 / uResolution.y ) ).x;
  vNormal = 0.5 * normalize( vec3( val - valU, 0.05, val - valV ) ) + 0.5;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
")

(def water-fragment-shader
 "
precision highp float;

uniform vec2 uResolution;
uniform sampler2D tWater;

varying float vHeight;
varying vec3 vNormal;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  // directional lights

  // vec3 dirDiffuse = normalize(vec3(0.0) - vec3(500.0, 2000.0, 0.0));
  vec3 dirDiffuse = vec3(0.0, 1.0, 0.0);

  vec3 normal = vNormal;
  //normal = vec3(0.0, -1.0, 0.0);

  vec3 totalDiffuseLight = vec3(0.0);

  vec3 dirVector = dirDiffuse;
  vec3 dirLightColor = vec3(1.0);
  float dirDiffuseWeight = max( dot( normal, dirVector ), 0.0 );
  totalDiffuseLight += dirLightColor * dirDiffuseWeight;

  vec4 color = texture2D(tWater, uv * 4.0);
  gl_FragColor = vec4(color.rgb * totalDiffuseLight, 1.0);
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
     water-material (-> (:mesh water) .-material)]
    (if
      (= @render-target-index 0)
      (do
        (-> quad .-material (set! init-material))
        (-> renderer (.render scene camera render-target2 true))))
    (->
      compute-material .-uniforms .-tWaterHeight .-value
      (set! (-> render-target2 .-texture)))
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
      uniforms
        #js
        {
          :uWaterThreshold #js { :value water-threshold}
          :uGroundElevation #js { :value max-elevation}
          :uWaterElevation #js { :value max-water-elevation}
          :uWaterSize #js { :value (new js/THREE.Vector2 width height)}
          :tWater #js { :value nil}
          :tWaterHeight #js { :value (-> render-target1 .-texture)}
          :tGroundHeight #js { :value (:data-texture ground)}
          :uResolution #js { :value (new js/THREE.Vector2 rx ry)}}
      material
        (new
          js/THREE.ShaderMaterial
          #js
          {
            :uniforms uniforms
            :vertexShader water-vertex-shader
            :fragmentShader water-fragment-shader})
      wrapping (-> js/THREE .-RepeatWrapping)
      on-load (fn [texture]
                (-> texture .-wrapS (set! wrapping))
                (-> texture .-wrapT (set! wrapping))
                (-> texture .-repeat (.set 10.0 10.0))
                (-> material .-uniforms .-tWater .-value (set! texture))
                (-> material .-needsUpdate (set! true)))
      texture-loader (new THREE.TextureLoader)
      _ (-> texture-loader (.load "models/images/water.jpg" on-load))
      mesh (new js/THREE.Mesh geometry material)]
    (-> component
      (assoc :render-target1 render-target1)
      (assoc :render-target2 render-target2)
      (assoc :compute-material compute-material)
      (assoc :init-material init-material)
      (assoc :mesh mesh))))

(defcom
  new-init-water
  [config params compute-shader ground]
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
