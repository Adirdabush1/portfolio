"""
=============================================================
STEP 2: Post-FaceBuilder Avatar Setup
=============================================================
Run this AFTER you've built your face with KeenTools FaceBuilder.

This script:
  1. Takes the FaceBuilder head mesh
  2. Adds realistic materials (skin, beard, hair, lips, eyes)
  3. Adds particle hair (dark, short, side fade)
  4. Adds particle beard (brown-red stubble)
  5. Creates 8 shape keys for lip-sync animation
  6. Exports as GLB for your portfolio website

PREREQUISITES:
  - You completed FaceBuilder and have a head mesh in the scene
  - The head mesh is selected (click on it before running)

Usage: Select your FaceBuilder head → Scripting tab → Run
=============================================================
"""

import bpy
import math
from mathutils import Vector

# ============================================================
# CONFIG
# ============================================================
OUTPUT_GLB = "/Users/adir/portfolio/portfolio/public/avatar.glb"

BV = bpy.app.version
IS_4 = BV[0] >= 4
print(f"Blender {BV[0]}.{BV[1]}.{BV[2]}")

def safe_set(obj, attrs, value):
    if isinstance(attrs, str): attrs = [attrs]
    for attr in attrs:
        try:
            setattr(obj, attr, value)
            return True
        except (AttributeError, TypeError):
            continue
    print(f"  Warning: could not set {attrs}")
    return False

# ============================================================
# 1. GET THE FACEBUILDER HEAD
# ============================================================
head = bpy.context.active_object

if head is None or head.type != 'MESH':
    # Try to find FaceBuilder head automatically
    for obj in bpy.data.objects:
        if obj.type == 'MESH' and ('facebuilder' in obj.name.lower() or 'fb' in obj.name.lower() or 'head' in obj.name.lower()):
            head = obj
            break

if head is None or head.type != 'MESH':
    raise RuntimeError(
        "No head mesh found!\n"
        "Please select your FaceBuilder head mesh and run again."
    )

head.name = "AvatarHead"
bpy.context.view_layer.objects.active = head
head.select_set(True)
print(f"Using mesh: {head.name} ({len(head.data.vertices)} verts)")

# Smooth shading
bpy.ops.object.shade_smooth()

# ============================================================
# 2. CALCULATE MESH BOUNDS
# ============================================================
mesh = head.data
verts_co = [v.co.copy() for v in mesh.vertices]
min_x = min(v.x for v in verts_co); max_x = max(v.x for v in verts_co)
min_y = min(v.y for v in verts_co); max_y = max(v.y for v in verts_co)
min_z = min(v.z for v in verts_co); max_z = max(v.z for v in verts_co)
H = max_y - min_y
W = max_x - min_x
D = max_z - min_z
cx = (min_x + max_x) / 2
cy = (min_y + max_y) / 2

def norm_pos(co):
    ny = (co.y - min_y) / H if H > 0 else 0.5
    nz = (co.z - min_z) / D if D > 0 else 0.5
    nx = (co.x - cx) / (W / 2) if W > 0 else 0
    return nx, ny, nz

print(f"Bounds: H={H:.3f} W={W:.3f} D={D:.3f}")

