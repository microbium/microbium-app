#extension GL_OES_standard_derivatives : enable

precision highp float;

#define PI 3.141592653589793

uniform vec2 viewResolution;
uniform vec2 viewOffset;
uniform float tick;

uniform sampler2D diffuseMap;
uniform sampler2D alphaMap;
uniform int dashFunction;
uniform int useDiffuseMap;
uniform int useAlphaMap;
uniform int useScreenTintFunc;

varying vec4 vColor;
varying vec3 vUDO;

#pragma glslify: lineAntialiasAlpha = require(./line-antialias-alpha, fwidth=fwidth)

float radialDash (vec2 coord, float steps, float scale, float thickness) {
  float rcoord = atan(coord.x, coord.y) * steps / PI * scale;
  float line = abs(fract(rcoord - 0.5) - 0.5) / fwidth(rcoord);
  float rthickness = thickness * length(coord) / steps;
  return rthickness - min(line, rthickness);
}

float concentricDash (vec2 coord, float scale, float thickness) {
  float rcoord = length(coord) * scale;
  float line = abs(fract(rcoord - 0.5) - 0.5) / fwidth(rcoord);
  return thickness - min(line, thickness);
}

float bulgingDash (
  vec3 udo,
  float repeat, float offset,
  float shapeStart, float shapeEnd
) {
  vec2 coord = vec2(
    (udo.x + 1.0) * 0.5,
    sin((udo.y - offset) * 0.2) * 0.5 + 0.5);

  float lineWidth = max(0.0, sin(coord.x * PI)) *
    (1.0 - sin(coord.x * PI) * 0.25);
  float lineStep = sin((coord.y * PI) * repeat) *
    (shapeEnd - shapeStart) + shapeStart;
  float line = pow(smoothstep(1.0 - lineWidth, 1.0, lineStep), 0.5);

  return smoothstep(0.0, 1.0, line);
}

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  vec2 fragCenter = fragCoord - viewResolution * 0.5;
  vec2 position = fragCenter - vec2(viewOffset.x, -viewOffset.y);
  vec2 coord = fragCoord / viewResolution;
  vec3 udo = vUDO;

  vec3 outColor = vColor.rgb;
  float outAlpha = vColor.a * lineAntialiasAlpha(udo.x);

  if (useDiffuseMap == 1) {
    outColor *= texture2D(diffuseMap, coord).rgb;
  }

  if (useScreenTintFunc == 1) {
    outColor *= vec3(coord.x, 0.6 - distance(coord, vec2(0.5)), coord.y);
  }

  if (useAlphaMap == 1) {
    vec2 alphaMapCoords = vec2(
      abs(udo.x),
      fract(udo.y / 40.0) * 0.8 + 0.1);
    float alphaMapValue = texture2D(alphaMap, alphaMapCoords).r;
    outAlpha *= alphaMapValue;// * smoothstep(0.0, 2.0, 1.0 - alphaMapCoords.x);
  }

  if (dashFunction == 1) {
    outAlpha *= radialDash(position, 800.0, 0.1, 10.0);
  } else if (dashFunction == 2) {
    outAlpha *= concentricDash(position, 0.1, 3.0);
  } else if (dashFunction == 3) {
    outAlpha *= bulgingDash(udo, 2.0, tick, 0.4, 1.0);
  }

  gl_FragColor = vec4(outColor, outAlpha);
}
