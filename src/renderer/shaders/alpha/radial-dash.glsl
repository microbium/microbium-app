float radialDash (vec2 coord, float steps, float scale, float thickness) {
  float rcoord = atan(coord.x, coord.y) * steps / PI * scale;
  float line = abs(fract(rcoord - 0.5) - 0.5) / fwidth(rcoord);
  float rthickness = thickness * length(coord) / steps;
  return clamp(0.0, 1.0,
  	rthickness - min(line, rthickness));
}

#pragma glslify: export(radialDash)
