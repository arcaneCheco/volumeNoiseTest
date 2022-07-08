   precision highp sampler3D;
  uniform vec3 cameraPos;
  varying vec3 vPosition;
  varying vec3 vOrigin;
  varying vec3 vDirection;
  varying vec2 vUv;
   varying vec3 vNormal;
  uniform float time;
  uniform sampler3D noise;

  float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

  void main() {
    vec3 newPos = position;
    float t = time;
    float distortion = texture(noise, vec3(position.x + sin(t * 0.2) * 0.5 + 0.5, position.y + sin(t*0.4) * 0.5 + 0.5, 0.4)).r * 0.3;
    newPos += (normal * distortion);
    vec4 worldPosition = modelViewMatrix * vec4(newPos, 1.);
    vPosition = position;
    vOrigin = vec3(inverse(modelMatrix) * vec4(cameraPos, 1.)).xyz;
    vDirection = position - vOrigin;
    vNormal = normal;
    vUv = uv;
    gl_Position = projectionMatrix * worldPosition;
  }