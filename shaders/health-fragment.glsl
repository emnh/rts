#ifdef GL_ES
precision mediump float;
#endif

// Eivind Magnus Hvidevold
// hvidevold@gmail.com
// GLSL health bars for RTS

uniform float time;
varying vec2 surfacePosition;

void main( void ) {

  vec2 position = surfacePosition;

  float color = 0.0;
  
  float health = (sin(time) + 1.0) / 2.0;
  
  float x = (surfacePosition.x + 1.0) / 2.0;
  float y = (surfacePosition.y + 1.0) / 2.0;
  
  if (mod(x, 0.2) < 0.175 &&
      mod(x, 0.2) > 0.025 &&
      y > 0.3 &&
      y < 0.7 &&
      x < health) {
  
    if (health > 0.75) {
      // green
      gl_FragColor.rgb = vec3(0.0, 1.0, 0.0);
    } else if (health > 0.5) {
      // yellow
      gl_FragColor.rgb = vec3(1.0, 1.0, 0.0);
    } else if (health > 0.25) { 
      // orange
      gl_FragColor.rgb = vec3(1.0, 0.5, 0.0);
    } else {
      // red
      gl_FragColor.rgb = vec3(1.0, 0.0, 0.0); 
    }
  }
}
