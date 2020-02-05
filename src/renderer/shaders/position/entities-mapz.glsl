float mapZ (vec3 pos, vec3 depth, float id) {
  float offset = depth.x;
  float scale = depth.y;
  float polarOffset = depth.z;

  return offset + polarOffset + pos.z * scale;
}

#pragma glslify: export(mapZ)
