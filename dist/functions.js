import { Matrix3x3, Vector2D, Vector3D } from "./types.js";
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
    project(cameraRotation, cameraPosition, a, b, c) {
        if (a instanceof Vector3D) {
            return this.project(cameraRotation, cameraPosition, a.x, a.y, a.z);
        }
        const x = a;
        const y = b;
        const z = c;
        let relative = new Vector3D(x - cameraPosition.x, y - cameraPosition.y, z - cameraPosition.z);
        const yaw = cameraRotation.y * Math.PI / 180;
        const pitch = cameraRotation.x * Math.PI / 180;
        const forward = new Vector3D(Math.cos(pitch) * Math.sin(yaw), -Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)).normalize();
        const right = new Vector3D(Math.cos(yaw), 0, -Math.sin(yaw)).normalize();
        const up = forward.cross(right).normalize();
        {
            const x = relative.dot(right);
            const y = relative.dot(up);
            const z = relative.dot(forward);
            const NEAR_PLANE = 0.1;
            if (z <= NEAR_PLANE)
                return null;
            return new Vector2D(x / z, y / z);
        }
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
            [0, Math.sin(angle), Math.cos(angle)]
        ];
        const rotationMatrix = new Matrix3x3(rotationSignature);
        return rotationMatrix.multiply3DVector(point);
    }
    rotateY(point, angle) {
        const rotationSignature = [
            [Math.cos(angle), 0, Math.sin(angle)],
            [0, 1, 0],
            [-Math.sin(angle), 0, Math.cos(angle)]
        ];
        const rotationMatrix = new Matrix3x3(rotationSignature);
        return rotationMatrix.multiply3DVector(point);
    }
    rotateZ(point, angle) {
        const rotationSignature = [
            [Math.cos(angle), -Math.sin(angle), 0],
            [Math.sin(angle), Math.cos(angle), 0],
            [0, 0, 1]
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
export class EngineFunctions {
    constructor() {
        this.mathFunctions = new EngineMath;
        this.drawFunctions = new EngineDraw;
    }
    setContext(context) {
        this.drawFunctions.setContext(context);
    }
}
export const engineFunctions = new EngineFunctions();
