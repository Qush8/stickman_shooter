import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createMatch,
  applyMove,
  applyTick,
  type CreateMatchOptions,
  type MatchState,
} from "@bordiko/sdk";
import game, {
  ROUNDS_TO_WIN,
  WEAPON_ORDER,
  testUtils,
  type ShooterState,
} from "../src/game.ts";

const bootMatch = (opts: CreateMatchOptions) => createMatch(game, opts);

const assertMoveOk = (r: { ok: boolean; error?: string }) => {
  assert.ok(r.ok, r.error ?? "move failed");
};

const TICK_DT_MS = 1000 / 30;

const advanceTicks = (m: MatchState<ShooterState>, ticks: number) => {
  let state = m;
  for (let i = 0; i < ticks; i++) {
    const result = applyTick(game, state, TICK_DT_MS);
    assert.ok(result.ok, result.error ?? "tick failed");
    state = result.state;
  }
  return state;
};

test("a player spawns with correct health and weapon", () => {
  const m = bootMatch( { players: ["p1", "p2"], seed: "t1" });
  assert.equal(m.G.players["p1"].health, 1000);
  assert.equal(m.G.players["p2"].health, 1000);
  assert.equal(m.G.players["p1"].currentWeapon, "winchester");
  assert.deepEqual(m.G.players["p1"].ownedWeapons, ["winchester"]);
  assert.ok(m.G.players["p1"].torso);
  assert.ok(m.G.platforms.some((p) => p.kind === "elevator"));
});

test("move updates player position via physics sync", () => {
  let m = bootMatch({ players: ["p1", "p2"], seed: "t2" });

  const startX = m.G.players["p1"].torso.x;
  const r = applyMove(game, m, {
    type: "input",
    playerId: "p1",
    payload: { action: "right", aimAngle: 0, crouching: false, shooting: false },
  });
  assertMoveOk(r);

  m = r.state;
  m = advanceTicks(m, 1);
  assert.ok(m.G.players["p1"].torso.x >= startX);
});

test("jump updates player position upwards", () => {
  let m = bootMatch({ players: ["p1", "p2"], seed: "t2_jump" });

  // Let them fall to the ground first
  m = advanceTicks(m, 30);

  const startY = m.G.players["p1"].torso.y;
  const r = applyMove(game, m, {
    type: "input",
    playerId: "p1",
    payload: { action: null, jumping: true, aimAngle: 0, crouching: false, shooting: false },
  });
  assertMoveOk(r);

  m = r.state;
  m = advanceTicks(m, 1);
  assert.ok(m.G.players["p1"].torso.y < startY - 10, `Player should have moved up after jump tick. Start Y: ${startY}, End Y: ${m.G.players["p1"].torso.y}`);
});

test("shoot spawns a bullet for winchester", () => {
  let m = bootMatch({ players: ["p1", "p2"], seed: "t3" });

  assert.equal(m.G.bullets.length, 0);

  const r = applyMove(game, m, {
    type: "input",
    playerId: "p1",
    payload: { action: null, aimAngle: 0, crouching: false, shooting: true },
  });
  assertMoveOk(r);

  m = r.state;
  m = advanceTicks(m, 1);
  assert.equal(m.G.bullets.length, 1);
  assert.equal(m.G.bullets[0].owner, "p1");
  assert.equal(m.G.bullets[0].weaponId, "winchester");
});

test("switchWeapon rejects unowned weapon", () => {
  const m = bootMatch( { players: ["p1", "p2"], seed: "t5" });

  const r = applyMove(game, m, {
    type: "switchWeapon",
    playerId: "p1",
    payload: { weaponId: "sniper" },
  });
  assert.equal(r.ok, false);
  assert.equal(m.G.players["p1"].currentWeapon, "winchester");
});

test("switchWeapon updates current weapon when owned", () => {
  let m = bootMatch( { players: ["p1", "p2"], seed: "t5-owned" });
  m.G.players["p1"].ownedWeapons.push("sniper");

  const r = applyMove(game, m, {
    type: "switchWeapon",
    playerId: "p1",
    payload: { weaponId: "sniper" },
  });
  assertMoveOk(r);

  m = r.state;
  assert.equal(m.G.players["p1"].currentWeapon, "sniper");
});

