float lateralDash (vec3 udo, float  scale, float thickness) {
  float PI_2 = PI / 2.0;
  vec2 coord = vec2(
    (udo.x + 1.0) * 0.5,
    udo.y);

  float rcoord = coord.x * scale;
  float line = abs(fract(rcoord - 0.5) - 0.5) / fwidth(rcoord);
  return clamp(
    thickness - min(line, thickness),
    0.0, 1.0);
}

#pragma glslify: export(lateralDash)
