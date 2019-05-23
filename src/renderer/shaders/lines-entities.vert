precision highp float;

#pragma glslify: computeMiterOffset = require(regl-line-builder/src/shaders/compute-miter-offset)
#pragma glslify: transformPosition = require(./position/entities-transform)
#pragma glslify: mapZ = require(./position/entities-mapz)

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

attribute float prevId;
attribute float currId;
attribute float nextId;

attribute float offset;
attribute vec4 color;
attribute vec2 ud;

attribute float angle;
attribute float angleAlpha;

varying vec4 vColor;
varying vec3 vUDO;

void main() {
  mat4 projViewModel = projection * view * model;

  vec4 prevProjected = projViewModel *
    vec4(transformPosition(prevPosition, mirror.xy, angle), mapZ(prevPosition, prevId), 1.0);
  vec4 currProjected = projViewModel *
    vec4(transformPosition(currPosition, mirror.xy, angle), mapZ(currPosition, currId), 1.0);
  vec4 nextProjected = projViewModel *
    vec4(transformPosition(nextPosition, mirror.xy, angle), mapZ(nextPosition, nextId), 1.0);

  vec2 miterOffset = computeMiterOffset(
    projection, adjustProjectedThickness,
    aspect, thickness, miterLimit,
    prevId, currId, nextId,
    prevProjected, currProjected, nextProjected);
  vec2 positionOffset = miterOffset * offset;
  vec4 position = currProjected + vec4(positionOffset, 0.0, 1.0);

  vColor = vec4(tint.rgb * color.rgb, tint.a * color.a * mirror.z * angleAlpha);
  vUDO = vec3(ud, length(positionOffset));

  gl_Position = position;
}