# ============================================================
# 3. MATERIALS
# ============================================================
def create_principled(name, color, roughness=0.5, subsurface=0.0, ss_radius=None, metallic=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    output = nodes.new('ShaderNodeOutputMaterial'); output.location = (400, 0)
    bsdf = nodes.new('ShaderNodeBsdfPrincipled'); bsdf.location = (0, 0)
    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    bsdf.inputs['Base Color'].default_value = color
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metallic
    if subsurface > 0:
        if IS_4 and 'Subsurface Weight' in bsdf.inputs:
            bsdf.inputs['Subsurface Weight'].default_value = subsurface
            if ss_radius and 'Subsurface Radius' in bsdf.inputs:
                bsdf.inputs['Subsurface Radius'].default_value = ss_radius[:3]
        elif 'Subsurface' in bsdf.inputs:
            bsdf.inputs['Subsurface'].default_value = subsurface
    return mat, bsdf, nodes, links

# --- SKIN with pore detail ---
skin_mat, skin_bsdf, sn, sl = create_principled(
    "Skin", (0.76, 0.57, 0.45, 1.0), 0.45, 0.35, (0.9, 0.4, 0.25, 1.0))

noise1 = sn.new('ShaderNodeTexNoise'); noise1.location = (-400, 200)
noise1.inputs['Scale'].default_value = 120; noise1.inputs['Detail'].default_value = 8
mix_c = sn.new('ShaderNodeMixRGB'); mix_c.location = (-200, 100)
mix_c.blend_type = 'OVERLAY'; mix_c.inputs['Fac'].default_value = 0.12
mix_c.inputs['Color1'].default_value = (0.76, 0.57, 0.45, 1.0)
mix_c.inputs['Color2'].default_value = (0.82, 0.50, 0.40, 1.0)
sl.new(noise1.outputs['Fac'], mix_c.inputs['Fac'])
sl.new(mix_c.outputs['Color'], skin_bsdf.inputs['Base Color'])

pore = sn.new('ShaderNodeTexNoise'); pore.location = (-400, -200)
pore.inputs['Scale'].default_value = 350; pore.inputs['Detail'].default_value = 12
bump = sn.new('ShaderNodeBump'); bump.location = (-200, -200)
bump.inputs['Strength'].default_value = 0.12; bump.inputs['Distance'].default_value = 0.002
sl.new(pore.outputs['Fac'], bump.inputs['Height'])
sl.new(bump.outputs['Normal'], skin_bsdf.inputs['Normal'])

# --- LIPS ---
lip_mat = create_principled("Lips", (0.72, 0.40, 0.36, 1.0), 0.3, 0.5, (0.85, 0.3, 0.2, 1.0))[0]

# --- BEARD surface ---
beard_mat, beard_bsdf, bn, blinks = create_principled("Beard", (0.30, 0.18, 0.12, 1.0), 0.85)
vor = bn.new('ShaderNodeTexVoronoi'); vor.location = (-400, 100)
vor.inputs['Scale'].default_value = 250
bmix = bn.new('ShaderNodeMixRGB'); bmix.location = (-200, 100)
bmix.inputs['Color1'].default_value = (0.70, 0.52, 0.42, 1.0)
bmix.inputs['Color2'].default_value = (0.30, 0.18, 0.12, 1.0)
blinks.new(vor.outputs['Distance'], bmix.inputs['Fac'])
blinks.new(bmix.outputs['Color'], beard_bsdf.inputs['Base Color'])
bb = bn.new('ShaderNodeBump'); bb.location = (-200, -100); bb.inputs['Strength'].default_value = 0.3
blinks.new(vor.outputs['Distance'], bb.inputs['Height'])
blinks.new(bb.outputs['Normal'], beard_bsdf.inputs['Normal'])

# --- HAIR ---
hair_mat = create_principled("Hair", (0.10, 0.07, 0.05, 1.0), 0.6, metallic=0.05)[0]

# --- Others ---
eye_white_mat = create_principled("EyeWhite", (0.95, 0.93, 0.91, 1.0), 0.2)[0]
eyebrow_mat = create_principled("Eyebrow", (0.13, 0.09, 0.06, 1.0), 0.75)[0]
collar_mat = create_principled("Collar", (0.03, 0.03, 0.03, 1.0), 0.9)[0]
pupil_mat = create_principled("Pupil", (0.01, 0.01, 0.01, 1.0), 0.1)[0]
beard_hair_mat = create_principled("BeardHair", (0.32, 0.18, 0.10, 1.0), 0.9)[0]

# --- IRIS ---
iris_mat, iris_bsdf, inodes, ilinks = create_principled("Iris", (0.25, 0.35, 0.15, 1.0), 0.05)
iramp = inodes.new('ShaderNodeValToRGB'); iramp.location = (-200, 0)
iramp.color_ramp.elements[0].color = (0.15, 0.28, 0.12, 1.0)
iramp.color_ramp.elements[1].color = (0.45, 0.35, 0.15, 1.0)
igrad = inodes.new('ShaderNodeTexGradient'); igrad.location = (-400, 0)
igrad.gradient_type = 'SPHERICAL'
ilinks.new(igrad.outputs['Fac'], iramp.inputs['Fac'])
ilinks.new(iramp.outputs['Color'], iris_bsdf.inputs['Base Color'])

print("Materials created")

# ============================================================
# 4. ASSIGN MATERIALS BY REGION
# ============================================================
head.data.materials.clear()
mat_list = [skin_mat, lip_mat, beard_mat, hair_mat, eye_white_mat, iris_mat, eyebrow_mat, collar_mat]
for m in mat_list:
    head.data.materials.append(m)

SKIN, LIP, BEARD, HAIR, EYE_W, IRIS, EYEBROW, COLLAR = range(8)

# FaceBuilder meshes have better topology, so region detection works better
for poly in mesh.polygons:
    avg = Vector((0, 0, 0))
    for v in poly.vertices:
        avg += mesh.vertices[v].co
    avg /= len(poly.vertices)
    nx, ny, nz = norm_pos(avg)
    is_front = nz > 0.55

    if ny < 0.08:
        poly.material_index = COLLAR
    elif ny > 0.74:
        poly.material_index = HAIR
    elif ny > 0.58 and ny < 0.68 and is_front and abs(nx) > 0.10 and abs(nx) < 0.42:
        poly.material_index = EYEBROW
    elif ny > 0.50 and ny < 0.62 and is_front and abs(nx) > 0.06 and abs(nx) < 0.28:
        if abs(nx) > 0.12 and abs(nx) < 0.22 and ny > 0.53 and ny < 0.58:
            poly.material_index = IRIS
        else:
            poly.material_index = EYE_W
    elif ny > 0.30 and ny < 0.38 and is_front and abs(nx) < 0.18:
        poly.material_index = LIP
    elif ny < 0.44 and ny > 0.08 and (is_front or nz > 0.40) and abs(nx) < 0.52:
        poly.material_index = BEARD
    elif ny > 0.55 and ny < 0.75 and abs(nx) > 0.45:
        poly.material_index = HAIR
    else:
        poly.material_index = SKIN

print("Material regions assigned")

# ============================================================
# 5. EYEBALLS (separate objects)
# ============================================================
def create_eyeball(name, location):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.06, segments=32, ring_count=16, location=location)
    eyeball = bpy.context.active_object
    eyeball.name = name
    bpy.ops.object.shade_smooth()
    eyeball.data.materials.append(eye_white_mat)

    bpy.ops.mesh.primitive_circle_add(radius=0.025, vertices=32, fill_type='NGON',
        location=(location[0], location[1], location[2] + 0.052))
    iris_obj = bpy.context.active_object
    iris_obj.name = f"{name}_Iris"
    iris_obj.data.materials.append(iris_mat)
    iris_obj.parent = eyeball

    bpy.ops.mesh.primitive_circle_add(radius=0.012, vertices=32, fill_type='NGON',
        location=(location[0], location[1], location[2] + 0.054))
    pupil_obj = bpy.context.active_object
    pupil_obj.name = f"{name}_Pupil"
    pupil_obj.data.materials.append(pupil_mat)
    pupil_obj.parent = eyeball
    return eyeball

