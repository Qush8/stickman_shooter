import { defineGame, INVALID_MOVE } from "@bordiko/sdk";
import * as planck from "planck";

export interface BodyState {
  x: number;
  y: number;
  angle: number;
}

export interface PlayerState {
  health: number;
  aimAngle: number;
  facing: number;
  crouching: boolean;
  torso: BodyState;
  head: BodyState;
}

export interface BulletState {
  id: number;
  owner: string;
  body: BodyState;
}

export interface HitEvent {
  x: number;
  y: number;
  targetId: string;
  damage: number;
}

export interface PlatformState {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  health: number;
  maxHealth: number;
  broken: boolean;
}

export interface ShooterState {
  players: Record<string, PlayerState>;
  bullets: BulletState[];
  platforms: PlatformState[];
  nextBulletId: number;
  scores: Record<string, number>;
  hitEvents: HitEvent[];
}

const ARENA_W = 800;
const ARENA_H = 600;
const FLOOR_Y = ARENA_H;
const SCALE = 30;
const MAX_HEALTH = 1000;
const BULLET_DAMAGE = 125;
const MAX_BULLETS_PER_PLAYER = 3;
const PLAYER_HALF_W = 0.48;
const PLAYER_HALF_H = 1.06;
const HEAD_OFFSET = 36;
const HEAD_RADIUS = 0.46;
const MOVE_SPEED = 9.2;
const JUMP_IMPULSE = 19;
const FEET_PIXELS = PLAYER_HALF_H * SCALE;
const GROUNDED_VEL_Y = 5;
const GROUNDED_GAP = 0.5;
const STAND_LIFT = 0.14;
const MAX_BULLET_BOUNCES = 2;
const PLATFORM_MAX_HEALTH = BULLET_DAMAGE * 4;
const PLATFORM_BORDER_PX = 2;

// Visual stickman proportions (pixels) — keep in sync with ui.js STICK / GUN
const STICK_BODY_LEN_PX = 44;
const STICK_ARM_LEN_PX = 28;
const STICK_CROUCH_DROP_PX = 18;
const GUN_BARREL_PX = 22;
const GUN_TIP_PX = 3.5;

// Jump reach (px): vertical ~165, diagonal ~115 up + ~150 sideways — keep tiers within that.
const PLATFORMS = [
  { id: 0, x: 55, y: 488, w: 118, h: 12 },
  { id: 1, x: 205, y: 373, w: 118, h: 12 },
  { id: 2, x: 355, y: 488, w: 118, h: 12 },
  { id: 3, x: 505, y: 373, w: 118, h: 12 },
  { id: 4, x: 355, y: 258, w: 118, h: 12 },
  { id: 5, x: 205, y: 143, w: 118, h: 12 },
];

const spawnOnFloor = (x: number) => ({
  x,
  y: FLOOR_Y - PLAYER_HALF_H * SCALE,
});

type FixtureUserData =
  | { type: "player"; id: string }
  | { type: "head"; id: string }
  | { type: "bullet"; id: number; owner: string }
  | { type: "ground" }
  | { type: "platform"; id: number };

type PlatformDef = (typeof PLATFORMS)[number];

let world: planck.World;
let playerBodies: Record<string, { torso: planck.Body; head: planck.Body }> = {};
let platformBodies: Record<number, planck.Body> = {};
let bulletBodies: Record<number, planck.Body> = {};
let bulletBounceCounts: Record<number, number> = {};
let playerGrounded: Record<string, boolean> = {};
const pendingBulletDestroys = new Set<number>();
const pendingHits: HitEvent[] = [];
const pendingPlatformDamages: { id: number; damage: number; x: number; y: number }[] = [];
const sharedWorldManifold = new planck.WorldManifold();

function getFixtureData(fixture: planck.Fixture): FixtureUserData | null {
  return (fixture.getUserData() as FixtureUserData | null) ?? null;
}

function isSolidSurface(data: FixtureUserData | null, body: planck.Body) {
  if (data?.type === "ground") return true;
  if (data?.type === "platform") return true;
  return body.getType() === "static" && data?.type !== "bullet";
}

