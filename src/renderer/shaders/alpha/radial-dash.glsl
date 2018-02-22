float radialDash (vec2 coord, float steps, float scale, float thickness) {
  float rcoord = atan(coord.x, coord.y) * steps / PI * scale;
  float line = abs(fract(rcoord - 0.5) - 0.5) / fwidth(rcoord);
  float rthickness = thickness * length(coord) / steps;
  return clamp(
    rthickness - min(line, rthickness),
    0.0, 1.0);
}

#pragma glslify: export(radialDash)
