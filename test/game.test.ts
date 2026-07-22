import { test } from "node:test";
import assert from "node:assert/strict";
import { createMatch, applyMove } from "@bordiko/sdk";
import game, { WEAPON_ORDER, testUtils } from "../src/game.ts";

test("a player spawns with correct health and weapon", () => {
  const m = createMatch(game, { players: ["p1", "p2"], seed: "t1" });
  assert.equal(m.G.players["p1"].health, 1000);
  assert.equal(m.G.players["p2"].health, 1000);
  assert.equal(m.G.players["p1"].currentWeapon, "winchester");
  assert.deepEqual(m.G.players["p1"].ownedWeapons, ["winchester"]);
  assert.ok(m.G.players["p1"].torso);
  assert.ok(m.G.platforms.some((p) => p.kind === "elevator"));
});

test("move updates player position via physics sync", () => {
  let m = createMatch(game, { players: ["p1", "p2"], seed: "t2" });

  const startX = m.G.players["p1"].torso.x;
  const r = applyMove(game, m, {
    type: "move",
    playerId: "p1",
    payload: { action: "right", aimAngle: 0, crouching: false },
  });
  assert.ok(r.ok, r.error);

  m = r.state;
  assert.ok(m.G.players["p1"].torso.x >= startX);
});

test("shoot spawns a bullet for winchester", () => {
  let m = createMatch(game, { players: ["p1", "p2"], seed: "t3" });

  assert.equal(m.G.bullets.length, 0);

  const r = applyMove(game, m, { type: "shoot", playerId: "p1", payload: { aimAngle: 0 } });
  assert.ok(r.ok, r.error);

  m = r.state;
  assert.equal(m.G.bullets.length, 1);
  assert.equal(m.G.bullets[0].owner, "p1");
  assert.equal(m.G.bullets[0].weaponId, "winchester");
});

test("switchWeapon rejects unowned weapon", () => {
  const m = createMatch(game, { players: ["p1", "p2"], seed: "t5" });

  const r = applyMove(game, m, {
    type: "switchWeapon",
    playerId: "p1",
    payload: { weaponId: "sniper" },
  });
  assert.equal(r.ok, false);
  assert.equal(m.G.players["p1"].currentWeapon, "winchester");
});

test("switchWeapon updates current weapon when owned", () => {
  let m = createMatch(game, { players: ["p1", "p2"], seed: "t5-owned" });
  m.G.players["p1"].ownedWeapons.push("sniper");

  const r = applyMove(game, m, {
    type: "switchWeapon",
    playerId: "p1",
    payload: { weaponId: "sniper" },
  });
  assert.ok(r.ok, r.error);

  m = r.state;
  assert.equal(m.G.players["p1"].currentWeapon, "sniper");
});

test("shotgun spawns multiple pellets", () => {
  let m = createMatch(game, { players: ["p1", "p2"], seed: "t6" });
  m.G.players["p1"].ownedWeapons.push("winchester_shotgun");

  m = applyMove(game, m, {
    type: "switchWeapon",
    playerId: "p1",
    payload: { weaponId: "winchester_shotgun" },
  }).state;

  const r = applyMove(game, m, { type: "shoot", playerId: "p1", payload: { aimAngle: 0 } });
  assert.ok(r.ok, r.error);

  m = r.state;
  assert.equal(m.G.bullets.length, 6);
  assert.ok(m.G.bullets.every((b) => b.kind === "pellet"));
});

test("elevator platform x changes over ticks", () => {
  let m = createMatch(game, { players: ["p1", "p2"], seed: "t7" });
  const elevator = m.G.platforms.find((p) => p.id === 1 && p.kind === "elevator");
  assert.ok(elevator);
  const startX = elevator!.x;

  for (let i = 0; i < 5; i++) {
    m = applyMove(game, m, {
      type: "move",
      playerId: "p1",
      payload: { action: null, aimAngle: 0, crouching: false },
    }).state;
  }

  const moved = m.G.platforms.find((p) => p.id === 1);
  assert.ok(moved);
  assert.notEqual(moved!.x, startX);
});

