precision highp float;

uniform sampler2D color;
uniform sampler2D bloom;
uniform float bloomIntensity;
uniform float noiseIntensity;
uniform float tick;
uniform vec2 resolution;

varying vec2 uv;

#pragma glslify: fxaa = require(glsl-fxaa)
#pragma glslify: random = require(glsl-random)

void main() {
  vec2 fragCoord = uv * resolution;

  float nx = random(fract(uv + tick * 0.01));
  float noise = clamp(0.1 + nx, 0.0, 1.0) * noiseIntensity;
  vec4 fColor = fxaa(color, fragCoord, resolution);
  // vec4 fColor = texture2D(color, uv);

  vec4 fBloom = vec4(0.0);
  if (bloomIntensity > 0.0) {
    fBloom = texture2D(bloom, uv) * bloomIntensity;
  }

  gl_FragColor = (fColor + (fColor * noise) + fBloom);
}
