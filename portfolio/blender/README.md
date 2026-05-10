# Blender assets for Drive Portfolio

Procedural Blender scripts that generate the low-poly models loaded by `src/drive/`.

## Files

- `car.py` — generates `public/models/drive/car.glb` (the drivable red car)

## Run a script

From a terminal:

```bash
blender --background --python portfolio/blender/car.py
```

Or open Blender → Scripting workspace → open the .py file → Run Script.

The script clears the current scene, builds the model, and exports the GLB to `portfolio/public/models/drive/`.

## Conventions

- **Forward axis**: models face -Y in Blender. With glTF +Y Up export this becomes -Z in three.js, matching the `FORWARD` vector in [`src/drive/Car.tsx`](../src/drive/Car.tsx).
- **Origin**: the model origin sits on the ground (z=0), so the wheels touch the floor when placed at world Y=0.
- **Materials**: Principled BSDF with explicit `Base Color`, `Roughness`, `Metallic`. Headlights use `Emission` for glow.

## Adding a new asset

1. Copy `car.py`, rename, edit the geometry.
2. Set `OUT_PATH` to a new file under `portfolio/public/models/drive/`.
3. Run the script.
4. Add a `<Model>` wrapper in `src/drive/models/` that calls `useGLTF("/models/drive/<file>.glb")` and a fallback for Suspense.
