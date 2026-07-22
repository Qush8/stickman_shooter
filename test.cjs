const planck = require('planck');
const SCALE = 30;
let world = planck.World({ gravity: planck.Vec2(0, 30) });
const torso = world.createDynamicBody({
  position: planck.Vec2(100 / SCALE, 100 / SCALE),
  fixedRotation: true,
});
torso.createFixture(planck.Box(0.4, 0.8), {
  density: 2.0,
  friction: 0.5,
  restitution: 0.0,
});
const head = world.createDynamicBody({
  position: planck.Vec2(100 / SCALE, (100 - 30) / SCALE),
});
head.createFixture(planck.Circle(0.4), {
  density: 1.0,
  friction: 0.5,
  restitution: 0.2,
});
world.createJoint(planck.RevoluteJoint({
  lowerAngle: -0.2,
  upperAngle: 0.2,
  enableLimit: true,
}, torso, head, head.getPosition()));

world.step(1/60);
console.log(torso.getPosition());
console.log(head.getPosition());
