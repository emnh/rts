varying vec2 surfacePosition;

void main() {
  surfacePosition = uv;
  vec4 pos = vec4(position, 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * pos;
} 