function createPlatformBody(def: PlatformDef) {
  const pBody = world.createBody({
    position: planck.Vec2((def.x + def.w / 2) / SCALE, (def.y + def.h / 2) / SCALE),
  });
  pBody.createFixture(planck.Box(def.w / 2 / SCALE, def.h / 2 / SCALE), {
    friction: 0.8,
    userData: { type: "platform", id: def.id } satisfies FixtureUserData,
  });
  platformBodies[def.id] = pBody;
}

function initPlatforms(G: ShooterState) {
  for (const body of Object.values(platformBodies)) {
    world.destroyBody(body);
  }
  platformBodies = {};
  G.platforms = PLATFORMS.map((def) => ({
    id: def.id,
    x: def.x,
    y: def.y,
    w: def.w,
    h: def.h,
    health: PLATFORM_MAX_HEALTH,
    maxHealth: PLATFORM_MAX_HEALTH,
    broken: false,
  }));
  for (const def of PLATFORMS) {
    createPlatformBody(def);
  }
}

function breakPlatform(G: ShooterState, id: number) {
  const plat = G.platforms.find((p) => p.id === id);
  if (!plat || plat.broken) return;
  plat.broken = true;
  plat.health = 0;
  const body = platformBodies[id];
  if (body) {
    world.destroyBody(body);
    delete platformBodies[id];
  }
  pendingHits.push({
    x: plat.x + plat.w / 2,
    y: plat.y + plat.h / 2,
    targetId: "",
    damage: 0,
  });
}

function damagePlatform(G: ShooterState, id: number, damage: number, x: number, y: number) {
  const plat = G.platforms.find((p) => p.id === id);
  if (!plat || plat.broken) return;
  plat.health = Math.max(0, plat.health - damage);
  pendingHits.push({ x, y, targetId: "", damage: 0 });
  if (plat.health <= 0) {
    breakPlatform(G, id);
  }
}

function destroyBullet(G: ShooterState, bulletId: number) {
  const body = bulletBodies[bulletId];
  if (body) {
    world.destroyBody(body);
    delete bulletBodies[bulletId];
  }
  delete bulletBounceCounts[bulletId];
  const idx = G.bullets.findIndex((b) => b.id === bulletId);
  if (idx >= 0) G.bullets.splice(idx, 1);
}

function computeMuzzleMeters(
  torsoXpx: number,
  torsoYpx: number,
  aimAngle: number,
  facing: number,
  crouching: boolean,
) {
  const drop = crouching ? STICK_CROUCH_DROP_PX : 0;
  const neckTop = torsoYpx - STICK_BODY_LEN_PX * 0.48 + drop * 0.2;
  const shoulderX = torsoXpx + facing * 2.5;
  const shoulderY = neckTop + 2;
  const handX = shoulderX + Math.cos(aimAngle) * STICK_ARM_LEN_PX;
  const handY = shoulderY + Math.sin(aimAngle) * STICK_ARM_LEN_PX;
  const muzzleDist = GUN_BARREL_PX + GUN_TIP_PX * 0.4;
  return {
    x: (handX + Math.cos(aimAngle) * muzzleDist) / SCALE,
    y: (handY + Math.sin(aimAngle) * muzzleDist) / SCALE,
  };
}

function createPlayerPhysics(id: string, x: number, y: number) {
  const torso = world.createDynamicBody({
    position: planck.Vec2(x / SCALE, y / SCALE),
    fixedRotation: true,
  });
  torso.createFixture(planck.Box(PLAYER_HALF_W, PLAYER_HALF_H), {
    density: 2.0,
    friction: 0.5,
    restitution: 0.0,
    userData: { type: "player", id } satisfies FixtureUserData,
  });

  const head = world.createDynamicBody({
    position: planck.Vec2(x / SCALE, (y - HEAD_OFFSET) / SCALE),
  });
  head.createFixture(planck.Circle(HEAD_RADIUS), {
    density: 1.0,
    friction: 0.6,
    restitution: 0.0,
    userData: { type: "head", id } satisfies FixtureUserData,
  });

  world.createJoint(
    planck.RevoluteJoint(
      {
        lowerAngle: -0.2,
        upperAngle: 0.2,
        enableLimit: true,
      },
      torso,
      head,
      head.getPosition(),
    ),
  );

  playerBodies[id] = { torso, head };
  playerGrounded[id] = true;
}

