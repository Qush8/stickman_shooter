import {
  defineGame,
  INVALID_MOVE,
  type GameResult,
  type Json,
  type RandomAPI,
  type TickContext,
} from "@bordiko/sdk";

import * as planck from "planck";
import { ARENA_H, ARENA_W, getMap, getNextMapId, type MapId } from "./maps.ts";

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

export type GameMode = "ffa" | "teams2v2";
export type RoundPhase = "playing" | "intermission";
export type MatchPhase = "active";
export type TeamId = 0 | 1;

export interface GameConfig {
  mode?: GameMode;
  roundsToWin?: number;
}

export interface PlayerInput {
  action: string | null;
  jumping: boolean;
  aimAngle: number;
  facing: number;
  crouching: boolean;
  shooting: boolean;
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
  vx: number;
  vy: number;
  grounded: boolean;
  wallJumpUsed: boolean;
  jumpGrace: number;
  onPlatformId?: number;
  team?: TeamId;
  input?: PlayerInput;
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
  vx: number;
  vy: number;
  r: number;
  gravityScale: number;
  bounceCount: number;
}

export interface HitEvent {
  x: number;
  y: number;
  targetId: string;
  damage: number;
  isHeadshot?: boolean;
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

/**
 * Constants the UI needs but must not mirror.
 *
 * The .wasm and ui.html are versioned independently — a reducer update that
 * changes SCALE or the player box without a matching ui.html rebuild would drift
 * silently and read exactly like a netcode bug. Shipping them in the state makes
 * the reducer the single source of truth (see docs.md, "Don't mirror constants").
 */
export interface SharedConsts {
  scale: number;
  arenaW: number;
  arenaH: number;
  playerHalfW: number;
  playerHalfH: number;
  crouchDropPx: number;
  platformMaxHealth: number;
  recoilImpulse: number;
  tickRate: number;
  physicsStepsPerTick: number;
}

export interface ShooterState {
  /** Reducer-owned constants the UI reads instead of hard-coding. */
  consts: SharedConsts;
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
  gameMode: GameMode;
  teams: Record<string, TeamId>;
  currentMapId: MapId;
  currentRound: number;
  roundPhase: RoundPhase;
  intermissionTicksLeft: number;
  lastRoundWinner: string | null;
  matchPhase: MatchPhase;
  roundsToWin: number;
}

export const ROUNDS_TO_WIN = 3;
const INTERMISSION_TICKS = 50;
const FLOOR_Y = ARENA_H;
const FLOOR_PICKUP_Y = FLOOR_Y - 20;
const PICKUP_FALL_SPEED = 8;
const SCALE = 30;
const MAX_HEALTH = 1000;
const HEADSHOT_DAMAGE = MAX_HEALTH * 0.5;
const BODY_BULLET_DAMAGE = MAX_HEALTH * 0.25;
const HEAD_VISUAL_RADIUS_PX = 14;
const HEAD_HIT_RADIUS_PX = HEAD_VISUAL_RADIUS_PX + 2;
const BULLET_DAMAGE = 125;
const MAX_BULLETS_PER_PLAYER = 3;
const PLAYER_HALF_W = 0.48;
const PLAYER_HALF_H = 1.06;
const HEAD_OFFSET = 36;
const HEAD_RADIUS = HEAD_VISUAL_RADIUS_PX / SCALE;
/** Fixed physics timestep — one move advances one physics tick at 60Hz. */
const PHYSICS_HZ = 60;
const PHYSICS_DT = 1 / PHYSICS_HZ;
const PHYSICS_STEPS_PER_TICK = 1;
/** Host clock rate — also declared in the manifest and the `realtime` block below. */
const TICK_RATE = 30;
const MOVE_SPEED = 15 * SCALE;
const JUMP_VY = -34 * SCALE;
/** Target peak height = jump × this (impulse uses √ratio for energy scaling). */
const RECOIL_HEIGHT_OF_JUMP = 0.9;
const GRAVITY = 97.5 * SCALE;
const WALL_JUMP_IMPULSE_X = 11 * SCALE;
const BULLET_SPEED = 40 * SCALE;
const BULLET_SPEED_MUL = 0.85;
const BULLET_GRAVITY_SCALE = 0.62;
const ARENA_WALL_THICK = 12;
const PLAYER_W = PLAYER_HALF_W * SCALE * 2;
const PLAYER_H = PLAYER_HALF_H * SCALE * 2;
const FEET_PIXELS = PLAYER_H / 2;
const GROUNDED_VEL_Y = 12 * SCALE;
const MAX_BULLET_BOUNCES = 2;
/** Speed retained after each wall/platform bounce (1 = perfect elastic). */
const BULLET_BOUNCE_RESTITUTION = 0.65;
const RECOIL_IMPULSE = 34 * SCALE * Math.sqrt(RECOIL_HEIGHT_OF_JUMP);
const PLATFORM_HITS_TO_BREAK = 4;
const PLATFORM_MAX_HEALTH = WEAPONS.winchester.damage * PLATFORM_HITS_TO_BREAK;
const PLATFORM_BORDER_PX = 2;
const CRATE_MAX_HEALTH = 500;
const CRATE_W = 36;
const CRATE_H = 36;
const SPAWN_INTERVAL_TICKS = 480;
const SPAWN_DELAY_TICKS = 60;
const ELEVATOR_TTL_TICKS = 1800;
const MAX_PLATFORMS_ON_SCREEN = 10;
const MAX_INCOMING_ELEVATORS = 7;
const MAX_ELEVATORS_PER_Y_BAND = 2;
const Y_BAND_TOLERANCE_PX = 22;
/** Max vertical jump height from JUMP_VY / GRAVITY (~178px). */
const MAX_JUMP_HEIGHT = (JUMP_VY * JUMP_VY) / (2 * GRAVITY);
/** Max horizontal travel during a full jump arc (~313px). */
const MAX_JUMP_WIDTH = MOVE_SPEED * ((2 * Math.abs(JUMP_VY)) / GRAVITY);
const JUMP_REACH_SAFE = 0.75;
const PICKUP_RADIUS = 14;
const HEALTH_PICKUP_AMOUNT = 300;
const START_WEAPON: WeaponId = "winchester";
const KATANA_BLADE_HIT_RADIUS = 30;
const KATANA_SWING_HIT_SAMPLES = [0.28, 0.36, 0.44, 0.52, 0.6, 0.68];

const STICK_BODY_LEN_PX = 44;
const STICK_ARM_LEN_PX = 28;
const STICK_CROUCH_DROP_PX = 22;
const PLAYER_CROUCH_H = PLAYER_H - STICK_CROUCH_DROP_PX;
/** Narrower playable platforms (map defs scaled at init). */
const PLATFORM_WIDTH_MUL = 0.68;
const GUN_BARREL_PX = 23;
const GUN_TIP_PX = 2.4;

/** Snapshot of the reducer's constants, shipped to the UI in `G.consts`. */
const buildSharedConsts = (): SharedConsts => ({
  scale: SCALE,
  arenaW: ARENA_W,
  arenaH: ARENA_H,
  playerHalfW: PLAYER_HALF_W,
  playerHalfH: PLAYER_HALF_H,
  crouchDropPx: STICK_CROUCH_DROP_PX,
  platformMaxHealth: PLATFORM_MAX_HEALTH,
  recoilImpulse: RECOIL_IMPULSE,
  tickRate: TICK_RATE,
  physicsStepsPerTick: PHYSICS_STEPS_PER_TICK,
});

const spawnOnFloor = (x: number) => ({
  x,
  y: FLOOR_Y - PLAYER_HALF_H * SCALE,
});

let handledBulletPlayerHitsThisStep = new Set<string>();
const pendingBulletDestroys = new Set<number>();
const pendingHits: HitEvent[] = [];
const pendingPlatformDamages: { id: number; damage: number; x: number; y: number }[] = [];
const pendingCrateDamages: { id: number; damage: number; x: number; y: number }[] = [];
const pendingExplosions: { x: number; y: number; radius: number; damage: number; owner: string }[] =
  [];
interface PendingReplacementSpawn {
  ticksLeft: number;
  y: number;
  w: number;
}
const pendingReplacementSpawns: PendingReplacementSpawn[] = [];
let currentG: ShooterState | null = null;

let world: planck.World | null = null;
let currentWorldTick = -1;
const bodyMap = new Map<string, planck.Body>();

function ensureWorld(G: ShooterState) {
  if (world && currentWorldTick === G.worldTick) return;

  world = new planck.World({ gravity: planck.Vec2(0, GRAVITY / SCALE) });
  bodyMap.clear();
  // ensureWorld running

  const walls = world.createBody();
  walls.createFixture(planck.Box(ARENA_W / 2 / SCALE, ARENA_WALL_THICK / 2 / SCALE, planck.Vec2(ARENA_W / 2 / SCALE, (FLOOR_Y + ARENA_WALL_THICK / 2) / SCALE), 0));
  walls.createFixture(planck.Box(ARENA_WALL_THICK / 2 / SCALE, ARENA_H / 2 / SCALE, planck.Vec2(-ARENA_WALL_THICK / 2 / SCALE, ARENA_H / 2 / SCALE), 0));
  walls.createFixture(planck.Box(ARENA_WALL_THICK / 2 / SCALE, ARENA_H / 2 / SCALE, planck.Vec2((ARENA_W + ARENA_WALL_THICK / 2) / SCALE, ARENA_H / 2 / SCALE), 0));
  walls.createFixture(planck.Box(ARENA_W / 2 / SCALE, ARENA_WALL_THICK / 2 / SCALE, planck.Vec2(ARENA_W / 2 / SCALE, -ARENA_WALL_THICK / 2 / SCALE), 0));

  for (const [id, p] of Object.entries(G.players)) {
    const b = world.createDynamicBody({
      position: planck.Vec2(p.torso.x / SCALE, p.torso.y / SCALE),
      fixedRotation: true,
      userData: { type: "player", id }
    });
    rebuildPlayerFixtures(p, b, id);
    b.setLinearVelocity(planck.Vec2(p.vx / SCALE, p.vy / SCALE));
    bodyMap.set("player_" + id, b);
  }

  for (const plat of G.platforms) {
    if (plat.broken) continue;
    createPlatformBody(plat);
  }

  for (const crate of G.crates) {
    const b = world.createBody({
      type: "static",
      position: planck.Vec2((crate.x + crate.w / 2) / SCALE, (crate.y + crate.h / 2) / SCALE),
      userData: { type: "crate", id: crate.id }
    });
    b.createFixture(planck.Box(crate.w / 2 / SCALE, crate.h / 2 / SCALE));
    bodyMap.set("crate_" + crate.id, b);
  }

  for (const bullet of G.bullets) {
    const b = world.createDynamicBody({
      position: planck.Vec2(bullet.body.x / SCALE, bullet.body.y / SCALE),
      bullet: true,
      gravityScale: bullet.gravityScale,
      userData: { type: "bullet", id: bullet.id, owner: bullet.owner }
    });
    b.createFixture(planck.Circle(bullet.r / SCALE), {
      friction: 0.0,
      restitution: BULLET_BOUNCE_RESTITUTION,
      density: 0.1,
    });
    b.setLinearVelocity(planck.Vec2(bullet.vx / SCALE, bullet.vy / SCALE));
    bodyMap.set("bullet_" + bullet.id, b);
  }

  world.on('pre-solve', function(contact, oldManifold) {
    const fA = contact.getFixtureA();
    const fB = contact.getFixtureB();
    const uA = getFixtureEntityData(fA);
    const uB = getFixtureEntityData(fB);
    const bulletBodyA = uA?.type === "bullet" ? (fA.getBody().getUserData() as { owner?: string }) : null;
    const bulletBodyB = uB?.type === "bullet" ? (fB.getBody().getUserData() as { owner?: string }) : null;
    
    if (uA?.type === "bullet" && uB?.type === "player" && bulletBodyA?.owner === String(uB.id)) {
      contact.setEnabled(false);
    }
    if (uB?.type === "bullet" && uA?.type === "player" && bulletBodyB?.owner === String(uA.id)) {
      contact.setEnabled(false);
    }
    if (uA?.type === "bullet" && uB?.type === "head" && bulletBodyA?.owner === String(uB.id)) {
      contact.setEnabled(false);
    }
    if (uB?.type === "bullet" && uA?.type === "head" && bulletBodyB?.owner === String(uA.id)) {
      contact.setEnabled(false);
    }
    if (
      uA?.type === "bullet" &&
      (uB?.type === "player" || uB?.type === "head") &&
      currentG &&
      !isPlayerAlive(currentG, String(uB.id))
    ) {
      contact.setEnabled(false);
    }
    if (
      uB?.type === "bullet" &&
      (uA?.type === "player" || uA?.type === "head") &&
      currentG &&
      !isPlayerAlive(currentG, String(uA.id))
    ) {
      contact.setEnabled(false);
    }
    if (uA?.type === "bullet" && uB?.type === "bullet") {
      contact.setEnabled(false);
    }
    if (uA?.type === "bullet" && currentG && !currentG.bullets.some((b) => b.id === uA.id)) {
      contact.setEnabled(false);
    }
    if (uB?.type === "bullet" && currentG && !currentG.bullets.some((b) => b.id === uB.id)) {
      contact.setEnabled(false);
    }
    if (uA?.type === "player" && uB?.type === "platform") {
      handlePlayerPlatformPreSolve(contact, fA, fB, String(uA.id));
    }
    if (uB?.type === "player" && uA?.type === "platform") {
      handlePlayerPlatformPreSolve(contact, fB, fA, String(uB.id));
    }
    if (uA?.type === "player" && uB?.type === "player") {
      contact.setFriction(1.0);
      contact.setRestitution(0);
    }
    if (
      (uA?.type === "player" || uA?.type === "head") &&
      (uB?.type === "player" || uB?.type === "head") &&
      currentG
    ) {
      const idA = String(uA!.id);
      const idB = String(uB!.id);
      if (!isPlayerAlive(currentG, idA) || !isPlayerAlive(currentG, idB)) {
        contact.setEnabled(false);
      }
    }
  });

  world.on('begin-contact', function(contact) {
    const fA = contact.getFixtureA();
    const fB = contact.getFixtureB();
    const uA = getFixtureEntityData(fA);
    const uB = getFixtureEntityData(fB);

    if (uA?.type === "bullet" || uB?.type === "bullet") {
      const bulletU = uA?.type === "bullet" ? uA : uB;
      const otherU = uA?.type === "bullet" ? uB : uA;
      
      if (!currentG || !bulletU) return;
      const bulletState = currentG.bullets.find(b => b.id === bulletU.id);
      if (!bulletState) return;

      if (otherU?.type === "platform") {
        pendingPlatformDamages.push({
          id: Number(otherU.id),
          damage: bulletState.damage,
          x: bulletState.body.x,
          y: bulletState.body.y,
        });
      } else if (otherU?.type === "crate") {
        pendingCrateDamages.push({
          id: Number(otherU.id),
          damage: bulletState.damage,
          x: bulletState.body.x,
          y: bulletState.body.y,
        });
      } else if (otherU?.type === "player" || otherU?.type === "head") {
        const targetId = String(otherU.id);
        const wm = contact.getWorldManifold(null as any);
        const contactPx = wm && wm.points && wm.points.length > 0 ? { x: wm.points[0].x * SCALE, y: wm.points[0].y * SCALE } : { x: bulletState.body.x, y: bulletState.body.y };
        if (targetId !== bulletState.owner && isPlayerAlive(currentG, targetId) && canDamage(currentG, bulletState.owner, targetId)) {
           if (!handledBulletPlayerHitsThisStep.has(String(bulletState.id))) {
              handledBulletPlayerHitsThisStep.add(String(bulletState.id));
              pendingBulletDestroys.add(bulletState.id);
              const hitPart = otherU.type === "head" ? "head" : "player";
              const { damage, isHeadshot } = resolveBulletPlayerDamage(
                currentG,
                targetId,
                hitPart,
                bulletState,
                contactPx,
              );
              
              const headPoint = isHeadshot ? headHitPointPx(currentG, targetId) : null;
              pendingHits.push({
                x: headPoint?.x ?? bulletState.body.x,
                y: headPoint?.y ?? bulletState.body.y,
                targetId,
                damage,
                isHeadshot,
              });
              destroyBullet(currentG, bulletState.id);
           }
        }
      }

      // Count bounces against walls, platforms, crates (anything that isn't a damaging player hit).
      const isDamagingPlayerHit =
        (otherU?.type === "player" || otherU?.type === "head") &&
        otherU.id !== bulletState.owner &&
        isPlayerAlive(currentG, String(otherU.id)) &&
        canDamage(currentG, bulletState.owner, String(otherU.id));
      if (!isDamagingPlayerHit) {
        bulletState.bounceCount = (bulletState.bounceCount || 0) + 1;
        if (bulletState.bounceCount >= MAX_BULLET_BOUNCES) {
          pendingBulletDestroys.add(bulletState.id);
        }
      }
    }
  });

  currentWorldTick = G.worldTick;
}

function getFixtureEntityData(f: planck.Fixture): { type: string; id: string | number } | null {
  const fu = f.getUserData() as { type?: string; id?: string | number } | null;
  if (fu?.type && fu.id != null) return { type: fu.type, id: fu.id };
  const bu = f.getBody().getUserData() as { type?: string; id?: string | number } | null;
  if (bu?.type && bu.id != null) return { type: bu.type, id: bu.id };
  return null;
}

function syncPlayerBodyTransform(p: PlayerState, b: planck.Body) {
  b.setTransform(planck.Vec2(p.torso.x / SCALE, p.torso.y / SCALE), 0);
}

function rebuildPlayerFixtures(p: PlayerState, b: planck.Body, playerId: string) {
  let fix = b.getFixtureList();
  while (fix) {
    b.destroyFixture(fix);
    fix = fix.getNext();
  }
  const h = p.crouching ? PLAYER_CROUCH_H : PLAYER_H;
  b.createFixture(planck.Box(PLAYER_W / 2 / SCALE, h / 2 / SCALE), {
    friction: 0.75,
    restitution: 0.0,
    density: 1.0,
    userData: { type: "player", id: playerId },
  });
  const headCenterY = (-HEAD_OFFSET + (p.crouching ? STICK_CROUCH_DROP_PX * 0.5 : 0)) / SCALE;
  const headHalf = HEAD_HIT_RADIUS_PX / SCALE;
  b.createFixture(planck.Box(headHalf, headHalf, planck.Vec2(0, headCenterY), 0), {
    isSensor: true,
    userData: { type: "head", id: playerId },
  });
}

function updatePlayerCrouchFixture(p: PlayerState, b: planck.Body) {
  const bodyData = b.getUserData() as { id?: string } | null;
  rebuildPlayerFixtures(p, b, bodyData?.id ?? "");
}

function freezePlayerBody(playerId: string, p: PlayerState) {
  const b = bodyMap.get("player_" + playerId);
  if (!b) return;
  let fix = b.getFixtureList();
  while (fix) {
    const next = fix.getNext();
    b.destroyFixture(fix);
    fix = next;
  }
  b.setType("static");
  b.setLinearVelocity(planck.Vec2(0, 0));
  syncPlayerBodyTransform(p, b);
  b.setAwake(false);
}

function applyCrouchInput(
  p: PlayerState,
  b: planck.Body,
  wantCrouch: boolean,
  grounded: boolean,
) {
  if (wantCrouch) {
    if (!p.crouching && grounded) {
      p.crouching = true;
      applyCrouchPose(p, true);
      syncPlayerBodyTransform(p, b);
      updatePlayerCrouchFixture(p, b);
    }
    return;
  }
  if (!p.crouching) return;
  p.crouching = false;
  applyCrouchPose(p, false);
  syncPlayerBodyTransform(p, b);
  updatePlayerCrouchFixture(p, b);
}

const PASSIVE_PUSH_CAP_PX = MOVE_SPEED / 30 + 0.5;
const preStepTorsoX = new Map<string, number>();

function clampPassivePlayerPush(G: ShooterState) {
  for (const [id, p] of Object.entries(G.players)) {
    if (p.health <= 0) continue;
    const data = p.input;
    const b = bodyMap.get("player_" + id);
    if (!b || !data) continue;
    const selfMoving = data.action === "left" || data.action === "right";
    const prevX = preStepTorsoX.get(id);
    if (selfMoving || prevX == null) continue;
    const dx = p.torso.x - prevX;
    if (Math.abs(dx) <= PASSIVE_PUSH_CAP_PX + 0.01) continue;
    p.torso.x = prevX + Math.sign(dx) * PASSIVE_PUSH_CAP_PX;
    syncHeadFromTorso(p);
    syncPlayerBodyTransform(p, b);
    const vel = b.getLinearVelocity();
    b.setLinearVelocity(planck.Vec2(0, vel.y));
    p.vx = 0;
  }
  preStepTorsoX.clear();
}

function setCurrentG(G: ShooterState) {
  ensureWorld(G);
  currentG = G;
}

function parseGameConfig(config?: Json): GameMode {
  const mode = (config as GameConfig | undefined)?.mode;
  return mode === "teams2v2" ? "teams2v2" : "ffa";
}

function parseRoundsToWin(config?: Json): number {
  const raw = (config as GameConfig | undefined)?.roundsToWin;
  if (typeof raw !== "number" || !Number.isFinite(raw)) return ROUNDS_TO_WIN;
  return Math.max(3, Math.min(5, Math.round(raw)));
}

function initScores(playerIds: string[], gameMode: GameMode): Record<string, number> {
  if (gameMode === "teams2v2") {
    return { "0": 0, "1": 0 };
  }
  const scores: Record<string, number> = {};
  for (const id of playerIds) scores[id] = 0;
  return scores;
}

function assignTeams(playerIds: string[]): Record<string, TeamId> {
  const teams: Record<string, TeamId> = {};
  playerIds.forEach((id, index) => {
    teams[id] = index < 2 ? 0 : 1;
  });
  return teams;
}

function canDamage(G: ShooterState, attackerId: string, targetId: string): boolean {
  if (G.gameMode !== "teams2v2") return true;
  const attackerTeam = G.teams[attackerId];
  const targetTeam = G.teams[targetId];
  if (attackerTeam === undefined || targetTeam === undefined) return true;
  return attackerTeam !== targetTeam;
}

function detectRoundWinner(G: ShooterState): string | null {
  if (G.gameMode === "ffa") {
    const alive = Object.entries(G.players).filter(([, p]) => p.health > 0);
    if (alive.length === 1) return alive[0][0];
    return null;
  }

  const team0Alive = Object.entries(G.players).some(
    ([id, p]) => G.teams[id] === 0 && p.health > 0,
  );
  const team1Alive = Object.entries(G.players).some(
    ([id, p]) => G.teams[id] === 1 && p.health > 0,
  );
  if (!team0Alive && team1Alive) return "1";
  if (!team1Alive && team0Alive) return "0";
  return null;
}

function checkRoundEnd(G: ShooterState) {
  if (G.roundPhase !== "playing") return;

  const winner = detectRoundWinner(G);
  if (!winner) return;

  G.scores[winner] = (G.scores[winner] ?? 0) + 1;
  G.lastRoundWinner = winner;

  if ((G.scores[winner] ?? 0) >= G.roundsToWin) {
    G.roundPhase = "intermission";
    G.intermissionTicksLeft = 0;
    return;
  }

  G.roundPhase = "intermission";
  G.intermissionTicksLeft = INTERMISSION_TICKS;
}

function startNextRound(G: ShooterState) {
  G.currentMapId = getNextMapId(G.currentMapId);
  G.currentRound += 1;
  G.lastRoundWinner = null;
  G.roundPhase = "playing";
  G.intermissionTicksLeft = 0;
  resetRound(G);
}

function buildMatchResult(G: ShooterState): GameResult | void {
  const maxScore = Math.max(...Object.values(G.scores).map((s) => Number(s)));
  if (maxScore < G.roundsToWin) return;

  if (G.gameMode === "ffa") {
    const winner = Object.entries(G.scores).find(([, s]) => s >= G.roundsToWin)?.[0];
    if (!winner) return;
    return { winner, scores: G.scores, reason: `first-to-${G.roundsToWin}` };
  }

  const winningTeam = Object.entries(G.scores).find(([, s]) => s >= G.roundsToWin)?.[0];
  if (winningTeam == null) return;
  const winners = Object.entries(G.teams)
    .filter(([, team]) => String(team) === winningTeam)
    .map(([id]) => id);
  return { winners, scores: G.scores, reason: `first-to-${G.roundsToWin}` };
}

function isPlayerAlive(G: ShooterState, id: string): boolean {
  const p = G.players[id];
  return !!p && p.health > 0;
}

function syncHeadFromTorso(p: PlayerState) {
  const crouchDrop = p.crouching ? STICK_CROUCH_DROP_PX * 0.5 : 0;
  p.head = { x: p.torso.x, y: p.torso.y - HEAD_OFFSET + crouchDrop, angle: 0 };
  p.torso.angle = 0;
}

function initPlayerPhysics(p: PlayerState) {
  p.vx = 0;
  p.vy = 0;
  p.grounded = false;
  p.wallJumpUsed = false;
  p.jumpGrace = 0;
}

function ensurePlayerPhysics(p: PlayerState) {
  if (typeof p.vx !== "number") p.vx = 0;
  if (typeof p.vy !== "number") p.vy = 0;
  if (typeof p.grounded !== "boolean") p.grounded = false;
  if (typeof p.wallJumpUsed !== "boolean") p.wallJumpUsed = false;
  if (typeof p.jumpGrace !== "number") p.jumpGrace = 0;
}

function playerBodyHeight(p: PlayerState): number {
  return p.crouching ? PLAYER_CROUCH_H : PLAYER_H;
}

function getFeetY(p: PlayerState): number {
  return p.torso.y + playerBodyHeight(p) / 2;
}

function applyCrouchPose(p: PlayerState, crouching: boolean) {
  const prevH = playerBodyHeight(p);
  p.crouching = crouching;
  const nextH = playerBodyHeight(p);
  if (prevH === nextH) return;

  const feetY = p.torso.y + prevH / 2;
  p.torso.y = feetY - nextH / 2;
  syncHeadFromTorso(p);
}

function scalePlatformFromDef(def: {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  kind: "static" | "elevator";
  vx?: number;
  minX?: number;
  maxX?: number;
}) {
  const w = Math.round(def.w * PLATFORM_WIDTH_MUL);
  const shrink = def.w - w;
  const x = def.x + shrink / 2;
  const minX =
    def.minX != null ? def.minX + shrink / 2 : undefined;
  const maxX =
    def.maxX != null ? def.maxX - shrink / 2 : undefined;
  return { ...def, x, w, minX, maxX };
}

function initPlatforms(G: ShooterState) {
  const mapDef = getMap(G.currentMapId);
  G.platforms = mapDef.platforms.map((def) => {
    const scaled = scalePlatformFromDef(def);
    return {
      id: scaled.id,
      x: scaled.x,
      y: scaled.y,
      w: scaled.w,
      h: scaled.h,
      health: PLATFORM_MAX_HEALTH,
      maxHealth: PLATFORM_MAX_HEALTH,
      broken: false,
      kind: scaled.kind,
      vx: scaled.kind === "elevator" ? scaled.vx : undefined,
      minX: scaled.kind === "elevator" ? scaled.minX : undefined,
      maxX: scaled.kind === "elevator" ? scaled.maxX : undefined,
    };
  });
}

function getElevators(G: ShooterState) {
  return G.platforms.filter((p) => !p.broken && p.kind === "elevator");
}

function getRandomElevator(G: ShooterState, random: RandomAPI): PlatformState | null {
  const elevators = getElevators(G);
  if (!elevators.length) return null;
  return random.pick(elevators);
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

function breakPlatform(G: ShooterState, id: number, random?: RandomAPI) {
  const idx = G.platforms.findIndex((p) => p.id === id);
  if (idx < 0) return;
  const plat = G.platforms[idx];
  if (plat.broken) return;

  const brokenX = plat.x;
  const brokenY = plat.y;
  const brokenW = plat.w;

  plat.broken = true;
  plat.health = 0;
  releasePickupsFromPlatform(G, id, plat);
  pendingHits.push({
    x: plat.x + plat.w / 2,
    y: plat.y + plat.h / 2,
    targetId: "",
    damage: 0,
  });

  destroyPlatformBody(id);
  G.platforms.splice(idx, 1);

  if (random) {
    pendingReplacementSpawns.push({
      ticksLeft: SPAWN_DELAY_TICKS,
      y: brokenY,
      w: brokenW,
    });
  }
}

function damagePlatform(G: ShooterState, id: number, damage: number, x: number, y: number, random?: RandomAPI) {
  const plat = G.platforms.find((p) => p.id === id);
  if (!plat || plat.broken) return;
  plat.health = Math.max(0, plat.health - damage);
  pendingHits.push({ x, y, targetId: "", damage: 0 });
  if (plat.health <= 0) {
    breakPlatform(G, id, random);
  }
}

function destroyCrate(G: ShooterState, id: number) {
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
  const idx = G.pickups.findIndex((p) => p.id === id);
  if (idx >= 0) G.pickups.splice(idx, 1);
}

function platformIntersectsArena(plat: PlatformState): boolean {
  return plat.x + plat.w > 0 && plat.x < ARENA_W && plat.y + plat.h > 0 && plat.y < ARENA_H;
}

function createPlatformBody(plat: PlatformState) {
  if (!world || plat.broken) return;
  const key = "platform_" + plat.id;
  if (bodyMap.has(key)) return;
  if (!platformIntersectsArena(plat)) return;

  const isElevator = plat.kind === "elevator";
  const b = world.createBody({
    type: isElevator ? "kinematic" : "static",
    position: planck.Vec2((plat.x + plat.w / 2) / SCALE, (plat.y + plat.h / 2) / SCALE),
    userData: { type: "platform", id: plat.id },
  });
  b.createFixture(planck.Box(plat.w / 2 / SCALE, plat.h / 2 / SCALE), {
    friction: 0.4,
    restitution: 0.0,
  });
  if (isElevator && plat.vx != null) {
    b.setLinearVelocity(planck.Vec2(plat.vx / SCALE, 0));
  }
  bodyMap.set(key, b);
}

function destroyPlatformBody(id: number) {
  const key = "platform_" + id;
  const body = bodyMap.get(key);
  if (body && world) {
    world.destroyBody(body);
    bodyMap.delete(key);
  }
}

function destroyBullet(G: ShooterState, bulletId: number) {
  const key = "bullet_" + bulletId;
  const body = bodyMap.get(key);
  if (body && world) {
    world.destroyBody(body);
    bodyMap.delete(key);
  }
  pendingBulletDestroys.delete(bulletId);
  const idx = G.bullets.findIndex((b) => b.id === bulletId);
  if (idx >= 0) G.bullets.splice(idx, 1);
}

function computeMuzzlePx(
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
      x: mountX + Math.cos(aimAngle) * tubeLen,
      y: mountY + Math.sin(aimAngle) * tubeLen,
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
    x: handX + Math.cos(aimAngle) * muzzleDist,
    y: handY + Math.sin(aimAngle) * muzzleDist,
  };
}

function createPlayerPhysics(p: PlayerState) {
  initPlayerPhysics(p);
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

function handlePlayerPlatformPreSolve(
  contact: planck.Contact,
  playerFix: planck.Fixture,
  platFix: planck.Fixture,
  playerId: string,
) {
  if (!currentG) return;
  const platData = platFix.getUserData() as { id?: number } | null;
  const plat = currentG.platforms.find((p) => p.id === platData?.id);
  if (!plat || plat.broken) return;
  const p = currentG.players[playerId];
  if (!p || p.health <= 0) return;

  const wm = contact.getWorldManifold(null);
  if (!wm) return;

  const playerIsA = playerFix === contact.getFixtureA();
  const upNormal = playerIsA ? wm.normal.y : -wm.normal.y;
  const feetY = getFeetY(p);
  const platTop = plat.y;
  const h = playerBodyHeight(p);
  const playerTop = p.torso.y - h / 2;

  if (playerTop > platTop - 2) {
    contact.setEnabled(false);
    return;
  }

  const ridingThis = p.onPlatformId === plat.id;
  const landingFromAbove =
    feetY <= platTop + 6 && (p.vy > 0 || ridingThis) && upNormal >= 0.45;

  if (landingFromAbove) return;

  contact.setEnabled(false);
}

function resolvePlayerPlatformSideOverlap(
  G: ShooterState,
  p: PlayerState,
  b: planck.Body,
) {
  const halfW = PLAYER_HALF_W * SCALE;
  const h = playerBodyHeight(p);
  const top = p.torso.y - h / 2;
  const bottom = getFeetY(p);
  let changed = false;

  for (const plat of G.platforms) {
    if (plat.broken) continue;
    const platTop = plat.y;
    const platBottom = plat.y + plat.h;
    if (top >= platBottom + 4) continue;
    if (bottom <= platTop + 2 && top < platTop - 4) continue;

    const overlapsX =
      p.torso.x + halfW > plat.x + 2 && p.torso.x - halfW < plat.x + plat.w - 2;
    if (!overlapsX) continue;

    const onTop = Math.abs(bottom - platTop) <= 8 && top < platTop - 4;
    if (onTop && p.onPlatformId === plat.id) continue;

    p.onPlatformId = undefined;
    if (p.vy <= 0) {
      p.vy = Math.max(p.vy, 3 * SCALE);
    }
    changed = true;
  }

  if (!changed) return;
  syncHeadFromTorso(p);
  syncPlayerBodyTransform(p, b);
  const vel = b.getLinearVelocity();
  b.setLinearVelocity(planck.Vec2(vel.x, Math.max(vel.y, p.vy / SCALE)));
}

function syncPlayerOnPlatformId(G: ShooterState, p: PlayerState) {
  if (!p.grounded) {
    p.onPlatformId = undefined;
    return;
  }
  const feetY = getFeetY(p);
  for (const plat of G.platforms) {
    if (plat.broken) continue;
    if (isEntityOnPlatform(p.torso.x, feetY, plat, 10)) {
      p.onPlatformId = plat.id;
      return;
    }
  }
  p.onPlatformId = undefined;
}

function countPlatformsOnScreen(G: ShooterState): number {
  return G.platforms.filter(
    (p) => !p.broken && p.x + p.w > 0 && p.x < ARENA_W,
  ).length;
}

function countIncomingElevators(G: ShooterState): number {
  return G.platforms.filter(
    (p) => !p.broken && p.kind === "elevator" && p.ttlTicks != null,
  ).length;
}

function countElevatorsAtY(G: ShooterState, y: number): number {
  return G.platforms.filter(
    (p) =>
      !p.broken &&
      p.kind === "elevator" &&
      Math.abs(p.y - y) <= Y_BAND_TOLERANCE_PX,
  ).length;
}

function platformsOverlapAabb(a: PlatformState, b: PlatformState): boolean {
  if (Math.abs(a.y - b.y) > Y_BAND_TOLERANCE_PX) return false;
  return a.x < b.x + b.w && a.x + a.w > b.x;
}

function canSpawnIncomingElevator(G: ShooterState): boolean {
  return (
    countPlatformsOnScreen(G) < MAX_PLATFORMS_ON_SCREEN &&
    countIncomingElevators(G) < MAX_INCOMING_ELEVATORS
  );
}

function pickSpawnY(G: ShooterState, yChoices: number[], random: RandomAPI): number | null {
  if (!yChoices.length) return 273;

  const tiers = yChoices
    .map((y, index) => ({
      y,
      index,
      count: countElevatorsAtY(G, y),
    }))
    .filter((t) => t.count < MAX_ELEVATORS_PER_Y_BAND);

  if (!tiers.length) return null;

  tiers.sort((a, b) => {
    if (a.count !== b.count) return a.count - b.count;
    return b.index - a.index;
  });

  const bestCount = tiers[0].count;
  const candidates = tiers.filter((t) => t.count === bestCount);
  return random.pick(candidates).y;
}

function isPlayerOnPlatform(G: ShooterState, playerId: string, plat: PlatformState): boolean {
  const p = G.players[playerId];
  if (!p || !p.grounded) return false;
  return isEntityOnPlatform(p.torso.x, getFeetY(p), plat);
}

function applyPlatformRiderDelta(G: ShooterState, plat: PlatformState, dx: number) {
  if (dx === 0) return;

  for (const [id, p] of Object.entries(G.players)) {
    if (!isPlayerAlive(G, id) || !isPlayerOnPlatform(G, id, plat)) continue;
    p.torso.x += dx;
    syncHeadFromTorso(p);
    if (plat.vx != null) p.vx += plat.vx;
  }

  for (const crate of G.crates) {
    if (crate.onPlatformId !== plat.id) continue;
    crate.x += dx;
  }

  for (const pickup of G.pickups) {
    if (pickup.onPlatformId !== plat.id) continue;
    pickup.x += dx;
  }
}

function advancePlatformMotion(G: ShooterState, random: RandomAPI) {
  const dt = PHYSICS_DT;
  const expiredIds: number[] = [];
  const movers = G.platforms
    .filter((p) => !p.broken && p.kind === "elevator" && p.vx != null)
    .sort((a, b) => a.id - b.id);

  for (const plat of movers) {
    const prevX = plat.x;
    let newX = plat.x + plat.vx! * dt;

    if (plat.minX != null && newX < plat.minX) {
      newX = plat.minX;
      plat.vx = Math.abs(plat.vx!);
    }
    if (plat.maxX != null && newX > plat.maxX) {
      newX = plat.maxX;
      plat.vx = -Math.abs(plat.vx!);
    }

    plat.x = newX;

    for (const other of movers) {
      if (other.id === plat.id) continue;
      const probe = { ...plat, x: newX };
      if (!platformsOverlapAabb(probe, other)) continue;
      plat.vx = plat.vx! > 0 ? -Math.abs(plat.vx!) : Math.abs(plat.vx!);
      newX = plat.x;
      if (plat.vx! > 0 && newX + plat.w >= other.x) {
        newX = other.x - plat.w - 1;
      } else if (plat.vx! < 0 && newX <= other.x + other.w) {
        newX = other.x + other.w + 1;
      }
      plat.x = newX;
      other.vx = other.vx! > 0 ? -Math.abs(other.vx!) : Math.abs(other.vx!);
      break;
    }

    if (plat.ttlTicks != null) {
      plat.ttlTicks -= 1;
      if (plat.ttlTicks <= 0 || plat.x < -200 || plat.x > ARENA_W + 200) {
        expiredIds.push(plat.id);
        continue;
      }
    }

    const dx = plat.x - prevX;
    applyPlatformRiderDelta(G, plat, dx);

    const body = bodyMap.get("platform_" + plat.id);
    if (platformIntersectsArena(plat)) {
      if (!body) createPlatformBody(plat);
      const b = bodyMap.get("platform_" + plat.id);
      if (b) {
        b.setTransform(
          planck.Vec2((plat.x + plat.w / 2) / SCALE, (plat.y + plat.h / 2) / SCALE),
          0,
        );
        b.setLinearVelocity(planck.Vec2(plat.vx! / SCALE, 0));
      }
    }
  }

  for (const id of expiredIds) {
    breakPlatform(G, id, random);
  }
}

function isPlayerGrounded(p: PlayerState): boolean {
  return p.grounded;
}

function canPerformStandingJump(G: ShooterState, id: string, crouching: boolean): boolean {
  const p = G.players[id];
  if (!p || crouching) return false;
  if (Math.abs(p.vy) > GROUNDED_VEL_Y) return false;
  if (p.grounded) return true;
  const feetY = getFeetY(p);
  if (feetY >= FLOOR_Y - 14) return true;
  for (const plat of G.platforms) {
    if (!plat.broken && isEntityOnPlatform(p.torso.x, feetY, plat, 14)) return true;
  }
  return false;
}

function applyVerticalJump(p: PlayerState, opts: { keepVx?: number; horizImpulse?: number } = {}) {
  const horiz = opts.horizImpulse ?? 0;
  p.vx = horiz !== 0 ? horiz : (opts.keepVx ?? 0);
  p.vy = JUMP_VY;
  p.grounded = false;
  p.jumpGrace = 8;
}

function bulletRadiusForKind(kind: BulletState["kind"]): number {
  if (kind === "rocket") return 0.11 * SCALE;
  if (kind === "grenade") return 0.09 * SCALE;
  if (kind === "pellet") return 0.05 * SCALE;
  return 0.07 * SCALE;
}

function queueExplosion(x: number, y: number, radius: number, damage: number, owner: string) {
  pendingExplosions.push({ x, y, radius, damage, owner });
}

function processExplosions(G: ShooterState) {
  for (const ex of pendingExplosions) {
    pendingHits.push({ x: ex.x, y: ex.y, targetId: "", damage: 0 });

    for (const [id, p] of Object.entries(G.players)) {
      if (p.health <= 0 || !isPlayerAlive(G, id)) continue;
      if (!canDamage(G, ex.owner, id)) continue;
      const dx = p.torso.x - ex.x;
      const dy = p.torso.y - ex.y;
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
  const attacker = G.players[playerId];
  if (!attacker) return;

  const hitIds: string[] = [];

  for (const progress of KATANA_SWING_HIT_SAMPLES) {
    const blade = computeKatanaBladeSegment(
      attacker.torso.x,
      attacker.torso.y,
      aimAngle,
      facing,
      progress,
    );

    for (const [targetId, target] of Object.entries(G.players)) {
      if (targetId === playerId || target.health <= 0 || !isPlayerAlive(G, targetId)) continue;
      if (!canDamage(G, playerId, targetId)) continue;
      if (hitIds.includes(targetId)) continue;

      const hitPoints: [number, number][] = [
        [target.torso.x, target.torso.y],
        [target.head.x, target.head.y],
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
        x: target.torso.x,
        y: target.torso.y,
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
  x: number,
  y: number,
  angle: number,
) {
  const vx = Math.cos(angle) * weapon.speed * BULLET_SPEED_MUL * SCALE;
  const vy = Math.sin(angle) * weapon.speed * BULLET_SPEED_MUL * SCALE;

  const kind: BulletState["kind"] =
    weapon.kind === "rocket"
      ? "rocket"
      : weapon.kind === "grenade"
        ? "grenade"
        : weapon.pelletCount && weapon.pelletCount > 1
          ? "pellet"
          : "bullet";

  const bState: BulletState = {
    id: G.nextBulletId++,
    owner,
    body: { x, y, angle },
    kind,
    weaponId,
    damage: weapon.damage,
    aoeRadius: weapon.aoeRadius,
    fuseTicks: weapon.fuseTicks,
    vx,
    vy,
    r: bulletRadiusForKind(kind),
    gravityScale: weapon.gravityScale ?? 1,
    bounceCount: 0,
  };
  G.bullets.push(bState);

  if (world) {
    const b = world.createDynamicBody({
      position: planck.Vec2(x / SCALE, y / SCALE),
      bullet: true,
      gravityScale: bState.gravityScale,
      userData: { type: "bullet", id: bState.id, owner: bState.owner }
    });
    b.createFixture(planck.Circle(bState.r / SCALE), {
      friction: 0.0,
      restitution: BULLET_BOUNCE_RESTITUTION,
      density: 0.1,
    });
    b.setLinearVelocity(planck.Vec2(vx / SCALE, vy / SCALE));
    bodyMap.set("bullet_" + bState.id, b);
  }
}
function applyRecoil(
  p: PlayerState,
  aimAngle: number,
  onGround: boolean,
  crouching: boolean,
  weaponId: WeaponId,
) {
  const weaponScale =
    weaponId === "bazooka"
      ? 1.35
      : weaponId === "sniper"
        ? 1.15
        : weaponId === "winchester_shotgun"
          ? 0.85
          : 1.0;
  let mag = RECOIL_IMPULSE * weaponScale * 0.72;
  if (onGround && crouching) mag *= 0.45;

  const cosA = Math.cos(aimAngle);
  const sinA = Math.sin(aimAngle);
  p.vx += -cosA * mag;

  if (onGround) return;

  // Airborne: full Newton recoil — shooting down pushes upward (negative vy).
  p.vy += -sinA * mag;
}

function getPickupCollectY(pickup: PickupState) {
  return pickup.y;
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

function collectPickupsForPlayers(G: ShooterState) {
  for (const [playerId, p] of Object.entries(G.players)) {
    if (!p || p.health <= 0) continue;
    const px = p.torso.x;
    const py = p.torso.y;
    const headX = p.head.x;
    const headY = p.head.y;
    const feetY = getFeetY(p);

    for (const pickup of [...G.pickups]) {
      if (!canPlayerCollectPickup(px, py, headX, headY, feetY, pickup)) continue;
      applyPickupToPlayer(G, playerId, pickup);
    }
  }
}

function updatePickupDrops(G: ShooterState) {
  for (const pickup of G.pickups) {
    if (pickupHasPlatformSupport(G, pickup)) {
      pickup.targetY = undefined;
      pickup.onPlatformId = findPlatformIdUnderPickup(G, pickup);
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
  }
}

function spawnPickupOnPlatform(G: ShooterState, plat: PlatformState, random: RandomAPI) {
  const id = G.nextPickupId++;
  const kind: PickupState["kind"] = random.float() < 0.5 ? "health" : "weapon";
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
    pickup.weaponId = random.pick(WEAPON_ORDER);
  }
  G.pickups.push(pickup);
}

function platformEdgeGap(a: { x: number; w: number }, b: { x: number; w: number }): number {
  const aRight = a.x + a.w;
  const bRight = b.x + b.w;
  if (aRight < b.x) return b.x - aRight;
  if (bRight < a.x) return a.x - bRight;
  return 0;
}

function spawnJumpableElevator(
  G: ShooterState,
  random: RandomAPI,
  brokenSite?: { x: number; y: number; w: number },
) {
  const alive = G.platforms.filter((p) => !p.broken);
  const w = Math.round((90 + Math.floor(random.float() * 30)) * PLATFORM_WIDTH_MUL);
  const maxH = MAX_JUMP_HEIGHT * JUMP_REACH_SAFE;
  const maxW = MAX_JUMP_WIDTH * JUMP_REACH_SAFE;

  let anchor: { x: number; y: number; w: number } | null = null;
  if (alive.length > 0) {
    if (brokenSite) {
      const bx = brokenSite.x + brokenSite.w / 2;
      const by = brokenSite.y;
      let bestDist = Infinity;
      for (const p of alive) {
        const d = Math.hypot(p.x + p.w / 2 - bx, p.y - by);
        if (d < bestDist) {
          bestDist = d;
          anchor = p;
        }
      }
    } else {
      anchor = random.pick(alive);
    }
  }

  const refX = brokenSite ? brokenSite.x + brokenSite.w / 2 : ARENA_W / 2;
  const refY = brokenSite ? brokenSite.y : FLOOR_Y - 80;
  const anchorLeft = anchor ? anchor.x : refX - 50;
  const anchorRight = anchor ? anchor.x + anchor.w : refX + 50;
  const anchorY = anchor ? anchor.y : refY;

  const yMin = Math.max(36, anchorY - maxH);
  const yMax = Math.min(FLOOR_Y - 36, anchorY + maxH * 0.35);
  const y = yMin + random.float() * Math.max(8, yMax - yMin);

  const side = random.bool() ? -1 : 1;
  const gap = 24 + random.float() * Math.max(8, maxW - 24);
  let x =
    side < 0
      ? anchorLeft - w - gap
      : anchorRight + gap;
  x = Math.max(16, Math.min(ARENA_W - w - 16, x));

  // Pull closer if clamping made the gap too large.
  if (anchor) {
    let edgeGap = platformEdgeGap({ x, w }, anchor);
    if (edgeGap > maxW) {
      if (x + w / 2 < anchor.x + anchor.w / 2) {
        x = anchor.x - w - maxW * 0.85;
      } else {
        x = anchor.x + anchor.w + maxW * 0.85;
      }
      x = Math.max(16, Math.min(ARENA_W - w - 16, x));
    }
  }

  const speed = 18 + random.float() * 18;
  const vx = random.bool() ? speed : -speed;
  const travel = 50 + random.float() * 110;
  let minX = x - travel * 0.5;
  let maxX = x + travel * 0.5;
  minX = Math.max(0, Math.min(minX, ARENA_W - w));
  maxX = Math.max(minX + 40, Math.min(ARENA_W - w, maxX));

  // Keep at least one travel position within jump reach of the anchor.
  if (anchor) {
    const closestX = Math.max(minX, Math.min(maxX, anchor.x));
    const probe = { x: closestX, w };
    if (platformEdgeGap(probe, anchor) > maxW) {
      const targetX = Math.max(
        16,
        Math.min(ARENA_W - w - 16, anchor.x + (random.bool() ? -maxW * 0.5 : maxW * 0.5)),
      );
      x = targetX;
      minX = Math.max(0, x - travel * 0.5);
      maxX = Math.min(ARENA_W - w, x + travel * 0.5);
      if (maxX - minX < 40) {
        minX = Math.max(0, x - 40);
        maxX = Math.min(ARENA_W - w, x + 40);
      }
    }
  }

  const id = G.nextPlatformId++;
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
    minX,
    maxX,
    ttlTicks: ELEVATOR_TTL_TICKS,
  };
  G.platforms.push(plat);
  createPlatformBody(plat);
}

function spawnReplacementElevator(G: ShooterState, random: RandomAPI, y: number, w: number) {
  if (!canSpawnIncomingElevator(G)) return;
  if (countElevatorsAtY(G, y) >= MAX_ELEVATORS_PER_Y_BAND) return;

  const fromLeft = random.bool();
  const platW = w || Math.round(100 * PLATFORM_WIDTH_MUL);
  const x = fromLeft ? -platW - 40 : ARENA_W + 40;
  const vx = fromLeft ? 27 : -27;
  const id = G.nextPlatformId++;

  const plat: PlatformState = {
    id,
    x,
    y,
    w: platW,
    h: 12,
    health: PLATFORM_MAX_HEALTH,
    maxHealth: PLATFORM_MAX_HEALTH,
    broken: false,
    kind: "elevator",
    vx,
    minX: fromLeft ? -platW - 160 : 0,
    maxX: fromLeft ? ARENA_W - platW : ARENA_W + 160,
    ttlTicks: ELEVATOR_TTL_TICKS,
  };

  G.platforms.push(plat);
}

function processPendingReplacementSpawns(G: ShooterState, random: RandomAPI) {
  for (let i = pendingReplacementSpawns.length - 1; i >= 0; i--) {
    pendingReplacementSpawns[i].ticksLeft -= 1;
    if (pendingReplacementSpawns[i].ticksLeft <= 0) {
      const { y, w } = pendingReplacementSpawns[i];
      spawnReplacementElevator(G, random, y, w);
      pendingReplacementSpawns.splice(i, 1);
    }
  }
}

function spawnIncomingElevator(G: ShooterState, random: RandomAPI) {
  if (!canSpawnIncomingElevator(G)) return;

  const mapDef = getMap(G.currentMapId);
  const y = pickSpawnY(G, mapDef.elevatorYLevels, random);
  if (y == null) return;

  const fromLeft = random.bool();
  const id = G.nextPlatformId++;
  const w = Math.round(100 * PLATFORM_WIDTH_MUL);
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
    minX: fromLeft ? -w - 160 : 0,
    maxX: fromLeft ? ARENA_W - w : ARENA_W + 160,
    ttlTicks: ELEVATOR_TTL_TICKS,
  };

  G.platforms.push(plat);
}

function runSpawnCycle(G: ShooterState, random: RandomAPI) {
  G.spawnTick += 1;
  if (G.spawnTick % SPAWN_INTERVAL_TICKS !== 0) return;

  spawnIncomingElevator(G, random);

  const elev = getRandomElevator(G, random);
  if (elev) {
    spawnPickupOnPlatform(G, elev, random);
    if (random.float() > 0.4) {
      const elev2 = getRandomElevator(G, random);
      if (elev2) spawnPickupOnPlatform(G, elev2, random);
    }
  }
}

function processPendingHits(G: ShooterState, random: RandomAPI) {
  for (const hit of pendingHits) {
    if (!hit.targetId) {
      if (hit.damage === 0) G.hitEvents.push(hit);
      continue;
    }

    const target = G.players[hit.targetId];
    if (!target) continue;

    if (target.health <= 0) {
      continue;
    }

    target.health = Math.max(0, target.health - hit.damage);
    G.hitEvents.push(hit);

    if (target.health <= 0) {
      freezePlayerBody(hit.targetId, target);
      continue;
    }
  }
  pendingHits.length = 0;

  for (const hit of pendingPlatformDamages) {
    damagePlatform(G, hit.id, hit.damage, hit.x, hit.y, random);
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

function isHeadshotHit(G: ShooterState, targetId: string, hitX: number, hitY: number, bullet?: BulletState): boolean {
  const target = G.players[targetId];
  if (!target) return false;
  
  if (Math.hypot(hitX - target.head.x, hitY - target.head.y) <= HEAD_HIT_RADIUS_PX) {
    return true;
  }
  
  if (bullet) {
    const speed = Math.hypot(bullet.vx, bullet.vy);
    if (speed > 0.01) {
      const nx = bullet.vx / speed;
      const ny = bullet.vy / speed;
      const fwdPx = 40; // Look ahead 40 pixels (1 tick of movement)
      const x2 = hitX + nx * fwdPx;
      const y2 = hitY + ny * fwdPx;
      if (distPointToSegment(target.head.x, target.head.y, hitX, hitY, x2, y2) <= HEAD_HIT_RADIUS_PX + 2) {
        return true;
      }
    }
  }
  
  return false;
}

function bulletHitsHeadZone(G: ShooterState, targetId: string, bullet: BulletState): boolean {
  const target = G.players[targetId];
  if (!target) return false;

  const bx = bullet.body.x;
  const by = bullet.body.y;
  if (isHeadshotHit(G, targetId, bx, by, bullet)) return true;

  const speed = Math.hypot(bullet.vx, bullet.vy);
  if (speed < 0.01) return false;

  const hx = target.head.x;
  const hy = target.head.y;
  const nx = bullet.vx / speed;
  const ny = bullet.vy / speed;

  const backPx = 88;
  const fwdPx = 14;
  const x1 = bx - nx * backPx;
  const y1 = by - ny * backPx;
  const x2 = bx + nx * fwdPx;
  const y2 = by + ny * fwdPx;

  if (distPointToSegment(hx, hy, x1, y1, x2, y2) <= HEAD_HIT_RADIUS_PX + 2) {
    return true;
  }

  const tx = target.torso.x;
  const ty = target.torso.y;
  const toHeadX = hx - tx;
  const toHeadY = hy - ty;
  const toHeadLen = Math.hypot(toHeadX, toHeadY) || 1;
  const aimDot = (nx * toHeadX + ny * toHeadY) / toHeadLen;
  const closeRange = Math.hypot(bx - hx, by - hy) <= HEAD_HIT_RADIUS_PX + PLAYER_W / 2 + 18;

  return closeRange && aimDot > 0.55;
}

function headHitPointPx(G: ShooterState, targetId: string): { x: number; y: number } | null {
  const target = G.players[targetId];
  if (!target) return null;
  return { x: target.head.x, y: target.head.y };
}

function resolveBulletPlayerDamage(
  G: ShooterState,
  targetId: string,
  hitPart: "player" | "head",
  bullet: BulletState,
  contactPx: { x: number; y: number } | null,
): { damage: number; isHeadshot: boolean } {
  const headshot =
    hitPart === "head" ||
    bulletHitsHeadZone(G, targetId, bullet) ||
    (contactPx != null && isHeadshotHit(G, targetId, contactPx.x, contactPx.y, bullet));

  if (headshot) {
    return { damage: HEADSHOT_DAMAGE, isHeadshot: true };
  }
  return { damage: BODY_BULLET_DAMAGE, isHeadshot: false };
}

function isPlayerGroundedPlanck(p: PlayerState, b: planck.Body, G?: ShooterState): boolean {
  if (Math.abs(p.vy) > 2 * SCALE) return false;
  for (let ce = b.getContactList(); ce; ce = ce.next) {
    const c = ce.contact;
    if (!c.isTouching()) continue;
    const fixA = c.getFixtureA();
    const fixB = c.getFixtureB();
    const playerFix = fixA.getBody() === b ? fixA : fixB;
    const fu = playerFix.getUserData() as { type?: string } | null;
    if (fu?.type === "head") continue;
    const wm = c.getWorldManifold(null);
    if (!wm) continue;
    const playerIsA = fixA.getBody() === b;
    const upNormal = playerIsA ? wm.normal.y : -wm.normal.y;
    if (upNormal < -0.5) return true;
  }
  if (G) {
    const feetY = getFeetY(p);
    for (const plat of G.platforms) {
      if (!plat.broken && isEntityOnPlatform(p.torso.x, feetY, plat, 12)) return true;
    }
    if (feetY >= FLOOR_Y - 14) return true;
  }
  return false;
}

function applyMovementInput(G: ShooterState, playerId: string, random: RandomAPI) {
  const p = G.players[playerId];
  if (!p || p.health <= 0 || !p.input) return;

  const data = p.input;
  const b = bodyMap.get("player_" + playerId);
  if (!b) return;

  preStepTorsoX.set(playerId, p.torso.x);

  const pos = b.getPosition();
  if (Math.abs(pos.x * SCALE - p.torso.x) > 0.1 || Math.abs(pos.y * SCALE - p.torso.y) > 0.1) {
    syncPlayerBodyTransform(p, b);
  }

  const v = b.getLinearVelocity();
  p.vx = v.x * SCALE;
  p.vy = v.y * SCALE;

  const wantCrouch = data.crouching === true || data.action === "crouch";
  const groundedBeforeCrouch = isPlayerGroundedPlanck(p, b, G);
  applyCrouchInput(p, b, wantCrouch, groundedBeforeCrouch);
  const grounded = isPlayerGroundedPlanck(p, b, G);
  p.grounded = grounded;
  
  const speedMul = p.crouching ? 0.45 : 1;
  let vx = p.vx;
  let vy = p.vy;

  if (data.action === "left") {
    vx = -MOVE_SPEED * speedMul;
  } else if (data.action === "right") {
    vx = MOVE_SPEED * speedMul;
  } else {
    vx = 0;
  }

  if (data.jumping) {
    const standingJump = canPerformStandingJump(G, playerId, p.crouching);
    if (standingJump || grounded) {
      vy = JUMP_VY;
      p.grounded = false;
    } else {
      // console.log("Did not jump");
    }
    data.jumping = false;
  }

  if (data.shooting) {
    fireWeapon(G, playerId, data.aimAngle, data.facing, random);
    vx = p.vx;
    vy = p.vy;
  }

  resolvePlayerPlatformSideOverlap(G, p, b);

  b.setAwake(true);
  b.setLinearVelocity(planck.Vec2(vx / SCALE, vy / SCALE));
  p.vx = vx;
  p.vy = vy;
}
function advanceWorld(G: ShooterState, random: RandomAPI) {
  setCurrentG(G);
  G.hitEvents = [];
  G.worldTick += 1;
  currentWorldTick = G.worldTick;

  if (G.roundPhase === "playing") {
    runSpawnCycle(G, random);
    processPendingReplacementSpawns(G, random);
    updatePickupDrops(G);
    
    world!.step(1 / 30);
    currentWorldTick = G.worldTick;
    
    for (const [id, p] of Object.entries(G.players)) {
      if (p.health <= 0) continue;
      const b = bodyMap.get("player_" + id);
      if (b) {
        const pos = b.getPosition();
        const v = b.getLinearVelocity();
        p.torso.x = pos.x * SCALE;
        p.torso.y = pos.y * SCALE;
        p.vx = v.x * SCALE;
        p.vy = v.y * SCALE;
        syncHeadFromTorso(p);
        p.grounded = isPlayerGroundedPlanck(p, b, G);
        syncPlayerOnPlatformId(G, p);
      }
    }

    clampPassivePlayerPush(G);
    
    for (const bullet of G.bullets) {
      const b = bodyMap.get("bullet_" + bullet.id);
      if (b) {
        const pos = b.getPosition();
        // console.log("Bullet Y:", pos.y * SCALE, "X:", pos.x * SCALE);
        const v = b.getLinearVelocity();
        bullet.body.x = pos.x * SCALE;
        bullet.body.y = pos.y * SCALE;
        bullet.vx = v.x * SCALE;
        bullet.vy = v.y * SCALE;
        bullet.body.angle = Math.atan2(bullet.vy, bullet.vx);

        if (bullet.fuseTicks != null) {
          bullet.fuseTicks -= 1;
          if (bullet.fuseTicks <= 0) {
            queueExplosion(bullet.body.x, bullet.body.y, bullet.aoeRadius ?? 70, bullet.damage, bullet.owner);
            pendingBulletDestroys.add(bullet.id);
          }
        }
        
        if (bullet.body.x < -20 || bullet.body.x > ARENA_W + 20 || bullet.body.y > ARENA_H + 20 || bullet.body.y < -20) {
          pendingBulletDestroys.add(bullet.id);
        }
      }
    }

    advancePlatformMotion(G, random);

    processExplosions(G);
    processPendingHits(G, random);
    fixOrphanedPickups(G);
    updatePickupDrops(G);
    collectPickupsForPlayers(G);
    checkRoundEnd(G);
  }
}
function resetRound(G: ShooterState) {
  handledBulletPlayerHitsThisStep.clear();
  G.bullets = [];
  G.crates = [];
  G.pickups = [];
  G.hitEvents = [];
  G.spawnTick = 0;
  G.worldTick = 0;
  pendingHits.length = 0;
  pendingPlatformDamages.length = 0;
  pendingCrateDamages.length = 0;
  pendingExplosions.length = 0;
  pendingReplacementSpawns.length = 0;
  pendingBulletDestroys.clear();
  initPlatforms(G);

  const mapDef = getMap(G.currentMapId);
  const spawns = mapDef.spawns;

  let index = 0;
  for (const [id, p] of Object.entries(G.players)) {
    const spawn = spawnOnFloor(spawns[index % spawns.length]);
    p.health = MAX_HEALTH;
    p.crouching = false;
    p.currentWeapon = START_WEAPON;
    p.ownedWeapons = defaultOwnedWeapons();
    p.lastFireTick = 0;
    p.torso = { x: spawn.x, y: spawn.y, angle: 0 };
    p.head = { x: spawn.x, y: spawn.y - HEAD_OFFSET, angle: 0 };
    p.input = {
      action: null,
      jumping: false,
      aimAngle: p.aimAngle,
      facing: p.facing,
      crouching: false,
      shooting: false,
    };
    createPlayerPhysics(p);
    index++;
  }
}

function countActiveProjectiles(G: ShooterState, owner: string, weaponId: WeaponId) {
  return G.bullets.filter((b) => b.owner === owner && b.weaponId === weaponId).length;
}

function fireWeapon(
  G: ShooterState,
  playerId: string,
  aimAngle: number,
  facing: number,
  random: RandomAPI,
) {
  const p = G.players[playerId];
  if (!p || p.health <= 0) { return false; }
  ensurePlayerPhysics(p);

  const weaponId = p.currentWeapon;
  const weapon = WEAPONS[weaponId];
  if (!weapon) { return false; }

  if (p.lastFireTick >= 0 && G.worldTick - p.lastFireTick < weapon.fireRateTicks) { return false; }

  const onGround = isPlayerGroundedPlanck(p, bodyMap.get("player_" + playerId)!, G);

  if (weapon.kind === "melee") {
    applyRecoil(p, aimAngle, onGround, p.crouching, weaponId);
    resolveMeleeSwingHits(G, playerId, aimAngle, facing, weapon);
    p.lastFireTick = G.worldTick;
    return true;
  }

  const pellets = weapon.pelletCount ?? 1;
  const activeCount = G.bullets.filter((b) => b.owner === playerId).length;
  if (activeCount + pellets > weapon.maxActive) {
    if (activeCount >= weapon.maxActive) { return false; }
  }

  const weaponActive = countActiveProjectiles(G, playerId, weaponId);
  if (weaponActive >= weapon.maxActive) { return false; }

  applyRecoil(p, aimAngle, onGround, p.crouching, weaponId);

  for (let i = 0; i < pellets; i++) {
    if (G.bullets.filter((b) => b.owner === playerId).length >= weapon.maxActive) break;
    const spread = (random.float() - 0.5) * weapon.spread * 2;
    const shotAngle = aimAngle + spread;
    const muzzle = computeMuzzlePx(
      p.torso.x,
      p.torso.y,
      shotAngle,
      facing,
      p.crouching,
      weaponId,
    );
    spawnProjectile(G, playerId, weaponId, weapon, muzzle.x, muzzle.y, shotAngle);
  }

  p.lastFireTick = G.worldTick;
  // spawned
  return true;
}

export default defineGame<ShooterState>({
  name: "counter-stick",
  meta: {
    displayName: "Counter Stick",
    categories: ["action"],
  },
  minPlayers: 2,
  maxPlayers: 4,

  // @ts-ignore - Force real-time mode for the production build
  realtime: {
    tick: true,
    tickRate: TICK_RATE,
  },

  initialActive: (G) => Object.keys(G.players),

  // @ts-ignore
  tick: (G: ShooterState, dt: number | undefined, ctx: TickContext) => {
    try {
      setCurrentG(G);

      const steps = PHYSICS_STEPS_PER_TICK;

      for (let i = 0; i < steps; i++) {
        if (G.roundPhase === "intermission") {
          G.intermissionTicksLeft -= 1;
          if (G.intermissionTicksLeft <= 0) {
            startNextRound(G);
          }
        } else {
          for (const playerId of Object.keys(G.players)) {
            applyMovementInput(G, playerId, ctx.random);
          }
          advanceWorld(G, ctx.random);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.stack ?? err.message : String(err);
      ctx.emit("debug", { message: `WASM CRASH (tick): ${message}` });
    }
  },

  setup: (ctx) => {
    // Setup called
    try {
    const gameMode = parseGameConfig(ctx.config);
    if (gameMode === "teams2v2" && ctx.numPlayers !== 4) {
      throw new Error("teams2v2 requires exactly 4 players");
    }

    handledBulletPlayerHitsThisStep.clear();
    pendingHits.length = 0;
    pendingPlatformDamages.length = 0;
    pendingCrateDamages.length = 0;
    pendingExplosions.length = 0;
    pendingBulletDestroys.clear();

    const players: Record<string, PlayerState> = {};
    const teams = gameMode === "teams2v2" ? assignTeams(ctx.players) : {};
    const mapDef = getMap("default");
    const spawns = mapDef.spawns;

    ctx.players.forEach((id, index) => {
      const spawn = spawnOnFloor(spawns[index % spawns.length]);
      const team = gameMode === "teams2v2" ? teams[id] : undefined;
      players[id] = {
        health: MAX_HEALTH,
        aimAngle: 0,
        facing: 1,
        crouching: false,
        currentWeapon: START_WEAPON,
        ownedWeapons: defaultOwnedWeapons(),
        lastFireTick: -1,
        torso: { x: spawn.x, y: spawn.y, angle: 0 },
        head: { x: spawn.x, y: spawn.y - HEAD_OFFSET, angle: 0 },
        vx: 0,
        vy: 0,
        grounded: false,
        wallJumpUsed: false,
        jumpGrace: 0,
        team,
      };
    });

    const G: ShooterState = {
      consts: buildSharedConsts(),
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
      scores: initScores(ctx.players, gameMode),
      hitEvents: [],
      gameMode,
      teams,
      currentMapId: "default",
      currentRound: 1,
      roundPhase: "playing",
      intermissionTicksLeft: 0,
      lastRoundWinner: null,
      matchPhase: "active",
      roundsToWin: parseRoundsToWin(ctx.config),
    };
    initPlatforms(G);
    setCurrentG(G);
    return G;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.stack ?? err.message : String(err);
      throw new Error(`WASM INIT (setup): ${message}`);
    }
  },

  moves: {
    input: (G, payload, ctx) => {
      try {
        setCurrentG(G);
        const p = G.players[ctx.playerId];
        if (!p || p.health <= 0) return;

        const data = payload as unknown as PlayerInput;
        p.input = {
          action: data.action ?? null,
          jumping: !!data.jumping,
          aimAngle: typeof data.aimAngle === "number" ? data.aimAngle : p.aimAngle,
          facing: typeof data.facing === "number" ? (data.facing >= 0 ? 1 : -1) : p.facing,
          crouching: !!data.crouching,
          shooting: !!data.shooting,
        };
        p.aimAngle = p.input.aimAngle;
        p.facing = p.input.facing;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        ctx.log(`WASM CRASH (input): ${message}`);
      }
    },
    switchWeapon: (G, payload, ctx) => {
      try {
        setCurrentG(G);
        if (G.roundPhase === "intermission") return;

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
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        ctx.log(`WASM CRASH (switchWeapon): ${message}`);
        return INVALID_MOVE;
      }
    },
  },
  endIf: (G) => buildMatchResult(G),

  enumerate: (G, playerId) => {
    const p = G.players[playerId];
    if (!p || p.health <= 0 || G.roundPhase === "intermission") return [];
    return [
      {
        type: "input",
        payload: {
          action: null,
          jumping: false,
          aimAngle: p.aimAngle,
          facing: p.facing,
          crouching: false,
          shooting: false,
        },
      },
    ];
  },
});

export const testUtils = {
  breakPlatform: (G: ShooterState, id: number) => breakPlatform(G, id),
  breakPlatformWithReplacement: (G: ShooterState, id: number) =>
    breakPlatform(G, id, {
      float: () => 0.5,
      bool: () => true,
      pick: <T>(arr: readonly T[]) => arr[0],
      int: (min: number) => min,
      die: () => 1,
      dice: () => 1,
      shuffle: <T>(arr: T[]) => [...arr],
    } as unknown as RandomAPI),
  computeMuzzlePx,
  killPlayer: (G: ShooterState, id: string) => {
    const p = G.players[id];
    if (!p) return;
    p.health = 0;
    freezePlayerBody(id, p);
  },
  playerFixtureCount: (playerId: string) => {
    const b = bodyMap.get("player_" + playerId);
    if (!b) return 0;
    let count = 0;
    for (let fix = b.getFixtureList(); fix; fix = fix.getNext()) count += 1;
    return count;
  },
  startNextRound: (G: ShooterState) => startNextRound(G),
  platformBodyCount: () => 0,
  canDamage: (G: ShooterState, attackerId: string, targetId: string) =>
    canDamage(G, attackerId, targetId),
  resolveBulletPlayerDamage: (
    G: ShooterState,
    targetId: string,
    hitPart: "player" | "head",
    bullet: BulletState,
    contactPx: { x: number; y: number } | null,
  ) => resolveBulletPlayerDamage(G, targetId, hitPart, bullet, contactPx).damage,
  isHeadshotHit: (G: ShooterState, targetId: string, hitX: number, hitY: number, bullet?: BulletState) =>
    isHeadshotHit(G, targetId, hitX, hitY, bullet),
  bulletHitsHeadZone: (G: ShooterState, targetId: string, bullet: BulletState) =>
    bulletHitsHeadZone(G, targetId, bullet),
};
