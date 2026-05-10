"""
Procedural low-poly Tesla Cybertruck for Drive Portfolio.

Run via:
  blender --background --python portfolio/blender/cybertruck.py

Exports to portfolio/public/models/drive/cybertruck.glb.

The body is a single bmesh extrusion of the iconic side profile (front
bumper -> hood -> windshield -> roof -> rear window slope -> bed -> tailgate).
Glass is a thin band overlay on the upper slopes. Wheel arches are black
boxes overlapping the silver to break up the silhouette.
"""
import bpy
import bmesh
import math
import os

OUT_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "public", "models", "drive", "cybertruck.glb")
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


steel    = make_mat("Steel",      (0.78, 0.78, 0.80), roughness=0.32, metallic=0.95)
chassis  = make_mat("Chassis",    (0.05, 0.05, 0.06), roughness=0.9)
glass    = make_mat("Glass",      (0.04, 0.05, 0.08), roughness=0.1)
tire     = make_mat("Tire",       (0.04, 0.04, 0.05), roughness=0.95)
hub      = make_mat("Hub",        (0.45, 0.46, 0.50), roughness=0.35, metallic=0.9)
front_lt = make_mat("FrontLight", (1.0, 0.96, 0.85), emissive=(1.0, 0.96, 0.85), emissive_strength=4.0)
rear_lt  = make_mat("RearLight",  (0.95, 0.1, 0.1),  emissive=(1.0, 0.1, 0.1),  emissive_strength=3.5)


HALF_W = 0.95

# Side profile, perimeter clockwise (Y forward = -Y, so front is at -Y)
profile = [
    (-2.0,  0.18),  # front bottom
    (-2.0,  0.55),  # front top of bumper
    (-1.05, 0.85),  # top of hood (windshield base)
    ( 0.0,  1.50),  # roof front
    ( 0.55, 1.50),  # roof back
    ( 1.55, 0.95),  # rear cabin (bed start)
    ( 1.55, 0.85),  # bed front edge
    ( 2.05, 0.85),  # bed rear edge
    ( 2.05, 0.18),  # rear bottom
]

mesh = bpy.data.meshes.new("Cybertruck_Body")
obj = bpy.data.objects.new("Cybertruck_Body", mesh)
bpy.context.collection.objects.link(obj)

bm = bmesh.new()
left  = [bm.verts.new((-HALF_W, y, z)) for (y, z) in profile]
right = [bm.verts.new(( HALF_W, y, z)) for (y, z) in profile]
bm.verts.ensure_lookup_table()

bm.faces.new(left)            # left side ngon
bm.faces.new(right[::-1])     # right side ngon (reversed for outward normal)

n = len(profile)
for i in range(n):
    a = left[i]
    b = left[(i + 1) % n]
    c = right[(i + 1) % n]
    d = right[i]
    bm.faces.new([a, b, c, d])

bm.normal_update()
bm.to_mesh(mesh)
bm.free()
mesh.materials.append(steel)


# Glass band overlaid on the upper slopes
glass_mesh = bpy.data.meshes.new("Cybertruck_Glass")
gobj = bpy.data.objects.new("Cybertruck_Glass", glass_mesh)
bpy.context.collection.objects.link(gobj)
bm = bmesh.new()
GW = 0.93
glass_profile = [
    (-1.0,  0.88),
    (-0.05, 1.49),
    ( 0.5,  1.49),
    ( 1.50, 0.98),
]
g_left  = [bm.verts.new((-GW, y, z + 0.005)) for (y, z) in glass_profile]
g_right = [bm.verts.new(( GW, y, z + 0.005)) for (y, z) in glass_profile]
bm.verts.ensure_lookup_table()
bm.faces.new([g_left[0], g_left[1], g_left[2], g_left[3]])
bm.faces.new([g_right[3], g_right[2], g_right[1], g_right[0]])
for i in range(3):
    bm.faces.new([g_left[i], g_left[i + 1], g_right[i + 1], g_right[i]])
bm.normal_update()
bm.to_mesh(glass_mesh)
bm.free()
glass_mesh.materials.append(glass)


def add_box(name, size, location, rotation=(0, 0, 0), material=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    o = bpy.context.active_object
    o.name = name
    o.scale = size
    o.rotation_euler = rotation
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if material:
        o.data.materials.append(material)
    return o


def add_cyl(name, radius, depth, location, rotation=(0, 0, 0), material=None, verts=18):
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=depth, vertices=verts, location=location)
    o = bpy.context.active_object
    o.name = name
    o.rotation_euler = rotation
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    if material:
        o.data.materials.append(material)
    return o


WHEEL_R = 0.42
WHEEL_W = 0.32
wheels = [
    (-0.95, -1.35, WHEEL_R, "WheelFL"),
    ( 0.95, -1.35, WHEEL_R, "WheelFR"),
    (-0.95,  1.45, WHEEL_R, "WheelBL"),
    ( 0.95,  1.45, WHEEL_R, "WheelBR"),
]
for x, y, z, n in wheels:
    add_cyl(n,          WHEEL_R, WHEEL_W,         (x, y, z), rotation=(0, math.radians(90), 0), material=tire, verts=18)
    add_cyl(n + "_Hub", 0.16,    WHEEL_W + 0.02,  (x, y, z), rotation=(0, math.radians(90), 0), material=hub,  verts=12)
    add_box(n + "_Arch", (0.55, 1.05, 0.42),       (x, y, z + 0.02), material=chassis)


add_box("FrontLightBar", (1.85, 0.06, 0.05), (0, -2.01, 0.65), material=front_lt)
add_box("RearLightBar",  (1.85, 0.06, 0.05), (0,  2.06, 0.55), material=rear_lt)
add_box("Logo",          (0.18, 0.03, 0.18), (0,  2.07, 0.38), material=front_lt)


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
