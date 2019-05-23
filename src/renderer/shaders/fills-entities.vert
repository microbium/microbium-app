precision highp float;

#pragma glslify: transformPosition = require(./position/entities-transform)
#pragma glslify: mapZ = require(./position/entities-mapz)

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;

uniform vec4 tint;
uniform vec3 mirror; // [x, y, alpha]

attribute vec2 position;
attribute vec4 color;
attribute float id;

attribute float angle;
attribute float angleAlpha;

varying vec4 vColor;
varying float vId;

void main() {
  mat4 projViewModel = projection * view * model;
  vec4 posProjected = projViewModel *
    vec4(transformPosition(position, mirror.xy, angle), mapZ(position, id), 1.0);

  vColor = vec4(tint.rgb * color.rgb, tint.a * color.a * mirror.z * angleAlpha);
  vId = id;

  gl_Position = posProjected * vec4(0.5, 0.5, 0.0, 1.0);
}
