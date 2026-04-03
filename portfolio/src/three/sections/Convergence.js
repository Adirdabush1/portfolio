import * as THREE from "three";
import { disposeObject } from "../utils/disposer";
import { getParticleCount } from "../utils/responsive";
export class Convergence {
    constructor(scene) {
        this.group = new THREE.Group();
        this.dummy = new THREE.Object3D();
        // Final orb
        const orbGeo = new THREE.SphereGeometry(1.8, 32, 32);
        const orbMat = new THREE.MeshPhongMaterial({
            color: 0x4a90d9,
            emissive: 0x1a3a5c,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0,
            shininess: 60,
        });
        this.orb = new THREE.Mesh(orbGeo, orbMat);
        this.group.add(this.orb);
        // Glow light inside
        this.glowLight = new THREE.PointLight(0xefd09e, 0, 12);
        this.group.add(this.glowLight);
        // Saturn ring particles
        this.ringCount = getParticleCount(50);
        const rGeo = new THREE.SphereGeometry(0.025, 4, 4);
        const rMat = new THREE.MeshBasicMaterial({
            color: 0xefd09e,
            transparent: true,
            opacity: 0,
            depthWrite: false,
        });
        this.ringParticles = new THREE.InstancedMesh(rGeo, rMat, this.ringCount);
        this.ringParticles.frustumCulled = false;
        for (let i = 0; i < this.ringCount; i++) {
            const angle = (i / this.ringCount) * Math.PI * 2;
            const r = 2.8 + (Math.random() - 0.5) * 0.3;
            this.dummy.position.set(Math.cos(angle) * r, (Math.random() - 0.5) * 0.1, Math.sin(angle) * r);
            this.dummy.updateMatrix();
            this.ringParticles.setMatrixAt(i, this.dummy.matrix);
        }
        this.ringParticles.instanceMatrix.needsUpdate = true;
        this.group.add(this.ringParticles);
        // Converging particles (from all directions)
        this.convergeCount = getParticleCount(200);
        const cGeo = new THREE.SphereGeometry(0.02, 4, 4);
        const cMat = new THREE.MeshBasicMaterial({
            color: 0x4a90d9,
            transparent: true,
            opacity: 0,
            depthWrite: false,
        });
        this.convergingParticles = new THREE.InstancedMesh(cGeo, cMat, this.convergeCount);
        this.convergingParticles.frustumCulled = false;
        for (let i = 0; i < this.convergeCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 8 + Math.random() * 5;
            this.dummy.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
            this.dummy.updateMatrix();
            this.convergingParticles.setMatrixAt(i, this.dummy.matrix);
        }
        this.convergingParticles.instanceMatrix.needsUpdate = true;
        this.group.add(this.convergingParticles);
        this.group.position.set(0, 0, -30);
        this.group.visible = false;
        scene.add(this.group);
    }
    update(progress, time) {
        this.group.visible = true;
        // Converge progress: particles move toward center
        const convergeP = THREE.MathUtils.clamp(progress * 1.5, 0, 1);
        const orbAppear = THREE.MathUtils.clamp((progress - 0.4) * 2.5, 0, 1);
        // Converging particles move toward center
        for (let i = 0; i < this.convergeCount; i++) {
            const theta = (i / this.convergeCount) * Math.PI * 2 * 3 + i * 0.5;
            const phi = Math.acos(2 * (i / this.convergeCount) - 1);
            const startR = 8 + (i % 5);
            const endR = 1.5;
            const r = THREE.MathUtils.lerp(startR, endR, convergeP);
            this.dummy.position.set(r * Math.sin(phi) * Math.cos(theta + time * 0.2), r * Math.sin(phi) * Math.sin(theta + time * 0.15), r * Math.cos(phi));
            this.dummy.updateMatrix();
            this.convergingParticles.setMatrixAt(i, this.dummy.matrix);
        }
        this.convergingParticles.instanceMatrix.needsUpdate = true;
        this.convergingParticles.material.opacity =
            0.4 * (1 - orbAppear * 0.5);
        // Orb appears after particles converge
        this.orb.material.opacity = orbAppear * 0.7;
        const breathe = 1 + Math.sin(time * 0.8) * 0.03;
        this.orb.scale.setScalar(orbAppear * breathe);
        this.orb.rotation.y = time * 0.1;
        // Glow light
        this.glowLight.intensity = orbAppear * 2;
        // Ring particles orbit
        for (let i = 0; i < this.ringCount; i++) {
            const angle = (i / this.ringCount) * Math.PI * 2 + time * 0.15;
            const r = 2.8 + Math.sin(time + i) * 0.15;
            this.dummy.position.set(Math.cos(angle) * r, Math.sin(time * 0.5 + i * 0.3) * 0.08, Math.sin(angle) * r);
            this.dummy.updateMatrix();
            this.ringParticles.setMatrixAt(i, this.dummy.matrix);
        }
        this.ringParticles.instanceMatrix.needsUpdate = true;
        this.ringParticles.material.opacity = orbAppear * 0.5;
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
