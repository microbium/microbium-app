uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;
attribute vec3 position;

void main() {
  gl_Position = projection * view * model * vec4(position, 1.0);
}
