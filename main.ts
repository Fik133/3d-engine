import { engineFunctions, RotateAxis } from "./functions.js";
import { Matrix3x3, Vector2D, Vector3D } from "./types.js";

const canvas = document.getElementById("c") as HTMLCanvasElement;

const context = canvas.getContext("2d");

if(!context){
    throw new Error("2D context not supported");
}

const point: Vector3D = new Vector3D(1,1,2);

type Asteroid = {
    vertices: Vector3D[];
    edges: number[][];
    position: Vector3D;
    rotation: Vector3D;
    rotationSpeed: Vector3D;
    color: string
};

function generateAsteroid(radius: number, roughness: number){

    const PHI = (1 + Math.sqrt(5)) / 2;

    const baseVertices = [

        new Vector3D(-1,  PHI, 0),
        new Vector3D( 1,  PHI, 0),
        new Vector3D(-1, -PHI, 0),
        new Vector3D( 1, -PHI, 0),

        new Vector3D(0, -1,  PHI),
        new Vector3D(0,  1,  PHI),
        new Vector3D(0, -1, -PHI),
        new Vector3D(0,  1, -PHI),

        new Vector3D( PHI, 0, -1),
        new Vector3D( PHI, 0,  1),
        new Vector3D(-PHI, 0, -1),
        new Vector3D(-PHI, 0,  1),
    ];

    const faces = [

        [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
        [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
        [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
        [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]
    ];

    const vertices: Vector3D[] = [];

    baseVertices.forEach(v => {

        // normalizacja do jednostkowej sfery
        const normalized = v.normalize();

        // losowe przesunięcie wzdłuż normalnej
        const displacement = (Math.random()) * roughness;

        const final = normalized.multiply(radius + displacement);

        vertices.push(final);
    });

    const edges: number[][] = [];

    faces.forEach(face => {
        edges.push([face[0], face[1]]);
        edges.push([face[1], face[2]]);
        edges.push([face[2], face[0]]);
    });

    return { vertices, edges };
}


function generateAsteroidField(count: number): Asteroid[] {

    const asteroids: Asteroid[] = [];

    for(let i = 0; i < count; i++){

        const radius = 1 + Math.random() * 10;
        const roughness = 0.8 + Math.random() * 1.5;

        const { vertices, edges } = generateAsteroid(radius, roughness);
        const hue = Math.random() * 60;
        const color = `hsl(${hue}, 70%, 55%)`;
        
        asteroids.push({
            vertices,
            edges,
            position: new Vector3D(
                (Math.random() - 0.5) * 250,
                (Math.random() -0.5) * 250,
                (Math.random() - 0.5) * 250
            ),
            rotation: new Vector3D(0,0,0),
            rotationSpeed: new Vector3D(
                (Math.random() - 0.5) * 0.01,
                (Math.random() - 0.5) * 0.01,
                (Math.random() - 0.5) * 0.01
            ),
            color: color.toString()
        });
    }

    return asteroids;
}

const asteroids = generateAsteroidField(500);


const canvasSize = new Vector2D(canvas.width, canvas.height);

let angle = 0;

let cameraPosition = new Vector3D(0,0,5);
const cameraRotation = new Vector3D(0,0,0);

const keys: Record<string, boolean> = {};

window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

canvas.addEventListener("click", () => {
    canvas.requestPointerLock();
});

const MOUSE_SENSITIVITY = 0.1;

window.addEventListener("mousemove", (e) => {
    if(document.pointerLockElement === canvas){

        cameraRotation.y += e.movementX * MOUSE_SENSITIVITY;
        cameraRotation.x += e.movementY * MOUSE_SENSITIVITY;

        const MAX_PITCH = 89;
        if(cameraRotation.x > MAX_PITCH) cameraRotation.x = MAX_PITCH;
        if(cameraRotation.x < -MAX_PITCH) cameraRotation.x = -MAX_PITCH;
    }
});

function logic(){

    const SPEED = 0.2;

    const yaw = cameraRotation.y * Math.PI / 180;
    const pitch = cameraRotation.x * Math.PI / 180;

    const worldUp = new Vector3D(0,1,0);

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

    const forwardProject = engineFunctions.mathFunctions.project(cameraRotation, cameraPosition, cameraPosition.add(forward));
    const forwardToPixel = engineFunctions.mathFunctions.toPixel(forwardProject, canvasSize);

    if(forwardProject){
        engineFunctions.drawFunctions.drawPoint(forwardToPixel , 4);
    }

    if(keys["w"]) cameraPosition = cameraPosition.add(forward.multiply(SPEED));
    if(keys["s"]) cameraPosition = cameraPosition.subtract(forward.multiply(SPEED));
    if(keys["d"]) cameraPosition = cameraPosition.add(right.multiply(SPEED));
    if(keys["a"]) cameraPosition = cameraPosition.subtract(right.multiply(SPEED));

    context!.strokeStyle = "#ff914d";

    context.fillStyle = "#ff914d";
    context.lineWidth = 1;

    asteroids.forEach(ast => {

    // aktualizacja rotacji
    ast.rotation = ast.rotation.add(ast.rotationSpeed);

    ast.edges.forEach(edge => {

        let v1 = ast.vertices[edge[0]];
        let v2 = ast.vertices[edge[1]];
        const SPEED = 1;


        // rotacje lokalne
        v1 = engineFunctions.mathFunctions.rotate(RotateAxis.X_AXIS, v1, ast.rotation.x);
        v1 = engineFunctions.mathFunctions.rotate(RotateAxis.Y_AXIS, v1, ast.rotation.y);
        v1 = engineFunctions.mathFunctions.rotate(RotateAxis.Z_AXIS, v1, ast.rotation.z);
        
        v2 = engineFunctions.mathFunctions.rotate(RotateAxis.X_AXIS, v2, ast.rotation.x);
        v2 = engineFunctions.mathFunctions.rotate(RotateAxis.Y_AXIS, v2, ast.rotation.y);
        v2 = engineFunctions.mathFunctions.rotate(RotateAxis.Z_AXIS, v2, ast.rotation.z);

        // przesunięcie w świat
        v1 = v1.add(ast.position);
        v2 = v2.add(ast.position);

        const p1 = engineFunctions.mathFunctions.project(cameraRotation, cameraPosition, v1);
        const p2 = engineFunctions.mathFunctions.project(cameraRotation, cameraPosition, v2);

        if(p1 && p2){
            const start = engineFunctions.mathFunctions.toPixel(p1, canvasSize);
            const end = engineFunctions.mathFunctions.toPixel(p2, canvasSize);

            context.strokeStyle = ast.color;
            engineFunctions.drawFunctions.drawLine(start, end);
        }
    });
});
}

function animate(): void {
    context!.clearRect(0,0, context!.canvas.width, context!.canvas.height);

    engineFunctions.drawFunctions.setContext(context);

    logic();

    requestAnimationFrame(animate)
}

animate();