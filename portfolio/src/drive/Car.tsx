import { forwardRef, Suspense, useImperativeHandle, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { Quaternion, Vector3 } from "three";
import { CAR, CAMERA, BILLBOARDS, PROXIMITY_RADIUS } from "./constants";
import { useKeyboard } from "./useKeyboard";
import { touch } from "./touch";
import { driveStore } from "./useDriveStore";
import { CarModel, CarFallback } from "./models/CarModel";

export interface CarHandle {
  body: RapierRigidBody | null;
  reset: () => void;
}

const FORWARD = new Vector3();
const RIGHT = new Vector3();
const TMP_POS = new Vector3();
const CAM_TARGET = new Vector3();
const LOOK_TARGET = new Vector3();
const HEAD_OFFSET = new Vector3(0, 0.8, 0);
const Q = new Quaternion();
const OFFSET = new Vector3(...CAMERA.OFFSET);

const Body = () => (
  <Suspense fallback={<CarFallback />}>
    <CarModel />
  </Suspense>
);

const Car = forwardRef<CarHandle>((_, ref) => {
  const bodyRef = useRef<RapierRigidBody | null>(null);
  const keys = useKeyboard();
  const { camera } = useThree();
  const groundedRef = useRef(true);
  const lastBounceRef = useRef(0);
  const lookSmoothed = useRef(new Vector3(0, 1, 0));

  const doReset = () => {
    const body = bodyRef.current;
    if (!body) return;
    body.setTranslation({ x: CAR.SPAWN[0], y: CAR.SPAWN[1], z: CAR.SPAWN[2] }, true);
    body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    body.setAngvel({ x: 0, y: 0, z: 0 }, true);
    body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
  };

  useImperativeHandle(ref, () => ({
    get body() {
      return bodyRef.current;
    },
    reset: doReset,
  }));

  useFrame((_state, dt) => {
    const body = bodyRef.current;
    if (!body) return;
    if (driveStore.state.tourActive) {
      // Tour controls the body via TourMode component
      updateCamera(body, dt);
      return;
    }
    const k = keys.current;

    if (k.reset || touch.reset) {
      doReset();
      touch.reset = false;
      return;
    }

    const fwdAxis = (k.forward ? 1 : 0) - (k.back ? 1 : 0) + touch.forward;
    const turnAxis = (k.left ? 1 : 0) - (k.right ? 1 : 0) - touch.turn;

    const rot = body.rotation();
    Q.set(rot.x, rot.y, rot.z, rot.w);
    FORWARD.set(0, 0, -1).applyQuaternion(Q);
    RIGHT.set(1, 0, 0).applyQuaternion(Q);

    const accelMag = fwdAxis > 0 ? CAR.ACCEL : CAR.REVERSE_ACCEL;
    if (Math.abs(fwdAxis) > 0.05) {
      const f = FORWARD.clone().multiplyScalar(accelMag * fwdAxis * dt * body.mass());
      body.applyImpulse({ x: f.x, y: 0, z: f.z }, true);
    }

    if (Math.abs(turnAxis) > 0.05) {
      const linvel = body.linvel();
      const speed = Math.hypot(linvel.x, linvel.z);
      const speedFactor = Math.min(1, 0.5 + speed / 8);
      body.applyTorqueImpulse(
        { x: 0, y: CAR.TURN_RATE * turnAxis * dt * speedFactor * body.mass(), z: 0 },
        true,
      );
    }

    const now = performance.now();
    if ((k.bounce || touch.bounce) && now - lastBounceRef.current > 700 && groundedRef.current) {
      body.applyImpulse({ x: 0, y: CAR.BOUNCE_IMPULSE, z: 0 }, true);
      lastBounceRef.current = now;
      groundedRef.current = false;
      touch.bounce = false;
    }

    const t = body.translation();
    if (t.y < 1.5) groundedRef.current = true;

    const linvel = body.linvel();
    const planarSpeed = Math.hypot(linvel.x, linvel.z);
    let vx = linvel.x;
    let vy = linvel.y;
    let vz = linvel.z;
    if (planarSpeed > CAR.MAX_SPEED) {
      const k = CAR.MAX_SPEED / planarSpeed;
      vx *= k;
      vz *= k;
    }
    if (vy > CAR.MAX_VERTICAL_SPEED) vy = CAR.MAX_VERTICAL_SPEED;
    if (vx !== linvel.x || vy !== linvel.y || vz !== linvel.z) {
      body.setLinvel({ x: vx, y: vy, z: vz }, true);
    }

    updateProximity(body);
    updateCamera(body, dt);
  });

  function updateProximity(body: RapierRigidBody) {
    const t = body.translation();
    let nearest: (typeof BILLBOARDS)[number] | null = null;
    let bestDist = PROXIMITY_RADIUS;
    for (const b of BILLBOARDS) {
      const dx = b.position[0] - t.x;
      const dz = b.position[2] - t.z;
      const d = Math.hypot(dx, dz);
      if (d < bestDist) {
        bestDist = d;
        nearest = b;
      }
    }
    driveStore.setNearby(nearest ? nearest.id : null);

    if (
      nearest &&
      (keys.current.interact || touch.interact) &&
      !driveStore.state.openBillboard
    ) {
      driveStore.open(nearest.id);
      keys.current.interact = false;
      touch.interact = false;
    }
  }

  function updateCamera(body: RapierRigidBody, dt: number) {
    const t = body.translation();
    const rot = body.rotation();
    Q.set(rot.x, rot.y, rot.z, rot.w);

    TMP_POS.set(t.x, t.y, t.z);
    const offsetWorld = OFFSET.clone().applyQuaternion(Q);
    CAM_TARGET.copy(TMP_POS).add(offsetWorld);

    FORWARD.set(0, 0, -1).applyQuaternion(Q).multiplyScalar(CAMERA.LOOK_AHEAD);
    LOOK_TARGET.copy(TMP_POS).add(FORWARD).add(HEAD_OFFSET);

    const posLerp = 1 - Math.pow(1 - CAMERA.POS_LERP, dt * 60);
    const lookLerp = 1 - Math.pow(1 - CAMERA.LOOK_LERP, dt * 60);
    camera.position.lerp(CAM_TARGET, posLerp);
    lookSmoothed.current.lerp(LOOK_TARGET, lookLerp);
    camera.lookAt(lookSmoothed.current);
  }

  return (
    <RigidBody
      ref={bodyRef}
      colliders="cuboid"
      mass={CAR.MASS}
      position={CAR.SPAWN}
      linearDamping={CAR.LINEAR_DAMPING}
      angularDamping={CAR.ANGULAR_DAMPING}
      enabledRotations={[false, true, false]}
    >
      <Body />
    </RigidBody>
  );
});

Car.displayName = "Car";
export default Car;
