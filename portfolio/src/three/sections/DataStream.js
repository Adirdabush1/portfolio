import * as THREE from "three";
import { disposeObject } from "../utils/disposer";
import { getParticleCount } from "../utils/responsive";
export class DataStream {
    constructor(scene) {
        this.group = new THREE.Group();
        this.dummy = new THREE.Object3D();
        this.depthLines = [];
        this.particleCount = getParticleCount(250);
        const geo = new THREE.PlaneGeometry(0.04, 0.04);
        const mat = new THREE.MeshBasicMaterial({
            color: 0xb0bec5,
            transparent: true,
            opacity: 0.5,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });
        this.particles = new THREE.InstancedMesh(geo, mat, this.particleCount);
        this.particles.frustumCulled = false;
        this.basePos = new Float32Array(this.particleCount * 3);
        // Arrange in horizontal bands (3 rows)
        for (let i = 0; i < this.particleCount; i++) {
            const row = i % 3;
            const x = (Math.random() - 0.5) * 20;
            const y = (row - 1) * 1.2 + (Math.random() - 0.5) * 0.3;
            const z = -1 - Math.random() * 4;
            this.basePos[i * 3] = x;
            this.basePos[i * 3 + 1] = y;
            this.basePos[i * 3 + 2] = z;
            this.dummy.position.set(x, y, z);
            this.dummy.updateMatrix();
            this.particles.setMatrixAt(i, this.dummy.matrix);
        }
        this.particles.instanceMatrix.needsUpdate = true;
        this.group.add(this.particles);
        // Depth lines (parallax layers)
        for (let i = 0; i < 8; i++) {
            const y = (Math.random() - 0.5) * 3;
            const z = -2 - i * 0.8;
            const points = [new THREE.Vector3(-15, y, z), new THREE.Vector3(15, y, z)];
            const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
            const lineMat = new THREE.LineBasicMaterial({
                color: 0x4a90d9,
                transparent: true,
                opacity: 0.06,
            });
            const line = new THREE.Line(lineGeo, lineMat);
            this.depthLines.push(line);
            this.group.add(line);
        }
        this.group.position.set(0, -1, -10.5);
        this.group.visible = false;
        scene.add(this.group);
    }
    update(progress, time, scrollVelocity = 0) {
        this.group.visible = true;
        const fadeIn = THREE.MathUtils.clamp(progress * 4, 0, 1);
        const fadeOut = progress > 0.85 ? THREE.MathUtils.clamp((progress - 0.85) / 0.15, 0, 1) : 0;
        const opacity = fadeIn * (1 - fadeOut);
        this.particles.material.opacity = 0.5 * opacity;
        const speed = 0.3 + Math.abs(scrollVelocity) * 2;
        for (let i = 0; i < this.particleCount; i++) {
            let x = this.basePos[i * 3] + time * speed * (0.5 + (i % 3) * 0.2);
            // Wrap around
            x = ((x + 10) % 20) - 10;
            const y = this.basePos[i * 3 + 1] + Math.sin(time + i * 0.1) * 0.05;
            const z = this.basePos[i * 3 + 2];
            this.dummy.position.set(x, y, z);
            this.dummy.updateMatrix();
            this.particles.setMatrixAt(i, this.dummy.matrix);
        }
        this.particles.instanceMatrix.needsUpdate = true;
        // Move depth lines at different speeds (parallax)
        for (let i = 0; i < this.depthLines.length; i++) {
            const lineSpeed = 0.1 * (1 + i * 0.3) * speed;
            this.depthLines[i].position.x = ((time * lineSpeed) % 30) - 15;
            this.depthLines[i].material.opacity = 0.06 * opacity;
        }
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
