import gsap from "gsap"

const SPEED = 0.15
const VELOCITY_LIMITER = window.innerWidth / 3.5
interface Coordinates2d {
  x: number,
  y: number
}

export class Cursor {
  cursor: HTMLDivElement | null
  mouse: Coordinates2d
  pos: Coordinates2d
  velocity: Coordinates2d
  xSet: ReturnType<typeof gsap.quickSetter> 
  ySet: ReturnType<typeof gsap.quickSetter> 
  scaleXSet: ReturnType<typeof gsap.quickSetter> 
  scaleYSet: ReturnType<typeof gsap.quickSetter> 
  rotateSet: ReturnType<typeof gsap.quickSetter> 

  constructor() {
    this.cursor = document.querySelector('[data-cursor]')
    if (!this.cursor) return

    this.mouse = { x: 0, y: 0 }
    this.pos = { x: 0, y: 0 }
    this.velocity = { x: 0, y: 0 }

    this.calculatePosition = this.calculatePosition.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)

    this.xSet = gsap.quickSetter(this.cursor, "x", "px")
    this.ySet = gsap.quickSetter(this.cursor, "y", "px")
    this.scaleXSet = gsap.quickSetter(this.cursor, "scaleX")
    this.scaleYSet = gsap.quickSetter(this.cursor, "scaleY")
    this.rotateSet = gsap.quickSetter(this.cursor, "rotate", 'deg')
    this.setEvents()
  }

  handleMouseMove(evt: MouseEvent) {
    this.mouse = {
      x: evt.clientX,
      y: evt.clientY
    }
  }

  calculatePosition() {
    const dt = (1.0 - Math.pow(1.0 - SPEED, gsap.ticker.deltaRatio()))
  
    this.pos.x += (this.mouse.x - this.pos.x) * dt
    this.pos.y += (this.mouse.y - this.pos.y) * dt
    this.velocity.x = this.mouse.x - this.pos.x
    this.velocity.y = this.mouse.y - this.pos.y

    const distance = Math.sqrt(Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2) )
    const scale = Math.min(distance / VELOCITY_LIMITER, 0.35)
    const angle = Math.atan(this.velocity.y / this.velocity.x) * 180 / Math.PI

    this.xSet(this.pos.x)
    this.ySet(this.pos.y)
    this.scaleXSet(1 + scale)
    this.scaleYSet(1 - scale)
    this.rotateSet(angle)
  }

  setEvents() {
    window.addEventListener('mousemove', this.handleMouseMove)
    gsap.ticker.add(this.calculatePosition)
  }
}