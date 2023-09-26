import Matter from 'matter-js'
import gsap from 'gsap';

let Render = Matter.Render;
let Engine = Matter.Engine;
let Bodies = Matter.Bodies;
let Body = Matter.Body;
let Composite = Matter.Composite;
let Runner = Matter.Runner;
let Sleeping = Matter.Sleeping;

let prevEvent, currentEvent;
document.documentElement.onmousemove=function(event){
  currentEvent=event;
}

let maxSpeed = 0
let prevSpeed = 0
let maxPositiveAcc = 0
let maxNegativeAcc = 0
let speed = 0
let acceleration = 0


setInterval(function(){
  if(prevEvent && currentEvent){
    var movementX=Math.abs(currentEvent.screenX-prevEvent.screenX);
    var movementY=Math.abs(currentEvent.screenY-prevEvent.screenY);
    var movement=Math.sqrt(movementX*movementX+movementY*movementY);
    
    //speed=movement/100ms= movement/0.1s= 10*movement/s
    speed=10*movement;//current speed
    
    acceleration=10*(speed-prevSpeed);
  }
  
  prevEvent=currentEvent;
  prevSpeed=speed;
},50);

let maxScaleValue = 30
let minScaleValue = 1
let currentScaleValue = 1

function scaleMouseCircle() {
  // if (currentScaleValue <= maxScaleValue && acceleration > 0) {
  //   const newScale = currentScaleValue * (1 + gsap.utils.clamp(-20, 20, acceleration / 1000))
  //   currentScaleValue = gsap.utils.clamp(minScaleValue, maxScaleValue, newScale)
  // } else if (acceleration < 0 && currentScaleValue > 1) {
  //   const newScale = currentScaleValue * (1 + gsap.utils.clamp(-20, 20, acceleration / 1000))
  //   currentScaleValue = gsap.utils.clamp(minScaleValue, maxScaleValue, newScale)
  // }
  // Body.scale(window.mouseBody, currentScaleValue, currentScaleValue)
  // console.log(currentScaleValue)

  // if (currentScaleValue <= maxScaleValue && acceleration > 0) {
  //   const newScale = gsap.utils.clamp(1, 70, acceleration / 1000)
  //   currentScaleValue = currentScaleValue * newScale > maxScaleValue ? maxScaleValue : currentScaleValue * newScale
  //   Body.scale(window.mouseBody, newScale, newScale)
  //   // console.log( gsap.utils.clamp(1, 70, acceleration / 1000));
  // } else if (acceleration < 0 && currentScaleValue > minScaleValue) {
  //   const newScale = -1 / gsap.utils.clamp(-70, -1, acceleration / 1000)
  //   // console.log(newScale)
  //   currentScaleValue = currentScaleValue * newScale < minScaleValue ? minScaleValue : currentScaleValue * newScale
  //   Body.scale(window.mouseBody, newScale, newScale)
  // }
  console.log(currentScaleValue)

  requestAnimationFrame(scaleMouseCircle)
}

setTimeout(() => {
  scaleMouseCircle()
})

class WorldRender {
  engine: Matter.Engine
  container: HTMLElement
  containerRect: DOMRect

  constructor(engine: Matter.Engine, container: HTMLElement) {
    this.container = container;
    this.containerRect = this.container.getBoundingClientRect();

    this.engine = engine;
    this.init = this.init.bind(this);

    this.init();
  }

  init() {
    this.render = Render.create({
      element: this.container,
      engine: this.engine,
      options: {
        pixelRatio: window.devicePixelRatio,
        width: this.containerRect.width,
        height: this.containerRect.height,
        // showPerformance: true,
        background: 'transparent',
        wireframes: false,
        showSleeping: false,
      },
    });
  }
}

const borderRadiusCoefficient = 4.2;
const mobileCoefficient = 1.5;
const desktopVp = 1440;
const CIRCLES_VARS = {
 count: 800,
 size: 11
}
const MOUSE_CIRCLE_VARS = {
  size: 100
}

const wallsOptions = {
  isStatic: true,
  friction: 1,
  restitution: 1,
  thickness: 200,
  fillStyle: '#060a19',
};

export class LiquidBox {
  container: HTMLElement | null

  constructor() {
    this.container = document.querySelector('[data-scene="liquid-box"]');
    if (!this.container) {
      return;
    }

    this.vp767 = window.matchMedia('(max-width: 767px)');
    this.pixelRate = () => this.vp767.matches ? (window.innerWidth / desktopVp) * mobileCoefficient : (window.innerWidth / desktopVp);
    this.circles = [];

    this.init = this.init.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this)
    // resizeObserver.subscribe(this.init);
    this.init();
  }

  handleMouseMove(evt) {
    // console.log(speed)
    Body.set(this.mouseBody, "position", {x: evt.clientX, y: evt.clientY})
    // Body.scale(this.mouseBody, 0.91, 0.91)
  }

  addCircle() {
    const body = Bodies.circle(
      gsap.utils.random(0, window.innerWidth), gsap.utils.random(0, window.innerHeight), CIRCLES_VARS.size, {
        friction: 0,
        restitution: 1,
        frictionAir: 0,
        // inertia: 300,
        mass: 10,
        render: {        
        fillStyle: '#FFFFFF',
      },
    });
    Composite.add(this.world, body);
    this.circles.push(body);
  }

  addBodies() {
    // add walls
    Composite.add(this.world, [
      // top
      Bodies.rectangle(this.size.width / 2, -this.size.height / 2 - wallsOptions.thickness / 2, this.size.width, wallsOptions.thickness, wallsOptions),
      // right
      Bodies.rectangle(this.size.width + wallsOptions.thickness / 2 + 1, 0, wallsOptions.thickness, this.size.height * 2, wallsOptions),
      // bottom
      Bodies.rectangle(this.size.width / 2, this.size.height + wallsOptions.thickness / 2, this.size.width, wallsOptions.thickness, wallsOptions),
      // left
      Bodies.rectangle(-wallsOptions.thickness / 2 - 1, 0, wallsOptions.thickness, this.size.height * 2, wallsOptions)
    ]);

    // add circles
    for (let i = 0; i < CIRCLES_VARS.count; i++) {
      this.addCircle()
    }

    this.mouseBody = Bodies.circle(
      0, 0, MOUSE_CIRCLE_VARS.size, {
        friction: 1,
        isStatic: true,
        restitution: 1,
        mass: 500,
        render: {        
        fillStyle: '#fff',
        opacity: 0
      },
    });
    Composite.add(this.world, this.mouseBody);
    window.mouseBody = this.mouseBody
  }

  clearMatter() {
    Render.stop(this.canvasRender.render);
    // World.clear(this.engine.world);
    Engine.clear(this.engine);
    this.canvasRender.render.canvas.remove();
    this.canvasRender.render.canvas = null;
    this.canvasRender.render.context = null;
    this.canvasRender.render.textures = {};
    this.canvasRender = null;
    this.circles = [];
  }

  setSleeping(state) {
    this.bodies.map((body) => Sleeping.set(body, state));
  }

  init() {
    if (this.canvasRender) {
      this._clearMatter();
    }
    this.engine = Engine.create({enableSleeping: true});
    this.engine.timing.timeScale = 0.85;
    this.world = this.engine.world;
    this.canvasRender = new WorldRender(this.engine, this.container);
    this.size = this.canvasRender.containerRect;

    this.addBodies();
    // this._setMouseControl();
    Runner.run(this.engine);
    Render.run(this.canvasRender.render);
    Runner.isFixed = true;
    Runner.delta = 50;

    window.addEventListener('mousemove', this.handleMouseMove)
  }
}