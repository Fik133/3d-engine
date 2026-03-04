import { Vector3D } from "./types.js";
const G = 50; // Stała grawitacyjna (dostosowana do symulacji)
const MAX_TRAIL = 100;
export function generateSolarSystem() {
    const bodies = [];
    // Słońce
    bodies.push(createBody({
        radius: 8,
        position: new Vector3D(0, 0, 0),
        velocity: new Vector3D(0, 0, 0),
        mass: 10000,
        color: "hsl(45, 100%, 60%)",
        isSun: true
    }));
    // Planety - [odległość, prędkość orbitalna, rozmiar, masa, kolor]
    const planets = [
        [30, 2.8, 1.0, 10, "hsl(30, 50%, 50%)"], // Merkury
        [45, 2.3, 1.5, 20, "hsl(45, 60%, 70%)"], // Wenus
        [60, 2.0, 1.8, 25, "hsl(210, 70%, 55%)"], // Ziemia
        [80, 1.7, 1.3, 15, "hsl(15, 70%, 50%)"], // Mars
        [110, 1.3, 4.0, 200, "hsl(35, 60%, 65%)"], // Jowisz
        [150, 1.0, 3.5, 150, "hsl(45, 50%, 70%)"], // Saturn
    ];
    planets.forEach(([dist, speed, radius, mass, color]) => {
        // Losowy kąt startowy
        const angle = Math.random() * Math.PI * 2;
        bodies.push(createBody({
            radius,
            position: new Vector3D(Math.cos(angle) * dist, (Math.random() - 0.5) * 10, // Lekkie odchylenie w Y
            Math.sin(angle) * dist),
            // Prędkość prostopadła do pozycji (orbita)
            velocity: new Vector3D(-Math.sin(angle) * speed, 0, Math.cos(angle) * speed),
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
            radius: 0.5,
            position: new Vector3D(Math.cos(angle) * dist, (Math.random() - 0.5) * 50, Math.sin(angle) * dist),
            velocity: new Vector3D(-Math.sin(angle) * 1.5 + (Math.random() - 0.5), (Math.random() - 0.5) * 0.5, Math.cos(angle) * 1.5 + (Math.random() - 0.5)),
            mass: 1,
            color: "hsl(200, 80%, 80%)",
            isSun: false
        }));
    }
    return bodies;
}
function createBody(opts) {
    const { vertices, edges } = generateSphere(opts.radius, opts.isSun ? 2 : 1);
    return {
        vertices,
        edges,
        position: opts.position,
        velocity: opts.velocity,
        rotation: new Vector3D(0, 0, 0),
        rotationSpeed: new Vector3D((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, 0),
        mass: opts.mass,
        radius: opts.radius,
        color: opts.color,
        trail: [],
        isSun: opts.isSun
    };
}
function generateSphere(radius, subdivisions) {
    const PHI = (1 + Math.sqrt(5)) / 2;
    let vertices = [
        new Vector3D(-1, PHI, 0),
        new Vector3D(1, PHI, 0),
        new Vector3D(-1, -PHI, 0),
        new Vector3D(1, -PHI, 0),
        new Vector3D(0, -1, PHI),
        new Vector3D(0, 1, PHI),
        new Vector3D(0, -1, -PHI),
        new Vector3D(0, 1, -PHI),
        new Vector3D(PHI, 0, -1),
        new Vector3D(PHI, 0, 1),
        new Vector3D(-PHI, 0, -1),
        new Vector3D(-PHI, 0, 1),
    ];
    let faces = [
        [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
        [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
        [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
        [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
    ];
    // Subdywizja dla gładszej sfery
    for (let s = 0; s < subdivisions; s++) {
        const newFaces = [];
        const midCache = new Map();
        const getMidpoint = (i1, i2) => {
            const key = i1 < i2 ? `${i1}_${i2}` : `${i2}_${i1}`;
            if (midCache.has(key))
                return midCache.get(key);
            const v1 = vertices[i1];
            const v2 = vertices[i2];
            const mid = new Vector3D((v1.x + v2.x) / 2, (v1.y + v2.y) / 2, (v1.z + v2.z) / 2).normalize();
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
    const edgeSet = new Set();
    const edges = [];
    for (const [a, b, c] of faces) {
        [[a, b], [b, c], [c, a]].forEach(([i, j]) => {
            const key = i < j ? `${i}_${j}` : `${j}_${i}`;
            if (!edgeSet.has(key)) {
                edgeSet.add(key);
                edges.push([i, j]);
            }
        });
    }
    return { vertices, edges };
}
export function updatePhysics(bodies, dt = 1) {
    // Oblicz siły grawitacyjne
    for (let i = 0; i < bodies.length; i++) {
        if (bodies[i].isSun)
            continue; // Słońce nieruchome
        let totalForce = new Vector3D(0, 0, 0);
        for (let j = 0; j < bodies.length; j++) {
            if (i === j)
                continue;
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
        if (!body.isSun) {
            body.position = body.position.add(body.velocity.multiply(dt));
        }
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
export function getTrailLines(body) {
    const lines = [];
    for (let i = 1; i < body.trail.length; i++) {
        lines.push({
            start: body.trail[i - 1],
            end: body.trail[i],
            alpha: i / body.trail.length // Zanika w kierunku starszych punktów
        });
    }
    return lines;
}
