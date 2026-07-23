import {
  defineGame,
  INVALID_MOVE,
  type GameResult,
  type Json,
  type RandomAPI,
  type TickContext,
} from "@bordiko/sdk";

import {
  checkBulletWall,
  checkCircleAABB,
  resolvePlayerPlatform,
  stepBullet,
  stepPlayer,
  type AABB,
  type ArcadePlatform,
  type ArcadePlayer,
} from "./arcade-physics.ts";
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
  gameMode: GameMode;
  teams: Record<string, TeamId>;
  currentMapId: MapId;
  currentRound: number;
  roundPhase: RoundPhase;
  intermissionTicksLeft: number;
  lastRoundWinner: string | null;
  matchPhase: MatchPhase;
}

export const ROUNDS_TO_WIN = 3;
const INTERMISSION_TICKS = 120;
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
const PHYSICS_STEPS_PER_TICK = PHYSICS_HZ / 30;
const MOVE_SPEED = 15 * SCALE;
const JUMP_VY = -34 * SCALE;
/** Target peak height = jump × this (impulse uses √ratio for energy scaling). */
const RECOIL_HEIGHT_OF_JUMP = 0.9;
const GRAVITY = 97.5 * SCALE;
const WALL_JUMP_IMPULSE_X = 11 * SCALE;
const BULLET_SPEED = 40 * SCALE;
const BULLET_GRAVITY_SCALE = 0.62;
const PLAYER_W = PLAYER_HALF_W * SCALE * 2;
const PLAYER_H = PLAYER_HALF_H * SCALE * 2;
const FEET_PIXELS = PLAYER_H / 2;
const GROUNDED_VEL_Y = 12 * SCALE;
const RECOIL_IMPULSE = 34 * SCALE * Math.sqrt(RECOIL_HEIGHT_OF_JUMP);
const PLATFORM_HITS_TO_BREAK = 4;
const PLATFORM_MAX_HEALTH = WEAPONS.winchester.damage * PLATFORM_HITS_TO_BREAK;
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
const STICK_CROUCH_DROP_PX = 46;
const GUN_BARREL_PX = 23;
const GUN_TIP_PX = 2.4;

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
let currentG: ShooterState | null = null;

const FLOOR_AABB: AABB = { x: 0, y: FLOOR_Y, w: ARENA_W, h: 1 };
const LEFT_WALL_AABB: AABB = { x: -1, y: 0, w: 1, h: ARENA_H };
const RIGHT_WALL_AABB: AABB = { x: ARENA_W, y: 0, w: 1, h: ARENA_H };
const CEILING_AABB: AABB = { x: 0, y: -1, w: ARENA_W, h: 1 };

function setCurrentG(G: ShooterState) {
  currentG = G;
}

