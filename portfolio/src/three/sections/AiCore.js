import * as THREE from "three";
import { disposeObject } from "../utils/disposer";
import { getParticleCount } from "../utils/responsive";
export class AiCore {
    constructor(scene) {
        this.group = new THREE.Group();
        this.orbitingNodes = [];
        this.orbitLines = [];
        this.dummy = new THREE.Object3D();
        // Octahedron core
        const coreGeo = new THREE.OctahedronGeometry(1.3, 0);
        const coreMat = new THREE.MeshPhongMaterial({
            color: 0x4a90d9,
            emissive: 0x1a3a5c,
            emissiveIntensity: 0.6,
            shininess: 100,
            transparent: true,
            opacity: 0,
        });
        this.core = new THREE.Mesh(coreGeo, coreMat);
        // Wireframe overlay
        const wireGeo = new THREE.OctahedronGeometry(1.35, 0);
        const edgesGeo = new THREE.EdgesGeometry(wireGeo);
        const wireMat = new THREE.LineBasicMaterial({
            color: 0x4a90d9,
            transparent: true,
            opacity: 0,
        });
        this.wireOverlay = new THREE.LineSegments(edgesGeo, wireMat);
        wireGeo.dispose();
        this.group.add(this.core, this.wireOverlay);
        // Orbiting nodes
        const nodeGeo = new THREE.IcosahedronGeometry(0.08, 0);
        const nodeColors = [0x4a90d9, 0xefd09e, 0x4a90d9, 0xefd09e, 0x4a90d9, 0xefd09e, 0x4a90d9, 0xefd09e];
        for (let i = 0; i < 8; i++) {
            const nodeMat = new THREE.MeshPhongMaterial({
                emissive: nodeColors[i],
                emissiveIntensity: 1,
                transparent: true,
                opacity: 0,
            });
            const node = new THREE.Mesh(nodeGeo, nodeMat);
            this.orbitingNodes.push(node);
            this.group.add(node);
            // Connection line to core
            const lineGeo = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 0, 0),
            ]);
            const lineMat = new THREE.LineBasicMaterial({
                color: nodeColors[i],
                transparent: true,
                opacity: 0,
            });
            const line = new THREE.Line(lineGeo, lineMat);
            this.orbitLines.push(line);
            this.group.add(line);
        }
        // Ambient particles
        this.particleCount = getParticleCount(150);
        const pGeo = new THREE.SphereGeometry(0.015, 4, 4);
        const pMat = new THREE.MeshBasicMaterial({
            color: 0x4a90d9,
            transparent: true,
            opacity: 0,
            depthWrite: false,
        });
        this.particles = new THREE.InstancedMesh(pGeo, pMat, this.particleCount);
        this.particles.frustumCulled = false;
        this.basePos = new Float32Array(this.particleCount * 3);
        for (let i = 0; i < this.particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 2 + Math.random() * 3;
            this.basePos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            this.basePos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            this.basePos[i * 3 + 2] = r * Math.cos(phi);
            this.dummy.position.set(this.basePos[i * 3], this.basePos[i * 3 + 1], this.basePos[i * 3 + 2]);
            this.dummy.updateMatrix();
            this.particles.setMatrixAt(i, this.dummy.matrix);
        }
        this.particles.instanceMatrix.needsUpdate = true;
        this.group.add(this.particles);
        // Point light inside core
        const light = new THREE.PointLight(0x4a90d9, 0, 10);
        this.group.add(light);
        this.group.position.set(0, 0.3, -26);
        this.group.visible = false;
        scene.add(this.group);
    }
    update(progress, time) {
        this.group.visible = true;
        const assembleP = THREE.MathUtils.clamp(progress * 3, 0, 1);
        const fadeOut = progress > 0.85 ? THREE.MathUtils.clamp((progress - 0.85) / 0.15, 0, 1) : 0;
        const opacity = assembleP * (1 - fadeOut);
        // Core rotation
        this.core.rotation.x = time * 0.2;
        this.core.rotation.y = time * 0.3;
        this.core.rotation.z = time * 0.1;
        this.wireOverlay.rotation.copy(this.core.rotation);
        this.core.material.opacity = opacity * 0.8;
        this.wireOverlay.material.opacity = opacity * 0.5;
        // Core scale assembles from small
        const scale = THREE.MathUtils.lerp(0.1, 1, assembleP);
        this.core.scale.setScalar(scale);
        this.wireOverlay.scale.setScalar(scale * 1.03);
        // Orbiting nodes
        for (let i = 0; i < this.orbitingNodes.length; i++) {
            const orbitRadius = 1.8 + i * 0.15;
            const speed = 0.4 + i * 0.08;
            const phase = (i / 8) * Math.PI * 2;
            const inclination = (i % 3) * 0.4;
            const angle = time * speed + phase;
            const x = Math.cos(angle) * orbitRadius;
            const y = Math.sin(angle + inclination) * orbitRadius * 0.4;
            const z = Math.sin(angle) * orbitRadius;
            const nodeAppear = THREE.MathUtils.clamp((assembleP - 0.3 - i * 0.05) * 5, 0, 1);
            this.orbitingNodes[i].position.set(x, y, z);
            this.orbitingNodes[i].material.opacity = nodeAppear * (1 - fadeOut);
            // Update connection line
            const linePos = this.orbitLines[i].geometry.getAttribute("position");
            linePos.setXYZ(0, 0, 0, 0);
            linePos.setXYZ(1, x, y, z);
            linePos.needsUpdate = true;
            this.orbitLines[i].material.opacity = nodeAppear * 0.15 * (1 - fadeOut);
        }
        // Point light
        const light = this.group.children.find((c) => c instanceof THREE.PointLight);
        if (light)
            light.intensity = 1.5 * opacity;
        // Particles
        for (let i = 0; i < this.particleCount; i++) {
            const x = this.basePos[i * 3] + Math.sin(time * 0.3 + i) * 0.1;
            const y = this.basePos[i * 3 + 1] + Math.cos(time * 0.25 + i * 0.7) * 0.08;
            const z = this.basePos[i * 3 + 2];
            this.dummy.position.set(x, y, z);
            this.dummy.updateMatrix();
            this.particles.setMatrixAt(i, this.dummy.matrix);
        }
        this.particles.instanceMatrix.needsUpdate = true;
        this.particles.material.opacity = 0.2 * opacity;
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
