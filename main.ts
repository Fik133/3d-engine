import { engineFunctions, RotateAxis } from "./functions.js";
import { Matrix3x3, Matrix4x4, Vector2D, Vector3D, Vector4D } from "./types.js";
import { CelestialBody, generateSolarSystem, updatePhysics, getTrailLines } from "./solar.js";

const canvas = document.getElementById("c") as HTMLCanvasElement;
const context = canvas.getContext("2d");

if(!context){
    throw new Error("2D context not supported");
}

const canvasSize = new Vector2D(canvas.width, canvas.height);

let cameraPosition = new Vector3D(0, 100, 200); // Wyżej i dalej żeby widzieć cały układ
const cameraRotation = new Vector3D(30, 0, 0);  // Patrz lekko w dół

const keys: Record<string, boolean> = {};

window.addEventListener("keydown", (e) => keys[e.key] = true);
window.addEventListener("keyup", (e) => keys[e.key] = false);

canvas.addEventListener("click", () => canvas.requestPointerLock());

const MOUSE_SENSITIVITY = 0.1;

window.addEventListener("mousemove", (e) => {
    if(document.pointerLockElement === canvas){
        cameraRotation.y += e.movementX * MOUSE_SENSITIVITY;
        cameraRotation.x += e.movementY * MOUSE_SENSITIVITY;

        const MAX_PITCH = 89;
        cameraRotation.x = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, cameraRotation.x));
    }
});

export type projMatrixType = {
    matrix: Matrix4x4,
    fov: number,
    aspect: number
}

let viewMatrix = new Matrix4x4();
let fieldOfView = 90;
let aspectRatio = canvasSize.x / canvasSize.y;
let projectionMatrix = new Matrix4x4();

export function getProjectionMatrix() : projMatrixType{
return {matrix: projectionMatrix, fov: fieldOfView, aspect: aspectRatio};
}

export function getViewMatrix(){
return viewMatrix;
}

// === TUTAJ ZMIANA: Solar System zamiast asteroidów ===
const bodies = generateSolarSystem();

function logic(){
    const SPEED = 10; // Szybszy ruch bo większa skala

    projectionMatrix = engineFunctions.mathFunctions.buildProjectionMatrix(fieldOfView, aspectRatio);

    const yaw = cameraRotation.y * Math.PI / 180;
    const pitch = cameraRotation.x * Math.PI / 180;
        
    const forward = new Vector3D(
        Math.cos(pitch) * Math.sin(yaw),
        -Math.sin(pitch),
        Math.cos(yaw) * Math.cos(pitch)
    ).normalize();
    
    const right = new Vector3D(
        Math.cos(yaw),
        0,
        -Math.sin(yaw)
    ).normalize();
    
    const up = forward.cross(right).normalize();
    viewMatrix = engineFunctions.mathFunctions.buildViewMatrix(right, up, forward, cameraPosition);

    // Sterowanie kamerą
    if(keys["w"]) cameraPosition = cameraPosition.add(forward.multiply(SPEED));
    if(keys["s"]) cameraPosition = cameraPosition.subtract(forward.multiply(SPEED));
    if(keys["d"]) cameraPosition = cameraPosition.add(right.multiply(SPEED));
    if(keys["a"]) cameraPosition = cameraPosition.subtract(right.multiply(SPEED));
    if(keys[" "]) cameraPosition = cameraPosition.add(new Vector3D(0, SPEED, 0)); // Spacja = góra
    if(keys["Shift"]) cameraPosition = cameraPosition.subtract(new Vector3D(0, SPEED, 0)); // Shift = dół

    // === FIZYKA ===
    updatePhysics(bodies, 0.1);

    // === RENDEROWANIE CIAŁ NIEBIESKICH ===
    bodies.forEach(body => {
        const modelMatrix = engineFunctions.mathFunctions.buildModelMatrix(
            body.rotation, 
            body.position
        );

        // Rysuj krawędzie ciała
        context!.strokeStyle = body.color;
        context!.lineWidth = body.isSun ? 2 : 1;

        body.edges.forEach(edge => {
            const local1 = body.vertices[edge[0]];
            const local2 = body.vertices[edge[1]];

            const p1 = new Vector4D(local1.x, local1.y, local1.z, 1);
            const p2 = new Vector4D(local2.x, local2.y, local2.z, 1);

            const world1 = modelMatrix.multiply4DVector(p1);
            const world2 = modelMatrix.multiply4DVector(p2);

            const v1 = new Vector3D(world1.x, world1.y, world1.z);
            const v2 = new Vector3D(world2.x, world2.y, world2.z);

            const proj1 = engineFunctions.mathFunctions.project(cameraRotation, cameraPosition, v1);
            const proj2 = engineFunctions.mathFunctions.project(cameraRotation, cameraPosition, v2);

            if(proj1 && proj2){
                const start = engineFunctions.mathFunctions.toPixel(proj1, canvasSize);
                const end = engineFunctions.mathFunctions.toPixel(proj2, canvasSize);
                engineFunctions.drawFunctions.drawLine(start, end);
            }
        });

        // === RYSUJ TRAIL (ślad orbity) ===
        if(!body.isSun && body.trail.length > 1){
            const trails = getTrailLines(body);
            
            trails.forEach(({ start, end, alpha }) => {
                const proj1 = engineFunctions.mathFunctions.project(cameraRotation, cameraPosition, start);
                const proj2 = engineFunctions.mathFunctions.project(cameraRotation, cameraPosition, end);

                if(proj1 && proj2){
                    const px1 = engineFunctions.mathFunctions.toPixel(proj1, canvasSize);
                    const px2 = engineFunctions.mathFunctions.toPixel(proj2, canvasSize);

                    // Trail z zanikającą przezroczystością
                    context!.strokeStyle = body.color;
                    context!.globalAlpha = alpha * 0.5;
                    context!.lineWidth = 1;
                    engineFunctions.drawFunctions.drawLine(px1, px2);
                    context!.globalAlpha = 1;
                }
            });
        }
    });

    // Słońce - dodatkowa "poświata"
    const sun = bodies.find(b => b.isSun);
    if(sun){
        const sunProj = engineFunctions.mathFunctions.project(cameraRotation, cameraPosition, sun.position);
        if(sunProj){
            const sunPx = engineFunctions.mathFunctions.toPixel(sunProj, canvasSize);
            
            // Prosta poświata
            const gradient = context!.createRadialGradient(
                sunPx.x, sunPx.y, 0,
                sunPx.x, sunPx.y, 50
            );
            gradient.addColorStop(0, "rgba(255, 200, 50, 0.3)");
            gradient.addColorStop(1, "rgba(255, 200, 50, 0)");
            
            context!.fillStyle = gradient;
            context!.beginPath();
            context!.arc(sunPx.x, sunPx.y, 50, 0, Math.PI * 2);
            context!.fill();
        }
    }
}

function animate(): void {
    // Tło - ciemne z lekkim gradientem
    context!.fillStyle = "#0a0a15";
    context!.fillRect(0, 0, canvas.width, canvas.height);

    engineFunctions.drawFunctions.setContext(context);

    logic();

    requestAnimationFrame(animate);
}

animate();