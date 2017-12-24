precision highp float;
uniform sampler2D color;
uniform vec3 viewResolution; // [x, y, pxRatio]
varying vec2 uv;

#pragma glslify: boxBlur = require(./box-blur, R = BLUR_RADIUS)

void main() {
  vec3 colorBlur = boxBlur(color, uv, 1.0 / viewResolution.xy);
  gl_FragColor = vec4(colorBlur, 1.0);
}
