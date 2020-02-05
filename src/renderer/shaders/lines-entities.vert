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
uniform vec3 depth; // [offset, scale, polarOffset]

uniform float angle;
uniform float angleAlpha;

attribute vec3 prevPosition;
attribute vec3 currPosition;
attribute vec3 nextPosition;

attribute float prevId;
attribute float currId;
attribute float nextId;

attribute float offset;
attribute vec4 color;
attribute vec2 ud;

varying vec4 vColor;
varying vec3 vUDO;

void main() {
  mat4 projViewModel = projection * view * model;

  vec4 prevProjected = projViewModel *
    vec4(transformPosition(prevPosition.xy, mirror.xy, angle),
      mapZ(prevPosition, depth, prevId), 1.0);
  vec4 currProjected = projViewModel *
    vec4(transformPosition(currPosition.xy, mirror.xy, angle),
      mapZ(currPosition, depth, currId), 1.0);
  vec4 nextProjected = projViewModel *
    vec4(transformPosition(nextPosition.xy, mirror.xy, angle),
      mapZ(nextPosition, depth, nextId), 1.0);

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
