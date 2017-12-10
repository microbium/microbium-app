float bulgingDash (
  vec3 udo,
  float repeat, float offset,
  float shapeStart, float shapeEnd
) {
  vec2 coord = vec2(
    (udo.x + 1.0) * 0.5,
    sin((udo.y - offset) * 0.2) * 0.5 + 0.5);

  float lineWidth = max(0.0, sin(coord.x * PI)) *
    (1.0 - sin(coord.x * PI) * 0.25);
  float lineStep = sin((coord.y * PI) * repeat) *
    (shapeEnd - shapeStart) + shapeStart;
  float line = pow(smoothstep(1.0 - lineWidth, 1.0, lineStep), 0.5);

  return smoothstep(0.0, 1.0, line);
}

#pragma glslify: export(bulgingDash)
