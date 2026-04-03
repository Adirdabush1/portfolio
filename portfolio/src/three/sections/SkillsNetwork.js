import * as THREE from "three";
import { disposeObject } from "../utils/disposer";
import { getParticleCount } from "../utils/responsive";
// Skill node data with 3D target positions
const skillNodes = [
    // Frontend cluster (upper-left)
    { name: "React", color: 0x61dafb, pos: [-2.5, 1.5, 0] },
    { name: "TypeScript", color: 0x3178c6, pos: [-1.8, 2.2, -0.5] },
    { name: "JavaScript", color: 0xf7df1e, pos: [-3.2, 2.0, 0.5] },
    { name: "HTML", color: 0xe34f26, pos: [-2.0, 0.8, 0.8] },
    { name: "CSS", color: 0x1572b6, pos: [-3.0, 0.5, -0.3] },
    { name: "Tailwind", color: 0x06b6d4, pos: [-1.2, 1.0, -0.8] },
    // Backend cluster (upper-right)
    { name: "Node.js", color: 0x339933, pos: [2.5, 1.8, 0] },
    { name: "Express", color: 0xffffff, pos: [1.8, 2.5, -0.4] },
    { name: "MongoDB", color: 0x47a248, pos: [3.0, 1.2, 0.6] },
    { name: "MySQL", color: 0x4479a1, pos: [2.0, 0.5, -0.6] },
    { name: "Firebase", color: 0xffca28, pos: [3.2, 2.2, 0.3] },
    // Mobile (center-right)
    { name: "React Native", color: 0x61dafb, pos: [0.5, 0, 1.0] },
    // Tools cluster (lower)
    { name: "Git", color: 0xf05032, pos: [-1.0, -1.5, 0.3] },
    { name: "GitHub", color: 0xdddddd, pos: [0.5, -1.8, -0.5] },
    { name: "Figma", color: 0xf24e1e, pos: [-0.5, -2.2, 0.5] },
    { name: "Postman", color: 0xff6c37, pos: [1.5, -1.2, 0.3] },
    { name: "Three.js", color: 0x049ef4, pos: [0, -0.5, -1.0] },
];
// Connections between related skills
const connections = [
    [0, 1], [0, 2], [0, 11], [1, 2], [3, 4], [4, 5], [0, 3],
    [6, 7], [6, 8], [6, 9], [6, 10], [7, 8],
    [0, 6], [1, 6], [12, 13], [14, 13],
    [11, 0], [16, 0],
];
export class SkillsNetwork {
    constructor(scene) {
        this.group = new THREE.Group();
        this.nodes = [];
        this.dummy = new THREE.Object3D();
        this.targetPositions = skillNodes.map((s) => new THREE.Vector3(s.pos[0], s.pos[1], s.pos[2]));
        this.startPositions = skillNodes.map(() => new THREE.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5));
        // Create node meshes
        const nodeGeo = new THREE.SphereGeometry(0.12, 12, 12);
        for (const skill of skillNodes) {
            const mat = new THREE.MeshPhongMaterial({
                color: 0x222222,
                emissive: skill.color,
                emissiveIntensity: 0.8,
                transparent: true,
                opacity: 0,
            });
            const mesh = new THREE.Mesh(nodeGeo, mat);
            mesh.position.copy(this.startPositions[this.nodes.length]);
            this.nodes.push(mesh);
            this.group.add(mesh);
        }
        // Connection lines
        this.linePositions = new Float32Array(connections.length * 6);
        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(this.linePositions, 3));
        const lineMat = new THREE.LineBasicMaterial({
            color: 0x4a90d9,
            transparent: true,
            opacity: 0,
        });
        this.lineSegments = new THREE.LineSegments(lineGeo, lineMat);
        this.group.add(this.lineSegments);
        // Ambient background particles
        this.ambientCount = getParticleCount(150);
        const apGeo = new THREE.SphereGeometry(0.015, 4, 4);
        const apMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.3, depthWrite: false });
        this.ambientParticles = new THREE.InstancedMesh(apGeo, apMat, this.ambientCount);
        this.ambientParticles.frustumCulled = false;
        this.ambientBasePos = new Float32Array(this.ambientCount * 3);
        for (let i = 0; i < this.ambientCount; i++) {
            const x = (Math.random() - 0.5) * 10;
            const y = (Math.random() - 0.5) * 8;
            const z = (Math.random() - 0.5) * 6 - 2;
            this.ambientBasePos[i * 3] = x;
            this.ambientBasePos[i * 3 + 1] = y;
            this.ambientBasePos[i * 3 + 2] = z;
            this.dummy.position.set(x, y, z);
            this.dummy.updateMatrix();
            this.ambientParticles.setMatrixAt(i, this.dummy.matrix);
        }
        this.ambientParticles.instanceMatrix.needsUpdate = true;
        this.group.add(this.ambientParticles);
        // Position inside the neural tunnel
        this.group.position.set(0, 0, -4.5);
        this.group.visible = false;
        scene.add(this.group);
    }
    /**
     * @param progress - 0 to 1 within skills scroll range
     * @param time - elapsed time
     */
    update(progress, time) {
        this.group.visible = true;
        // Nodes spread from center to target positions
        const spreadProgress = THREE.MathUtils.clamp(progress * 2, 0, 1); // first 50% of section
        const fadeIn = THREE.MathUtils.clamp(progress * 3, 0, 1);
        const fadeOut = progress > 0.85 ? THREE.MathUtils.clamp((progress - 0.85) / 0.15, 0, 1) : 0;
        const opacity = fadeIn * (1 - fadeOut);
        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i];
            // Staggered arrival
            const stagger = i * 0.02;
            const t = THREE.MathUtils.clamp((spreadProgress - stagger) / (1 - stagger), 0, 1);
            const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
            node.position.lerpVectors(this.startPositions[i], this.targetPositions[i], eased);
            // Gentle float
            node.position.x += Math.sin(time * 0.5 + i) * 0.05;
            node.position.y += Math.cos(time * 0.4 + i * 0.7) * 0.04;
            node.material.opacity = opacity;
        }
        // Update connection lines
        const lineOpacity = THREE.MathUtils.clamp((spreadProgress - 0.5) * 2, 0, 0.35) * (1 - fadeOut);
        this.lineSegments.material.opacity = lineOpacity;
        const posArr = this.linePositions;
        for (let i = 0; i < connections.length; i++) {
            const [a, b] = connections[i];
            const na = this.nodes[a].position;
            const nb = this.nodes[b].position;
            posArr[i * 6] = na.x;
            posArr[i * 6 + 1] = na.y;
            posArr[i * 6 + 2] = na.z;
            posArr[i * 6 + 3] = nb.x;
            posArr[i * 6 + 4] = nb.y;
            posArr[i * 6 + 5] = nb.z;
        }
        this.lineSegments.geometry.getAttribute("position").needsUpdate = true;
        // Ambient particles float
        for (let i = 0; i < this.ambientCount; i++) {
            const bx = this.ambientBasePos[i * 3];
            const by = this.ambientBasePos[i * 3 + 1];
            const bz = this.ambientBasePos[i * 3 + 2];
            this.dummy.position.set(bx + Math.sin(time * 0.3 + i * 0.2) * 0.1, by + Math.cos(time * 0.25 + i * 0.15) * 0.08, bz);
            this.dummy.updateMatrix();
            this.ambientParticles.setMatrixAt(i, this.dummy.matrix);
        }
        this.ambientParticles.instanceMatrix.needsUpdate = true;
        this.ambientParticles.material.opacity = 0.3 * opacity;
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