function destroyPlayerPhysics(id: string) {
  const bodies = playerBodies[id];
  if (!bodies) return;
  world.destroyBody(bodies.torso);
  world.destroyBody(bodies.head);
  delete playerBodies[id];
  delete playerGrounded[id];
}

function feetPositionMeters(torso: planck.Body) {
  const pos = torso.getPosition();
  return planck.Vec2(pos.x, pos.y + PLAYER_HALF_H);
}

function isStandableFixture(fixture: planck.Fixture, selfId: string) {
  const data = getFixtureData(fixture);
  const body = fixture.getBody();
  if (data?.type === "bullet") return false;
  if (data?.type === "player" || data?.type === "head") {
    if (data.id === selfId) return false;
    return playerBodies[data.id] != null;
  }
  return isSolidSurface(data, body);
}

function isFixtureGround(fixture: planck.Fixture) {
  const data = getFixtureData(fixture);
  const body = fixture.getBody();
  if (data?.type === "player" || data?.type === "head" || data?.type === "bullet") return false;
  return isSolidSurface(data, body);
}

function raycastStandBelow(feetX: number, feetY: number, selfId: string, maxDist = 0.75): planck.Vec2 | null {
  const hit = { point: null as planck.Vec2 | null };
  world.rayCast(
    planck.Vec2(feetX, feetY - 0.4),
    planck.Vec2(feetX, feetY + maxDist),
    (fixture, point) => {
      if (!isStandableFixture(fixture, selfId)) return 1;
      hit.point = point;
      return 0;
    },
  );
  return hit.point;
}

function feetOnSurface(feet: planck.Vec2, surfaceY: number) {
  const gap = surfaceY - feet.y;
  return gap >= -0.2 && gap <= GROUNDED_GAP;
}

function hasSupportContact(torso: planck.Body, selfId: string): boolean {
  for (let edge = torso.getContactList(); edge; edge = edge.next) {
    const contact = edge.contact;
    if (!contact.isTouching()) continue;

    const fixtureA = contact.getFixtureA();
    const fixtureB = contact.getFixtureB();
    const otherFixture = fixtureA.getBody() === torso ? fixtureB : fixtureA;
    if (fixtureA.getBody() !== torso && fixtureB.getBody() !== torso) continue;
    if (!isStandableFixture(otherFixture, selfId)) continue;

    contact.getWorldManifold(sharedWorldManifold);
    if (Math.abs(sharedWorldManifold.normal.y) > 0.1) return true;
  }
  return false;
}

function measureGrounded(id: string, torso: planck.Body): boolean {
  const vel = torso.getLinearVelocity();
  if (Math.abs(vel.y) > GROUNDED_VEL_Y) return false;

  if (hasSupportContact(torso, id)) return true;

  const feet = feetPositionMeters(torso);
  const surfaceHit = raycastStandBelow(feet.x, feet.y, id, 0.85);
  if (surfaceHit !== null && feetOnSurface(feet, surfaceHit.y)) return true;

  return feet.y * SCALE >= FLOOR_Y - 14;
}

function updatePlayerGroundedState() {
  for (const [id, bodies] of Object.entries(playerBodies)) {
    playerGrounded[id] = measureGrounded(id, bodies.torso);
  }
}

function raycastStaticGroundBelow(feetX: number, feetY: number, maxDist = 0.85): planck.Vec2 | null {
  const hit = { point: null as planck.Vec2 | null };
  world.rayCast(
    planck.Vec2(feetX, feetY - 0.4),
    planck.Vec2(feetX, feetY + maxDist),
    (fixture, point) => {
      if (!isFixtureGround(fixture)) return 1;
      hit.point = point;
      return 0;
    },
  );
  return hit.point;
}

