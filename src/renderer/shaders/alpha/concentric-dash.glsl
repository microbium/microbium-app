float concentricDash (vec2 coord, float scale, float thickness) {
  float rcoord = length(coord) * scale;
  float line = abs(fract(rcoord - 0.5) - 0.5) / fwidth(rcoord);
  return clamp(0.0, 1.0,
  	thickness - min(line, thickness));
}

#pragma glslify: export(concentricDash)