function parseGameConfig(config?: Json): GameMode {
  const mode = (config as GameConfig | undefined)?.mode;
  return mode === "teams2v2" ? "teams2v2" : "ffa";
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

  if ((G.scores[winner] ?? 0) >= ROUNDS_TO_WIN) {
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
  if (maxScore < ROUNDS_TO_WIN) return;

  if (G.gameMode === "ffa") {
    const winner = Object.entries(G.scores).find(([, s]) => s >= ROUNDS_TO_WIN)?.[0];
    if (!winner) return;
    return { winner, scores: G.scores, reason: "best-of-5" };
  }

  const winningTeam = Object.entries(G.scores).find(([, s]) => s >= ROUNDS_TO_WIN)?.[0];
  if (winningTeam == null) return;
  const winners = Object.entries(G.teams)
    .filter(([, team]) => String(team) === winningTeam)
    .map(([id]) => id);
  return { winners, scores: G.scores, reason: "best-of-5" };
}

function isPlayerAlive(G: ShooterState, id: string): boolean {
  const p = G.players[id];
  return !!p && p.health > 0;
}

function toPlatformArcade(plat: PlatformState): ArcadePlatform {
  return {
    x: plat.x,
    y: plat.y,
    w: plat.w,
    h: plat.h,
    vx: plat.vx,
    isElevator: plat.kind === "elevator",
  };
}

function syncHeadFromTorso(p: PlayerState) {
  p.head = { x: p.torso.x, y: p.torso.y - HEAD_OFFSET, angle: 0 };
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

function getFeetY(p: PlayerState): number {
  return p.torso.y + PLAYER_H / 2;
}

function playerTorsoAABB(p: PlayerState): AABB {
  return {
    x: p.torso.x - PLAYER_W / 2,
    y: p.torso.y - PLAYER_H / 2,
    w: PLAYER_W,
    h: PLAYER_H,
  };
}

function initPlatforms(G: ShooterState) {
  const mapDef = getMap(G.currentMapId);
  G.platforms = mapDef.platforms.map((def) => ({
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

function breakPlatform(G: ShooterState, id: number) {
  const plat = G.platforms.find((p) => p.id === id);
  if (!plat || plat.broken) return;
  plat.broken = true;
  plat.health = 0;
  releasePickupsFromPlatform(G, id, plat);
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

function destroyBullet(G: ShooterState, bulletId: number) {
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

function advancePlatformMotion(G: ShooterState) {
  const dt = PHYSICS_DT;

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
    applyPlatformRiderDelta(G, plat, dx);
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
  return getFeetY(p) >= FLOOR_Y - 14;
}

function applyVerticalJump(p: PlayerState, opts: { keepVx?: number; horizImpulse?: number } = {}) {
  const horiz = opts.horizImpulse ?? 0;
  p.vx = horiz !== 0 ? horiz : (opts.keepVx ?? 0);
  p.vy = JUMP_VY;
  p.grounded = false;
  p.jumpGrace = 8;
}

function scanPlayerWallContact(G: ShooterState, playerId: string) {
  const p = G.players[playerId];
  if (!p) return null;
  const box = playerTorsoAABB(p);
  const headY = p.head.y;

  if (box.x <= 1) return { nx: 1, ny: 0 };
  if (box.x + box.w >= ARENA_W - 1) return { nx: -1, ny: 0 };

  for (const plat of G.platforms) {
    if (plat.broken) continue;
    const platBox: AABB = { x: plat.x, y: plat.y - plat.h, w: plat.w, h: plat.h };
    if (box.x + box.w > platBox.x && box.x < platBox.x + platBox.w) {
      if (headY <= platBox.y + platBox.h + 2 && box.y + box.h > platBox.y + platBox.h) continue;
    }
    if (Math.abs(box.x + box.w - platBox.x) <= 3 && box.y + box.h > platBox.y + 4) {
      return { nx: -1, ny: 0 };
    }
    if (Math.abs(box.x - (platBox.x + platBox.w)) <= 3 && box.y + box.h > platBox.y + 4) {
      return { nx: 1, ny: 0 };
    }
  }
  return null;
}

function updatePlayerWallContacts(G: ShooterState) {
  for (const [id, p] of Object.entries(G.players)) {
    if (!isPlayerAlive(G, id)) continue;
    if (isPlayerGrounded(p)) {
      p.wallJumpUsed = false;
    }
  }
}

function resolvePlayerWalls(player: ArcadePlayer) {
  const halfW = player.w / 2;
  if (player.x - halfW < 0) {
    player.x = halfW;
    player.vx = Math.max(0, player.vx);
  }
  if (player.x + halfW > ARENA_W) {
    player.x = ARENA_W - halfW;
    player.vx = Math.min(0, player.vx);
  }
  const halfH = player.h / 2;
  if (player.y - halfH < 0) {
    player.y = halfH;
    player.vy = Math.max(0, player.vy);
  }
}

function resolvePlayerSideStick(G: ShooterState) {
  for (const [id, p] of Object.entries(G.players)) {
    if (!isPlayerAlive(G, id)) continue;
    if (isPlayerGrounded(p)) continue;
    if (p.jumpGrace > 0) continue;
    if (p.vy < -2 * SCALE) continue;

    const wall = scanPlayerWallContact(G, id);
    if (wall && Math.abs(wall.nx) > 0.5) {
      p.vx *= 0.2;
      if (p.vy >= 0) p.vy = Math.max(p.vy, 5 * SCALE);
    }
  }

  for (const p of Object.values(G.players)) {
    if (p.jumpGrace > 0) p.jumpGrace -= 1;
  }
}

function stepArcadePlayers(G: ShooterState) {
  for (const [id, p] of Object.entries(G.players)) {
    if (!isPlayerAlive(G, id)) continue;
    ensurePlayerPhysics(p);

    const player: ArcadePlayer = {
      x: p.torso.x,
      y: p.torso.y,
      w: PLAYER_W,
      h: PLAYER_H,
      vx: p.vx,
      vy: p.vy,
      grounded: false,
    };

    stepPlayer(player, PHYSICS_DT, GRAVITY);
    resolvePlayerPlatform(player, FLOOR_AABB);
    for (const plat of G.platforms) {
      if (!plat.broken) resolvePlayerPlatform(player, toPlatformArcade(plat));
    }
    resolvePlayerWalls(player);

    p.torso.x = player.x;
    p.torso.y = player.y;
    p.vx = player.vx;
    p.vy = player.vy;
    p.grounded = player.grounded;
    syncHeadFromTorso(p);
  }
}

function bulletRadiusForKind(kind: BulletState["kind"]): number {
  if (kind === "rocket") return 0.11 * SCALE;
  if (kind === "grenade") return 0.09 * SCALE;
  if (kind === "pellet") return 0.05 * SCALE;
  return 0.07 * SCALE;
}

function syncStateFromPhysics(_G: ShooterState) {
  /* state is authoritative in arcade mode */
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

  const speed = (weapon.speed || BULLET_SPEED / SCALE) * SCALE;
  const gravityScale = weapon.gravityScale ?? BULLET_GRAVITY_SCALE;
  const r = bulletRadiusForKind(kind);

  G.bullets.push({
    id: bulletId,
    owner,
    body: { x: startX, y: startY, angle: shotAngle },
    kind,
    weaponId,
    damage: weapon.damage,
    aoeRadius: weapon.aoeRadius,
    fuseTicks: weapon.fuseTicks,
    vx: Math.cos(shotAngle) * speed,
    vy: Math.sin(shotAngle) * speed,
    r,
    gravityScale,
  });
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
  let impulseMag = RECOIL_IMPULSE * weaponScale;
  if (crouching && onGround) impulseMag *= 0.45;

  p.vx += -Math.cos(aimAngle) * impulseMag;
  p.vy += -Math.sin(aimAngle) * impulseMag;
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

function spawnIncomingElevator(G: ShooterState, random: RandomAPI) {
  const fromLeft = random.bool();
  const mapDef = getMap(G.currentMapId);
  const yChoices = mapDef.elevatorYLevels;
  const y = yChoices.length ? random.pick(yChoices) : 273;
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

function processPendingHits(G: ShooterState) {
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
      continue;
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

function isHeadshotHit(G: ShooterState, targetId: string, hitX: number, hitY: number): boolean {
  const target = G.players[targetId];
  if (!target) return false;
  return Math.hypot(hitX - target.head.x, hitY - target.head.y) <= HEAD_HIT_RADIUS_PX;
}

function bulletHitsHeadZone(G: ShooterState, targetId: string, bullet: BulletState): boolean {
  const target = G.players[targetId];
  if (!target) return false;

  const bx = bullet.body.x;
  const by = bullet.body.y;
  if (isHeadshotHit(G, targetId, bx, by)) return true;

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
    (contactPx != null && isHeadshotHit(G, targetId, contactPx.x, contactPx.y));

  if (headshot) {
    return { damage: HEADSHOT_DAMAGE, isHeadshot: true };
  }
  return { damage: BODY_BULLET_DAMAGE, isHeadshot: false };
}

function bulletHitsSolid(G: ShooterState, b: BulletState): boolean {
  const circle = { x: b.body.x, y: b.body.y, r: b.r };
  if (checkBulletWall(circle, FLOOR_AABB)) return true;
  if (checkBulletWall(circle, LEFT_WALL_AABB)) return true;
  if (checkBulletWall(circle, RIGHT_WALL_AABB)) return true;
  if (checkBulletWall(circle, CEILING_AABB)) return true;

  for (const plat of G.platforms) {
    if (plat.broken) continue;
    const platBox: AABB = { x: plat.x, y: plat.y - plat.h, w: plat.w, h: plat.h };
    if (checkBulletWall(circle, platBox)) return true;
  }

  for (const crate of G.crates) {
    const crateBox: AABB = { x: crate.x, y: crate.y, w: crate.w, h: crate.h };
    if (checkBulletWall(circle, crateBox)) return true;
  }

  return false;
}

function stepArcadeBullets(G: ShooterState) {
  handledBulletPlayerHitsThisStep.clear();

  for (const b of [...G.bullets]) {
    if (pendingBulletDestroys.has(b.id)) continue;

    const bulletState = { x: b.body.x, y: b.body.y, r: b.r, vx: b.vx, vy: b.vy };
    stepBullet(bulletState, PHYSICS_DT, GRAVITY, b.gravityScale);
    b.body.x = bulletState.x;
    b.body.y = bulletState.y;
    b.vx = bulletState.vx;
    b.vy = bulletState.vy;
    b.body.angle = Math.atan2(b.vy, b.vx);

    if (b.fuseTicks != null) {
      b.fuseTicks -= 1;
      if (b.fuseTicks <= 0) {
        queueExplosion(b.body.x, b.body.y, b.aoeRadius ?? 70, b.damage, b.owner);
        pendingBulletDestroys.add(b.id);
        continue;
      }
    }

    if (b.kind === "rocket" || b.kind === "grenade") {
      if (bulletHitsSolid(G, b)) {
        queueExplosion(b.body.x, b.body.y, b.aoeRadius ?? 70, b.damage, b.owner);
        pendingBulletDestroys.add(b.id);
        continue;
      }
    } else {
      const circle = { x: b.body.x, y: b.body.y, r: b.r };

      if (checkBulletWall(circle, FLOOR_AABB)) {
        pendingHits.push({ x: b.body.x, y: b.body.y, targetId: "", damage: 0 });
        pendingBulletDestroys.add(b.id);
        continue;
      }
      if (checkBulletWall(circle, LEFT_WALL_AABB) || checkBulletWall(circle, RIGHT_WALL_AABB) || checkBulletWall(circle, CEILING_AABB)) {
        pendingHits.push({ x: b.body.x, y: b.body.y, targetId: "", damage: 0 });
        pendingBulletDestroys.add(b.id);
        continue;
      }

      for (const plat of G.platforms) {
        if (plat.broken) continue;
        const platBox: AABB = { x: plat.x, y: plat.y - plat.h, w: plat.w, h: plat.h };
        if (!checkBulletWall(circle, platBox)) continue;
        pendingBulletDestroys.add(b.id);
        pendingPlatformDamages.push({ id: plat.id, damage: b.damage, x: b.body.x, y: b.body.y });
        break;
      }
      if (pendingBulletDestroys.has(b.id)) continue;

      for (const crate of G.crates) {
        const crateBox: AABB = { x: crate.x, y: crate.y, w: crate.w, h: crate.h };
        if (!checkBulletWall(circle, crateBox)) continue;
        pendingBulletDestroys.add(b.id);
        pendingCrateDamages.push({ id: crate.id, damage: b.damage, x: b.body.x, y: b.body.y });
        break;
      }
      if (pendingBulletDestroys.has(b.id)) continue;

      for (const [targetId, target] of Object.entries(G.players)) {
        if (targetId === b.owner || target.health <= 0 || !isPlayerAlive(G, targetId)) continue;
        if (G.roundPhase !== "playing") continue;
        if (!canDamage(G, b.owner, targetId)) continue;
        if (handledBulletPlayerHitsThisStep.has(String(b.id))) continue;

        const headHit = checkCircleAABB(circle, {
          x: target.head.x - HEAD_HIT_RADIUS_PX,
          y: target.head.y - HEAD_HIT_RADIUS_PX,
          w: HEAD_HIT_RADIUS_PX * 2,
          h: HEAD_HIT_RADIUS_PX * 2,
        });
        const torsoHit = checkCircleAABB(circle, playerTorsoAABB(target));
        if (!headHit && !torsoHit) continue;

        handledBulletPlayerHitsThisStep.add(String(b.id));
        pendingBulletDestroys.add(b.id);
        const hitPart = headHit ? "head" : "player";
        const { damage, isHeadshot } = resolveBulletPlayerDamage(
          G,
          targetId,
          hitPart,
          b,
          { x: b.body.x, y: b.body.y },
        );
        const headPoint = isHeadshot ? headHitPointPx(G, targetId) : null;
        pendingHits.push({
          x: headPoint?.x ?? b.body.x,
          y: headPoint?.y ?? b.body.y,
          targetId,
          damage,
          isHeadshot,
        });
        break;
      }
    }

    if (
      b.body.x < -20 ||
      b.body.x > ARENA_W + 20 ||
      b.body.y > ARENA_H + 20 ||
      b.body.y < -20
    ) {
      pendingBulletDestroys.add(b.id);
    }
  }
}

function applyMovementInput(G: ShooterState, playerId: string, random: RandomAPI) {
  const p = G.players[playerId];
  if (!p || p.health <= 0 || !p.input) return;
  ensurePlayerPhysics(p);

  const data = p.input;
  const crouching = data.crouching === true || data.action === "crouch";
  const grounded = isPlayerGrounded(p);
  p.crouching = crouching && grounded;
  const speedMul = p.crouching ? 0.45 : 1;

  if (data.action === "left") {
    p.vx = -MOVE_SPEED * speedMul;
  } else if (data.action === "right") {
    p.vx = MOVE_SPEED * speedMul;
  } else if (data.action === "crouch" || (crouching && !data.action)) {
    p.vx *= 0.35;
  } else {
    p.vx = 0;
  }

  if (data.jumping) {
    const wall = scanPlayerWallContact(G, playerId);
    const standingJump = canPerformStandingJump(G, playerId, p.crouching);

    if (standingJump) {
      applyVerticalJump(p, { keepVx: p.vx });
      p.wallJumpUsed = false;
    } else if (wall && !p.wallJumpUsed) {
      const awayX = wall.nx >= 0 ? 1 : -1;
      applyVerticalJump(p, { horizImpulse: WALL_JUMP_IMPULSE_X * awayX });
      p.wallJumpUsed = true;
    }
    data.jumping = false;
  }

  if (data.shooting) {
    fireWeapon(G, playerId, data.aimAngle, data.facing, random);
  }

  if (
    data.action !== "left" &&
    data.action !== "right" &&
    data.action !== "crouch" &&
    !(crouching && !data.action)
  ) {
    if (Math.abs(p.vx) > 0.05) p.vx = 0;
  }
}

function advanceWorld(G: ShooterState, random: RandomAPI) {
  setCurrentG(G);
  G.hitEvents = [];
  G.worldTick += 1;

  if (G.roundPhase === "playing") {
    runSpawnCycle(G, random);
    advancePlatformMotion(G);
    updatePickupDrops(G);
    stepArcadePlayers(G);
    updatePlayerWallContacts(G);
    resolvePlayerSideStick(G);
    stepArcadeBullets(G);
    processExplosions(G);
    processPendingHits(G);
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
  if (!p || p.health <= 0) return false;
  ensurePlayerPhysics(p);

  const weaponId = p.currentWeapon;
  const weapon = WEAPONS[weaponId];
  if (!weapon) return false;

  if (p.lastFireTick >= 0 && G.worldTick - p.lastFireTick < weapon.fireRateTicks) return false;

  const onGround = isPlayerGrounded(p);

  if (weapon.kind === "melee") {
    applyRecoil(p, aimAngle, onGround, p.crouching, weaponId);
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

  applyRecoil(p, aimAngle, onGround, p.crouching, weaponId);

  const muzzle = computeMuzzlePx(
    p.torso.x,
    p.torso.y,
    aimAngle,
    facing,
    p.crouching,
    weaponId,
  );

  const spawnPad = 0.38 * SCALE;
  for (let i = 0; i < pellets; i++) {
    if (G.bullets.filter((b) => b.owner === playerId).length >= weapon.maxActive) break;
    const spread = (random.float() - 0.5) * weapon.spread * 2;
    const shotAngle = aimAngle + spread;
    const startX = muzzle.x + Math.cos(shotAngle) * spawnPad;
    const startY = muzzle.y + Math.sin(shotAngle) * spawnPad;
    spawnProjectile(G, playerId, weaponId, weapon, startX, startY, shotAngle);
  }

  p.lastFireTick = G.worldTick;
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
    tickRate: 30,
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
  killPlayer: (G: ShooterState, id: string) => {
    const p = G.players[id];
    if (!p) return;
    p.health = 0;
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
  isHeadshotHit: (G: ShooterState, targetId: string, hitX: number, hitY: number) =>
    isHeadshotHit(G, targetId, hitX, hitY),
  bulletHitsHeadZone: (G: ShooterState, targetId: string, bullet: BulletState) =>
    bulletHitsHeadZone(G, targetId, bullet),
};
