precision highp float;
uniform sampler2D color;
uniform vec3 viewResolution; // [x, y, pxRatio]
uniform vec2 blurDirection;
varying vec2 uv;

#pragma glslify: gaussBlur = require(glsl-fast-gaussian-blur/9)

void main() {
  gl_FragColor = gaussBlur(color, uv, viewResolution.xy, blurDirection);
}
