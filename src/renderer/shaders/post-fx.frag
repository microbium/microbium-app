precision highp float;
uniform sampler2D color;
uniform sampler2D bloom;
uniform float bloomIntensity;
varying vec2 uv;

void main() {
  vec3 fColor = texture2D(color, uv).rgb;
  vec3 fBloom = vec3(0.0);
  if (bloomIntensity > 0.0) {
  	fBloom = texture2D(bloom, uv).rgb * bloomIntensity;
  }
  gl_FragColor = vec4(fColor + fBloom, 1.0);
}
