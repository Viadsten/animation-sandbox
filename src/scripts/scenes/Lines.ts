import Paper from 'paper'
import { Point } from 'paper/dist/paper-core'
import type { Coordinates2d } from '../../types'
import gsap from "gsap"

const LINE_VARS = {
  amount: 120,
  color: '#333333',
  width: 1,
  stretching: 80,
  verticalLimiter: 0.25,
  pinOffset: 10
}

export class LinesScene {
  canvas: HTMLCanvasElement | null
  project: paper.Project
  group: paper.Group
  path: paper.Path
  circle: paper.Path.Circle
  mouse: Coordinates2d
  xSet: ReturnType<typeof gsap.quickSetter> 
  ySet: ReturnType<typeof gsap.quickSetter> 

  constructor() {
    this.canvas = document.querySelector('[data-scene="lines"] canvas')
    if (!this.canvas) return
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    
    this.project = new Paper.Project(this.canvas)
    this.group = new Paper.Group();  
    this.mouse = {x: 0, y: 0}

    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.checkIntersections = this.checkIntersections.bind(this)
    this.unpinLine = this.unpinLine.bind(this)
    
    this.createLine()
    window.addEventListener('mousemove', this.handleMouseMove)
    this.render()
  }

  createLine() {
    for (let j = 0; j < LINE_VARS.amount; j++) {
      const line  = new Paper.Path({
        parent: this.group,
        strokeColor: LINE_VARS.color,
        strokeWidth: LINE_VARS.width
      });
      for (let i = 0; i <= 2; i++) {
        line.add(
          new Point(
            0 + window.innerWidth / LINE_VARS.amount * j, 
            window.innerHeight * i / 2
          )
        )
      }
      line.xSet = gsap.quickSetter(line.segments[1].point, "x")
      line.ySet = gsap.quickSetter(line.segments[1].point, "y")
    }
  }

  handleMouseMove(evt: MouseEvent) {
    this.mouse = {
      x: evt.clientX,
      y: evt.clientY
    }

    this.checkIntersections()
  }

  checkIntersections() {
    this.group.children.map((line) => {
      if (Math.ceil(line.segments[0].point.x) + LINE_VARS.pinOffset > this.mouse.x
          && Math.ceil(line.segments[0].point.x) - LINE_VARS.pinOffset < this.mouse.x) {
        line.pinned = true
      }
      if (line.pinned) {
        if (Math.abs(line.segments[0].point.x - line.segments[1].point.x) > LINE_VARS.stretching) {
          this.unpinLine(line)
        } else {
          if (line.timeline) {
            line.timeline.kill()
          }
          line.xSet(this.mouse.x + 1 > line.segments[1].point.x
            ? this.mouse.x - LINE_VARS.pinOffset
            : this.mouse.x + LINE_VARS.pinOffset)
          line.ySet(
            gsap.utils.clamp(
              window.innerHeight * (0 + LINE_VARS.verticalLimiter), 
              window.innerHeight * (1 - LINE_VARS.verticalLimiter), 
              this.mouse.y
            )
          )
        }
      }
    })
  }

  unpinLine(line: paper.Path) {
    if (line.timeline) {
      line.timeline.kill()
    }
    line.timeline = gsap.to(line.segments[1].point, {
      x: line.segments[0].point.x,
      y: window.innerHeight / 2,
      ease: "elastic.out(1, 0.31)",
      duration: 3.7
    })
    line.pinned = false
  }
  

  render() {
    this.group.children.map(
      (item) => item.smooth({ type: "geometric", factor: 0.55 })
    )
    requestAnimationFrame(this.render.bind(this))
  }
}