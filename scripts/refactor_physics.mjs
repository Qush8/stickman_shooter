import fs from 'fs';

let content = fs.readFileSync('src/game.ts', 'utf-8');

// Replace arcade-physics import with planck
content = content.replace(
  /import\s*\{[\s\S]*?\}\s*from\s*"\.\/arcade-physics\.ts";/,
  'import * as planck from "planck";\nexport interface AABB { x: number; y: number; w: number; h: number; }'
);

const physicsConstants = \`const PHYSICS_HZ = 60;
const PHYSICS_DT = 1 / PHYSICS_HZ;
const PHYSICS_STEPS_PER_TICK = PHYSICS_HZ / 30;\`;

const newPhysicsConstants = \`const PHYSICS_HZ = 30;
const PHYSICS_DT = 1 / PHYSICS_HZ;
const PHYSICS_STEPS_PER_TICK = 1;\`;

content = content.replace(physicsConstants, newPhysicsConstants);

// Replace physics functions directly
function deleteFunction(funcName) {
  const regex = new RegExp(\`function \${funcName}\\([\\s\\S]*?\\n\\}\`, 'm');
  // wait, a function could have nested blocks. 
  // Let's just comment out or replace specific known strings.
}
// Actually, it's safer to use a regex that matches until the next function
function replaceUntilNextFunction(funcName, replacement = '') {
  const regex = new RegExp(\`function \${funcName}\\b[\\s\\S]*?(?=function \\w+\\()\`, 'm');
  content = content.replace(regex, replacement);
}

replaceUntilNextFunction('scanPlayerWallContact');
replaceUntilNextFunction('updatePlayerWallContacts');
replaceUntilNextFunction('resolvePlayerWalls');
replaceUntilNextFunction('resolvePlayerSideStick');
replaceUntilNextFunction('stepArcadePlayers');
replaceUntilNextFunction('bulletRadiusForKind');
replaceUntilNextFunction('syncStateFromPhysics');
replaceUntilNextFunction('bulletHitsSolid');
replaceUntilNextFunction('resolveBulletSolidBounce');
replaceUntilNextFunction('stepArcadeBullets');

const ensureWorldCode = \`
let world: planck.World | null = null;
let currentWorldTick = -1;
const bodyMap = new Map<string, planck.Body>();

function bulletRadiusForKind(kind: BulletState["kind"]): number {
  if (kind === "rocket") return 0.11 * SCALE;
  if (kind === "grenade") return 0.09 * SCALE;
  if (kind === "pellet") return 0.05 * SCALE;
  return 0.07 * SCALE;
}

export function ensureWorld(G: ShooterState) {
  if (world && currentWorldTick === G.worldTick) return;

  world = new planck.World({ gravity: planck.Vec2(0, GRAVITY / SCALE) });
  bodyMap.clear();

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
    const h = p.crouching ? PLAYER_CROUCH_H : PLAYER_H;
    b.createFixture(planck.Box(PLAYER_W / 2 / SCALE, h / 2 / SCALE), {
      friction: 0.0,
      restitution: 0.0,
      density: 1.0,
    });
    b.setLinearVelocity(planck.Vec2(p.vx / SCALE, p.vy / SCALE));
    bodyMap.set("player_" + id, b);
  }

  for (const plat of G.platforms) {
    if (plat.broken) continue;
    const isElevator = plat.kind === "elevator";
    const b = world.createBody({
      type: isElevator ? "kinematic" : "static",
      position: planck.Vec2((plat.x + plat.w / 2) / SCALE, (plat.y - plat.h / 2) / SCALE),
      userData: { type: "platform", id: plat.id }
    });
    b.createFixture(planck.Box(plat.w / 2 / SCALE, plat.h / 2 / SCALE), {
      friction: 0.0,
      restitution: 0.0
    });
    if (isElevator && plat.vx != null) {
      b.setLinearVelocity(planck.Vec2(plat.vx / SCALE, 0));
    }
    bodyMap.set("platform_" + plat.id, b);
  }

  for (const crate of G.crates) {
    const b = world.createBody({
      type: "static",
      position: planck.Vec2((crate.x + crate.w / 2) / SCALE, (crate.y - crate.h / 2) / SCALE),
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
      restitution: 1.0,
      density: 0.1,
    });
    b.setLinearVelocity(planck.Vec2(bullet.vx / SCALE, bullet.vy / SCALE));
    bodyMap.set("bullet_" + bullet.id, b);
  }

  world.on('pre-solve', function(contact, oldManifold) {
    const fA = contact.getFixtureA();
    const fB = contact.getFixtureB();
    const uA = fA.getBody().getUserData() as any;
    const uB = fB.getBody().getUserData() as any;
    
    if (uA?.type === "bullet" && uB?.type === "player" && uA.owner === uB.id) {
      contact.setEnabled(false);
    }
    if (uB?.type === "bullet" && uA?.type === "player" && uB.owner === uA.id) {
      contact.setEnabled(false);
    }
    if (uA?.type === "bullet" && uB?.type === "bullet") {
      contact.setEnabled(false);
    }
  });

  world.on('begin-contact', function(contact) {
    const fA = contact.getFixtureA();
    const fB = contact.getFixtureB();
    const uA = fA.getBody().getUserData() as any;
    const uB = fB.getBody().getUserData() as any;

    if (uA?.type === "bullet" || uB?.type === "bullet") {
      const bulletU = uA?.type === "bullet" ? uA : uB;
      const otherU = uA?.type === "bullet" ? uB : uA;
      
      const bulletState = G.bullets.find(b => b.id === bulletU.id);
      if (!bulletState) return;

      if (otherU?.type === "platform") {
        pendingPlatformDamages.push({
          id: otherU.id,
          damage: bulletState.damage,
          x: bulletState.body.x,
          y: bulletState.body.y,
        });
      } else if (otherU?.type === "crate") {
        pendingCrateDamages.push({
          id: otherU.id,
          damage: bulletState.damage,
          x: bulletState.body.x,
          y: bulletState.body.y,
        });
      } else if (otherU?.type === "player") {
        if (otherU.id !== bulletState.owner && isPlayerAlive(G, otherU.id) && canDamage(G, bulletState.owner, otherU.id)) {
           if (!handledBulletPlayerHitsThisStep.has(String(bulletState.id))) {
              handledBulletPlayerHitsThisStep.add(String(bulletState.id));
              pendingBulletDestroys.add(bulletState.id);
              const { damage, isHeadshot } = resolveBulletPlayerDamage(
                G,
                otherU.id,
                "player",
                bulletState,
                { x: bulletState.body.x, y: bulletState.body.y },
              );
              
              const headPoint = isHeadshot ? headHitPointPx(G, otherU.id) : null;
              pendingHits.push({
                x: headPoint?.x ?? bulletState.body.x,
                y: headPoint?.y ?? bulletState.body.y,
                targetId: otherU.id,
                damage,
                isHeadshot,
              });
           }
        }
      }
    }
  });

  currentWorldTick = G.worldTick;
}

function updatePlayerCrouchFixture(p: PlayerState, b: planck.Body) {
  let fix = b.getFixtureList();
  while (fix) {
    b.destroyFixture(fix);
    fix = fix.getNext();
  }
  const h = p.crouching ? PLAYER_CROUCH_H : PLAYER_H;
  b.createFixture(planck.Box(PLAYER_W / 2 / SCALE, h / 2 / SCALE), {
    friction: 0.0,
    restitution: 0.0,
    density: 1.0,
  });
}
\n`;

