import type { Camera, Group, Renderer, Scene } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as THREE from 'three';

const ITEMS_LENGTH = 5
const ITEM_SIDE = 2
const ITEM_OFFSET = 1

export default class imgCarouselScene {
  container: HTMLElement | null;
  scene: Scene;
  camera: Camera;
  renderer: Renderer;
  canvas: HTMLCanvasElement;

  constructor() {
    this.container = document.querySelector('[data-scene="img-slider"]');

    this.uniforms = []

    this.animate = this.animate.bind(this);
    this.setSceneSize = this.setSceneSize.bind(this);

    this.init();
  }

  createPlanes() {
    for (let i = 0; i < ITEMS_LENGTH; i++) {
      const geometry = new THREE.PlaneGeometry( ITEM_SIDE, ITEM_SIDE )
      const material = new THREE.MeshPhongMaterial( {color: 0x161618, side: THREE.DoubleSide} )
      const xPos = (ITEM_SIDE + ITEM_OFFSET) * i - (ITEMS_LENGTH - 1) / 2 * (ITEM_SIDE + ITEM_OFFSET)

      const uniforms = {
        time: { type: 'f', value: 1.0 },
        x: { type: 'f', value: xPos },
        radius: { type: 'f', value: ITEM_SIDE / 2 }
      }
      this.uniforms.push[uniforms]
      const shaderMaterial = new THREE.ShaderMaterial({
        wireframe: false,
        transparent: false,
        uniforms: uniforms,
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        // fragmentShader: document.getElementById( 'fragmentShader' ).textContent
      });
      
      // const plane = new THREE.Mesh( geometry, material );
      const plane = new THREE.Mesh( geometry, shaderMaterial )
      plane.position.x = 
      
      this.scene.add(plane);
    }
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


    this.createPlanes();

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