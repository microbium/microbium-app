// Edge Detection Shader using Frei-Chen filter
// Based on http://rastergrid.com/blog/2011/01/frei-chen-edge-detector
// @author zz85 / https://github.com/zz85 | https://www.lab4games.net/zz85/blog

// Hard coded matrix values as suggested in
// https://github.com/neilmendoza/ofxPostProcessing/blob/master/src/EdgePass.cpp#L45
mat3 G[9];
const float gN0 = 0.3535533845424652;
const float gN1 = 0.1666666716337204;
const float gN2 = 0.3333333432674408;
const float gN3 = 0.6666666865348816;
const mat3 g0 = mat3(gN0, 0, -gN0, 0.5, 0, -0.5, gN0, 0, -gN0);
const mat3 g1 = mat3(gN0, 0.5, gN0, 0, 0, 0, -gN0, -0.5, -gN0);
const mat3 g2 = mat3(0, gN0, -0.5, -gN0, 0, gN0, 0.5, -gN0, 0);
const mat3 g3 = mat3(0.5, -gN0, 0, -gN0, 0, gN0, 0, gN0, -0.5);
const mat3 g4 = mat3(0, -0.5, 0, 0.5, 0, 0.5, 0, -0.5, 0);
const mat3 g5 = mat3(-0.5, 0, 0.5, 0, 0, 0, 0.5, 0, -0.5);
const mat3 g6 = mat3(gN1, -gN2, gN1, -gN2, gN3, -gN2, gN1, -gN2, gN1);
const mat3 g7 = mat3(-gN2, gN1, -gN2, gN1, gN3, gN1, -gN2, gN1, -gN2);
const mat3 g8 = mat3(gN2, gN2, gN2, gN2, gN2, gN2, gN2, gN2, gN2);

float edge(sampler2D color, vec2 uv, vec2 resolution) {
  G[0] = g0,
  G[1] = g1,
  G[2] = g2,
  G[3] = g3,
  G[4] = g4,
  G[5] = g5,
  G[6] = g6,
  G[7] = g7,
  G[8] = g8;

  vec2 texel = vec2(1.0 / resolution.x, 1.0 / resolution.y);
  mat3 I;
  float cnv[9];
  vec3 sample;

  // Fetch the 3x3 neighbourhood and use the RGB vector's length as intensity value
  for (float i = 0.0; i < 3.0; i++) {
    for (float j = 0.0; j < 3.0; j++) {
      sample = (texture2D(color, uv + texel * vec2(i-1.0,j-1.0))).rgb;
      I[int(i)][int(j)] = length(sample);
    }
  }

  // Calculate the convolution values for all the masks
  for (int i = 0; i < 9; i++) {
    float dp3 = dot(G[i][0], I[0]) + dot(G[i][1], I[1]) + dot(G[i][2], I[2]);
    cnv[i] = dp3 * dp3;
  }

  float M = (cnv[0] + cnv[1]) + (cnv[2] + cnv[3]);
  float S = (cnv[4] + cnv[5]) + (cnv[6] + cnv[7]) + (cnv[8] + M);

  return sqrt(M/S);
}

#pragma glslify: export(edge)
