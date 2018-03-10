vec3 brightnessContrast(vec3 color, float brightness, float contrast) {
  return (color - 0.5) * contrast + 0.5 + brightness;
}

#pragma glslify: export(brightnessContrast)
