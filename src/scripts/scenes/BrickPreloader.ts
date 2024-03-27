
export class BrickPreloader {
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  boxSize: number = 10; // Adjust size as needed
  boxArr: { x: number; y: number; alpha: number }[] = [];
  animationDuration: number = 3000; // 3 seconds
  startTime: number = 0;

  constructor() {
    this.canvas = document.querySelector(
      '[data-scene="brick-preloader"] canvas'
    ) as HTMLCanvasElement;
    if (this.canvas) {
      this.ctx = this.canvas.getContext("2d");
      if (this.ctx) {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.generateBoxes();
        this.startAnimation();
      } else {
        console.error("getContext('2d') failed");
      }
    } else {
      console.error("Canvas element not found");
    }
  }

  generateBoxes() {
    const numBoxesX = Math.ceil(this.canvas!.width / this.boxSize);
    const numBoxesY = Math.ceil(this.canvas!.height / this.boxSize);
    for (let y = 0; y < numBoxesY; y++) {
      for (let x = 0; x < numBoxesX; x++) {
        const xPos = x * this.boxSize;
        const yPos = y * this.boxSize;
        const alpha = 1;
        this.boxArr.push({ x: xPos, y: yPos, alpha });
      }
    }
  }

  startAnimation = () => {
    this.startTime = performance.now();
    requestAnimationFrame(this.animate.bind(this));
  }

  animate(currentTime: number) {
    const elapsedTime = currentTime - this.startTime;
    if (elapsedTime >= this.animationDuration) {
      return;
    }

    const progress = elapsedTime / this.animationDuration;

    this.ctx!.fillStyle = "#000"; // black color
    this.ctx!.fillRect(0, 0, this.canvas!.width, this.canvas!.height);

    this.boxArr.forEach((box) => {
      if (Math.random() < progress) {
        box.alpha = Math.max(0, box.alpha - 0.01);
      }
      this.ctx!.fillStyle = `rgba(0, 0, 0, ${box.alpha})`;
      this.ctx!.fillRect(box.x, box.y, this.boxSize, this.boxSize);
    });

    requestAnimationFrame(this.animate.bind(this));
  }
}

