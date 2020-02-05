float sampleDepthMap (vec3 pos, sampler2D map, float repeat) {
  vec2 coord = pos.xy / repeat;
  return texture2D(map, coord).r;
}

float mapZ (
  vec3 pos,
  vec3 depth,
  int useDepthMap,
  sampler2D depthMap,
  vec2 depthMapParams,
  float id
) {
  float offset = depth.x;
  float scale = depth.y;
  float polarOffset = depth.z;
  float mapDepth = 0.0;
  float mapDepthDisplacement = depthMapParams.y;

  if (useDepthMap == 1) {
    mapDepth = sampleDepthMap(pos, depthMap, depthMapParams.x);
  }

  return offset + polarOffset +
    mapDepth * mapDepthDisplacement +
    pos.z * scale;
}

#pragma glslify: export(mapZ)
