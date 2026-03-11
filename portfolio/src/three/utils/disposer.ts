import * as THREE from "three";

export function disposeObject(obj: THREE.Object3D) {
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry?.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => m.dispose());
      } else {
        child.material?.dispose();
      }
    }
    if (child instanceof THREE.Line) {
      child.geometry?.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => m.dispose());
      } else {
        (child.material as THREE.Material)?.dispose();
      }
    }
  });
}

export function disposeTexture(texture: THREE.Texture | null) {
  texture?.dispose();
}