eye_y = min_y + H * 0.56
eye_z = min_z + D * 0.75
eye_sep = W * 0.18

left_eye = create_eyeball("LeftEye", (-eye_sep, eye_y, eye_z))
right_eye = create_eyeball("RightEye", (eye_sep, eye_y, eye_z))
left_eye.parent = head
right_eye.parent = head
print("Eyeballs created")

# ============================================================
# 6. PARTICLE SYSTEMS
# ============================================================
bpy.context.view_layer.objects.active = head
head.select_set(True)

def create_vertex_group(name, weight_fn):
    vg = head.vertex_groups.new(name=name)
    for v in mesh.vertices:
        nx, ny, nz = norm_pos(v.co)
        w = weight_fn(nx, ny, nz)
        if w > 0.05:
            vg.add([v.index], min(1.0, w), 'REPLACE')
    return vg

def setup_particles(mod_name, count, length, child_count, vg_name):
    mod = head.modifiers.new(mod_name, 'PARTICLE_SYSTEM')
    ps = mod.particle_system
    s = ps.settings
    s.type = 'HAIR'
    s.count = count
    s.hair_length = length
    s.child_type = 'INTERPOLATED'
    s.rendered_child_count = child_count
    safe_set(s, ['root_radius', 'root_radius_scale'], 0.5)
    safe_set(s, ['tip_radius', 'tip_radius_scale'], 0.1)
    # Try both APIs for vertex group
    if not safe_set(s, 'vertex_group_density', vg_name):
        safe_set(ps, 'vertex_group_density', vg_name)
    return mod, ps, s

