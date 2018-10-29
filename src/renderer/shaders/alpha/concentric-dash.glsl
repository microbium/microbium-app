float concentricDash (vec2 coord, float scale, float thickness, vec2 origin, float radius) {
  float lcoord = length(coord - origin);
  float rcoord = lcoord * scale;
  float line = abs(fract(rcoord - 0.5) - 0.5) / fwidth(rcoord);

  float lineFactor = clamp(thickness - min(line, thickness), 0.0, 1.0);
  float radiusFactor = radius == -1.0 ? 1.0 : (1.0 - smoothstep(0.8, 1.1, lcoord / radius));
  return lineFactor * radiusFactor;
}

float concentricDash (vec2 coord, float scale, float thickness) {
  return concentricDash(coord, scale, thickness, vec2(0.0), -1.0);
}

#pragma glslify: export(concentricDash)
