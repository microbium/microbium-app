float mapZ (vec3 pos, float depth, float id) {
  return pos.z * depth;
}

#pragma glslify: export(mapZ)
