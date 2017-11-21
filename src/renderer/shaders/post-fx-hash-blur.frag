precision highp float;
uniform sampler2D color;
uniform float radius;
uniform float offset;
uniform vec2 resolution;
varying vec2 uv;

#define ITERATIONS 13

vec3 sampleColor(vec2 uv);
#pragma glslify: hashBlur = require(glsl-hash-blur, sample = sampleColor, iterations = ITERATIONS)

vec3 sampleColor(vec2 uv) {
  return texture2D(color, uv).rgb;
}

void main() {
  float aspect = resolution.x / resolution.y;
  float sampleRadius = radius / resolution.x;

  vec3 blurColor = hashBlur(uv, sampleRadius, aspect, offset);
  gl_FragColor = vec4(blurColor, 1.0);
}