test("shotgun spawns multiple pellets", () => {
  let m = bootMatch( { players: ["p1", "p2"], seed: "t6" });
  m.G.players["p1"].ownedWeapons.push("winchester_shotgun");

  m = applyMove(game, m, {
    type: "switchWeapon",
    playerId: "p1",
    payload: { weaponId: "winchester_shotgun" },
  }).state;

  const r = applyMove(game, m, {
    type: "input",
    playerId: "p1",
    payload: { action: null, aimAngle: 0, crouching: false, shooting: true },
  });
  assertMoveOk(r);

  m = r.state;
  m = advanceTicks(m, 1);
  assert.equal(m.G.bullets.length, 6);
  assert.ok(m.G.bullets.every((b) => b.kind === "pellet"));
});

test("elevator platform x changes over ticks", () => {
  let m = bootMatch( { players: ["p1", "p2"], seed: "t7" });
  const elevator = m.G.platforms.find((p) => p.id === 1 && p.kind === "elevator");
  assert.ok(elevator);
  const startX = elevator!.x;

  m = advanceTicks(m, 5);

  const moved = m.G.platforms.find((p) => p.id === 1);
  assert.ok(moved);
  assert.notEqual(moved!.x, startX);
});

test("weapon cycle only switches owned weapons", () => {
  let m = bootMatch( { players: ["p1", "p2"], seed: "t8" });

  const blocked = applyMove(game, m, {
    type: "switchWeapon",
    playerId: "p1",
    payload: { cycle: true },
  });
  assert.equal(blocked.ok, false);

  m.G.players["p1"].ownedWeapons.push("sniper", "auto");
  m = applyMove(game, m, {
    type: "switchWeapon",
    playerId: "p1",
    payload: { cycle: true },
  }).state;
  assert.equal(m.G.players["p1"].currentWeapon, "sniper");

  m = applyMove(game, m, {
    type: "switchWeapon",
    playerId: "p1",
    payload: { cycle: true },
  }).state;
  assert.equal(m.G.players["p1"].currentWeapon, "auto");

  m = applyMove(game, m, {
    type: "switchWeapon",
    playerId: "p1",
    payload: { cycle: true },
  }).state;
  assert.equal(m.G.players["p1"].currentWeapon, "winchester");
});

test("pickup falls when platform beneath it is destroyed", () => {
  let m = bootMatch( { players: ["p1", "p2"], seed: "fall-pickup" });
  const plat = m.G.platforms.find((p) => p.id === 1);
  assert.ok(plat);

  m.G.pickups.push({
    id: 99,
    kind: "health",
    x: plat!.x + plat!.w / 2,
    y: plat!.y - 20,
    onPlatformId: plat!.id,
  });
  const yBefore = m.G.pickups[0]!.y;

  testUtils.breakPlatform(m.G, plat!.id);

  let pickup = m.G.pickups.find((p) => p.id === 99);
  assert.ok(pickup);
  assert.equal(pickup!.fallToFloor, true);
  assert.ok(pickup!.y < 470, "pickup should not teleport to floor instantly");

  m = advanceTicks(m, 40);
  pickup = m.G.pickups.find((p) => p.id === 99);
  assert.ok(pickup);
  assert.ok(pickup!.y >= 470, `pickup should reach floor, y=${pickup!.y}`);
  assert.equal(pickup!.targetY, undefined);
  assert.equal(pickup!.fallToFloor, false);
  assert.equal(
    m.G.platforms.find((p) => p.id === 1),
    undefined,
    "broken platform should be removed",
  );
});

test("weapon pickup falls to floor when platform is destroyed", () => {
  let m = bootMatch( { players: ["p1", "p2"], seed: "fall-weapon" });
  const plat = m.G.platforms.find((p) => p.id === 1);
  assert.ok(plat);

  m.G.pickups.push({
    id: 101,
    kind: "weapon",
    weaponId: "sniper",
    x: plat!.x + plat!.w / 2,
    y: plat!.y - 20,
    onPlatformId: plat!.id,
  });
  const yBefore = m.G.pickups[0]!.y;

  testUtils.breakPlatform(m.G, plat!.id);

  let pickup = m.G.pickups.find((p) => p.id === 101);
  assert.ok(pickup);
  assert.ok(pickup!.y < 470);
  m = advanceTicks(m, 40);
  pickup = m.G.pickups.find((p) => p.id === 101);
  assert.ok(pickup);
  assert.ok(pickup!.y >= 470);
  assert.equal(pickup!.targetY, undefined);
  assert.equal(pickup!.fallToFloor, false);
});

