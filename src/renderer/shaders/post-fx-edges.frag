precision highp float;

uniform sampler2D color;
uniform float thickness;
uniform float tick;
uniform vec3 viewResolution; // [x, y, pxRatio]

varying vec2 uv;

#pragma glslify: edgeDetect = require(./edge-frei-chen)
#pragma glslify: rgb2hsv = require(./color/rgb2hsv)
#pragma glslify: hsv2rgb = require(./color/hsv2rgb)

void main() {
  // Base Color
  vec3 baseColor = texture2D(color, uv).rgb;
  vec3 baseColorHSV = rgb2hsv(baseColor);

  // Edge Detection
  float edgesSample = edgeDetect(color, uv, viewResolution.xy, thickness);
  vec3 edgesColor = hsv2rgb(vec3(baseColorHSV.r, baseColorHSV.g, edgesSample));

  gl_FragColor = vec4(edgesColor, edgesSample);
}
