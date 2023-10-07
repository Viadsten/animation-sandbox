import type { Camera, Renderer, Scene } from 'three';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import gsap from 'gsap';
import { degreesToRadians } from './../helpers/degrees-to-radians'
import { CustomEase } from "gsap/CustomEase";

const MODEL_PATH = '/crack_egg_jewellery.glb'
// const MODEL_PATH = '/egg-thick.gltf'
const thay = 0.0282


const fragShader = `
  #ifdef GL_ES
  precision mediump float;
  #endif

  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_time;

  void main() {
    vec2 st = gl_FragCoord.xy/u_resolution;
    gl_FragColor = vec4(st.y, abs(sin(u_time)), st.x, 1.0);
  }
`;

export default class EggScene {
  container: HTMLElement | null;
  scene: Scene;
  camera: Camera;
  renderer: Renderer;
  canvas: HTMLCanvasElement;

  constructor() {
    this.container = document.querySelector('[data-scene="egg"]');

    this.animate = this.animate.bind(this);
    this.setSceneSize = this.setSceneSize.bind(this);
    this.addModel = this.addModel.bind(this)
    this.createTimeline = this.createTimeline.bind(this)

    this.mouseProgress = 0.5

    this.init();
  }
  
  animate() {
    requestAnimationFrame( this.animate );

    const progress = this.timeline?.progress() + (this.mouseProgress - this.timeline?.progress()) * thay
    this.timeline?.progress(progress).paused(true)
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

  loadModel() {
    const loader = new GLTFLoader()
    const dracoLoader = new DRACOLoader();
    loader.setDRACOLoader( dracoLoader );
    loader.load(MODEL_PATH, this.addModel)
  }

  addModel(glb) {
    this.scene.add(glb.scene)
    console.log(glb.scene.children[0])
    // this.egg = glb.scene.children[0].children[1]
    this.egg = glb.scene
    // glb.scene.scale.x = 2.5
    // glb.scene.scale.y = 2.5
    // glb.scene.scale.z = 2.5
    window.egg = this.egg
    this.egg.children.sort((a, b) => b.position.y - a.position.y)
    this.egg.position.y = -3.05

    // this.egg.position.y = -6.35 // --

    this.createTimeline()
    window.addEventListener('mousemove', this.handleMouseMove)
  }

  createTimeline() {
    const vars = {
      duration: 4,
      delay: 0.0125,
      // ease: CustomEase.create("custom", "M0,0 C0.03,0 0.056,0.022 0.084,0.086 0.118,0.165 0.242,0.388 0.306,0.47 0.433,0.633 0.622,0.958 1,1 ")
      // ease: CustomEase.create("custom", "M0,0 C0,0 0.408,-1 0.544,-1 0.674,-1 1,0 1,0 ")
      ease: 'power1.out'
    }
    this.timeline = gsap.timeline({ paused: true })
    gsap.registerPlugin(CustomEase)

    const length = this.egg.children.length - 1
    this.egg.children.map((el, index) => {
      this.timeline.to(el.position, {
        x: (el.position.x) * 2 * gsap.utils.random(1, 1.8),
        y: (el.position.y) * 2.5 * gsap.utils.random(1, 1.3),
        z: (el.position.z) * 2.5,
        ease: 'power1.out',
        duration: vars.duration / 2 - (vars.delay * Math.sqrt(index)),
      }, vars.duration / 2 + vars.delay * Math.sqrt(index))
      this.timeline.to(el.rotation, {
        x: el.rotation.x * gsap.utils.random(-3.5, 3.5),
        z: el.rotation.z + 1 * gsap.utils.random(-3.5, 3.5),
        ease: 'power1.out',
        duration: vars.duration / 2 - (vars.delay * Math.sqrt(index)),
      }, vars.duration / 2 + vars.delay * Math.sqrt(index))
      
      const delay = vars.delay * Math.sqrt(index)
      this.timeline.from(el.position, {
        x: (el.position.x) * 2 * gsap.utils.random(1, 1.8),
        y: (el.position.y) * 2.5 * gsap.utils.random(1, 1.3),
        z: (el.position.z) * 2.5,
        ease: 'power1.in',
        duration: vars.duration / 2 - delay,
      }, 0)
      this.timeline.from(el.rotation, {
        x: el.rotation.x * gsap.utils.random(-2.5, 2.5),
        z: el.rotation.z + 1 * gsap.utils.random(-2.5, 2.5),
        ease: 'power1.in',
        duration: vars.duration / 2 - delay,
      }, 0)
    })
    this.timeline.progress(0.5).paused(true)
    this.timeline.to(this.egg.rotation, {
      y: degreesToRadians(460),
      ease: 'power3.inOut',
      duration: vars.duration
    }, 0)
    // this.timeline.from(this.egg.rotation, {
    //   y: degreesToRadians(-180),
    //   ease: 'power2.inOut',
    //   duration: vars.duration / 2
    // }, 0)
  }

  handleMouseMove = (evt) => {
    this.mouseProgress = Math.abs((evt.clientX - window.innerWidth) / (window.innerWidth))
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

    // this.createPlane();

    this.setLights();

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio( window.devicePixelRatio + 0.5 );
    this.canvas = this.container.appendChild( this.renderer.domElement);

    this.animate();

    this.setSceneSize();
    this.loadModel()
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

new EggScene()