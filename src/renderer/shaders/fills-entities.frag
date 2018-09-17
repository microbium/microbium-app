#extension GL_OES_standard_derivatives : enable

precision highp float;

#define PI 3.141592653589793

uniform vec3 viewResolution; // [x, y, pxRatio]
uniform vec2 viewOffset;
uniform float tick;

uniform int dashFunction;

varying vec4 vColor;
// varying vec3 vUDO; // [u, distance, offset]

#pragma glslify: radialDash = require(./alpha/radial-dash, fwidth=fwidth, PI=PI)
#pragma glslify: concentricDash = require(./alpha/concentric-dash, fwidth=fwidth, PI=PI)

void main() {
  vec2 fragCoord = gl_FragCoord.xy / viewResolution.z;
  vec2 fragCenter = fragCoord - viewResolution.xy / viewResolution.z * 0.5;
  vec2 fragPosition = fragCenter - vec2(viewOffset.x, -viewOffset.y);
  vec2 coord = fragCoord / viewResolution.xy;
  // vec3 udo = vUDO;

  vec3 outColor = vColor.rgb;
  float outAlpha = vColor.a;

  if (dashFunction == 1) {
    outAlpha *= radialDash(fragPosition, 800.0, 0.1, 10.0);
  } else if (dashFunction == 2) {
    outAlpha *= concentricDash(fragPosition, 0.1, 3.0);
  }

  gl_FragColor = vec4(outColor, outAlpha);
}
