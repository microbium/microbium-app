// TODO: Apply antialiasing to line ends
float lineAntialiasAlpha (float coord) {
  float acoord = (coord + 1.0) / 2.0;
  return clamp(
    abs(fract(acoord - 0.5) - 0.5) / fwidth(acoord),
    0.0, 1.0);
}

#pragma glslify: export(lineAntialiasAlpha)