content = content.replace('function setCurrentG(G: ShooterState) {', ensureWorldCode + 'function setCurrentG(G: ShooterState) {');

const newApplyMovementInput = \`function applyMovementInput(G: ShooterState, playerId: string, random: RandomAPI) {
  const p = G.players[playerId];
  if (!p || p.health <= 0 || !p.input) return;

  const data = p.input;
  const b = bodyMap.get("player_" + playerId);
  if (!b) return;

  const v = b.getLinearVelocity();
  p.vx = v.x * SCALE;
  p.vy = v.y * SCALE;

  const grounded = Math.abs(p.vy) < 0.1 && p.torso.y >= FLOOR_Y - PLAYER_H / 2 - 2 || (p.vy === 0);
  p.grounded = grounded;

  const wantCrouch = data.crouching === true || data.action === "crouch";
  if (wantCrouch && grounded) {
    if (!p.crouching) {
      p.crouching = true;
      applyCrouchPose(p, true);
      updatePlayerCrouchFixture(p, b);
    }
  } else if (!wantCrouch && p.crouching) {
    p.crouching = false;
    applyCrouchPose(p, false);
    updatePlayerCrouchFixture(p, b);
  } else {
    p.crouching = wantCrouch && grounded;
  }
  
  const speedMul = p.crouching ? 0.45 : 1;
  let vx = p.vx;
  let vy = p.vy;

  if (data.action === "left") {
    vx = -MOVE_SPEED * speedMul;
  } else if (data.action === "right") {
    vx = MOVE_SPEED * speedMul;
  } else {
    if (grounded) vx = 0;
  }

  if (data.jumping) {
    const standingJump = canPerformStandingJump(G, playerId, p.crouching);
    if (standingJump || grounded) {
      vy = JUMP_VY;
      p.grounded = false;
    }
    data.jumping = false;
  }

  if (data.shooting) {
    fireWeapon(G, playerId, data.aimAngle, data.facing, random);
  }

  b.setLinearVelocity(planck.Vec2(vx / SCALE, vy / SCALE));
}
\`;

content = content.replace(/function applyMovementInput[\s\S]*?(?=function advanceWorld)/, newApplyMovementInput);

const newAdvanceWorld = \`function advanceWorld(G: ShooterState, random: RandomAPI) {
  setCurrentG(G);
  G.hitEvents = [];
  G.worldTick += 1;

  if (G.roundPhase === "playing") {
    ensureWorld(G);
    runSpawnCycle(G, random);
    updatePickupDrops(G);
    
    world!.step(1 / 30);
    currentWorldTick = G.worldTick;
    
    for (const [id, p] of Object.entries(G.players)) {
      const b = bodyMap.get("player_" + id);
      if (b) {
        const pos = b.getPosition();
        const v = b.getLinearVelocity();
        p.torso.x = pos.x * SCALE;
        p.torso.y = pos.y * SCALE;
        p.vx = v.x * SCALE;
        p.vy = v.y * SCALE;
        syncHeadFromTorso(p);
      }
    }
    
    for (const bullet of G.bullets) {
      const b = bodyMap.get("bullet_" + bullet.id);
      if (b) {
        const pos = b.getPosition();
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

    for (const plat of G.platforms) {
      if (plat.kind === "elevator") {
        const b = bodyMap.get("platform_" + plat.id);
        if (b) {
          const pos = b.getPosition();
          plat.x = pos.x * SCALE - plat.w / 2;
          
          if (plat.minX != null && plat.x < plat.minX) {
            plat.x = plat.minX;
            plat.vx = Math.abs(plat.vx!);
            b.setLinearVelocity(planck.Vec2(plat.vx / SCALE, 0));
          }
          if (plat.maxX != null && plat.x > plat.maxX) {
            plat.x = plat.maxX;
            plat.vx = -Math.abs(plat.vx!);
            b.setLinearVelocity(planck.Vec2(plat.vx / SCALE, 0));
          }
        }
      }
    }

    processExplosions(G);
    processPendingHits(G, random);
    fixOrphanedPickups(G);
    updatePickupDrops(G);
    collectPickupsForPlayers(G);
    checkRoundEnd(G);
  }
}
\`;

content = content.replace(/function advanceWorld[\s\S]*?(?=function resetRound)/, newAdvanceWorld);

// Also need to rewrite spawnProjectile to add the body when spawned
const newSpawnProjectile = \`function spawnProjectile(
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

  const bState: BulletState = {
    id: G.nextBulletId++,
    owner,
    body: { x, y, angle },
    kind: weapon.kind === "melee" ? "bullet" : weapon.kind,
    weaponId,
    damage: weapon.damage,
    aoeRadius: weapon.aoeRadius,
    fuseTicks: weapon.fuseTicks,
    vx,
    vy,
    r: bulletRadiusForKind(weapon.kind),
    gravityScale: weapon.gravityScale ?? 1,
    bounces: 0,
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
      restitution: 1.0,
      density: 0.1,
    });
    b.setLinearVelocity(planck.Vec2(vx / SCALE, vy / SCALE));
    bodyMap.set("bullet_" + bState.id, b);
  }
}
\`;

content = content.replace(/function spawnProjectile[\s\S]*?(?=function applyRecoil)/, newSpawnProjectile);


fs.writeFileSync('src/game.ts', content);
