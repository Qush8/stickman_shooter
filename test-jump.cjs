const planck = require("planck");
const SCALE = 30;
const JUMP_VY = -34 * SCALE;
const GRAVITY = 97.5 * SCALE;

const world = new planck.World(planck.Vec2(0, GRAVITY / SCALE));

const b = world.createDynamicBody({
  position: planck.Vec2(100 / SCALE, 468.2 / SCALE),
  fixedRotation: true
});
b.createFixture(planck.Box(10 / SCALE, 10 / SCALE));

b.setLinearVelocity(planck.Vec2(0, JUMP_VY / SCALE));

world.step(1/30);
console.log(b.getPosition().y * SCALE);
world.step(1/30);
console.log(b.getPosition().y * SCALE);