function snapPlayersToGround() {
  for (const [, bodies] of Object.entries(playerBodies)) {
    const torso = bodies.torso;
    const vel = torso.getLinearVelocity();
    if (Math.abs(vel.y) > 3) continue;

    const feet = feetPositionMeters(torso);
    const surfaceHit = raycastStaticGroundBelow(feet.x, feet.y, 0.85);
    if (surfaceHit === null) continue;

    const targetTorsoY = surfaceHit.y - PLAYER_HALF_H - STAND_LIFT;
    const pos = torso.getPosition();
    const dy = targetTorsoY - pos.y;
    if (dy > -0.12 && dy < 0.45) {
      torso.setTransform(planck.Vec2(pos.x, targetTorsoY), 0);
      if (Math.abs(vel.y) < 1.5) {
        torso.setLinearVelocity(planck.Vec2(vel.x, 0));
      }
    }
  }
}

function isPlayerGrounded(id: string, torso: planck.Body): boolean {
  return measureGrounded(id, torso);
}

function syncStateFromPhysics(G: ShooterState) {
  for (const [id, p] of Object.entries(G.players)) {
    const bodies = playerBodies[id];
    if (bodies) {
      const tPos = bodies.torso.getPosition();
      const hPos = bodies.head.getPosition();
      p.torso = { x: tPos.x * SCALE, y: tPos.y * SCALE, angle: bodies.torso.getAngle() };
      p.head = { x: hPos.x * SCALE, y: hPos.y * SCALE, angle: bodies.head.getAngle() };
    }
  }

  for (const b of G.bullets) {
    const body = bulletBodies[b.id];
    if (body) {
      const pos = body.getPosition();
      b.body = { x: pos.x * SCALE, y: pos.y * SCALE, angle: body.getAngle() };
    }
  }
}

function processPendingHits(G: ShooterState) {
  for (const hit of pendingHits) {
    if (!hit.targetId) {
      if (hit.damage === 0) G.hitEvents.push(hit);
      continue;
    }

    const target = G.players[hit.targetId];
    if (!target) continue;

    if (target.health <= 0) {
      destroyPlayerPhysics(hit.targetId);
      continue;
    }

    target.health = Math.max(0, target.health - hit.damage);
    G.hitEvents.push(hit);

    if (target.health <= 0) {
      destroyPlayerPhysics(hit.targetId);
    }
  }
  pendingHits.length = 0;

  for (const hit of pendingPlatformDamages) {
    damagePlatform(G, hit.id, hit.damage, hit.x, hit.y);
  }
  pendingPlatformDamages.length = 0;

  for (const bulletId of pendingBulletDestroys) {
    destroyBullet(G, bulletId);
  }
  pendingBulletDestroys.clear();
}

