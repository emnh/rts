precision highp float;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

attribute vec3 position;
attribute vec3 a_color;

varying vec3 v_color;

void main() {
  v_color = a_color;
  vec4 pos = vec4(position, 1.0);

  gl_PointSize = 5.0;

  gl_Position = projectionMatrix * modelViewMatrix * pos;
}
