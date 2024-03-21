import type { Camera, Renderer, Scene } from 'three';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';


import vertexShader from '../../shaders/image/vertex.glsl'
import fragmentShader from '../../shaders/image/fragment.glsl'
import neonTexture from '/neon-gas.jpg'
import type { Coordinates2d } from '../../types';


class ImageScene {
  container: HTMLElement | null;
  scene: Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  canvas: HTMLCanvasElement;
  material: THREE.ShaderMaterial
  clock: THREE.Clock
  mouse: Coordinates2d

  constructor() {
    this.container = document.querySelector('[data-scene="image"]');

    this.mouse = {
      x: 0,
      y: 0
    }

    this.animate = this.animate.bind(this);
    this.setSceneSize = this.setSceneSize.bind(this);

    this.init();
  }

  createPlane() {
    const geometry = new THREE.PlaneGeometry( 2, 1.5, 100, 100 );
    // const material = new THREE.MeshPhongMaterial( {color: 0x161618, side: THREE.DoubleSide} );

    // this.material.uniforms.uTime = {value: 0}
    // this.material.uniforms.uRadius = {value: 0.5}
    // this.material.uniforms.uMouse = {type: "v2", value: new THREE.Vector2()}
    // this.material.uniforms.uTexture = {value: new THREE.TextureLoader().load('/rayan.jpg')}
    const shaderUniforms = {
      uTime: { type: "f", value: 0 },
      uProgress: { type: "f", value: 0 },
      uMouse: { type: "v2", value: new THREE.Vector2() },
      uTexture: { type: "t", value: new THREE.TextureLoader().load('/rayan.jpg') }
    };
    
    this.material = new THREE.ShaderMaterial({
      // side: THREE.DoubleSide,
      uniforms: shaderUniforms,
      vertexShader,
      fragmentShader
    })
  
    
    const timeline = gsap.timeline()
    timeline.to(this.material.uniforms.uProgress, {
      value: 2,
      repeat: -1,
      ease: 'power4.in',
      yoyo: true,
      duration: 2
    })
    const plane = new THREE.Mesh( geometry, this.material );

    this.scene.add(plane);
  }
  
  animate() {
    requestAnimationFrame( this.animate );

    this.material.uniforms.uTime.value = this.clock.getElapsedTime() 
    this.material.uniforms.uMouse.value.set(this.mouse.x, this.mouse.y)
    // console.log(this.clock.getElapsedTime());

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

  handleMouseMove = (evt: MouseEvent) => {
    this.mouse = {
      x: evt.clientX / window.innerWidth,
      y: evt.clientY / window.innerHeight,
    }
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
    this.camera.position.set(0, 0, 2)
    this.clock = new THREE.Clock()

    this.createPlane();

    this.setLights();

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio( window.devicePixelRatio + 0.5 );
    this.canvas = this.container.appendChild( this.renderer.domElement);

    this.animate();

    this.setSceneSize();
    window.addEventListener('resize', this.setSceneSize);
    window.addEventListener('mousemove', this.handleMouseMove)

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

new ImageScene()