function handleContact(contact: planck.Contact) {
  const fixtureA = contact.getFixtureA();
  const fixtureB = contact.getFixtureB();
  const dataA = getFixtureData(fixtureA);
  const dataB = getFixtureData(fixtureB);
  const bodyA = fixtureA.getBody();
  const bodyB = fixtureB.getBody();

  const bulletData =
    dataA?.type === "bullet" ? dataA : dataB?.type === "bullet" ? dataB : null;
  if (!bulletData) return;
  if (pendingBulletDestroys.has(bulletData.id)) return;

  const otherData = bulletData === dataA ? dataB : dataA;
  const otherBody = bulletData === dataA ? bodyB : bodyA;
  const bulletBody = bulletData === dataA ? bodyA : bodyB;
  const bulletPos = bulletBody.getPosition();

  if (otherData?.type === "player" || otherData?.type === "head") {
    if (otherData.id === bulletData.owner) return;
    if (!playerBodies[otherData.id]) return;
    pendingBulletDestroys.add(bulletData.id);
    pendingHits.push({
      x: bulletPos.x * SCALE,
      y: bulletPos.y * SCALE,
      targetId: otherData.id,
      damage: BULLET_DAMAGE,
    });
    return;
  }

  if (otherData?.type === "platform") {
    pendingBulletDestroys.add(bulletData.id);
    pendingPlatformDamages.push({
      id: otherData.id,
      damage: BULLET_DAMAGE,
      x: bulletPos.x * SCALE,
      y: bulletPos.y * SCALE,
    });
    return;
  }

  if (otherData?.type === "ground") {
    const bounces = bulletBounceCounts[bulletData.id] ?? 0;
    pendingHits.push({
      x: bulletPos.x * SCALE,
      y: bulletPos.y * SCALE,
      targetId: "",
      damage: 0,
    });

    if (bounces >= MAX_BULLET_BOUNCES) {
      pendingBulletDestroys.add(bulletData.id);
      return;
    }

    bulletBounceCounts[bulletData.id] = bounces + 1;

    const vel = bulletBody.getLinearVelocity();
    contact.getWorldManifold(sharedWorldManifold);

    let nx = sharedWorldManifold.normal.x;
    let ny = sharedWorldManifold.normal.y;
    const dot = vel.x * nx + vel.y * ny;
    if (dot > 0) {
      nx = -nx;
      ny = -ny;
    }
    const reflectDot = vel.x * nx + vel.y * ny;
    const bounce = 0.68;
    bulletBody.setLinearVelocity(
      planck.Vec2(
        (vel.x - 2 * reflectDot * nx) * bounce,
        (vel.y - 2 * reflectDot * ny) * bounce,
      ),
    );
  }
}

function advanceWorld(G: ShooterState) {
  G.hitEvents = [];
  world.step(1 / 60);
  updatePlayerGroundedState();
  snapPlayersToGround();
  processPendingHits(G);

  for (let i = G.bullets.length - 1; i >= 0; i--) {
    const b = G.bullets[i];
    const body = bulletBodies[b.id];
    if (body) {
      const pos = body.getPosition();
      if (
        pos.x * SCALE < -20 ||
        pos.x * SCALE > ARENA_W + 20 ||
        pos.y * SCALE > ARENA_H + 20 ||
        pos.y * SCALE < -20
      ) {
        destroyBullet(G, b.id);
      }
    }
  }

  syncStateFromPhysics(G);
}

function resetRound(G: ShooterState) {
  for (const [id, b] of Object.entries(playerBodies)) {
    world.destroyBody(b.torso);
    world.destroyBody(b.head);
  }
  for (const b of Object.values(bulletBodies)) {
    world.destroyBody(b);
  }
  playerBodies = {};
  platformBodies = {};
  bulletBodies = {};
  bulletBounceCounts = {};
  playerGrounded = {};
  G.bullets = [];
  G.hitEvents = [];
  initPlatforms(G);

  const spawns = [
    spawnOnFloor(100),
    spawnOnFloor(ARENA_W - 100),
    spawnOnFloor(300),
    spawnOnFloor(500),
  ];

  let index = 0;
  for (const [id, p] of Object.entries(G.players)) {
    const spawn = spawns[index % spawns.length];
    p.health = MAX_HEALTH;
    p.crouching = false;
    createPlayerPhysics(id, spawn.x, spawn.y);
    index++;
  }
  syncStateFromPhysics(G);
}

