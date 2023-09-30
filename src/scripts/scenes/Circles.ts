import Paper from 'paper'


const CIRCLES_VARS = {
  number: 70,
  minRadius: 40,
  stroke: {
    width: 4,
    color: '#fff'
  },
  easeMultiplier: 0.3
}

export class CirclesScene {
  canvas: HTMLCanvasElement | null
  ctx: CanvasRenderingContext2D
  project: typeof Paper.project
  circles: paper.Group
  mouse: {
    x: number,
    y: number
  }

  constructor() {
    this.canvas = document.querySelector('[data-scene="circles"] canvas')
    if (!this.canvas) return
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight

    this.mouse = { 
      x: window.innerWidth / 2, 
      y: window.innerHeight / 2
    }
    this.project = new Paper.Project(this.canvas)
    this.circles = new Paper.Group()

    this.handleMouseMove = this.handleMouseMove.bind(this)

    this.createCircles()
    this.updateCircles()
    window.addEventListener('mousemove', this.handleMouseMove)
  }

  createCircles() {
    for (var i = 1; i < CIRCLES_VARS.number; i++) {
      new Paper.Path.Circle({
        radius:  i * CIRCLES_VARS.minRadius,
        position: Paper.view.center,
        strokeColor: CIRCLES_VARS.stroke.color,
        strokeWidth: CIRCLES_VARS.stroke.width,
        parent:  this.circles,
      });
    };
  }

  handleMouseMove(evt: MouseEvent) {
    this.mouse = {
      x: evt.clientX,
      y: evt.clientY,
    }
  }

  updateCircles() {
    this.circles.children.map((circle, index) => {
      circle.position.x += (this.mouse.x - circle.position.x) * CIRCLES_VARS.easeMultiplier / (index / 2)
      circle.position.y += (this.mouse.y - circle.position.y) * CIRCLES_VARS.easeMultiplier / (index / 2)
    })
    requestAnimationFrame(this.updateCircles.bind(this))
  }
}