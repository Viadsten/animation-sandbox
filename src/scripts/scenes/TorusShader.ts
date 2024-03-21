import type { Camera, Renderer, Scene } from 'three';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import vertexShader from '../../shaders/torus/vertex'
import fragmentShader from '../../shaders/torus/fragment'


class TemplateScene {
  container: HTMLElement | null;
  scene: Scene;
  camera: Camera;
  renderer: Renderer;
  canvas: HTMLCanvasElement;

  constructor() {
    this.container = document.querySelector('[data-scene="torus-shader"]');

    this.animate = this.animate.bind(this);
    this.setSceneSize = this.setSceneSize.bind(this);

    this.init();
  }

  createPlane() {
    const geometry = new THREE.PlaneGeometry( 2, 2 );
    const material = new THREE.MeshPhongMaterial( {color: 0x161618, side: THREE.DoubleSide} );
    const plane = new THREE.Mesh( geometry, material );
    this.scene.add(plane);
  }

  createTorus() {
    this.torus = new THREE.Mesh(
      new THREE.TorusGeometry(2, 0.8, 200, 200),
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        side: THREE.DoubleSide,
        // wireframe: true,
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: new THREE.Vector2() },
          uDisplace: { value: 1 },
          uSpread: { value: 2.5 },
          uNoise: { value: 16 },
        },
      })
    );
    
    this.scene.add(this.torus);
  }
  
  animate() {
    const elapsedTime = this.clock.getElapsedTime();
    this.torus.material.uniforms.uTime.value = elapsedTime;
    requestAnimationFrame( this.animate );

    this.renderer.render( this.scene, this.camera );
  }

  setSceneSize() {
    const newAspect = window.innerWidth / window.innerHeight;
    this.camera.aspect = newAspect;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  setLights() {
    const dirLight = new THREE.DirectionalLight( 0xffffff, 7 ); // soft white light
    dirLight.position.y = 10;
    this.scene.add( dirLight );

    const light = new THREE.AmbientLight( 0xffffff ); // soft white light
    light.intensity = 12
    this.scene.add( light )
  }

  init() {
    if (!this.container) {
      return;
    }
    
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xffffff );
    this.clock = new THREE.Clock()
    
    const width = window.innerWidth
    const height = window.innerHeight
    this.camera = new THREE.PerspectiveCamera( 75, width / height, 1, 1000);
    this.camera.position.set(0, 0, 5)


    // this.createPlane();
    this.createTorus()

    this.setLights();

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio( window.devicePixelRatio + 0.5 );
    this.canvas = this.container.appendChild( this.renderer.domElement);

    this.animate();

    this.setSceneSize();
    window.addEventListener('resize', this.setSceneSize);

    //  dev
    const controls = new OrbitControls( this.camera, this.renderer.domElement );
    controls.update();
    // this.initHelpers();
    console.log(this.torus)
  }

  initHelpers() {
    const axesHelper = new THREE.AxesHelper( 50 );
    this.scene.add( axesHelper );
  }
}

new TemplateScene()