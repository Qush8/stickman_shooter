export interface AABB {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Circle {
  x: number;
  y: number;
  r: number;
}

export interface ArcadePlayer {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  grounded: boolean;
}

export interface ArcadePlatform extends AABB {
  vx?: number;
  isElevator?: boolean;
}

export interface ArcadeBullet extends Circle {
  vx: number;
  vy: number;
}

export const checkAABB = (a: AABB, b: AABB): boolean =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export const checkCircleAABB = (c: Circle, box: AABB): boolean => {
  const closestX = Math.max(box.x, Math.min(c.x, box.x + box.w));
  const closestY = Math.max(box.y, Math.min(c.y, box.y + box.h));
  const dx = c.x - closestX;
  const dy = c.y - closestY;
  return dx * dx + dy * dy <= c.r * c.r;
};

export const stepPlayer = (player: ArcadePlayer, dt: number, gravity: number): void => {
  player.vy += gravity * dt;
  player.x += player.vx * dt;
  player.y += player.vy * dt;
};

export const resolvePlayerPlatform = (player: ArcadePlayer, platform: ArcadePlatform): void => {
  const playerBox: AABB = {
    x: player.x - player.w / 2,
    y: player.y - player.h / 2,
    w: player.w,
    h: player.h,
  };
  const platformBox: AABB = {
    x: platform.x,
    y: platform.y - platform.h,
    w: platform.w,
    h: platform.h,
  };

  if (!checkAABB(playerBox, platformBox)) return;
  if (player.vy <= 0) return;

  const playerBottom = player.y + player.h / 2;
  const platformTop = platform.y;
  const prevBottom = playerBottom - player.vy * (1 / 60);

  if (prevBottom > platformTop + 4 && playerBottom >= platformTop - 2) {
    player.y = platformTop - player.h / 2;
    player.vy = 0;
    player.grounded = true;
    if (platform.isElevator && platform.vx != null) {
      player.vx += platform.vx;
    }
  }
};

export const checkBulletWall = (bullet: Circle, wall: AABB): boolean =>
  checkCircleAABB(bullet, wall);

export const stepBullet = (
  bullet: ArcadeBullet,
  dt: number,
  gravity: number,
  gravityScale = 1,
): void => {
  bullet.vy += gravity * gravityScale * dt;
  bullet.x += bullet.vx * dt;
  bullet.y += bullet.vy * dt;
};
