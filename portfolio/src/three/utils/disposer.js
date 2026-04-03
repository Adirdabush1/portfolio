import * as THREE from "three";
export function disposeObject(obj) {
    obj.traverse((child) => {
        var _a, _b, _c, _d;
        if (child instanceof THREE.Mesh) {
            (_a = child.geometry) === null || _a === void 0 ? void 0 : _a.dispose();
            if (Array.isArray(child.material)) {
                child.material.forEach((m) => m.dispose());
            }
            else {
                (_b = child.material) === null || _b === void 0 ? void 0 : _b.dispose();
            }
        }
        if (child instanceof THREE.Line) {
            (_c = child.geometry) === null || _c === void 0 ? void 0 : _c.dispose();
            if (Array.isArray(child.material)) {
                child.material.forEach((m) => m.dispose());
            }
            else {
                (_d = child.material) === null || _d === void 0 ? void 0 : _d.dispose();
            }
        }
    });
}
export function disposeTexture(texture) {
    texture === null || texture === void 0 ? void 0 : texture.dispose();
}
