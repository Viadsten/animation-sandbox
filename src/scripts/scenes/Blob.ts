import Matter from 'matter-js'
import gsap from 'gsap';
import Paper from 'paper';

let Render = Matter.Render;
let Engine = Matter.Engine;
let Bodies = Matter.Bodies;
let Body = Matter.Body;
let Composite = Matter.Composite;
let Runner = Matter.Runner;
let Constraint = Matter.Constraint;

class WorldRender {
  constructor(engine, container) {
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

const CIRCLES_VARS = {
 count: 800,
 size: 11
}

const wallsOptions = {
  isStatic: true,
  friction: 1,
  restitution: 1,
  thickness: 200,
  fillStyle: '#060a19',
};

const svgPath = 'M416.5,269.5Q421,299,398.5,319Q376,339,364.5,367Q353,395,320.5,391Q288,387,264,410Q240,433,205.5,443.5Q171,454,153.5,418.5Q136,383,110.5,367.5Q85,352,49.5,332.5Q14,313,22,276.5Q30,240,40,209Q50,178,83,164Q116,150,122,118Q128,86,157.5,82Q187,78,213.5,69.5Q240,61,269.5,60.5Q299,60,319.5,81Q340,102,359.5,120.5Q379,139,407,158Q435,177,423.5,208.5Q412,240,416.5,269.5Z'

export class BlobScene {
  constructor() {
    this.container = document.querySelector('[data-scene="blob"]');
    if (!this.container) {
      return;
    }

    this.circles = [];
    this.anchors = []
    this.links = []
    this.mouse = {x: 0, y: 0}

    this.init = this.init.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this)
    // resizeObserver.subscribe(this.init);
    this.init();
  }

  handleMouseMove(evt) {
    this.mouse.x = evt.clientX
    this.mouse.y = evt.clientY
    Body.set(this.cursor, "position", {x: evt.clientX, y: evt.clientY})
  }

  initPaper() {
    this.paperCanvas = document.querySelector('#paper-canvas')
    this.project = new Paper.Project(this.paperCanvas)
  }

  addObjects() {
    this.initPaper()
    this.pp = new Paper.Path(svgPath)
    this.pp.fillColor = '#333333'
 
    this.number = this.pp._segments.length

    // this.center = Bodies.circle(window.innerWidth / 2 - 15, window.innerHeight / 2 - 15, 3, {
    //   isStatic: true
    // })
    // Composite.add(this.world, this.center);

    for (let i = 0; i < this.number; i++) {
      const circle = Bodies.circle(
        window.innerWidth / 2 - this.pp._segments[i].point.x + 200,
        window.innerHeight / 2 - this.pp._segments[i].point.y + 230,
        10, {
          render: {
            fillStyle: '#333333'
          },
        }
      )
      this.circles.push(circle)
      Composite.add(this.world, circle);

      const anchor = Bodies.circle(
        window.innerWidth / 2 - this.pp._segments[i].point.x + 200,
        window.innerHeight / 2 - this.pp._segments[i].point.y + 230,
        10, {
          density: 0.005,
          restitution: 0
        }
      )
      this.anchors.push(anchor)
    }

    for (let i = 0; i < this.number; i++) {
      let next = this.circles[i + 1] ? this.circles[i + 1] : this.circles[0]
      const link = Constraint.create({
        bodyA: this.circles[i],
        bodyB: this.anchors[i],
        stiffness: 0.01
      })
      this.links.push(link)
      
      const linkDouble = Constraint.create({
        bodyA: this.circles[i],
        bodyB: next,
        stiffness: 1
      })
      this.links.push(linkDouble)

      // const linkCenter = Constraint.create({
      //   bodyA: this.circles[i],
      //   bodyB: this.center,
      //   stiffness: 0.01
      // })
      // this.links.push(linkCenter)

      let nextNext = this.circles[(i + 2)%this.number]
      const linkNextNext = Constraint.create({
        bodyA: this.circles[i],
        bodyB: nextNext,
        stiffness: 0.04
      })
      this.links.push(linkNextNext)
    }

    this.cursor = Bodies.circle(
      300,
      300,
      50, {
        render: {
          fillStyle: '#333333'
        },
      }
    )
    Composite.add(this.world, this.cursor);
    Composite.add(this.world, this.links);
  } 

  renderLoop() {
    this.pp.smooth()
    for (let i = 0; i < this.number; i++) {
      this.pp._segments[i].point.x = this.circles[i].position.x
      this.pp._segments[i].point.y = this.circles[i].position.y
    }

    requestAnimationFrame(this.renderLoop.bind(this))
  }

  init() {
    this.engine = Engine.create({enableSleeping: false});
    this.engine.timing.timeScale = 0.85;
    this.world = this.engine.world;
    this.world.gravity.x = 0
    this.world.gravity.y = 0
    this.canvasRender = new WorldRender(this.engine, this.container);
    this.size = this.canvasRender.containerRect;

    // this.addBodies();
    Runner.run(this.engine);
    Render.run(this.canvasRender.render);

    this.addObjects()
    window.addEventListener('mousemove', this.handleMouseMove)
    this.renderLoop()
  }
}
