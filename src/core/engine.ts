import { Vector2, Vector3, Vector4 } from "../types/vector.js";
import { getProjectionMatrix, getViewMatrix } from "./main.js";

export class EngineMath {
  constructor() {}
  private projectedPoint = new Vector4();
  screenSize = new Vector2(1000,1000);
  public toScreen(
    output: Vector2,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    output.x = (x + 1) * 0.5 * width;
    output.y = (1 - y) * 0.5 * height;
  }

  public project(output: Vector2, x: number, y: number, z: number): boolean {

    const vm = getViewMatrix();
    const proj = getProjectionMatrix();

    const point = this.projectedPoint;

    point.set(x,y,z,1);

    point.multiplyMatrix(vm).multiplyMatrix(proj);

    const NEAR_PLANE = 0.01;

    if(point.w <= NEAR_PLANE)
      return false;

    output.x = point.x / point.w;
    output.y = point.y / point.w;

    this.toScreen(output, output.x, output.y, this.screenSize.x, this.screenSize.y)

    return true;
  }

}

export class EngineDraw {
  context: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.context = ctx;
  }

  drawPoint(point: Vector2, radius: number) {
    const FULL_ROTATION = Math.PI * 2;

    const ctx = this.context;
    ctx.arc(point.x, point.y, radius, 0, FULL_ROTATION);
  }

  drawPointRect(output: Vector2, size: number) {
    this.context.fillRect(output.x - size/2, output.y - size/2, size, size);
}

  drawLine(from: Vector2, to: Vector2){
    const ctx = this.context;

    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
  }

  begin(){
    this.context.beginPath();
  }

  fill(){
    this.context.fill();
  }

  drawLines(){
    const ctx = this.context;
    ctx.stroke();
  }
}
