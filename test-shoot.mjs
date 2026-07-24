import { createMatch, applyMove, applyTick } from "@bordiko/sdk";
import game from "./src/game.ts";

let m = createMatch(game, { players: ["p1", "p2"], seed: "t3" });
console.log("Before shoot: length=", m.G.bullets.length, "lastFireTick=", m.G.players["p1"].lastFireTick, "worldTick=", m.G.worldTick);

const r = applyMove(game, m, {
  type: "input",
  playerId: "p1",
  payload: { action: null, jumping: false, aimAngle: 0, crouching: false, shooting: true },
});
m = r.state;
m = applyTick(game, m, 1000/30).state;

console.log("After tick: bullets=", m.G.bullets.length);
