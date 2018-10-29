#extension GL_OES_standard_derivatives : enable

precision highp float;

#define PI 3.141592653589793

uniform sampler2D color;
uniform sampler2D bloom;
uniform sampler2D banding;
uniform sampler2D edges;

uniform float bloomIntensity;
uniform float bandingIntensity;
uniform float edgesIntensity;
uniform float noiseIntensity;
uniform float overlayAlpha;
uniform vec3 colorShift; // [hue, saturation, value]

uniform float tick;
uniform vec3 viewResolution; // [x, y, pxRatio]
uniform vec2 viewOffset;
uniform float viewScale;

uniform int forcePositionsCount;
uniform vec3 forcePositions[3];

varying vec2 uv;

#pragma glslify: blendColorBurn = require(glsl-blend/color-burn)
#pragma glslify: blendColorDodge = require(glsl-blend/color-dodge)
#pragma glslify: blendOverlay = require(glsl-blend/overlay)
#pragma glslify: blendSubtract = require(glsl-blend/subtract)
#pragma glslify: blendSoftLight = require(glsl-blend/soft-light)

#pragma glslify: random = require(glsl-random)
#pragma glslify: concentricDash = require(./alpha/concentric-dash, fwidth=fwidth, PI=PI)
#pragma glslify: vignette = require(./vignette)
#pragma glslify: brightnessContrast = require(./color/brightness-contrast)
#pragma glslify: rgb2hsv = require('./color/rgb2hsv')
#pragma glslify: hsv2rgb = require('./color/hsv2rgb')

// TODO: Improve viewResolution density mapping
vec2 transformScreenPosition(vec3 resolution, vec2 offset, vec2 coord) {
  vec2 screenCoord = uv * resolution.xy / resolution.z;
  vec2 screenCenter = screenCoord - resolution.xy / resolution.z * 0.5;
  return screenCenter - vec2(offset.x, -offset.y);
}

void main() {
  vec2 fragPosition = transformScreenPosition(viewResolution, viewOffset, uv);

  // ..................................................

  // Base Color / Shift
  vec3 baseColor = texture2D(color, uv).rgb;
  vec3 baseColorHSV = rgb2hsv(baseColor);
  baseColorHSV = vec3(
    fract(baseColorHSV.r + colorShift.r),
    clamp(baseColorHSV.g + colorShift.g, 0.0, 1.5),
    clamp(baseColorHSV.b + colorShift.b, 0.0, 1.0));
  baseColor = hsv2rgb(baseColorHSV);

  // ..................................................

  vec3 bandingColor = baseColor;
  vec3 bloomColor = baseColor * 0.4;

  // Banding
  if (bandingIntensity > 0.0) {
    float bandingSample = texture2D(banding, uv).a;
    bandingColor = hsv2rgb(vec3(
      baseColorHSV.r,
      baseColorHSV.g,
      bandingSample));
  }

  // Bloom
  if (bloomIntensity > 0.0) {
    bloomColor = texture2D(bloom, uv).rgb * bloomIntensity;
  }

  // ..................................................

  // Composite Base + Banding + Bloom
  vec3 outColor = mix(baseColor, bandingColor, bandingIntensity) + bloomColor;

  // Edges
  // TODO: Parameterize individual edge channels
  // FIXME: Investigate glitchy artifacts with S0 channel + hue shifting
  if (edgesIntensity > 0.0) {
    vec4 edgesColorSample = texture2D(edges, uv);
    vec3 edgesColor = blendOverlay(bandingColor, edgesColorSample.rgb, 0.85);
    float edgesSample = edgesColorSample.a;

    // Edge Channel Mapping
    vec3 edgesColorHSV = rgb2hsv(edgesColor);
    // vec3 edgesH0 = brightnessContrast(
    //   vec3(smoothstep(0.6, 1.5, edgesColorHSV.r * 1.25)),
    //   0.6, 1.6);
    // vec3 edgesS0 = brightnessContrast(
    //   vec3(smoothstep(0.285, 0.5, edgesColorHSV.g * 2.0)),
    //   0.0, 0.75);
    vec3 edgesV0 = brightnessContrast(
      vec3(smoothstep(0.0, 0.25, edgesSample * 10.0)),
      0.0, 1.1);
    vec3 edgesV1 = brightnessContrast(
      vec3(smoothstep(0.0, 0.125, edgesColorHSV.b + 0.025)),
      0.0, 1.2);

    // outColor = blendSoftLight(outColor, edgesH0, edgesIntensity);
    // outColor = blendColorDodge(outColor, edgesS0, edgesIntensity * 0.15);
    outColor = blendOverlay(outColor, edgesV0, edgesIntensity * 0.1);
    outColor = blendSubtract(outColor, vec3(edgesV1), edgesIntensity * 0.35);
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
    concentricDash(fragPosition, 0.15 / viewScale, 1.0) *
      0.035 * overlayAlpha);

  for (int i = 0; i < 3; i++) {
    if (i >= forcePositionsCount) break;
    vec3 force = forcePositions[i];
    vec2 forcePosition = force.xy * viewScale * vec2(1.0, -1.0);
    float forceRadius = force.z * viewScale;
    originDashColor += vec3(
      concentricDash(fragPosition, 0.075 / viewScale, 1.5, forcePosition, forceRadius) *
        0.04 * overlayAlpha);
  }

  // Vignette
  vec3 vignetteColor = vec3(vignette(uv, 0.7, 0.4));

  // ..................................................

  // Composite + Radial Grid + Noise + Vignette
  outColor = blendColorBurn(
    outColor + outColor * noiseColor + originDashColor,
    vignetteColor);

  gl_FragColor = vec4(outColor, 1.0);
}
