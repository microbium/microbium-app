float wavyDash (
  vec3 udo,
  float repeat, float offset,
  float shapeStart, float shapeEnd
) {
  float PI_2 = PI / 2.0;
  vec2 coord = vec2(
    (udo.x + 1.0) * 0.5,
    udo.y);

  float lineWidth = max(0.0, sin(coord.y * 0.2) * 0.4 + 0.5);
  float offsetX = sin(coord.y * 0.2) *
    (sin(offset * 0.025) * 0.1 + 0.2);
  float lineStep = sin(((coord.x + offsetX) * PI + PI_2 * 1.2) * repeat) *
    (shapeEnd - shapeStart) + shapeStart;
  float line = pow(smoothstep(1.0 - lineWidth, 1.0, lineStep), 0.5);

  return smoothstep(0.0, 1.0, line);
}

#pragma glslify: export(wavyDash)
