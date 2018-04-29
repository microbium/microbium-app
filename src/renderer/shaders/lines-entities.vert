precision highp float;

#pragma glslify: computeMiterOffset = require(regl-line-builder/src/shaders/compute-miter-offset)

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;
uniform float aspect;
uniform int adjustProjectedThickness;

uniform vec4 tint;
uniform float thickness;
uniform float miterLimit;
uniform vec3 mirror; // [x, y, alpha]

attribute vec2 prevPosition;
attribute vec2 currPosition;
attribute vec2 nextPosition;

attribute float offset;
attribute vec4 color;
attribute vec2 ud;

attribute float angle;
attribute float angleAlpha;

varying vec4 vColor;
varying vec3 vUDO;

vec2 transformPosition (vec2 position, vec2 mirror, float angle) {
  return vec2(
    (+cos(angle) * position.x + position.y * sin(angle)) * mirror.x,
    (-sin(angle) * position.x + position.y * cos(angle)) * mirror.y);
}

float mapZ (vec2 pos) {
  // float l = length(pos) * 0.01;
  // return l * l + 40.0;
  return 0.0;
}

void main() {
  mat4 projViewModel = projection * view * model;

  vec4 prevProjected = projViewModel *
    vec4(transformPosition(prevPosition, mirror.xy, angle), mapZ(prevPosition), 1.0);
  vec4 currProjected = projViewModel *
    vec4(transformPosition(currPosition, mirror.xy, angle), mapZ(currPosition), 1.0);
  vec4 nextProjected = projViewModel *
    vec4(transformPosition(nextPosition, mirror.xy, angle), mapZ(nextPosition), 1.0);

  vec2 miterOffset = computeMiterOffset(
    projection, adjustProjectedThickness,
    aspect, thickness, miterLimit,
    prevProjected, currProjected, nextProjected);
  vec2 positionOffset = miterOffset * offset;
  vec4 position = currProjected + vec4(positionOffset, 0.0, 1.0);

  vColor = vec4(tint.rgb * color.rgb, tint.a * color.a * mirror.z * angleAlpha);
  vUDO = vec3(ud, length(positionOffset));

  gl_Position = position;
}
