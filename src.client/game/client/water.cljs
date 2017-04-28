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

#define PI 3.1415926
uniform vec2 uResolution;

// Simple random function
float random(float co)
{
		return fract(sin(co*12.989) * 43758.545);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float height = ((sin(2.0 * PI * uv.x * 20.0) + 1.0) / 2.0 +
                  (sin(2.0 * PI * uv.y * 20.0) + 1.0) / 2.0) /
                  2.0;
  float rnd = random(length(uv) + uv.x + uv.y);
  gl_FragColor = vec4(rnd, 0.0, 1.0, 1.0);
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

// adjustable settings
uniform float uWaterSpeed;

bool hitTest(vec2 uvn) {
    float h = texture2D(tGroundHeight, uvn).x;
    // + 0.1 so that waves can hit the shore
    if (h >= uWaterThreshold + 0.1) {
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
  ux = waterHeight - u;
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

  // bool onlyRain = terrainHeight >= uWaterThreshold;

  // new elevation
  float nu = u + du + uWaterSpeed * (umx+ux+umy+uy);
  /*if (onlyRain) {
      nu = u + 0.5 * (umx+ux+umy+uy);
      nu = 0.0;
  }*/

  // wave decay
  // nu = 0.999999*nu;

  // new velocity
  float v = nu - u;

  /*
  if (onlyRain) {
    v = 0.0;
  }
  */

  // rain
  /*
  if (onlyRain) {
    if (uTime < 10000.0) {
      // nu += 0.00001;
      float rnd = random(length(uv) + uv.x + uv.y);
      nu = 5.0 * ((sin(rnd * uTime * 5.0 / 1000.0 + rnd) + 1.0) / 2.0);
    }
  }*/

  float minnu = 0.0;
  if (hitTest(uv)) {
      nu = minnu;
      v = 0.0;
  }

  /*
  if (nu < minnu || hitTest(uv)) {
      nu = minnu;
      v = 0.0;
  }
  if (nu > 1.5) {
      nu = 1.5;
      v /= 1.1;
  }*/

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
uniform float uOverWater;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vHeight;

void main() {

  vec3 newPosition = position;

  vec2 puv = vec2(position.xz / uWaterSize) + vec2(0.5, 0.5);

  float ground = texture2D(tGroundHeight, puv).x;
  float groundHeight = ground * uGroundElevation;
  vec4 water = texture2D(tWaterHeight, puv);

  // TODO: make as uniform
  const float heightDivisor = 25.0;

  float height = water.x / heightDivisor;

  /*
  if (ground < uWaterThreshold + (water.x - 0.5)) {
    // newPosition.y = groundHeight + height * uWaterElevation;
    // newPosition.y = uWaterThreshold * uGroundElevation + height * uWaterElevation;
    // newPosition.y = uWaterThreshold * uGroundElevation + water.x * uWaterElevation;
    newPosition.y = uWaterThreshold * uGroundElevation;
  } else {
    newPosition.y = uWaterThreshold * uGroundElevation;
  }
  */
  if (uOverWater > 0.5) {
    newPosition.y = uWaterThreshold * uGroundElevation + water.x * uWaterElevation;
  } else {
    if (ground <= 0.3) {
      newPosition.y = ground * uGroundElevation + 1.0;
    }
  }

  // TODO: compute separately, so we can reuse in caustics shader
  float val = texture2D( tWaterHeight, puv ).x / heightDivisor - ground;
  float valU = texture2D( tWaterHeight, puv + vec2( 1.0 / uResolution.x, 0.0 ) ).x / heightDivisor;
  valU -= texture2D(tGroundHeight, puv + vec2( 1.0 / uResolution.x, 0.0 ) ).x;
  float valV = texture2D( tWaterHeight, puv + vec2( 0.0, 1.0 / uResolution.y ) ).x / heightDivisor;
  valV -= texture2D(tGroundHeight, puv + vec2( 0.0, 1.0 / uResolution.y ) ).x;
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

  vHeight = 0.5 + height - ground;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
")

(def helper-functions
  "
  precision highp float;

  uniform float uTime;
  uniform vec3 uEye;
  uniform vec3 uLight;
  uniform vec2 uResolution;
  uniform vec2 uWaterSize;
  uniform float uWaterThreshold;
  uniform sampler2D tTiles;
  uniform sampler2D tGroundHeight;
  uniform sampler2D tWaterHeight;
  uniform sampler2D tCausticTex;

  // adjustable settings
  uniform float uWaterDepthEffect;
  uniform vec3 uAboveWaterColor;
  uniform float uLightIntensity;
  uniform float uAmbientOcclusion;
  uniform float uAmbientOcclusionPower;

  const float IOR_AIR = 1.0;
  const float IOR_WATER = 1.333;
  // const vec3 abovewaterColor = vec3(0.25, 1.0, 1.25);
  // gold color
  // const vec3 abovewaterColor = vec3(1.25, 1.0, 0.25);
  // lava color
  // const vec3 abovewaterColor = vec3(1.25, 0.0, 0.25);
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

  #define MAX_ITER 11

  float getFakeCaustic(vec2 uv) {
  	// vec2 p = uv * 10.0 - vec2(19.0);
    vec2 p = uv * 10.0 - vec2(19.0);
  	vec2 i = p;
  	float c = 1.0;
  	float inten = .05;

  	for (int n = 0; n < MAX_ITER; n++)
  	{
  		float t = (uTime / 1000.0) * (1.0 - (3.0 / float(n+1)));
  		i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
  		c += 1.0/length(vec2(p.x / (2.*sin(i.x+t)/inten),p.y / (cos(i.y+t)/inten)));
  	}
  	c /= float(MAX_ITER);
  	c = 1.5-sqrt(pow(c,3.+0.5));
  	return clamp(c*c*c*c, 0.0, 1.0);
  }

  // https://www.shadertoy.com/view/4tXSDf

  vec2 hash2(vec2 p ) {
   return fract(sin(vec2(dot(p, vec2(123.4, 748.6)), dot(p, vec2(547.3, 659.3))))*5232.85324);
  }
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(43.232, 75.876)))*4526.3257);
  }

  //Based off of iq's described here: http://www.iquilezles.org/www/articles/voronoilin
  float voronoi(vec2 p) {
      vec2 n = floor(p);
      vec2 f = fract(p);
      float md = 5.0;
      vec2 m = vec2(0.0);
      for (int i = -1;i<=1;i++) {
          for (int j = -1;j<=1;j++) {
              vec2 g = vec2(i, j);
              vec2 o = hash2(n+g);
              o = 0.5+0.5*sin(1.0 * uTime / 1000.0 + 5.038 * o);
              vec2 r = g + o - f;
              float d = dot(r, r);
              if (d<md) {
                md = d;
                m = n+g+o;
              }
          }
      }
      return md;
  }

  float ov(vec2 p) {
      float v = 0.0;
      float a = 0.4;
      for (int i = 0;i<3;i++) {
          v+= voronoi(p)*a;
          p*=2.0;
          a*=0.5;
      }
      return v;
  }

  float getFakeCaustic2(vec2 uv)
  {
  	return ov(uv*5.0);
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
    // TODO: re-enable
    float p = 3.0;
    // sparkling/incandescent water
    // scale /= pow(distance(origin, point), 3.0) * 5000.0; /* pool ambient occlusion */
    // normal water
    // scale /= pow(distance(origin, point), 1.0) * 5.0; /* pool ambient occlusion */
    scale /= pow(distance(origin, point), uAmbientOcclusionPower) * pow(uAmbientOcclusion, uAmbientOcclusionPower); /* pool ambient occlusion */
    // scale /= 0.2;
    // scale *= 1.0 - 0.9 / pow(length(point - sphereCenter) / sphereRadius, 4.0); /* sphere ambient occlusion */

    /* caustics */
    vec3 refractedLight = -refract(-uLight, vec3(0.0, 1.0, 0.0), IOR_AIR / IOR_WATER);
    float diffuse = max(0.0, dot(refractedLight, normal));
    // vec4 info = texture2D(tWaterHeight, point.xz * 0.5 + 0.5);
    // if (point.y < info.r) {
    if (true) {
      vec2 causticsUV = 0.75 * (point.xz - point.y * refractedLight.xz / refractedLight.y) * 0.5 + 0.5;
      //vec4 caustic = texture2D(tCausticTex, causticsUV);
      //scale += diffuse * caustic.r * 2.0 * caustic.g;
      float caustic = getFakeCaustic2(causticsUV * 5.0);
      // scale *= diffuse * caustic * 3.0;
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
  		i.hitPoint = cPos + t * ray;
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

  vec3 intersectFloor(vec3 origin, vec3 ray) {
    Intersection i;
  	i.t = 1.0e+30;
  	i.hit = 0.0;
  	i.hitPoint = vec3(0.0);
  	i.normal = vec3(0.0);
  	i.color = vec3(0.0);
    Plane plane;
    vec2 uv = (origin.xz + 1.0) / 2.0;
    float height = texture2D(tGroundHeight, uv).x;
    float fac = 1.0 / 3.0;
    plane.position = vec3(0.0, fac * (height - uWaterThreshold - 0.05), 0.0);

  	plane.normal = vec3(0.0, 1.0, 0.0);
    intersectPlane(origin, ray, plane, i);
    float t1 = i.t;
    if (i.t < 0.0) {
      t1 = 0.0;
    }

    plane.position = vec3(0.0, 0.0, 0.0);
    intersectPlane(origin, ray, plane, i);
    float t2 = i.t;
    if (i.t < 0.0) {
      t2 = 0.0;
    }

    float t = mix(t2, t1, uWaterDepthEffect);
    vec3 hit = origin + t * ray;

    /*
    vec2 uv = i.hitPoint.xz;
    uv = clamp(uv, 0.0, 1.0);
    float height = texture2D(tGroundHeight, uv).x;
    vec3 hit = i.hitPoint;
    hit.y += height / 5.0;
    */
    return hit;
  }

  float intersectRoof(vec3 origin, vec3 ray) {
    Intersection i;
  	i.t = 1.0e+30;
  	i.hit = 0.0;
  	i.hitPoint = vec3(0.0);
  	i.normal = vec3(0.0);
  	i.color = vec3(0.0);
    Plane plane;
    plane.position = vec3(0.0, 0.0, 0.0);
  	plane.normal = vec3(0.0, -1.0, 0.0);
    intersectPlane(origin, ray, plane, i);
    return i.t;
  }
")

(def water-fragment-shader-part1
 "

uniform float uOverWater;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vHeight;

vec3 getSurfaceRayColor(vec3 origin, vec3 ray, vec3 waterColor) {
  vec3 color;
  if (ray.y < 0.0) {
    vec2 t = intersectCube(origin, ray, vec3(-1.0, -poolHeight, -1.0), vec3(1.0, 2.0, 1.0));
    vec3 hit = origin + ray * t.y;
    hit = intersectFloor(origin, ray);
    color = getWallColor(origin, hit);
  } else {
    vec2 t = intersectCube(origin, ray, vec3(-1.0, -poolHeight, -1.0), vec3(1.0, 2.0, 1.0));
    vec3 hit = origin + ray * t.y;
    hit = intersectFloor(origin, ray);
    if (hit.y < 2.0 / 12.0) {
      color = getWallColor(origin, hit);
    } else {
      // TODO: sky cube
      // color = textureCube(sky, ray).rgb;
      color = vec3(0.0);
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
  vec3 normal = normalize(vNormal);

  vec3 incomingRay = normalize(vPosition - uEye);

  vec3 reflectedRay = reflect(incomingRay, normal);
  vec3 refractedRay = refract(incomingRay, normal, IOR_AIR / IOR_WATER);
  float fresnel = mix(0.25, 1.0, pow(1.0 - dot(normal, -incomingRay), 3.0));

  vec3 reflectedColor = getSurfaceRayColor(vPosition, reflectedRay, uAboveWaterColor);
  vec3 refractedColor = getSurfaceRayColor(vPosition, refractedRay, uAboveWaterColor);

  gl_FragColor = vec4(mix(refractedColor, reflectedColor, fresnel), 1.0) * uLightIntensity / 2.5;
}
")

(def water-fragment-shader (+ helper-functions water-fragment-shader-part1))

(def caustics-shader-vertex-part1
  "
  varying vec3 oldPos;
  varying vec3 newPos;
  varying vec3 ray;

  attribute vec3 position;

  /* project the ray onto the plane */
  vec3 project(vec3 origin, vec3 ray, vec3 refractedLight) {
    vec2 tcube = intersectCube(origin, ray, vec3(-1.0, -poolHeight, -1.0), vec3(1.0, 2.0, 1.0));
    vec3 hit = intersectFloor(origin, ray);
    origin += ray * tcube.y;
    origin = hit;
    float tplane = (-origin.y - 1.0) / refractedLight.y;
    return origin + refractedLight * tplane;
  }

  void main() {
    float time = uTime / 1000.0;

    // TODO: make as uniform
    const float heightDivisor = 25.0;

    vec3 pVertex = position.xyz / vec3(uWaterSize.x / 2.0, 1.0, uWaterSize.y / 2.0);
    //pVertex.y = sin(uTime / 1000.0);

    vec2 puv = vec2(position.xz / uWaterSize) + vec2(0.5, 0.5);
    vec4 info = texture2D(tWaterHeight, puv);

    //info.ba *= 0.5;
    //vec3 normal = vec3(info.b, sqrt(1.0 - dot(info.ba, info.ba)), info.a);

    // TODO: compute separately, so we can reuse in caustics shader
    float val = info.x / heightDivisor;
    val -= texture2D(tGroundHeight, puv).x;
    float valU = texture2D( tWaterHeight, puv + vec2( 1.0 / uResolution.x, 0.0 ) ).x / heightDivisor;
    valU -= texture2D(tGroundHeight, puv + vec2( 1.0 / uResolution.x, 0.0 ) ).x;
    float valV = texture2D( tWaterHeight, puv + vec2( 0.0, 1.0 / uResolution.y ) ).x / heightDivisor;
    valV -= texture2D(tGroundHeight, puv + vec2( 0.0, 1.0 / uResolution.y ) ).x;
    vec3 normalVec = 0.5 * normalize( vec3( val - valU, 0.05, val - valV ) ) + 0.5;

    /*
    vec2 delta = 1.0 / uResolution.xy;
    vec2 coord = puv;
    float height = val;
    //vec3 dx = vec3(delta.x, texture2D(tWaterHeight, vec2(coord.x + delta.x, coord.y)).r / heightDivisor - height, 0.0);
    //vec3 dy = vec3(0.0, texture2D(tWaterHeight, vec2(coord.x, coord.y + delta.y)).r / heightDivisor - height, delta.y);
    vec3 dx = vec3(delta.x, valU - val, 0.0);
    vec3 dy = vec3(0.0, valV - val, delta.y);
    normal.xz = normalize(cross(dy, dx)).xz;
    normal.y = sqrt(1.0 - dot(normal.xz, normal.xz));
    */

    /* project the vertices along the refracted vertex ray */
    vec3 refractedLight = refract(-uLight, vec3(0.0, 1.0, 0.0), IOR_AIR / IOR_WATER);
    ray = refract(-uLight, normalVec, IOR_AIR / IOR_WATER);
    oldPos = project(pVertex.xyz, refractedLight, refractedLight);
    newPos = project(pVertex.xyz + vec3(0.0, val, 0.0), ray, refractedLight);

    gl_Position = vec4(0.75 * (newPos.xz + refractedLight.xz / refractedLight.y), 0.0, 1.0);

    // gl_Position = vec4((puv - 0.5) * 2.0, 0.0, 1.0);
  }
")

(def caustics-vertex-shader (+ helper-functions caustics-shader-vertex-part1))

(def caustics-shader-fragment-part1
  "
#extension GL_OES_standard_derivatives : enable

")

(def caustics-shader-fragment-part2
  "
    varying vec3 oldPos;
    varying vec3 newPos;
    varying vec3 ray;

    void main() {
      /* if the triangle gets smaller, it gets brighter, and vice versa */
      float oldArea = length(dFdx(oldPos)) * length(dFdy(oldPos));
      float newArea = length(dFdx(newPos)) * length(dFdy(newPos));
      gl_FragColor = vec4(oldArea / newArea * 0.2, 1.0, 0.0, 0.0);

      // vec3 refractedLight = refract(-uLight, vec3(0.0, 1.0, 0.0), IOR_AIR / IOR_WATER);

      /* compute a blob shadow and make sure we only draw a shadow if the player is blocking the light */
      /*
      vec3 dir = (sphereCenter - newPos) / sphereRadius;
      vec3 area = cross(dir, refractedLight);
      float shadow = dot(area, area);
      float dist = dot(dir, -refractedLight);
      shadow = 1.0 + (shadow - 1.0) / (0.05 + dist * 0.025);
      shadow = clamp(1.0 / (1.0 + exp(-shadow)), 0.0, 1.0);
      shadow = mix(1.0, shadow, clamp(dist * 2.0, 0.0, 1.0));
      gl_FragColor.g = shadow;
      */

      /* shadow for the rim of the pool */
      /*
      vec2 t = intersectCube(newPos, -refractedLight, vec3(-1.0, -poolHeight, -1.0), vec3(1.0, 2.0, 1.0));
      gl_FragColor.r *= 1.0 / (1.0 + exp(-200.0 / (1.0 + 10.0 * (t.y - t.x)) * (newPos.y - refractedLight.y * t.y - 2.0 / 12.0)));
      */
    }
")

(def caustics-fragment-shader
  (+ caustics-shader-fragment-part1 helper-functions caustics-shader-fragment-part2))

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
    (if
      (= (:start-count component) 0)
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
     time (common/game-time)
     caustics-scene (:caustics-scene water)
     caustics-material (:caustics-material water)
     caustics-render-target (:caustics-render-target water)
     caustics-camera (:caustics-camera water)]
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
    (->
      caustics-material .-uniforms .-uTime .-value
      (set! time))
    (-> renderer (.render caustics-scene caustics-camera caustics-render-target true))
    (-> renderer (.render caustics-scene caustics-camera))
    ;(-> renderer (.render caustics-scene camera))
    ;(->
    ;  compute-material .-uniforms .-tWaterHeight .-value
    ;  (set! (-> render-target1 .-texture)))
    ;(->
    ;  water-material .-uniforms .-tWaterHeight .-value
    ;  (set! (-> render-target1 .-texture)))
    (->
      water-material .-uniforms .-uTime .-value
      (set! time))
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
          ; XXX: should it be LinearFilter or NearestFilter?
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
      caustics-rx 1024
      caustics-ry 1024
      caustics-render-target (new js/THREE.WebGLRenderTarget caustics-rx caustics-ry pars)
      ground (:ground component)
      ; TODO: replace with lake map
      water-threshold (get-in config [:terrain :water-threshold])
      compute-uniforms
        #js
        {
          :uTime #js { :value nil}
          :uWaterThreshold #js { :value water-threshold}
          :uResolution #js { :value (new js/THREE.Vector2 rx ry)}
          :tWaterHeight #js { :value (-> render-target1 .-texture)}
          :tGroundHeight #js { :value (:data-texture ground)}
          :uWaterSpeed #js { :value 0.001}}
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
      ;_ (-> uLight (.multiply (-> light1 .-intensity)))
      uniforms
        #js
        {
          :uTime #js { :value nil}
          :uWaterThreshold #js { :value water-threshold}
          :uGroundElevation #js { :value max-elevation}
          :uWaterElevation #js { :value max-water-elevation}
          :uWaterSize #js { :value (new js/THREE.Vector2 width height)}
          :tTiles #js { :value nil}
          :tCausticTex #js { :value (-> caustics-render-target .-texture)}
          :tWaterHeight #js { :value (-> render-target1 .-texture)}
          :tGroundHeight #js { :value (:data-texture ground)}
          :uResolution #js { :value (new js/THREE.Vector2 rx ry)}
          ;:uEye #js { :value (-> camera .-position)}
          ; fixed eye at this position experimentally found to look better
          :uEye #js { :value (new js/THREE.Vector3 -1526.0 800.0 973.0)}
          :uLight #js { :value uLight}
          :uLightIntensity #js { :value (-> light1 .-intensity)}
          ;:uOverWater #js { :value 1.0}}
          :uWaterDepthEffect #js { :value 0.25}
          :uAboveWaterColor #js { :value (new js/THREE.Vector3 0.25 1.0 1.25)}
          :uAmbientOcclusion #js { :value 5.0}
          :uAmbientOcclusionPower #js { :value 1.0}}
      material
        (new
          js/THREE.ShaderMaterial
          #js
          {
            :uniforms uniforms
            :vertexShader water-vertex-shader
            :fragmentShader water-fragment-shader})
      uniforms-clone
        (-> js/THREE.UniformsUtils (.clone uniforms))
      _ (-> uniforms .-uOverWater (set! #js { :value 1.0}))
      _ (-> uniforms-clone .-uOverWater (set! #js { :value 0.0}))
      _ (-> uniforms-clone .-uOverWater .-value (set! 0.0))
      _ (-> uniforms-clone .-tWaterHeight .-value (set! (-> render-target1 .-texture)))
      _ (-> uniforms-clone .-tGroundHeight .-value (set! (:data-texture ground)))
      _ (-> uniforms-clone .-uOverWater .-needsUpdate (set! true))
      _ (-> uniforms-clone .-needsUpdate (set! true))
      geometry2 (-> geometry .clone)
      material2
        (new
          js/THREE.ShaderMaterial
          #js
          {
            :uniforms uniforms-clone
            :vertexShader water-vertex-shader
            :fragmentShader water-fragment-shader})
      caustics-scene (new js/THREE.Scene)
      caustics-uniforms
        #js
        {
          :tGroundHeight #js { :value (:data-texture ground)}
          :tWaterHeight #js { :value (-> render-target1 .-texture)}
          :uWaterSize #js { :value (new js/THREE.Vector2 width height)}
          :uResolution #js { :value (new js/THREE.Vector2 rx ry)}
          :uLight #js { :value uLight}
          :uTime #js { :value nil}}
      caustics-material
        (new
          js/THREE.RawShaderMaterial
          #js
          {
            :uniforms caustics-uniforms
            :vertexShader caustics-vertex-shader
            :fragmentShader caustics-fragment-shader})
      caustics-camera camera
      caustics-mesh (new js/THREE.Mesh geometry caustics-material)
      _ (-> caustics-mesh .-frustumCulled (set! false))
      _ (-> caustics-scene (.add caustics-mesh))
      wrapping (-> js/THREE .-RepeatWrapping)
      texture-loader (new THREE.TextureLoader)
      on-load-tiles
        (fn [texture]
          (-> texture .-wrapS (set! wrapping))
          (-> texture .-wrapT (set! wrapping))
          (-> texture .-repeat (.set 1.0 1.0))
          (-> material .-uniforms .-tTiles .-value (set! texture))
          (-> material .-needsUpdate (set! true))
          (-> material2 .-uniforms .-tTiles .-value (set! texture))
          (-> material2 .-needsUpdate (set! true)))
      _ (-> texture-loader (.load "models/images/grasslight-big.jpg" on-load-tiles))
      mesh (new js/THREE.Mesh geometry material)
      mesh2 (new js/THREE.Mesh geometry2 material2)]
    (reset! (:water-threshold (:ground component)) water-threshold)
    (-> component
      (assoc :render-target1 render-target1)
      (assoc :render-target2 render-target2)
      (assoc :compute-material compute-material)
      (assoc :init-material init-material)
      (assoc :mesh mesh)
      (assoc :mesh2 mesh2)
      (assoc :caustics-scene caustics-scene)
      (assoc :caustics-render-target caustics-render-target)
      (assoc :caustics-material caustics-material)
      (assoc :caustics-camera caustics-camera))))

(defcom
  new-init-water
  [config params compute-shader ground camera light1 init-light]
  ;[mesh height-field width height x-faces y-faces x-vertices y-vertices data-texture float-texture-divisor]
  [mesh mesh2 render-target1 render-target2
   compute-material init-material
   caustics-scene caustics-render-target caustics-material caustics-camera]
  (fn [component]
    (if-not
      mesh
      (get-water component config (:simplex params))
      component))
  (fn [component]
    component))
