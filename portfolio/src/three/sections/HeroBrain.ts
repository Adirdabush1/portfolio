import * as THREE from "three";
import { disposeObject } from "../utils/disposer";
import { getParticleCount } from "../utils/responsive";

export class HeroBrain {
  group = new THREE.Group();
  private outerSphere: THREE.Mesh;
  private innerSphere: THREE.Mesh;
  private wireframe: THREE.LineSegments;
  private particles: THREE.InstancedMesh;
  private lines: THREE.LineSegments;
  private particleCount: number;
  private dummy = new THREE.Object3D();
  private particleBasePos: Float32Array;

  // Neural tunnel particles that extend deep into negative Z
  private tunnelParticles: THREE.InstancedMesh;
  private tunnelCount: number;
  private tunnelBasePos: Float32Array;

  constructor(scene: THREE.Scene) {
    // Outer brain sphere (what you see from outside)
    const outerGeo = new THREE.IcosahedronGeometry(3, 3);
    const outerMat = new THREE.MeshStandardMaterial({
      color: 0x4a90d9,
      emissive: 0x1a3a5c,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.15,
      wireframe: false,
      side: THREE.DoubleSide,
    });
    this.outerSphere = new THREE.Mesh(outerGeo, outerMat);

    // Inner glowing core
    const innerGeo = new THREE.IcosahedronGeometry(1.2, 2);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0xefd09e,
      emissive: 0xefd09e,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.2,
      wireframe: true,
    });
    this.innerSphere = new THREE.Mesh(innerGeo, innerMat);

    // Wireframe overlay
    const wireGeo = new THREE.IcosahedronGeometry(3.05, 3);
    const edgesGeo = new THREE.EdgesGeometry(wireGeo);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x4a90d9,
      transparent: true,
      opacity: 0.35,
    });
    this.wireframe = new THREE.LineSegments(edgesGeo, wireMat);
    wireGeo.dispose();

    // Orbiting particles around brain (visible from outside)
    this.particleCount = getParticleCount(500);
    const pGeo = new THREE.SphereGeometry(0.025, 6, 6);
    const pMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    });
    this.particles = new THREE.InstancedMesh(pGeo, pMat, this.particleCount);
    this.particles.frustumCulled = false;

    this.particleBasePos = new Float32Array(this.particleCount * 3);
    const colors = new Float32Array(this.particleCount * 3);
    const colorPool = [new THREE.Color(0xffffff), new THREE.Color(0x4a90d9), new THREE.Color(0xefd09e)];

    for (let i = 0; i < this.particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3.5 + Math.random() * 4;
      this.particleBasePos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      this.particleBasePos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      this.particleBasePos[i * 3 + 2] = r * Math.cos(phi);

      this.dummy.position.set(this.particleBasePos[i * 3], this.particleBasePos[i * 3 + 1], this.particleBasePos[i * 3 + 2]);
      this.dummy.updateMatrix();
      this.particles.setMatrixAt(i, this.dummy.matrix);

      const c = colorPool[Math.floor(Math.random() * colorPool.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    this.particles.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
    this.particles.instanceMatrix.needsUpdate = true;

    // Connection lines
    const linePositions: number[] = [];
    const maxLines = 50;
    let lineCount = 0;
    for (let i = 0; i < this.particleCount && lineCount < maxLines; i += 10) {
      for (let j = i + 1; j < this.particleCount && lineCount < maxLines; j += 10) {
        const dx = this.particleBasePos[i * 3] - this.particleBasePos[j * 3];
        const dy = this.particleBasePos[i * 3 + 1] - this.particleBasePos[j * 3 + 1];
        const dz = this.particleBasePos[i * 3 + 2] - this.particleBasePos[j * 3 + 2];
        if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 2.5) {
          linePositions.push(
            this.particleBasePos[i * 3], this.particleBasePos[i * 3 + 1], this.particleBasePos[i * 3 + 2],
            this.particleBasePos[j * 3], this.particleBasePos[j * 3 + 1], this.particleBasePos[j * 3 + 2]
          );
          lineCount++;
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({ color: 0x4a90d9, transparent: true, opacity: 0.1 });
    this.lines = new THREE.LineSegments(lineGeo, lineMat);

    // NEURAL TUNNEL — particles that extend deep into negative Z (inside the brain)
    this.tunnelCount = getParticleCount(800);
    const tGeo = new THREE.SphereGeometry(0.02, 4, 4);
    const tMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.tunnelParticles = new THREE.InstancedMesh(tGeo, tMat, this.tunnelCount);
    this.tunnelParticles.frustumCulled = false;
    this.tunnelBasePos = new Float32Array(this.tunnelCount * 3);

    const tunnelColors = new Float32Array(this.tunnelCount * 3);
    for (let i = 0; i < this.tunnelCount; i++) {
      // Tunnel goes from z=0 to z=-35, with radius shrinking/expanding
      const z = -(i / this.tunnelCount) * 35;
      const tunnelRadius = 2 + Math.sin(z * 0.3) * 1.5 + Math.random() * 1;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * tunnelRadius;
      const y = Math.sin(angle) * tunnelRadius;

      this.tunnelBasePos[i * 3] = x;
      this.tunnelBasePos[i * 3 + 1] = y;
      this.tunnelBasePos[i * 3 + 2] = z;

      this.dummy.position.set(x, y, z);
      this.dummy.updateMatrix();
      this.tunnelParticles.setMatrixAt(i, this.dummy.matrix);

      // Color varies by depth: blue near entrance → gold deeper
      const depthT = i / this.tunnelCount;
      const c = new THREE.Color().lerpColors(
        new THREE.Color(0x4a90d9),
        new THREE.Color(0xefd09e),
        depthT * 0.5
      );
      tunnelColors[i * 3] = c.r;
      tunnelColors[i * 3 + 1] = c.g;
      tunnelColors[i * 3 + 2] = c.b;
    }
    this.tunnelParticles.instanceColor = new THREE.InstancedBufferAttribute(tunnelColors, 3);
    this.tunnelParticles.instanceMatrix.needsUpdate = true;

    // Lighting
    const pointLight = new THREE.PointLight(0x4a90d9, 2, 25);
    pointLight.position.set(0, 0, 0);
    const innerLight = new THREE.PointLight(0xefd09e, 1, 15);
    innerLight.position.set(0, 0, -5);

    this.group.add(
      this.outerSphere, this.innerSphere, this.wireframe,
      this.particles, this.lines,
      this.tunnelParticles,
      pointLight, innerLight
    );
    scene.add(this.group);
  }

  /**
   * @param progress - 0 to 1 within hero scroll range (camera goes from z=12 to z=0)
   * @param time - elapsed time
   */
  update(progress: number, time: number) {
    this.group.visible = true;

    // Outer sphere + wireframe rotate slowly
    this.outerSphere.rotation.y = time * 0.1;
    this.outerSphere.rotation.x = time * 0.05;
    this.wireframe.rotation.copy(this.outerSphere.rotation);

    // Inner sphere rotates opposite
    this.innerSphere.rotation.y = -time * 0.15;
    this.innerSphere.rotation.z = time * 0.08;

    // As camera approaches, outer sphere becomes more transparent (we're passing through it)
    const enterProgress = THREE.MathUtils.clamp(progress * 1.5, 0, 1);
    (this.outerSphere.material as THREE.MeshStandardMaterial).opacity = 0.15 * (1 - enterProgress * 0.7);
    (this.wireframe.material as THREE.LineBasicMaterial).opacity = 0.35 * (1 - enterProgress * 0.5);

    // Inner sphere glows brighter as we approach then fades as we pass through
    const innerGlow = Math.sin(enterProgress * Math.PI);
    (this.innerSphere.material as THREE.MeshStandardMaterial).opacity = 0.2 + innerGlow * 0.4;
    (this.innerSphere.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + innerGlow * 1.5;

    // Orbiting particles
    for (let i = 0; i < this.particleCount; i++) {
      const bx = this.particleBasePos[i * 3];
      const by = this.particleBasePos[i * 3 + 1];
      const bz = this.particleBasePos[i * 3 + 2];
      const orbit = time * 0.1 + i * 0.01;
      const cos = Math.cos(orbit), sin = Math.sin(orbit);
      this.dummy.position.set(
        bx * cos - bz * sin * 0.1 + Math.sin(time * 0.5 + i * 0.1) * 0.15,
        by + Math.cos(time * 0.3 + i * 0.15) * 0.1,
        bz * cos + bx * sin * 0.1
      );
      this.dummy.updateMatrix();
      this.particles.setMatrixAt(i, this.dummy.matrix);
    }
    this.particles.instanceMatrix.needsUpdate = true;

    // Tunnel particles gently drift
    for (let i = 0; i < this.tunnelCount; i++) {
      const bx = this.tunnelBasePos[i * 3];
      const by = this.tunnelBasePos[i * 3 + 1];
      const bz = this.tunnelBasePos[i * 3 + 2];
      const swirl = time * 0.2 + bz * 0.1;
      this.dummy.position.set(
        bx + Math.sin(swirl + i * 0.05) * 0.15,
        by + Math.cos(swirl + i * 0.07) * 0.12,
        bz
      );
      this.dummy.updateMatrix();
      this.tunnelParticles.setMatrixAt(i, this.dummy.matrix);
    }
    this.tunnelParticles.instanceMatrix.needsUpdate = true;
  }

  dispose() {
    disposeObject(this.group);
    this.group.parent?.remove(this.group);
  }
}
