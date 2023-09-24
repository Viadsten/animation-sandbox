import type { Camera, Group, Renderer, Scene } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as THREE from 'three';
import { degreesToRadians } from '../helpers/degrees-to-radians';
import { GUI } from 'dat.gui'
import { makeXYZGUI } from '../helpers/makeXYZGUI';
import { gsap } from 'gsap';

const BRICK_SIZE = {
  width: 5.5,
  height: 3.5,
  depth: 0.35,
  offset: 1,
}

const BRICKS_COUNT = 65;

const CAMERA_VARS = {
  position: {
    x: -100,
    y: 315,
    z: 585
  },
  scale: 1.7
}

let pos = {
  x: -100,
  y: 165,
}

let rotation = {
  x: 0,
  y: 0,
}

const CAMERA_ROTAION = {
  x: degreesToRadians(0.5),
  y: degreesToRadians(0.5),
}

export default class BrickWave {
  container: HTMLElement | null;
  scene: Scene;
  camera: Camera;
  renderer: Renderer;
  canvas: HTMLCanvasElement;
  bricks: Group;
  timeline: GSAPTimeline;
  defaultCameraRotation: THREE.Euler;

  constructor() {
    this.container = document.querySelector('[data-scene="brick-wave"]');

    this.rotate = {
      x: 0,
      y: 0,
    }

    this.animate = this.animate.bind(this);
    this.setSceneSize = this.setSceneSize.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.calculateCameraPosition = this.calculateCameraPosition.bind(this);

    this.init();
  }

  createFloor() {
    const geometry = new THREE.PlaneGeometry( 220, 220 );
    const material = new THREE.MeshPhongMaterial( {color: 0x111111, side: THREE.DoubleSide} );
    const plane = new THREE.Mesh( geometry, material );
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.position.set(1, 0, 1);
    plane.rotation.x = degreesToRadians(-90);
    this.scene.add(plane);
  }

  createBricks() {
    this.bricks = new THREE.Group();
    const geometry = new THREE.BoxGeometry( BRICK_SIZE.width, BRICK_SIZE.height, BRICK_SIZE.depth );
    const material = new THREE.MeshPhongMaterial( {color: 0x4F4F4F} );

    for (let i = 0; i < BRICKS_COUNT; i++) {
      const brick = new THREE.Mesh( geometry, material );
      const offset = (BRICK_SIZE.offset) * BRICKS_COUNT / 2 
      brick.position.x = -offset + i * BRICK_SIZE.offset;
      brick.position.z = -offset + i * BRICK_SIZE.offset;
      brick.position.y = BRICK_SIZE.height / 2;
      brick.rotation.y = degreesToRadians(45)
      brick.castShadow = true;
      brick.receiveShadow = true;
      
      brick.setY = function setX(val:number) {
        if (!val) {
          return this.position.y;
        }
        this.position.y = val;
      }

      this.bricks.add(brick);
    }
    this.scene.add(this.bricks);
  }

  handleMouseMove(evt = 0) {
    this.rotate = {
      x: (evt.clientX - (window.innerWidth / 2)) / (window.innerWidth / 2),
      y: (evt.clientY - (window.innerHeight / 2)) / (window.innerHeight / 2), // рассчет коэффициента поворота. подробнее в ноушн
    };
  }

  calculateCameraPosition() {
    const dt = 1.0 - Math.pow(1.0 - 0.091, gsap.ticker.deltaRatio());
    // pos = {
    //   x: CAMERA_VARS.position.x - (this.rotate.x * 6),
    //   y: CAMERA_VARS.position.y + (this.rotate.y * 3)
    // }

    // this.xSet(this.camera.position.x + (pos.x - this.camera.position.x) * dt);
    // this.ySet(this.camera.position.y + (pos.y - this.camera.position.y) * dt);

    pos = {
      x: degreesToRadians(this.rotate.y * 7),
      y: -degreesToRadians(this.rotate.x * 12)
    }

    this.xSet(this.scene.rotation.x + (pos.x - this.scene.rotation.x) * dt);
    this.ySet(this.scene.rotation.y + (pos.y - this.scene.rotation.y) * dt);
  }

