#ifdef GL_ES
precision lowp float;
#endif

uniform float time;
varying vec2 surfacePosition;

const float PI = 3.1415926535898;
const float TU = PI*2.;

void main( void ) {
  gl_FragColor = vec4(1);
  
  float rMin = 0.125;
  float rMax = 0.250;
  float tSpan = .88;
  const float arcs = 8.;
  
  vec2 p = surfacePosition - 0.5;
  vec2 r = vec2(length(p), atan(p.x, p.y));
  
  if(r.y < 0.) r.y += TU;
  
  if(r.x > rMin && r.x < rMax){
    for(int i = 0; i < int(arcs); i++){
      float n = float(i)/arcs;
      float tMin = TU*n;
      float tMax = TU*(n+tSpan/arcs);
      if(r.y > tMin && r.y < tMax){
        gl_FragColor.r *= .5 + fract(-n+time)/2.;
        gl_FragColor.r = pow(gl_FragColor.r, 1.8);
        gl_FragColor.g = (gl_FragColor.r+gl_FragColor.b)/2.;
      }
    }
  } else {
    gl_FragColor.a = 0.5;
  }
}
