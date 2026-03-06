import { getProjectionMatrix, getViewMatrix } from "./main.js";
import { Matrix3x3, Matrix4x4, Vector2D, Vector3D, Vector4D } from "./types.js";

export enum RotateAxis {
  X_AXIS = "x_axis",
  Y_AXIS = "Y_axis",
  Z_AXIS = "Z_axis",
}

class EngineMath {
  public toPixel(x: number, y: number, width: number, height: number): Vector2D;
  public toPixel(point: Vector2D, canvasSize: Vector2D): Vector2D;

  public toPixel(a: any, b: any, c?: number, d?: number): Vector2D {
    if (a instanceof Vector2D && b instanceof Vector2D) {
      return this.toPixel(a.x, a.y, b.x, b.y);
    }

    const x = a as number;
    const y = b as number;
    const width = c as number;
    const height = d as number;

    const ndcX = (x + 1) * 0.5 * width;
    const ndcY = (1 - y) * 0.5 * height;

    return new Vector2D(ndcX, ndcY);
  }

  public project(x: number, y: number, z: number): Vector2D | null;
  public project(point: Vector3D): Vector2D | null;

  public project(
    a: number | Vector3D,
    b?: number,
    c?: number,
  ): Vector2D | null {
    if (a instanceof Vector3D) {
      return this.project(a.x, a.y, a.z);
    }

    const worldX = a as number;
    const worldY = b as number;
    const worldZ = c as number;

    const viewMatrix = getViewMatrix();

    const worldSpace = new Vector4D(worldX, worldY, worldZ, 1);

    const cameraSpace = viewMatrix.multiply4DVector(worldSpace);

    const clipSpace =
      getProjectionMatrix().matrix.multiply4DVector(cameraSpace);

    const NEAR_PLANE = 0.01;

    const x = clipSpace.x;
    const y = clipSpace.y;
    const z = clipSpace.z;
    const w = clipSpace.w;

    if (w <= NEAR_PLANE) return null;

    return new Vector2D(x / w, y / w);
  }

  public rotate(
    axis: RotateAxis,
    point: Vector3D,
    angle: number,
    center?: Vector3D,
  ) {
    const realCenter = center ?? new Vector3D(0, 0, 0);

    let result: Vector3D;

    switch (axis) {
      case RotateAxis.X_AXIS:
        result = this.rotateAroundX(point, realCenter, angle);
        break;
      case RotateAxis.Y_AXIS:
        result = this.rotateAroundY(point, realCenter, angle);
        break;
      case RotateAxis.Z_AXIS:
        result = this.rotateAroundZ(point, realCenter, angle);
        break;
      default:
        throw new Error(`Provided invalid parameter ${axis}.`);
        break;
    }

    return result;
  }

  private rotateX(point: Vector3D, angle: number): Vector3D {
    const rotationSignature = [
      [1, 0, 0],
      [0, Math.cos(angle), -Math.sin(angle)],
      [0, Math.sin(angle), Math.cos(angle)],
    ];

    const rotationMatrix: Matrix3x3 = new Matrix3x3(rotationSignature);

    return rotationMatrix.multiply3DVector(point);
  }
  private rotateY(point: Vector3D, angle: number) {
    const rotationSignature = [
      [Math.cos(angle), 0, Math.sin(angle)],
      [0, 1, 0],
      [-Math.sin(angle), 0, Math.cos(angle)],
    ];

    const rotationMatrix: Matrix3x3 = new Matrix3x3(rotationSignature);

    return rotationMatrix.multiply3DVector(point);
  }
  private rotateZ(point: Vector3D, angle: number) {
    const rotationSignature = [
      [Math.cos(angle), -Math.sin(angle), 0],
      [Math.sin(angle), Math.cos(angle), 0],
      [0, 0, 1],
    ];

    const rotationMatrix: Matrix3x3 = new Matrix3x3(rotationSignature);

    return rotationMatrix.multiply3DVector(point);
  }

  private rotateAroundX(point: Vector3D, center: Vector3D, angle: number) {
    let result = point.subtract(center);

    result = this.rotateX(result, angle);

    return result.add(center);
  }

