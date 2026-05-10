import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef, Suspense, useImperativeHandle, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { Quaternion, Vector3 } from "three";
import { TOY, CAMERA } from "./constants";
import { useKeyboard } from "../drive/useKeyboard";
import { touch } from "../drive/touch";
import { CarModel, CarFallback } from "../drive/models/CarModel";
const FORWARD = new Vector3();
const TMP_POS = new Vector3();
const CAM_TARGET = new Vector3();
const LOOK_TARGET = new Vector3();
const HEAD_OFFSET = new Vector3(0, 0.2, 0);
const Q = new Quaternion();
const OFFSET = new Vector3(...CAMERA.OFFSET);
const Body = () => (_jsx("group", { scale: [TOY.SCALE, TOY.SCALE, TOY.SCALE], children: _jsx(Suspense, { fallback: _jsx(CarFallback, {}), children: _jsx(CarModel, {}) }) }));
const ToyCar = forwardRef((_, ref) => {
    const bodyRef = useRef(null);
    const keys = useKeyboard();
    const { camera } = useThree();
    const groundedRef = useRef(true);
    const lastBounceRef = useRef(0);
    const lookSmoothed = useRef(new Vector3(0, 0.5, 0));
    const doReset = () => {
        const body = bodyRef.current;
        if (!body)
            return;
        body.setTranslation({ x: TOY.SPAWN[0], y: TOY.SPAWN[1], z: TOY.SPAWN[2] }, true);
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
        if (!body)
            return;
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
        const accelMag = fwdAxis > 0 ? TOY.ACCEL : TOY.REVERSE_ACCEL;
        if (Math.abs(fwdAxis) > 0.05) {
            const f = FORWARD.clone().multiplyScalar(accelMag * fwdAxis * dt * body.mass());
            body.applyImpulse({ x: f.x, y: 0, z: f.z }, true);
        }
        if (Math.abs(turnAxis) > 0.05) {
            const linvel = body.linvel();
            const speed = Math.hypot(linvel.x, linvel.z);
            const speedFactor = Math.min(1, 0.5 + speed / 4);
            body.applyTorqueImpulse({ x: 0, y: TOY.TURN_RATE * turnAxis * dt * speedFactor * body.mass(), z: 0 }, true);
        }
        const now = performance.now();
        if ((k.bounce || touch.bounce) && now - lastBounceRef.current > 600 && groundedRef.current) {
            body.applyImpulse({ x: 0, y: TOY.BOUNCE_IMPULSE, z: 0 }, true);
            lastBounceRef.current = now;
            groundedRef.current = false;
            touch.bounce = false;
        }
        const t = body.translation();
        if (t.y < TOY.SPAWN[1] + 0.3)
            groundedRef.current = true;
        const linvel = body.linvel();
        const planarSpeed = Math.hypot(linvel.x, linvel.z);
        let vx = linvel.x;
        let vy = linvel.y;
        let vz = linvel.z;
        if (planarSpeed > TOY.MAX_SPEED) {
            const s = TOY.MAX_SPEED / planarSpeed;
            vx *= s;
            vz *= s;
        }
        if (vy > TOY.MAX_VERTICAL_SPEED)
            vy = TOY.MAX_VERTICAL_SPEED;
        if (vx !== linvel.x || vy !== linvel.y || vz !== linvel.z) {
            body.setLinvel({ x: vx, y: vy, z: vz }, true);
        }
        updateCamera(body, dt);
    });
    function updateCamera(body, dt) {
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
    return (_jsx(RigidBody, { ref: bodyRef, colliders: "cuboid", mass: TOY.MASS, position: TOY.SPAWN, linearDamping: TOY.LINEAR_DAMPING, angularDamping: TOY.ANGULAR_DAMPING, enabledRotations: [false, true, false], children: _jsx(Body, {}) }));
});
ToyCar.displayName = "ToyCar";
export default ToyCar;
