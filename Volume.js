import {
  Mesh,
  BoxBufferGeometry,
  Data3DTexture,
  RedFormat,
  FloatType,
  RawShaderMaterial,
  LinearFilter,
  Vector3,
  BackSide,
  Matrix4,
  Color,
  BoxGeometry,
  ShaderMaterial,
  MeshNormalMaterial,
  DoubleSide,
  SphereBufferGeometry,
  FrontSide,
} from "three";
import vertexShader from "./shaders/volume/vertex.glsl";
import fragmentShader from "./shaders/volume/fragment.glsl";

class Volume {
  constructor(data, noiseData, width, height, depth) {
    const texture = new Data3DTexture(data, width, height, depth);
    texture.format = RedFormat;
    texture.type = FloatType;
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.unpackAlignment = 1;
    this.texture = texture;

    const noiseTexture = new Data3DTexture(noiseData, width, height, depth);
    noiseTexture.format = RedFormat;
    noiseTexture.type = FloatType;
    noiseTexture.minFilter = LinearFilter;
    noiseTexture.magFilter = LinearFilter;
    noiseTexture.unpackAlignment = 1;
    this.noiseTexture = noiseTexture;

    const s = 1;
    let geo = new BoxGeometry(s, s, s);
    geo = new SphereBufferGeometry(0.5, 30, 30);
    const mat = new ShaderMaterial({
      uniforms: {
        map: { value: texture },
        noise: { value: noiseTexture },
        cameraPos: { value: new Vector3() },
        cameraRotation: { value: new Matrix4() },
        time: { value: 0.0 },
        cut: { value: 0.42 },
        range: { value: 0.01 },
        opacity: { value: 1 },
        color: { value: new Color() },
        steps: { value: 100 },
        // steps: { value: 200 },
        accumulate: { value: !true },
        uDummy: { value: 1 },
      },
      transparent: true,
      vertexShader,
      fragmentShader,
      // side: BackSide,
      side: FrontSide,
      // side: DoubleSide,
    });

    this.mesh = new Mesh(geo, mat);
    this.mesh.scale.set(1, 1, 1);
  }

  render(camera, time) {
    this.mesh.material.uniforms.cameraPos.value.copy(camera.position);
    this.mesh.material.uniforms.time.value = time;
  }
}

export { Volume };
