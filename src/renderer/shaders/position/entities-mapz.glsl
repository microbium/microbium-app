float mapZ (vec3 pos, float depth, float id) {
  return pos.z * depth + depth;
}

#pragma glslify: export(mapZ)
