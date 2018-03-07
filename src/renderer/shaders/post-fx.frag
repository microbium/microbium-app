#extension GL_OES_standard_derivatives : enable

precision highp float;

#define PI 3.141592653589793

uniform sampler2D color;
uniform sampler2D bloom;
uniform sampler2D banding;

uniform float bloomIntensity;
uniform float bandingIntensity;
uniform float noiseIntensity;
uniform vec3 colorShift; // [hue, saturation, value]

uniform float tick;
uniform vec3 viewResolution; // [x, y, pxRatio]
uniform vec2 viewOffset;

varying vec2 uv;

#pragma glslify: blendColorBurn = require(glsl-blend/color-burn)
#pragma glslify: blendColorDodge = require(glsl-blend/color-dodge)
#pragma glslify: blendOverlay = require(glsl-blend/overlay)
#pragma glslify: blendSubtract = require(glsl-blend/subtract)
#pragma glslify: blendSoftLight = require(glsl-blend/soft-light)

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

  // ..................................................

  // Base Color
  vec3 baseColor = texture2D(color, uv).rgb;
  vec3 baseColorHSV = rgb2hsv(baseColor);
  baseColor = hsv2rgb(
  vec3(fract(baseColorHSV.r + colorShift.r),
    clamp(baseColorHSV.g + colorShift.g, 0.0, 1.5),
    clamp(baseColorHSV.b + colorShift.b, 0.0, 1.0)));

  // Banding
  vec3 bandingColor = baseColor;
  if (bandingIntensity > 0.0) {
    bandingColor = texture2D(banding, uv).rgb;
    baseColor = mix(baseColor, bandingColor, 0.6);
    baseColorHSV = rgb2hsv(baseColor);
  }

  // Bloom
  vec3 bloomColor = baseColor * 0.4;
  if (bloomIntensity > 0.0) {
    bloomColor = texture2D(bloom, uv).rgb * bloomIntensity;
  }
  baseColor += bloomColor;
  baseColorHSV = rgb2hsv(baseColor);

  // ..................................................

  // Composite
  vec3 outColor = baseColor;

  if (bandingIntensity > 0.0) {
    // Edge Detection
    float edgesSample = edgeDetect(banding, uv, viewResolution.xy);
    vec3 edgesColor = hsv2rgb(vec3(baseColorHSV.r, baseColorHSV.g, edgesSample));
    edgesColor = blendOverlay(baseColor, edgesColor, 0.85);

    // Edge Channel Mapping
    vec3 edgesColorHSV = rgb2hsv(edgesColor);
    float edgesH0 = smoothstep(0.925, 1.0, edgesColorHSV.r);
    float edgesS0 = smoothstep(0.285, 0.5, edgesColorHSV.g);
    float edgesV0 = smoothstep(0.0, 0.125, edgesColorHSV.b);
    float edgesV1 = smoothstep(0.0, 0.125, edgesColorHSV.b + 0.025);

    // Banding Samples
    float bandS = bandGradient(baseColorHSV.g, 24.0);
    float bandS0 = smoothstep(0.0, 0.4, 0.3 - bandS);

    outColor = blendSoftLight(outColor, vec3(edgesH0 + 0.4), 0.9);
    outColor = blendColorDodge(outColor, vec3(bandS0) - 0.4, 0.4);
    outColor = blendOverlay(outColor, vec3(edgesV0 - 0.4), 0.4);
    outColor = blendSubtract(outColor, vec3(edgesV1), 0.4);
  }

  // ..................................................

  // Noise
  vec3 noiseColor = vec3(0.0);
  if (noiseIntensity > 0.0) {
    float noiseSample = random(fract(uv + tick * 0.001));
    noiseColor = vec3(
      (clamp(0.1 + noiseSample, 0.0, 1.0) * 2.0 - 1.0) * noiseIntensity);
  }

  // Origin Concentric Grid
  vec3 originDashColor = vec3(
    concentricDash(fragPosition, 0.15, 1.0) * 0.035);

  // Vignette
  vec3 vignetteColor = vec3(vignette(uv, 0.7, 0.4));

  // ..................................................

  // Composite + Radial Grid + Noise + Vignette
  outColor = blendColorBurn(
    outColor + outColor * noiseColor + originDashColor,
    vignetteColor);

  gl_FragColor = vec4(outColor, 1.0);
}
