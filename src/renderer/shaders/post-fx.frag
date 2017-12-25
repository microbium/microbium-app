#extension GL_OES_standard_derivatives : enable

precision highp float;

#define PI 3.141592653589793

uniform sampler2D color;
uniform sampler2D bloom;
uniform float bloomIntensity;
uniform float noiseIntensity;
uniform float tick;
uniform vec3 viewResolution; // [x, y, pxRatio]
uniform vec2 viewOffset;

varying vec2 uv;

#pragma glslify: random = require(glsl-random)
#pragma glslify: blendColorBurn = require(glsl-blend/color-burn)
#pragma glslify: concentricDash = require(./alpha/concentric-dash, fwidth=fwidth, PI=PI)
#pragma glslify: vignette = require(./vignette)

void main() {
  // OPTIM: Improve viewResolution density mapping ..
  vec2 fragCoord = gl_FragCoord.xy / viewResolution.z;
  vec2 fragCenter = fragCoord - viewResolution.xy / viewResolution.z * 0.5;
  vec2 fragPosition = fragCenter - vec2(viewOffset.x, -viewOffset.y);

  vec4 fColor = texture2D(color, uv);

  float fNoise = 0.0;
  if (noiseIntensity > 0.0) {
    float nx = random(fract(uv + tick * 0.001));
    fNoise = (clamp(0.1 + nx, 0.0, 1.0) * 2.0 - 1.0) * noiseIntensity;
  }

  vec4 fBloom = vec4(0.0);
  if (bloomIntensity > 0.0) {
    fBloom = texture2D(bloom, uv) * bloomIntensity;
  }

  vec4 fDash = 0.05 * vec4(
    vec3(concentricDash(fragPosition, 0.15, 1.0)),
    1.0);

  vec4 fVignette = vec4(
    vec3(vignette(uv, 0.7, 0.4)),
    0.0);

  gl_FragColor = vec4(blendColorBurn(
    (fColor + (fColor * fNoise) + fDash + fBloom).rgb,
    (fVignette).rgb), 1.0);
}