# HAIR
create_vertex_group("HairDensity", lambda nx, ny, nz:
    min(1.0, (ny - 0.70) / 0.15) * max(0, 1.0 - max(0, abs(nx) - 0.3) * 3)
    if ny > 0.70 else
    (0.15 * max(0, 1.0 - (abs(nx) - 0.40) * 2) if ny > 0.55 and abs(nx) > 0.40 else 0))
setup_particles("HairParticles", 8000, 0.04, 50, "HairDensity")

# BEARD
def beard_w(nx, ny, nz):
    if ny > 0.10 and ny < 0.42 and (nz > 0.40 or abs(nx) < 0.45):
        chin = max(0, 1.0 - abs(ny - 0.25) * 5)
        jaw = max(0, 1.0 - abs(ny - 0.35) * 4) * (1 if abs(nx) > 0.2 else 0.7)
        w = max(chin, jaw) * 0.8
        if ny > 0.34 and ny < 0.42 and abs(nx) < 0.2 and nz > 0.55:
            w = 0.9
        return w
    return 0
create_vertex_group("BeardDensity", beard_w)
setup_particles("BeardParticles", 5000, 0.012, 30, "BeardDensity")
head.data.materials.append(beard_hair_mat)

# EYEBROWS
create_vertex_group("EyebrowDensity", lambda nx, ny, nz:
    (max(0, 1.0 - (abs(nx) - 0.15) * 2) if abs(nx) > 0.15 else 1.0) *
    max(0, 1.0 - abs(ny - 0.64) * 15)
    if ny > 0.60 and ny < 0.68 and nz > 0.55 and abs(nx) > 0.08 and abs(nx) < 0.40 else 0)
setup_particles("EyebrowParticles", 1500, 0.015, 20, "EyebrowDensity")

print("Particle systems created")

# ============================================================
# 7. SHAPE KEYS (lip-sync visemes)
# ============================================================
if bpy.context.mode != 'OBJECT':
    bpy.ops.object.mode_set(mode='OBJECT')

head.shape_key_add(name="Basis", from_mix=False)

def create_viseme(name, transform_fn):
    sk = head.shape_key_add(name=name, from_mix=False)
    for i, vert in enumerate(mesh.vertices):
        nx, ny, nz = norm_pos(vert.co)
        if ny > 0.20 and ny < 0.45 and nz > 0.45 and abs(nx) < 0.40:
            strength = max(0.1, max(0, 1.0 - abs(ny - 0.34) * 5) * max(0, 1.0 - abs(nx) * 2))
            dx, dy, dz = transform_fn(nx, ny, nz)
            sk.data[i].co.x = vert.co.x + dx * strength
            sk.data[i].co.y = vert.co.y + dy * strength
            sk.data[i].co.z = vert.co.z + dz * strength
    sk.value = 0.0

