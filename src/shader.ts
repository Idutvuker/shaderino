// Simple fullscreen vertex shader (GLSL)
export const vertexShader = `
  precision highp float;
  // Attributes
  attribute vec3 position;
  attribute vec2 uv;
  // Uniforms
  uniform mat4 worldViewProjection;
  // Varyings
  varying vec2 vUV;
  void main(void) {
    vUV = uv;
    gl_Position = worldViewProjection * vec4(position, 1.0);
  }
`;

// Simple fullscreen fragment shader (GLSL)
export const fragmentShader = `
  precision highp float;
  varying vec2 vUV;
  uniform float iTime;
  void main(void) {
    vec2 uv = vUV;
    vec3 color = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));
    gl_FragColor = vec4(color,1.0);
  }
`;
