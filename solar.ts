import { Vector3D } from "./types.js";

export type CelestialBody = {
    vertices: Vector3D[];
    edges: number[][];
    position: Vector3D;
    velocity: Vector3D;
    rotation: Vector3D;
    rotationSpeed: Vector3D;
    mass: number;
    radius: number;
    color: string;
    trail: Vector3D[];
    isSun: boolean;
};

const G = 50; // Stała grawitacyjna (dostosowana do symulacji)
const MAX_TRAIL = 100;

export function generateSolarSystem(): CelestialBody[] {
    const bodies: CelestialBody[] = [];
    
    // Słońce
    bodies.push(createBody({
        radius: 8,
        position: new Vector3D(0, 0, 0),
        velocity: new Vector3D(0, 0, 0),
        mass: 1000000,
        color: "hsl(45, 100%, 60%)",
        isSun: true
    }));
    
    // Planety - [odległość, prędkość orbitalna, rozmiar, masa, kolor]
    const planets: [number, number, number, number, string][] = [
        [5000,  2.8,  1.0,  10, "hsl(30, 50%, 50%)"],   // Merkury
        [4500,  2.3,  1.5,  20, "hsl(45, 60%, 70%)"],   // Wenus
        [6000/3,  2.0,  1.8,  25, "hsl(210, 70%, 55%)"],  // Ziemia
        [5300/3,  1.7,  1.3,  15, "hsl(15, 70%, 50%)"],   // Mars
        [3400, 1.3,  4.0,  200, "hsl(35, 60%, 65%)"],  // Jowisz
        [1500/3, 1.0,  3.5,  150, "hsl(45, 50%, 70%)"],  // Saturn
    ];
    


    const SUN_MASS = 1000000;

    planets.forEach(([dist, orbitalVelocity, radius, mass, color]) => {
        const angle = Math.random() * Math.PI * 2;

        // Prędkość orbitalna z fizyki: v = sqrt(G * M / r)
        const orbitalSpeed = Math.sqrt(G * SUN_MASS / dist);

        bodies.push(createBody({
            radius: 1/3*mass,
            position: new Vector3D(
                Math.cos(angle) * dist,
                (Math.random() - 0.5) * 1000,
                Math.sin(angle) * dist
            ),
            velocity: new Vector3D(
                -Math.sin(angle) * orbitalSpeed,
                0,
                Math.cos(angle) * orbitalSpeed
            ),
            mass,
            color,
            isSun: false
        }));
    });
    
    // Kilka komet z eliptycznymi orbitami
    for (let i = 0; i < 3; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 80 + Math.random() * 100;
        
        bodies.push(createBody({
            radius: 1/3*100,
            position: new Vector3D(
                Math.cos(angle) * dist,
                (Math.random() - 0.5) * 50,
                Math.sin(angle) * dist
            ),
            velocity: new Vector3D(
                -Math.sin(angle) * 1.5 + (Math.random() - 0.5),
                (Math.random() - 0.5) * 0.5,
                Math.cos(angle) * 1.5 + (Math.random() - 0.5)
            ),
            mass: 100,
            color: "hsl(200, 80%, 80%)",
            isSun: false
        }));
    }
    
    return bodies;
}

function createBody(opts: {
    radius: number;
    position: Vector3D;
    velocity: Vector3D;
    mass: number;
    color: string;
    isSun: boolean;
}): CelestialBody {
    const { vertices, edges } = generateSphere(opts.radius, opts.isSun ? 2 : 1);
    
    return {
        vertices,
        edges,
        position: opts.position,
        velocity: opts.velocity,
        rotation: new Vector3D(0, 0, 0),
        rotationSpeed: new Vector3D(
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02,
            0
        ),
        mass: opts.mass,
        radius: opts.radius,
        color: opts.color,
        trail: [],
        isSun: opts.isSun
    };
}

