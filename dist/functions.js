import { getProjectionMatrix, getViewMatrix } from "./main.js";
import { Matrix3x3, Matrix4x4, Vector2D, Vector3D, Vector4D } from "./types.js";
export var RotateAxis;
(function (RotateAxis) {
    RotateAxis["X_AXIS"] = "x_axis";
    RotateAxis["Y_AXIS"] = "Y_axis";
    RotateAxis["Z_AXIS"] = "Z_axis";
})(RotateAxis || (RotateAxis = {}));
class EngineMath {
    toPixel(a, b, c, d) {
        if (a instanceof Vector2D && b instanceof Vector2D) {
            return this.toPixel(a.x, a.y, b.x, b.y);
        }
        const x = a;
        const y = b;
        const width = c;
        const height = d;
        const ndcX = (x + 1) * 0.5 * width;
        const ndcY = (1 - y) * 0.5 * height;
        return new Vector2D(ndcX, ndcY);
    }
    project(a, b, c) {
        if (a instanceof Vector3D) {
            return this.project(a.x, a.y, a.z);
        }
        const worldX = a;
        const worldY = b;
        const worldZ = c;
        const viewMatrix = getViewMatrix();
        const worldSpace = new Vector4D(worldX, worldY, worldZ, 1);
        const cameraSpace = viewMatrix.multiply4DVector(worldSpace);
        const clipSpace = getProjectionMatrix().matrix.multiply4DVector(cameraSpace);
        const NEAR_PLANE = 0.01;
        const x = clipSpace.x;
        const y = clipSpace.y;
        const z = clipSpace.z;
        const w = clipSpace.w;
        if (w <= NEAR_PLANE)
            return null;
        return new Vector2D(x / w, y / w);
    }
    rotate(axis, point, angle, center) {
        const realCenter = center !== null && center !== void 0 ? center : new Vector3D(0, 0, 0);
        let result;
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
    rotateX(point, angle) {
        const rotationSignature = [
            [1, 0, 0],
            [0, Math.cos(angle), -Math.sin(angle)],
            [0, Math.sin(angle), Math.cos(angle)],
        ];
        const rotationMatrix = new Matrix3x3(rotationSignature);
        return rotationMatrix.multiply3DVector(point);
    }
    rotateY(point, angle) {
        const rotationSignature = [
            [Math.cos(angle), 0, Math.sin(angle)],
            [0, 1, 0],
            [-Math.sin(angle), 0, Math.cos(angle)],
        ];
        const rotationMatrix = new Matrix3x3(rotationSignature);
        return rotationMatrix.multiply3DVector(point);
    }
    rotateZ(point, angle) {
        const rotationSignature = [
            [Math.cos(angle), -Math.sin(angle), 0],
            [Math.sin(angle), Math.cos(angle), 0],
            [0, 0, 1],
        ];
        const rotationMatrix = new Matrix3x3(rotationSignature);
        return rotationMatrix.multiply3DVector(point);
    }
    rotateAroundX(point, center, angle) {
        let result = point.subtract(center);
        result = this.rotateX(result, angle);
        return result.add(center);
    }
    rotateAroundY(point, center, angle) {
        let result = point.subtract(center);
        result = this.rotateY(result, angle);
        return result.add(center);
    }
    rotateAroundZ(point, center, angle) {
        let result = point.subtract(center);
        result = this.rotateZ(result, angle);
        return result.add(center);
    }
    buildModelMatrix(angle, position) {
        const rx = buildRotationX(angle.x);
        const ry = buildRotationY(angle.y);
        const rz = buildRotationZ(angle.z);
        const modelMatrix = rz.multiplyMatrix(ry).multiplyMatrix(rx);
        modelMatrix.m[0][3] = position.x;
        modelMatrix.m[1][3] = position.y;
        modelMatrix.m[2][3] = position.z;
        return modelMatrix;
    }
    buildViewMatrix(right, up, forward, cameraPosition) {
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
    buildProjectionMatrix(aspect, fov) {
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
    constructor() {
        this.context = null;
    }
    setContext(context) {
        this.context = context;
    }
    drawPoint(a, b, c) {
        const ctx = this.context;
        if (!ctx) {
            return;
        }
        if (a instanceof Vector2D) {
            return this.drawPoint(a.x, a.y, b);
        }
        const x = a;
        const y = b;
        const radius = c;
        const FULL_ROTATION = Math.PI * 2;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, FULL_ROTATION);
        ctx.fill();
    }
    drawLine(from, to) {
        const ctx = this.context;
        if (!ctx)
            return;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
    }
}
function buildRotationX(angle) {
    const s = Math.sin(angle);
    const c = Math.cos(angle);
    return new Matrix4x4([
        [1, 0, 0, 0],
        [0, c, -s, 0],
        [0, s, c, 0],
        [0, 0, 0, 1],
    ]);
}
function buildRotationY(angle) {
    const s = Math.sin(angle);
    const c = Math.cos(angle);
    return new Matrix4x4([
        [c, 0, s, 0],
        [0, 1, 0, 0],
        [-s, 0, c, 0],
        [0, 0, 0, 1],
    ]);
}
function buildRotationZ(angle) {
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