create_viseme("viseme_A",      lambda nx, ny, nz: (0, -0.04 if ny < 0.34 else 0.015, 0.005))
create_viseme("viseme_E",      lambda nx, ny, nz: (0.02*(1 if nx>0 else -1), -0.015 if ny<0.34 else 0.008, -0.003))
create_viseme("viseme_O",      lambda nx, ny, nz: (-0.015*nx, -0.02 if ny<0.34 else 0.01, 0.025*max(0,1-abs(nx)*3)))
create_viseme("viseme_U",      lambda nx, ny, nz: (-0.02*nx, -0.01 if ny<0.34 else 0.005, 0.035*max(0,1-abs(nx)*4)))
create_viseme("viseme_closed", lambda nx, ny, nz: (0, 0.015 if ny<0.34 else -0.015, 0.003))
create_viseme("viseme_smile",  lambda nx, ny, nz: (0.025*(1 if nx>0 else -1), 0.01 if ny>0.34 else -0.005, -0.002))
create_viseme("viseme_FV",     lambda nx, ny, nz: (0, 0.01 if ny<0.34 else 0, -0.015 if ny<0.34 else 0))
create_viseme("viseme_TH",     lambda nx, ny, nz: (0, -0.015 if ny<0.34 else 0.008, 0.01))

print(f"Shape keys: {[sk.name for sk in head.data.shape_keys.key_blocks]}")

# ============================================================
# 8. LIGHTING
# ============================================================
key = bpy.data.lights.new("KeyLight", 'AREA')
key.energy = 200; key.color = (1.0, 0.95, 0.88); key.size = 2.5
key_obj = bpy.data.objects.new("KeyLight", key)
bpy.context.collection.objects.link(key_obj)
key_obj.location = (1.2, 1.8, 1.5)
key_obj.rotation_euler = (math.radians(-30), math.radians(25), 0)

fill = bpy.data.lights.new("FillLight", 'AREA')
fill.energy = 80; fill.color = (0.88, 0.92, 1.0); fill.size = 3
fill_obj = bpy.data.objects.new("FillLight", fill)
bpy.context.collection.objects.link(fill_obj)
fill_obj.location = (-1.8, 1.5, 0.8)

rim = bpy.data.lights.new("RimLight", 'SPOT')
rim.energy = 250; rim.color = (1.0, 0.96, 0.90)
rim_obj = bpy.data.objects.new("RimLight", rim)
bpy.context.collection.objects.link(rim_obj)
rim_obj.location = (0, -1.8, 1.8)
rim_obj.rotation_euler = (math.radians(55), 0, math.radians(180))

# ============================================================
# 9. CAMERA
# ============================================================
cam = bpy.data.cameras.new("AvatarCam")
cam.lens = 85
cam_obj = bpy.data.objects.new("AvatarCam", cam)
bpy.context.collection.objects.link(cam_obj)
cam_obj.location = (0, 2.2, cy + 0.1)
cam_obj.rotation_euler = (math.radians(-88), 0, 0)
bpy.context.scene.camera = cam_obj

# ============================================================
# 10. EXPORT GLB
# ============================================================
bpy.ops.object.select_all(action='DESELECT')
head.select_set(True)
left_eye.select_set(True); right_eye.select_set(True)
for child in left_eye.children: child.select_set(True)
for child in right_eye.children: child.select_set(True)
bpy.context.view_layer.objects.active = head

try:
    bpy.ops.export_scene.gltf(
        filepath=OUTPUT_GLB,
        export_format='GLB',
        use_selection=True,
        export_apply=False,
        export_morph=True,
        export_morph_normal=True,
        export_lights=False,
        export_cameras=False,
        export_materials='EXPORT',
    )
    print(f"\nExported: {OUTPUT_GLB}")
except Exception as e:
    print(f"\nExport note: {e}")
    print("Try manually: File > Export > glTF 2.0")

print(f"""
{'='*55}
  DONE! (Blender {BV[0]}.{BV[1]})
{'='*55}

Your avatar has:
  - Your face geometry (from FaceBuilder)
  - Skin with pores & subsurface scattering
  - Hair particles (dark, short, side fade)
  - Beard particles (brown-red stubble)
  - Eyebrow particles
  - 3D eyeballs (hazel-green iris)
  - 8 lip-sync shape keys

Exported to: {OUTPUT_GLB}

Next: Update Avatar3D.js to load the GLB!
{'='*55}
""")
