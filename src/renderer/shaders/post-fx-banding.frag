precision highp float;

uniform sampler2D color;
uniform float bandingStep;
uniform float tick;

varying vec2 uv;

#pragma glslify: blendOverlay = require(glsl-blend/overlay)
#pragma glslify: bandGradient = require(./band-gradient)
#pragma glslify: rgb2hsv = require(./color/rgb2hsv)
#pragma glslify: hsv2rgb = require(./color/hsv2rgb)

void main() {
  // TODO: Maybe multiply with bloom
  // Base Color / Shift
  vec3 baseColor = texture2D(color, uv).rgb * 1.4;
  vec3 baseColorHSV = rgb2hsv(baseColor);

  // Banded Gradients
  float bandingSample = bandGradient(baseColorHSV.b, bandingStep);
  vec3 bandingColor = hsv2rgb(vec3(baseColorHSV.r, baseColorHSV.g, bandingSample));

  gl_FragColor = vec4(bandingColor, 1.0);
}