  private rotateAroundY(point: Vector3D, center: Vector3D, angle: number) {
    let result = point.subtract(center);

    result = this.rotateY(result, angle);

    return result.add(center);
  }

  private rotateAroundZ(point: Vector3D, center: Vector3D, angle: number) {
    let result = point.subtract(center);

    result = this.rotateZ(result, angle);

    return result.add(center);
  }

  public buildModelMatrix(angle: Vector3D, position: Vector3D) {
    const rx = buildRotationX(angle.x);
    const ry = buildRotationY(angle.y);
    const rz = buildRotationZ(angle.z);

    const modelMatrix = rz.multiplyMatrix(ry).multiplyMatrix(rx);

    modelMatrix.m[0][3] = position.x;
    modelMatrix.m[1][3] = position.y;
    modelMatrix.m[2][3] = position.z;

    return modelMatrix;
  }

  public buildViewMatrix(
    right: Vector3D,
    up: Vector3D,
    forward: Vector3D,
    cameraPosition: Vector3D,
  ) {
    const viewMatrix = new Matrix4x4();

    viewMatrix.m[0][0] = right.x;
    viewMatrix.m[0][1] = right.y;
    viewMatrix.m[0][2] = right.z;
    viewMatrix.m[0][3] = -cameraPosition.dot(right);

    viewMatrix.m[1][0] = up.x;
    viewMatrix.m[1][1] = up.y;
    viewMatrix.m[1][2] = up.z;
    viewMatrix.m[1][3] = -cameraPosition.dot(up);

    viewMatrix.m[2][0] = forward.x;
    viewMatrix.m[2][1] = forward.y;
    viewMatrix.m[2][2] = forward.z;
    viewMatrix.m[2][3] = -cameraPosition.dot(forward);

    viewMatrix.m[3][0] = 0;
    viewMatrix.m[3][1] = 0;
    viewMatrix.m[3][2] = 0;
    viewMatrix.m[3][3] = 1;

    return viewMatrix;
  }
  
  public buildProjectionMatrix(aspect: number, fov: number) {
    const rad = fov * (Math.PI / 180);
    const d = 1 / Math.tan(rad / 2);

    return new Matrix4x4([
      [d / aspect, 0, 0, 0],
      [0, d, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
    ]);
  }
}

class EngineDraw {
  private context: CanvasRenderingContext2D | null = null;

  public setContext(context: CanvasRenderingContext2D) {
    this.context = context;
  }

  public drawPoint(x: number, y: number, radius: number): void;
  public drawPoint(point: Vector2D, radius: number): void;

  public drawPoint(a: any, b: any, c?: any): void {
    const ctx = this.context;

    if (!ctx) {
      return;
    }

    if (a instanceof Vector2D) {
      return this.drawPoint(a.x, a.y, b);
    }

    const x = a as number;
    const y = b as number;
    const radius = c as number;

    const FULL_ROTATION = Math.PI * 2;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, FULL_ROTATION);
    ctx.fill();
  }

  public drawLine(from: Vector2D, to: Vector2D): void {
    const ctx = this.context;

    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }
}

function buildRotationX(angle: number): Matrix4x4 {
  const s = Math.sin(angle);
  const c = Math.cos(angle);

  return new Matrix4x4([
    [1, 0, 0, 0],
    [0, c, -s, 0],
    [0, s, c, 0],
    [0, 0, 0, 1],
  ]);
}

function buildRotationY(angle: number): Matrix4x4 {
  const s = Math.sin(angle);
  const c = Math.cos(angle);

  return new Matrix4x4([
    [c, 0, s, 0],
    [0, 1, 0, 0],
    [-s, 0, c, 0],
    [0, 0, 0, 1],
  ]);
}

function buildRotationZ(angle: number): Matrix4x4 {
  const s = Math.sin(angle);
  const c = Math.cos(angle);

  return new Matrix4x4([
    [c, -s, 0, 0],
    [s, c, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ]);
}

export const engineDraw = new EngineDraw();
export const engineMath = new EngineMath();
