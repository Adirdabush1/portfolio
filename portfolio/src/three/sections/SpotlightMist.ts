import * as THREE from "three";
import { disposeObject } from "../utils/disposer";
import { getParticleCount } from "../utils/responsive";

export class SpotlightMist {
  group = new THREE.Group();
  private spotlight: THREE.SpotLight;
  private glowPlane: THREE.Mesh;
  private particles: THREE.InstancedMesh;
  private particleCount: number;
  private basePos: Float32Array;
  private dummy = new THREE.Object3D();

  constructor(scene: THREE.Scene) {
    // Spotlight from above
    this.spotlight = new THREE.SpotLight(0xefd09e, 0, 15, Math.PI / 4, 0.5, 1);
    this.spotlight.position.set(0, 5, 2);
    this.spotlight.target.position.set(0, 0, 0);
    this.group.add(this.spotlight);
    this.group.add(this.spotlight.target);

    // Glow plane behind text
    const planeGeo = new THREE.PlaneGeometry(10, 5);
    const planeMat = new THREE.MeshBasicMaterial({
      color: 0xefd09e,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.glowPlane = new THREE.Mesh(planeGeo, planeMat);
    this.glowPlane.position.z = -2;
    this.group.add(this.glowPlane);

    // Dust motes in spotlight beam
    this.particleCount = getParticleCount(120);
    const pGeo = new THREE.SphereGeometry(0.015, 4, 4);
    const pMat = new THREE.MeshBasicMaterial({
      color: 0xefd09e,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    this.particles = new THREE.InstancedMesh(pGeo, pMat, this.particleCount);
    this.particles.frustumCulled = false;
    this.basePos = new Float32Array(this.particleCount * 3);

    for (let i = 0; i < this.particleCount; i++) {
      this.basePos[i * 3] = (Math.random() - 0.5) * 8;
      this.basePos[i * 3 + 1] = (Math.random() - 0.5) * 4;
      this.basePos[i * 3 + 2] = -1 - Math.random() * 3;
      this.dummy.position.set(this.basePos[i * 3], this.basePos[i * 3 + 1], this.basePos[i * 3 + 2]);
      this.dummy.updateMatrix();
      this.particles.setMatrixAt(i, this.dummy.matrix);
    }
    this.particles.instanceMatrix.needsUpdate = true;
    this.group.add(this.particles);

    this.group.position.set(0, -1, -16.5);
    this.group.visible = false;
    scene.add(this.group);
  }

  update(progress: number, time: number) {
    this.group.visible = true;
    const fadeIn = THREE.MathUtils.clamp(progress * 3, 0, 1);
    const fadeOut = progress > 0.85 ? THREE.MathUtils.clamp((progress - 0.85) / 0.15, 0, 1) : 0;
    const opacity = fadeIn * (1 - fadeOut);

    // Spotlight narrows as we scroll deeper
    this.spotlight.intensity = 2 * opacity;
    this.spotlight.angle = Math.PI / 4 - progress * 0.4;

    // Glow plane pulse
    (this.glowPlane.material as THREE.MeshBasicMaterial).opacity =
      (0.04 + Math.sin(time * 0.8) * 0.02) * opacity;

    // Dust motes drift
    for (let i = 0; i < this.particleCount; i++) {
      const x = this.basePos[i * 3] + Math.sin(time * 0.3 + i * 0.2) * 0.15;
      const y = this.basePos[i * 3 + 1] + Math.cos(time * 0.25 + i * 0.15) * 0.1;
      const z = this.basePos[i * 3 + 2];
      this.dummy.position.set(x, y, z);
      this.dummy.updateMatrix();
      this.particles.setMatrixAt(i, this.dummy.matrix);
    }
    this.particles.instanceMatrix.needsUpdate = true;
    (this.particles.material as THREE.MeshBasicMaterial).opacity = 0.15 * opacity;
  }

  hide() {
    this.group.visible = false;
  }

  dispose() {
    disposeObject(this.group);
    this.group.parent?.remove(this.group);
  }
}
