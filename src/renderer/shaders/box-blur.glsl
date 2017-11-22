vec3 boxBlur(sampler2D color, vec2 uv, vec2 sizeReciprocol) {
  float W =  float((1 + 2 * R) * (1 + 2 * R));
  vec3 avg = vec3(0.0);
  for (int x = -R; x <= +R; x++) {
    for (int y = -R; y <= +R; y++) {
    	vec2 uvOffset = vec2(float(x) * sizeReciprocol.x, float(y) * sizeReciprocol.y);
      avg += (1.0 / W) * texture2D(color, uv + uvOffset).rgb;
    }
  }
  return avg;
}

#pragma glslify: export(boxBlur)