test("weapon still falling is released when platform breaks", () => {
  let m = bootMatch( { players: ["p1", "p2"], seed: "fall-weapon-air" });
  const plat = m.G.platforms.find((p) => p.id === 1);
  assert.ok(plat);

  m.G.pickups.push({
    id: 102,
    kind: "weapon",
    weaponId: "auto",
    x: plat!.x + plat!.w / 2,
    y: plat!.y - 40,
    onPlatformId: plat!.id,
    targetY: plat!.y - 20,
  });

  testUtils.breakPlatform(m.G, plat!.id);

  let pickup = m.G.pickups.find((p) => p.id === 102);
  assert.ok(pickup);
  assert.ok(pickup!.y < 470);
  m = advanceTicks(m, 40);
  pickup = m.G.pickups.find((p) => p.id === 102);
  assert.ok(pickup);
  assert.ok(pickup!.y >= 470);
  assert.equal(pickup!.targetY, undefined);
  assert.equal(pickup!.fallToFloor, false);
});

test("unsupported weapon in mid-air keeps falling", () => {
  let m = bootMatch( { players: ["p1", "p2"], seed: "fall-weapon-unsupported" });
  m.G.pickups.push({
    id: 103,
    kind: "weapon",
    weaponId: "bazooka",
    x: 120,
    y: 200,
  });
  const yBefore = m.G.pickups[0]!.y;

  m = advanceTicks(m, 40);

  const pickup = m.G.pickups.find((p) => p.id === 103);
  assert.ok(pickup);
  assert.ok(pickup!.y > yBefore + 10);
  assert.equal(pickup!.targetY, undefined);
});

test("weapon at orphaned height falls when platform breaks", () => {
  let m = bootMatch( { players: ["p1", "p2"], seed: "fall-orphan" });
  const plat = m.G.platforms.find((p) => p.id === 1);
  assert.ok(plat);

  m.G.pickups.push({
    id: 104,
    kind: "weapon",
    weaponId: "sniper",
    x: plat!.x + plat!.w / 2,
    y: plat!.y - 20,
    targetY: plat!.y - 20,
  });

  testUtils.breakPlatform(m.G, plat!.id);

  let pickup = m.G.pickups.find((p) => p.id === 104);
  assert.ok(pickup);
  assert.ok(pickup!.y < 470);
  m = advanceTicks(m, 40);
  pickup = m.G.pickups.find((p) => p.id === 104);
  assert.ok(pickup);
  assert.ok(pickup!.y >= 470, `weapon should reach floor, y=${pickup!.y}`);
  assert.equal(pickup!.targetY, undefined);
  assert.equal(pickup!.fallToFloor, false);
});

test("spawned weapon falls onto platform over time", () => {
  let m = bootMatch( { players: ["p1", "p2"], seed: "fall-spawn-weapon" });
  const plat = m.G.platforms.find((p) => p.id === 1)!;

  m.G.pickups.push({
    id: 105,
    kind: "weapon",
    weaponId: "auto",
    x: plat.x + plat.w / 2,
    y: plat.y - 58,
    onPlatformId: plat.id,
  });

  m = advanceTicks(m, 20);

  const pickup = m.G.pickups.find((p) => p.id === 105);
  assert.ok(pickup);
  assert.ok(Math.abs(pickup!.y - (plat.y - 20)) <= 2, `weapon should land on platform, y=${pickup!.y}`);
  assert.equal(pickup!.targetY, undefined);
});

test("pickup on static platform falls when static platform breaks", () => {
  let m = bootMatch( { players: ["p1", "p2"], seed: "fall-static" });
  const staticPlat = m.G.platforms.find((p) => p.id === 0);
  assert.ok(staticPlat);

  m.G.pickups.push({
    id: 100,
    kind: "weapon",
    weaponId: "auto",
    x: staticPlat!.x + staticPlat!.w / 2,
    y: staticPlat!.y - 20,
    onPlatformId: 999,
  });
  const yBefore = m.G.pickups[0]!.y;

  testUtils.breakPlatform(m.G, staticPlat!.id);

  let pickup = m.G.pickups.find((p) => p.id === 100);
  assert.ok(pickup);
  assert.equal(pickup!.fallToFloor, true);
  assert.ok(pickup!.y < 470, "pickup should not teleport to floor instantly");

  m = advanceTicks(m, 3);
  pickup = m.G.pickups.find((p) => p.id === 100);
  if (pickup) {
    assert.ok(pickup.y > yBefore, "pickup should move downward over ticks");
    assert.ok(pickup.y < 470);
  }
});

