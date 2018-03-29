#extension GL_OES_standard_derivatives : enable

precision highp float;

#define PI 3.141592653589793

uniform vec3 viewResolution; // [x, y, pxRatio]
uniform vec2 viewOffset;
uniform float tick;

// uniform sampler2D diffuseMap;
// uniform sampler2D alphaMap;
uniform int dashFunction;
// uniform int useDiffuseMap;
// uniform int useAlphaMap;
// uniform int useScreenTintFunc;

varying vec4 vColor;
varying vec3 vUDO; // [u, distance, offset]

#pragma glslify: lineAntialiasAlpha = require(./line-antialias-alpha, fwidth=fwidth)
#pragma glslify: basicDash = require(./alpha/basic-dash, fwidth=fwidth, PI=PI)
#pragma glslify: radialDash = require(./alpha/radial-dash, fwidth=fwidth, PI=PI)
#pragma glslify: concentricDash = require(./alpha/concentric-dash, fwidth=fwidth, PI=PI)
#pragma glslify: bulgingDash = require(./alpha/bulging-dash, fwidth=fwidth, PI=PI)
#pragma glslify: lateralDash = require(./alpha/lateral-dash, fwidth=fwidth, PI=PI)
#pragma glslify: wavyDash = require(./alpha/wavy-dash, fwidth=fwidth, PI=PI)

float sampleAlphaMap (vec3 udo, sampler2D map) {
  vec2 coords = vec2(
    abs(udo.x),
    fract(udo.y / 40.0) * 0.8 + 0.1);
  return texture2D(map, coords).r; // * smoothstep(0.0, 2.0, 1.0 - coords.x);
}

void main() {
  vec2 fragCoord = gl_FragCoord.xy / viewResolution.z;
  vec2 fragCenter = fragCoord - viewResolution.xy / viewResolution.z * 0.5;
  vec2 position = fragCenter - vec2(viewOffset.x, -viewOffset.y);
  vec2 coord = fragCoord / viewResolution.xy;
  vec3 udo = vUDO;

  vec3 outColor = vColor.rgb;
  float outAlpha = vColor.a * lineAntialiasAlpha(udo.x);

  // if (useDiffuseMap == 1) {
  //   outColor *= texture2D(diffuseMap, coord).rgb;
  // }

  // if (useScreenTintFunc == 1) {
  //   outColor *= vec3(coord.x, 0.6 - distance(coord, vec2(0.5)), coord.y);
  // }

  // if (useAlphaMap == 1) {
  //   outAlpha *= sampleAlphaMap(udo, alphaMap);
  // }

  if (dashFunction == 1) {
    outAlpha *= radialDash(position, 800.0, 0.1, 10.0);
  } else if (dashFunction == 2) {
    outAlpha *= concentricDash(position, 0.1, 3.0);
  } else if (dashFunction == 3) {
    outAlpha *= basicDash(udo, 0.1, 3.0);
  } else if (dashFunction == 4) {
    outAlpha *= bulgingDash(udo, 1.5, -tick * 0.5, 0.35, 0.9);
  } else if (dashFunction == 5) {
    outAlpha *= wavyDash(udo, 2.0, -tick * 0.5, 0.05, 0.95);
  } else if (dashFunction == 6) {
    outAlpha *= lateralDash(udo, 1.0, 2.0);
  }

  gl_FragColor = vec4(outColor, outAlpha);
}
