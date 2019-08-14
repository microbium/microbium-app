float mapZ (vec3 pos, float id) {
  // float offset = length(pos.xy);
  // float t = smoothstep(0.0, 1.0, offset / 1800.0);
  // float t0 = t * t;
  // float offset3 = sin(t * 4.0) * 300.0;
  // return -(offset * t0 * 0.4) + (offset3) + -(id * 16.0);
  return pos.z * 5.0;
}

#pragma glslify: export(mapZ)
