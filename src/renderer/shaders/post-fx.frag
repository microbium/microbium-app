#extension GL_OES_standard_derivatives : enable

precision highp float;

#define PI 3.141592653589793

uniform sampler2D color;
uniform float noiseIntensity;

uniform float tick;
uniform vec3 viewResolution; // [x, y, pxRatio]
uniform vec2 viewOffset;

varying vec2 uv;

#pragma glslify: blendColorBurn = require(glsl-blend/color-burn)
#pragma glslify: blendOverlay = require(glsl-blend/overlay)

#pragma glslify: random = require(glsl-random)
#pragma glslify: concentricDash = require(./alpha/concentric-dash, fwidth=fwidth, PI=PI)
#pragma glslify: vignette = require(./vignette)
#pragma glslify: edgeDetect = require(./edge-frei-chen)
#pragma glslify: rgb2hsv = require('./color/rgb2hsv')
#pragma glslify: hsv2rgb = require('./color/hsv2rgb')

void main() {
  // OPTIM: Improve viewResolution density mapping ..
  vec2 fragCoord = gl_FragCoord.xy / viewResolution.z;
  vec2 fragCenter = fragCoord - viewResolution.xy / viewResolution.z * 0.5;
  vec2 fragPosition = fragCenter - vec2(viewOffset.x, -viewOffset.y);

  // Base Color (shifted / banded in pre-pass)
  vec4 fColor = texture2D(color, uv);
  vec3 hColor = rgb2hsv(fColor.rgb);

  // Noise
  vec4 fNoise = vec4(0.0);
  if (noiseIntensity > 0.0) {
    float nx = random(fract(uv + tick * 0.001));
    fNoise = vec4(clamp(0.1 + nx, 0.0, 1.0) * 2.0 - 1.0) * noiseIntensity;
  }

  float nEdges = edgeDetect(color, uv, viewResolution.xy);
  vec4 fColorBandEdge = vec4(
    hsv2rgb(vec3(hColor.r, hColor.g, nEdges)),
    1.0);
  fColorBandEdge.rgb = blendOverlay(fColor.rgb, fColorBandEdge.rgb, 0.85);
  vec3 hColorBandEdge = rgb2hsv(fColorBandEdge.rgb);

  // Origin Concentric Grid
  vec4 fDash = vec4(0.0);
  // vec4 fDash = 0.05 * vec4(
  //   vec3(concentricDash(fragPosition, 0.15, 1.0)),
  //   1.0);

  // Vignette
  vec4 fVignette = vec4(1.0);
  // vec4 fVignette = vec4(
  //   vec3(vignette(uv, 0.7, 0.4)),
  //   0.0);

  // gl_FragColor = vec4(blendColorBurn(
  //   (fColor + (fColor * fNoise) + fDash + fBloom).rgb,
  //   (fVignette).rgb), 1.0);

  // gl_FragColor = fColorBandEdge;
  gl_FragColor = vec4(vec3(smoothstep(0.8, 1.0, hColorBandEdge.r)), 1.0);

  // gl_FragColor = vec4(vec3(smoothstep(0.55, 1.0, hColorBandEdge.r)), 1.0);
  // gl_FragColor = vec4(vec3(smoothstep(0.285, 0.575, hColorBandEdge.g)), 1.0);
  // gl_FragColor = vec4(vec3(smoothstep(0.0, 0.25, hColorBandEdge.b)), 1.0);
}
