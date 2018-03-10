precision highp float;

uniform sampler2D color;
// uniform float bandingBrightness;
uniform float bandingStep;
uniform float tick;

varying vec2 uv;

#pragma glslify: bandGradient = require(./band-gradient)
#pragma glslify: brightnessContrast = require(./color/brightness-contrast)
#pragma glslify: rgb2hsv = require(./color/rgb2hsv)
#pragma glslify: hsv2rgb = require(./color/hsv2rgb)

void main() {
  // TODO: Maybe multiply with bloom
  // Base Color
  vec3 baseColor = brightnessContrast(
    texture2D(color, uv).rgb * 1.4,
    0.0, 1.0);
  vec3 baseColorHSV = rgb2hsv(baseColor);

  // Banded Gradients
  float bandingSample = bandGradient(baseColorHSV.b, bandingStep);
  vec3 bandingColor = hsv2rgb(vec3(baseColorHSV.r, baseColorHSV.g, bandingSample));

  gl_FragColor = vec4(bandingColor, bandingSample);
}
