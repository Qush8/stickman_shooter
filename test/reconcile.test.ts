import { test } from "node:test";
import assert from "node:assert/strict";
import {
  expLerpFactor,
  reconcileAxis,
  reconcilePose,
} from "../src/reconcile.js";

// ---------------------------------------------------------------------------
// The prediction pipeline is pure arithmetic — (dt, serverPose, renderPose) ->
// renderPose — so it is tested here, headlessly. None of it runs on the server,
// so the reducer tests in game.test.ts cover none of these properties.
// ---------------------------------------------------------------------------

const RATE = 12;
const SNAP = 200;

/** Step an axis for `seconds` of elapsed time in fixed frames of `frameMs`. */
const converge = (start: number, target: number, frameMs: number, seconds: number) => {
  let v = start;
  const dt = frameMs / 1000;
  for (let elapsed = 0; elapsed < seconds - 1e-9; elapsed += dt) {
    v = reconcileAxis(v, target, RATE, dt, SNAP);
  }
  return v;
};

test("error converges to ~0", () => {
  const v = converge(0, 100, 16, 2);
  assert.ok(Math.abs(100 - v) < 0.5, `expected convergence, got ${v}`);
});

test("16 ms and 8 ms frame steps converge equally over the same elapsed time", () => {
  const slow = converge(0, 100, 16, 1);
  const fast = converge(0, 100, 8, 1);

  // This is the whole point of the exponential form: a fixed fraction per frame
  // would put `fast` roughly twice as far along, so the game would literally
  // feel different on a 120 Hz display than on a 60 Hz one.
  assert.ok(
    Math.abs(slow - fast) < 0.5,
    `frame rate changed the outcome: 16ms -> ${slow}, 8ms -> ${fast}`,
  );
});

test("a 240 Hz display and a throttled tab agree too", () => {
  const smooth = converge(0, 100, 4, 1.5);
  const throttled = converge(0, 100, 50, 1.5);
  assert.ok(
    Math.abs(smooth - throttled) < 1.5,
    `4ms -> ${smooth}, 50ms -> ${throttled}`,
  );
});

test("error on one axis leaves the other untouched", () => {
  // Y is wildly wrong (a respawn drop); X is exactly right.
  const pose = reconcilePose(
    { x: 50, y: 0 },
    { x: 50, y: 5000 },
    { rate: RATE, dtSec: 1 / 60, snapX: SNAP, snapY: SNAP },
  );

  assert.equal(pose.x, 50, "a Y teleport must not move X — that reads as a sideways yank");
  assert.equal(pose.y, 5000, "Y itself should snap");
});

test("a teleport snaps but ordinary drift does not", () => {
  const drift = reconcileAxis(0, 30, RATE, 1 / 60, SNAP);
  assert.ok(drift > 0 && drift < 30, `drift should ease, got ${drift}`);

  const teleport = reconcileAxis(0, SNAP + 1, RATE, 1 / 60, SNAP);
  assert.equal(teleport, SNAP + 1, "past the threshold it should snap outright");
});

test("dtSec of 0 does not advance smoothing", () => {
  // The state handler passes 0: easing once per snapshot would make convergence
  // depend on when packets land rather than on frame time.
  assert.equal(reconcileAxis(10, 100, RATE, 0, SNAP), 10);
  assert.equal(expLerpFactor(RATE, 0), 0);
});

test("the first frame adopts the server pose instead of easing from nowhere", () => {
  const pose = reconcilePose(
    { x: undefined as unknown as number, y: undefined as unknown as number },
    { x: 7, y: 9 },
    { rate: RATE, dtSec: 1 / 60, snapX: SNAP, snapY: SNAP },
  );
  assert.deepEqual(pose, { x: 7, y: 9 });
});

test("reconcilePose does not mutate its inputs", () => {
  const render = { x: 0, y: 0 };
  const server = { x: 100, y: 100 };
  reconcilePose(render, server, { rate: RATE, dtSec: 1 / 60, snapX: SNAP, snapY: SNAP });
  assert.deepEqual(render, { x: 0, y: 0 });
  assert.deepEqual(server, { x: 100, y: 100 });
});
