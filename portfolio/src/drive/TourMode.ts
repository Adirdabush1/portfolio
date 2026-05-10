import gsap from "gsap";
import type { RapierRigidBody } from "@react-three/rapier";
import { RigidBodyType } from "@dimforge/rapier3d-compat";
import { Quaternion, Vector3 } from "three";
import { BILLBOARDS, CAR } from "./constants";
import { driveStore } from "./useDriveStore";

const APPROACH_DIST = 6;
const HOLD_DURATION = 2.0;
const TRAVEL_PER_UNIT = 0.06;

interface TourTarget {
  approach: Vector3;
  facing: Quaternion;
}

function buildTargets(): TourTarget[] {
  return BILLBOARDS.map((b) => {
    const sign = new Vector3(b.position[0], 0, b.position[2]);
    const dirFromOrigin = sign.clone().normalize();
    const approach = sign.clone().sub(dirFromOrigin.multiplyScalar(APPROACH_DIST));
    approach.y = CAR.SPAWN[1];
    const heading = Math.atan2(sign.x - approach.x, sign.z - approach.z);
    const facing = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), heading + Math.PI);
    return { approach, facing };
  });
}

let activeTimeline: gsap.core.Timeline | null = null;

export function stopTour(body: RapierRigidBody | null) {
  if (activeTimeline) {
    activeTimeline.kill();
    activeTimeline = null;
  }
  if (body) {
    body.setBodyType(RigidBodyType.Dynamic, true);
    body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    body.setAngvel({ x: 0, y: 0, z: 0 }, true);
  }
  driveStore.setTour(false);
}

export function runTour(body: RapierRigidBody, onDone: () => void) {
  if (activeTimeline) activeTimeline.kill();

  driveStore.setTour(true);
  body.setLinvel({ x: 0, y: 0, z: 0 }, true);
  body.setAngvel({ x: 0, y: 0, z: 0 }, true);
  body.setBodyType(RigidBodyType.KinematicPositionBased, true);

  const targets = buildTargets();
  const cur = body.translation();
  const proxy = {
    x: cur.x,
    y: CAR.SPAWN[1],
    z: cur.z,
    qx: 0,
    qy: 0,
    qz: 0,
    qw: 1,
  };

  const writeBack = () => {
    body.setNextKinematicTranslation({ x: proxy.x, y: proxy.y, z: proxy.z });
    body.setNextKinematicRotation({ x: proxy.qx, y: proxy.qy, z: proxy.qz, w: proxy.qw });
  };

  const tl = gsap.timeline({
    onComplete: () => {
      activeTimeline = null;
      body.setBodyType(RigidBodyType.Dynamic, true);
      driveStore.setTour(false);
      onDone();
    },
    onInterrupt: () => {
      activeTimeline = null;
    },
  });

  for (const t of targets) {
    const dx = t.approach.x - proxy.x;
    const dz = t.approach.z - proxy.z;
    const dist = Math.hypot(dx, dz);
    const travel = Math.max(1.2, dist * TRAVEL_PER_UNIT);

    tl.to(proxy, {
      x: t.approach.x,
      y: t.approach.y,
      z: t.approach.z,
      qx: t.facing.x,
      qy: t.facing.y,
      qz: t.facing.z,
      qw: t.facing.w,
      duration: travel,
      ease: "power2.inOut",
      onUpdate: writeBack,
    });
    tl.to(proxy, { duration: HOLD_DURATION, onUpdate: writeBack });
  }

  tl.to(proxy, {
    x: CAR.SPAWN[0],
    y: CAR.SPAWN[1],
    z: CAR.SPAWN[2],
    qx: 0,
    qy: 0,
    qz: 0,
    qw: 1,
    duration: 2,
    ease: "power2.inOut",
    onUpdate: writeBack,
  });

  activeTimeline = tl;
  return tl;
}
