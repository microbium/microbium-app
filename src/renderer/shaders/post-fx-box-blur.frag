precision highp float;
uniform sampler2D color;
uniform vec3 viewResolution; // [x, y, pxRatio]
varying vec2 uv;

#pragma glslify: boxBlur = require(./box-blur, R = BLUR_RADIUS)

void main() {
  gl_FragColor = vec4(
  	boxBlur(color, uv, 1.0 / viewResolution.xy),
  	1.0);
}
