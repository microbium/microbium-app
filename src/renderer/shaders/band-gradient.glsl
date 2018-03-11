// TODO: Smooth out band aliasing
float bandGradient(float value, float step) {
  float scaled = value * step;
  float diff = fract(scaled);
  return (scaled - diff) / step;
}

#pragma glslify: export(bandGradient)
