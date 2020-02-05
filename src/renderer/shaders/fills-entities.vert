precision highp float;

#pragma glslify: transformPosition = require(./position/entities-transform)
#pragma glslify: mapZ = require(./position/entities-mapz)

uniform mat4 projection;
uniform int projectionMode;
uniform mat4 model;
uniform mat4 view;

uniform vec4 tint;
uniform vec3 mirror; // [x, y, alpha]

uniform vec3 depth; // [offset, scale, polarOffset]
uniform int useDepthMap;
uniform sampler2D depthMap;
uniform vec2 depthMapParams; // [repeat, displacement]

uniform float angle;
uniform float angleAlpha;

attribute vec3 position;
attribute vec4 color;
attribute float id;

varying vec4 vColor;
varying float vId;

void main() {
  mat4 projViewModel = projection * view * model;
  vec4 posProjected = projViewModel *
    vec4(transformPosition(position.xy, mirror.xy, angle),
      mapZ(position, depth, useDepthMap, depthMap, depthMapParams, id), 1.0);

  vColor = vec4(tint.rgb * color.rgb, tint.a * color.a * mirror.z * angleAlpha);
  vId = id;

  if (projectionMode == 0) {
    posProjected *= vec4(0.5, 0.5, 0.5, 1.0);
  }

  gl_Position = posProjected;
}
