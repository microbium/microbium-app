float vignette(vec2 coord, float radius, float smoothness) {
	float diff = radius - distance(coord, vec2(0.5, 0.5));
	return smoothstep(-smoothness, smoothness, diff);
}

#pragma glslify: export(vignette)
