import { defineGame, INVALID_MOVE } from "@bordiko/sdk";
import * as planck from "planck";

export type WeaponId =
  | "auto"
  | "katana"
  | "bazooka"
  | "grenade"
  | "winchester"
  | "winchester_shotgun"
  | "sniper";

export const WEAPON_ORDER: WeaponId[] = [
  "auto",
  "katana",
  "bazooka",
  "grenade",
  "winchester",
  "winchester_shotgun",
  "sniper",
];

export interface WeaponDef {
  damage: number;
  spread: number;
  speed: number;
  maxActive: number;
  fireRateTicks: number;
  pelletCount?: number;
  kind: "bullet" | "rocket" | "grenade" | "melee";
  aoeRadius?: number;
  gravityScale?: number;
  barrelPx: number;
  meleeRange?: number;
  fuseTicks?: number;
  recoilForce: number;
  recoilImpulseMul?: number;
  muzzleFlashScale?: number;
}

export const WEAPONS: Record<WeaponId, WeaponDef> = {
  auto: {
    damage: 80,
    spread: 0.06,
    speed: 48,
    maxActive: 6,
    fireRateTicks: 8,
    kind: "bullet",
    gravityScale: 0.62,
    barrelPx: 32,
    recoilForce: 22,
    muzzleFlashScale: 1.1,
  },
  katana: {
    damage: 400,
    spread: 0,
    speed: 0,
    maxActive: 0,
    fireRateTicks: 24,
    kind: "melee",
    barrelPx: 38,
    meleeRange: 60,
    recoilForce: 8,
    muzzleFlashScale: 0.4,
  },
  bazooka: {
    damage: 350,
    spread: 0.01,
    speed: 33,
    maxActive: 2,
    fireRateTicks: 45,
    kind: "rocket",
    aoeRadius: 80,
    gravityScale: 0.35,
    barrelPx: 52,
    recoilForce: 100,
    recoilImpulseMul: 2.6,
    muzzleFlashScale: 2.8,
  },
  grenade: {
    damage: 280,
    spread: 0.08,
    speed: 30,
    maxActive: 2,
    fireRateTicks: 36,
    kind: "grenade",
    aoeRadius: 70,
    gravityScale: 0.85,
    barrelPx: 14,
    fuseTicks: 90,
    recoilForce: 30,
    muzzleFlashScale: 1.2,
  },
  winchester: {
    damage: 250,
    spread: 0.02,
    speed: 54,
    maxActive: 3,
    fireRateTicks: 28,
    kind: "bullet",
    gravityScale: 0.62,
    barrelPx: 30,
    recoilForce: 36,
    muzzleFlashScale: 1.15,
  },
  winchester_shotgun: {
    damage: 60,
    spread: 0.22,
    speed: 41,
    maxActive: 12,
    fireRateTicks: 36,
    pelletCount: 6,
    kind: "bullet",
    gravityScale: 0.62,
    barrelPx: 26,
    recoilForce: 50,
    recoilImpulseMul: 1.55,
    muzzleFlashScale: 1.65,
  },
  sniper: {
    damage: 500,
    spread: 0,
    speed: 75,
    maxActive: 2,
    fireRateTicks: 75,
    kind: "bullet",
    gravityScale: 0.45,
    barrelPx: 42,
    recoilForce: 62,
    recoilImpulseMul: 1.75,
    muzzleFlashScale: 1.9,
  },
};

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
  currentWeapon: WeaponId;
  ownedWeapons: WeaponId[];
  lastFireTick: number;
  torso: BodyState;
  head: BodyState;
}

export interface BulletState {
  id: number;
  owner: string;
  body: BodyState;
  kind: "bullet" | "rocket" | "grenade" | "pellet";
  weaponId: WeaponId;
  damage: number;
  aoeRadius?: number;
  fuseTicks?: number;
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
  kind: "static" | "elevator";
  vx?: number;
  minX?: number;
  maxX?: number;
  ttlTicks?: number;
}

export interface CrateState {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  health: number;
  maxHealth: number;
  onPlatformId?: number;
}

export interface PickupState {
  id: number;
  kind: "health" | "weapon";
  x: number;
  y: number;
  weaponId?: WeaponId;
  onPlatformId?: number;
  targetY?: number;
  fallToFloor?: boolean;
}

export interface ShooterState {
  players: Record<string, PlayerState>;
  bullets: BulletState[];
  platforms: PlatformState[];
  crates: CrateState[];
  pickups: PickupState[];
  nextBulletId: number;
  nextPlatformId: number;
  nextCrateId: number;
  nextPickupId: number;
  spawnTick: number;
  worldTick: number;
  matchSeed: string;
  scores: Record<string, number>;
  hitEvents: HitEvent[];
}

const ARENA_W = 912;
const ARENA_H = 500;
const FLOOR_Y = ARENA_H;
const FLOOR_PICKUP_Y = FLOOR_Y - 20;
const PICKUP_FALL_SPEED = 8;
const SCALE = 30;
const MAX_HEALTH = 1000;
const HEADSHOT_HEALTH_FRACTION = 0.5;
const HEAD_VISUAL_RADIUS_PX = 16;
const HEAD_HIT_RADIUS_PX = HEAD_VISUAL_RADIUS_PX + 4;
const BULLET_DAMAGE = 125;
const MAX_BULLETS_PER_PLAYER = 3;
const PLAYER_HALF_W = 0.48;
const PLAYER_HALF_H = 1.06;
const HEAD_OFFSET = 36;
const HEAD_RADIUS = HEAD_VISUAL_RADIUS_PX / SCALE;
const MOVE_SPEED = 15;
const JUMP_IMPULSE = 40;
const GRAVITY = 97.5;
const WALL_JUMP_IMPULSE_X = 11;
const BULLET_SPEED = 40;
const BULLET_GRAVITY_SCALE = 0.62;
const AIR_RECOIL_FORCE_MUL = 2.5;
const AIR_RECOIL_VEL_MUL = 0.45;
const AIR_RECOIL_IMPULSE_MUL = 1.4;
const FEET_PIXELS = PLAYER_HALF_H * SCALE;
const GROUNDED_VEL_Y = 12;
const GROUNDED_GAP = 0.5;
const STAND_LIFT = 0.14;
const MAX_BULLET_BOUNCES = 2;
const PLATFORM_MAX_HEALTH = BULLET_DAMAGE * 4;
const PLATFORM_BORDER_PX = 2;
const CRATE_MAX_HEALTH = 500;
const CRATE_W = 36;
const CRATE_H = 36;
const SPAWN_INTERVAL_TICKS = 480;
const ELEVATOR_TTL_TICKS = 1800;
const PICKUP_RADIUS = 14;
const HEALTH_PICKUP_AMOUNT = 300;
const START_WEAPON: WeaponId = "winchester";
const KATANA_BLADE_HIT_RADIUS = 30;
const KATANA_SWING_HIT_SAMPLES = [0.28, 0.36, 0.44, 0.52, 0.6, 0.68];

const STICK_BODY_LEN_PX = 44;
const STICK_ARM_LEN_PX = 28;
const STICK_CROUCH_DROP_PX = 18;
const GUN_BARREL_PX = 23;
const GUN_TIP_PX = 2.4;

