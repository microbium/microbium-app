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

  if (useDepthMap == 1) {
    vec2 depthCoord = pos.xy / depthMapParams.x;
    float depthDisplacement = depthMapParams.y;
    mapDepth = texture2D(depthMap, depthCoord).r * depthDisplacement;
  }

  return offset + polarOffset + mapDepth + pos.z * scale;
}

#pragma glslify: export(mapZ)
