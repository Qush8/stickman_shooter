import { defineGame, INVALID_MOVE } from "@bordiko/sdk";

export interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  aimAngle: number;
  health: number;
  isCrouching: boolean;
}

export interface BulletState {
  id: number;
  owner: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface ShooterState {
  players: Record<string, PlayerState>;
  bullets: BulletState[];
  platforms: Platform[];
  nextBulletId: number;
}

const ARENA_W = 800;
const ARENA_H = 600;
const BULLET_SPEED = 15;
const MAX_HEALTH = 1000;

const PLATFORMS: Platform[] = [
  { x: 100, y: 480, w: 150, h: 20 },
  { x: 350, y: 400, w: 150, h: 20 },
  { x: 100, y: 300, w: 150, h: 20 },
  { x: 350, y: 200, w: 150, h: 20 },
  { x: 600, y: 300, w: 150, h: 20 },
];

function advanceBullets(G: ShooterState) {
  // Each 'move' happens roughly every 100ms from the client.
  // We want bullets to move at 60 frames per second speed on the server too.
  // 100ms = 6 frames of 16.66ms.
  const timeSteps = 1;
  
  for (let i = G.bullets.length - 1; i >= 0; i--) {
    const b = G.bullets[i];
    b.x += b.vx * timeSteps;
    b.y += b.vy * timeSteps;

    if (b.x < -100 || b.x > ARENA_W + 100 || b.y < -100 || b.y > ARENA_H + 100) {
      G.bullets.splice(i, 1);
      continue;
    }

    let hitPlatform = false;
    for (const plat of G.platforms) {
      if (b.x >= plat.x && b.x <= plat.x + plat.w && b.y >= plat.y && b.y <= plat.y + plat.h) {
        G.bullets.splice(i, 1);
        hitPlatform = true;
        break;
      }
    }
    if (hitPlatform) continue;

    for (const [id, p] of Object.entries(G.players)) {
      if (id === b.owner || p.health <= 0) continue;
      
      // Horizontal check
      if (b.x >= p.x - 10 && b.x <= p.x + 10) {
        // Headshot: y from -50 to -34 (crouching lowers this)
        const topY = p.isCrouching ? p.y - 36 : p.y - 50;
        const neckY = p.isCrouching ? p.y - 20 : p.y - 34;

        if (b.y >= topY && b.y <= neckY) {
          p.health = Math.max(0, p.health - 500); // 50% of 1000
          G.bullets.splice(i, 1);
          break;
        } 
        // Bodyshot: y from neck to feet
        else if (b.y > neckY && b.y <= p.y + 10) {
          p.health = Math.max(0, p.health - 250); // 25% of 1000
          G.bullets.splice(i, 1);
          break;
        }
      }
    }
  }
}

export default defineGame<ShooterState>({
  name: "my-shooter-game",
  minPlayers: 2,
  maxPlayers: 4,
  meta: { displayName: "My Shooter Game", description: "A 2D Platformer Shooter." },

  setup: (ctx) => {
    const players: Record<string, PlayerState> = {};
    const spawns = [
      { x: 50, y: ARENA_H - 20 },
      { x: ARENA_W - 50, y: ARENA_H - 20 },
      { x: 250, y: 440 },
      { x: 550, y: 340 },
    ];
    ctx.players.forEach((id, index) => {
      const spawn = spawns[index % spawns.length];
      players[id] = {
        x: spawn.x,
        y: spawn.y,
        vx: 0,
        vy: 0,
        aimAngle: 0,
        health: MAX_HEALTH,
        isCrouching: false,
      };
    });
    return { players, bullets: [], platforms: PLATFORMS, nextBulletId: 1 };
  },

  initialActive: (G) => Object.keys(G.players),

  moves: {
    move: (G, payload, ctx) => {
      const p = G.players[ctx.playerId];
      if (!p || p.health <= 0) return INVALID_MOVE;

      const data = payload as any;
      if (typeof data.x === 'number') p.x = data.x;
      if (typeof data.y === 'number') p.y = data.y;
      if (typeof data.vx === 'number') p.vx = data.vx;
      if (typeof data.vy === 'number') p.vy = data.vy;
      if (typeof data.aimAngle === 'number') p.aimAngle = data.aimAngle;
      if (typeof data.isCrouching === 'boolean') p.isCrouching = data.isCrouching;

      advanceBullets(G);
    },
    shoot: (G, payload, ctx) => {
      const p = G.players[ctx.playerId];
      if (!p || p.health <= 0) return INVALID_MOVE;

      // Max 3 active bullets limit per player
      // Checks both server bullets and explicitly discards if the move arrives but there's a bullet
      if (G.bullets.filter(b => b.owner === ctx.playerId).length >= 3) return INVALID_MOVE;

      const data = payload as any;
      const aimAngle = typeof data?.aimAngle === 'number' ? data.aimAngle : p.aimAngle;
      p.aimAngle = aimAngle;

      const vx = Math.cos(aimAngle) * BULLET_SPEED;
      const vy = Math.sin(aimAngle) * BULLET_SPEED;

      // Spawn at the tip of the gun (approx shoulder height + length of arm)
      const shoulderY = p.isCrouching ? p.y - 12 : p.y - 26;
      const startX = p.x + Math.cos(aimAngle) * 26;
      const startY = shoulderY + Math.sin(aimAngle) * 26;

      G.bullets.push({
        id: G.nextBulletId++,
        owner: ctx.playerId,
        x: startX,
        y: startY,
        vx,
        vy,
      });

      advanceBullets(G);
    },
  },

  endIf: (G) => {
    const alive = Object.entries(G.players).filter(([, p]) => p.health > 0);
    if (alive.length === 1) return { winner: alive[0][0], reason: "last one standing" };
    if (alive.length === 0) return { draw: true };
  },

  enumerate: (G, playerId, flow) => {
    const p = G.players[playerId];
    if (!p || p.health <= 0) return [];
    return [
      { type: "move", payload: { x: p.x, y: p.y, vx: p.vx, vy: p.vy, aimAngle: p.aimAngle, isCrouching: p.isCrouching } as any },
      { type: "shoot", payload: { aimAngle: p.aimAngle } as any },
    ];
  },
});
