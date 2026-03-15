import { Matrix4 } from "./matrix";

export class Vector3 {
  x: number;
  y: number;
  z: number;

  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  set(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;

    return this;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  dot(b: Vector3) {
    return b.x * this.x + b.y * this.y + b.z * this.z;
  }

  cross(b: Vector3): this {
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

  public applyMatrix4(mat: Matrix4) {
    const e = mat.elements;
    const w = 1;

    const vec = this.clone();

    this.x = vec.x * e[0] + vec.y * e[1] + vec.z * e[2] + w * e[3];
    this.y = vec.x * e[4] + vec.y * e[5] + vec.z * e[6] + w * e[7];
    this.z = vec.x * e[8] + vec.y * e[9] + vec.z * e[10] + w * e[11];
    //vec.x * e[12] + vec.y * e[13] + vec.z * e[14] + w * e[15]; for vec4

    return this;
  }

  scale(scaler: number){
    this.x *= scaler;
    this.y *= scaler;
    this.z *= scaler;

    return this;
  }

  clone() {
    return new Vector3(this.x, this.y, this.z);
  }

  lookAt(rotation: Angle) {
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

  right(rotation: Angle) {
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

  normalize(): this {
    const length = Math.sqrt(
      this.x * this.x + this.y * this.y + this.z * this.z,
    );

    if (length > 0.000001) {
      const invLength = 1.0 / length;

      this.x *= invLength;
      this.y *= invLength;
      this.z *= invLength;
    } else {
      this.x = 0;
      this.y = 0;
      this.z = 0;
    }

    return this;
  }
}

export class Vector2 {
  x: number;
  y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  set(x: number, y: number) {
    this.x = x;
    this.y = y;

    return this;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  dot(to: Vector2) {
    return to.x * this.x + to.y * this.y + to.x * this.x;
  }
}

export class Vector4 {
  x: number;
  y: number;
  z: number;
  w: number;

  constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  multiplyMatrix(mat: Matrix4): this {
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

  set(x: number, y: number, z: number, w: number){
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;

    return this;
  }
}
export class Angle {
  yaw: number;
  pitch: number;
  roll: number;

  constructor(y: number = 0, p: number = 0, r: number = 0) {
    this.yaw = y;
    this.pitch = p;
    this.roll = r;
  }

  set(y: number, p: number, r: number) {
    this.yaw = y;
    this.pitch = p;
    this.roll = r;

    return this;
  }

  setYaw(val: number) {
    this.yaw = val;
    return this;
  }

  setPitch(val: number) {
    this.pitch = val;
    return this;
  }

  setRoll(val: number) {
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

  toVector(): Vector3 {
    return new Vector3(this.yaw, this.pitch, this.roll);
  }

  clone(): Angle {
    return new Angle(this.yaw, this.pitch, this.roll);
  }
}
