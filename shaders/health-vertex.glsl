varying vec2 surfacePosition;

uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec2 uv;

attribute vec4 a_mv0;
attribute vec4 a_mv1;
attribute vec4 a_mv2;
attribute vec4 a_mv3;
#define u_mv mat4(a_mv0, a_mv1, a_mv2, a_mv3)

attribute float a_health;
varying float v_health;

void main() {
  v_health = a_health;
  surfacePosition = uv;
  vec4 pos = vec4(position, 1.0);
  gl_Position = projectionMatrix * u_mv * pos;
} 
