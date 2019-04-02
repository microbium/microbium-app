#extension GL_OES_standard_derivatives : enable

precision highp float;

uniform sampler2D color;
uniform float thickness;
uniform float tick;
uniform vec3 viewResolution; // [x, y, pxRatio]

varying vec2 uv;

#pragma glslify: rgb2hsv = require(./color/rgb2hsv)
#pragma glslify: hsv2rgb = require(./color/hsv2rgb)

float edgeDetect (float f, float width, float feather) {
  float w1 = width - feather * 0.5;
  float d = length(vec2(dFdx(f), dFdy(f)));

  f = 0.5 - abs(mod(f, 1.0) - 0.5);
  return smoothstep(d * w1, d * (w1 + feather), f);
}

void main() {
  // Base Color
  vec3 baseColor = texture2D(color, uv).rgb;
  vec3 baseColorHSV = rgb2hsv(baseColor);

  // Edge Detection
  float edgesSample = edgeDetect(baseColorHSV.b / 0.05, thickness, 0.75);
  vec3 edgesColor = hsv2rgb(vec3(baseColorHSV.r, baseColorHSV.g, edgesSample));

  gl_FragColor = vec4(edgesColor, edgesSample);
}
