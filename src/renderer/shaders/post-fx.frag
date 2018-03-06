#extension GL_OES_standard_derivatives : enable

precision highp float;

#define PI 3.141592653589793

uniform sampler2D color;
uniform sampler2D bloom;
uniform float bloomIntensity;
uniform float noiseIntensity;
uniform vec3 colorShift; // [hue, saturation, value]

uniform float tick;
uniform vec3 viewResolution; // [x, y, pxRatio]
uniform vec2 viewOffset;

varying vec2 uv;

#pragma glslify: random = require(glsl-random)
#pragma glslify: blendColorBurn = require(glsl-blend/color-burn)
#pragma glslify: concentricDash = require(./alpha/concentric-dash, fwidth=fwidth, PI=PI)
#pragma glslify: vignette = require(./vignette)
#pragma glslify: rgb2hsv = require('./color/rgb2hsv')
#pragma glslify: hsv2rgb = require('./color/hsv2rgb')

// Create gradient banding
float bandGrad(float value, float step) {
  float scaled = value * step;
  return (scaled - mod(scaled, 1.0)) / step;
}

// OPTIM: Maybe use separate pass to create banded color texture
// Banded edge detection
const float colorBandStep = 32.0;
vec3 transformEdgeSample(vec4 color) {
  vec3 hColor = rgb2hsv(color.rgb);
  return hsv2rgb(vec3(
    hColor.r,
    hColor.g,
    bandGrad(hColor.b, colorBandStep)));
}
#pragma glslify: bandedEdgeDetect = require(./edge-frei-chen, transformSample=transformEdgeSample)

void main() {
  // OPTIM: Improve viewResolution density mapping ..
  vec2 fragCoord = gl_FragCoord.xy / viewResolution.z;
  vec2 fragCenter = fragCoord - viewResolution.xy / viewResolution.z * 0.5;
  vec2 fragPosition = fragCenter - vec2(viewOffset.x, -viewOffset.y);

  // Base Color / Shift
  vec4 sColor = texture2D(color, uv);
  vec3 hColor = rgb2hsv(sColor.rgb);
  vec4 fColor = vec4(hsv2rgb(
    vec3(fract(hColor.r + colorShift.r),
      clamp(hColor.g + colorShift.g, 0.0, 1.5),
      clamp(hColor.b + colorShift.b, 0.0, 1.0))),
      1.0);

  // Banded Gradients
  vec4 fColorBand = vec4(
    hsv2rgb(vec3(hColor.r, hColor.g, bandGrad(hColor.b, colorBandStep))),
    1.0);

  vec4 fColorBandEdge = vec4(hsv2rgb(
    vec3(hColor.r, hColor.g,
      bandedEdgeDetect(color, uv, viewResolution.xy))), 1.0);

  // Noise
  vec4 fNoise = vec4(0.0);
  if (noiseIntensity > 0.0) {
    float nx = random(fract(uv + tick * 0.001));
    fNoise = vec4(clamp(0.1 + nx, 0.0, 1.0) * 2.0 - 1.0) * noiseIntensity;
  }

  // Bloom
  vec4 fBloom = fColor * 0.4;
  if (bloomIntensity > 0.0) {
    fBloom = texture2D(bloom, uv) * bloomIntensity;
  }

  // Origin Concentric Grid
  vec4 fDash = vec4(0.0);
  // vec4 fDash = 0.05 * vec4(
  //   vec3(concentricDash(fragPosition, 0.15, 1.0)),
  //   1.0);

  // Vignette
  vec4 fVignette = vec4(1.0);
  // vec4 fVignette = vec4(
  //   vec3(vignette(uv, 0.7, 0.4)),
  //   0.0);

  // gl_FragColor = vec4(blendColorBurn(
  //   (fColor + (fColor * fNoise) + fDash + fBloom).rgb,
  //   (fVignette).rgb), 1.0);

  // gl_FragColor = mix(fColor, fColorBand, 0.1);
  gl_FragColor = mix(fColor, fColorBandEdge + 0.5, 0.6);
}
