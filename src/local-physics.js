import planck from "planck";

const SCALE = 30;
const ARENA_W = 912;
const ARENA_H = 500;
const FLOOR_Y = ARENA_H;
const GRAVITY = 97.5;
const PHYSICS_DT = 1 / 60;
const MOVE_SPEED = 15;
const JUMP_IMPULSE = 40;
const PLAYER_HALF_W = 0.48;
const HEAD_OFFSET = 36;
const HEAD_RADIUS = 14 / SCALE;
const STAND_LIFT = 0.14;
const PLAYER_HALF_H = 1.06;
const CROUCH_SPEED_MUL = 0.45;

const pxToM = (px) => px / SCALE;
const mToPx = (m) => m * SCALE;

export class LocalPhysicsEngine {
    constructor() {
        this.world = planck.World({ gravity: planck.Vec2(0, GRAVITY) });
        this.accumulator = 0;
        this.torso = null;
        this.head = null;
        this.platformFixtures = [];
        this.grounded = true;
        this.jumpGrace = 0;
        this._createStaticWorld();
    }

    _createStaticWorld() {
        const ground = this.world.createBody();
        ground.createFixture(
            planck.Edge(planck.Vec2(0, pxToM(FLOOR_Y)), planck.Vec2(pxToM(ARENA_W), pxToM(FLOOR_Y))),
            { friction: 1.0 },
        );
        ground.createFixture(planck.Edge(planck.Vec2(0, 0), planck.Vec2(0, pxToM(ARENA_H))), { friction: 0 });
        ground.createFixture(
            planck.Edge(planck.Vec2(pxToM(ARENA_W), 0), planck.Vec2(pxToM(ARENA_W), pxToM(ARENA_H))),
            { friction: 0 },
        );
        ground.createFixture(
            planck.Edge(planck.Vec2(0, 0), planck.Vec2(pxToM(ARENA_W), 0)),
            { friction: 0.2, restitution: 0.12 },
        );
        this.groundBody = ground;
    }

    destroy() {
        if (this.torso) {
            this.world.destroyBody(this.torso);
            this.torso = null;
        }
        if (this.head) {
            this.world.destroyBody(this.head);
            this.head = null;
        }
        this._clearPlatforms();
    }

    _clearPlatforms() {
        for (const entry of this.platformFixtures) {
            if (entry.body) this.world.destroyBody(entry.body);
        }
        this.platformFixtures = [];
    }

    ensureBodies(torsoPx, headPx) {
        if (this.torso) return;

        this.torso = this.world.createDynamicBody({
            position: planck.Vec2(pxToM(torsoPx.x), pxToM(torsoPx.y)),
            fixedRotation: true,
        });
        this.torso.createFixture(planck.Box(PLAYER_HALF_W, 0.78, planck.Vec2(0, 0.28)), {
            density: 2.0,
            friction: 0.5,
            restitution: 0.0,
        });

        this.head = this.world.createDynamicBody({
            position: planck.Vec2(pxToM(headPx.x), pxToM(headPx.y)),
        });
        this.head.createFixture(planck.Circle(HEAD_RADIUS), {
            density: 1.0,
            friction: 0.6,
            restitution: 0.0,
        });

        this.world.createJoint(
            planck.RevoluteJoint(
                { lowerAngle: -0.2, upperAngle: 0.2, enableLimit: true },
                this.torso,
                this.head,
                this.head.getPosition(),
            ),
        );
    }

    syncPlatforms(platforms) {
        this._clearPlatforms();
        for (const plat of platforms) {
            if (plat.broken) continue;
            const cx = plat.x + plat.w / 2;
            const cy = plat.y + plat.h / 2;
            const body = this.world.createBody({
                type: "kinematic",
                position: planck.Vec2(pxToM(cx), pxToM(cy)),
            });
            body.createFixture(planck.Box(pxToM(plat.w / 2), pxToM(plat.h / 2)), {
                friction: 0.55,
                restitution: 0.0,
            });
            if (plat.kind === "elevator" && plat.vx) {
                body.setLinearVelocity(planck.Vec2(plat.vx / SCALE, 0));
            }
            this.platformFixtures.push({ id: plat.id, body });
        }
    }

    _measureGrounded() {
        if (!this.torso) return false;
        const pos = this.torso.getPosition();
        const feetY = pos.y + 0.28 + 0.78;
        if (feetY * SCALE >= FLOOR_Y - 14) return true;

        for (let edge = this.torso.getContactList(); edge; edge = edge.next) {
            if (!edge.contact.isTouching()) continue;
            const other = edge.contact.getFixtureB().getBody();
            if (other === this.groundBody) return true;
            for (const entry of this.platformFixtures) {
                if (other === entry.body) return true;
            }
        }
        return false;
    }

    _snapToGround() {
        if (!this.torso) return;
        const vel = this.torso.getLinearVelocity();
        if (Math.abs(vel.y) > 12) return;

        const pos = this.torso.getPosition();
        const feetY = pos.y + 0.28 + 0.78;
        if (feetY * SCALE < FLOOR_Y - 20) return;

        const targetY = pxToM(FLOOR_Y - PLAYER_HALF_H * SCALE);
        const dy = targetY - pos.y;
        if (dy > -0.12 && dy < 0.45) {
            this.torso.setTransform(planck.Vec2(pos.x, targetY), 0);
            if (Math.abs(vel.y) < 1.5) {
                this.torso.setLinearVelocity(planck.Vec2(vel.x, 0));
            }
        }
    }

