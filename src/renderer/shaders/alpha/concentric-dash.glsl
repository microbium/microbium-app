float concentricDash (vec2 coord, float scale, float thickness) {
  float rcoord = length(coord) * scale;
  float line = abs(fract(rcoord - 0.5) - 0.5) / fwidth(rcoord);
  return clamp(
    thickness - min(line, thickness),
    0.0, 1.0);
}

#pragma glslify: export(concentricDash)
