precision highp float;

uniform sampler2D color;
uniform float tick;
uniform vec3 viewResolution; // [x, y, pxRatio]

varying vec2 uv;

#pragma glslify: blendOverlay = require(glsl-blend/overlay)
#pragma glslify: edgeDetect = require(./edge-frei-chen)
#pragma glslify: rgb2hsv = require(./color/rgb2hsv)
#pragma glslify: hsv2rgb = require(./color/hsv2rgb)

void main() {
  // Base Color / Shift
  vec3 baseColor = texture2D(color, uv).rgb * 1.4;
  vec3 baseColorHSV = rgb2hsv(baseColor);

  // Edge Detection
  // TODO: Maybe move blending to main post-fx pass ..
  float edgesSample = edgeDetect(color, uv, viewResolution.xy);
  vec3 edgesColor = hsv2rgb(vec3(baseColorHSV.r, baseColorHSV.g, edgesSample));
  edgesColor = blendOverlay(baseColor, edgesColor, 0.85);

  gl_FragColor = vec4(edgesColor, 1.0);
}