test("weapon cycle only switches owned weapons", () => {
  let m = createMatch(game, { players: ["p1", "p2"], seed: "t8" });

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
  let m = createMatch(game, { players: ["p1", "p2"], seed: "fall-pickup" });
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

  const pickup = m.G.pickups.find((p) => p.id === 99);
  assert.ok(pickup);
  assert.ok(pickup!.y >= 470, `pickup should reach floor, y=${pickup!.y}`);
  assert.equal(pickup!.targetY, undefined);
  assert.equal(pickup!.fallToFloor, false);
  assert.ok(m.G.platforms.find((p) => p.id === 1)?.broken);
});

test("weapon pickup falls to floor when platform is destroyed", () => {
  let m = createMatch(game, { players: ["p1", "p2"], seed: "fall-weapon" });
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

  const pickup = m.G.pickups.find((p) => p.id === 101);
  assert.ok(pickup);
  assert.ok(pickup!.y >= 470);
  assert.equal(pickup!.targetY, undefined);
  assert.equal(pickup!.fallToFloor, false);
});

test("weapon still falling is released when platform breaks", () => {
  let m = createMatch(game, { players: ["p1", "p2"], seed: "fall-weapon-air" });
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

  const pickup = m.G.pickups.find((p) => p.id === 102);
  assert.ok(pickup);
  assert.ok(pickup!.y >= 470);
  assert.equal(pickup!.targetY, undefined);
  assert.equal(pickup!.fallToFloor, false);
});

test("unsupported weapon in mid-air keeps falling", () => {
  let m = createMatch(game, { players: ["p1", "p2"], seed: "fall-weapon-unsupported" });
  m.G.pickups.push({
    id: 103,
    kind: "weapon",
    weaponId: "bazooka",
    x: 120,
    y: 200,
  });
  const yBefore = m.G.pickups[0]!.y;

  for (let i = 0; i < 40; i++) {
    m = applyMove(game, m, {
      type: "move",
      playerId: "p1",
      payload: { action: null, aimAngle: 0, crouching: false },
    }).state;
  }

  const pickup = m.G.pickups.find((p) => p.id === 103);
  assert.ok(pickup);
  assert.ok(pickup!.y > yBefore + 10);
  assert.equal(pickup!.targetY, undefined);
});

test("weapon at orphaned height falls when platform breaks", () => {
  let m = createMatch(game, { players: ["p1", "p2"], seed: "fall-orphan" });
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

  const pickup = m.G.pickups.find((p) => p.id === 104);
  assert.ok(pickup);
  assert.ok(pickup!.y >= 470, `weapon should reach floor, y=${pickup!.y}`);
  assert.equal(pickup!.targetY, undefined);
  assert.equal(pickup!.fallToFloor, false);
});

test("spawned weapon falls onto platform over time", () => {
  let m = createMatch(game, { players: ["p1", "p2"], seed: "fall-spawn-weapon" });
  const plat = m.G.platforms.find((p) => p.id === 1)!;

  m.G.pickups.push({
    id: 105,
    kind: "weapon",
    weaponId: "auto",
    x: plat.x + plat.w / 2,
    y: plat.y - 58,
    onPlatformId: plat.id,
  });

  for (let i = 0; i < 20; i++) {
    m = applyMove(game, m, {
      type: "move",
      playerId: "p1",
      payload: { action: null, aimAngle: 0, crouching: false },
    }).state;
  }

  const pickup = m.G.pickups.find((p) => p.id === 105);
  assert.ok(pickup);
  assert.ok(Math.abs(pickup!.y - (plat.y - 20)) <= 2, `weapon should land on platform, y=${pickup!.y}`);
  assert.equal(pickup!.targetY, undefined);
});

test("pickup on static platform falls when static platform breaks", () => {
  let m = createMatch(game, { players: ["p1", "p2"], seed: "fall-static" });
  const staticPlat = m.G.platforms.find((p) => p.id === 0);
  assert.ok(staticPlat);

  m.G.pickups.push({
    id: 100,
    kind: "health",
    x: staticPlat!.x + staticPlat!.w / 2,
    y: staticPlat!.y - 20,
    onPlatformId: 999,
  });
  const yBefore = m.G.pickups[0]!.y;

  testUtils.breakPlatform(m.G, staticPlat!.id);

  const pickup = m.G.pickups.find((p) => p.id === 100);
  assert.ok(pickup);
  assert.ok(pickup!.y >= 470);
  assert.equal(pickup!.targetY, undefined);
  assert.equal(pickup!.fallToFloor, false);
});

