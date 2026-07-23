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
  moveInput?: boolean;
}

export interface ArcadePlatform extends AABB {
  vx?: number;
  isElevator?: boolean;
}

export interface ArcadeBullet extends Circle {
  vx: number;
  vy: number;
}

export interface CollisionNormal {
  hit: boolean;
  nx: number;
  ny: number;
}

export const playerAABB = (player: ArcadePlayer): AABB => ({
  x: player.x - player.w / 2,
  y: player.y - player.h / 2,
  w: player.w,
  h: player.h,
});

export const platformAABB = (platform: ArcadePlatform): AABB => ({
  x: platform.x,
  y: platform.y - platform.h,
  w: platform.w,
  h: platform.h,
});

export const overlapX = (a: AABB, b: AABB): number =>
  Math.min(a.x + a.w - b.x, b.x + b.w - a.x);

export const overlapY = (a: AABB, b: AABB): number =>
  Math.min(a.y + a.h - b.y, b.y + b.h - a.y);

export const checkAABB = (a: AABB, b: AABB): boolean =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export const checkCircleAABB = (c: Circle, box: AABB): boolean => {
  const closestX = Math.max(box.x, Math.min(c.x, box.x + box.w));
  const closestY = Math.max(box.y, Math.min(c.y, box.y + box.h));
  const dx = c.x - closestX;
  const dy = c.y - closestY;
  return dx * dx + dy * dy <= c.r * c.r;
};

export const checkCircleCircle = (a: Circle, b: Circle): boolean => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const radii = a.r + b.r;
  return dx * dx + dy * dy <= radii * radii;
};

export const checkBulletWall = (
  bullet: Circle,
  wall: AABB,
  prevX?: number,
  prevY?: number,
): boolean => {
  if (checkCircleAABB(bullet, wall)) return true;
  if (prevX == null || prevY == null) return false;

  const steps = 5;
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const sample = {
      x: prevX + (bullet.x - prevX) * t,
      y: prevY + (bullet.y - prevY) * t,
      r: bullet.r,
    };
    if (checkCircleAABB(sample, wall)) return true;
  }
  return false;
};

export const getCircleAABBCollision = (c: Circle, box: AABB): CollisionNormal => {
  if (!checkCircleAABB(c, box)) return { hit: false, nx: 0, ny: 0 };

  const overlapLeft = c.x + c.r - box.x;
  const overlapRight = box.x + box.w - (c.x - c.r);
  const overlapTop = c.y + c.r - box.y;
  const overlapBottom = box.y + box.h - (c.y - c.r);
  const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

  if (minOverlap === overlapLeft) return { hit: true, nx: -1, ny: 0 };
  if (minOverlap === overlapRight) return { hit: true, nx: 1, ny: 0 };
  if (minOverlap === overlapTop) return { hit: true, nx: 0, ny: -1 };
  return { hit: true, nx: 0, ny: 1 };
};

export const bounceBullet = (bullet: ArcadeBullet, nx: number, ny: number): void => {
  if (Math.abs(nx) > Math.abs(ny)) {
    bullet.vx = -bullet.vx;
    bullet.x += nx * (bullet.r + 1);
  } else {
    bullet.vy = -bullet.vy;
    bullet.y += ny * (bullet.r + 1);
  }
};

export const stepPlayer = (
  player: ArcadePlayer,
  dt: number,
  gravity: number,
  applyGravity = true,
): void => {
  if (applyGravity) player.vy += gravity * dt;
  player.x += player.vx * dt;
  player.y += player.vy * dt;
};

export const resolvePlayerPlatform = (
  player: ArcadePlayer,
  platform: ArcadePlatform,
  wasGrounded = false,
): void => {
  const pb = playerAABB(player);
  const plat = platformAABB(platform);
  if (!checkAABB(pb, plat)) return;

  const ox = overlapX(pb, plat);
  const oy = overlapY(pb, plat);
  if (ox <= 0 || oy <= 0) return;

  const platformTop = platform.y;
  const platformBottom = platform.y - platform.h;
  const playerBottom = player.y + player.h / 2;
  const playerTop = player.y - player.h / 2;

  const feetOnTop =
    playerBottom >= platformTop - 2 &&
    playerBottom <= platformTop + oy + 2 &&
    player.y <= platformTop + player.h * 0.35;

  if (feetOnTop && (player.vy >= 0 || wasGrounded)) {
    player.y = platformTop - player.h / 2;
    player.vy = 0;
    player.grounded = true;
    if (platform.isElevator && platform.vx != null) {
      player.vx += platform.vx;
    }
    return;
  }

  const headBonk =
    player.vy < 0 &&
    playerTop <= platformBottom + 4 &&
    playerBottom > platformTop &&
    oy <= ox + 1;

  if (headBonk) {
    player.y = platformBottom + player.h / 2;
    player.vy = 0;
  }
};

export const resolvePlayerPlayer = (
  a: ArcadePlayer,
  b: ArcadePlayer,
  arenaW?: number,
): void => {
  const boxA = playerAABB(a);
  const boxB = playerAABB(b);
  if (!checkAABB(boxA, boxB)) return;

  const ox = overlapX(boxA, boxB);
  const oy = overlapY(boxA, boxB);
  if (ox <= 0 || oy <= 0) return;

  const aMoving = Math.abs(a.vx) > 0.05 && a.moveInput === true;
  const bMoving = Math.abs(b.vx) > 0.05 && b.moveInput === true;
  const aLeftOfB = a.x <= b.x;

  if (ox <= oy) {
    if (aMoving && !bMoving) {
      a.vx = 0;
      if (aLeftOfB) a.x -= ox;
      else a.x += ox;
    } else if (bMoving && !aMoving) {
      b.vx = 0;
      if (aLeftOfB) b.x += ox;
      else b.x -= ox;
    } else if (aLeftOfB) {
      a.x -= ox / 2;
      b.x += ox / 2;
    } else {
      a.x += ox / 2;
      b.x -= ox / 2;
    }
  } else if (a.y <= b.y) {
    a.y -= oy / 2;
    b.y += oy / 2;
  } else {
    a.y += oy / 2;
    b.y -= oy / 2;
  }

  if (arenaW == null) return;

  for (const player of [a, b]) {
    const halfW = player.w / 2;
    if (player.x - halfW < 0) player.x = halfW;
    if (player.x + halfW > arenaW) player.x = arenaW - halfW;
  }
};

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
