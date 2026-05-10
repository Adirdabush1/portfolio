import * as THREE from "three";

// Camera journey: start outside brain → zoom INTO the brain → travel through neural corridors.
// Hero zoom is front-loaded so even a small scroll on mobile already shows
// the camera diving into the sphere.
const positionPoints = [
  // Hero: outside looking at brain, then zooming IN (compressed range)
  new THREE.Vector3(0, 0, 9),      // Initial framing
  new THREE.Vector3(0, 0, 5),      // Closing in
  new THREE.Vector3(0, 0, 1.5),    // At brain surface
  new THREE.Vector3(0, 0, 0),      // ENTERING the brain
  // Inside the brain: traveling through neural corridors
  new THREE.Vector3(0, 0, -3),     // Skills — inside brain, looking at network
  new THREE.Vector3(0.5, -0.5, -6),// Skills end
  new THREE.Vector3(0, -1, -9),    // About scroll — neural tunnel
  new THREE.Vector3(0, -1.5, -12), // Audio — deeper inside
  new THREE.Vector3(0, -1, -15),   // About detail
  new THREE.Vector3(0.3, -0.5, -18),// Projects — widening chamber
  new THREE.Vector3(0, 0, -22),    // Projects end
  new THREE.Vector3(-0.3, 0.3, -25),// AI — core of the brain
  new THREE.Vector3(0, 0, -28),    // Contact — emerging
  new THREE.Vector3(0, 0, -31),    // Final position
];

const lookAtPoints = [
  // Always looking forward/deeper into brain
  new THREE.Vector3(0, 0, 0),      // Looking at brain center
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, -2),     // Looking into brain
  new THREE.Vector3(0, 0, -5),     // Looking deep inside
  new THREE.Vector3(0, 0, -6),     // Skills
  new THREE.Vector3(0, -0.5, -9),
  new THREE.Vector3(0, -1, -12),   // About scroll
  new THREE.Vector3(0, -1.5, -15), // Audio
  new THREE.Vector3(0, -1, -18),   // About detail
  new THREE.Vector3(0, -0.5, -22), // Projects
  new THREE.Vector3(0, 0, -25),
  new THREE.Vector3(0, 0.3, -28),  // AI
  new THREE.Vector3(0, 0, -31),    // Contact
  new THREE.Vector3(0, 0, -34),    // Final
];

export class CameraPath {
  private positionCurve: THREE.CatmullRomCurve3;
  private lookAtCurve: THREE.CatmullRomCurve3;
  private tempPos = new THREE.Vector3();
  private tempLookAt = new THREE.Vector3();

  constructor() {
    this.positionCurve = new THREE.CatmullRomCurve3(positionPoints, false, "catmullrom", 0.5);
    this.lookAtCurve = new THREE.CatmullRomCurve3(lookAtPoints, false, "catmullrom", 0.5);
  }

  update(camera: THREE.PerspectiveCamera, progress: number) {
    const clamped = THREE.MathUtils.clamp(progress, 0, 1);
    // Front-load the camera move: small scroll = big visual change early on
    const t = Math.pow(clamped, 0.65);
    this.positionCurve.getPoint(t, this.tempPos);
    this.lookAtCurve.getPoint(t, this.tempLookAt);
    camera.position.copy(this.tempPos);
    camera.lookAt(this.tempLookAt);
  }
}
