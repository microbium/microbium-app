// TODO: Smooth out band aliasing
float bandGradient(float value, float step) {
  float scaled = value * step;
  return (scaled - mod(scaled, 1.0)) / step;
}

#pragma glslify: export(bandGradient)
