float mapZ (vec2 pos, float id) {
  float offset = max(0.0, 1.0 - smoothstep(0.0, 100.0, length(pos)));
  float offset2 = offset * offset;
  return id * 2.0 + offset2 * 1000.0;
}

#pragma glslify: export(mapZ)
