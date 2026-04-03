import * as THREE from "three";
import { disposeObject } from "../utils/disposer";
import { getParticleCount } from "../utils/responsive";
export class SoundWaves {
    constructor(scene) {
        this.group = new THREE.Group();
        this.rings = [];
        this.dummy = new THREE.Object3D();
        // Concentric rings
        for (let i = 0; i < 5; i++) {
            const inner = 1 + i * 0.6;
            const outer = inner + 0.04;
            const ringGeo = new THREE.RingGeometry(inner, outer, 64);
            const ringMat = new THREE.MeshBasicMaterial({
                color: 0x4a90d9,
                transparent: true,
                opacity: 0,
                side: THREE.DoubleSide,
                depthWrite: false,
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.position.z = -3;
            this.rings.push(ring);
            this.group.add(ring);
        }
        // Rising particles
        this.particleCount = getParticleCount(80);
        const pGeo = new THREE.SphereGeometry(0.02, 4, 4);
        const pMat = new THREE.MeshBasicMaterial({
            color: 0x4a90d9,
            transparent: true,
            opacity: 0.4,
            depthWrite: false,
        });
        this.particles = new THREE.InstancedMesh(pGeo, pMat, this.particleCount);
        this.particles.frustumCulled = false;
        this.basePos = new Float32Array(this.particleCount * 3);
        for (let i = 0; i < this.particleCount; i++) {
            this.basePos[i * 3] = (Math.random() - 0.5) * 6;
            this.basePos[i * 3 + 1] = (Math.random() - 0.5) * 4;
            this.basePos[i * 3 + 2] = -1 - Math.random() * 3;
            this.dummy.position.set(this.basePos[i * 3], this.basePos[i * 3 + 1], this.basePos[i * 3 + 2]);
            this.dummy.updateMatrix();
            this.particles.setMatrixAt(i, this.dummy.matrix);
        }
        this.particles.instanceMatrix.needsUpdate = true;
        this.group.add(this.particles);
        this.group.position.set(0, -1.5, -13.5);
        this.group.visible = false;
        scene.add(this.group);
    }
    update(progress, time) {
        this.group.visible = true;
        const fadeIn = THREE.MathUtils.clamp(progress * 3, 0, 1);
        const fadeOut = progress > 0.8 ? THREE.MathUtils.clamp((progress - 0.8) / 0.2, 0, 1) : 0;
        const opacity = fadeIn * (1 - fadeOut);
        // Pulse rings
        for (let i = 0; i < this.rings.length; i++) {
            const pulse = 1 + Math.sin(time * 1.5 + i * 0.8) * 0.15;
            this.rings[i].scale.set(pulse, pulse, 1);
            this.rings[i].material.opacity = 0.1 * opacity;
        }
        // Rising particles
        for (let i = 0; i < this.particleCount; i++) {
            const x = this.basePos[i * 3] + Math.sin(time * 0.5 + i) * 0.1;
            let y = this.basePos[i * 3 + 1] + time * 0.15;
            y = ((y + 2) % 4) - 2; // wrap
            const z = this.basePos[i * 3 + 2];
            this.dummy.position.set(x, y, z);
            this.dummy.updateMatrix();
            this.particles.setMatrixAt(i, this.dummy.matrix);
        }
        this.particles.instanceMatrix.needsUpdate = true;
        this.particles.material.opacity = 0.4 * opacity;
    }
    hide() {
        this.group.visible = false;
    }
    dispose() {
        var _a;
        disposeObject(this.group);
        (_a = this.group.parent) === null || _a === void 0 ? void 0 : _a.remove(this.group);
    }
}
