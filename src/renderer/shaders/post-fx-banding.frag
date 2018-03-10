precision highp float;

uniform sampler2D color;
uniform float bandingStep;
uniform float tick;

varying vec2 uv;

#pragma glslify: bandGradient = require(./band-gradient)
#pragma glslify: rgb2hsv = require(./color/rgb2hsv)
#pragma glslify: hsv2rgb = require(./color/hsv2rgb)

void main() {
  // Base Color
  vec3 baseColor = texture2D(color, uv).rgb;
  vec3 baseColorHSV = rgb2hsv(baseColor);

  // Banded Gradients
  float bandingSample = bandGradient(baseColorHSV.b, bandingStep);
  vec3 bandingColor = hsv2rgb(vec3(baseColorHSV.r, baseColorHSV.g, bandingSample));

  gl_FragColor = vec4(bandingColor, bandingSample);
}
