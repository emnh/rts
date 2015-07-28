#ifdef GL_ES
precision mediump float;
#endif

// Eivind Magnus Hvidevold
// hvidevold@gmail.com
// GLSL health bars for RTS

uniform float time;
varying float v_health;

void main( void ) {

  //vec2 position = (surfacePosition + 1.0) / 2.0;
  vec2 position = gl_PointCoord;

  float x = position.x;
  float y = position.y;
  float height = 0.15;
  float minY = 0.5 - height / 2.0;
  float maxY = 0.5 + height / 2.0;
  if (y < minY || y > maxY) {
    gl_FragColor = vec4(0.0);
  } else {
    gl_FragColor.a = 1.0;
    y = (y - minY) / (maxY - minY);
    if (mod(x, 0.2) < 0.175 &&
        mod(x, 0.2) > 0.025 &&
        y > 0.2 &&
        y < 0.8 &&
        x < v_health) {
    
      if (v_health > 0.75) {
        // green
        gl_FragColor.rgb = vec3(0.0, 1.0, 0.0);
      } else if (v_health > 0.5) {
        // yellow
        gl_FragColor.rgb = vec3(1.0, 1.0, 0.0);
      } else if (v_health > 0.25) { 
        // orange
        gl_FragColor.rgb = vec3(1.0, 0.5, 0.0);
      } else {
        // red
        gl_FragColor.rgb = vec3(1.0, 0.0, 0.0); 
      }
    }
  }
}
