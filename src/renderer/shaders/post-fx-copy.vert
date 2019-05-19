precision highp float;
uniform float scale;
uniform vec2 offset;
attribute vec2 position;
varying vec2 uv;

void main() {
  uv = (0.5 * (position + 1.0) + offset) * scale + (1.0 - scale) * 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
