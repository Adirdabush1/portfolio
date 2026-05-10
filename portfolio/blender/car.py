"""
Procedural low-poly car for Drive Portfolio.

How to run:
  - Open Blender (4.x), File > Open this script in the Text Editor (or run via blender --python car.py)
  - The script clears the scene, generates the car, and exports to ../public/models/drive/car.glb

Orientation note:
  The car is modeled facing -Y in Blender. With glTF +Y Up export, that becomes -Z in three.js,
  which matches the FORWARD vector in src/drive/Car.tsx (`new Vector3(0, 0, -1)`).

Tweak:
  - Body color: change `red` material color
  - Cabin tint: `cabin` material
  - Headlight glow: `head_lite` emissive_strength
"""
import bpy
import math
import os

OUT_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "public", "models", "drive", "car.glb")
)

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for block in list(bpy.data.materials):
    bpy.data.materials.remove(block)


def make_mat(name, color, roughness=0.5, metallic=0.0, emissive=None, emissive_strength=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = (*color, 1.0)
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metallic
    if emissive is not None:
        bsdf.inputs['Emission Color'].default_value = (*emissive, 1.0)
        bsdf.inputs['Emission Strength'].default_value = emissive_strength
    return mat


red       = make_mat("CarRed",    (0.85, 0.18, 0.14), roughness=0.45, metallic=0.15)
cabin     = make_mat("CarCabin",  (0.11, 0.13, 0.20), roughness=0.25, metallic=0.4)
black     = make_mat("CarTire",   (0.04, 0.04, 0.05), roughness=0.95)
chrome    = make_mat("CarHub",    (0.7, 0.7, 0.72),   roughness=0.3,  metallic=0.9)
head_lite = make_mat("Headlight", (1.0, 0.96, 0.78), emissive=(1.0, 0.96, 0.78), emissive_strength=4.0)
tail_lite = make_mat("Taillight", (0.9, 0.1, 0.1),    emissive=(1.0, 0.1, 0.1),  emissive_strength=3.0)


def add_box(name, size, location, rotation=(0, 0, 0), material=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    obj.rotation_euler = rotation
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if material:
        obj.data.materials.append(material)
    return obj


def add_cyl(name, radius, depth, location, rotation=(0, 0, 0), material=None, verts=16):
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=depth, vertices=verts, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.rotation_euler = rotation
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    if material:
        obj.data.materials.append(material)
    return obj


# Body sits centered, length along Y, height along Z
add_box("Body",  (1.6, 2.6, 0.55), (0, 0, 0.35),    material=red)
add_box("Cabin", (1.3, 1.4, 0.5),  (0, -0.25, 0.85), material=cabin)

wheels = [
    (-0.85,  0.95, 0.30, "WheelFL"),
    ( 0.85,  0.95, 0.30, "WheelFR"),
    (-0.85, -0.95, 0.30, "WheelBL"),
    ( 0.85, -0.95, 0.30, "WheelBR"),
]
for x, y, z, n in wheels:
    add_cyl(n,            0.30, 0.25, (x, y, z), rotation=(0, math.radians(90), 0), material=black,  verts=18)
    add_cyl(n + "_Hub",   0.10, 0.27, (x, y, z), rotation=(0, math.radians(90), 0), material=chrome, verts=12)

add_box("HeadlightL", (0.35, 0.06, 0.18), (-0.45, -1.32, 0.40), material=head_lite)
add_box("HeadlightR", (0.35, 0.06, 0.18), ( 0.45, -1.32, 0.40), material=head_lite)
add_box("TaillightL", (0.40, 0.05, 0.15), (-0.50,  1.32, 0.42), material=tail_lite)
add_box("TaillightR", (0.40, 0.05, 0.15), ( 0.50,  1.32, 0.42), material=tail_lite)
add_box("BumperF",    (1.55, 0.10, 0.20), (0,    -1.30, 0.18),  material=cabin)
add_box("BumperR",    (1.55, 0.10, 0.18), (0,     1.30, 0.18),  material=cabin)


bpy.ops.object.select_all(action='SELECT')
os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
bpy.ops.export_scene.gltf(
    filepath=OUT_PATH,
    export_format='GLB',
    use_selection=True,
    export_apply=True,
    export_yup=True,
)
print(f"Exported {OUT_PATH} ({os.path.getsize(OUT_PATH)} bytes)")
