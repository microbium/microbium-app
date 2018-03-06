precision highp float;

uniform sampler2D color;
uniform sampler2D bloom;
uniform float bloomIntensity;
uniform vec3 colorShift; // [hue, saturation, value]
uniform float colorBandStep;
uniform float tick;

varying vec2 uv;

#pragma glslify: blendOverlay = require(glsl-blend/overlay)
#pragma glslify: rgb2hsv = require('./color/rgb2hsv')
#pragma glslify: hsv2rgb = require('./color/hsv2rgb')

// Create gradient banding
float bandGrad(float value, float step) {
  float scaled = value * step;
  return (scaled - mod(scaled, 1.0)) / step;
}

void main() {
  // Base Color
  vec4 sColor = texture2D(color, uv);

  // Color Shift
  vec3 hColor = rgb2hsv(sColor.rgb);
  vec4 fColor = vec4(hsv2rgb(
    vec3(fract(hColor.r + colorShift.r),
      clamp(hColor.g + colorShift.g, 0.0, 1.5),
      clamp(hColor.b + colorShift.b, 0.0, 1.0))),
      1.0);

  // Bloom
  vec4 fBloom = fColor * 0.4;
  if (bloomIntensity > 0.0) {
    fBloom = texture2D(bloom, uv) * bloomIntensity;
  }
  fColor += fBloom;
  hColor = rgb2hsv(fColor.rgb);

  // Banded Gradients
  vec4 fColorBand = vec4(
    hsv2rgb(vec3(hColor.r, hColor.g, bandGrad(hColor.b, colorBandStep))),
    1.0);

  gl_FragColor = vec4(
    mix(fColor.rgb, fColorBand.rgb, 0.6),
    1.0);
}
