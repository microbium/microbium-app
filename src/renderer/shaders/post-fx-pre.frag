precision highp float;

uniform sampler2D color;
uniform sampler2D bloom;
uniform float bloomIntensity;
uniform vec3 colorShift; // [hue, saturation, value]
uniform float colorBandStep;
uniform float tick;

varying vec2 uv;

#pragma glslify: blendOverlay = require(glsl-blend/overlay)
#pragma glslify: bandGradient = require(./band-gradient)
#pragma glslify: rgb2hsv = require(./color/rgb2hsv)
#pragma glslify: hsv2rgb = require(./color/hsv2rgb)

const float bandingMixFactor = 0.6;

void main() {
  // Base Color / Shift
  vec3 baseColor = texture2D(color, uv).rgb;
  vec3 baseColorHSV = rgb2hsv(baseColor);
  baseColor = hsv2rgb(
    vec3(fract(baseColorHSV.r + colorShift.r),
      clamp(baseColorHSV.g + colorShift.g, 0.0, 1.5),
      clamp(baseColorHSV.b + colorShift.b, 0.0, 1.0)));

  // Bloom
  vec3 bloomColor = baseColor * 0.4;
  if (bloomIntensity > 0.0) {
    bloomColor = texture2D(bloom, uv).rgb * bloomIntensity;
  }
  baseColor += bloomColor;
  baseColorHSV = rgb2hsv(baseColor);

  // Banded Gradients
  float bandingSample = bandGradient(baseColorHSV.b, colorBandStep);
  vec3 bandingColor = hsv2rgb(vec3(baseColorHSV.r, baseColorHSV.g, bandingSample));

  // Composite
  vec3 outColor = mix(baseColor, bandingColor, bandingMixFactor);

  gl_FragColor = vec4(outColor, 1.0);
}
