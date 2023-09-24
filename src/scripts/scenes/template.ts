import type { Camera, Renderer, Scene } from 'three';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default class TemplateScene {
  container: HTMLElement | null;
  scene: Scene;
  camera: Camera;
  renderer: Renderer;
  canvas: HTMLCanvasElement;

  constructor() {
    this.container = document.querySelector('[data-scene="template"]');

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
  
  animate() {
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
    light.intensity = 2
    this.scene.add( light )
  }

  init() {
    if (!this.container) {
      return;
    }
    
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xffffff );
    
    const width = window.innerWidth
    const height = window.innerHeight
    this.camera = new THREE.PerspectiveCamera( 75, width / height, 1, 1000);
    this.camera.position.set(0, 0, 5)


    this.createPlane();

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
  }

  initHelpers() {
    const axesHelper = new THREE.AxesHelper( 50 );
    this.scene.add( axesHelper );
  }
}