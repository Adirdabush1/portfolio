import * as THREE from "three";
/**
 * Creates a 3D floating section title using Canvas texture.
 * The title materializes from particles when the camera approaches.
 */
export class SectionTitle {
    constructor(text, position, options = {}) {
        const { color = "#4a90d9", fontSize = 72, width = 1024, height = 200 } = options;
        // Create canvas texture with title text
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, width, height);
        ctx.font = `bold ${fontSize}px 'Poppins', 'Teko', sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        // Glow effect
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        ctx.fillStyle = color;
        ctx.fillText(text, width / 2, height / 2);
        // Second pass for brighter center
        ctx.shadowBlur = 5;
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = 0.6;
        ctx.fillText(text, width / 2, height / 2);
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        const aspect = width / height;
        const planeHeight = 1.5;
        const planeWidth = planeHeight * aspect;
        const geo = new THREE.PlaneGeometry(planeWidth, planeHeight);
        this.material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
        });
        this.mesh = new THREE.Mesh(geo, this.material);
        this.mesh.position.copy(position);
    }
    /** Fade in/out based on camera distance along Z */
    update(cameraZ) {
        const dist = Math.abs(this.mesh.position.z - cameraZ);
        // Title is visible when camera is within 8 units, peaks at 3-5 units
        if (dist < 8) {
            const t = 1 - dist / 8;
            this.material.opacity = Math.pow(t, 1.5) * 0.9;
        }
        else {
            this.material.opacity = 0;
        }
    }
    dispose() {
        var _a;
        this.mesh.geometry.dispose();
        (_a = this.material.map) === null || _a === void 0 ? void 0 : _a.dispose();
        this.material.dispose();
    }
}
