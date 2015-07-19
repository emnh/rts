#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform float health;
uniform vec3 color;
varying vec2 surfacePosition;

void main( void ) {

  vec2 position = surfacePosition;

  float x = surfacePosition.x;
  float y = surfacePosition.y;
  
  if (x > 0.1 &&
      x < 0.9 &&
      y > 0.3 &&
      y < 0.7) {
    gl_FragColor.rgb = color;
  }
}
