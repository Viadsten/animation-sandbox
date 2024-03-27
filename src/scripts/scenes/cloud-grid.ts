import type { Camera, Renderer, Scene } from 'three';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createNoise3D, createNoise2D } from 'simplex-noise';
import { GUI } from 'dat.gui'
import { makeXYZGUI } from '../helpers/makeXYZGUI';

const CUBE_VARS = {
  size: 0.95,
  offset: -0.21,
}

const ROWS_TOTAL = 30
const COLS_TOTAL = 30

export default class CloudGridScene {
  container: HTMLElement | null
  scene: Scene
  camera: Camera
  renderer: Renderer
  canvas: HTMLCanvasElement

  constructor() {
    this.container = document.querySelector('[data-scene="cloud-grid"]')

    this.animate = this.animate.bind(this)
    this.setSceneSize = this.setSceneSize.bind(this)

    this.init()
  }

  createPlane() {
    const geometry = new THREE.PlaneGeometry( 2, 2 )
    const material = new THREE.MeshPhongMaterial( {color: 0x161618, side: THREE.DoubleSide} )
    const plane = new THREE.Mesh( geometry, material )
    this.scene.add(plane)
  }

  createCubes() {
    this.cubes = new THREE.Group()
    const geometry = new THREE.BoxGeometry( CUBE_VARS.size, CUBE_VARS.size, CUBE_VARS.size )
    const material = new THREE.MeshPhysicalMaterial( {
      color: 0xD2C2FF, 
      metalness: 0.1,
      roughness: 0,
      reflectivity: 1,
      clearcoat: 1,
      flatShading: true
    })

    for (let row = 0; row < ROWS_TOTAL; row++) {
      for (let col = 0; col < COLS_TOTAL; col++) {
        const cube = new THREE.Mesh( geometry, material )
        const offset = (CUBE_VARS.offset + CUBE_VARS.size) * COLS_TOTAL / 2 
        cube.position.x = -offset + col * (CUBE_VARS.offset + CUBE_VARS.size)
        cube.position.y = -offset + row * (CUBE_VARS.offset + CUBE_VARS.size)
        cube.position.z = 0

        this.cubes.add(cube)
      }
    }

    window.cube = this.cubes.children[0]

    this.scene.add(this.cubes)
  }
  
  animate() {
    let zoom = 100;
    let strength = Math.PI * 2;
    this.cubes.children.forEach((cube, index) => {
      let angleX = this.noise3D(cube.position.x / zoom, cube.position.y / zoom, this.ticker ) * strength;
      let angleY = this.noise3D(cube.position.x / zoom, cube.position.y / zoom, this.ticker + 8000) * strength;
      // cube.rotation.x = angleX;
      console.log(angleY)
      cube.rotation.y = angleY;
      cube.rotation.x = angleX;

      // let scale = (Math.abs(this.noise3D(cube.position.x / zoom, cube.position.y / zoom, this.ticker + 16000)) + 2.5) / 2
      // cube.scale.x = scale;
      // cube.scale.y = scale;
      // cube.scale.z = scale;
    })

    this.ticker += 0.002

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
    const dirLight = new THREE.DirectionalLight( 0xffffff, 2 ); // soft white light
    dirLight.position.x = 2;
    dirLight.position.y = 4;
    dirLight.position.z = 42;
    this.scene.add( dirLight );

    const light = new THREE.AmbientLight( 0xffffff ); // soft white light
    light.intensity = 2
    this.scene.add( light )

    // const createLightHelper = () => {
    //   const helper = new THREE.DirectionalLightHelper( dirLight);
    //   this.scene.add( helper );
    //   const cameraHelper = new THREE.CameraHelper(dirLight.shadow.camera);
    //   this.scene.add(cameraHelper);
  
    //   const onChange = () => {
    //     dirLight.target.updateMatrixWorld();
    //     helper.update();
    //     cameraHelper.update()
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
    this.noise2D = createNoise2D()
    this.noise3D = createNoise3D()
    this.ticker = 0
    
    this.scene = new THREE.Scene();
    this.scene.scale.set(0.25, 0.25, 0.25)
    this.scene.background = new THREE.Color( 0xdddfff );
    
    const width = window.innerWidth
    const height = window.innerHeight
    this.camera = new THREE.PerspectiveCamera( 75, width / height, 1, 1000);
    this.camera.position.set(0, 0, 15)


    // this.createPlane();
    this.createCubes()

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