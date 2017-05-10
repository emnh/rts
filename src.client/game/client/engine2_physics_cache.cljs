(ns ^:figwheel-always game.client.engine2_physics_cache)

(def unit-collisions-summation-shader-vs
  "
  attribute vec2 uv;
attribute vec3 normal;
uniform vec2 uCollisionResolution;
uniform float uTime;
uniform sampler2D tUnitsPosition;
uniform vec2 uMaxUnitsResolution;
uniform sampler2D tUnitsCollisions;
attribute vec3 position;
attribute float aFragmentIndex;
uniform float uMaxUnits;
varying highp vec3 vCollisionValue;
varying mediump vec2 vUV;
vec3 pos;
vec3 blah;
vec2 test;
void main(void){
vec3 v3816;
vec3 v3800;
float v4288;
float v4421;
float v3804;
float v3797;
float v4118;
float v3807;
float v3805;
float v4223;
float v4424;
vec3 v3809;
float v3789;
vec3 v3801;
vec3 v3808;
float v3788;
float v4354;
vec3 pos;
vec3 v3815;
vec3 v4423;
vec3 v4197;
float v4355;
vec4 v4165;
vec3 v4224;
vec3 v4292;
vec2 test;
float v4287;
vec3 v3802;
vec3 v3814;
vec3 v4225;
vec3 v3818;
float v4117;
float v3799;
vec4 v3790;
float v3811;
vec3 v4357;
float v4221;
vec3 v4426;
float v3793;
vec3 v4289;
vec3 v4222;
float v4290;
float v4164;
float v4114;
vec3 v3798;
vec3 blah;
float v3792;
float v4356;
float v4166;
vec4 v4116;
float v3791;
vec3 v3812;
float v4115;
vec3 v3817;
vec3 v4359;
float v3810;
vec3 v4291;
float v4163;
vec3 v4358;
float v3796;
float v3813;
float v3795;
vec3 v3803;
float v4220;
float v4422;
vec3 v3806;
float v3794;
vec3 v4425;
float v4167;
(v3788 = mod(aFragmentIndex, 4.0));
(v3789 = ((aFragmentIndex - v3788) / 4.0));
(v3790 = texture2D(
  tUnitsCollisions,
  vec2(
    (mod(v3789, uCollisionResolution.x) / uCollisionResolution.x),
    (floor((v3789 / uCollisionResolution.x)) / uCollisionResolution.y))));
(v3791 = swizzle_by_index(v3790, v3788));
(v3792 = swizzle_by_index(v3790, 2.0));
(v3793 = ((v3791 * uMaxUnits) - 1.0));
(v3794 = ((v3792 * uMaxUnits) - 1.0));
(v3795 = (2.0 * (3.141592653589793 * fract(
  (sin(((uTime + (v3794 - v3793)) * 12.989)) * 43758.545)))));
(v3796 = swizzle_by_index(v3790, 1.0));
(v3797 = ((v3796 * uMaxUnits) - 1.0));
(v3798 = texture2D(
  tUnitsPosition,
  vec2(
    (mod(v3797, uMaxUnitsResolution.x) / uMaxUnitsResolution.x),
    (floor((v3797 / uMaxUnitsResolution.x)) / uMaxUnitsResolution.y))).xyz);
(v3799 = (2.0 * (3.141592653589793 * fract(
  (sin(((uTime + (v3797 - v3793)) * 12.989)) * 43758.545)))));
(v3800 = texture2D(
  tUnitsPosition,
  vec2(
    (mod(v3793, uMaxUnitsResolution.x) / uMaxUnitsResolution.x),
    (floor((v3793 / uMaxUnitsResolution.x)) / uMaxUnitsResolution.y))).xyz);
(v3801 = fake_if(
  (abs((v3788 - 1.0)) < 0.1),
  vec3(0.0),
  fake_if(
    ((v3791 > 0.0) && (v3796 > 0.0)),
    fake_if(
      (v3800 == v3798),
      vec3(cos(v3799), 0.0, sin(v3799)),
      (v3800 - v3798)),
    vec3(0.0))));
(v3802 = vec3(v3801.x, 0.0, v3801.z));
(v3803 = texture2D(
  tUnitsPosition,
  vec2(
    (mod(v3794, uMaxUnitsResolution.x) / uMaxUnitsResolution.x),
    (floor((v3794 / uMaxUnitsResolution.x)) / uMaxUnitsResolution.y))).xyz);
(v3804 = swizzle_by_index(v3790, 0.0));
(v3805 = ((v3804 * uMaxUnits) - 1.0));
(v3806 = texture2D(
  tUnitsPosition,
  vec2(
    (mod(v3805, uMaxUnitsResolution.x) / uMaxUnitsResolution.x),
    (floor((v3805 / uMaxUnitsResolution.x)) / uMaxUnitsResolution.y))).xyz);
(v3807 = (2.0 * (3.141592653589793 * fract(
  (sin(((uTime + (v3805 - v3793)) * 12.989)) * 43758.545)))));
(v3808 = fake_if(
  (abs((v3788 - 0.0)) < 0.1),
  vec3(0.0),
  fake_if(
    ((v3791 > 0.0) && (v3804 > 0.0)),
    fake_if(
      (v3800 == v3806),
      vec3(cos(v3807), 0.0, sin(v3807)),
      (v3800 - v3806)),
    vec3(0.0))));
(v3809 = vec3(v3808.x, 0.0, v3808.z));
(v3810 = swizzle_by_index(v3790, 3.0));
(v3811 = ((v3810 * uMaxUnits) - 1.0));
(v3812 = texture2D(
  tUnitsPosition,
  vec2(
    (mod(v3811, uMaxUnitsResolution.x) / uMaxUnitsResolution.x),
    (floor((v3811 / uMaxUnitsResolution.x)) / uMaxUnitsResolution.y))).xyz);
(v3813 = (2.0 * (3.141592653589793 * fract(
  (sin(((uTime + (v3811 - v3793)) * 12.989)) * 43758.545)))));
(v3814 = fake_if(
  (abs((v3788 - 3.0)) < 0.1),
  vec3(0.0),
  fake_if(
    ((v3791 > 0.0) && (v3810 > 0.0)),
    fake_if(
      (v3800 == v3812),
      vec3(cos(v3813), 0.0, sin(v3813)),
      (v3800 - v3812)),
    vec3(0.0))));
(v3815 = fake_if(
  (abs((v3788 - 2.0)) < 0.1),
  vec3(0.0),
  fake_if(
    ((v3791 > 0.0) && (v3792 > 0.0)),
    fake_if(
      (v3800 == v3803),
      vec3(cos(v3795), 0.0, sin(v3795)),
      (v3800 - v3803)),
    vec3(0.0))));
(v3816 = vec3(v3815.x, 0.0, v3815.z));
(v3817 = vec3(v3814.x, 0.0, v3814.z));
(v3818 = (((fake_if((length(v3809) > 0.0), normalize(v3809), v3809) + fake_if(
  (length(v3802) > 0.0),
  normalize(v3802),
  v3802)) + fake_if((length(v3816) > 0.0), normalize(v3816), v3816)) + fake_if(
  (length(v3817) > 0.0),
  normalize(v3817),
  v3817)));
(v4114 = mod(aFragmentIndex, 4.0));
(v4115 = ((aFragmentIndex - v4114) / 4.0));
(v4116 = texture2D(
  tUnitsCollisions,
  vec2(
    (mod(v4115, uCollisionResolution.x) / uCollisionResolution.x),
    (floor((v4115 / uCollisionResolution.x)) / uCollisionResolution.y))));
(v4117 = swizzle_by_index(v4116, v4114));
(v4118 = ((v4117 * uMaxUnits) - 1.0));
(v4163 = mod(aFragmentIndex, 4.0));
(v4164 = ((aFragmentIndex - v4163) / 4.0));
(v4165 = texture2D(
  tUnitsCollisions,
  vec2(
    (mod(v4164, uCollisionResolution.x) / uCollisionResolution.x),
    (floor((v4164 / uCollisionResolution.x)) / uCollisionResolution.y))));
(v4166 = swizzle_by_index(v4165, v4163));
(v4167 = ((v4166 * uMaxUnits) - 1.0));
(v4197 = texture2D(
  tUnitsPosition,
  vec2(
    (mod(v4167, uMaxUnitsResolution.x) / uMaxUnitsResolution.x),
    (floor((v4167 / uMaxUnitsResolution.x)) / uMaxUnitsResolution.y))).xyz);
(v4220 = swizzle_by_index(v4165, 0.0));
(v4221 = ((v4220 * uMaxUnits) - 1.0));
(v4222 = texture2D(
  tUnitsPosition,
  vec2(
    (mod(v4221, uMaxUnitsResolution.x) / uMaxUnitsResolution.x),
    (floor((v4221 / uMaxUnitsResolution.x)) / uMaxUnitsResolution.y))).xyz);
(v4223 = (2.0 * (3.141592653589793 * fract(
  (sin(((uTime + (v4221 - v4167)) * 12.989)) * 43758.545)))));
(v4224 = fake_if(
  (abs((v4163 - 0.0)) < 0.1),
  vec3(0.0),
  fake_if(
    ((v4166 > 0.0) && (v4220 > 0.0)),
    fake_if(
      (v4197 == v4222),
      vec3(cos(v4223), 0.0, sin(v4223)),
      (v4197 - v4222)),
    vec3(0.0))));
(v4225 = vec3(v4224.x, 0.0, v4224.z));
(v4287 = swizzle_by_index(v4165, 1.0));
(v4288 = ((v4287 * uMaxUnits) - 1.0));
(v4289 = texture2D(
  tUnitsPosition,
  vec2(
    (mod(v4288, uMaxUnitsResolution.x) / uMaxUnitsResolution.x),
    (floor((v4288 / uMaxUnitsResolution.x)) / uMaxUnitsResolution.y))).xyz);
(v4290 = (2.0 * (3.141592653589793 * fract(
  (sin(((uTime + (v4288 - v4167)) * 12.989)) * 43758.545)))));
(v4291 = fake_if(
  (abs((v4163 - 1.0)) < 0.1),
  vec3(0.0),
  fake_if(
    ((v4166 > 0.0) && (v4287 > 0.0)),
    fake_if(
      (v4197 == v4289),
      vec3(cos(v4290), 0.0, sin(v4290)),
      (v4197 - v4289)),
    vec3(0.0))));
(v4292 = vec3(v4291.x, 0.0, v4291.z));
(v4354 = swizzle_by_index(v4165, 2.0));
(v4355 = ((v4354 * uMaxUnits) - 1.0));
(v4356 = (2.0 * (3.141592653589793 * fract(
  (sin(((uTime + (v4355 - v4167)) * 12.989)) * 43758.545)))));
(v4357 = texture2D(
  tUnitsPosition,
  vec2(
    (mod(v4355, uMaxUnitsResolution.x) / uMaxUnitsResolution.x),
    (floor((v4355 / uMaxUnitsResolution.x)) / uMaxUnitsResolution.y))).xyz);
(v4358 = fake_if(
  (abs((v4163 - 2.0)) < 0.1),
  vec3(0.0),
  fake_if(
    ((v4166 > 0.0) && (v4354 > 0.0)),
    fake_if(
      (v4197 == v4357),
      vec3(cos(v4356), 0.0, sin(v4356)),
      (v4197 - v4357)),
    vec3(0.0))));
(v4359 = vec3(v4358.x, 0.0, v4358.z));
(v4421 = swizzle_by_index(v4165, 3.0));
(v4422 = ((v4421 * uMaxUnits) - 1.0));
(v4423 = texture2D(
  tUnitsPosition,
  vec2(
    (mod(v4422, uMaxUnitsResolution.x) / uMaxUnitsResolution.x),
    (floor((v4422 / uMaxUnitsResolution.x)) / uMaxUnitsResolution.y))).xyz);
(v4424 = (2.0 * (3.141592653589793 * fract(
  (sin(((uTime + (v4422 - v4167)) * 12.989)) * 43758.545)))));
(v4425 = fake_if(
  (abs((v4163 - 3.0)) < 0.1),
  vec3(0.0),
  fake_if(
    ((v4166 > 0.0) && (v4421 > 0.0)),
    fake_if(
      (v4197 == v4423),
      vec3(cos(v4424), 0.0, sin(v4424)),
      (v4197 - v4423)),
    vec3(0.0))));
(v4426 = vec3(v4425.x, 0.0, v4425.z));
(vCollisionValue = fake_if((length(v3818) > 0.0), normalize(v3818), v3818));
(vUV = vec2(
  (mod(v4118, uMaxUnitsResolution.x) / uMaxUnitsResolution.x),
  (floor((v4118 / uMaxUnitsResolution.x)) / uMaxUnitsResolution.y)));
(pos = position);
(blah = normal);
(test = uv);
(gl_Position = fake_if(
  (length(
    (((fake_if((length(v4225) > 0.0), normalize(v4225), v4225) + fake_if(
      (length(v4292) > 0.0),
      normalize(v4292),
      v4292)) + fake_if((length(v4359) > 0.0), normalize(v4359), v4359)) + fake_if(
      (length(v4426) > 0.0),
      normalize(v4426),
      v4426))) > 0.0),
  vec4(
    (vec2(-1.0, -1.0) + ((vec2(
      (mod(v4167, uMaxUnitsResolution.x) / uMaxUnitsResolution.x),
      (floor((v4167 / uMaxUnitsResolution.x)) / uMaxUnitsResolution.y)) + ((position.xy + vec2(
      0.5,
      0.5)) / uMaxUnitsResolution)) * 2.0)),
    1.0,
    1.0),
  vec4(10.0, 10.0, 10.0, 1.0)));
}
")

(def unit-collisions-summation-shader-fs
  "
  varying highp vec3 vCollisionValue;
  void main(void){

  (gl_FragColor = vec4(vCollisionValue, 1.0));
  }
")
