import type { Scene, Camera, Renderer } from "three"
import * as THREE from 'three';
import gsap from "gsap";

type Vector2 = {
  x: number
  y:number
}

type Vector3 = {
  x: number
  y: number
  z: number
}


const CARD = {
  width: 6,
  height: 9,
  offset: 2,
  rows: 2,
  cols: 4
}

const ZOOM = {
  max: 10,
  min: 100
}


class MouseController {
  speed = 0
  prevSpeed = 0
  acceleration = 0

  events: {
    mousemove: {
      prev: MouseEvent | null
      current: MouseEvent | null
    }
  } = {
    mousemove: {
      prev: null,
      current: null
    }
  }

  movement = {
    x: 0,
    y: 0,
    delta: 0
  }


  cords:Vector2 = {
    x: 0,
    y: 0
  }

  cordsPrev:Vector2 = {
    x: 0,
    y:0
  }

  wheel: {
    direction: number
  } = {
    direction: 0
  }

  isDrag = false

  movementInterval: ReturnType<typeof setInterval>

  callbacks: {
    drag: [() => void] | []
    mousemove: [() => void] | []
    wheel: [() => void] | []
  } = {
    drag: [],
    mousemove: [],
    wheel: []
  }

  constructor() {
    this.init()
  }

  init() {
    this.setListeners()
  }

  setListeners() {
    window.addEventListener('mousemove', this.handleMouseMove)
    window.addEventListener('touchstart', this.handleTouchStart)
    window.addEventListener('mousedown', this.handleTouchStart)
    window.addEventListener('touchend', this.handleTouchEnd)
    window.addEventListener('mouseup', this.handleTouchEnd)
    window.addEventListener('wheel', this.handleWheel)

    this.movementInterval = setInterval(this.calculateMovement ,100)
  }


  handleWheel = (event: WheelEvent) => {
    console.log(event)
    this.wheel = {
      direction: event.deltaY / Math.abs(event.deltaY)
    }
    this.callbacks.wheel.map(callback => callback())
  }

  handleTouchStart = (event: TouchEvent | MouseEvent) => {
    this.isDrag = true
  }


  handleTouchEnd = (event: TouchEvent | MouseEvent) => {
    this.isDrag = false

  }


  handleMouseMove = (event: MouseEvent) => {
    this.events.mousemove.current = event
    this.cordsPrev = this.cords
    this.cords = {
      x: ((event.clientX - window.innerWidth / 2) / window.innerWidth),
      y: ((event.clientY - window.innerHeight / 2) / window.innerHeight),
    }
    
    this.callbacks.mousemove.map(callback => callback())
  }

  calculateMovement = () => {
    const currentEvent = this.events.mousemove.current
    const prevEvent = this.events.mousemove.prev


      if(currentEvent && prevEvent){
        const movementX = Math.abs(currentEvent.screenX - prevEvent.screenX);
        const movementY = Math.abs(currentEvent.screenY - prevEvent.screenY);
        const movement = Math.sqrt(movementX*movementX+movementY*movementY);

        //speed=movement/100ms= movement/0.1s= 10*movement/s
        this.speed= movement;//current speed
        
        this.acceleration=10*(this.speed - this.prevSpeed);
        
        this.movement = {
          delta: movement,
          x: movementX,
          y: movementY
        }
      }

      this.events.mousemove.prev = currentEvent;
      this.prevSpeed = this.speed;
  }
}


export default class DragGridScene {
  container: HTMLElement | null
  scene: Scene
  renderer: Renderer | any
  canvas: HTMLCanvasElement
  ticker = 0
  camera: {
    threeJS: THREE.PerspectiveCamera,
    endPosition: Vector3,
    xTo: ReturnType<typeof gsap.quickTo>,
    yTo: ReturnType<typeof gsap.quickTo>,
    zTo: ReturnType<typeof gsap.quickTo>,
  }
  mouseController: MouseController

  constructor() {
    this.container = document.querySelector('[data-scene="drag-grid"]')

    this.init()
  }



  init() {
    if (!this.container) {
      return;
    }

    this.setUpScene()
    
    
    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.canvas = this.container.appendChild( this.renderer.domElement);
    
    this.mouseController = new MouseController()
    this.mouseController.callbacks.mousemove.push(this.handleMousemove)
    this.mouseController.callbacks.wheel.push(this.handleWheel)

    
    this.animate()
    this.createPlane()
    this.setSceneSize();

    window.addEventListener('resize', this.setSceneSize);
  }


  setUpScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xf9efe7);
    
    const width = window.innerWidth
    const height = window.innerHeight
    const camera = new THREE.PerspectiveCamera( 30, width / height, 1, 2500) 

    this.camera = {
      threeJS: camera,
      endPosition: {
        x: 0,
        y: 0,
        z: 20
      },
      xTo: gsap.quickTo(camera.position, 'x', {duration: 1.2, ease: 'back.out(2)'}),
      yTo: gsap.quickTo(camera.position, 'y', {duration: 1.2, ease: 'back.out(2)'}),
      zTo: gsap.quickTo(camera.position, 'z', {duration: 1.2, ease: 'back.out(2)'})
    }
    console.log()
    camera.position.set(0, 0, this.camera.endPosition.z)
  }


  createPlane() {
    for (let i = 0; i < CARD.rows; i++) {
      for (let j = 0; j < CARD.cols; j++) {
        const geometry = new THREE.PlaneGeometry( CARD.width, CARD.height );
        const material = new THREE.MeshBasicMaterial( {color: 0x1f1f1f, side: THREE.DoubleSide} );
        const plane = new THREE.Mesh( geometry, material );
        // plane.position.set(
        //   -(CARD.cols / 2) * (CARD.width + CARD.offset) / 4 * (j - CARD.cols / 2),
        //   -(CARD.rows / 2) * (CARD.height + CARD.offset) / 2 * (i - CARD.rows / 2),
        //   0
        // )

        plane.position.set(
          (CARD.cols - j * 2 - 1) * ((CARD.width + CARD.offset) / -2),
          (CARD.rows - i * 2 - 1) * ((CARD.height + CARD.offset) / -2),
          0
        )
        this.scene.add( plane );
      }
    }

    console.log((CARD.cols - 0 * 2 - 1) * ((CARD.width + CARD.offset) / -2))
  }


  setSceneSize = () => {
    if (!this.camera.threeJS) return
    const newAspect = window.innerWidth / window.innerHeight;
    this.camera.threeJS.aspect = newAspect;
    this.camera.threeJS.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }


  handleWheel = () => {
    if (this.mouseController.wheel.direction == 1 && this.camera.endPosition.z < ZOOM.min ) {
      this.camera.endPosition.z += this.mouseController.wheel.direction * 5
    }
    if (this.mouseController.wheel.direction == -1 && this.camera.endPosition.z > ZOOM.max) {
      this.camera.endPosition.z += this.mouseController.wheel.direction * 5
      this.camera.endPosition.x += (this.mouseController.cords.x)  * 3
      this.camera.endPosition.y -= (this.mouseController.cords.y)  * 3
    }
  }

  handleMousemove = () => {
    const speedCoefficient = {
      x: this.mouseController.isDrag ? 25 + Math.sqrt(this.mouseController.movement.x) : -1.25,
      y: this.mouseController.isDrag ? 20 + Math.sqrt(this.mouseController.movement.y) : -0.75
    }
    let newCameraPosition = {
      x: this.camera.endPosition.x + (this.mouseController.cordsPrev.x - this.mouseController.cords.x) * speedCoefficient.x,
      y: this.camera.endPosition.y - (this.mouseController.cordsPrev.y - this.mouseController.cords.y) * speedCoefficient.y
    }

    newCameraPosition = this.bordersStopper(newCameraPosition, speedCoefficient)
    this.camera.endPosition.x = newCameraPosition.x
    this.camera.endPosition.y = newCameraPosition.y
    this.camera.endPosition.x = Number(this.camera.endPosition.x.toFixed(4))
    this.camera.endPosition.y = Number(this.camera.endPosition.y.toFixed(4))
    console.log(this.camera.endPosition)
  }
  

  animate = () => {
    if (!this.camera.threeJS) return

    
    // this.camera.threeJS.position.x += (-this.camera.threeJS.position.x + this.camera.endPosition.x) * 0.03
    // this.camera.threeJS.position.y += (-this.camera.threeJS.position.y + this.camera.endPosition.y) * 0.03
    // this.camera.threeJS.position.z += (-this.camera.threeJS.position.z + this.camera.endPosition.z) * 0.08
    this.camera.xTo(this.camera.endPosition.x)
    this.camera.yTo(this.camera.endPosition.y)
    this.camera.zTo(this.camera.endPosition.z)
    requestAnimationFrame( this.animate );

    this.renderer.render( this.scene, this.camera.threeJS );
  }

  bordersStopper(position: Vector2, speed: Vector2) {
    // z = 20; max-w = 16; x = 0
    // z = 20; max-w = 32; x_max_left = -8; x_max_right = 8
    // z = 40; max-w = 32; x_max_left = -1; x_max_right = 1

    const max:Vector2 = {
      x: 8,
      y: 5.3
    }
    
   
    position.x = position.x > max.x || position.x < -max.x ? position.x / Math.abs(position.x) * max.x : position.x
    position.y = position.y > max.y || position.y < -max.y ? position.y / Math.abs(position.y) * max.y : position.y

    return position
  }
}