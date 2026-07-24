import { createMatch, applyMove, applyTick } from "@bordiko/sdk";
import game, { testUtils } from "./src/game.ts";

let m = createMatch(game, { players: ["p1", "p2"], seed: "t3" });
m = applyTick(game, m, 1000/30 * 20).state; // wait 20 ticks

const p1 = m.G.players["p1"];
const p2 = m.G.players["p2"];
p1.torso.x = p2.torso.x - 160;
p1.torso.y = p2.torso.y;
p1.head.x = p1.torso.x;
p1.head.y = p1.torso.y - 36;
p1.facing = 1;

let aimHead = Math.atan2(p2.head.y - p1.torso.y, p2.head.x - p1.torso.x);
for (let i = 0; i < 3; i++) {
  const muzzle = testUtils.computeMuzzlePx(p1.torso.x, p1.torso.y, aimHead, 1, false, p1.currentWeapon);
  aimHead = Math.atan2(p2.head.y - muzzle.y, p2.head.x - muzzle.x);
}

m = applyMove(game, m, {
  type: "input",
  playerId: "p1",
  payload: { action: null, aimAngle: aimHead, facing: 1, crouching: false, shooting: true },
}).state;

console.log("Shooter X:", p1.torso.x, "Y:", p1.torso.y);
console.log("Target Head X:", p2.head.x, "Y:", p2.head.y);

for (let i = 0; i < 10; i++) {
  const before = m.G.players["p2"].health;
  m = applyTick(game, m, 1000/30).state;
  if (m.G.bullets[0]) {
     console.log("Bullet: X:", m.G.bullets[0].body.x, "Y:", m.G.bullets[0].body.y);
  }
  if (m.G.players["p2"].health < before) {
    console.log("HIT! Damage:", before - m.G.players["p2"].health);
    break;
  }
}
