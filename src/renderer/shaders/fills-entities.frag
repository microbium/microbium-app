precision highp float;

uniform vec3 viewResolution; // [x, y, pxRatio]
uniform vec2 viewOffset;
uniform float tick;

varying vec4 vColor;

void main() {
  vec3 outColor = vColor.rgb;
  float outAlpha = vColor.a;

  gl_FragColor = vec4(outColor, outAlpha);
}
