precision highp float;

varying float noise;
uniform sampler2D tExplosion;
varying float v_opacity;

float random( vec3 scale, float seed ){
  return fract( sin( dot( gl_FragCoord.xyz + seed, scale ) ) * 43758.5453 + seed ) ;
}

void main() {
  float r = 0.01 * random( vec3( 12.9898, 78.233, 151.7182 ), 0.0);
  vec2 tPos = vec2(0.0, 2.0 * noise + r);
  vec4 color = texture2D(tExplosion, tPos);
  gl_FragColor = vec4(color.rgb, v_opacity);
}
