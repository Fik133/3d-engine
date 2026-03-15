import { Vector2, Vector4 } from "../types/vector.js";
import { getProjectionMatrix, getViewMatrix } from "./main.js";
export class EngineMath {
    constructor() {
        this.projectedPoint = new Vector4();
        this.screenSize = new Vector2(1000, 1000);
    }
    toScreen(output, x, y, width, height) {
        output.x = (x + 1) * 0.5 * width;
        output.y = (1 - y) * 0.5 * height;
    }
    project(output, x, y, z) {
        const vm = getViewMatrix();
        const proj = getProjectionMatrix();
        const point = this.projectedPoint;
        point.set(x, y, z, 1);
        point.multiplyMatrix(vm).multiplyMatrix(proj);
        const NEAR_PLANE = 0.01;
        if (point.w <= NEAR_PLANE)
            return false;
        output.x = point.x / point.w;
        output.y = point.y / point.w;
        this.toScreen(output, output.x, output.y, this.screenSize.x, this.screenSize.y);
        return true;
    }
}
export class EngineDraw {
    constructor(ctx) {
        this.context = ctx;
    }
    drawPoint(point, radius) {
        const FULL_ROTATION = Math.PI * 2;
        const ctx = this.context;
        ctx.arc(point.x, point.y, radius, 0, FULL_ROTATION);
    }
    drawPointRect(output, size) {
        this.context.fillRect(output.x - size / 2, output.y - size / 2, size, size);
    }
    drawLine(from, to) {
        const ctx = this.context;
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
    }
    begin() {
        this.context.beginPath();
    }
    fill() {
        this.context.fill();
    }
    drawLines() {
        const ctx = this.context;
        ctx.stroke();
    }
}
