#extension GL_OES_standard_derivatives : enable

precision highp float;

#define PI 3.141592653589793

uniform sampler2D color;
uniform sampler2D bloom;
uniform sampler2D banding;
uniform sampler2D edges;
uniform sampler2D lutTexture;
uniform sampler2D watermarkTexture;

uniform float mirrorIntensity;
uniform float mirrorAngle;
// uniform float bloomIntensity;
uniform float bandingIntensity;
uniform float edgesIntensity;
uniform float noiseIntensity;
uniform float lutIntensity;
uniform float watermarkIntensity;
uniform float overlayAlpha;
uniform float originAlpha;
uniform vec3 vignetteParams; // [radius, smoothness, intensity]
uniform vec3 colorShift; // [hue, saturation, value]

uniform float tick;
uniform vec3 viewResolution; // [x, y, pxRatio]
uniform vec2 viewOffset;
uniform float viewScale;

varying vec2 uv;

#pragma glslify: blendColorBurn = require(glsl-blend/color-burn)
#pragma glslify: blendColorDodge = require(glsl-blend/color-dodge)
#pragma glslify: blendOverlay = require(glsl-blend/overlay)
#pragma glslify: blendSubtract = require(glsl-blend/subtract)
#pragma glslify: blendSoftLight = require(glsl-blend/soft-light)

#pragma glslify: lutTransform = require(glsl-lut)
#pragma glslify: random = require(glsl-random)

#pragma glslify: concentricDash = require(./alpha/concentric-dash, fwidth=fwidth, PI=PI)
#pragma glslify: vignette = require(./vignette)
#pragma glslify: rgb2hsv = require('./color/rgb2hsv')
#pragma glslify: hsv2rgb = require('./color/hsv2rgb')

// TODO: Improve viewResolution density mapping
vec2 transformScreenPosition(vec3 resolution, vec2 offset, vec2 coord) {
  vec2 screenCoord = coord * resolution.xy / resolution.z;
  vec2 screenCenter = screenCoord - resolution.xy / resolution.z * 0.5;
  return screenCenter - vec2(offset.x, -offset.y);
}

vec4 sampleMirror(sampler2D color, vec2 uv, float angle) {
  if (mirrorIntensity <= 0.0) {
    return texture2D(color, uv);
  }

  vec2 norm = normalize(vec2(cos(angle), sin(angle)));
  vec2 uvCenter = uv * 2.0 - 1.0;
  float normOffsetLength = dot(norm, uvCenter);
  vec2 offset = norm * normOffsetLength;

  return normOffsetLength > 0.0
    ? texture2D(color, uv)
    : texture2D(color, -offset + uv);
}

void main() {
  vec2 fragPosition = transformScreenPosition(viewResolution, viewOffset, uv);

  // ..................................................

  // Base Color / Shift
  vec3 baseColor = sampleMirror(color, uv, mirrorAngle).rgb;
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
    float bandingSample = sampleMirror(banding, uv, mirrorAngle).a;
    bandingColor = hsv2rgb(vec3(
      baseColorHSV.r,
      baseColorHSV.g,
      bandingSample));
  }

  // Bloom
  // FIXME: Weird perf issues with sampling bloom blur
  // if (bloomIntensity > 0.0) {
  bloomColor = sampleMirror(bloom, uv, mirrorAngle).rgb;
  // }

  // ..................................................

  // Composite Base + Banding + Bloom
  vec3 outColor = mix(baseColor, bandingColor, bandingIntensity);// + bloomColor;

  // Edges
  // TODO: Parameterize individual edge channels
  if (edgesIntensity > 0.0) {
    vec4 edgesColorSample = sampleMirror(edges, uv, mirrorAngle);
    vec3 edgesColor = blendOverlay(outColor, edgesColorSample.rgb, 0.85);
    float edgesSample = edgesColorSample.a;
    float edgesAlpha = edgesIntensity * (1.0 - edgesSample);

    // Edge Channel Mapping
    vec3 edgesV0 = edgesColor;
    vec3 edgesV1 = 1.0 - edgesColor;

    outColor = blendOverlay(outColor, edgesV0, edgesAlpha);
    outColor = blendColorBurn(outColor, edgesV1, edgesAlpha);
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
  vec3 originDashColor = vec3(0.0);
  if (originAlpha > 0.0) {
    originDashColor = vec3(
      concentricDash(fragPosition, 0.15 / viewScale, 1.0) *
        0.035 * originAlpha);
  }

  // Vignette
  float vignetteFactor = mix(1.0,
    vignette(uv, vignetteParams.x, vignetteParams.y),
    vignetteParams.z);
  vec3 vignetteColor = vec3(vignetteFactor);

  // ..................................................

  // Fake DOF with Bloom + Vignette
  // TODO: Parameterize offset factor
  outColor = mix(bloomColor, outColor,
    smoothstep(0.5, 1.0, vignetteFactor));

  // Composite + Radial Grid + Noise + Vignette
  outColor = blendColorBurn(
    outColor + outColor * noiseColor + originDashColor,
    vignetteColor);

  if (watermarkIntensity > 0.0) {
    vec3 watermarkColor = texture2D(watermarkTexture, vec2(uv.x, 1.0 - uv.y)).rgb;
    outColor = blendOverlay(outColor, watermarkColor, watermarkIntensity) +
      watermarkColor * watermarkIntensity * 0.5;
  }

  // Apply LUT transform
  if (lutIntensity > 0.0) {
    outColor = mix(outColor, lutTransform(vec4(outColor, 1.0), lutTexture).rgb, lutIntensity);
  }

  gl_FragColor = vec4(outColor, 1.0);
}
