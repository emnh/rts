precision highp float;

uniform float health;
varying vec3 v_color;

void main( void ) {

  vec2 position = gl_PointCoord;

  float x = position.x;
  float y = position.y;

  gl_FragColor.a = 1.0;
  if (x > 0.1 &&
      x < 0.9 &&
      y > 0.1 &&
      y < 0.9) {
    gl_FragColor.rgb = v_color;
  }
}