test("orphaned pickup falls when linked platform is already broken", () => {
  let m = createMatch(game, { players: ["p1", "p2"], seed: "fall-orphan-link" });
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

  for (let i = 0; i < 25; i++) {
    m = applyMove(game, m, {
      type: "move",
      playerId: "p1",
      payload: { action: null, aimAngle: 0, crouching: false },
    }).state;
  }

  const pickup = m.G.pickups.find((p) => p.id === 106);
  assert.ok(pickup);
  assert.ok(pickup!.y >= 470);
});

test("player collects weapon pickup on floor", () => {
  let m = createMatch(game, { players: ["p1", "p2"], seed: "pickup-floor-collect" });
  const px = m.G.players["p1"].torso.x;

  m.G.pickups.push({
    id: 200,
    kind: "weapon",
    weaponId: "sniper",
    x: px,
    y: 480,
  });

  for (let i = 0; i < 8; i++) {
    m = applyMove(game, m, {
      type: "move",
      playerId: "p1",
      payload: { action: null, aimAngle: 0, crouching: false },
    }).state;
  }

  assert.equal(m.G.pickups.find((p) => p.id === 200), undefined);
  assert.equal(m.G.players["p1"].currentWeapon, "sniper");
  assert.ok(m.G.players["p1"].ownedWeapons.includes("sniper"));
});

test("player collects weapon after platform break fall with physics body", () => {
  let m = createMatch(game, { players: ["p1", "p2"], seed: "pickup-break-collect-body" });
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
  testUtils.createPickupBody(pickup);

  testUtils.breakPlatform(m.G, 1);
  const fallen = m.G.pickups.find((p) => p.id === 201);
  assert.ok(fallen);
  assert.ok(fallen!.y >= 470, `pickup should reach floor, y=${fallen!.y}`);

  for (let i = 0; i < 240; i++) {
    const px = m.G.players["p1"].torso.x;
    const action = Math.abs(px - pickX) < 10 ? null : px < pickX ? "right" : "left";
    m = applyMove(game, m, {
      type: "move",
      playerId: "p1",
      payload: { action, aimAngle: 0, crouching: false },
    }).state;
    if (!m.G.pickups.find((p) => p.id === 201)) break;
  }

  assert.equal(m.G.pickups.find((p) => p.id === 201), undefined);
  assert.equal(m.G.players["p1"].currentWeapon, "sniper");
  assert.ok(m.G.players["p1"].ownedWeapons.includes("sniper"));
});

test("p2 can move and collect while not currentPlayer in simultaneous mode", () => {
  let m = createMatch(game, { players: ["p1", "p2"], seed: "pickup-p2-simul" });
  assert.ok(m.flow.active?.includes("p2"));

  const pickX = m.G.players["p2"].torso.x;
  m.G.pickups.push({
    id: 202,
    kind: "weapon",
    weaponId: "auto",
    x: pickX,
    y: 480,
  });
  testUtils.createPickupBody(m.G.pickups[0]!);

  for (let i = 0; i < 12; i++) {
    m = applyMove(game, m, {
      type: "move",
      playerId: "p2",
      payload: { action: null, aimAngle: 0, crouching: false },
    }).state;
  }

  assert.equal(m.G.pickups.find((p) => p.id === 202), undefined);
  assert.equal(m.G.players["p2"].currentWeapon, "auto");
  assert.ok(m.G.players["p2"].ownedWeapons.includes("auto"));
});

test("katana damages nearby opponent during slash", () => {
  let m = createMatch(game, { players: ["p1", "p2"], seed: "t9" });
  m.G.players["p1"].ownedWeapons.push("katana");

  m = applyMove(game, m, {
    type: "switchWeapon",
    playerId: "p1",
    payload: { weaponId: "katana" },
  }).state;

  for (let i = 0; i < 85; i++) {
    m = applyMove(game, m, {
      type: "move",
      playerId: "p1",
      payload: { action: "right", aimAngle: 0, crouching: false },
    }).state;
  }

  const p1 = m.G.players["p1"].torso;
  const p2 = m.G.players["p2"].torso;
  const aimAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
  const hpBefore = m.G.players["p2"].health;

  const r = applyMove(game, m, {
    type: "shoot",
    playerId: "p1",
    payload: { aimAngle, facing: 1 },
  });
  assert.ok(r.ok, r.error);

  m = r.state;
  assert.ok(m.G.players["p2"].health < hpBefore);
});
