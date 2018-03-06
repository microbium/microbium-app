#extension GL_OES_standard_derivatives : enable

precision highp float;

#define PI 3.141592653589793

uniform sampler2D color;
// uniform sampler2D bloom;
uniform float noiseIntensity;

uniform float tick;
uniform vec3 viewResolution; // [x, y, pxRatio]
uniform vec2 viewOffset;

varying vec2 uv;

#pragma glslify: blendColorBurn = require(glsl-blend/color-burn)
#pragma glslify: blendOverlay = require(glsl-blend/overlay)

#pragma glslify: random = require(glsl-random)
#pragma glslify: concentricDash = require(./alpha/concentric-dash, fwidth=fwidth, PI=PI)
#pragma glslify: vignette = require(./vignette)
#pragma glslify: edgeDetect = require(./edge-frei-chen)
#pragma glslify: bandGradient = require(./band-gradient)
#pragma glslify: rgb2hsv = require('./color/rgb2hsv')
#pragma glslify: hsv2rgb = require('./color/hsv2rgb')

void main() {
  // OPTIM: Improve viewResolution density mapping ..
  vec2 fragCoord = gl_FragCoord.xy / viewResolution.z;
  vec2 fragCenter = fragCoord - viewResolution.xy / viewResolution.z * 0.5;
  vec2 fragPosition = fragCenter - vec2(viewOffset.x, -viewOffset.y);

  // Base Color (shifted / banded in pre-pass)
  vec4 baseColor = texture2D(color, uv);
  vec3 baseColorHSV = rgb2hsv(baseColor.rgb);

  // Bloom Color
  // vec4 bloomColor = texture2D(bloom, uv);
  // vec3 bloomColorHSV = rgb2hsv(bloomColor.rgb);

  // Banding Samples
  float bandS = bandGradient(baseColorHSV.g, 24.0);
  float bandS0 = smoothstep(0.0, 0.4, 0.3 - bandS);

  // Noise
  vec4 noiseColor = vec4(0.0);
  if (noiseIntensity > 0.0) {
    float noiseSample = random(fract(uv + tick * 0.001));
    noiseColor = vec4(clamp(0.1 + noiseSample, 0.0, 1.0) * 2.0 - 1.0) * noiseIntensity;
  }

  // Edge Detection
  float edgesSample = edgeDetect(color, uv, viewResolution.xy);
  vec4 edgesColor = vec4(
    hsv2rgb(vec3(baseColorHSV.r, baseColorHSV.g, edgesSample)),
    1.0);
  edgesColor.rgb = blendOverlay(baseColor.rgb, edgesColor.rgb, 0.85);

  // Edge Channel Mapping
  vec3 edgesColorHSV = rgb2hsv(edgesColor.rgb);
  float edgesH0 = smoothstep(0.88, 1.0, edgesColorHSV.r);
  float edgesS0 = smoothstep(0.285, 0.5, edgesColorHSV.g);
  float edgesV0 = smoothstep(0.0, 0.125, edgesColorHSV.b);

  // Origin Concentric Grid
  vec4 dashColor = 0.05 * vec4(
    vec3(concentricDash(fragPosition, 0.15, 1.0)),
    1.0);

  // Vignette
  vec4 vignetteColor = vec4(
    vec3(vignette(uv, 0.7, 0.4)),
    0.0);

  // gl_FragColor = vec4(blendColorBurn(
  //   (fColor + (fColor * fNoise) + fDash + fBloom).rgb,
  //   (fVignette).rgb), 1.0);

  gl_FragColor = vec4(vec3(bandS0), 1.0);
}
