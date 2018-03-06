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

// Create gradient banding
float bandGrad(float value, float step) {
  float scaled = value * step;
  return (scaled - mod(scaled, 1.0)) / step;
}

void main() {
  // Base Color / Shift
  vec4 baseColor = texture2D(color, uv);
  vec3 baseColorHSV = rgb2hsv(baseColor.rgb);
  baseColor.rgb = hsv2rgb(
    vec3(fract(baseColorHSV.r + colorShift.r),
      clamp(baseColorHSV.g + colorShift.g, 0.0, 1.5),
      clamp(baseColorHSV.b + colorShift.b, 0.0, 1.0)));

  // Bloom
  vec4 bloomColor = baseColor * 0.4;
  if (bloomIntensity > 0.0) {
    bloomColor = texture2D(bloom, uv) * bloomIntensity;
  }
  baseColor += bloomColor;
  baseColorHSV = rgb2hsv(baseColor.rgb);

  // Banded Gradients
  float bandingSample = bandGradient(baseColorHSV.b, colorBandStep);
  vec4 bandingColor = vec4(
    hsv2rgb(vec3(baseColorHSV.r, baseColorHSV.g, bandingSample)),
    1.0);

  gl_FragColor = vec4(
    mix(baseColor.rgb, bandingColor.rgb, 0.6),
    1.0);
}
