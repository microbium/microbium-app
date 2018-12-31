precision highp float;

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
  vec4 posProjected = projViewModel *
    vec4(transformPosition(position, mirror.xy, angle), mapZ(position), 1.0);

  vColor = vec4(tint.rgb * color.rgb, tint.a * color.a * mirror.z * angleAlpha);
  vId = id;

  gl_Position = posProjected * vec4(0.5, 0.5, 0.0, 1.0);
}
