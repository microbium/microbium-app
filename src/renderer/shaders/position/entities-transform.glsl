vec2 transformPosition (vec2 position, vec2 mirror, float angle) {
  return vec2(
    (+cos(angle) * position.x + position.y * sin(angle)) * mirror.x,
    (-sin(angle) * position.x + position.y * cos(angle)) * mirror.y);
}

#pragma glslify: export(transformPosition)