  createTimeline() {
    this.timeline = gsap.timeline({repeat: 0});
    const duration = 0.45;

    this.timeline.to(this.bricks.children, {
      setY: 7,
      ease: "sine.inOut",
      duration: duration,
      stagger: {
        each: duration / 8,
        repeat: -1,
        repeatDelay: duration * 3
      }
    })
    this.timeline.to(this.bricks.children, {
      setY: BRICK_SIZE.height / 2,
      ease: "sine.inOut",
      duration: duration,
      stagger: {
        each: duration / 8,
        repeat: -1,
        repeatDelay: duration * 3
      }
    }, duration)
  }
  
  animate() {
    requestAnimationFrame( this.animate );

    this.renderer.render( this.scene, this.camera );
  }

  setSceneSize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  setLights() {
    const dirLight = new THREE.DirectionalLight( 0xffffff, 13 ); // soft white light
    dirLight.position.set( 46.7, 53, -41.4 );
    dirLight.target.position.set(2.6, 3, 0.4);
    dirLight.castShadow = true;
    // light.target.position.set(0, 0, 0);
    this.scene.add( dirLight );
    dirLight.shadow.mapSize.width = 3512; // default
    dirLight.shadow.mapSize.height = 3512; // default
    dirLight.shadow.camera.far = 120;
    dirLight.shadow.camera.near = 0.01;
    dirLight.shadow.camera.top = 40
    dirLight.shadow.camera.left = -40
    dirLight.shadow.camera.right = 40
    dirLight.shadow.camera.bottom = -40
    dirLight.up.set(5, 5, 5)

    const light = new THREE.AmbientLight( 0xffffff ); // soft white light
    light.intensity = 3
    this.scene.add( light )

    // TODO вынести в хелперы
    // const createLightHelper = () => {
    //   const helper = new THREE.DirectionalLightHelper( dirLight);
    //   this.scene.add( helper );
    //   const cameraHelper = new THREE.CameraHelper(dirLight.shadow.camera);
    //   this.scene.add(cameraHelper);
  
    //   const onChange = () => {
    //     dirLight.target.updateMatrixWorld();
    //     helper.update();
    //   };
    //   onChange();
  
    //   const gui = new GUI();
    //   makeXYZGUI(gui, dirLight.position, 'position', onChange);
    //   makeXYZGUI(gui, dirLight.target.position, 'target', onChange);
    // }
    // createLightHelper();
  }

  init() {
    if (!this.container) {
      return;
    }
    
    this.scene = new THREE.Scene();
    window.scene = this.scene 
    // this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    
    const width = window.innerWidth / 15;
    const height = window.innerHeight / 15
    this.camera = new THREE.OrthographicCamera( width / - 5, width / 5, height / 5, height / - 5, 1, 1000 );
    this.camera.position.z = CAMERA_VARS.position.z;
    this.camera.position.y = CAMERA_VARS.position.y;
    this.camera.position.x = CAMERA_VARS.position.x;
    this.camera.scale.set( CAMERA_VARS.scale, CAMERA_VARS.scale, CAMERA_VARS.scale )
    window.camera = this.camera


    this.createFloor();
    this.createBricks();

    this.setLights();

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio( window.devicePixelRatio + 0.5 );
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    this.canvas = this.container.appendChild( this.renderer.domElement);

    this.xSet = gsap.quickSetter(this.scene.rotation, "x");
    this.ySet = gsap.quickSetter(this.scene.rotation, "y");

    this.animate();

    this.setSceneSize();
    this.createTimeline();
    window.addEventListener('resize', this.setSceneSize);
    window.addEventListener('mousemove', this.handleMouseMove);
    gsap.ticker.add(this.calculateCameraPosition);

    //  dev
    const controls = new OrbitControls( this.camera, this.renderer.domElement );
    controls.enabled = false
    // controls.update();
    // this.initHelpers();
  }

  initHelpers() {
    const axesHelper = new THREE.AxesHelper( 50 );
    this.scene.add( axesHelper );
  }
}