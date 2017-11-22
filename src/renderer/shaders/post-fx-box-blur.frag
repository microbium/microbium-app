precision highp float;
uniform sampler2D color;
uniform vec2 resolution;
varying vec2 uv;

#pragma glslify: boxBlur = require(./box-blur, R = BLUR_RADIUS)

void main() {
  vec3 colorBlur = boxBlur(color, uv, 1.0 / resolution);
  gl_FragColor = vec4(colorBlur, 1.0);
}
