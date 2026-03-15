export class Matrix3 {
    constructor() {
        this.elements = new Float32Array(9);
        this.elements[0] = 1;
        this.elements[4] = 1;
        this.elements[8] = 1;
    }
    set(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
        const e = this.elements;
        e[0] = m00;
        e[1] = m01;
        e[2] = m02;
        e[3] = m10;
        e[4] = m11;
        e[5] = m12;
        e[6] = m20;
        e[7] = m21;
        e[8] = m22;
        return this;
    }
    multiply(other) {
        const e = this.elements;
        const o = other.elements;
        const a00 = e[0], a01 = e[1], a02 = e[2];
        const a10 = e[3], a11 = e[4], a12 = e[5];
        const a20 = e[6], a21 = e[7], a22 = e[8];
        const b00 = o[0], b01 = o[1], b02 = o[2];
        const b10 = o[3], b11 = o[4], b12 = o[5];
        const b20 = o[6], b21 = o[7], b22 = o[8];
        e[0] = b00 * a00 + b10 * a01 + b20 * a02;
        e[3] = b00 * a10 + b10 * a11 + b20 * a12;
        e[6] = b00 * a20 + b10 * a21 + b20 * a22;
        e[1] = b01 * a00 + b11 * a01 + b21 * a02;
        e[4] = b01 * a10 + b11 * a11 + b21 * a12;
        e[7] = b01 * a20 + b11 * a21 + b21 * a22;
        e[2] = b02 * a00 + b12 * a01 + b22 * a02;
        e[5] = b02 * a10 + b12 * a11 + b22 * a12;
        e[8] = b02 * a20 + b12 * a21 + b22 * a22;
        return this;
    }
    multiplyMatrices(a, b) {
        const ae = a.elements;
        const be = b.elements;
        const te = this.elements;
        const a00 = ae[0], a01 = ae[1], a02 = ae[2];
        const a10 = ae[3], a11 = ae[4], a12 = ae[5];
        const a20 = ae[6], a21 = ae[7], a22 = ae[8];
        const b00 = be[0], b01 = be[1], b02 = be[2];
        const b10 = be[3], b11 = be[4], b12 = be[5];
        const b20 = be[6], b21 = be[7], b22 = be[8];
        te[0] = b00 * a00 + b10 * a01 + b20 * a02;
        te[1] = b01 * a00 + b11 * a01 + b21 * a02;
        te[2] = b02 * a00 + b12 * a01 + b22 * a02;
        te[3] = b00 * a10 + b10 * a11 + b20 * a12;
        te[4] = b01 * a10 + b11 * a11 + b21 * a12;
        te[5] = b02 * a10 + b12 * a11 + b22 * a12;
        te[6] = b00 * a20 + b10 * a21 + b20 * a22;
        te[7] = b01 * a20 + b11 * a21 + b21 * a22;
        te[8] = b02 * a20 + b12 * a21 + b22 * a22;
        return this;
    }
    identity() {
        const e = this.elements;
        e[0] = 1;
        e[1] = 0;
        e[2] = 0;
        e[3] = 0;
        e[4] = 1;
        e[5] = 0;
        e[6] = 0;
        e[7] = 0;
        e[8] = 1;
        return this;
    }
}
export class Matrix4 {
    constructor() {
        this.elements = new Float32Array(16);
        this.elements[0] = 1;
        this.elements[5] = 1;
        this.elements[10] = 1;
        this.elements[15] = 1;
    }
    set(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
        const e = this.elements;
        e[0] = m00;
        e[1] = m01;
        e[2] = m02;
        e[3] = m03;
        e[4] = m10;
        e[5] = m11;
        e[6] = m12;
        e[7] = m13;
        e[8] = m20;
        e[9] = m21;
        e[10] = m22;
        e[11] = m23;
        e[12] = m30;
        e[13] = m31;
        e[14] = m32;
        e[15] = m33;
        return this;
    }
    multiplyMatrices(a, b) {
        const ae = a.elements;
        const be = b.elements;
        const te = this.elements;
        const a00 = ae[0], a01 = ae[1], a02 = ae[2], a03 = ae[3];
        const a10 = ae[4], a11 = ae[5], a12 = ae[6], a13 = ae[7];
        const a20 = ae[8], a21 = ae[9], a22 = ae[10], a23 = ae[11];
        const a30 = ae[12], a31 = ae[13], a32 = ae[14], a33 = ae[15];
        const b00 = be[0], b01 = be[1], b02 = be[2], b03 = be[3];
        const b10 = be[4], b11 = be[5], b12 = be[6], b13 = be[7];
        const b20 = be[8], b21 = be[9], b22 = be[10], b23 = be[11];
        const b30 = be[12], b31 = be[13], b32 = be[14], b33 = be[15];
        te[0] = b00 * a00 + b10 * a01 + b20 * a02 + b30 * a03;
        te[4] = b00 * a10 + b10 * a11 + b20 * a12 + b30 * a13;
        te[8] = b00 * a20 + b10 * a21 + b20 * a22 + b30 * a23;
        te[12] = b00 * a30 + b10 * a31 + b20 * a32 + b30 * a33;
        te[1] = b01 * a00 + b11 * a01 + b21 * a02 + b31 * a03;
        te[5] = b01 * a10 + b11 * a11 + b21 * a12 + b31 * a13;
        te[9] = b01 * a20 + b11 * a21 + b21 * a22 + b31 * a23;
        te[13] = b01 * a30 + b11 * a31 + b21 * a32 + b31 * a33;
        te[2] = b02 * a00 + b12 * a01 + b22 * a02 + b32 * a03;
        te[6] = b02 * a10 + b12 * a11 + b22 * a12 + b32 * a13;
        te[10] = b02 * a20 + b12 * a21 + b22 * a22 + b32 * a23;
        te[14] = b02 * a30 + b12 * a31 + b22 * a32 + b32 * a33;
        te[3] = b03 * a00 + b13 * a01 + b23 * a02 + b33 * a03;
        te[7] = b03 * a10 + b13 * a11 + b23 * a12 + b33 * a13;
        te[11] = b03 * a20 + b13 * a21 + b23 * a22 + b33 * a23;
        te[15] = b03 * a30 + b13 * a31 + b23 * a32 + b33 * a33;
        return this;
    }
    rotateX(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const e = this.elements;
        const m01 = e[1], m02 = e[2];
        const m11 = e[5], m12 = e[6];
        const m21 = e[9], m22 = e[10];
        const m31 = e[13], m32 = e[14];
        e[1] = m01 * c + m02 * s;
        e[2] = m02 * c - m01 * s;
        e[5] = m11 * c + m12 * s;
        e[6] = m12 * c - m11 * s;
        e[9] = m21 * c + m22 * s;
        e[10] = m22 * c - m21 * s;
        e[13] = m31 * c + m32 * s;
        e[14] = m32 * c - m31 * s;
        return this;
    }
    rotateY(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const e = this.elements;
        const m00 = e[0], m02 = e[2];
        const m10 = e[4], m12 = e[6];
        const m20 = e[8], m22 = e[10];
        const m30 = e[12], m32 = e[14];
        e[0] = m00 * c - m02 * s;
        e[2] = m00 * s + m02 * c;
        e[4] = m10 * c - m12 * s;
        e[6] = m10 * s + m12 * c;
        e[8] = m20 * c - m22 * s;
        e[10] = m20 * s + m22 * c;
        e[12] = m30 * c - m32 * s;
        e[14] = m30 * s + m32 * c;
        return this;
    }
    rotateZ(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const e = this.elements;
        const m00 = e[0], m01 = e[1];
        const m10 = e[4], m11 = e[5];
        const m20 = e[8], m21 = e[9];
        const m30 = e[12], m31 = e[13];
        e[0] = m00 * c + m01 * s;
        e[1] = m01 * c - m00 * s;
        e[4] = m10 * c + m11 * s;
        e[5] = m11 * c - m10 * s;
        e[8] = m20 * c + m21 * s;
        e[9] = m21 * c - m20 * s;
        e[12] = m30 * c + m31 * s;
        e[13] = m31 * c - m30 * s;
        return this;
    }
    identity() {
        const e = this.elements;
        e[0] = 1;
        e[1] = 0;
        e[2] = 0;
        e[3] = 0;
        e[4] = 0;
        e[5] = 1;
        e[6] = 0;
        e[7] = 0;
        e[8] = 0;
        e[9] = 0;
        e[10] = 1;
        e[11] = 0;
        e[12] = 0;
        e[13] = 0;
        e[14] = 0;
        e[15] = 1;
        return this;
    }
    translate(x, y, z) {
        const e = this.elements;
        const tx = e[3];
        const ty = e[7];
        const tz = e[11];
        const tw = e[15];
        e[3] = e[0] * x + e[1] * y + e[2] * z + tx;
        e[7] = e[4] * x + e[5] * y + e[6] * z + ty;
        e[11] = e[8] * x + e[9] * y + e[10] * z + tz;
        e[15] = e[12] * x + e[13] * y + e[14] * z + tw;
        return this;
    }
    modelMatrix(rotation, position, scale) {
        this.identity();
        this.rotateZ(rotation.roll).rotateY(rotation.yaw).rotateX(rotation.pitch);
        const a = 1 / scale;
        this.elements[3] = position.x * a;
        this.elements[7] = position.y * a;
        this.elements[11] = position.z * a;
    }
    projectionMatrix(fovRadians, aspect, zNear, zFar) {
        this.identity();
        const f = 1.0 / Math.tan(fovRadians / 2.0);
        const rangeInv = 1.0 / (zFar - zNear);
        const e = this.elements;
        e[0] = f / aspect;
        e[1] = 0;
        e[2] = 0;
        e[3] = 0;
        e[4] = 0;
        e[5] = f;
        e[6] = 0;
        e[7] = 0;
        e[8] = 0;
        e[9] = 0;
        e[10] = -2.0 * zFar * zNear * rangeInv;
        e[11] = (zFar + zNear) * rangeInv;
        e[12] = 0;
        e[13] = 0;
        e[14] = 1;
        e[15] = 0.0;
        return this;
    }
    viewMatrix(cameraPosition, right, up, forward) {
        this.identity();
        const e = this.elements;
        e[0] = right.x;
        e[1] = right.y;
        e[2] = right.z;
        e[3] = -right.dot(cameraPosition);
        e[4] = up.x;
        e[5] = up.y;
        e[6] = up.z;
        e[7] = -up.dot(cameraPosition);
        e[8] = forward.x;
        e[9] = forward.y;
        e[10] = forward.z;
        e[11] = -forward.dot(cameraPosition);
        e[12] = 0;
        e[13] = 0;
        e[14] = 0;
        e[15] = 1;
    }
}
