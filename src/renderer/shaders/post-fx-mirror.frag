precision highp float;

uniform sampler2D color;
uniform vec3 viewResolution; // [x, y, pxRatio]

varying vec2 uv;

void main() {
  vec2 muv = vec2(1.0 - uv.x, uv.y);

  gl_FragColor = mix(
    texture2D(color, uv),
    texture2D(color, muv), 0.15);
}
