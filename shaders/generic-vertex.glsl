precision highp float;

uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec2 uv;

attribute vec4 a_mv0;
attribute vec4 a_mv1;
attribute vec4 a_mv2;
attribute vec4 a_mv3;
#define a_mv mat4(a_mv0, a_mv1, a_mv2, a_mv3)

varying vec2 vUv;

void main() {
  vUv = uv;

  gl_Position = projectionMatrix * a_mv * vec4(position, 1.0);
}
