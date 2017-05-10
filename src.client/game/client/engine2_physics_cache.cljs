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
  vec3 v4538;
  vec3 v3897;
  float v3885;
  vec3 v3896;
  vec3 v3887;
  vec3 v3893;
  vec3 v4321;
  float v4214;
  vec4 v3873;
  float v4263;
  vec3 v3894;
  vec3 v4325;
  float v4213;
  vec3 v4535;
  vec3 v4393;
  vec3 v4396;
  vec3 v4466;
  float v3871;
  vec3 v3899;
  vec3 v3888;
  float v4262;
  float v3880;
  float v3872;
  vec3 pos;
  vec3 v3886;
  vec3 v4324;
  float v4319;
  vec4 v4264;
  float v4265;
  vec3 v4464;
  vec3 v4394;
  vec2 test;
  float v4216;
  float v4391;
  float v4390;
  float v4392;
  float v4462;
  float v3879;
  vec3 v3895;
  vec3 v4537;
  vec3 v3901;
  vec3 v3898;
  float v4266;
  float v4461;
  float v3878;
  float v4320;
  float v4217;
  float v3877;
  float v3881;
  vec3 blah;
  float v3883;
  float v4322;
  vec3 v3903;
  float v3882;
  float v4534;
  vec3 v4296;
  float v4533;
  vec4 v4215;
  float v4532;
  vec3 v3904;
  float v3874;
  float v3889;
  float v3876;
  vec3 v3900;
  float v3891;
  vec3 v3905;
  vec3 v4465;
  vec3 v4323;
  vec3 v4536;
  vec3 v3902;
  float v3875;
  float v3890;
  vec3 v3884;
  vec3 v4395;
  float v4463;
  vec3 v3892;
  vec3 v4467;
  (v3871 = mod(aFragmentIndex, 4.0));
  (v3872 = ((aFragmentIndex - v3871) / 4.0));
  (v3873 = texture2D(
    tUnitsCollisions,
    vec2(
      (mod(v3872, uCollisionResolution.x) / uCollisionResolution.x),
      (floor((v3872 / uCollisionResolution.x)) / uCollisionResolution.y))));
  (v3874 = swizzle_by_index(v3873, 1.0));
  (v3875 = swizzle_by_index(v3873, v3871));
  (v3876 = ((v3874 * uMaxUnits) - 1.0));
  (v3877 = ((v3875 * uMaxUnits) - 1.0));
  (v3878 = (2.0 * (3.141592653589793 * fract(
    (sin(((uTime + (v3876 - v3877)) * 12.989)) * 43758.545)))));
  (v3879 = swizzle_by_index(v3873, 3.0));
  (v3880 = ((v3879 * uMaxUnits) - 1.0));
  (v3881 = (2.0 * (3.141592653589793 * fract(
    (sin(((uTime + (v3880 - v3877)) * 12.989)) * 43758.545)))));
  (v3882 = swizzle_by_index(v3873, 0.0));
  (v3883 = ((v3882 * uMaxUnits) - 1.0));
  (v3884 = texture2D(
    tUnitsPosition,
    vec2(
      (mod(v3883, uMaxUnitsResolution.x) / uMaxUnitsResolution.x),
      (floor((v3883 / uMaxUnitsResolution.x)) / uMaxUnitsResolution.y))).xyz);
  (v3885 = (2.0 * (3.141592653589793 * fract(
    (sin(((uTime + (v3883 - v3877)) * 12.989)) * 43758.545)))));
  (v3886 = texture2D(
    tUnitsPosition,
    vec2(
      (mod(v3877, uMaxUnitsResolution.x) / uMaxUnitsResolution.x),
      (floor((v3877 / uMaxUnitsResolution.x)) / uMaxUnitsResolution.y))).xyz);
  (v3887 = fake_if(
    (v3886 == v3884),
    vec3(cos(v3885), 0.0, sin(v3885)),
    (v3886 - v3884)));
  (v3888 = fake_if(
    ((abs((v3871 - 0.0)) < 0.1) || (length(v3887) > 16.0)),
    vec3(0.0),
    fake_if(((v3875 > 0.0) && (v3882 > 0.0)), v3887, vec3(0.0))));
  (v3889 = swizzle_by_index(v3873, 2.0));
  (v3890 = ((v3889 * uMaxUnits) - 1.0));
  (v3891 = (2.0 * (3.141592653589793 * fract(
    (sin(((uTime + (v3890 - v3877)) * 12.989)) * 43758.545)))));
  (v3892 = texture2D(
    tUnitsPosition,
    vec2(
      (mod(v3890, uMaxUnitsResolution.x) / uMaxUnitsResolution.x),
      (floor((v3890 / uMaxUnitsResolution.x)) / uMaxUnitsResolution.y))).xyz);
  (v3893 = fake_if(
    (v3886 == v3892),
    vec3(cos(v3891), 0.0, sin(v3891)),
    (v3886 - v3892)));
  (v3894 = fake_if(
    ((abs((v3871 - 2.0)) < 0.1) || (length(v3893) > 16.0)),
    vec3(0.0),
    fake_if(((v3875 > 0.0) && (v3889 > 0.0)), v3893, vec3(0.0))));
  (v3895 = vec3(v3888.x, 0.0, v3888.z));
  (v3896 = texture2D(
    tUnitsPosition,
    vec2(
      (mod(v3880, uMaxUnitsResolution.x) / uMaxUnitsResolution.x),
      (floor((v3880 / uMaxUnitsResolution.x)) / uMaxUnitsResolution.y))).xyz);
  (v3897 = fake_if(
    (v3886 == v3896),
    vec3(cos(v3881), 0.0, sin(v3881)),
    (v3886 - v3896)));
  (v3898 = fake_if(
    ((abs((v3871 - 3.0)) < 0.1) || (length(v3897) > 16.0)),
    vec3(0.0),
    fake_if(((v3875 > 0.0) && (v3879 > 0.0)), v3897, vec3(0.0))));
  (v3899 = vec3(v3898.x, 0.0, v3898.z));
  (v3900 = texture2D(
    tUnitsPosition,
    vec2(
      (mod(v3876, uMaxUnitsResolution.x) / uMaxUnitsResolution.x),
      (floor((v3876 / uMaxUnitsResolution.x)) / uMaxUnitsResolution.y))).xyz);
  (v3901 = fake_if(
    (v3886 == v3900),
    vec3(cos(v3878), 0.0, sin(v3878)),
    (v3886 - v3900)));
  (v3902 = fake_if(
    ((abs((v3871 - 1.0)) < 0.1) || (length(v3901) > 16.0)),
    vec3(0.0),
    fake_if(((v3875 > 0.0) && (v3874 > 0.0)), v3901, vec3(0.0))));
  (v3903 = vec3(v3902.x, 0.0, v3902.z));
  (v3904 = vec3(v3894.x, 0.0, v3894.z));
  (v3905 = (((fake_if((length(v3895) > 0.0), normalize(v3895), v3895) + fake_if(
    (length(v3903) > 0.0),
    normalize(v3903),
    v3903)) + fake_if((length(v3904) > 0.0), normalize(v3904), v3904)) + fake_if(
    (length(v3899) > 0.0),
    normalize(v3899),
    v3899)));
  (v4213 = mod(aFragmentIndex, 4.0));
  (v4214 = ((aFragmentIndex - v4213) / 4.0));
  (v4215 = texture2D(
    tUnitsCollisions,
    vec2(
      (mod(v4214, uCollisionResolution.x) / uCollisionResolution.x),
      (floor((v4214 / uCollisionResolution.x)) / uCollisionResolution.y))));
  (v4216 = swizzle_by_index(v4215, v4213));
  (v4217 = ((v4216 * uMaxUnits) - 1.0));
  (v4262 = mod(aFragmentIndex, 4.0));
  (v4263 = ((aFragmentIndex - v4262) / 4.0));
  (v4264 = texture2D(
    tUnitsCollisions,
    vec2(
      (mod(v4263, uCollisionResolution.x) / uCollisionResolution.x),
      (floor((v4263 / uCollisionResolution.x)) / uCollisionResolution.y))));
  (v4265 = swizzle_by_index(v4264, v4262));
  (v4266 = ((v4265 * uMaxUnits) - 1.0));
  (v4296 = texture2D(
    tUnitsPosition,
    vec2(
      (mod(v4266, uMaxUnitsResolution.x) / uMaxUnitsResolution.x),
      (floor((v4266 / uMaxUnitsResolution.x)) / uMaxUnitsResolution.y))).xyz);
  (v4319 = swizzle_by_index(v4264, 0.0));
  (v4320 = ((v4319 * uMaxUnits) - 1.0));
  (v4321 = texture2D(
    tUnitsPosition,
    vec2(
      (mod(v4320, uMaxUnitsResolution.x) / uMaxUnitsResolution.x),
      (floor((v4320 / uMaxUnitsResolution.x)) / uMaxUnitsResolution.y))).xyz);
  (v4322 = (2.0 * (3.141592653589793 * fract(
    (sin(((uTime + (v4320 - v4266)) * 12.989)) * 43758.545)))));
  (v4323 = fake_if(
    (v4296 == v4321),
    vec3(cos(v4322), 0.0, sin(v4322)),
    (v4296 - v4321)));
  (v4324 = fake_if(
    ((abs((v4262 - 0.0)) < 0.1) || (length(v4323) > 16.0)),
    vec3(0.0),
    fake_if(((v4265 > 0.0) && (v4319 > 0.0)), v4323, vec3(0.0))));
  (v4325 = vec3(v4324.x, 0.0, v4324.z));
  (v4390 = swizzle_by_index(v4264, 1.0));
  (v4391 = ((v4390 * uMaxUnits) - 1.0));
  (v4392 = (2.0 * (3.141592653589793 * fract(
    (sin(((uTime + (v4391 - v4266)) * 12.989)) * 43758.545)))));
  (v4393 = texture2D(
    tUnitsPosition,
    vec2(
      (mod(v4391, uMaxUnitsResolution.x) / uMaxUnitsResolution.x),
      (floor((v4391 / uMaxUnitsResolution.x)) / uMaxUnitsResolution.y))).xyz);
  (v4394 = fake_if(
    (v4296 == v4393),
    vec3(cos(v4392), 0.0, sin(v4392)),
    (v4296 - v4393)));
  (v4395 = fake_if(
    ((abs((v4262 - 1.0)) < 0.1) || (length(v4394) > 16.0)),
    vec3(0.0),
    fake_if(((v4265 > 0.0) && (v4390 > 0.0)), v4394, vec3(0.0))));
  (v4396 = vec3(v4395.x, 0.0, v4395.z));
  (v4461 = swizzle_by_index(v4264, 2.0));
  (v4462 = ((v4461 * uMaxUnits) - 1.0));
  (v4463 = (2.0 * (3.141592653589793 * fract(
    (sin(((uTime + (v4462 - v4266)) * 12.989)) * 43758.545)))));
  (v4464 = texture2D(
    tUnitsPosition,
    vec2(
      (mod(v4462, uMaxUnitsResolution.x) / uMaxUnitsResolution.x),
      (floor((v4462 / uMaxUnitsResolution.x)) / uMaxUnitsResolution.y))).xyz);
  (v4465 = fake_if(
    (v4296 == v4464),
    vec3(cos(v4463), 0.0, sin(v4463)),
    (v4296 - v4464)));
  (v4466 = fake_if(
    ((abs((v4262 - 2.0)) < 0.1) || (length(v4465) > 16.0)),
    vec3(0.0),
    fake_if(((v4265 > 0.0) && (v4461 > 0.0)), v4465, vec3(0.0))));
  (v4467 = vec3(v4466.x, 0.0, v4466.z));
  (v4532 = swizzle_by_index(v4264, 3.0));
  (v4533 = ((v4532 * uMaxUnits) - 1.0));
  (v4534 = (2.0 * (3.141592653589793 * fract(
    (sin(((uTime + (v4533 - v4266)) * 12.989)) * 43758.545)))));
  (v4535 = texture2D(
    tUnitsPosition,
    vec2(
      (mod(v4533, uMaxUnitsResolution.x) / uMaxUnitsResolution.x),
      (floor((v4533 / uMaxUnitsResolution.x)) / uMaxUnitsResolution.y))).xyz);
  (v4536 = fake_if(
    (v4296 == v4535),
    vec3(cos(v4534), 0.0, sin(v4534)),
    (v4296 - v4535)));
  (v4537 = fake_if(
    ((abs((v4262 - 3.0)) < 0.1) || (length(v4536) > 16.0)),
    vec3(0.0),
    fake_if(((v4265 > 0.0) && (v4532 > 0.0)), v4536, vec3(0.0))));
  (v4538 = vec3(v4537.x, 0.0, v4537.z));
  (vCollisionValue = fake_if((length(v3905) > 0.0), normalize(v3905), v3905));
  (vUV = vec2(
    (mod(v4217, uMaxUnitsResolution.x) / uMaxUnitsResolution.x),
    (floor((v4217 / uMaxUnitsResolution.x)) / uMaxUnitsResolution.y)));
  (pos = position);
  (blah = normal);
  (test = uv);
  (gl_Position = fake_if(
    (length(
      (((fake_if((length(v4325) > 0.0), normalize(v4325), v4325) + fake_if(
        (length(v4396) > 0.0),
        normalize(v4396),
        v4396)) + fake_if((length(v4467) > 0.0), normalize(v4467), v4467)) + fake_if(
        (length(v4538) > 0.0),
        normalize(v4538),
        v4538))) > 0.0),
    vec4(
      (vec2(-1.0, -1.0) + ((vec2(
        (mod(v4266, uMaxUnitsResolution.x) / uMaxUnitsResolution.x),
        (floor((v4266 / uMaxUnitsResolution.x)) / uMaxUnitsResolution.y)) + ((position.xy + vec2(
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
