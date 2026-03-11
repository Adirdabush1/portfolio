import * as THREE from "three";
import { disposeObject } from "../utils/disposer";
import { getParticleCount } from "../utils/responsive";

const projectData = [
  { image: "/CodeMode.png", color: 0x4a90d9 },
  { image: "/samurai1.png", color: 0xff4444 },
  { image: "/login ratechat.png", color: 0x44ff88 },
  { image: "/timeshub.png", color: 0xefd09e },
];

export class ProjectCarousel {
  group = new THREE.Group();
  private panels: THREE.Mesh[] = [];
  private edges: THREE.LineSegments[] = [];
  private trailParticles: THREE.InstancedMesh;
  private trailCount: number;
  private trailBasePos: Float32Array;
  private dummy = new THREE.Object3D();
  private textureLoader = new THREE.TextureLoader();
  private loadedTextures: THREE.Texture[] = [];

  constructor(scene: THREE.Scene) {
    const panelGeo = new THREE.PlaneGeometry(3.5, 2.2, 1, 1);

    for (let i = 0; i < projectData.length; i++) {
      // Use a placeholder color first, load texture async
      const mat = new THREE.MeshBasicMaterial({
        color: 0x222233,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      });

      const panel = new THREE.Mesh(panelGeo, mat);
      this.panels.push(panel);
      this.group.add(panel);

      // Edge glow
      const edgeGeo = new THREE.EdgesGeometry(panelGeo);
      const edgeMat = new THREE.LineBasicMaterial({
        color: projectData[i].color,
        transparent: true,
        opacity: 0,
      });
      const edge = new THREE.LineSegments(edgeGeo, edgeMat);
      this.edges.push(edge);
      panel.add(edge);

      // Load texture
      this.textureLoader.load(projectData[i].image, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        (panel.material as THREE.MeshBasicMaterial).map = tex;
        (panel.material as THREE.MeshBasicMaterial).color.set(0xffffff);
        (panel.material as THREE.MeshBasicMaterial).needsUpdate = true;
        this.loadedTextures.push(tex);
      });
    }

    // Trail particles connecting panels
    this.trailCount = getParticleCount(100);
    const tGeo = new THREE.SphereGeometry(0.02, 4, 4);
    const tMat = new THREE.MeshBasicMaterial({
      color: 0x4a90d9,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.trailParticles = new THREE.InstancedMesh(tGeo, tMat, this.trailCount);
    this.trailParticles.frustumCulled = false;
    this.trailBasePos = new Float32Array(this.trailCount * 3);

    // Distribute along a circle path
    for (let i = 0; i < this.trailCount; i++) {
      const angle = (i / this.trailCount) * Math.PI * 2;
      const r = 5 + (Math.random() - 0.5) * 0.5;
      this.trailBasePos[i * 3] = Math.cos(angle) * r;
      this.trailBasePos[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      this.trailBasePos[i * 3 + 2] = Math.sin(angle) * r;
      this.dummy.position.set(this.trailBasePos[i * 3], this.trailBasePos[i * 3 + 1], this.trailBasePos[i * 3 + 2]);
      this.dummy.updateMatrix();
      this.trailParticles.setMatrixAt(i, this.dummy.matrix);
    }
    this.trailParticles.instanceMatrix.needsUpdate = true;
    this.group.add(this.trailParticles);

    this.group.position.set(0, -0.5, -20);
    this.group.visible = false;
    scene.add(this.group);
  }

  update(progress: number, time: number) {
    this.group.visible = true;

    const assembleProgress = THREE.MathUtils.clamp(progress * 5, 0, 1); // first 20% assembles
    const fadeOut = progress > 0.93 ? THREE.MathUtils.clamp((progress - 0.93) / 0.07, 0, 1) : 0;
    const opacity = assembleProgress * (1 - fadeOut);

    // Carousel rotation: 0-1 progress maps to 0-360 degrees rotation
    // But we go through 4 projects, so ~90 degrees per project
    const carouselAngle = progress * Math.PI * 2 * 0.75; // 270 degrees total

    for (let i = 0; i < this.panels.length; i++) {
      const angle = carouselAngle + (i / this.panels.length) * Math.PI * 2;
      const radius = 5;

      // Assembly: panels start from far away and converge
      const startX = Math.cos(angle) * 15;
      const startZ = Math.sin(angle) * 15;
      const targetX = Math.cos(angle) * radius;
      const targetZ = Math.sin(angle) * radius;

      const x = THREE.MathUtils.lerp(startX, targetX, assembleProgress);
      const z = THREE.MathUtils.lerp(startZ, targetZ, assembleProgress);

      this.panels[i].position.set(x, 0, z);
      // Face camera (rotate to face center)
      this.panels[i].rotation.y = -angle + Math.PI;

      (this.panels[i].material as THREE.MeshBasicMaterial).opacity = opacity * 0.9;
      (this.edges[i].material as THREE.LineBasicMaterial).opacity = opacity * 0.5;
    }

    // Trail particles rotate with carousel
    for (let i = 0; i < this.trailCount; i++) {
      const baseAngle = (i / this.trailCount) * Math.PI * 2 + carouselAngle;
      const r = 5 + Math.sin(time + i) * 0.3;
      const x = Math.cos(baseAngle) * r;
      const y = this.trailBasePos[i * 3 + 1] + Math.sin(time * 0.5 + i * 0.2) * 0.2;
      const z = Math.sin(baseAngle) * r;
      this.dummy.position.set(x, y, z);
      this.dummy.updateMatrix();
      this.trailParticles.setMatrixAt(i, this.dummy.matrix);
    }
    this.trailParticles.instanceMatrix.needsUpdate = true;
    (this.trailParticles.material as THREE.MeshBasicMaterial).opacity = 0.25 * opacity;
  }

  hide() {
    this.group.visible = false;
  }

  dispose() {
    this.loadedTextures.forEach((t) => t.dispose());
    disposeObject(this.group);
    this.group.parent?.remove(this.group);
  }
}
