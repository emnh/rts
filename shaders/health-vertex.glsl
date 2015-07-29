precision highp float;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

attribute vec3 position;

attribute float a_health;
varying float v_health;

void main() {
  v_health = a_health;
  vec4 pos = vec4(position, 1.0);
  gl_PointSize = 50.0;
  gl_Position = projectionMatrix * modelViewMatrix * pos;
}
