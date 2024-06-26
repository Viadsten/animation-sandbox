import type { Camera, Renderer, Scene } from 'three';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import gsap from 'gsap';
import { degreesToRadians } from './../helpers/degrees-to-radians'

const MODEL_PATH = '/crack_egg_jewellery.glb'
// const MODEL_PATH = '/egg-thick.gltf'
const easeMultiplier = 0.0282

export default class EggScene {
  container: HTMLElement | null;
  scene: Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  canvas: HTMLCanvasElement;
  timeline: ReturnType<typeof gsap.timeline> 
  egg: any
  mouseProgress: number

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

    const progress = this.timeline?.progress() + (this.mouseProgress - this.timeline?.progress()) * easeMultiplier
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

  addModel(glb: any) {
    this.scene.add(glb.scene)
    this.egg = glb.scene
    this.egg.children.sort((a:any, b:any) => b.position.y - a.position.y)
    this.egg.position.y = -3.05

    this.createTimeline()
    window.addEventListener('mousemove', this.handleMouseMove)
  }

  createTimeline() {
    const vars = {
      duration: 4,
      delay: 0.0125,
    }
    this.timeline = gsap.timeline({ paused: true })

    this.egg.children.map((el: any, index: number) => {
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
  }

  handleMouseMove = (evt: MouseEvent) => {
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
  }
}

new EggScene()