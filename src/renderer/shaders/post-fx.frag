precision highp float;
uniform sampler2D color;
uniform sampler2D bloom;
uniform vec2 resolution;
uniform float bloomIntensity;
varying vec2 uv;

#pragma glslify: fxaa = require(glsl-fxaa)

void main() {
  vec2 fragCoord = uv * resolution;

  vec4 fColor = fxaa(color, fragCoord, resolution);
  // vec4 fColor = texture2D(color, uv);

  vec4 fBloom = vec4(0.0);
  if (bloomIntensity > 0.0) {
    fBloom = texture2D(bloom, uv) * bloomIntensity;
  }

  gl_FragColor = fColor + fBloom;
}
