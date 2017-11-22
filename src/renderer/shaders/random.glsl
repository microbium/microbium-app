float random (const in vec2 uv) {
  const highp float PI = 3.141592653589793;
  const highp float a = 12.9898, b = 78.233, c = 43758.5453;
  highp float dt = dot(uv.xy, vec2(a, b)), sn = mod(dt, PI);
  return fract(sin(sn) * c);
}

#pragma glslify: export(random)
