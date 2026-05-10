export const CAR = {
    ACCEL: 72,
    REVERSE_ACCEL: 45,
    TURN_RATE: 10,
    LINEAR_DAMPING: 2.0,
    ANGULAR_DAMPING: 3.5,
    BOUNCE_IMPULSE: 110,
    PAD_BOUNCE_IMPULSE: 230,
    MAX_VERTICAL_SPEED: 35,
    MASS: 3.5,
    MAX_SPEED: 23,
    SPAWN: [0, 1.5, 6],
};
export const CAMERA = {
    OFFSET: [0, 5.2, 11],
    LOOK_AHEAD: 3.5,
    POS_LERP: 0.08,
    LOOK_LERP: 0.12,
};
export const WORLD = {
    GROUND_SIZE: 400,
    GROUND_COLOR: "#26262b",
    LINE_COLOR: "#ededed",
    SKY_TOP: "#1a1f3a",
    SKY_BOTTOM: "#0a0f0f",
};
export const PROXIMITY_RADIUS = 4.5;
// Zones around a central plaza. Spawn = (0,0,0).
// North = -Z (Hero), East = +X (Skills), South = +Z (Projects), West = -X (AI/Contact)
export const BILLBOARDS = [
    // Hero zone (North)
    {
        id: "hero",
        label: "Adir Dabush",
        sublabel: "Software Engineer",
        color: "#3a6df0",
        position: [0, 0, -55],
        scale: 1.6,
    },
    // Skills zone (East) — central + 3 sub-billboards for stack categories
    {
        id: "skills",
        label: "Skills",
        sublabel: "Tech I work with",
        color: "#3aa86b",
        position: [55, 0, 0],
        rotationY: -Math.PI / 2,
        scale: 1.4,
    },
    {
        id: "frontend",
        label: "Frontend",
        sublabel: "React · TS · Three.js",
        color: "#55A5FE",
        position: [42, 0, -10],
        rotationY: -Math.PI / 2.4,
    },
    {
        id: "backend",
        label: "Backend",
        sublabel: "Node · Python · MongoDB",
        color: "#A469FF",
        position: [42, 0, 10],
        rotationY: -Math.PI / 1.7,
    },
    {
        id: "creative",
        label: "Creative",
        sublabel: "Blender · GSAP · R3F",
        color: "#CC5FB8",
        position: [70, 0, 0],
        rotationY: -Math.PI / 2,
    },
    // Projects zone (South)
    {
        id: "projects",
        label: "Projects",
        sublabel: "Things I've built",
        color: "#e07a3a",
        position: [0, 0, 55],
        rotationY: Math.PI,
        scale: 1.6,
    },
    // AI zone (West)
    {
        id: "ai",
        label: "AI Assistant",
        sublabel: "Talk to me",
        color: "#9b59f6",
        position: [-55, 0, 0],
        rotationY: Math.PI / 2,
        scale: 1.4,
    },
    // Contact (NW)
    {
        id: "contact",
        label: "Contact",
        sublabel: "Get in touch",
        color: "#e84a3a",
        position: [-32, 0, -32],
        rotationY: Math.PI / 4,
    },
];
export const PROPS = {
    // 10-pin bowling triangle in the projects zone
    BOWLING_PINS: [
        [0, 0, 80],
        [-0.6, 0, 81],
        [0.6, 0, 81],
        [-1.2, 0, 82],
        [0, 0, 82],
        [1.2, 0, 82],
        [-1.8, 0, 83],
        [-0.6, 0, 83],
        [0.6, 0, 83],
        [1.8, 0, 83],
    ],
    // bouncy pads scattered around the plaza
    BOUNCE_PADS: [
        [12, 0, -6],
        [-12, 0, 6],
        [-6, 0, -22],
        [22, 0, 22],
    ],
    // jump ramps along each road
    RAMPS: [
        { pos: [0, 0, -25], rot: 0 },
        { pos: [25, 0, 0], rot: Math.PI / 2 },
        { pos: [0, 0, 25], rot: 0 },
        { pos: [-25, 0, 0], rot: Math.PI / 2 },
    ],
    // cones in clusters
    CONES: [
        [-3, 0, -10], [-2, 0, -10], [-1, 0, -10],
        [10, 0, 12], [11, 0, 12], [12, 0, 12],
        [-15, 0, -15], [-14, 0, -15],
        [15, 0, -25], [16, 0, -25], [17, 0, -25],
    ],
    // lampposts at intersections + zone entries
    LAMPPOSTS: [
        [16, 0, 16], [-16, 0, 16], [16, 0, -16], [-16, 0, -16],
        [40, 0, 0], [-40, 0, 0], [0, 0, 40], [0, 0, -40],
    ],
    // central decorative spire
    SPIRE: [0, 0, 0],
};
export const ROAD_HALF_WIDTH = 5;
export const PLAZA_RADIUS = 12;