const PLATFORMS = [
  { id: 0, x: 63, y: 388, w: 118, h: 12, kind: "static" as const },
  {
    id: 1,
    x: 234,
    y: 273,
    w: 118,
    h: 12,
    kind: "elevator" as const,
    vx: 22,
    minX: 154,
    maxX: 314,
  },
  { id: 2, x: 405, y: 388, w: 118, h: 12, kind: "static" as const },
  {
    id: 3,
    x: 576,
    y: 273,
    w: 118,
    h: 12,
    kind: "elevator" as const,
    vx: -22,
    minX: 496,
    maxX: 656,
  },
  { id: 4, x: 405, y: 158, w: 118, h: 12, kind: "static" as const },
  {
    id: 5,
    x: 234,
    y: 43,
    w: 118,
    h: 12,
    kind: "elevator" as const,
    vx: 22,
    minX: 154,
    maxX: 314,
  },
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
  | { type: "platform"; id: number }
  | { type: "crate"; id: number }
  | { type: "pickup"; id: number };

type PlatformDef = (typeof PLATFORMS)[number];

let world: planck.World;
let playerBodies: Record<string, { torso: planck.Body; head: planck.Body }> = {};
let platformBodies: Record<number, planck.Body> = {};
let crateBodies: Record<number, planck.Body> = {};
let pickupBodies: Record<number, planck.Body> = {};
let bulletBodies: Record<number, planck.Body> = {};
let bulletBounceCounts: Record<number, number> = {};
let playerGrounded: Record<string, boolean> = {};
let playerWallJumpUsed: Record<string, boolean> = {};
let playerWallContact: Record<string, { nx: number; ny: number } | null> = {};
let playerJumpGrace: Record<string, number> = {};
const pendingBulletDestroys = new Set<number>();
const pendingHits: HitEvent[] = [];
const pendingPlatformDamages: { id: number; damage: number; x: number; y: number }[] = [];
const pendingCrateDamages: { id: number; damage: number; x: number; y: number }[] = [];
const pendingExplosions: { x: number; y: number; radius: number; damage: number; owner: string }[] =
  [];
let currentG: ShooterState | null = null;
const sharedWorldManifold = new planck.WorldManifold();

function setCurrentG(G: ShooterState) {
  currentG = G;
}

function seededRandom(seed: string, n: number): number {
  let h = 2166136261;
  const s = `${seed}:${n}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

function getFixtureData(fixture: planck.Fixture): FixtureUserData | null {
  return (fixture.getUserData() as FixtureUserData | null) ?? null;
}

function isSolidSurface(data: FixtureUserData | null, body: planck.Body) {
  if (data?.type === "ground") return true;
  if (data?.type === "platform") return true;
  if (data?.type === "crate") return true;
  return body.getType() === "static" && data?.type !== "bullet";
}

function platformCenterMeters(plat: PlatformState) {
  return planck.Vec2((plat.x + plat.w / 2) / SCALE, (plat.y + plat.h / 2) / SCALE);
}

function createPlatformBody(plat: PlatformState) {
  const pos = platformCenterMeters(plat);
  const pBody =
    plat.kind === "elevator"
      ? world.createKinematicBody({ position: pos })
      : world.createBody({ position: pos });
  pBody.createFixture(planck.Box(plat.w / 2 / SCALE, plat.h / 2 / SCALE), {
    friction: 0.15,
    userData: { type: "platform", id: plat.id } satisfies FixtureUserData,
  });
  platformBodies[plat.id] = pBody;
  if (plat.kind === "elevator" && plat.vx) {
    pBody.setLinearVelocity(planck.Vec2(plat.vx / SCALE, 0));
  }
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
    kind: def.kind,
    vx: def.kind === "elevator" ? def.vx : undefined,
    minX: def.kind === "elevator" ? def.minX : undefined,
    maxX: def.kind === "elevator" ? def.maxX : undefined,
  }));
  for (const plat of G.platforms) {
    createPlatformBody(plat);
  }
}

function destroyCrateBody(id: number) {
  const body = crateBodies[id];
  if (body) {
    world.destroyBody(body);
    delete crateBodies[id];
  }
}

function destroyPickupBody(id: number) {
  const body = pickupBodies[id];
  if (body) {
    world.destroyBody(body);
    delete pickupBodies[id];
  }
}

function createCrateBody(crate: CrateState) {
  const body = world.createDynamicBody({
    position: planck.Vec2((crate.x + crate.w / 2) / SCALE, (crate.y + crate.h / 2) / SCALE),
    fixedRotation: true,
  });
  body.createFixture(planck.Box(crate.w / 2 / SCALE, crate.h / 2 / SCALE), {
    density: 2.5,
    friction: 0.4,
    restitution: 0.05,
    userData: { type: "crate", id: crate.id } satisfies FixtureUserData,
  });
  crateBodies[crate.id] = body;
}

function createPickupBody(pickup: PickupState) {
  const body = world.createKinematicBody({
    position: planck.Vec2(pickup.x / SCALE, pickup.y / SCALE),
  });
  body.createFixture(planck.Circle(PICKUP_RADIUS / SCALE), {
    isSensor: true,
    userData: { type: "pickup", id: pickup.id } satisfies FixtureUserData,
  });
  pickupBodies[pickup.id] = body;
}

function getElevators(G: ShooterState) {
  return G.platforms.filter((p) => !p.broken && p.kind === "elevator");
}

function getRandomElevator(G: ShooterState, n: number): PlatformState | null {
  const elevators = getElevators(G);
  if (!elevators.length) return null;
  const idx = Math.floor(seededRandom(G.matchSeed, G.spawnTick * 17 + n) * elevators.length);
  return elevators[idx] ?? null;
}

function findFallTargetY(
  G: ShooterState,
  x: number,
  fromY: number,
  excludePlatId?: number,
  floorOnly = false,
) {
  if (floorOnly) return FLOOR_PICKUP_Y;
  let bestPlatY = FLOOR_Y;
  for (const plat of G.platforms) {
    if (plat.broken) continue;
    if (excludePlatId != null && plat.id === excludePlatId) continue;
    if (x < plat.x - 12 || x > plat.x + plat.w + 12) continue;
    const surfaceY = plat.y - 20;
    if (surfaceY <= fromY + 0.5) continue;
    if (plat.y < bestPlatY) bestPlatY = plat.y;
  }
  return bestPlatY - 20;
}

function pickupGoalY(G: ShooterState, pickup: PickupState) {
  if (pickup.fallToFloor) return FLOOR_PICKUP_Y;
  return findFallTargetY(G, pickup.x, pickup.y + 0.5);
}

function pickupAffectedByPlatformBreak(pickup: PickupState, plat: PlatformState) {
  if (pickup.onPlatformId === plat.id) return true;
  const padX = 24;
  if (pickup.x < plat.x - padX || pickup.x > plat.x + plat.w + padX) return false;
  return pickup.y <= plat.y + 24;
}

function fixOrphanedPickups(G: ShooterState) {
  for (const pickup of G.pickups) {
    if (pickup.fallToFloor) continue;
    if (pickup.y >= FLOOR_PICKUP_Y - 1) continue;
    if (findPlatformIdUnderPickup(G, pickup)) continue;

    if (pickup.onPlatformId != null) {
      const plat = G.platforms.find((p) => p.id === pickup.onPlatformId);
      if (!plat || plat.broken) {
        pickup.onPlatformId = undefined;
        pickup.fallToFloor = true;
        pickup.targetY = undefined;
      }
    }
  }
}

function pickupHasPlatformSupport(G: ShooterState, pickup: PickupState) {
  if (pickup.fallToFloor) return false;
  if (pickup.y >= FLOOR_PICKUP_Y - 1) {
    pickup.y = FLOOR_PICKUP_Y;
    pickup.targetY = undefined;
    pickup.fallToFloor = false;
    return true;
  }
  return findPlatformIdUnderPickup(G, pickup) !== undefined;
}

function findPlatformIdUnderPickup(G: ShooterState, pickup: PickupState) {
  for (const plat of G.platforms) {
    if (plat.broken) continue;
    if (pickup.x < plat.x - 12 || pickup.x > plat.x + plat.w + 12) continue;
    const surfaceY = plat.y - 20;
    if (pickup.y >= surfaceY - 2 && pickup.y <= surfaceY + 6) return plat.id;
  }
  return undefined;
}

function releasePickupsFromPlatform(G: ShooterState, _platId: number, plat: PlatformState) {
  for (const pickup of G.pickups) {
    if (!pickupAffectedByPlatformBreak(pickup, plat)) continue;
    pickup.onPlatformId = undefined;
    pickup.targetY = undefined;
    pickup.fallToFloor = true;
  }
}

function breakPlatform(G: ShooterState, id: number) {
  const plat = G.platforms.find((p) => p.id === id);
  if (!plat || plat.broken) return;
  plat.broken = true;
  plat.health = 0;
  releasePickupsFromPlatform(G, id, plat);
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

function destroyCrate(G: ShooterState, id: number) {
  destroyCrateBody(id);
  const idx = G.crates.findIndex((c) => c.id === id);
  if (idx >= 0) G.crates.splice(idx, 1);
}

function damageCrate(G: ShooterState, id: number, damage: number, x: number, y: number) {
  const crate = G.crates.find((c) => c.id === id);
  if (!crate) return;
  crate.health = Math.max(0, crate.health - damage);
  pendingHits.push({ x, y, targetId: "", damage: 0 });
  if (crate.health <= 0) {
    destroyCrate(G, id);
  }
}

function removePickup(G: ShooterState, id: number) {
  destroyPickupBody(id);
  const idx = G.pickups.findIndex((p) => p.id === id);
  if (idx >= 0) G.pickups.splice(idx, 1);
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
  weaponId: WeaponId = "winchester",
) {
  const weapon = WEAPONS[weaponId];
  const drop = crouching ? STICK_CROUCH_DROP_PX : 0;
  const neckTop = torsoYpx - STICK_BODY_LEN_PX * 0.48 + drop * 0.2;

  if (weaponId === "bazooka") {
    const mountX = torsoXpx + facing * 3;
    const mountY = neckTop + 6;
    const tubeLen = weapon.barrelPx;
    return {
      x: (mountX + Math.cos(aimAngle) * tubeLen) / SCALE,
      y: (mountY + Math.sin(aimAngle) * tubeLen) / SCALE,
    };
  }

  const shoulderX = torsoXpx + facing * 2.5;
  const shoulderY = neckTop + 2;
  const armReach =
    weaponId === "grenade" ? STICK_ARM_LEN_PX * 0.72 : STICK_ARM_LEN_PX;
  const handX = shoulderX + Math.cos(aimAngle) * armReach;
  const handY = shoulderY + Math.sin(aimAngle) * armReach;
  const muzzleDist = weapon.barrelPx + GUN_TIP_PX * 0.4;
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
  // Lower/shorter torso box so head hits register on the head fixture first.
  torso.createFixture(planck.Box(PLAYER_HALF_W, 0.78, planck.Vec2(0, 0.28)), {
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
  playerWallJumpUsed[id] = false;
  playerWallContact[id] = null;
  playerJumpGrace[id] = 0;
}

function destroyPlayerPhysics(id: string) {
  const bodies = playerBodies[id];
  if (!bodies) return;
  world.destroyBody(bodies.torso);
  world.destroyBody(bodies.head);
  delete playerBodies[id];
  delete playerGrounded[id];
  delete playerWallJumpUsed[id];
  delete playerWallContact[id];
  delete playerJumpGrace[id];
}

function feetPositionMeters(torso: planck.Body) {
  const pos = torso.getPosition();
  return planck.Vec2(pos.x, pos.y + PLAYER_HALF_H);
}

function isStandableFixture(fixture: planck.Fixture, selfId: string) {
  const data = getFixtureData(fixture);
  const body = fixture.getBody();
  if (data?.type === "bullet" || data?.type === "pickup") return false;
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
  if (data?.type === "pickup") return false;
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

function hasTopSupportContact(body: planck.Body, selfId: string): boolean {
  for (let edge = body.getContactList(); edge; edge = edge.next) {
    const contact = edge.contact;
    if (!contact.isTouching()) continue;

    const fixtureA = contact.getFixtureA();
    const fixtureB = contact.getFixtureB();
    const otherFixture = fixtureA.getBody() === body ? fixtureB : fixtureA;
    if (fixtureA.getBody() !== body && fixtureB.getBody() !== body) continue;
    if (!isStandableFixture(otherFixture, selfId)) continue;

    contact.getWorldManifold(sharedWorldManifold);
    const nx = sharedWorldManifold.normal.x;
    const ny = sharedWorldManifold.normal.y;
    if (Math.abs(ny) > 0.45 && Math.abs(nx) < 0.45) return true;
  }
  return false;
}

function canPerformStandingJump(id: string, torso: planck.Body, crouching: boolean): boolean {
  if (crouching) return false;

  const vel = torso.getLinearVelocity();
  if (Math.abs(vel.y) > GROUNDED_VEL_Y) return false;

  if (hasTopSupportContact(torso, id) || hasTopSupportContact(playerBodies[id].head, id)) {
    return true;
  }

  const feet = feetPositionMeters(torso);
  const surfaceHit = raycastStandBelow(feet.x, feet.y, id, 0.85);
  if (surfaceHit !== null && feetOnSurface(feet, surfaceHit.y)) return true;

  return feet.y * SCALE >= FLOOR_Y - 14;
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

function isEntityOnPlatform(
  centerX: number,
  feetY: number,
  plat: PlatformState,
  tolerance = 10,
): boolean {
  if (centerX < plat.x - 4 || centerX > plat.x + plat.w + 4) return false;
  return Math.abs(feetY - plat.y) <= tolerance;
}

function isPlayerOnPlatform(playerId: string, plat: PlatformState): boolean {
  const bodies = playerBodies[playerId];
  if (!bodies || !measureGrounded(playerId, bodies.torso)) return false;
  const feet = feetPositionMeters(bodies.torso);
  return isEntityOnPlatform(feet.x * SCALE, feet.y * SCALE, plat);
}

function applyPlatformRiderDelta(G: ShooterState, plat: PlatformState, dx: number) {
  if (dx === 0) return;
  const dxM = dx / SCALE;

  for (const [id, bodies] of Object.entries(playerBodies)) {
    if (!isPlayerOnPlatform(id, plat)) continue;
    const torso = bodies.torso;
    const head = bodies.head;
    const tPos = torso.getPosition();
    const hPos = head.getPosition();
    const vel = torso.getLinearVelocity();
    torso.setTransform(planck.Vec2(tPos.x + dxM, tPos.y), 0);
    head.setTransform(planck.Vec2(hPos.x + dxM, hPos.y), head.getAngle());
    torso.setLinearVelocity(planck.Vec2(vel.x + (plat.vx ?? 0) / SCALE, vel.y));
  }

  for (const crate of G.crates) {
    if (crate.onPlatformId !== plat.id) continue;
    const body = crateBodies[crate.id];
    if (!body) continue;
    const pos = body.getPosition();
    const vel = body.getLinearVelocity();
    body.setTransform(planck.Vec2(pos.x + dxM, pos.y), 0);
    body.setLinearVelocity(planck.Vec2(vel.x + (plat.vx ?? 0) / SCALE, vel.y));
    crate.x += dx;
  }

  for (const pickup of G.pickups) {
    if (pickup.onPlatformId !== plat.id) continue;
    pickup.x += dx;
    const body = pickupBodies[pickup.id];
    if (body) {
      body.setTransform(planck.Vec2(pickup.x / SCALE, pickup.y / SCALE), 0);
    }
  }
}

function advancePlatformMotion(G: ShooterState) {
  const dt = 1 / 60;

  for (const plat of G.platforms) {
    if (plat.broken || plat.kind !== "elevator" || plat.vx == null) continue;

    const prevX = plat.x;
    let newX = plat.x + plat.vx * dt;

    if (plat.minX != null && newX < plat.minX) {
      newX = plat.minX;
      plat.vx = Math.abs(plat.vx);
    }
    if (plat.maxX != null && newX > plat.maxX) {
      newX = plat.maxX;
      plat.vx = -Math.abs(plat.vx);
    }

    if (plat.ttlTicks != null) {
      plat.ttlTicks -= 1;
      if (plat.ttlTicks <= 0 || newX < -200 || newX > ARENA_W + 200) {
        breakPlatform(G, plat.id);
        continue;
      }
    }

    const dx = newX - prevX;
    plat.x = newX;

    const body = platformBodies[plat.id];
    if (body) {
      body.setTransform(platformCenterMeters(plat), 0);
      body.setLinearVelocity(planck.Vec2(plat.vx / SCALE, 0));
    }

    applyPlatformRiderDelta(G, plat, dx);
  }
}

function snapPlayersToGround() {
  for (const [, bodies] of Object.entries(playerBodies)) {
    const torso = bodies.torso;
    const vel = torso.getLinearVelocity();
    if (Math.abs(vel.y) > 12) continue;

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

function applyVerticalJump(
  torso: planck.Body,
  playerId: string,
  opts: { keepVx?: number; horizImpulse?: number } = {},
) {
  const mass = torso.getMass();
  const horiz = opts.horizImpulse ?? 0;
  if (horiz !== 0) {
    torso.setLinearVelocity(planck.Vec2(0, 0));
  } else {
    torso.setLinearVelocity(planck.Vec2(opts.keepVx ?? 0, 0));
  }
  torso.applyLinearImpulse(
    planck.Vec2(mass * horiz, -mass * JUMP_IMPULSE),
    torso.getWorldCenter(),
    true,
  );
  playerJumpGrace[playerId] = 8;
}

function isWallLikeContact(otherFixture: planck.Fixture, selfId: string) {
  const data = getFixtureData(otherFixture);
  const body = otherFixture.getBody();
  if (data?.type === "bullet" || data?.type === "pickup") return false;
  if (data?.type === "player" || data?.type === "head") {
    if (data.id === selfId) return false;
    return playerBodies[data.id] != null;
  }
  return isSolidSurface(data, body);
}

function readSideContactNormal(contact: planck.Contact, selfBody: planck.Body) {
  contact.getWorldManifold(sharedWorldManifold);
  const nx = sharedWorldManifold.normal.x;
  const ny = sharedWorldManifold.normal.y;
  if (Math.abs(nx) <= 0.5 || Math.abs(ny) >= 0.45) return null;
  return { nx, ny };
}

function scanBodyWallContact(body: planck.Body, selfId: string) {
  for (let edge = body.getContactList(); edge; edge = edge.next) {
    const contact = edge.contact;
    if (!contact.isTouching()) continue;

    const fixtureA = contact.getFixtureA();
    const fixtureB = contact.getFixtureB();
    const otherFixture = fixtureA.getBody() === body ? fixtureB : fixtureA;
    if (fixtureA.getBody() !== body && fixtureB.getBody() !== body) continue;
    if (!isWallLikeContact(otherFixture, selfId)) continue;

    const side = readSideContactNormal(contact, body);
    if (side) return side;
  }
  return null;
}

function updatePlayerWallContacts() {
  for (const [id, bodies] of Object.entries(playerBodies)) {
    if (isPlayerGrounded(id, bodies.torso)) {
      playerWallJumpUsed[id] = false;
      playerWallContact[id] = null;
      continue;
    }

    playerWallContact[id] =
      scanBodyWallContact(bodies.torso, id) ?? scanBodyWallContact(bodies.head, id);
  }
}

function resolvePlayerSideStick() {
  for (const [id, bodies] of Object.entries(playerBodies)) {
    if (isPlayerGrounded(id, bodies.torso)) continue;
    if ((playerJumpGrace[id] ?? 0) > 0) continue;

    const torso = bodies.torso;
    const vel = torso.getLinearVelocity();
    if (vel.y < -2) continue;

    let adjusted = false;
    let slideVx = vel.x;
    let slideVy = vel.y;

    for (const body of [torso, bodies.head]) {
      for (let edge = body.getContactList(); edge; edge = edge.next) {
        const contact = edge.contact;
        if (!contact.isTouching()) continue;

        const fixtureA = contact.getFixtureA();
        const fixtureB = contact.getFixtureB();
        const otherFixture = fixtureA.getBody() === body ? fixtureB : fixtureA;
        if (fixtureA.getBody() !== body && fixtureB.getBody() !== body) continue;
        if (!isWallLikeContact(otherFixture, id)) continue;

        contact.getWorldManifold(sharedWorldManifold);
        const nx = sharedWorldManifold.normal.x;
        const ny = sharedWorldManifold.normal.y;

        if (Math.abs(nx) > 0.5 && Math.abs(ny) < 0.45) {
          slideVx *= 0.2;
          if (vel.y >= 0) slideVy = Math.max(slideVy, 5);
          adjusted = true;
          continue;
        }

        if (ny > 0.55 && vel.y >= 0 && vel.y < 2) {
          slideVy = Math.max(slideVy, 5);
          slideVx *= 0.7;
          adjusted = true;
        }
      }
    }

    if (adjusted) {
      torso.setLinearVelocity(planck.Vec2(slideVx, slideVy));
    }
  }

  for (const id of Object.keys(playerJumpGrace)) {
    if (playerJumpGrace[id] > 0) playerJumpGrace[id]--;
  }
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

  for (const crate of G.crates) {
    const body = crateBodies[crate.id];
    if (body) {
      const pos = body.getPosition();
      crate.x = pos.x * SCALE - crate.w / 2;
      crate.y = pos.y * SCALE - crate.h / 2;
    }
  }
}

function queueExplosion(x: number, y: number, radius: number, damage: number, owner: string) {
  pendingExplosions.push({ x, y, radius, damage, owner });
}

function processExplosions(G: ShooterState) {
  for (const ex of pendingExplosions) {
    pendingHits.push({ x: ex.x, y: ex.y, targetId: "", damage: 0 });

    for (const [id, p] of Object.entries(G.players)) {
      if (p.health <= 0 || !playerBodies[id]) continue;
      const tPos = playerBodies[id].torso.getPosition();
      const dx = tPos.x * SCALE - ex.x;
      const dy = tPos.y * SCALE - ex.y;
      if (Math.hypot(dx, dy) <= ex.radius) {
        pendingHits.push({ x: ex.x, y: ex.y, targetId: id, damage: ex.damage });
      }
    }

    for (const crate of [...G.crates]) {
      const cx = crate.x + crate.w / 2;
      const cy = crate.y + crate.h / 2;
      if (Math.hypot(cx - ex.x, cy - ex.y) <= ex.radius) {
        damageCrate(G, crate.id, ex.damage, ex.x, ex.y);
      }
    }
  }
  pendingExplosions.length = 0;
}

function getKatanaSwingOffsets(progress: number) {
  if (progress < 0.25) {
    const w = progress / 0.25;
    return { aimOffset: -0.75 * w, armReach: -6 * w };
  }
  if (progress < 0.7) {
    const s = (progress - 0.25) / 0.45;
    return { aimOffset: -0.75 + 1.35 * s, armReach: -6 + 14 * s };
  }
  const r = (progress - 0.7) / 0.3;
  return { aimOffset: 0.6 * (1 - r), armReach: 8 * (1 - r) };
}

function computeKatanaBladeSegment(
  torsoX: number,
  torsoY: number,
  aimAngle: number,
  facing: number,
  swingProgress: number,
) {
  const drop = 0;
  const neckTop = torsoY - STICK_BODY_LEN_PX * 0.48 + drop * 0.2;
  const shoulderX = torsoX + facing * 2.5;
  const shoulderY = neckTop + 2;
  const swing = getKatanaSwingOffsets(swingProgress);
  const aim = aimAngle + swing.aimOffset * facing;
  const reach = STICK_ARM_LEN_PX + 4 + swing.armReach;
  const handX = shoulderX + Math.cos(aim) * reach;
  const handY = shoulderY + Math.sin(aim) * reach;
  const barrel = WEAPONS.katana.barrelPx;
  const tipLen = barrel + 10;
  return {
    x1: handX,
    y1: handY,
    x2: handX + Math.cos(aim) * tipLen,
    y2: handY + Math.sin(aim) * tipLen,
  };
}

function distPointToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 0.001) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + dx * t), py - (y1 + dy * t));
}

function resolveMeleeSwingHits(
  G: ShooterState,
  playerId: string,
  aimAngle: number,
  facing: number,
  weapon: WeaponDef,
) {
  const bodies = playerBodies[playerId];
  if (!bodies) return;

  const hitIds: string[] = [];

  for (const progress of KATANA_SWING_HIT_SAMPLES) {
    const tPos = bodies.torso.getPosition();
    const blade = computeKatanaBladeSegment(
      tPos.x * SCALE,
      tPos.y * SCALE,
      aimAngle,
      facing,
      progress,
    );

    for (const [targetId, target] of Object.entries(G.players)) {
      if (targetId === playerId || target.health <= 0 || !playerBodies[targetId]) continue;
      if (hitIds.includes(targetId)) continue;

      const targetBodies = playerBodies[targetId];
      const torsoPos = targetBodies.torso.getPosition();
      const headPos = targetBodies.head.getPosition();
      const hitPoints: [number, number][] = [
        [torsoPos.x * SCALE, torsoPos.y * SCALE],
        [headPos.x * SCALE, headPos.y * SCALE],
      ];

      let hit = false;
      for (const [tx, ty] of hitPoints) {
        const dist = distPointToSegment(tx, ty, blade.x1, blade.y1, blade.x2, blade.y2);
        if (dist <= KATANA_BLADE_HIT_RADIUS) {
          hit = true;
          break;
        }
      }
      if (!hit) continue;

      hitIds.push(targetId);
      pendingHits.push({
        x: torsoPos.x * SCALE,
        y: torsoPos.y * SCALE,
        targetId,
        damage: weapon.damage,
      });
    }
  }
}

function spawnProjectile(
  G: ShooterState,
  owner: string,
  weaponId: WeaponId,
  weapon: WeaponDef,
  startX: number,
  startY: number,
  shotAngle: number,
) {
  const bulletId = G.nextBulletId++;
  const kind =
    weapon.kind === "rocket"
      ? "rocket"
      : weapon.kind === "grenade"
        ? "grenade"
        : weapon.pelletCount && weapon.pelletCount > 1
          ? "pellet"
          : "bullet";

  const bBody = world.createDynamicBody({
    position: planck.Vec2(startX, startY),
    bullet: true,
    gravityScale: weapon.gravityScale ?? BULLET_GRAVITY_SCALE,
  });

  const radius =
    kind === "rocket" ? 0.11 : kind === "grenade" ? 0.09 : kind === "pellet" ? 0.05 : 0.07;

  bBody.createFixture(planck.Circle(radius), {
    density: 5.0,
    restitution: kind === "grenade" ? 0.45 : 0.55,
    friction: 0.05,
    userData: { type: "bullet", id: bulletId, owner } satisfies FixtureUserData,
  });

  const speed = weapon.speed || BULLET_SPEED;
  bBody.setLinearVelocity(
    planck.Vec2(Math.cos(shotAngle) * speed, Math.sin(shotAngle) * speed),
  );

  bulletBodies[bulletId] = bBody;

  G.bullets.push({
    id: bulletId,
    owner,
    body: { x: startX * SCALE, y: startY * SCALE, angle: shotAngle },
    kind,
    weaponId,
    damage: weapon.damage,
    aoeRadius: weapon.aoeRadius,
    fuseTicks: weapon.fuseTicks,
  });
}

function applyRecoil(
  torso: planck.Body,
  aimAngle: number,
  onGround: boolean,
  crouching: boolean,
  weaponId: WeaponId,
) {
  const weapon = WEAPONS[weaponId];
  const tVel = torso.getLinearVelocity();
  const baseRecoil = (crouching ? weapon.recoilForce * 0.38 : weapon.recoilForce);
  const sideways = Math.abs(Math.sin(aimAngle));
  const groundedMul = onGround ? 1 + sideways * 1.15 : AIR_RECOIL_FORCE_MUL;
  const recoilForce = baseRecoil * groundedMul;
  const rx = -Math.cos(aimAngle) * recoilForce;
  const ry = -Math.sin(aimAngle) * recoilForce;
  const impulseMul = weapon.recoilImpulseMul ?? 1.4;
  const velMul = weaponId === "bazooka" ? 0.58 : weaponId === "sniper" ? 0.42 : 0.32;
  const velYMul = weaponId === "bazooka" ? 0.38 : 0.18;

  if (onGround) {
    torso.setLinearVelocity(planck.Vec2(tVel.x + rx * velMul, tVel.y + ry * velYMul));
    torso.applyLinearImpulse(planck.Vec2(rx * impulseMul, ry * impulseMul), torso.getWorldCenter(), true);
  } else {
    torso.setLinearVelocity(
      planck.Vec2(tVel.x + rx * AIR_RECOIL_VEL_MUL, tVel.y + ry * AIR_RECOIL_VEL_MUL),
    );
    torso.applyLinearImpulse(
      planck.Vec2(rx * AIR_RECOIL_IMPULSE_MUL * (impulseMul * 0.55), ry * AIR_RECOIL_IMPULSE_MUL * (impulseMul * 0.55)),
      torso.getWorldCenter(),
      true,
    );
  }
}

function getPickupCollectY(pickup: PickupState) {
  const body = pickupBodies[pickup.id];
  if (!body) return pickup.y;
  const bodyY = body.getPosition().y * SCALE;
  return Math.max(pickup.y, bodyY);
}

function isFloorCollectiblePickup(pickup: PickupState, collectY: number, feetY: number) {
  if (collectY >= FLOOR_PICKUP_Y - 4) return true;
  if (!pickup.fallToFloor || feetY < FLOOR_Y - 28) return false;
  return collectY >= FLOOR_PICKUP_Y - 72;
}

function defaultOwnedWeapons(): WeaponId[] {
  return [START_WEAPON];
}

function playerOwnsWeapon(p: PlayerState, weaponId: WeaponId) {
  return p.ownedWeapons.includes(weaponId);
}

function addOwnedWeapon(p: PlayerState, weaponId: WeaponId) {
  if (!playerOwnsWeapon(p, weaponId)) {
    p.ownedWeapons.push(weaponId);
  }
}

function cycleOwnedWeapon(p: PlayerState) {
  const owned = WEAPON_ORDER.filter((w) => playerOwnsWeapon(p, w));
  if (owned.length <= 1) return;
  const idx = owned.indexOf(p.currentWeapon);
  p.currentWeapon = owned[(idx + 1) % owned.length] ?? p.currentWeapon;
}

function applyPickupToPlayer(G: ShooterState, playerId: string, pickup: PickupState) {
  const p = G.players[playerId];
  if (!p || p.health <= 0) return false;
  if (!G.pickups.some((pu) => pu.id === pickup.id)) return false;

  if (pickup.kind === "health") {
    p.health = Math.min(MAX_HEALTH, p.health + HEALTH_PICKUP_AMOUNT);
  } else if (pickup.kind === "weapon" && pickup.weaponId) {
    addOwnedWeapon(p, pickup.weaponId);
    p.currentWeapon = pickup.weaponId;
  }

  pendingHits.push({ x: pickup.x, y: pickup.y, targetId: "", damage: 0 });
  removePickup(G, pickup.id);
  return true;
}

function canPlayerCollectPickup(
  px: number,
  py: number,
  headX: number,
  headY: number,
  feetY: number,
  pickup: PickupState,
) {
  const collectY = getPickupCollectY(pickup);
  const playerHalfW = PLAYER_HALF_W * SCALE;
  const hPad = PICKUP_RADIUS + playerHalfW + 16;
  const nearX =
    Math.abs(pickup.x - px) <= hPad ||
    Math.abs(pickup.x - headX) <= hPad ||
    Math.abs(pickup.x - (px + headX) * 0.5) <= hPad;
  if (!nearX) return false;

  if (isFloorCollectiblePickup(pickup, collectY, feetY)) return true;

  const pTop = headY - HEAD_RADIUS * SCALE - 8;
  const pBottom = feetY + 10;
  const kTop = collectY - PICKUP_RADIUS - 8;
  const kBottom = collectY + PICKUP_RADIUS + 8;
  if (pTop <= kBottom && pBottom >= kTop) return true;

  return Math.hypot(pickup.x - px, collectY - py) <= PICKUP_RADIUS + 34;
}

function pickupBodyOverlapsPlayer(bodies: { torso: planck.Body; head: planck.Body }, pickupId: number) {
  const pickBody = pickupBodies[pickupId];
  if (!pickBody) return false;

  const pickFixture = pickBody.getFixtureList();
  if (!pickFixture) return false;

  for (const part of [bodies.torso, bodies.head]) {
    for (let fixture = part.getFixtureList(); fixture; fixture = fixture.getNext()) {
      if (
        planck.testOverlap(
          fixture.getShape(),
          0,
          pickFixture.getShape(),
          0,
          fixture.getBody().getTransform(),
          pickBody.getTransform(),
        )
      ) {
        return true;
      }
    }
  }
  return false;
}

function collectPickupsForPlayers(G: ShooterState) {
  for (const [playerId, bodies] of Object.entries(playerBodies)) {
    const p = G.players[playerId];
    if (!p || p.health <= 0) continue;
    const tPos = bodies.torso.getPosition();
    const hPos = bodies.head.getPosition();
    const px = tPos.x * SCALE;
    const py = tPos.y * SCALE;
    const headX = hPos.x * SCALE;
    const headY = hPos.y * SCALE;
    const feetY = py + FEET_PIXELS;

    for (const pickup of [...G.pickups]) {
      const overlaps =
        canPlayerCollectPickup(px, py, headX, headY, feetY, pickup) ||
        pickupBodyOverlapsPlayer(bodies, pickup.id);
      if (!overlaps) continue;
      applyPickupToPlayer(G, playerId, pickup);
    }
  }
}

function handleContactPickupCollection(G: ShooterState, contact: planck.Contact) {
  const fixtureA = contact.getFixtureA();
  const fixtureB = contact.getFixtureB();
  const dataA = getFixtureData(fixtureA);
  const dataB = getFixtureData(fixtureB);

  const pickupData =
    dataA?.type === "pickup" ? dataA : dataB?.type === "pickup" ? dataB : null;
  if (!pickupData) return;

  const otherData = pickupData === dataA ? dataB : dataA;
  if (otherData?.type !== "player" && otherData?.type !== "head") return;

  const pickup = G.pickups.find((p) => p.id === pickupData.id);
  if (!pickup) return;

  applyPickupToPlayer(G, otherData.id, pickup);
}

function updatePickupDrops(G: ShooterState) {
  for (const pickup of G.pickups) {
    if (pickupHasPlatformSupport(G, pickup)) {
      pickup.targetY = undefined;
      pickup.onPlatformId = findPlatformIdUnderPickup(G, pickup);
      const body = pickupBodies[pickup.id];
      if (body) {
        body.setTransform(planck.Vec2(pickup.x / SCALE, pickup.y / SCALE), 0);
      }
      continue;
    }

    pickup.onPlatformId = undefined;
    const goal = pickupGoalY(G, pickup);

    if (pickup.y < goal - 0.5) {
      pickup.y = Math.min(goal, pickup.y + PICKUP_FALL_SPEED);
      pickup.targetY = goal;
    } else {
      pickup.y = goal;
      pickup.targetY = undefined;
      if (pickup.fallToFloor && goal >= FLOOR_PICKUP_Y - 1) {
        pickup.fallToFloor = false;
      }
      const platId = findPlatformIdUnderPickup(G, pickup);
      if (platId != null) pickup.onPlatformId = platId;
    }

    const body = pickupBodies[pickup.id];
    if (body) {
      body.setTransform(planck.Vec2(pickup.x / SCALE, pickup.y / SCALE), 0);
    }
  }
}

function spawnPickupOnPlatform(G: ShooterState, plat: PlatformState, n: number) {
  const id = G.nextPickupId++;
  const roll = seededRandom(G.matchSeed, G.spawnTick * 31 + n);
  const kind: PickupState["kind"] = roll < 0.5 ? "health" : "weapon";
  const targetY = plat.y - 20;
  const pickup: PickupState = {
    id,
    kind,
    x: plat.x + plat.w / 2,
    y: kind === "weapon" ? plat.y - 58 : targetY,
    targetY: kind === "weapon" ? targetY : undefined,
    onPlatformId: plat.id,
  };
  if (kind === "weapon") {
    const wIdx = Math.floor(seededRandom(G.matchSeed, G.spawnTick * 37 + n) * WEAPON_ORDER.length);
    pickup.weaponId = WEAPON_ORDER[wIdx] ?? "winchester";
  }
  G.pickups.push(pickup);
  createPickupBody(pickup);
}

function spawnIncomingElevator(G: ShooterState, n: number) {
  const fromLeft = seededRandom(G.matchSeed, G.spawnTick * 41 + n) < 0.5;
  const yChoices = [158, 273, 388];
  const yIdx = Math.floor(seededRandom(G.matchSeed, G.spawnTick * 43 + n) * yChoices.length);
  const y = yChoices[yIdx] ?? 273;
  const id = G.nextPlatformId++;
  const w = 100;
  const x = fromLeft ? -140 : ARENA_W + 40;
  const vx = fromLeft ? 27 : -27;

  const plat: PlatformState = {
    id,
    x,
    y,
    w,
    h: 12,
    health: PLATFORM_MAX_HEALTH,
    maxHealth: PLATFORM_MAX_HEALTH,
    broken: false,
    kind: "elevator",
    vx,
    minX: fromLeft ? -160 : ARENA_W - 260,
    maxX: fromLeft ? ARENA_W - 260 : ARENA_W + 160,
    ttlTicks: ELEVATOR_TTL_TICKS,
  };

  G.platforms.push(plat);
  createPlatformBody(plat);
}

function runSpawnCycle(G: ShooterState) {
  G.spawnTick += 1;
  if (G.spawnTick % SPAWN_INTERVAL_TICKS !== 0) return;

  const n = G.spawnTick;
  spawnIncomingElevator(G, n);

  const elev = getRandomElevator(G, n);
  if (elev) {
    spawnPickupOnPlatform(G, elev, n);
    if (seededRandom(G.matchSeed, n * 53) > 0.4) {
      const elev2 = getRandomElevator(G, n + 7);
      if (elev2) spawnPickupOnPlatform(G, elev2, n + 1);
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

  for (const hit of pendingCrateDamages) {
    damageCrate(G, hit.id, hit.damage, hit.x, hit.y);
  }
  pendingCrateDamages.length = 0;

  for (const bulletId of pendingBulletDestroys) {
    destroyBullet(G, bulletId);
  }
  pendingBulletDestroys.clear();
}

function handleProjectileImpacts(G: ShooterState) {
  for (const b of [...G.bullets]) {
    const body = bulletBodies[b.id];
    if (!body) continue;

    if (b.kind === "rocket" || b.kind === "grenade") {
      for (let edge = body.getContactList(); edge; edge = edge.next) {
        const edgeContact = edge.contact;
        if (!edgeContact.isTouching()) continue;
        const fixtureA = edgeContact.getFixtureA();
        const fixtureB = edgeContact.getFixtureB();
        const otherFixture = fixtureA.getBody() === body ? fixtureB : fixtureA;
        const otherData = getFixtureData(otherFixture);
        if (
          otherData?.type === "player" ||
          otherData?.type === "head" ||
          otherData?.type === "platform" ||
          otherData?.type === "crate" ||
          otherData?.type === "ground"
        ) {
          const pos = body.getPosition();
          queueExplosion(
            pos.x * SCALE,
            pos.y * SCALE,
            b.aoeRadius ?? 70,
            b.damage,
            b.owner,
          );
          pendingBulletDestroys.add(b.id);
          break;
        }
      }
    }

    if (b.fuseTicks != null) {
      b.fuseTicks -= 1;
      if (b.fuseTicks <= 0) {
        const pos = body.getPosition();
        queueExplosion(pos.x * SCALE, pos.y * SCALE, b.aoeRadius ?? 70, b.damage, b.owner);
        pendingBulletDestroys.add(b.id);
      }
    }
  }
}

function getContactHitPointPx(contact: planck.Contact): { x: number; y: number } | null {
  contact.getWorldManifold(sharedWorldManifold);
  if (sharedWorldManifold.pointCount > 0) {
    const p = sharedWorldManifold.points[0];
    return { x: p.x * SCALE, y: p.y * SCALE };
  }
  return null;
}

function isHeadshotHit(targetId: string, hitX: number, hitY: number): boolean {
  const bodies = playerBodies[targetId];
  if (!bodies) return false;
  const hPos = bodies.head.getPosition();
  const tPos = bodies.torso.getPosition();
  const hx = hPos.x * SCALE;
  const hy = hPos.y * SCALE;
  const ty = tPos.y * SCALE;
  const headR = HEAD_HIT_RADIUS_PX;
  const halfW = PLAYER_HALF_W * SCALE;

  if (Math.hypot(hitX - hx, hitY - hy) <= headR) return true;

  // Side torso contacts at head height (matches on-screen stickman head band).
  const inHeadVerticalBand = hitY >= hy - headR && hitY <= hy + headR + 8;
  const inReach = Math.abs(hitX - hx) <= headR + halfW + 4;
  if (inHeadVerticalBand && inReach) return true;

  // Neck / upper chest when the shot visually targets the head but registers on torso.
  const neckY = ty - STICK_BODY_LEN_PX * 0.42;
  return hitY <= neckY && Math.abs(hitX - hx) <= headR + halfW + 6;
}

function bulletHitsHeadZone(targetId: string, bulletBody: planck.Body): boolean {
  const bodies = playerBodies[targetId];
  if (!bodies) return false;

  const pos = bulletBody.getPosition();
  const vel = bulletBody.getLinearVelocity();
  const bx = pos.x * SCALE;
  const by = pos.y * SCALE;

  if (isHeadshotHit(targetId, bx, by)) return true;

  const speed = Math.hypot(vel.x, vel.y);
  if (speed < 0.01) return false;

  const backPx = 14;
  const px = bx - (vel.x / speed) * backPx;
  const py = by - (vel.y / speed) * backPx;

  const hPos = bodies.head.getPosition();
  const hx = hPos.x * SCALE;
  const hy = hPos.y * SCALE;
  return distPointToSegment(hx, hy, px, py, bx, by) <= HEAD_HIT_RADIUS_PX;
}

function resolveBulletPlayerDamage(
  targetId: string,
  hitPart: "player" | "head",
  bulletBody: planck.Body,
  contactPx: { x: number; y: number } | null,
  bulletDamage: number,
): number {
  const headshot =
    hitPart === "head" ||
    bulletHitsHeadZone(targetId, bulletBody) ||
    (contactPx != null && isHeadshotHit(targetId, contactPx.x, contactPx.y));

  if (headshot) return Math.floor(MAX_HEALTH * HEADSHOT_HEALTH_FRACTION);
  return bulletDamage;
}

function handleContactWithBulletDamage(G: ShooterState, contact: planck.Contact) {
  const fixtureA = contact.getFixtureA();
  const fixtureB = contact.getFixtureB();
  const dataA = getFixtureData(fixtureA);
  const dataB = getFixtureData(fixtureB);

  const bulletData =
    dataA?.type === "bullet" ? dataA : dataB?.type === "bullet" ? dataB : null;
  if (!bulletData) return;
  if (pendingBulletDestroys.has(bulletData.id)) return;

  const bullet = G.bullets.find((b) => b.id === bulletData.id);
  const bulletDamage = bullet?.damage ?? BULLET_DAMAGE;
  const bulletKind = bullet?.kind ?? "bullet";
  const aoeRadius = bullet?.aoeRadius;
  const owner = bullet?.owner ?? bulletData.owner;

  const otherData = bulletData === dataA ? dataB : dataA;
  const bulletBody = bulletData === dataA ? fixtureA.getBody() : fixtureB.getBody();
  const bulletPos = bulletBody.getPosition();

  if (otherData?.type === "player" || otherData?.type === "head") {
    if (otherData.id === owner) return;
    if (!playerBodies[otherData.id]) return;
    pendingBulletDestroys.add(bulletData.id);
    const contactPoint = getContactHitPointPx(contact);
    const bulletPxX = bulletPos.x * SCALE;
    const bulletPxY = bulletPos.y * SCALE;
    const damage = resolveBulletPlayerDamage(
      otherData.id,
      otherData.type,
      bulletBody,
      contactPoint,
      bulletDamage,
    );
    pendingHits.push({
      x: contactPoint?.x ?? bulletPxX,
      y: contactPoint?.y ?? bulletPxY,
      targetId: otherData.id,
      damage,
    });
    return;
  }

  if (otherData?.type === "crate") {
    pendingBulletDestroys.add(bulletData.id);
    pendingCrateDamages.push({
      id: otherData.id,
      damage: bulletDamage,
      x: bulletPos.x * SCALE,
      y: bulletPos.y * SCALE,
    });
    return;
  }

  if (otherData?.type === "platform") {
    pendingBulletDestroys.add(bulletData.id);
    pendingPlatformDamages.push({
      id: otherData.id,
      damage: bulletDamage,
      x: bulletPos.x * SCALE,
      y: bulletPos.y * SCALE,
    });
    return;
  }

  if (otherData?.type === "ground") {
    if (bulletKind === "rocket" || bulletKind === "grenade") {
      queueExplosion(bulletPos.x * SCALE, bulletPos.y * SCALE, aoeRadius ?? 70, bulletDamage, owner);
      pendingBulletDestroys.add(bulletData.id);
      return;
    }

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
  setCurrentG(G);
  G.hitEvents = [];
  G.worldTick += 1;
  runSpawnCycle(G);
  advancePlatformMotion(G);
  updatePickupDrops(G);
  world.step(1 / 60);
  updatePlayerGroundedState();
  updatePlayerWallContacts();
  resolvePlayerSideStick();
  snapPlayersToGround();
  handleProjectileImpacts(G);
  processExplosions(G);
  processPendingHits(G);
  fixOrphanedPickups(G);
  updatePickupDrops(G);
  collectPickupsForPlayers(G);

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
  for (const [, b] of Object.entries(playerBodies)) {
    world.destroyBody(b.torso);
    world.destroyBody(b.head);
  }
  for (const b of Object.values(bulletBodies)) {
    world.destroyBody(b);
  }
  for (const b of Object.values(crateBodies)) {
    world.destroyBody(b);
  }
  for (const b of Object.values(pickupBodies)) {
    world.destroyBody(b);
  }
  playerBodies = {};
  platformBodies = {};
  crateBodies = {};
  pickupBodies = {};
  bulletBodies = {};
  bulletBounceCounts = {};
  playerGrounded = {};
  playerWallJumpUsed = {};
  playerWallContact = {};
  playerJumpGrace = {};
  G.bullets = [];
  G.crates = [];
  G.pickups = [];
  G.hitEvents = [];
  G.spawnTick = 0;
  G.worldTick = 0;
  initPlatforms(G);

  const spawns = [
    spawnOnFloor(114),
    spawnOnFloor(ARENA_W - 114),
    spawnOnFloor(342),
    spawnOnFloor(570),
  ];

  let index = 0;
  for (const [id, p] of Object.entries(G.players)) {
    const spawn = spawns[index % spawns.length];
    p.health = MAX_HEALTH;
    p.crouching = false;
    p.currentWeapon = START_WEAPON;
    p.ownedWeapons = defaultOwnedWeapons();
    p.lastFireTick = 0;
    createPlayerPhysics(id, spawn.x, spawn.y);
    index++;
  }
  syncStateFromPhysics(G);
}

function countActiveProjectiles(G: ShooterState, owner: string, weaponId: WeaponId) {
  return G.bullets.filter((b) => b.owner === owner && b.weaponId === weaponId).length;
}

function fireWeapon(G: ShooterState, playerId: string, aimAngle: number, facing: number) {
  const p = G.players[playerId];
  const bodies = playerBodies[playerId];
  if (!p || !bodies || p.health <= 0) return false;

  const weaponId = p.currentWeapon;
  const weapon = WEAPONS[weaponId];
  if (!weapon) return false;

  if (p.lastFireTick > 0 && G.worldTick - p.lastFireTick < weapon.fireRateTicks) return false;

  if (weapon.kind === "melee") {
    const torso = bodies.torso;
    const onGround = isPlayerGrounded(playerId, torso);
    applyRecoil(torso, aimAngle, onGround, p.crouching, weaponId);
    resolveMeleeSwingHits(G, playerId, aimAngle, facing, weapon);
    p.lastFireTick = G.worldTick;
    return true;
  }

  const pellets = weapon.pelletCount ?? 1;
  const activeCount = G.bullets.filter((b) => b.owner === playerId).length;
  if (activeCount + pellets > weapon.maxActive) {
    if (activeCount >= weapon.maxActive) return false;
  }

  const weaponActive = countActiveProjectiles(G, playerId, weaponId);
  if (weaponActive >= weapon.maxActive) return false;

  const torso = bodies.torso;
  const tPos = torso.getPosition();
  const onGround = isPlayerGrounded(playerId, torso);
  applyRecoil(torso, aimAngle, onGround, p.crouching, weaponId);

  const muzzle = computeMuzzleMeters(
    tPos.x * SCALE,
    tPos.y * SCALE,
    aimAngle,
    facing,
    p.crouching,
    weaponId,
  );

  const spawnPad = 0.38;
  for (let i = 0; i < pellets; i++) {
    if (G.bullets.filter((b) => b.owner === playerId).length >= weapon.maxActive) break;
    const spread = (Math.random() - 0.5) * weapon.spread * 2;
    const shotAngle = aimAngle + spread;
    const startX = muzzle.x + Math.cos(shotAngle) * spawnPad;
    const startY = muzzle.y + Math.sin(shotAngle) * spawnPad;
    spawnProjectile(G, playerId, weaponId, weapon, startX, startY, shotAngle);
  }

  p.lastFireTick = G.worldTick;
  return true;
}

export default defineGame<ShooterState>({
  name: "my-shooter-game",
  meta: {
    displayName: "My Shooter Game",
    categories: ["action"],
  },
  minPlayers: 2,
  maxPlayers: 4,

  initialActive: (G) => Object.keys(G.players),

  setup: (ctx) => {
    world = planck.World({ gravity: planck.Vec2(0, GRAVITY) });
    playerBodies = {};
    platformBodies = {};
    crateBodies = {};
    pickupBodies = {};
    bulletBodies = {};
    bulletBounceCounts = {};
    playerGrounded = {};
    playerWallJumpUsed = {};
    playerWallContact = {};
    playerJumpGrace = {};
    pendingHits.length = 0;
    pendingPlatformDamages.length = 0;
    pendingCrateDamages.length = 0;
    pendingExplosions.length = 0;
    pendingBulletDestroys.clear();

    world.on("begin-contact", (contact) => {
      if (!currentG) return;
      handleContactPickupCollection(currentG, contact);
      handleContactWithBulletDamage(currentG, contact);
    });

    world.on("pre-solve", (contact) => {
      if (!currentG) return;
      if (!contact.isTouching()) return;
      handleContactWithBulletDamage(currentG, contact);
    });

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
      spawnOnFloor(114),
      spawnOnFloor(ARENA_W - 114),
      spawnOnFloor(342),
      spawnOnFloor(570),
    ];

    ctx.players.forEach((id, index) => {
      const spawn = spawns[index % spawns.length];
      players[id] = {
        health: MAX_HEALTH,
        aimAngle: 0,
        facing: 1,
        crouching: false,
        currentWeapon: START_WEAPON,
        ownedWeapons: defaultOwnedWeapons(),
        lastFireTick: 0,
        torso: { x: spawn.x, y: spawn.y, angle: 0 },
        head: { x: spawn.x, y: spawn.y - HEAD_OFFSET, angle: 0 },
      };
      createPlayerPhysics(id, spawn.x, spawn.y);
    });

    const G: ShooterState = {
      players,
      bullets: [],
      platforms: [],
      crates: [],
      pickups: [],
      nextBulletId: 1,
      nextPlatformId: 100,
      nextCrateId: 1,
      nextPickupId: 1,
      spawnTick: 0,
      worldTick: 0,
      matchSeed: ctx.players.slice().sort().join("|"),
      scores: {},
      hitEvents: [],
    };
    initPlatforms(G);
    syncStateFromPhysics(G);
    setCurrentG(G);
    return G;
  },

  moves: {
    move: (G, payload, ctx) => {
      setCurrentG(G);
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
        const wall = playerWallContact[ctx.playerId];
        const standingJump = canPerformStandingJump(ctx.playerId, torso, p.crouching);

        if (standingJump) {
          applyVerticalJump(torso, ctx.playerId, { keepVx: vel.x });
          playerGrounded[ctx.playerId] = false;
          playerWallJumpUsed[ctx.playerId] = false;
        } else if (wall && !playerWallJumpUsed[ctx.playerId]) {
          const awayX = wall.nx >= 0 ? 1 : -1;
          applyVerticalJump(torso, ctx.playerId, { horizImpulse: WALL_JUMP_IMPULSE_X * awayX });
          playerGrounded[ctx.playerId] = false;
          playerWallJumpUsed[ctx.playerId] = true;
        }
      } else if (data.action === "crouch" || (crouching && !data.action)) {
        torso.setLinearVelocity(planck.Vec2(vel.x * 0.35, vel.y));
      } else {
        torso.setLinearVelocity(planck.Vec2(0, vel.y));
      }

      advanceWorld(G);
    },
    switchWeapon: (G, payload, ctx) => {
      setCurrentG(G);
      const p = G.players[ctx.playerId];
      if (!p || p.health <= 0) return INVALID_MOVE;

      const data = payload as { weaponId?: WeaponId; cycle?: boolean };
      if (data.cycle) {
        if (p.ownedWeapons.length <= 1) return INVALID_MOVE;
        cycleOwnedWeapon(p);
      } else if (data.weaponId && WEAPONS[data.weaponId]) {
        if (!playerOwnsWeapon(p, data.weaponId)) return INVALID_MOVE;
        p.currentWeapon = data.weaponId;
      } else {
        return INVALID_MOVE;
      }

      advanceWorld(G);
    },
    shoot: (G, payload, ctx) => {
      setCurrentG(G);
      const p = G.players[ctx.playerId];
      if (!p || p.health <= 0) return INVALID_MOVE;

      const data = payload as { aimAngle?: number; facing?: number };
      const aimAngle = typeof data?.aimAngle === "number" ? data.aimAngle : p.aimAngle;
      p.aimAngle = aimAngle;
      const facing =
        typeof data?.facing === "number"
          ? data.facing >= 0
            ? 1
            : -1
          : p.facing ?? (Math.cos(aimAngle) >= 0 ? 1 : -1);
      p.facing = facing;

      if (!fireWeapon(G, ctx.playerId, aimAngle, facing)) return INVALID_MOVE;

      advanceWorld(G);
    },
  },
  enumerate: (G, playerId) => {
    const p = G.players[playerId];
    if (!p || p.health <= 0) return [];
    return [
      { type: "move", payload: { action: "left", aimAngle: p.aimAngle, crouching: p.crouching } as any },
      { type: "move", payload: { action: "right", aimAngle: p.aimAngle, crouching: p.crouching } as any },
      { type: "move", payload: { action: "jump", aimAngle: p.aimAngle, crouching: p.crouching } as any },
      { type: "move", payload: { action: "crouch", aimAngle: p.aimAngle, crouching: true } as any },
      { type: "shoot", payload: { aimAngle: p.aimAngle } as any },
      ...(p.ownedWeapons.length > 1
        ? [{ type: "switchWeapon" as const, payload: { cycle: true } as any }]
        : []),
      ...p.ownedWeapons
        .filter((weaponId) => weaponId !== p.currentWeapon)
        .map((weaponId) => ({
          type: "switchWeapon" as const,
          payload: { weaponId } as any,
        })),
    ];
  },
});

export const testUtils = {
  breakPlatform: (G: ShooterState, id: number) => breakPlatform(G, id),
  createPickupBody: (pickup: PickupState) => createPickupBody(pickup),
  resolveBulletPlayerDamage: (
    targetId: string,
    hitPart: "player" | "head",
    bulletBody: planck.Body,
    contactPx: { x: number; y: number } | null,
    bulletDamage: number,
  ) => resolveBulletPlayerDamage(targetId, hitPart, bulletBody, contactPx, bulletDamage),
  isHeadshotHit: (targetId: string, hitX: number, hitY: number) =>
    isHeadshotHit(targetId, hitX, hitY),
  bulletHitsHeadZone: (targetId: string, bulletBody: planck.Body) =>
    bulletHitsHeadZone(targetId, bulletBody),
};
