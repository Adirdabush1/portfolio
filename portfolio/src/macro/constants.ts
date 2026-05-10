import type { Vector3Tuple } from "three";

// Desk-scale world: a normal desk is ~1.5m wide. We scale the desk up
// to 30m so the toy car (~1m) feels like a hot-wheels on a giant table.
export const DESK = {
  WIDTH: 32,
  DEPTH: 20,
  THICKNESS: 0.6,
  HEIGHT: 0,
  WOOD: "#5b3924",
  WOOD_DARK: "#3a2417",
  EDGE: "#2a180e",
};

export const TOY = {
  // The cybertruck.glb is modeled at ~4m long; for a "toy car on a desk"
  // we render it at 0.18 scale so it's about 0.7m long.
  SCALE: 0.18,
  ACCEL: 18,
  REVERSE_ACCEL: 12,
  TURN_RATE: 2.6,
  LINEAR_DAMPING: 2.6,
  ANGULAR_DAMPING: 6.5,
  MASS: 0.6,
  MAX_SPEED: 7,
  MAX_VERTICAL_SPEED: 12,
  BOUNCE_IMPULSE: 28,
  PAD_BOUNCE_IMPULSE: 60,
  SPAWN: [0, 0.6, 6] as Vector3Tuple,
};

export const CAMERA = {
  OFFSET: [0, 1.8, 4.0] as Vector3Tuple,
  LOOK_AHEAD: 1.2,
  POS_LERP: 0.08,
  LOOK_LERP: 0.12,
};

// Desk surface top sits at y=0.3 (DESK.HEIGHT 0 + THICKNESS/2 0.3).
// All props that should rest ON the desk use y=0.3 as their group origin.
const DESK_TOP_Y = 0.3;

export const PROPS = {
  MUG: [9, DESK_TOP_Y, -1.5] as Vector3Tuple,
  PLANT: [11, DESK_TOP_Y, 5.5] as Vector3Tuple,
  LAPTOP: [-3.2, DESK_TOP_Y, -5.5] as Vector3Tuple,
  CABLE_PATH: [
    [-3.2, 0.45, -4.2],
    [-0.5, 0.45, -3.0],
    [2.5, 0.45, -2.0],
    [5, 0.45, -3.5],
  ] as Vector3Tuple[],
  STICKY_NOTES: [
    { pos: [2, DESK_TOP_Y, 2] as Vector3Tuple, rotY: 0.15, color: "#ffe066", text: "fix the bug" },
    { pos: [-2.5, DESK_TOP_Y, 3] as Vector3Tuple, rotY: -0.25, color: "#a8e6a3", text: "buy milk" },
    { pos: [6, DESK_TOP_Y, 3.5] as Vector3Tuple, rotY: 0.4, color: "#ffaaaa", text: "ship pocketproof" },
  ],
  AVATAR_NOTE: { pos: [-5.5, DESK_TOP_Y, 1] as Vector3Tuple, rotY: 0.1, text: "this is me" },
};

export const LAMP = {
  // Position the desk lamp at the back-left of the desk
  POSITION: [-9, DESK_TOP_Y, -5] as Vector3Tuple,
  ARM_LENGTH: 2.4,
  HEAD_HEIGHT: 3.4,
  WARM: "#ffd9a8",
  CONE_INTENSITY: 14,
  CONE_DISTANCE: 14,
  CONE_ANGLE: Math.PI / 4.5,
  CONE_PENUMBRA: 0.35,
};
