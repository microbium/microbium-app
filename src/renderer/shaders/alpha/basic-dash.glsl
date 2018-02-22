float basicDash (vec3 udo, float scale, float thickness) {
  float rcoord = udo.y * scale;
  float line = abs(fract(rcoord - 0.5) - 0.5) / fwidth(rcoord);
  return clamp(
    thickness - min(line, thickness),
    0.0, 1.0);
}

#pragma glslify: export(basicDash)