test("orphaned pickup falls when linked platform is already broken", () => {
  let m = bootMatch( { players: ["p1", "p2"], seed: "fall-orphan-link" });
  const plat = m.G.platforms.find((p) => p.id === 1)!;
  plat.broken = true;
  plat.health = 0;

  m.G.pickups.push({
    id: 106,
    kind: "weapon",
    weaponId: "auto",
    x: plat.x + plat.w / 2,
    y: plat.y - 20,
    onPlatformId: plat.id,
  });

  m = advanceTicks(m, 25);

  const pickup = m.G.pickups.find((p) => p.id === 106);
  assert.ok(pickup);
  assert.ok(pickup!.y >= 470);
});

test("player collects weapon pickup on floor", () => {
  let m = bootMatch( { players: ["p1", "p2"], seed: "pickup-floor-collect" });
  const px = m.G.players["p1"].torso.x;

  m.G.pickups.push({
    id: 200,
    kind: "weapon",
    weaponId: "sniper",
    x: px,
    y: 480,
  });

  m = advanceTicks(m, 8);

  assert.equal(m.G.pickups.find((p) => p.id === 200), undefined);
  assert.equal(m.G.players["p1"].currentWeapon, "sniper");
  assert.ok(m.G.players["p1"].ownedWeapons.includes("sniper"));
});

test("player collects weapon after platform break fall with physics body", () => {
  let m = bootMatch( { players: ["p1", "p2"], seed: "pickup-break-collect-body" });
  const plat = m.G.platforms.find((p) => p.id === 1 && p.kind === "elevator");
  assert.ok(plat);
  const pickX = plat!.x + plat!.w / 2;

  const pickup = {
    id: 201,
    kind: "weapon" as const,
    weaponId: "sniper" as const,
    x: pickX,
    y: plat!.y - 58,
    onPlatformId: 1,
  };
  m.G.pickups.push(pickup);

  testUtils.breakPlatform(m.G, 1);
  let fallen = m.G.pickups.find((p) => p.id === 201);
  assert.ok(fallen);
  assert.ok(fallen!.y < 470);
  m = advanceTicks(m, 40);
  fallen = m.G.pickups.find((p) => p.id === 201);
  assert.ok(fallen);
  assert.ok(fallen!.y >= 470, `pickup should reach floor, y=${fallen!.y}`);

  for (let i = 0; i < 240; i++) {
    const px = m.G.players["p1"].torso.x;
    const action = Math.abs(px - pickX) < 10 ? null : px < pickX ? "right" : "left";
    m = applyMove(game, m, {
      type: "input",
      playerId: "p1",
      payload: { action, aimAngle: 0, crouching: false, shooting: false },
    }).state;
    m = advanceTicks(m, 1);
    if (!m.G.pickups.find((p) => p.id === 201)) break;
  }

  assert.equal(m.G.pickups.find((p) => p.id === 201), undefined);
  assert.equal(m.G.players["p1"].currentWeapon, "sniper");
  assert.ok(m.G.players["p1"].ownedWeapons.includes("sniper"));
});

test("p2 can move and collect while not currentPlayer in simultaneous mode", () => {
  let m = bootMatch( { players: ["p1", "p2"], seed: "pickup-p2-simul" });
  assert.ok(m.flow.active?.includes("p2"));

  const pickX = m.G.players["p2"].torso.x;
  m.G.pickups.push({
    id: 202,
    kind: "weapon",
    weaponId: "auto",
    x: pickX,
    y: 480,
  });

  for (let i = 0; i < 12; i++) {
    m = applyMove(game, m, {
      type: "input",
      playerId: "p2",
      payload: { action: null, aimAngle: 0, crouching: false, shooting: false },
    }).state;
    m = advanceTicks(m, 1);
  }

  assert.equal(m.G.pickups.find((p) => p.id === 202), undefined);
  assert.equal(m.G.players["p2"].currentWeapon, "auto");
  assert.ok(m.G.players["p2"].ownedWeapons.includes("auto"));
});

