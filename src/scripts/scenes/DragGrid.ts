import type { Scene, Camera, Renderer } from "three"
import * as THREE from 'three';
import gsap from "gsap";


class MouseController {
  maxSpeed = 0
  prevSpeed = 0
  acceleration = 0

  events: {
    mousemove: {
      prev: MouseEvent | null
      curr: MouseEvent | null
    }
  }

  constructor() {

  }

  init() {

  }

    // setInterval(function(){
    //   if(prevEvent && currentEvent){
    //     var movementX=Math.abs(currentEvent.screenX-prevEvent.screenX);
    //     var movementY=Math.abs(currentEvent.screenY-prevEvent.screenY);
    //     var movement=Math.sqrt(movementX*movementX+movementY*movementY);
        
    //     document.getElementById("movementX").innerText=movementX;
    //     document.getElementById("movementY").innerText=movementY;
    //     document.getElementById("movement").innerText=Math.round(movement);
        
    //     //speed=movement/100ms= movement/0.1s= 10*movement/s
    //     var speed=10*movement;//current speed
        
    //     document.getElementById("speed").innerText=Math.round(speed);
    //     document.getElementById("maxSpeed").innerText=Math.round(
    //       speed>maxSpeed?(maxSpeed=speed):maxSpeed
    //     );
        
    //     var acceleration=10*(speed-prevSpeed);
        
    //     document.getElementById("acceleration").innerText=Math.round(
    //       acceleration
    //     );
        
    //     if(acceleration>0){
    //       document.getElementById("maxPositiveAcceleration").innerText=Math.round(
    //       acceleration>maxPositiveAcc?(maxPositiveAcc=acceleration):maxPositiveAcc
    //     );
    //     }
    //     else{
    //       document.getElementById("maxNegativeAcceleration").innerText=Math.round(
    //       acceleration<maxNegativeAcc?(maxNegativeAcc=acceleration):maxNegativeAcc
    //     );
    //     }
    //   }
      
    //   prevEvent=currentEvent;
    //   prevSpeed=speed;
    // },100);
}


export default class DragGridScene {
  container: HTMLElement | null
  scene: Scene
  renderer: Renderer | any
  canvas: HTMLCanvasElement

  ticker = 0
  mouseCords = {
    x: 0.5,
    y: 0.5
  }
  mouseCordsPrev= this.mouseCords

  //@ts-ignore
  camera: {
    threeJS: THREE.PerspectiveCamera,
    endPosition: {
      x: number,
      y: number
    }  
  } = {}

  constructor() {
    this.container = document.querySelector('[data-scene="drag-grid"]')

    this.init()
  }

  init() {
    if (!this.container) {
      return;
    }

    this.setUpScene()
    
    
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.canvas = this.container.appendChild( this.renderer.domElement);


    
    this.animate()
    this.createPlane()
    this.setSceneSize();

    window.addEventListener('resize', this.setSceneSize);
    window.addEventListener('mousemove', this.handleMouseMove)
    this.canvas.addEventListener('touchstart', this.handleTouchStart)
    this.canvas.addEventListener('mousedown', this.handleTouchStart)
    this.canvas.addEventListener('touchend', this.handleTouchEnd)
    this.canvas.addEventListener('mouseup', this.handleTouchEnd)

    
  }

  setUpScene() {
    this.scene = new THREE.Scene();
    // this.scene.scale.set(12, 12, 12)
    this.scene.background = new THREE.Color( 0xf9efe7);
    
    const width = window.innerWidth
    const height = window.innerHeight
    this.camera.threeJS = new THREE.PerspectiveCamera( 30, width / height, 1, 2500);
    // this.camera.threeJS = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / - 2, 1, 1000)
    this.camera.threeJS.position.set(0, 0, 50)

  }

  createPlane() {
    const geometry = new THREE.PlaneGeometry( 5, 5 );
    const material = new THREE.MeshBasicMaterial( {color: 0x1f1f1f, side: THREE.DoubleSide} );
    const plane = new THREE.Mesh( geometry, material );
    this.scene.add( plane );
  }

  isDrag = false

  handleTouchStart = (event: TouchEvent | MouseEvent) => {
    this.isDrag = true

  }


  handleTouchEnd = (event: TouchEvent | MouseEvent) => {
    this.isDrag = false

  }


  handleMouseMove = (event: MouseEvent) => {
    // console.log(event)
    this.mouseCordsPrev = this.mouseCords
    this.mouseCords = {
      // x: (event.clientX / window.innerWidth - 0.5) * 2,
      x: ((event.clientX - window.innerWidth / 2) / window.innerWidth),
      // y: (event.clientY / window.innerHeight - 0.5) * 2,
      y: ((event.clientY - window.innerHeight / 2) / window.innerHeight),
    }
    
    if (this.isDrag) {
      console.log(this.isDrag)
      this.camera.threeJS.position.x += (this.mouseCordsPrev.x - this.mouseCords.x) * 3
      this.camera.threeJS.position.y -= (this.mouseCordsPrev.y - this.mouseCords.y) * 3
    }
  }

  
  setSceneSize = () => {
    console.log('resize')
    const newAspect = window.innerWidth / window.innerHeight;
    this.camera.threeJS.aspect = newAspect;
    this.camera.threeJS.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate = () => {
   
    requestAnimationFrame( this.animate );

    this.renderer.render( this.scene, this.camera.threeJS );
  }
  
}