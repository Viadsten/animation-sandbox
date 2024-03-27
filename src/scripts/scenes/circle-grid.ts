import type { Scene, Camera, Renderer } from "three"
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { createNoise3D, createNoise2D, type NoiseFunction3D } from 'simplex-noise';
import gsap from "gsap";

const SPHERE_VARS = {
  size: 0.3,
}

const POSITION_VARS = {
  height: 200,
  width: window.innerWidth / 100,
  offset: 3,
}
const debounce = (callback: () => void, wait: any) => {
  let timeoutId:any = null;
  return (...args: any) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      //@ts-ignore
      callback(...args);
    }, wait);
  };
}

const CUBE_VARS = {
  size: 1.25,
  offset: 1.99,
}

const ROWS_TOTAL = 40
const COLS_TOTAL = 70

export default class CircleGridScene {
  container: HTMLElement | null
  scene: Scene
  camera: THREE.PerspectiveCamera
  renderer: Renderer | any
  canvas: HTMLCanvasElement
  noise3D: NoiseFunction3D

  ticker = 0
  spheres: any
  mouseCords = {
    x: 0.5,
    y: 0.5
  }
  mouseCordsPrev= this.mouseCords
  constructor() {
    this.container = document.querySelector('[data-scene="circle-grid"]')

    this.init()
  }

  init() {
    if (!this.container) {
      return;
    }
    
    this.noise3D = createNoise3D()

    this.scene = new THREE.Scene();
    // this.scene.scale.set(12, 12, 12)
    this.scene.background = new THREE.Color( 0x1f1e1e);
    
    const width = window.innerWidth
    const height = window.innerHeight
    this.camera = new THREE.PerspectiveCamera( 30, width / height, 1, 2500);
    // this.camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / - 2, 1, 1000)
    this.camera.position.set(0, 0, 180)
    this.camera.rotateY(0.2)

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.canvas = this.container.appendChild( this.renderer.domElement);

    this.createSphereGrid()

    this.setSceneSize();
    window.addEventListener('resize', this.setSceneSize);
    setInterval(() => this.setMouseScale(), 150)

    this.animate()
    
    const controls = new OrbitControls( this.camera, this.renderer.domElement );
    controls.update();

    window.addEventListener('mousemove', this.handleMouseMove)
  }


  handleMouseMove = (event: MouseEvent) => {
    // console.log(event)
    this.mouseCordsPrev = this.mouseCords
    this.mouseCords = {
      // x: (event.clientX / window.innerWidth - 0.5) * 2,
      x: (event.clientX / window.innerWidth),
      // y: (event.clientY / window.innerHeight - 0.5) * 2,
      y: (event.clientY / window.innerHeight),
    }
    
    // console.log(this.spheres)
  }


  prevScaleIndex:number[] = []
  setMouseScale() {
    const newScaleIndex = []

    const radius = 24
    const scaleSize = 2
    for (let i = 0; i < radius; i++) {
      for (let j = 1; j <= radius; j++) {
        // && < COLS_TOTAL
        const colIndex = Math.round(COLS_TOTAL * this.mouseCords.x + j) - radius / 2
        const rowIndex = COLS_TOTAL *  (Math.round((1 -  this.mouseCords.y) * (ROWS_TOTAL) + i) - radius / 2)
        const index = colIndex + rowIndex

        let halfX = (radius / 2 - Math.abs(j - radius / 2)) / (radius / 2)
        let halfY = (radius / 2 - Math.abs(i - radius / 2)) / (radius / 2)
        const multiply = Number((halfX * halfY + halfX * halfY).toFixed(2)) * scaleSize
        // let value = 1 + 0.25 * (scaleSize / 2 - Math.abs(Math.round(scaleSize / 2) + i  + j)) || 1
        let value = 1 + multiply
        // value = gsap.utils.clamp(1, 5, value)
        // const value = (i - 10)*(i - 10) + (j - 10)*(j - 10) === radius * radius ? 5 : 1
        if (this.spheres.children[index]) {
          newScaleIndex.push(index)

          gsap.to(this.spheres.children[index].scale, {
            x: value,
            y: value,
            z: value,
            ease: 'power1.out',
            duration: 0.55
          })
        }
      }
    }

    for (let i = 0; i < this.prevScaleIndex.length; i++) {
      if (!newScaleIndex.includes(this.prevScaleIndex[i])) {
        gsap.to(this.spheres.children[this.prevScaleIndex[i]].scale, {
          x: 1,
          y: 1,
          z: 1,
          overwrite: true,
          duration: 1.1,
          ease: 'power3.out'
        })
      }
    }

    this.prevScaleIndex = newScaleIndex 
  }
  
  
  setSceneSize = () => {
    console.log('resize')
    const newAspect = window.innerWidth / window.innerHeight;
    this.camera.aspect = newAspect;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    // this.camera.left = window.innerWidth / -2;
    // this.camera.right = window.innerWidth / 2;
    // this.camera.top = window.innerHeight / 2;
    // this.camera.bottom = window.innerHeight / -2;
    
    // this.camera.updateProjectionMatrix();
    // this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate = () => {
    let zoom = 50;
    let strength = 20;
    this.spheres.children.forEach((sphere: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>) => {

      let scale = (this.noise3D(sphere.position.x / zoom, sphere.position.y / zoom, this.ticker) * strength)
      sphere.position.z = scale
      // cube.scale.x = scale;
      // sphere.scale.x = (scale + 18) / 22 + 1;
      // sphere.scale.y = ((scale) + 18) / 22 + 1;
      // cube.scale.z = scale;
    })
    this.ticker += 0.0032
    requestAnimationFrame( this.animate );

    this.renderer.render( this.scene, this.camera );
  }
  
  createSphereGrid() {
    const geometry = new THREE.SphereGeometry( SPHERE_VARS.size, 16, 8 ); 
    const material = new THREE.MeshBasicMaterial( { color: 0x6a6a6a } ); 
    this.spheres = new THREE.Group()

    for (let row = 0; row < ROWS_TOTAL; row++) {
      for (let col = 0; col < COLS_TOTAL; col++) {
        const cube = new THREE.Mesh( geometry, material )
        const offsetX = (CUBE_VARS.offset + CUBE_VARS.size) * COLS_TOTAL / 2 
        const offsetY = (CUBE_VARS.offset + CUBE_VARS.size) * ROWS_TOTAL / 2 
        cube.position.x = -offsetX + col * (CUBE_VARS.offset + CUBE_VARS.size)
        cube.position.y = -offsetY + row * (CUBE_VARS.offset + CUBE_VARS.size)
        cube.position.z = 0

        this.spheres.add(cube)
      }
    }

    
    this.scene.add(this.spheres)
  }
}