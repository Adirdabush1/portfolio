import * as THREE from "three";
import { getParticleCount } from "./utils/responsive";
export class ParticleSystem {
    constructor(scene, baseCount, options = {}) {
        this.dummy = new THREE.Object3D();
        const { radius = 5, colors = [0xffffff, 0x4a90d9, 0xefd09e], opacity = 0.7, size = 0.03 } = options;
        this.count = getParticleCount(baseCount);
        const geo = new THREE.SphereGeometry(size, 6, 6);
        const mat = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity,
            depthWrite: false,
        });
        this.mesh = new THREE.InstancedMesh(geo, mat, this.count);
        this.mesh.frustumCulled = false;
        this.velocities = new Float32Array(this.count * 3);
        this.basePositions = new Float32Array(this.count * 3);
        // Per-instance colors
        const colorArr = new Float32Array(this.count * 3);
        const colorPool = colors.map((c) => new THREE.Color(c));
        for (let i = 0; i < this.count; i++) {
            // Random spherical position
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = radius * (0.5 + Math.random() * 0.5);
            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);
            this.basePositions[i * 3] = x;
            this.basePositions[i * 3 + 1] = y;
            this.basePositions[i * 3 + 2] = z;
            this.velocities[i * 3] = (Math.random() - 0.5) * 0.002;
            this.velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.002;
            this.velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
            const col = colorPool[Math.floor(Math.random() * colorPool.length)];
            colorArr[i * 3] = col.r;
            colorArr[i * 3 + 1] = col.g;
            colorArr[i * 3 + 2] = col.b;
            this.dummy.position.set(x, y, z);
            this.dummy.updateMatrix();
            this.mesh.setMatrixAt(i, this.dummy.matrix);
        }
        this.colorAttr = new THREE.InstancedBufferAttribute(colorArr, 3);
        this.mesh.instanceColor = this.colorAttr;
        this.mesh.instanceMatrix.needsUpdate = true;
        scene.add(this.mesh);
    }
    /** Animate particles with gentle floating motion */
    update(time, offsetY = 0) {
        for (let i = 0; i < this.count; i++) {
            const bx = this.basePositions[i * 3];
            const by = this.basePositions[i * 3 + 1];
            const bz = this.basePositions[i * 3 + 2];
            const drift = Math.sin(time * 0.5 + i * 0.1) * 0.15;
            const driftY = Math.cos(time * 0.3 + i * 0.15) * 0.1;
            this.dummy.position.set(bx + drift, by + driftY + offsetY, bz + drift * 0.5);
            this.dummy.updateMatrix();
            this.mesh.setMatrixAt(i, this.dummy.matrix);
        }
        this.mesh.instanceMatrix.needsUpdate = true;
    }
    /** Move all base positions to a new center */
    setCenter(x, y, z) {
        for (let i = 0; i < this.count; i++) {
            this.basePositions[i * 3] += x;
            this.basePositions[i * 3 + 1] += y;
            this.basePositions[i * 3 + 2] += z;
        }
    }
    setOpacity(val) {
        this.mesh.material.opacity = val;
    }
    dispose() {
        var _a;
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        (_a = this.mesh.parent) === null || _a === void 0 ? void 0 : _a.remove(this.mesh);
    }
}
