import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Pane } from "tweakpane";
import fragmentShader from "./fragment.glsl";
// import fragmentShader from "./fragmentRayMarchStarter.glsl";
import vertexShader from "./vertex.glsl";
import {
  generateGoursat,
  generateHyperelliptic,
  generateTorus,
  generatePerlin,
  generateSphere,
  generateBlob,
} from "./fields";
import { Volume } from "./Volume";
import { natural } from "./palettes.js";
import { GradientLinear } from "./gradient-linear.js";
import { Post } from "./Post";

class World {
  constructor() {
    this.init();
    this.debug = new Pane();
    this.textureLoader = new THREE.TextureLoader();
    this.setGlobals();
    this.resize();
    this.randomize();

    this.debug.addInput(this.volume.mesh.material.uniforms.cut, "value", {
      min: 0,
      max: 1,
      step: 0.01,
    });
    this.debug.addInput(this.volume.mesh.material.uniforms.uDummy, "value", {
      min: 0,
      max: 10,
      step: 0.01,
    });
    this.debug.addInput(this.volume.mesh.material.uniforms.steps, "value", {
      min: 1,
      max: 200,
      step: 1,
    });
    window.addEventListener("resize", this.resize.bind(this));
    window.addEventListener("pointermove", this.onPointermove.bind(this));
    window.addEventListener("pointerdown", this.onPointerdown.bind(this));
    this.render();
  }

  onPointermove(e) {
    this.cut = 0.2 + (0.6 * e.pageY) / window.innerHeight;
    this.invalidated = true;
    e.preventDefault();
    e.stopPropagation();
  }

  onPointerdown(e) {
    this.changed = false;
  }

  init() {
    this.time = 0;
    this.prevTime = 0;
    this.container = document.querySelector("#canvas");
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    this.renderer = new THREE.WebGLRenderer({
      // alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
    });
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x101010);
    this.container.appendChild(this.renderer.domElement);
    this.camera.position.set(1, -1.6, -0.87);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // this.controls.addEventListener("change", (e) => {
    //   this.changed = true;
    //   this.invalidated = true;
    // });
  }

  setGlobals() {
    this.post = new Post(this.renderer);

    this.palette = natural;
    this.gradient = new GradientLinear(this.palette);

    this.size = 128;
    this.width = this.size;
    this.height = this.size;
    this.depth = this.size;
    this.data = new Float32Array(this.width * this.height * this.depth);
    this.noiseData = new Float32Array(this.width * this.height * this.depth);

    this.volume;
    this.invalidated = true;

    this.running = true;
    this.cutting = false;
    this.changed = false;

    this.currentCut = 0.5;
    this.cut = 0.5;

    this.debug.addButton({ title: "toggelPause" }).on("click", () => {
      this.running = !this.running;
    });

    this.debug.addButton({ title: "randomize" }).on("click", () => {
      this.randomize();
    });

    this.debug.addButton({ title: "autoCut" }).on("click", () => {
      this.cutting = !this.cutting;
    });
  }

  randomize() {
    const generators = [
      generateGoursat,
      generateHyperelliptic,
      generateTorus,
      generateSphere,
      generateBlob,
    ];
    // const ptr = Math.floor(Math.random() * generators.length);
    const ptr = 3;
    generators[ptr](this.data, this.width, this.height, this.depth);

    generatePerlin(this.noiseData, this.width, this.height, this.depth);
    if (this.volume) {
      this.volume.texture.needsUpdate = true;
      this.volume.noiseTexture.needsUpdate = true;
    } else {
      this.volume = new Volume(
        this.data,
        this.noiseData,
        this.width,
        this.height,
        this.depth
      );
      this.scene.add(this.volume.mesh);
    }
    this.volume.mesh.material.uniforms.color.value = this.gradient.getAt(
      Math.random()
    );
    this.invalidated = true;
  }

  addObject() {
    this.geometry = new THREE.PlaneGeometry(1, 1);

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
      },
      transparent: true,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  resize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;

    this.camera.updateProjectionMatrix();

    this.post.setSize(window.innerWidth, window.innerHeight);
  }

  update() {
    this.currentCut += (this.cut - this.currentCut) * 0.1;
    // this.volume.mesh.material.uniforms.cut.value = this.currentCut;

    if (this.running) {
      this.prevTime = this.time;
      this.time += 0.01633;
      this.invalidated = true;
    }

    // if (this.cutting) {
    //   this.volume.mesh.material.uniforms.cut.value =
    //     0.5 + 0.3 * Math.sin(this.time * 1.1);
    //   this.invalidated = true;
    // }

    if (this.invalidated) {
      this.volume.render(this.camera, this.time);
      this.invalidated = false;
    }
  }

  render() {
    this.update();
    this.renderer.render(this.scene, this.camera);
    // this.post.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this));
  }
}

new World();
