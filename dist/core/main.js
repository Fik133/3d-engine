import { Matrix4 } from "../types/matrix.js";
import { Angle, Vector2, Vector3 } from "../types/vector.js";
import { Input } from "../utils/input.js";
import { drawMatrixHUD } from "../utils/utils.js";
import { EngineDraw, EngineMath } from "./engine.js";
const canvas = document.getElementById("c");
if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("Couldn't find canvas element");
}
const ctx = canvas.getContext("2d");
if (!ctx) {
    throw new Error("Couldn't get canvas context");
}
const engineDraw = new EngineDraw(ctx);
const engineMath = new EngineMath();
const width = canvas.width;
const height = canvas.height;
engineMath.screenSize = new Vector2(width, height);
let projectionMatrix = new Matrix4();
let fieldOfView = 120;
const aspect = width / height;
let viewMatrix = new Matrix4();
export function getProjectionMatrix() {
    return projectionMatrix;
}
export function getViewMatrix() {
    return viewMatrix;
}
const vertices = [
    new Vector3(0.5, 0.5, 0.5),
    new Vector3(-0.5, 0.5, 0.5),
    new Vector3(-0.5, -0.5, 0.5),
    new Vector3(0.5, -0.5, 0.5),
    new Vector3(0.5, 0.5, -0.5),
    new Vector3(-0.5, 0.5, -0.5),
    new Vector3(-0.5, -0.5, -0.5),
    new Vector3(0.5, -0.5, -0.5),
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
    [4, 0],
    [5, 1],
    [6, 2],
    [7, 3],
];
let modelMatrix = new Matrix4();
let forwardVector = new Vector3();
let rightVector = new Vector3();
let upVector = new Vector3();
const cameraPosition = new Vector3(0, 0, 0);
const cameraRotation = new Angle(0, 0, 0);
Input.init();
let currentModel1 = new Vector3();
let currentModel2 = new Vector3();
const startPosition = new Vector3(0, 0, 0);
let deltaPosition = new Vector3(0, 0, 0);
const rotation = new Angle(0, 0, 0);
let time = 0;
function drawing() {
    //rotation.pitch += 0.01;
    //rotation.yaw += 0.05;
    rotation.roll += 0.05;
    //rotation.pitch += 0.01
    let output = new Vector2();
    let output1 = new Vector2();
    let output2 = new Vector2();
    Input.handleRotation(cameraRotation, 0.005);
    forwardVector.lookAt(cameraRotation).normalize();
    rightVector.right(cameraRotation).normalize();
    upVector = forwardVector.clone().cross(rightVector).normalize();
    Input.handleMovement(cameraPosition, forwardVector, rightVector, 0.5);
    projectionMatrix.projectionMatrix((fieldOfView * Math.PI) / 180, aspect, 0.1, 1000);
    viewMatrix.viewMatrix(cameraPosition, rightVector, upVector, forwardVector);
    engineDraw.begin();
    const donutWorldPosition = new Vector3(0, 0, 0);
    modelMatrix.modelMatrix(rotation, donutWorldPosition, 1);
    const size = 50;
    const spacing = 0.5;
    time += 0.1;
    for (let x = -size / 2; x < size / 2; x++) {
        for (let z = -size / 2; z < size / 2; z++) {
            const angleSmall = x * 0.3 + time; // Odpowiada za "grubość" pączka
            const angleBig = z * 0.15; // Odpowiada za "główny" obwód pączka
            const radiusSmall = 3.0; // Jak gruby jest pączek (rura)
            const radiusBig = 15.0; // Jak wielka jest dziura w pączku
            // 1. Zwijamy w rurkę (mały okrąg) i odsuwamy o wielki promień
            const tubeX = radiusBig + Math.cos(angleSmall) * radiusSmall;
            const tubeY = Math.sin(angleSmall) * radiusSmall;
            // 2. Bierzemy tę rurkę i zwijamy z niej Oponkę (duży okrąg, rotacja po osi Y)
            const finalX = tubeX * Math.cos(angleBig + time * 0.5); // Obracamy go powoli w czasie
            const finalY = tubeY;
            const finalZ = tubeX * Math.sin(angleBig + time * 0.5);
            deltaPosition.set(finalX, finalY, finalZ);
            deltaPosition.applyMatrix4(modelMatrix);
            const p1 = engineMath.project(output, deltaPosition.x, deltaPosition.y, deltaPosition.z);
            if (p1) {
                engineDraw.drawPointRect(output, 1.2);
            }
        }
    }
    engineDraw.fill();
}
function animate() {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.fillStyle = "red";
    drawMatrixHUD(viewMatrix.elements, "View Matrix");
    drawing();
    requestAnimationFrame(animate);
}
animate();