test("katana damages nearby opponent during slash", () => {
  let m = bootMatch( { players: ["p1", "p2"], seed: "t9" });
  m.G.players["p1"].ownedWeapons.push("katana");

  m = applyMove(game, m, {
    type: "switchWeapon",
    playerId: "p1",
    payload: { weaponId: "katana" },
  }).state;

  m = applyMove(game, m, {
    type: "input",
    playerId: "p1",
    payload: { action: "right", aimAngle: 0, crouching: false, shooting: false },
  }).state;
  m = advanceTicks(m, 85);

  const p1 = m.G.players["p1"].torso;
  const p2 = m.G.players["p2"].torso;
  const aimAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
  const hpBefore = m.G.players["p2"].health;

  const r = applyMove(game, m, {
    type: "input",
    playerId: "p1",
    payload: { action: null, aimAngle, facing: 1, crouching: false, shooting: true },
  });
  assertMoveOk(r);

  m = r.state;
  m = advanceTicks(m, 1);
  assert.ok(m.G.players["p2"].health < hpBefore);
});

test("headshot in head zone deals 50% max health", () => {
  const m = bootMatch( { players: ["p1", "p2"], seed: "headshot" });
  const p2 = m.G.players["p2"];

  assert.equal(testUtils.isHeadshotHit(m.G, "p2", p2.head.x, p2.head.y), true);

  const bodyDamage = testUtils.isHeadshotHit(m.G, "p2", p2.torso.x, p2.torso.y + 24);
  assert.equal(bodyDamage, false);
});

test("side torso contact at chest height is not a headshot", () => {
  const m = bootMatch( { players: ["p1", "p2"], seed: "side-head" });
  const p2 = m.G.players["p2"];
  const sideContactX = p2.torso.x - 20;

  assert.equal(testUtils.isHeadshotHit(m.G, "p2", sideContactX, p2.torso.y + 8), false);
});

test("shooting aimed at head deals 500 damage", () => {
  let m = bootMatch( { players: ["p1", "p2"], seed: "t3" });
  m = advanceTicks(m, 20);

  const p1 = m.G.players["p1"];
  const p2 = m.G.players["p2"];
  // Short-range line of sight so gravity drop stays inside the head hit zone.
  p1.torso.x = p2.torso.x - 160;
  p1.torso.y = p2.torso.y;
  p1.head.x = p1.torso.x;
  p1.head.y = p1.torso.y - 36;
  p1.facing = 1;

  let aimHead = Math.atan2(p2.head.y - p1.torso.y, p2.head.x - p1.torso.x);
  for (let i = 0; i < 3; i++) {
    const muzzle = testUtils.computeMuzzlePx(
      p1.torso.x,
      p1.torso.y,
      aimHead,
      1,
      false,
      p1.currentWeapon,
    );
    aimHead = Math.atan2(p2.head.y - muzzle.y, p2.head.x - muzzle.x);
  }

  m = applyMove(game, m, {
    type: "input",
    playerId: "p1",
    payload: { action: null, aimAngle: aimHead, facing: 1, crouching: false, shooting: true },
  }).state;

  for (let i = 0; i < 120; i++) {
    const before = m.G.players["p2"].health;
    m = advanceTicks(m, 1);
    if (m.G.players["p2"].health < before) {
      assert.equal(before - m.G.players["p2"].health, 500);
      return;
    }
  }

  assert.fail("expected headshot to land");
});

test("FFA awards round win when opponent is eliminated", () => {
  let m = bootMatch( { players: ["p1", "p2"], seed: "round-ffa" });
  testUtils.killPlayer(m.G, "p2");
  const r = applyMove(game, m, {
    type: "input",
    playerId: "p1",
    payload: { action: null, aimAngle: 0, crouching: false, shooting: false },
  });
  assertMoveOk(r);
  m = r.state;
  m = advanceTicks(m, 1);
  assert.equal(m.G.scores["p1"], 1);
  assert.equal(m.G.roundPhase, "intermission");
  assert.equal(m.G.lastRoundWinner, "p1");
});

