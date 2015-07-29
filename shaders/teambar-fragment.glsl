precision highp float;

uniform float time;
uniform float health;
varying vec3 v_color;

void main( void ) {

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
    if (x > 0.05 &&
        x < 0.95 &&
        y > 0.3 &&
        y < 0.7) {
      gl_FragColor.rgb = v_color;
    }
  }
}