    applyInput({ action, crouching, jump, platVx = 0 }) {
        if (!this.torso) return;

        this.torso.setAwake(true);
        this.grounded = this._measureGrounded();
        const speedMul = crouching && this.grounded ? CROUCH_SPEED_MUL : 1;
        const vel = this.torso.getLinearVelocity();
        const keepVy = vel.y;

        if (action === "left") {
            this.torso.setLinearVelocity(planck.Vec2(-MOVE_SPEED * speedMul, keepVy));
        } else if (action === "right") {
            this.torso.setLinearVelocity(planck.Vec2(MOVE_SPEED * speedMul, keepVy));
        } else if (action === "crouch" || (crouching && !action)) {
            this.torso.setLinearVelocity(planck.Vec2(vel.x * 0.35, keepVy));
        } else {
            this.torso.setLinearVelocity(planck.Vec2(0, keepVy));
        }

        if (platVx !== 0) {
            const v = this.torso.getLinearVelocity();
            this.torso.setLinearVelocity(planck.Vec2(v.x + platVx / SCALE, v.y));
        }

        if (jump && this.grounded) {
            const mass = this.torso.getMass();
            const keepVx = this.torso.getLinearVelocity().x;
            this.torso.setLinearVelocity(planck.Vec2(keepVx, 0));
            this.torso.applyLinearImpulse(
                planck.Vec2(0, -mass * JUMP_IMPULSE),
                this.torso.getWorldCenter(),
                true,
            );
            this.grounded = false;
            this.jumpGrace = 18;
        }
    }

    step(deltaSec) {
        if (!this.torso) return;
        this.accumulator += deltaSec;
        const maxSteps = 4;
        let steps = 0;
        while (this.accumulator >= PHYSICS_DT && steps < maxSteps) {
            this.world.step(PHYSICS_DT);
            this._snapToGround();
            this.grounded = this._measureGrounded();
            this.accumulator -= PHYSICS_DT;
            steps += 1;
        }
    }

    getDisplayState() {
        if (!this.torso || !this.head) {
            return { torso: null, head: null, vx: 0, vy: 0, grounded: true };
        }
        const tPos = this.torso.getPosition();
        const hPos = this.head.getPosition();
        const vel = this.torso.getLinearVelocity();
        return {
            torso: {
                x: mToPx(tPos.x),
                y: mToPx(tPos.y),
                angle: this.torso.getAngle(),
            },
            head: {
                x: mToPx(hPos.x),
                y: mToPx(hPos.y),
                angle: this.head.getAngle(),
            },
            vx: mToPx(vel.x),
            vy: mToPx(vel.y),
            grounded: this.grounded,
        };
    }

    isGrounded() {
        return this.grounded;
    }

    reconcileToServer(serverTorso, serverHead, blend = 0.18) {
        if (!this.torso || !this.head || !serverTorso) return;

        if (this.jumpGrace > 0) this.jumpGrace -= 1;

        const t = this.torso.getPosition();
        const targetX = pxToM(serverTorso.x);
        const targetY = pxToM(serverTorso.y);
        const errX = Math.abs(mToPx(t.x - targetX));
        const errY = Math.abs(mToPx(t.y - targetY));
        const err = Math.hypot(errX, errY);
        const vel = this.torso.getLinearVelocity();
        const preserveY = !this.grounded || this.jumpGrace > 0 || vel.y < -1.5 || Math.abs(vel.y) > 3;

        if (err > 220) {
            this.torso.setTransform(
                planck.Vec2(targetX, preserveY ? t.y : targetY),
                serverTorso.angle ?? 0,
            );
            if (serverHead) {
                const h = this.head.getPosition();
                this.head.setTransform(
                    planck.Vec2(pxToM(serverHead.x), preserveY ? h.y : pxToM(serverHead.y)),
                    serverHead.angle ?? 0,
                );
            }
            this.accumulator = 0;
            return;
        }

        if (preserveY) {
            if (errX < 6) return;
            const xBlend = Math.min(0.32, blend + errX / 700);
            const nx = t.x + (targetX - t.x) * xBlend;
            this.torso.setTransform(planck.Vec2(nx, t.y), this.torso.getAngle());
            if (serverHead) {
                const h = this.head.getPosition();
                const hx = pxToM(serverHead.x);
                this.head.setTransform(
                    planck.Vec2(h.x + (hx - h.x) * xBlend, h.y),
                    this.head.getAngle(),
                );
            }
            return;
        }

        if (err < 6) return;

        const tBlend = Math.min(0.45, blend + err / 600);
        const nx = t.x + (targetX - t.x) * tBlend;
        const ny = t.y + (targetY - t.y) * tBlend;
        this.torso.setTransform(planck.Vec2(nx, ny), this.torso.getAngle());

        if (serverHead) {
            const h = this.head.getPosition();
            const hx = pxToM(serverHead.x);
            const hy = pxToM(serverHead.y);
            this.head.setTransform(
                planck.Vec2(h.x + (hx - h.x) * tBlend, h.y + (hy - h.y) * tBlend),
                this.head.getAngle(),
            );
        }
    }

    hardSync(serverTorso, serverHead) {
        if (!this.torso || !serverTorso) return;
        this.torso.setTransform(
            planck.Vec2(pxToM(serverTorso.x), pxToM(serverTorso.y)),
            serverTorso.angle ?? 0,
        );
        if (this.head && serverHead) {
            this.head.setTransform(
                planck.Vec2(pxToM(serverHead.x), pxToM(serverHead.y)),
                serverHead.angle ?? 0,
            );
        }
        this.accumulator = 0;
        this.grounded = this._measureGrounded();
    }
}