test("map rotates after intermission", () => {
  let m = bootMatch( { players: ["p1", "p2"], seed: "map-rot" });
  assert.equal(m.G.currentMapId, "default");
  testUtils.killPlayer(m.G, "p2");
  m = applyMove(game, m, {
    type: "input",
    playerId: "p1",
    payload: { action: null, aimAngle: 0, crouching: false, shooting: false },
  }).state;
  m = advanceTicks(m, 1);

  while (m.G.roundPhase === "intermission") {
    m = applyMove(game, m, {
      type: "input",
      playerId: "p1",
      payload: { action: null, aimAngle: 0, crouching: false, shooting: false },
    }).state;
    m = advanceTicks(m, 1);
  }

  assert.equal(m.G.currentMapId, "towers");
  assert.equal(m.G.currentRound, 2);
  assert.equal(m.G.players["p1"].health, 1000);
  assert.equal(m.G.players["p2"].health, 1000);
});

test("match ends after 3 round wins (best of 5)", () => {
  let m = bootMatch( { players: ["p1", "p2"], seed: "match-end" });

  for (let i = 0; i < ROUNDS_TO_WIN; i++) {
    testUtils.killPlayer(m.G, "p2");
    m = applyMove(game, m, {
      type: "input",
      playerId: "p1",
      payload: { action: null, aimAngle: 0, crouching: false, shooting: false },
    }).state;
    m = advanceTicks(m, 1);

    if (m.ended) break;

    while (m.G.roundPhase === "intermission") {
      m = applyMove(game, m, {
        type: "input",
        playerId: "p1",
        payload: { action: null, aimAngle: 0, crouching: false, shooting: false },
      }).state;
      m = advanceTicks(m, 1);
      if (m.ended) break;
    }
  }

  assert.ok(m.ended);
  assert.equal(m.result?.winner, "p1");
  assert.equal(m.G.scores["p1"], ROUNDS_TO_WIN);
});

test("2v2 blocks friendly fire between teammates", () => {
  const m = bootMatch( {
    players: ["p1", "p2", "p3", "p4"],
    seed: "ff-test",
    config: { mode: "teams2v2" },
  });
  assert.equal(m.G.gameMode, "teams2v2");
  assert.equal(testUtils.canDamage(m.G, "p1", "p2"), false);
  assert.equal(testUtils.canDamage(m.G, "p1", "p3"), true);
  assert.equal(m.G.teams["p1"], 0);
  assert.equal(m.G.teams["p3"], 1);
});

test("2v2 awards team win when opposing team is eliminated", () => {
  let m = bootMatch( {
    players: ["p1", "p2", "p3", "p4"],
    seed: "team-win",
    config: { mode: "teams2v2" },
  });
  testUtils.killPlayer(m.G, "p3");
  testUtils.killPlayer(m.G, "p4");
  m = applyMove(game, m, {
    type: "input",
    playerId: "p1",
    payload: { action: null, aimAngle: 0, crouching: false, shooting: false },
  }).state;
  m = advanceTicks(m, 1);
  assert.equal(m.G.scores["0"], 1);
  assert.equal(m.G.lastRoundWinner, "0");
  assert.equal(m.G.roundPhase, "intermission");
});

test("teams2v2 requires exactly 4 players", () => {
  assert.throws(
    () => bootMatch( { players: ["p1", "p2", "p3"], seed: "bad", config: { mode: "teams2v2" } }),
    /exactly 4 players/,
  );
});

test("resetRound restores platform state for new map", () => {
  let m = bootMatch( { players: ["p1", "p2"], seed: "plat-ghost" });
  testUtils.breakPlatform(m.G, m.G.platforms[0].id);

  m = advanceTicks(m, 500);

  testUtils.startNextRound(m.G);

  assert.ok(m.G.platforms.every((p) => !p.broken));
  assert.ok(m.G.platforms.length >= 3);
});

test("match starts active without lobby wait", () => {
  const m = createMatch(game, { players: ["p1", "p2"], seed: "lobby" });
  assert.equal(m.G.matchPhase, "active");

  let moved = applyMove(game, m, {
    type: "input",
    playerId: "p1",
    payload: { action: "right", aimAngle: 0, facing: 1, crouching: false, shooting: false },
  });
  assert.ok(moved.ok);
  const nextState = advanceTicks(moved.state, 1);
  assert.notEqual(nextState.G.players.p1.torso.x, m.G.players.p1.torso.x);
});