export default defineGame<ShooterState>({
  name: "my-shooter-game",
  meta: {
    displayName: "My Shooter Game",
    categories: ["action"],
  },
  minPlayers: 2,
  maxPlayers: 4,

  setup: (ctx) => {
    world = planck.World({ gravity: planck.Vec2(0, 30) });
    playerBodies = {};
    platformBodies = {};
    bulletBodies = {};
    bulletBounceCounts = {};
    playerGrounded = {};
    pendingHits.length = 0;
    pendingPlatformDamages.length = 0;
    pendingBulletDestroys.clear();

    world.on("begin-contact", handleContact);

    const ground = world.createBody();
    ground.createFixture(
      planck.Edge(planck.Vec2(0, FLOOR_Y / SCALE), planck.Vec2(ARENA_W / SCALE, FLOOR_Y / SCALE)),
      { friction: 1.0, userData: { type: "ground" } satisfies FixtureUserData },
    );
    ground.createFixture(planck.Edge(planck.Vec2(0, 0), planck.Vec2(0, ARENA_H / SCALE)), {
      friction: 0.0,
      userData: { type: "ground" } satisfies FixtureUserData,
    });
    ground.createFixture(
      planck.Edge(planck.Vec2(ARENA_W / SCALE, 0), planck.Vec2(ARENA_W / SCALE, ARENA_H / SCALE)),
      { friction: 0.0, userData: { type: "ground" } satisfies FixtureUserData },
    );
    ground.createFixture(
      planck.Edge(planck.Vec2(0, 0), planck.Vec2(ARENA_W / SCALE, 0)),
      {
        friction: 0.2,
        restitution: 0.12,
        userData: { type: "ground" } satisfies FixtureUserData,
      },
    );

    const players: Record<string, PlayerState> = {};
    const spawns = [
      spawnOnFloor(100),
      spawnOnFloor(ARENA_W - 100),
      spawnOnFloor(300),
      spawnOnFloor(500),
    ];

    ctx.players.forEach((id, index) => {
      const spawn = spawns[index % spawns.length];
      players[id] = {
        health: MAX_HEALTH,
        aimAngle: 0,
        facing: 1,
        crouching: false,
        torso: { x: spawn.x, y: spawn.y, angle: 0 },
        head: { x: spawn.x, y: spawn.y - HEAD_OFFSET, angle: 0 },
      };
      createPlayerPhysics(id, spawn.x, spawn.y);
    });

    const G: ShooterState = {
      players,
      bullets: [],
      platforms: [],
      nextBulletId: 1,
      scores: {},
      hitEvents: [],
    };
    initPlatforms(G);
    syncStateFromPhysics(G);
    return G;
  },

  moves: {
    move: (G, payload, ctx) => {
      const p = G.players[ctx.playerId];
      if (!p || p.health <= 0) return INVALID_MOVE;

      const data = payload as {
        action?: string | null;
        aimAngle?: number;
        facing?: number;
        crouching?: boolean;
      };
      const bodies = playerBodies[ctx.playerId];
      if (!bodies) return INVALID_MOVE;

      if (typeof data.aimAngle === "number") p.aimAngle = data.aimAngle;
      if (typeof data.facing === "number") p.facing = data.facing >= 0 ? 1 : -1;

      const torso = bodies.torso;
      const vel = torso.getLinearVelocity();
      const crouching = data.crouching === true || data.action === "crouch";
      p.crouching = crouching && isPlayerGrounded(ctx.playerId, torso);
      const speedMul = p.crouching ? 0.45 : 1;
      const grounded = isPlayerGrounded(ctx.playerId, torso);

      if (data.action === "left") {
        p.facing = -1;
        torso.setLinearVelocity(planck.Vec2(-MOVE_SPEED * speedMul, vel.y));
      } else if (data.action === "right") {
        p.facing = 1;
        torso.setLinearVelocity(planck.Vec2(MOVE_SPEED * speedMul, vel.y));
      } else if (data.action === "jump") {
        if (grounded && !p.crouching) {
          const mass = torso.getMass();
          torso.setLinearVelocity(planck.Vec2(vel.x, 0));
          torso.applyLinearImpulse(
            planck.Vec2(0, -mass * JUMP_IMPULSE),
            torso.getWorldCenter(),
            true,
          );
          playerGrounded[ctx.playerId] = false;
        }
      } else if (data.action === "crouch" || (crouching && !data.action)) {
        torso.setLinearVelocity(planck.Vec2(vel.x * 0.35, vel.y));
      } else {
        torso.setLinearVelocity(planck.Vec2(0, vel.y));
      }

      advanceWorld(G);
    },
    shoot: (G, payload, ctx) => {
      const p = G.players[ctx.playerId];
      if (!p || p.health <= 0) return INVALID_MOVE;

      const activeCount = G.bullets.filter((b) => b.owner === ctx.playerId).length;
      if (activeCount >= MAX_BULLETS_PER_PLAYER) return INVALID_MOVE;

      const data = payload as { aimAngle?: number; facing?: number };
      const aimAngle = typeof data?.aimAngle === "number" ? data.aimAngle : p.aimAngle;
      p.aimAngle = aimAngle;
      if (typeof data?.facing === "number") {
        p.facing = data.facing >= 0 ? 1 : -1;
      }

      const bodies = playerBodies[ctx.playerId];
      if (!bodies) return INVALID_MOVE;

      const torso = bodies.torso;
      const tPos = torso.getPosition();
      const tVel = torso.getLinearVelocity();
      const onGround = isPlayerGrounded(ctx.playerId, torso);
      const facing = p.facing ?? (Math.cos(aimAngle) >= 0 ? 1 : -1);
      const muzzle = computeMuzzleMeters(
        tPos.x * SCALE,
        tPos.y * SCALE,
        aimAngle,
        facing,
        p.crouching,
      );

      const baseRecoil = p.crouching ? 12 : 36;
      const sideways = Math.abs(Math.sin(aimAngle));
      const groundedMul = onGround ? 1 + sideways * 1.15 : 1.65;
      const recoilForce = baseRecoil * groundedMul;
      const rx = -Math.cos(aimAngle) * recoilForce;
      const ry = -Math.sin(aimAngle) * recoilForce;

      if (onGround) {
        torso.setLinearVelocity(
          planck.Vec2(tVel.x + rx * 0.32, tVel.y + ry * 0.18),
        );
        torso.applyLinearImpulse(planck.Vec2(rx * 1.4, ry * 1.4), torso.getWorldCenter(), true);
      } else {
        torso.setLinearVelocity(
          planck.Vec2(tVel.x + rx * 0.18, tVel.y + ry * 0.18),
        );
        torso.applyLinearImpulse(planck.Vec2(rx * 0.75, ry * 0.75), torso.getWorldCenter(), true);
      }

      const bulletId = G.nextBulletId++;
      const spawnPad = 0.38;
      const startX = muzzle.x + Math.cos(aimAngle) * spawnPad;
      const startY = muzzle.y + Math.sin(aimAngle) * spawnPad;

      const bBody = world.createDynamicBody({
        position: planck.Vec2(startX, startY),
        bullet: true,
      });
      bBody.createFixture(planck.Circle(0.1), {
        density: 5.0,
        restitution: 0.55,
        friction: 0.05,
        userData: { type: "bullet", id: bulletId, owner: ctx.playerId } satisfies FixtureUserData,
      });

      const bulletSpeed = 40;
      bBody.setLinearVelocity(
        planck.Vec2(Math.cos(aimAngle) * bulletSpeed, Math.sin(aimAngle) * bulletSpeed),
      );

      bulletBodies[bulletId] = bBody;

      G.bullets.push({
        id: bulletId,
        owner: ctx.playerId,
        body: { x: startX * SCALE, y: startY * SCALE, angle: aimAngle },
      });

      advanceWorld(G);
    },
  },
  enumerate: (G, playerId, flow) => {
    const p = G.players[playerId];
    if (!p || p.health <= 0) return [];
    return [
      { type: "move", payload: { action: "left", aimAngle: p.aimAngle, crouching: p.crouching } as any },
      { type: "move", payload: { action: "right", aimAngle: p.aimAngle, crouching: p.crouching } as any },
      { type: "move", payload: { action: "jump", aimAngle: p.aimAngle, crouching: p.crouching } as any },
      { type: "move", payload: { action: "crouch", aimAngle: p.aimAngle, crouching: true } as any },
      { type: "shoot", payload: { aimAngle: p.aimAngle } as any },
    ];
  },
});
