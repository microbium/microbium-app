precision highp float;

uniform sampler2D color;
uniform sampler2D displace;
uniform int useDisplace;
uniform float displaceOffset;

uniform vec2 offset;
uniform float scale;

varying vec2 uv;

void main() {
  vec2 fuv = uv;

  if (useDisplace == 1) {
    float dStrength = texture2D(displace, uv).r;
    vec2 dOffset = vec2(0.5 - uv) * dStrength * displaceOffset * 0.1;
    fuv = uv + dOffset;
  }

  vec4 outColor = texture2D(color, fuv);

  gl_FragColor = outColor;
}
