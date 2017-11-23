#extension GL_OES_standard_derivatives : enable

precision highp float;

uniform vec2 viewResolution;
uniform vec2 viewOffset;

varying vec4 vColor;
varying vec2 vUD;

#pragma glslify: lineAntialiasAlpha = require(./line-antialias-alpha, fwidth=fwidth)

void main() {
  vec2 ud = vUD;
  vec3 outColor = vColor.rgb;
  float outAlpha = vColor.a * lineAntialiasAlpha(ud.x);

  gl_FragColor = vec4(outColor, outAlpha);
}
