export class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    dot(b) {
        return b.x * this.x + b.y * this.y + b.z * this.z;
    }
    cross(b) {
        const ax = this.x;
        const ay = this.y;
        const az = this.z;
        const bx = b.x;
        const by = b.y;
        const bz = b.z;
        this.x = ay * bz - az * by;
        this.y = az * bx - ax * bz;
        this.z = ax * by - ay * bx;
        return this;
    }
    applyMatrix4(mat) {
        const e = mat.elements;
        const w = 1;
        const vec = this.clone();
        this.x = vec.x * e[0] + vec.y * e[1] + vec.z * e[2] + w * e[3];
        this.y = vec.x * e[4] + vec.y * e[5] + vec.z * e[6] + w * e[7];
        this.z = vec.x * e[8] + vec.y * e[9] + vec.z * e[10] + w * e[11];
        //vec.x * e[12] + vec.y * e[13] + vec.z * e[14] + w * e[15]; for vec4
        return this;
    }
    scale(scaler) {
        this.x *= scaler;
        this.y *= scaler;
        this.z *= scaler;
        return this;
    }
    clone() {
        return new Vector3(this.x, this.y, this.z);
    }
    lookAt(rotation) {
        const yaw = rotation.yaw;
        const pitch = rotation.pitch;
        const roll = rotation.roll;
        const sinPitch = Math.sin(pitch);
        const cosPitch = Math.cos(pitch);
        const sinYaw = Math.sin(yaw);
        const cosYaw = Math.cos(yaw);
        const sinRoll = Math.sin(roll);
        const cosRoll = Math.cos(roll);
        this.x = cosPitch * sinYaw * cosRoll + sinRoll * sinPitch;
        this.y = cosPitch * sinYaw * sinRoll - cosRoll * sinPitch;
        this.z = cosPitch * cosYaw;
        return this;
    }
    right(rotation) {
        const yaw = rotation.yaw;
        const roll = rotation.roll;
        const sinYaw = Math.sin(yaw);
        const cosYaw = Math.cos(yaw);
        const sinRoll = Math.sin(roll);
        const cosRoll = Math.cos(roll);
        this.x = cosYaw * cosRoll;
        this.y = cosYaw * sinRoll;
        this.z = -sinYaw;
        return this;
    }
    normalize() {
        const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        if (length > 0.000001) {
            const invLength = 1.0 / length;
            this.x *= invLength;
            this.y *= invLength;
            this.z *= invLength;
        }
        else {
            this.x = 0;
            this.y = 0;
            this.z = 0;
        }
        return this;
    }
}
export class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    dot(to) {
        return to.x * this.x + to.y * this.y + to.x * this.x;
    }
}
export class Vector4 {
    constructor(x = 0, y = 0, z = 0, w = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    multiplyMatrix(mat) {
        const e = mat.elements;
        const oldX = this.x;
        const oldY = this.y;
        const oldZ = this.z;
        const oldW = this.w;
        this.x = oldX * e[0] + oldY * e[1] + oldZ * e[2] + oldW * e[3];
        this.y = oldX * e[4] + oldY * e[5] + oldZ * e[6] + oldW * e[7];
        this.z = oldX * e[8] + oldY * e[9] + oldZ * e[10] + oldW * e[11];
        this.w = oldX * e[12] + oldY * e[13] + oldZ * e[14] + oldW * e[15];
        return this;
    }
    set(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        return this;
    }
}
export class Angle {
    constructor(y = 0, p = 0, r = 0) {
        this.yaw = y;
        this.pitch = p;
        this.roll = r;
    }
    set(y, p, r) {
        this.yaw = y;
        this.pitch = p;
        this.roll = r;
        return this;
    }
    setYaw(val) {
        this.yaw = val;
        return this;
    }
    setPitch(val) {
        this.pitch = val;
        return this;
    }
    setRoll(val) {
        this.roll = val;
        return this;
    }
    toRad() {
        const degreeToRad = Math.PI / 180;
        this.yaw *= degreeToRad;
        this.pitch *= degreeToRad;
        this.roll *= degreeToRad;
        return this;
    }
    toDegree() {
        const radToDegree = 180 / Math.PI;
        this.yaw *= radToDegree;
        this.pitch *= radToDegree;
        this.roll *= radToDegree;
        return this;
    }
    toVector() {
        return new Vector3(this.yaw, this.pitch, this.roll);
    }
    clone() {
        return new Angle(this.yaw, this.pitch, this.roll);
    }
}
