precision mediump float;
uniform sampler2D color;
varying vec2 uv;
void main() {
  gl_FragColor = texture2D(color, uv);
}
