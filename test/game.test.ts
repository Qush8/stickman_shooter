import { test } from "node:test";
import assert from "node:assert/strict";
import { createMatch, applyMove } from "@bordiko/sdk";
import game from "../src/game.ts";

test("a player spawns with correct health and position", () => {
  const m = createMatch(game, { players: ["p1", "p2"], seed: "t1" });
  assert.equal(m.G.players["p1"].health, 1000);
  assert.equal(m.G.players["p2"].health, 1000);
  assert.equal(m.G.players["p1"].x, 50);
  assert.equal(m.G.players["p1"].y, 580);
});

test("move updates coordinates via exact syncing", () => {
  let m = createMatch(game, { players: ["p1", "p2"], seed: "t2" });
  
  const r = applyMove(game, m, { type: "move", playerId: "p1", payload: { x: 100, y: 500, vx: 5, vy: -5, aimAngle: 0.5 } });
  assert.ok(r.ok, r.error);
  
  m = r.state;
  assert.equal(m.G.players["p1"].x, 100);
  assert.equal(m.G.players["p1"].y, 500);
  assert.equal(m.G.players["p1"].vy, -5);
  
  // Also check that it's still p1's and p2's turn (simultaneous)
  assert.ok(m.flow.active.includes("p1"));
  assert.ok(m.flow.active.includes("p2"));
});

test("shoot spawns a bullet", () => {
  let m = createMatch(game, { players: ["p1", "p2"], seed: "t3" });
  
  assert.equal(m.G.bullets.length, 0);
  
  const r = applyMove(game, m, { type: "shoot", playerId: "p2", payload: { aimAngle: 0 } });
  assert.ok(r.ok, r.error);
  
  m = r.state;
  assert.equal(m.G.bullets.length, 1);
  assert.equal(m.G.bullets[0].owner, "p2");
});

test("max 3 bullets limit per player", () => {
  let m = createMatch(game, { players: ["p1", "p2"], seed: "t4" });
  
  m = applyMove(game, m, { type: "shoot", playerId: "p1", payload: { aimAngle: 0 } }).state;
  m = applyMove(game, m, { type: "shoot", playerId: "p1", payload: { aimAngle: 0 } }).state;
  m = applyMove(game, m, { type: "shoot", playerId: "p1", payload: { aimAngle: 0 } }).state;
  assert.equal(m.G.bullets.length, 3);
  
  const r4 = applyMove(game, m, { type: "shoot", playerId: "p1", payload: { aimAngle: 0 } });
  assert.equal(r4.ok, false); // Rejected because they already have 3 active bullets
});
