// TODO: Apply antialiasing to line ends
float lineAntialiasAlpha (float coord) {
  float acoord = (coord + 1.0) / 2.0;
  return clamp(0.0, 1.0,
  	abs(fract(acoord - 0.5) - 0.5) / fwidth(acoord));
}

#pragma glslify: export(lineAntialiasAlpha)
