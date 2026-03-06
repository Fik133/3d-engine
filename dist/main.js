import { Matrix4x4, Vector2D, Vector3D, Vector4D } from "./types.js";
import { engineDraw, engineMath } from "./functions.js";
const canvas = document.getElementById("c");
const context = canvas.getContext("2d");
if (!context) {
    throw new Error("2D context not supported");
}
const canvasSize = new Vector2D(canvas.width, canvas.height);
let cameraPosition = new Vector3D(0, 20, -40);
let cameraRotation = new Vector3D(0, 0, 0);
const vertices = [
    new Vector3D(1, 1, 2),
    new Vector3D(-1, 1, 2),
    new Vector3D(-1, -1, 2),
    new Vector3D(1, -1, 2),
    new Vector3D(1, 1, 4),
    new Vector3D(-1, 1, 4),
    new Vector3D(-1, -1, 4),
    new Vector3D(1, -1, 4),
];
const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
];
let projectionMatrix = {
    matrix: new Matrix4x4(),
    fov: 75,
    aspect: canvasSize.x / canvasSize.y,
};
let viewMatrix = new Matrix4x4();
export function getViewMatrix() {
    return viewMatrix;
}
export function getProjectionMatrix() {
    return projectionMatrix;
}
const keysPressed = {};
window.addEventListener("keydown", (event) => {
    keysPressed[event.key] = true;
});
window.addEventListener("keyup", (event) => {
    keysPressed[event.key] = false;
});
canvas.addEventListener("click", () => {
    canvas.requestPointerLock();
});
let yaw = 0;
let pitch = 0;
document.addEventListener("mousemove", (e) => {
    if (document.pointerLockElement !== canvas)
        return;
    const sensitivity = 0.002;
    yaw += e.movementX * sensitivity;
    pitch += e.movementY * sensitivity;
    const maxPitch = Math.PI / 2 - 0.01;
    if (pitch > maxPitch)
        pitch = maxPitch;
    if (pitch < -maxPitch)
        pitch = -maxPitch;
    cameraRotation.x = pitch * (180 / Math.PI);
    cameraRotation.y = yaw * (180 / Math.PI);
});
function handleKeys() {
    const right = new Vector3D(viewMatrix.m[0][0], viewMatrix.m[0][1], viewMatrix.m[0][2]);
    const forward = new Vector3D(viewMatrix.m[2][0], viewMatrix.m[2][1], viewMatrix.m[2][2]);
    const speed = 0.7;
    if (keysPressed["w"]) {
        cameraPosition = cameraPosition.add(forward.multiply(speed));
    }
    if (keysPressed["s"]) {
        cameraPosition = cameraPosition.subtract(forward.multiply(speed));
    }
    if (keysPressed["a"]) {
        cameraPosition = cameraPosition.subtract(right.multiply(speed));
    }
    if (keysPressed["d"]) {
        cameraPosition = cameraPosition.add(right.multiply(speed));
    }
}
let time = 0;
function logic() {
    projectionMatrix.matrix = engineMath.buildProjectionMatrix(projectionMatrix.aspect, projectionMatrix.fov);
    const pitch = (cameraRotation.x * Math.PI) / 180;
    const yaw = (cameraRotation.y * Math.PI) / 180;
    const sinPitch = Math.sin(pitch);
    const cosPitch = Math.cos(pitch);
    const sinYaw = Math.sin(yaw);
    const cosYaw = Math.cos(yaw);
    const forward = new Vector3D(cosPitch * sinYaw, -sinPitch, cosPitch * cosYaw).normalize();
    const right = new Vector3D(cosYaw, 0, -sinYaw).normalize();
    const up = forward.cross(right).normalize();
    viewMatrix = engineMath.buildViewMatrix(right, up, forward, cameraPosition);
    const gridSize = 40;
    const tileSpacing = 3;
    const scale = 0.4;
    for (let x = -gridSize; x < gridSize; x++) {
        for (let z = -gridSize; z < gridSize; z++) {
            const worldX = x * tileSpacing;
            const worldZ = z * tileSpacing;
            const distance = Math.sqrt(worldX * worldX + worldZ * worldZ);
            const wave1 = Math.sin(distance * 0.25 - time) * 4;
            // const wave2 = Math.sin((worldX + time) * 0.15) * 2;
            // const wave3 = Math.sin((worldZ - time) * 0.18) * 2;
            // const height = wave1 + wave2 + wave3;
            const height = wave1;
            const tilePosition = new Vector3D(worldX, height, worldZ);
            const angle = new Vector3D(0, 0, 0);
            const modelMatrix = engineMath.buildModelMatrix(angle, tilePosition);
            edges.forEach((edge) => {
                const v1 = vertices[edge[0]];
                const v2 = vertices[edge[1]];
                const worldSpace1 = modelMatrix.multiply4DVector(new Vector4D(v1.x * scale, v1.y * scale, v1.z * scale, 1));
                const worldSpace2 = modelMatrix.multiply4DVector(new Vector4D(v2.x * scale, v2.y * scale, v2.z * scale, 1));
                const cameraSpace1 = engineMath.project(worldSpace1.x, worldSpace1.y, worldSpace1.z);
                const cameraSpace2 = engineMath.project(worldSpace2.x, worldSpace2.y, worldSpace2.z);
                if (cameraSpace1 && cameraSpace2) {
                    const start = engineMath.toPixel(cameraSpace1, canvasSize);
                    const end = engineMath.toPixel(cameraSpace2, canvasSize);
                    engineDraw.drawLine(start, end);
                }
            });
        }
    }
    time += 0.03;
}
engineDraw.setContext(context);
function animate() {
    context.fillStyle = "#ffffff";
    context.strokeStyle = "#00a6f9c5";
    context.fillRect(0, 0, canvas.width, canvas.height);
    handleKeys();
    logic();
    requestAnimationFrame(animate);
}
animate();