function generateSphere(radius: number, subdivisions: number) {
    const PHI = (1 + Math.sqrt(5)) / 2;
    
    let vertices: Vector3D[] = [
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
    
    let faces = [
        [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
        [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
        [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
        [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]
    ];
    
    // Subdywizja dla gładszej sfery
    for (let s = 0; s < subdivisions; s++) {
        const newFaces: number[][] = [];
        const midCache: Map<string, number> = new Map();
        
        const getMidpoint = (i1: number, i2: number): number => {
            const key = i1 < i2 ? `${i1}_${i2}` : `${i2}_${i1}`;
            if (midCache.has(key)) return midCache.get(key)!;
            
            const v1 = vertices[i1];
            const v2 = vertices[i2];
            const mid = new Vector3D(
                (v1.x + v2.x) / 2,
                (v1.y + v2.y) / 2,
                (v1.z + v2.z) / 2
            ).normalize();
            
            vertices.push(mid);
            const idx = vertices.length - 1;
            midCache.set(key, idx);
            return idx;
        };
        
        for (const [a, b, c] of faces) {
            const ab = getMidpoint(a, b);
            const bc = getMidpoint(b, c);
            const ca = getMidpoint(c, a);
            
            newFaces.push([a, ab, ca]);
            newFaces.push([b, bc, ab]);
            newFaces.push([c, ca, bc]);
            newFaces.push([ab, bc, ca]);
        }
        
        faces = newFaces;
    }
    
    // Skaluj do właściwego rozmiaru
    vertices = vertices.map(v => v.normalize().multiply(radius));
    
    // Wyciągnij krawędzie z faces
    const edgeSet = new Set<string>();
    const edges: number[][] = [];
    
    for (const [a, b, c] of faces) {
        [[a,b], [b,c], [c,a]].forEach(([i, j]) => {
            const key = i < j ? `${i}_${j}` : `${j}_${i}`;
            if (!edgeSet.has(key)) {
                edgeSet.add(key);
                edges.push([i, j]);
            }
        });
    }
    
    return { vertices, edges };
}

export function updatePhysics(bodies: CelestialBody[], dt: number = 1) {
    // Oblicz siły grawitacyjne
    for (let i = 0; i < bodies.length; i++) {
        
        let totalForce = new Vector3D(0, 0, 0);
        
        for (let j = 0; j < bodies.length; j++) {
            if (i === j) continue;
            
            const dir = bodies[j].position.subtract(bodies[i].position);
            const distSq = dir.x * dir.x + dir.y * dir.y + dir.z * dir.z;
            const dist = Math.sqrt(distSq);
            
            // F = G * m1 * m2 / r^2
            const forceMag = (G * bodies[i].mass * bodies[j].mass) / (distSq + 10); // +10 zapobiega dzieleniu przez ~0
            
            const forceDir = dir.normalize();
            totalForce = totalForce.add(forceDir.multiply(forceMag));
        }
        
        // a = F / m
        const acceleration = totalForce.multiply(1 / bodies[i].mass);
        
        // Aktualizuj prędkość
        bodies[i].velocity = bodies[i].velocity.add(acceleration.multiply(dt));
    }
    
    // Aktualizuj pozycje i rotacje
    for (const body of bodies) {

        body.position = body.position.add(body.velocity.multiply(dt));
        
        
        // Rotacja własna
        body.rotation = body.rotation.add(body.rotationSpeed);
        
        // Trail (ślad orbity)
        body.trail.push(body.position.clone());
        if (body.trail.length > MAX_TRAIL) {
            body.trail.shift();
        }
    }
}

// Funkcja do rysowania trailów (wywołaj osobno w renderze)
export function getTrailLines(body: CelestialBody): { start: Vector3D; end: Vector3D; alpha: number }[] {
    const lines: { start: Vector3D; end: Vector3D; alpha: number }[] = [];
    
    for (let i = 1; i < body.trail.length; i++) {
        lines.push({
            start: body.trail[i - 1],
            end: body.trail[i],
            alpha: i / body.trail.length // Zanika w kierunku starszych punktów
        });
    }
    
    return lines;
}